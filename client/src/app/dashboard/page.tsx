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
          const recentHistory = result.data.slice(-7);
          
          const mappedData = recentHistory.map((record: any) => {
            const date = new Date(record.createdAt);
            const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
            
            let score = 50;
            if (record.analysis.riskScore === "Low Risk") score = 90;
            else if (record.analysis.riskScore === "Medium Risk") score = 65;
            else if (record.analysis.riskScore === "High Risk") score = 40;

            return { day: dayStr, score: score };
          });

          while (mappedData.length < 7) {
            mappedData.unshift({ day: "-", score: 0 });
          }

          setHistoryData(mappedData);

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

  // Soft, high-contrast light alerts that match the white-card design framework
  const riskStyles = {
    "High Risk": {
      card: "bg-red-50 border border-red-200 shadow-sm text-red-950",
      title: "text-red-800 font-bold",
      value: "text-red-600 font-extrabold",
      desc: "text-red-700/80",
      reason: "text-red-900 bg-red-100/60 border border-red-200/60 italic font-mono",
      icon: "h-5 w-5 text-red-600 animate-pulse"
    },
    "Medium Risk": {
      card: "bg-amber-50 border border-amber-200 shadow-sm text-amber-950",
      title: "text-amber-800 font-bold",
      value: "text-amber-600 font-extrabold",
      desc: "text-amber-700/80",
      reason: "text-amber-900 bg-amber-100/60 border border-amber-200/60 italic font-mono",
      icon: "h-5 w-5 text-amber-600"
    },
    "Low Risk": {
      card: "bg-emerald-50 border border-emerald-200 shadow-sm text-emerald-950",
      title: "text-emerald-800 font-bold",
      value: "text-emerald-600 font-extrabold",
      desc: "text-emerald-700/80",
      reason: "text-emerald-900 bg-emerald-100/60 border border-emerald-200/60 italic font-mono",
      icon: "h-5 w-5 text-emerald-600"
    }
  };
  const currentRisk = (analysis?.riskScore || "Low Risk") as "Low Risk" | "Medium Risk" | "High Risk";
  const styles = riskStyles[currentRisk] || riskStyles["Low Risk"];

  // Light theme matching styles (Based directly on your screenshots)
  const cardLightStyle = "bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_25px_rgba(0,0,0,0.04)]";
  const cardTitleStyle = "text-sm font-semibold text-slate-500 tracking-wide";
  const cardValueStyle = "text-2xl font-bold text-[#0f172a] tracking-tight";
  const cardSubStatusStyle = "text-xs font-semibold mt-1";
  const cardReasonStyle = "text-xs text-slate-400 mt-1 italic leading-relaxed";

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight">Student Dashboard</h1>
            <p className="text-slate-500 text-lg mt-2 font-light">Welcome back, <span className="text-blue-600 font-normal">{userName}</span>. Here is your Health Report.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/scan'}
              className="flex items-center space-x-2 bg-[#0f172a] hover:bg-slate-800 active:scale-[0.98] px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-300 cursor-pointer shadow-sm"
            >
              <Activity className="w-5 h-5" />
              <span className="hidden sm:inline-block">New Scan</span>
            </button>
            <button 
              onClick={() => window.location.href = '/profile'}
              className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0f172a] flex items-center justify-center font-bold border border-slate-200">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-medium hidden sm:inline-block">Profile</span>
            </button>
          </div>
        </div>

        {/* Biometrics Summary */}
        {biometrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className={cardLightStyle}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={cardTitleStyle}>BMI & Status</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={cardValueStyle}>{analysis?.bmi || "N/A"}</div>
                <p className={`${cardSubStatusStyle} text-blue-600`}>{analysis?.bmiClassification || "Optimal"}</p>
                <p className={cardReasonStyle}>{analysis?.bmiReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={cardLightStyle}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={cardTitleStyle}>Heart Rate</CardTitle>
                <Activity className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className={cardValueStyle}>{biometrics.heartRate} <span className="text-xs text-slate-400 font-normal">bpm</span></div>
                <p className={`${cardSubStatusStyle} text-red-500`}>{analysis?.heartRateClassification || "Normal"}</p>
                <p className={cardReasonStyle}>{analysis?.heartRateReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={cardLightStyle}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={cardTitleStyle}>Blood Pressure</CardTitle>
                <Activity className={`h-4 w-4 ${analysis?.bloodPressureClassification === 'Invalid Reading' ? 'text-amber-500' : 'text-indigo-500'}`} />
              </CardHeader>
              <CardContent>
                <div className={cardValueStyle}>{biometrics.systolicBP}/{biometrics.diastolicBP} <span className="text-xs text-slate-400 font-normal">mmHg</span></div>
                <p className={`${cardSubStatusStyle} ${analysis?.bloodPressureClassification === 'Invalid Reading' ? 'text-amber-600' : 'text-indigo-600'}`}>
                  {analysis?.bloodPressureClassification || "Status"}
                </p>
                <p className={cardReasonStyle}>{analysis?.bloodPressureReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={cardLightStyle}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={cardTitleStyle}>Hydration Level</CardTitle>
                <Droplets className="h-4 w-4 text-sky-500" />
              </CardHeader>
              <CardContent>
                <div className={cardValueStyle}>{biometrics.water}%</div>
                <p className={`${cardSubStatusStyle} text-sky-600`}>{analysis?.hydrationStatus || "Optimal"}</p>
                <p className={cardReasonStyle}>{analysis?.hydrationReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={cardLightStyle}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={cardTitleStyle}>Body Fat</CardTitle>
                <Activity className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className={cardValueStyle}>{biometrics.bodyFat}%</div>
                <p className={`${cardSubStatusStyle} text-orange-600`}>{analysis?.bodyFatClassification || "Healthy"}</p>
                <p className={cardReasonStyle}>{analysis?.bodyFatReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={cardLightStyle}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={cardTitleStyle}>BMR</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className={cardValueStyle}>{analysis?.bmr || "N/A"}</div>
                <p className="text-xs font-semibold text-purple-600 mt-1">Resting Calories</p>
                <p className={cardReasonStyle}>{analysis?.bmrReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={cardLightStyle}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={cardTitleStyle}>Daily Calorie Need</CardTitle>
                <Utensils className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className={cardValueStyle}>{analysis?.dailyCalorieRequirement || "N/A"}</div>
                <p className="text-xs font-semibold text-amber-600 mt-1">Based on Activity</p>
                <p className={cardReasonStyle}>{analysis?.dailyCalorieReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={cardLightStyle}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={cardTitleStyle}>Ideal Weight</CardTitle>
                <Target className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-[#0f172a] tracking-tight">{analysis?.idealWeightRange || "N/A"}</div>
                <p className="text-xs font-semibold text-emerald-600 mt-1">Healthy BMI Range</p>
                <p className={cardReasonStyle}>{analysis?.idealWeightReason || ""}</p>
              </CardContent>
            </Card>

            {/* High Contrast Light Overall Risk Score Card */}
            <Card className={`md:col-span-2 lg:col-span-4 rounded-xl shadow-sm transition-all duration-500 ${styles.card}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm uppercase tracking-wider ${styles.title}`}>Overall Risk Score</CardTitle>
                <AlertCircle className={styles.icon} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl ${styles.value}`}>{analysis?.riskScore || "Low Risk"}</div>
                <p className={`text-xs mt-1 ${styles.desc}`}>Calculated based on BMI + Heart Rate + Blood Pressure + Hydration + Body Fat metrics</p>
                <p className={`text-xs mt-3 p-3 rounded-lg border ${styles.reason}`}>
                  <strong>Formula Breakdown:</strong> {analysis?.riskScoreReason || "No active risks detected."}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-amber-50 border border-amber-200 text-amber-900 shadow-sm rounded-xl">
            <CardContent className="p-6 flex items-center space-x-4">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <p>No biometric data found. Please visit the Health Boot Booth (Scan page) to log your data.</p>
            </CardContent>
          </Card>
        )}

        {/* Recommendations & Meal Plan */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-[#0f172a]" />
                  <CardTitle className="text-[#0f172a]">Daily Progress Overview</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Your health score trends over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-end justify-between h-40 space-x-2 px-2">
                  {historyData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full max-w-[40px] flex items-end justify-center h-32 bg-slate-50 border border-slate-100 rounded-t-md overflow-visible relative group">
                        <div 
                          className="w-full bg-[#0f172a] rounded-t-md transition-all duration-500 ease-out relative group-hover:bg-blue-600"
                          style={{ height: `${item.score}%` }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-sm">
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

            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Utensils className="h-5 w-5 text-[#0f172a]" />
                  <CardTitle className="text-[#0f172a]">1-Day Personalized Meal Plan</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Generated by AI based on calories, goals, and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 shadow-inner overflow-y-auto max-h-[300px]">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {analysis.mealPlanForDay || "Meal plan data is currently unavailable. Please generate a new scan."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-[#0f172a]" />
                  <CardTitle className="text-[#0f172a]">Daily Workout Plan</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Targeted exercises based on BMI, heart rate, and health status</CardDescription>
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