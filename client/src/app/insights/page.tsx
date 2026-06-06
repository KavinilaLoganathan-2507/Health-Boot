"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, Minus, Info, ClipboardList, Lightbulb, Loader2, Check } from "lucide-react";
import { SERVER_URL } from "@/lib/constants";
import { toast } from "sonner";

interface HealthInsight {
  category: string;
  trend: string; // improving|declining|stable
  summary: string;
  recommendation: string;
}

interface InsightsResponse {
  insights: HealthInsight[];
  overallSummary: string;
  generatedAt: string;
}

export default function InsightsPage() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [insightsData, setInsightsData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthToken(token);
    fetchInsights(token);
  }, [router]);

  const fetchInsights = async (token: string, bypassCache = false) => {
    if (bypassCache) {
      setRefreshing(true);
    }
    try {
      const response = await fetch(`${SERVER_URL}/api/user/insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success && data.data) {
        setInsightsData(data.data);
        // Pre-populate checked status of items from local storage if saved
        const storedChecks = localStorage.getItem("insightsCheckedTasks");
        if (storedChecks) {
          setCheckedItems(JSON.parse(storedChecks));
        }
      } else {
        toast.error("Failed to generate health insights.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating health insights.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleCheckItem = (key: string) => {
    const updated = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(updated);
    localStorage.setItem("insightsCheckedTasks", JSON.stringify(updated));
  };

  const getCategoryName = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "bmi": return "BMI & Weight";
      case "heart_rate": return "Heart Rate (bpm)";
      case "blood_pressure": return "Blood Pressure (mmHg)";
      case "hydration": return "Hydration & Fluid Balance";
      case "body_fat": return "Body Composition (Fat %)";
      default: return cat.toUpperCase();
    }
  };

  const renderTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "improving":
        return <TrendingUp className="w-5 h-5 text-emerald-500 animate-bounce" />;
      case "declining":
        return <TrendingDown className="w-5 h-5 text-red-500 animate-pulse" />;
      case "stable":
      default:
        return <Minus className="w-5 h-5 text-amber-500" />;
    }
  };

  const getTrendStyle = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "improving":
        return "bg-emerald-50 border border-emerald-100 text-emerald-800";
      case "declining":
        return "bg-red-50 border border-red-100 text-red-800";
      case "stable":
      default:
        return "bg-amber-50 border border-amber-100 text-amber-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#0f172a] animate-spin" />
          <p className="text-slate-500 font-medium">Analyzing historical biometric data...</p>
        </div>
      </div>
    );
  }

  const hasInsights = insightsData && insightsData.insights && insightsData.insights.length > 0;

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-6 text-[#0f172a]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sm text-slate-500 cursor-pointer hover:text-slate-800 transition-colors" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold mt-2 tracking-tight">AI Health Insights</h1>
            <p className="text-slate-600 mt-1">Cross-referencing historical biometric scans to extract clinical trends.</p>
          </div>
          <Button 
            onClick={() => authToken && fetchInsights(authToken, true)} 
            disabled={refreshing}
            className="bg-[#0f172a] hover:bg-slate-800 text-white font-medium"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Refresh Insights
          </Button>
        </div>

        {hasInsights ? (
          <div className="space-y-8">
            {/* Overall Summary Narrative */}
            <Card className="bg-gradient-to-br from-[#0f172a] to-slate-800 text-white border-0 rounded-xl shadow-xl overflow-hidden relative">
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                <Sparkles className="w-32 h-32 text-indigo-400" />
              </div>
              <CardHeader className="py-6">
                <CardTitle className="text-2xl font-bold flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                  <span>Personalized Health Narrative</span>
                </CardTitle>
                <CardDescription className="text-indigo-200">Overall analysis generated by Wellness AI.</CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-slate-100 text-base leading-relaxed whitespace-pre-wrap">
                  {insightsData?.overallSummary}
                </p>
                {insightsData?.generatedAt && (
                  <div className="mt-4 text-xs text-indigo-300">
                    Generated on {new Date(insightsData.generatedAt).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grid of Category Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insightsData?.insights.map((insight, index) => (
                <Card key={index} className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.015)] transition-all hover:shadow-[0_4px_25px_rgba(0,0,0,0.035)]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-bold text-[#0f172a]">
                      {getCategoryName(insight.category)}
                    </CardTitle>
                    <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getTrendStyle(insight.trend)}`}>
                      {renderTrendIcon(insight.trend)}
                      <span>{insight.trend}</span>
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    <div className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{insight.summary}</p>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-blue-50/50 border border-blue-100/50 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-900 leading-relaxed font-semibold">
                        <span className="font-extrabold block text-blue-900/80 text-xs uppercase mb-0.5 tracking-wider">Recommendation:</span>
                        {insight.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Checklist of Actions */}
            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-lg font-bold flex items-center space-x-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  <span>Daily Action Item Checklist</span>
                </CardTitle>
                <CardDescription>Mark task accomplishments from the AI recommendations.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 pt-0">
                {insightsData?.insights.map((insight, index) => {
                  const key = `insight_task_${insight.category}_${index}`;
                  const isChecked = !!checkedItems[key];
                  return (
                    <div 
                      key={index} 
                      onClick={() => toggleCheckItem(key)}
                      className="py-4 flex items-center space-x-3 cursor-pointer hover:bg-slate-50/50 transition-colors px-2 rounded-lg"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked 
                          ? "bg-emerald-500 border-emerald-600 text-white" 
                          : "border-slate-300 bg-white"
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-sm font-medium ${isChecked ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        [{getCategoryName(insight.category)}] {insight.recommendation}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-amber-50 border border-amber-200 text-amber-900 shadow-sm rounded-xl">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <Info className="h-12 w-12 text-amber-600 animate-pulse" />
              <div className="space-y-1">
                <p className="font-bold text-lg">No Biometrics Scans Found</p>
                <p className="text-sm">You must complete at least one biometric analysis scan at the Booth (Scan page) to generate history-based AI insights.</p>
              </div>
              <Button onClick={() => router.push("/scan")} className="bg-[#0f172a] hover:bg-slate-800 text-white font-medium mt-2">
                Go to Scan Page
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
