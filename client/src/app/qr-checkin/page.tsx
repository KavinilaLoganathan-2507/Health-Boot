"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode, CheckCircle, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { SERVER_URL } from "@/lib/constants";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface QRSession {
  id: string;
  token: string;
  status: string; // pending | checked_in | expired
  expiresAt: string;
}

export default function QRCheckinPage() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [session, setSession] = useState<QRSession | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthToken(token);
    // Generate initial QR code automatically on mount
    generateQR(token);

    return () => {
      stopPolling();
      stopCountdown();
    };
  }, [router]);

  const generateQR = async (token: string) => {
    setLoading(true);
    stopPolling();
    stopCountdown();
    try {
      const response = await fetch(`${SERVER_URL}/api/user/qr/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success && data.data) {
        const newSession = data.data;
        setSession(newSession);

        // Calculate time remaining in seconds
        const expiresTime = new Date(newSession.expiresAt).getTime();
        const nowTime = new Date().getTime();
        const secondsRemaining = Math.max(0, Math.floor((expiresTime - nowTime) / 1000));
        setTimeLeft(secondsRemaining);

        // Start countdown and status polling
        startCountdown(secondsRemaining);
        startPolling(newSession.token, token);
        toast.success("Check-in QR code generated.");
      } else {
        toast.error(data.message || "Failed to generate QR check-in.");
      }
    } catch (err) {
      toast.error("Error generating QR session.");
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = (initialSeconds: number) => {
    let currentSeconds = initialSeconds;
    countdownInterval.current = setInterval(() => {
      currentSeconds -= 1;
      if (currentSeconds <= 0) {
        setTimeLeft(0);
        setSession((prev) => prev ? { ...prev, status: "expired" } : null);
        stopCountdown();
        stopPolling();
        toast.warning("Check-in session expired.");
      } else {
        setTimeLeft(currentSeconds);
      }
    }, 1000);
  };

  const startPolling = (token: string, auth: string) => {
    pollingInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/user/qr/status/${token}`);
        const data = await response.json();
        if (response.ok && data.success && data.data) {
          const updatedSession = data.data;
          if (updatedSession.status === "checked_in") {
            setSession(updatedSession);
            stopPolling();
            stopCountdown();
            toast.success("Check-in successful! Welcome to the booth.");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // Poll every 3 seconds
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const stopCountdown = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-6 text-[#0f172a] flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full space-y-8 mt-12">
        {/* Navigation */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 cursor-pointer hover:text-slate-800 transition-colors" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </div>

        {/* QR Core Card */}
        <Card className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300">
          <CardHeader className="text-center bg-[#0f172a] text-white py-8">
            <QrCode className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
            <CardTitle className="text-2xl font-bold mt-4">Booth Authentication</CardTitle>
            <CardDescription className="text-indigo-200 mt-1">Scan this QR code at the Health Boot kiosk to log in and sync your biometrics.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center space-y-6">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Generating check-in session...</p>
              </div>
            ) : session?.status === "checked_in" ? (
              /* Success check-in state */
              <div className="py-8 space-y-4 animate-fade-in-up">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-800">Check-in Complete</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Your booth session is active. Biometrics scanned at the device will sync automatically to your dashboard.
                  </p>
                </div>
                <Button 
                  onClick={() => authToken && generateQR(authToken)} 
                  variant="outline" 
                  className="mt-4 border-slate-200 hover:bg-slate-50"
                >
                  Generate New Code
                </Button>
              </div>
            ) : session?.status === "expired" || timeLeft <= 0 ? (
              /* Expired state */
              <div className="py-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto shadow-inner">
                  <AlertTriangle className="w-12 h-12 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800">QR Code Expired</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    For security, QR tokens expire after 15 minutes of inactivity. Please generate a new check-in code.
                  </p>
                </div>
                <Button 
                  onClick={() => authToken && generateQR(authToken)} 
                  className="bg-[#0f172a] hover:bg-slate-800 text-white w-full py-2.5 rounded-lg"
                >
                  Regenerate QR Code
                </Button>
              </div>
            ) : (
              /* Scanning/Pending State */
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100/50 inline-block shadow-inner">
                  {session?.token && (
                    <QRCodeSVG
                      value={session.token}
                      size={200}
                      level="H"
                      className="mx-auto transition-transform hover:scale-105 duration-300"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                    <span>Awaiting Scan...</span>
                  </div>
                  <p className="text-2xl font-black text-[#0f172a] tracking-tight mt-2">{formatTime(timeLeft)}</p>
                  <p className="text-xs text-slate-400">Tokens refresh automatically upon scan or expiration.</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex space-x-2">
                  <Button
                    onClick={() => authToken && generateQR(authToken)}
                    variant="outline"
                    className="flex-1 flex items-center justify-center space-x-2 border-slate-200 hover:bg-slate-50 font-medium py-2.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Token</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 text-center text-xs text-slate-400">
        Secure token check-in system version 1.0.0
      </div>
    </div>
  );
}
