"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Target, Award, Trash2, Edit2, Plus, Calendar, Activity, Check, X, Loader2, RefreshCw } from "lucide-react";
import { SERVER_URL } from "@/lib/constants";
import { toast } from "sonner";

interface Goal {
  id: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function GoalsPage() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [goalType, setGoalType] = useState("hydration");
  const [targetValue, setTargetValue] = useState("");
  const [currentValue, setCurrentValue] = useState("0");
  const [unit, setUnit] = useState("glasses");
  const [targetDate, setTargetDate] = useState("");

  // Update Progress State
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [newProgressValue, setNewProgressValue] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthToken(token);
    fetchGoals(token);
  }, [router]);

  // Adjust default units based on goal type selection
  useEffect(() => {
    if (goalType === "hydration") {
      setUnit("glasses");
    } else if (goalType === "activity") {
      setUnit("steps");
    } else if (goalType === "weight_loss" || goalType === "weight_gain") {
      setUnit("kg");
    } else if (goalType === "nutrition") {
      setUnit("kcal");
    }
  }, [goalType]);

  const fetchGoals = async (token: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/user/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setGoals(data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch goals.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetValue || !targetDate) {
      toast.error("Target value and target date are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        goalType,
        targetValue: parseFloat(targetValue),
        currentValue: parseFloat(currentValue) || 0,
        unit,
        targetDate,
      };

      const response = await fetch(`${SERVER_URL}/api/user/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Goal set successfully!");
        setTargetValue("");
        setCurrentValue("0");
        setTargetDate("");
        if (authToken) fetchGoals(authToken);
      } else {
        toast.error(data.message || "Failed to set goal.");
      }
    } catch (err) {
      toast.error("Error setting goal.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (id: string) => {
    if (!newProgressValue) {
      toast.error("Please enter a progress value.");
      return;
    }
    try {
      const response = await fetch(`${SERVER_URL}/api/user/goals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentValue: parseFloat(newProgressValue) }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Progress updated successfully!");
        setUpdatingGoalId(null);
        setNewProgressValue("");
        if (authToken) fetchGoals(authToken);
      } else {
        toast.error(data.message || "Failed to update progress.");
      }
    } catch (err) {
      toast.error("Error updating progress.");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      const response = await fetch(`${SERVER_URL}/api/user/goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Goal deleted.");
        if (authToken) fetchGoals(authToken);
      } else {
        toast.error(data.message || "Failed to delete goal.");
      }
    } catch (err) {
      toast.error("Error deleting goal.");
    }
  };

  // Helper to humanize goal types
  const getGoalTypeName = (type: string) => {
    switch (type) {
      case "weight_loss": return "Weight Loss";
      case "weight_gain": return "Weight Gain";
      case "hydration": return "Daily Hydration";
      case "activity": return "Daily Activity";
      case "nutrition": return "Nutrition Limit";
      default: return "Health Goal";
    }
  };

  // Helper to render circular progress SVGs
  const renderGoalCircle = (goal: Goal) => {
    const radius = 30;
    const circ = 2 * Math.PI * radius;
    let pct = (goal.currentValue / goal.targetValue) * 100;
    
    // Weight loss is unique: completion is when current <= target
    if (goal.goalType === "weight_loss") {
      // If we are below target, we are at 100%
      if (goal.currentValue <= goal.targetValue) {
        pct = 100;
      } else {
        // Calculate closeness (e.g. if we started above target)
        // For simplicity: show a placeholder or basic ratio
        pct = Math.max(0, Math.min(100, (goal.targetValue / goal.currentValue) * 100));
      }
    } else {
      pct = Math.min(pct, 100);
    }

    const strokeOffset = circ - (pct / 100) * circ;

    return (
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-slate-100 fill-none"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${
              goal.status === "completed" ? "stroke-emerald-500" : "stroke-blue-600"
            }`}
            strokeWidth="6"
            strokeDasharray={circ}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-bold text-[#0f172a]">{Math.round(pct)}%</span>
      </div>
    );
  };

  // Days remaining helper
  const getDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : "Overdue / Today";
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#0f172a] animate-spin" />
          <p className="text-slate-500 font-medium">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-6 text-[#0f172a]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-2 text-sm text-slate-500 cursor-pointer hover:text-slate-800 transition-colors" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold mt-2 tracking-tight">Smart Goals Engine</h1>
          <p className="text-slate-600 mt-1">Set healthy targets, log dynamic updates, and review your progress metrics.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Goal Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Set New Goal</span>
                </CardTitle>
                <CardDescription>Configure target values and milestones.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Goal Type</label>
                    <select
                      value={goalType}
                      onChange={(e) => setGoalType(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="hydration">Daily Hydration</option>
                      <option value="activity">Daily Activity</option>
                      <option value="weight_loss">Weight Loss</option>
                      <option value="weight_gain">Weight Gain</option>
                      <option value="nutrition">Calorie Limit</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Target Value</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 10000"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Current Value</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Unit</label>
                      <Input
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        required
                        placeholder="e.g. steps"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Target Date</label>
                      <Input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-medium flex items-center justify-center space-x-2 py-3 rounded-lg mt-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    <span>Activate Goal</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Active Goals list and History */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-lg font-bold flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <span>Active Goals</span>
                </CardTitle>
                <CardDescription>Track and update progress of ongoing objectives.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 pt-0">
                {activeGoals.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No active goals set. Use the form to start tracking progress.
                  </div>
                ) : (
                  activeGoals.map((goal) => (
                    <div key={goal.id} className="py-6 flex items-start justify-between gap-6">
                      <div className="flex items-center space-x-4 flex-1">
                        {renderGoalCircle(goal)}
                        <div className="flex-1">
                          <h4 className="font-bold text-[#0f172a] text-lg">{getGoalTypeName(goal.goalType)}</h4>
                          <div className="text-slate-500 text-sm mt-1">
                            Current: <span className="font-semibold text-slate-800">{goal.currentValue}</span> / Target: <span className="font-semibold text-slate-800">{goal.targetValue} {goal.unit}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2 font-medium">
                            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {getDaysRemaining(goal.targetDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        {updatingGoalId === goal.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              placeholder="New value"
                              value={newProgressValue}
                              onChange={(e) => setNewProgressValue(e.target.value)}
                              className="w-24 h-9"
                            />
                            <Button size="sm" onClick={() => handleUpdateProgress(goal.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setUpdatingGoalId(null)} className="h-9 px-3">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setUpdatingGoalId(goal.id);
                              setNewProgressValue(goal.currentValue.toString());
                            }} className="flex items-center">
                              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Update
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteGoal(goal.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Completed Goals */}
            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-lg font-bold flex items-center space-x-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Completed Achievements</span>
                </CardTitle>
                <CardDescription>Historical accomplishments.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 pt-0">
                {completedGoals.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No achievements unlocked yet. Keep working towards your active goals!
                  </div>
                ) : (
                  completedGoals.map((goal) => (
                    <div key={goal.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-emerald-50 p-2.5 rounded-full border border-emerald-100">
                          <Award className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{getGoalTypeName(goal.goalType)}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Reached target of {goal.targetValue} {goal.unit}
                          </p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">
                        Unlocked
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
