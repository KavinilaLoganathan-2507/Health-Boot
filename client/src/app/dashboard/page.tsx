"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Droplets, Target, Utensils, AlertCircle } from "lucide-react";
import { SERVER_URL } from "@/lib/constants";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Student");
  const [biometrics, setBiometrics] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [historyData, setHistoryData] = useState<{ day: string, score: number }[]>([]);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);

    const data = localStorage.getItem("latestBiometricAnalysis");
    if (data) {
      const parsedData = JSON.parse(data);
      setAnalysis(parsedData);
      if (parsedData.rawInput) {
        setBiometrics(parsedData.rawInput);
      }
    }

    // Fetch history
    const fetchHistory = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch(`${SERVER_URL}/api/user/biometrics/history`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const result = await response.json();
        
        if (response.ok && result.data && result.data.length > 0) {
          // Get the last 7 entries
          const recentHistory = result.data.slice(-7);
          
          const mappedData = recentHistory.map((record: any) => {
            const date = new Date(record.createdAt);
            const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
            
            // Derive a simple health score (0-100) from risk
            let score = 50;
            if (record.analysis.riskScore === "Low Risk") score = 90;
            else if (record.analysis.riskScore === "Medium Risk") score = 65;
            else if (record.analysis.riskScore === "High Risk") score = 40;

            return { day: dayStr, score: score };
          });

          // Pad with empty days if less than 7
          while (mappedData.length < 7) {
            mappedData.unshift({ day: "-", score: 0 });
          }

          setHistoryData(mappedData);

          // Fallback initialization if local storage doesn't have the latest scan
          const latestLocal = localStorage.getItem("latestBiometricAnalysis");
          if (!latestLocal) {
            const mostRecentRecord = result.data[result.data.length - 1];
            if (mostRecentRecord && mostRecentRecord.analysis) {
              setAnalysis(mostRecentRecord.analysis);
              if (mostRecentRecord.analysis.rawInput) {
                setBiometrics(mostRecentRecord.analysis.rawInput);
              }
              localStorage.setItem("latestBiometricAnalysis", JSON.stringify(mostRecentRecord.analysis));
            }
          }
        } else {
          // Default mock data if no history
          setHistoryData([
            { day: "Mon", score: 65 },
            { day: "Tue", score: 72 },
            { day: "Wed", score: 68 },
            { day: "Thu", score: 85 },
            { day: "Fri", score: 78 },
            { day: "Sat", score: 92 },
            { day: "Sun", score: 88 }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
        // Default mock data on error
        setHistoryData([
          { day: "Mon", score: 65 },
          { day: "Tue", score: 72 },
          { day: "Wed", score: 68 },
          { day: "Thu", score: 85 },
          { day: "Fri", score: 78 },
          { day: "Sat", score: 92 },
          { day: "Sun", score: 88 }
        ]);
      }
    };

    fetchHistory();
  }, []);

  // Risk styling dictionary for cinematic glow effects
  const riskStyles = {
    "High Risk": {
      card: "bg-red-950/40 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)] text-red-200",
      title: "text-red-400 font-semibold",
      value: "text-red-400 font-bold drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]",
      desc: "text-red-300/60",
      reason: "text-red-300/80 italic font-mono",
      icon: "h-5 w-5 text-red-500 animate-pulse"
    },
    "Medium Risk": {
      card: "bg-yellow-950/40 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.25)] text-yellow-200",
      title: "text-yellow-400 font-semibold",
      value: "text-yellow-400 font-bold drop-shadow-[0_0_6px_rgba(234,179,8,0.6)]",
      desc: "text-yellow-300/60",
      reason: "text-yellow-300/80 italic font-mono",
      icon: "h-5 w-5 text-yellow-500"
    },
    "Low Risk": {
      card: "bg-green-950/40 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.25)] text-green-200",
      title: "text-green-400 font-semibold",
      value: "text-green-400 font-bold drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]",
      desc: "text-green-300/60",
      reason: "text-green-300/80 italic font-mono",
      icon: "h-5 w-5 text-green-500"
    }
  };
  const currentRisk = (analysis?.riskScore || "Low Risk") as "Low Risk" | "Medium Risk" | "High Risk";
  const styles = riskStyles[currentRisk] || riskStyles["Low Risk"];

  return (
    <div className="min-h-screen bg-slate-900 p-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Student Dashboard</h1>
            <p className="text-slate-300 text-lg mt-2 font-light">Welcome back, {userName}. Here is your Health Report.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/scan'}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-cyan-glow hover:scale-[1.02] active:scale-[0.98] px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-300 cursor-pointer"
            >
              <Activity className="w-5 h-5" />
              <span className="hidden sm:inline-block">New Scan</span>
            </button>
            <button 
              onClick={() => window.location.href = '/profile'}
              className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-lg text-white hover:bg-slate-700 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-medium hidden sm:inline-block">Profile</span>
            </button>
          </div>
        </div>

        {/* Biometrics Summary */}
        {biometrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">BMI & Status</CardTitle>
                <Activity className="h-4 w-4 text-slate-950" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{analysis?.bmi || "N/A"}</div>
                <p className="text-xs font-semibold text-slate-600 mt-1">{analysis?.bmiClassification || "Optimal"}</p>
                <p className="text-xs text-slate-400 mt-1 italic">{analysis?.bmiReason || ""}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">Heart Rate</CardTitle>
                <Activity className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{biometrics.heartRate} bpm</div>
                <p className="text-xs font-semibold text-slate-600 mt-1">{analysis?.heartRateClassification || "Normal"}</p>
                <p className="text-xs text-slate-400 mt-1 italic">{analysis?.heartRateReason || ""}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">Blood Pressure</CardTitle>
                <Activity className={`h-4 w-4 ${analysis?.bloodPressureClassification === 'Invalid Reading' ? 'text-yellow-500' : 'text-blue-500'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{biometrics.systolicBP}/{biometrics.diastolicBP} <span className="text-xs text-slate-400 font-normal">mmHg</span></div>
                <p className={`text-xs font-semibold mt-1 ${analysis?.bloodPressureClassification === 'Invalid Reading' ? 'text-yellow-600' : 'text-slate-600'}`}>
                  {analysis?.bloodPressureClassification || "Status"}
                </p>
                <p className="text-xs text-slate-400 mt-1 italic">{analysis?.bloodPressureReason || ""}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">Hydration Level</CardTitle>
                <Droplets className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{biometrics.water}%</div>
                <p className="text-xs font-semibold text-slate-600 mt-1">{analysis?.hydrationStatus || "Optimal"}</p>
                <p className="text-xs text-slate-400 mt-1 italic">{analysis?.hydrationReason || ""}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">Body Fat</CardTitle>
                <Activity className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{biometrics.bodyFat}%</div>
                <p className="text-xs font-semibold text-slate-600 mt-1">{analysis?.bodyFatClassification || "Healthy"}</p>
                <p className="text-xs text-slate-400 mt-1 italic">{analysis?.bodyFatReason || ""}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">BMR</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{analysis?.bmr || "N/A"}</div>
                <p className="text-xs text-slate-500 mt-1">Resting Calories</p>
                <p className="text-xs text-slate-400 mt-1 italic">{analysis?.bmrReason || ""}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">Daily Calorie Need</CardTitle>
                <Utensils className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{analysis?.dailyCalorieRequirement || "N/A"}</div>
                <p className="text-xs text-slate-500 mt-1">Based on Activity</p>
                <p className="text-xs text-slate-400 mt-1 italic">{analysis?.dailyCalorieReason || ""}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">Ideal Weight</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900">{analysis?.idealWeightRange || "N/A"}</div>
                <p className="text-xs text-slate-500 mt-1">Healthy BMI Range</p>
                <p className="text-xs text-slate-400 mt-1 italic">{analysis?.idealWeightReason || ""}</p>
              </CardContent>
            </Card>

            {/* Inverted Glowing Overall Risk Score Card */}
            <Card className={`md:col-span-2 lg:col-span-4 border-0 transition-all duration-500 ${styles.card}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-bold uppercase tracking-wider ${styles.title}`}>Overall Risk Score</CardTitle>
                <AlertCircle className={styles.icon} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl ${styles.value}`}>{analysis?.riskScore || "Low Risk"}</div>
                <p className={`text-xs mt-1 ${styles.desc}`}>Calculated based on BMI + Heart Rate + Blood Pressure + Hydration + Body Fat metrics</p>
                <p className={`text-xs mt-3 font-mono p-3 bg-slate-950/50 rounded-lg ${styles.reason}`}>
                  Formula Breakdown: {analysis?.riskScoreReason || "No active risks detected."}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-yellow-950/20 border border-yellow-800/40 text-yellow-200 shadow-md">
            <CardContent className="p-6 flex items-center space-x-4">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              <p className="text-yellow-100">No biometric data found. Please visit the Health Boot Booth (Scan page) to log your data.</p>
            </CardContent>
          </Card>
        )}

        {/* Recommendations & Meal Plan */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <Card className="bg-white border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-slate-900" />
                  <CardTitle className="text-slate-900">Daily Progress Overview</CardTitle>
                </div>
                <CardDescription className="text-slate-500">Your health score trends over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-end justify-between h-40 space-x-2 px-2">
                  {historyData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full max-w-[40px] flex items-end justify-center h-32 bg-slate-50 rounded-t-md overflow-visible relative group">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-md transition-all duration-500 ease-out relative group-hover:shadow-cyan-glow group-hover:from-blue-500 group-hover:to-cyan-400"
                          style={{ height: `${item.score}%` }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-sm">
                            {item.score} pts
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 mt-3">{item.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Utensils className="h-5 w-5 text-slate-900" />
                  <CardTitle className="text-slate-900">1-Day Personalized Meal Plan</CardTitle>
                </div>
                <CardDescription className="text-slate-500">Generated by AI based on calories, goals, and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 shadow-inner overflow-y-auto max-h-[300px]">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {analysis.mealPlanForDay || "Meal plan data is currently unavailable. Please generate a new scan."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-slate-900" />
                  <CardTitle className="text-slate-900">Daily Workout Plan</CardTitle>
                </div>
                <CardDescription className="text-slate-500">Targeted exercises based on BMI, heart rate, and health status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 shadow-inner overflow-y-auto max-h-[300px]">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {analysis.workoutPlan || "Workout plan data is currently unavailable. Please generate a new scan."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
