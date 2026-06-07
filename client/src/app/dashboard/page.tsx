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
import styles from "./dashboard.module.css";

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
  const dynamicRiskStyles = riskStyles[currentRisk] || riskStyles["Low Risk"];

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
    <div className={styles.dashboardContainer}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.headerTitle}>Student Dashboard</h1>
            <p className={styles.headerSubtitle}>
              Welcome back, <span className={styles.userName}>{userName}</span>. Here is your Health Report.
            </p>
          </div>
          <div className={styles.actionButtons}>
            <button 
              onClick={() => router.push("/scan")}
              className={styles.primaryButton}
            >
              <Activity className="w-4 h-4" />
              <span>New Scan</span>
            </button>
            <button 
              onClick={() => router.push("/profile")}
              className={styles.secondaryButton}
            >
              <div className={styles.avatarCircle}>
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className={styles.avatarLabel}>Profile</span>
            </button>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className={styles.quickNavGrid}>
          <div 
            onClick={() => router.push("/food-log")}
            className={styles.navCard}
          >
            <div className={`${styles.navIconWrapper} ${styles.navItemFood}`}>
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h3 className={styles.navCardTitle}>Food Intake</h3>
              <p className={styles.navCardSubtitle}>Track Calories</p>
            </div>
          </div>

          <div 
            onClick={() => router.push("/goals")}
            className={styles.navCard}
          >
            <div className={`${styles.navIconWrapper} ${styles.navItemGoals}`}>
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className={styles.navCardTitle}>Smart Goals</h3>
              <p className={styles.navCardSubtitle}>My Targets</p>
            </div>
          </div>

          <div 
            onClick={() => router.push("/insights")}
            className={styles.navCard}
          >
            <div className={`${styles.navIconWrapper} ${styles.navItemInsights}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className={styles.navCardTitle}>AI Insights</h3>
              <p className={styles.navCardSubtitle}>Biometric Trends</p>
            </div>
          </div>

          <div 
            onClick={() => router.push("/qr-checkin")}
            className={styles.navCard}
          >
            <div className={`${styles.navIconWrapper} ${styles.navItemQR}`}>
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className={styles.navCardTitle}>QR Check-in</h3>
              <p className={styles.navCardSubtitle}>Kiosk Sync</p>
            </div>
          </div>
        </div>

        {/* Biometrics Summary */}
        {biometrics ? (
          <div className={styles.metricGrid}>
            <Card className={styles.metricCard}>
              <CardHeader className={styles.metricCardHeader}>
                <CardTitle className={styles.metricCardTitle}>BMI & Status</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={styles.metricCardValue}>{analysis?.bmi || "N/A"}</div>
                <p className={`${styles.metricCardSubStatus} text-blue-600`}>{analysis?.bmiClassification || "Optimal"}</p>
                <p className={styles.metricCardReason}>{analysis?.bmiReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={styles.metricCard}>
              <CardHeader className={styles.metricCardHeader}>
                <CardTitle className={styles.metricCardTitle}>Heart Rate</CardTitle>
                <Activity className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className={styles.metricCardValue}>{biometrics.heartRate} <span className={styles.metricCardValueSmall}>bpm</span></div>
                <p className={`${styles.metricCardSubStatus} text-red-500`}>{analysis?.heartRateClassification || "Normal"}</p>
                <p className={styles.metricCardReason}>{analysis?.heartRateReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={styles.metricCard}>
              <CardHeader className={styles.metricCardHeader}>
                <CardTitle className={styles.metricCardTitle}>Blood Pressure</CardTitle>
                <Activity className={`h-4 w-4 ${analysis?.bloodPressureClassification === 'Invalid Reading' ? 'text-amber-500' : 'text-indigo-500'}`} />
              </CardHeader>
              <CardContent>
                <div className={styles.metricCardValue}>{biometrics.systolicBP}/{biometrics.diastolicBP} <span className={styles.metricCardValueSmall}>mmHg</span></div>
                <p className={`${styles.metricCardSubStatus} ${analysis?.bloodPressureClassification === 'Invalid Reading' ? 'text-amber-600' : 'text-indigo-600'}`}>
                  {analysis?.bloodPressureClassification || "Status"}
                </p>
                <p className={styles.metricCardReason}>{analysis?.bloodPressureReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={styles.metricCard}>
              <CardHeader className={styles.metricCardHeader}>
                <CardTitle className={styles.metricCardTitle}>Hydration Level</CardTitle>
                <Droplets className="h-4 w-4 text-sky-500" />
              </CardHeader>
              <CardContent>
                <div className={styles.metricCardValue}>{biometrics.water}%</div>
                <p className={`${styles.metricCardSubStatus} text-sky-600`}>{analysis?.hydrationStatus || "Optimal"}</p>
                <p className={styles.metricCardReason}>{analysis?.hydrationReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={styles.metricCard}>
              <CardHeader className={styles.metricCardHeader}>
                <CardTitle className={styles.metricCardTitle}>Body Fat</CardTitle>
                <Activity className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className={styles.metricCardValue}>{biometrics.bodyFat}%</div>
                <p className={`${styles.metricCardSubStatus} text-orange-600`}>{analysis?.bodyFatClassification || "Healthy"}</p>
                <p className={styles.metricCardReason}>{analysis?.bodyFatReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={styles.metricCard}>
              <CardHeader className={styles.metricCardHeader}>
                <CardTitle className={styles.metricCardTitle}>BMR</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className={styles.metricCardValue}>{analysis?.bmr || "N/A"}</div>
                <p className={`${styles.metricCardSubStatus} text-purple-600`}>Resting Calories</p>
                <p className={styles.metricCardReason}>{analysis?.bmrReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={styles.metricCard}>
              <CardHeader className={styles.metricCardHeader}>
                <CardTitle className={styles.metricCardTitle}>Daily Calorie Need</CardTitle>
                <Utensils className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className={styles.metricCardValue}>{analysis?.dailyCalorieRequirement || "N/A"}</div>
                <p className={`${styles.metricCardSubStatus} text-amber-600`}>Based on Activity</p>
                <p className={styles.metricCardReason}>{analysis?.dailyCalorieReason || ""}</p>
              </CardContent>
            </Card>

            <Card className={styles.metricCard}>
              <CardHeader className={styles.metricCardHeader}>
                <CardTitle className={styles.metricCardTitle}>Ideal Weight</CardTitle>
                <Target className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className={styles.metricCardValue}>{analysis?.idealWeightRange || "N/A"}</div>
                <p className={`${styles.metricCardSubStatus} text-emerald-600`}>Healthy BMI Range</p>
                <p className={styles.metricCardReason}>{analysis?.idealWeightReason || ""}</p>
              </CardContent>
            </Card>

            {/* High Contrast Light Overall Risk Score Card */}
            <Card className={`${styles.riskCard} ${dynamicRiskStyles.card}`}>
              <CardHeader className={styles.metricCardHeader}>
                <CardTitle className={`text-sm uppercase tracking-wider ${dynamicRiskStyles.title}`}>Overall Risk Score</CardTitle>
                <AlertCircle className={dynamicRiskStyles.icon} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl ${dynamicRiskStyles.value}`}>{analysis?.riskScore || "Low Risk"}</div>
                <p className={`text-xs mt-1 ${dynamicRiskStyles.desc}`}>Calculated based on BMI + Heart Rate + Blood Pressure + Hydration + Body Fat metrics</p>
                <p className={`text-xs mt-3 p-3 rounded-lg border ${dynamicRiskStyles.reason}`}>
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
        <div className={styles.widgetGrid}>
          {/* 1. Today's Nutrition Widget */}
          <Card 
            onClick={() => router.push("/food-log")}
            className={styles.widgetCard}
          >
            <CardHeader className={styles.widgetHeader}>
              <div>
                <CardTitle className={styles.widgetTitle}>
                  <Apple className="w-5 h-5 text-blue-600 mr-2" />
                  <span>Today's Nutrition</span>
                </CardTitle>
                <CardDescription className={styles.widgetDescription}>Manage daily food logs</CardDescription>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </CardHeader>
            <CardContent className={styles.widgetContent}>
              {foodSummary ? (
                <>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-black">{Math.round(foodSummary.totalCalories)}</span>
                    <span className="text-slate-400 text-xs font-semibold">of {Math.round(foodSummary.calorieGoal)} kcal</span>
                  </div>
                  {/* Calorie Bar */}
                  <div className={styles.progressBarContainer}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${Math.min(100, (foodSummary.totalCalories / foodSummary.calorieGoal) * 100)}%`, backgroundColor: '#2563eb' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mt-2">
                    <span>Remaining: {Math.round(foodSummary.remaining)} kcal</span>
                  </div>
                  {/* Macros Row */}
                  <div className={styles.macroGrid}>
                    <div className={styles.macroItem}>
                      <span className={styles.macroLabel}>P</span>
                      <p className={styles.macroValue}>{Math.round(foodSummary.totalProtein)}g</p>
                    </div>
                    <div className={styles.macroItem}>
                      <span className={styles.macroLabel}>C</span>
                      <p className={styles.macroValue}>{Math.round(foodSummary.totalCarbs)}g</p>
                    </div>
                    <div className={styles.macroItem}>
                      <span className={styles.macroLabel}>F</span>
                      <p className={styles.macroValue}>{Math.round(foodSummary.totalFat)}g</p>
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
            className={styles.widgetCard}
          >
            <CardHeader className={styles.widgetHeader}>
              <div>
                <CardTitle className={styles.widgetTitle}>
                  <Target className="w-5 h-5 text-indigo-600 mr-2" />
                  <span>Active Goals</span>
                </CardTitle>
                <CardDescription className={styles.widgetDescription}>Dynamic tracking targets</CardDescription>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </CardHeader>
            <CardContent className={styles.widgetContent}>
              {activeGoals.length > 0 ? (
                <div className="space-y-3">
                  {activeGoals.map((goal: any, index: number) => {
                    const pct = getGoalPercent(goal);
                    return (
                      <div key={index} className="space-y-1 mb-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span>{getGoalTypeLabel(goal.goalType)}</span>
                          <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                        </div>
                        <div className={styles.progressBarContainer}>
                          <div 
                            className={styles.progressBarFill} 
                            style={{ width: `${pct}%`, backgroundColor: '#4f46e5' }}
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
            className={styles.widgetCard}
          >
            <CardHeader className={styles.widgetHeader}>
              <div>
                <CardTitle className={styles.widgetTitle}>
                  <Sparkles className="w-5 h-5 text-purple-600 mr-2 animate-pulse" />
                  <span>Health Insights</span>
                </CardTitle>
                <CardDescription className={styles.widgetDescription}>AI-driven biometric analysis</CardDescription>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </CardHeader>
            <CardContent className={styles.widgetContent}>
              {insightsSummary && insightsSummary.insights && insightsSummary.insights.length > 0 ? (
                <>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3 mb-3">
                    {insightsSummary.overallSummary}
                  </p>
                  <div className="border-t border-slate-50 pt-2.5 space-y-2">
                    {insightsSummary.insights.slice(0, 2).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
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
          <div className={styles.widgetGrid}>
            <Card className={styles.recommendationCard}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-[#0f172a]" />
                  <CardTitle className="text-[#0f172a]">Daily Progress Overview</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Your health score trends over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className={styles.chartSection}>
                  {historyData.map((item, index) => (
                    <div key={index} className={styles.chartBarContainer}>
                      <div className={styles.chartBarBackground}>
                        <div 
                          className={styles.chartBarFill}
                          style={{ height: `${item.score}%` }}
                        >
                          <div className={styles.chartTooltip}>
                            {item.score} pts
                          </div>
                        </div>
                      </div>
                      <span className={styles.chartLabel}>{item.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={styles.recommendationCard}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Utensils className="h-5 w-5 text-[#0f172a]" />
                  <CardTitle className="text-[#0f172a]">1-Day Personalized Meal Plan</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Generated by AI based on calories, goals, and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.contentBox}>
                  <p className={styles.contentText}>
                    {analysis.mealPlanForDay || "Meal plan data is currently unavailable. Please generate a new scan."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={styles.recommendationCard}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-[#0f172a]" />
                  <CardTitle className="text-[#0f172a]">Daily Workout Plan</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Targeted exercises based on BMI, heart rate, and health status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.contentBox}>
                  <p className={styles.contentText}>
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