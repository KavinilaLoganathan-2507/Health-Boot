"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Droplets, Target, Utensils, AlertCircle } from "lucide-react";

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
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/api/biometrics/history", {
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

  return (
    <div className="min-h-screen bg-[#F0EDE4] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#004743]">Student Dashboard</h1>
            <p className="text-gray-600 text-lg mt-2">Welcome back, {userName}. Here is your Health Report.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/scan'}
              className="flex items-center space-x-2 bg-[#004743] px-4 py-2 rounded-lg shadow-sm text-white hover:bg-[#003a37] transition-colors"
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium hidden sm:inline-block">New Scan</span>
            </button>
            <button 
              onClick={() => window.location.href = '/profile'}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border text-[#004743] hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#004743] text-white flex items-center justify-center font-bold">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-medium hidden sm:inline-block">Profile</span>
            </button>
          </div>
        </div>

        {/* Biometrics Summary */}
        {biometrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">BMI & Status</CardTitle>
                <Activity className="h-4 w-4 text-[#004743]" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-800">{analysis?.bmi || "N/A"}</div>
                <p className="text-xs text-gray-500 mt-1">{analysis?.bmiClassification || "Optimal"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Heart Rate</CardTitle>
                <Activity className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{biometrics.heartRate} bpm</div>
                <p className="text-xs text-gray-500 mt-1">{analysis?.heartRateClassification || "Normal"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Blood Pressure</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{biometrics.systolicBP}/{biometrics.diastolicBP}</div>
                <p className="text-xs text-gray-500 mt-1">{analysis?.bloodPressureClassification || "Status"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Hydration Level</CardTitle>
                <Droplets className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{biometrics.water}%</div>
                <p className="text-xs text-blue-600 mt-1">{analysis?.hydrationStatus || "Optimal"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">BMR</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-800">{analysis?.bmr || "N/A"}</div>
                <p className="text-xs text-gray-500 mt-1">Resting Calories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Daily Calorie Need</CardTitle>
                <Utensils className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-800">{analysis?.dailyCalorieRequirement || "N/A"}</div>
                <p className="text-xs text-gray-500 mt-1">Based on Activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ideal Weight</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-gray-800">{analysis?.idealWeightRange || "N/A"}</div>
                <p className="text-xs text-gray-500 mt-1">Healthy BMI Range</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Overall Risk Score</CardTitle>
                <AlertCircle className={`h-4 w-4 ${analysis?.riskScore === 'High Risk' ? 'text-red-600' : analysis?.riskScore === 'Medium Risk' ? 'text-yellow-500' : 'text-green-500'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${analysis?.riskScore === 'High Risk' ? 'text-red-600' : analysis?.riskScore === 'Medium Risk' ? 'text-yellow-600' : 'text-green-600'}`}>{analysis?.riskScore || "Low Risk"}</div>
                <p className="text-xs text-gray-500 mt-1">Based on 5 factors</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6 flex items-center space-x-4">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <p className="text-yellow-800">No biometric data found. Please visit the Health Boot Booth (Scan page) to log your data.</p>
            </CardContent>
          </Card>
        )}
        {/* Recommendations & Meal Plan */}
        {analysis && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-[#004743]" />
                    <CardTitle>Daily Progress Overview</CardTitle>
                  </div>
                  <CardDescription>Your health score trends over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-end justify-between h-40 space-x-2 px-2">
                    {historyData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div className="w-full max-w-[40px] flex items-end justify-center h-32 bg-gray-100 rounded-t-md overflow-visible relative group">
                          <div 
                            className="w-full bg-[#004743] rounded-t-md transition-all duration-500 ease-out relative group-hover:bg-[#003a37]"
                            style={{ height: `${item.score}%` }}
                          >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              {item.score} pts
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-500 mt-3">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Utensils className="h-5 w-5 text-[#004743]" />
                    <CardTitle>1-Day Personalized Meal Plan</CardTitle>
                  </div>
                  <CardDescription>Generated by AI based on your calories, goals, and dietary preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white border rounded-lg p-6 shadow-sm overflow-y-auto max-h-[300px]">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {analysis.mealPlanForDay || "Meal plan data is currently unavailable. Please generate a new scan."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
