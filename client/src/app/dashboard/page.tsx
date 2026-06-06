"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Activity, 
  Droplets, 
  Target, 
  Utensils, 
  AlertCircle, 
  QrCode, 
  Sparkles, 
  ChevronRight, 
  Apple, 
  Plus, 
  TrendingUp 
} from "lucide-react";
import { SERVER_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Student");
  const [biometrics, setBiometrics] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [historyData, setHistoryData] = useState<{ day: string, score: number }[]>([]);
  
  // Enhancement States
  const [foodSummary, setFoodSummary] = useState<any>(null);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [insightsSummary, setInsightsSummary] = useState<any>(null);

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

    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch history
    const fetchHistory = async () => {
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

    const fetchFoodSummary = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/user/food-logs/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const res = await response.json();
        if (response.ok && res.success) {
          setFoodSummary(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const fetchActiveGoals = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/user/goals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const res = await response.json();
        if (response.ok && res.success && res.data) {
          const active = res.data.filter((g: any) => g.status === "active");
          setActiveGoals(active.slice(0, 3));
        }
      } catch (e) {
        console.error(e);
      }
    };

    const fetchInsightsSummary = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/user/insights`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const res = await response.json();
        if (response.ok && res.success) {
          setInsightsSummary(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchHistory();
    fetchFoodSummary();
    fetchActiveGoals();
    fetchInsightsSummary();
  }, [router]);

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

  const cardLightStyle = "bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_25px_rgba(0,0,0,0.04)]";
  const cardTitleStyle = "text-sm font-semibold text-slate-500 tracking-wide";
  const cardValueStyle = "text-2xl font-bold text-[#0f172a] tracking-tight";
  const cardSubStatusStyle = "text-xs font-semibold mt-1";
  const cardReasonStyle = "text-xs text-slate-400 mt-1 italic leading-relaxed";

  const getGoalPercent = (goal: any) => {
    if (goal.goalType === "weight_loss") {
      if (goal.currentValue <= goal.targetValue) return 100;
      return Math.max(0, Math.min(100, (goal.targetValue / goal.currentValue) * 100));
    }
    return Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case "weight_loss": return "Weight Loss";
      case "weight_gain": return "Weight Gain";
      case "hydration": return "Hydration";
      case "activity": return "Daily Activity";
      case "nutrition": return "Nutrition Limit";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 transition-colors duration-500 text-[#0f172a]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight">Student Dashboard</h1>
            <p className="text-slate-500 text-lg mt-2 font-light">
              Welcome back, <span className="text-blue-600 font-normal">{userName}</span>. Here is your Health Report.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push("/scan")}
              className="flex items-center space-x-2 bg-[#0f172a] hover:bg-slate-800 active:scale-[0.98] px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-300 cursor-pointer shadow-sm text-sm"
            >
              <Activity className="w-4 h-4" />
              <span>New Scan</span>
            </button>
            <button 
              onClick={() => router.push("/profile")}
              className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 text-[#0f172a] flex items-center justify-center font-bold border border-slate-200 text-xs">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-medium hidden sm:inline-block">Profile</span>
            </button>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            onClick={() => router.push("/food-log")}
            className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-3 group"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0f172a] text-sm md:text-base">Food Intake</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Track Calories</p>
            </div>
          </div>

          <div 
            onClick={() => router.push("/goals")}
            className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-3 group"
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0f172a] text-sm md:text-base">Smart Goals</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">My Targets</p>
            </div>
          </div>

          <div 
            onClick={() => router.push("/insights")}
            className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-3 group"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0f172a] text-sm md:text-base">AI Insights</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Biometric Trends</p>
            </div>
          </div>

          <div 
            onClick={() => router.push("/qr-checkin")}
            className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-3 group"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0f172a] text-sm md:text-base">QR Check-in</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Kiosk Sync</p>
            </div>
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

        {/* Enhanced Widgets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1. Today's Nutrition Widget */}
          <Card 
            onClick={() => router.push("/food-log")}
            className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-md transition-all group"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-[#0f172a] text-lg font-bold flex items-center">
                  <Apple className="w-5 h-5 text-blue-600 mr-2" />
                  <span>Today's Nutrition</span>
                </CardTitle>
                <CardDescription className="text-slate-400">Manage daily food logs</CardDescription>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {foodSummary ? (
                <>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black">{Math.round(foodSummary.totalCalories)}</span>
                    <span className="text-slate-400 text-xs font-semibold">of {Math.round(foodSummary.calorieGoal)} kcal</span>
                  </div>
                  {/* Calorie Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (foodSummary.totalCalories / foodSummary.calorieGoal) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Remaining: {Math.round(foodSummary.remaining)} kcal</span>
                  </div>
                  {/* Macros Row */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50 text-center">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400">P</span>
                      <p className="font-bold text-slate-800 text-sm">{Math.round(foodSummary.totalProtein)}g</p>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400">C</span>
                      <p className="font-bold text-slate-800 text-sm">{Math.round(foodSummary.totalCarbs)}g</p>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400">F</span>
                      <p className="font-bold text-slate-800 text-sm">{Math.round(foodSummary.totalFat)}g</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center justify-center">
                  <Plus className="w-8 h-8 text-slate-300 mb-1" />
                  <p>No food logged today. Click to add a meal!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Active Goals Widget */}
          <Card 
            onClick={() => router.push("/goals")}
            className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-md transition-all group"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-[#0f172a] text-lg font-bold flex items-center">
                  <Target className="w-5 h-5 text-indigo-600 mr-2" />
                  <span>Active Goals</span>
                </CardTitle>
                <CardDescription className="text-slate-400">Dynamic tracking targets</CardDescription>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {activeGoals.length > 0 ? (
                <div className="space-y-3">
                  {activeGoals.map((goal: any, index: number) => {
                    const pct = getGoalPercent(goal);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{getGoalTypeLabel(goal.goalType)}</span>
                          <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center justify-center">
                  <Plus className="w-8 h-8 text-slate-300 mb-1" />
                  <p>No active goals set. Click to configure new targets!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. AI Insights Preview Widget */}
          <Card 
            onClick={() => router.push("/insights")}
            className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-md transition-all group"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-[#0f172a] text-lg font-bold flex items-center">
                  <Sparkles className="w-5 h-5 text-purple-600 mr-2 animate-pulse" />
                  <span>Health Insights</span>
                </CardTitle>
                <CardDescription className="text-slate-400">AI-driven biometric analysis</CardDescription>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {insightsSummary && insightsSummary.insights && insightsSummary.insights.length > 0 ? (
                <>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                    {insightsSummary.overallSummary}
                  </p>
                  <div className="border-t border-slate-50 pt-2.5 space-y-2">
                    {insightsSummary.insights.slice(0, 2).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-700 uppercase tracking-wide">{item.category.replace('_', ' ')}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          item.trend === 'improving' ? 'bg-emerald-50 text-emerald-700' :
                          item.trend === 'declining' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>{item.trend}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-slate-300 mb-1" />
                  <p>Complete biometrics tracking to generate AI analysis trends.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Existing Recommendations & Daily Progress Graph */}
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