"use client";

import { useState } from 'react';

import {
  ChevronRight,
  Lock,
  Phone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SERVER_URL } from '@/lib/constants';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const redirectUrl = searchParams?.get('redirect') || '/dashboard';

    const [formData, setFormData] = useState({
        phoneNo: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (formData.phoneNo.length !== 10) {
            setError("Phone number must be exactly 10 digits.");
            setIsLoading(false);
            return;
        }
        
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${SERVER_URL}/api/user/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phoneNo: formData.phoneNo,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log("Login successful:", data);

                // Store token in localStorage
                if (data.data?.token) {
                    localStorage.setItem("authToken", data.data.token);
                    localStorage.setItem("userName", data.data.fullName);
                    localStorage.setItem("userData", JSON.stringify(data.data));

                    // Direct cookie setting as fallback
                    document.cookie = `authToken=${data.data.token}; max-age=${
                        60 * 60 * 24 * 7
                    }; path=/`;
                    document.cookie = `userName=${
                        data.data.fullName
                    }; max-age=${60 * 60 * 24 * 7}; path=/`;
                }

                // Navigate back to the redirect url or dashboard
                setTimeout(() => {
                    router.push(redirectUrl);
                }, 1000);
            } else {
                const errorMessage = data.error?.message || data.message || "Login failed. Please try again.";
                setError(errorMessage);
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(
                "Network error. Please check your connection and try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="bg-[#F4F7FB]">
                    <CardHeader className="text-center space-y-4">
                        <div>
                            <CardTitle className="text-2xl flex font-bold bg-[#000] bg-clip-text text-transparent">
                                Welcome Back
                            </CardTitle>
                            <CardDescription className="text-slate-700 mt-2">
                                Sign in to your account to continue
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <Label
                                        htmlFor="phoneNo"
                                        className="text-slate-900 font-medium"
                                    >
                                        Phone Number *
                                    </Label>
                                    <div className="relative mt-2">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                                        <Input
                                            id="phoneNo"
                                            type="tel"
                                            required
                                            value={formData.phoneNo}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phoneNo: e.target.value,
                                                })
                                            }
                                            className="pl-10 bg-slate-50 text-slate-900 placeholder:text-slate-500"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        htmlFor="password"
                                        className="text-slate-900 font-medium"
                                    >
                                        Password *
                                    </Label>
                                    <div className="relative mt-2">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
                                            className="pl-10 bg-slate-50 text-slate-900 placeholder:text-slate-500"
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                    />
                                    <span className="text-slate-700">
                                        Remember me
                                    </span>
                                </label>
                                <a
                                    href="#"
                                    className="text-slate-900 hover:text-cyan-500 font-medium"
                                >
                                    Forgot password?
                                </a>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-slate-900 text-white font-medium py-3 transition-all duration-300 transform hover:scale-[1.02] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                                {!isLoading && (
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                )}
                            </Button>

                            <div className="text-center mt-6">
                                <p className="text-slate-700">
                                    Don&apos;t have an account?{" "}
                                    <a
                                        href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
                                        className="text-slate-900 hover:text-cyan-500 font-medium"
                                    >
                                        Sign up here
                                    </a>
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
