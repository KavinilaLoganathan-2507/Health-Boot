"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Target, Award, Trash2, Edit2, Plus, Calendar, Activity, Check, X, Loader2, RefreshCw } from "lucide-react";
import { SERVER_URL } from "@/lib/constants";
import { toast } from "sonner";
import styles from "./goals.module.css";

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
      <div className={styles.progressRing}>
        <svg className={styles.progressSvg}>
          <circle
            cx="40"
            cy="40"
            r={radius}
            className={styles.progressCircleBg}
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            className={`${styles.progressCircleFg} ${
              goal.status === "completed" ? styles.progressCircleCompleted : styles.progressCircleActive
            }`}
            strokeWidth="6"
            strokeDasharray={circ}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          />
        </svg>
        <span className={styles.progressText}>{Math.round(pct)}%</span>
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
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingIcon} />
          <p className={styles.loadingText}>Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.goalsContainer}>
      <div className={styles.goalsWrapper}>
        {/* Header */}
        <div className={styles.headerSection}>
          <div className={styles.backButton} onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </div>
          <h1 className={styles.pageTitle}>Smart Goals Engine</h1>
          <p className={styles.pageSubtitle}>Set healthy targets, log dynamic updates, and review your progress metrics.</p>
        </div>

        <div className={styles.gridContainer}>
          {/* Create Goal Form */}
          <div className={styles.formColumn}>
            <Card className={styles.formCard}>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <Target className={styles.iconTarget} />
                  <span>Set New Goal</span>
                </CardTitle>
                <CardDescription>Configure target values and milestones.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className={styles.formBody}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Goal Type</label>
                    <select
                      value={goalType}
                      onChange={(e) => setGoalType(e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="hydration">Daily Hydration</option>
                      <option value="activity">Daily Activity</option>
                      <option value="weight_loss">Weight Loss</option>
                      <option value="weight_gain">Weight Gain</option>
                      <option value="nutrition">Calorie Limit</option>
                    </select>
                  </div>

                  <div className={styles.inputGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Target Value</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 10000"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        required
                        className={styles.textInput}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Current Value</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        className={styles.textInput}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Unit</label>
                      <Input
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        required
                        placeholder="e.g. steps"
                        className={styles.textInput}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Target Date</label>
                      <Input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        required
                        className={styles.textInput}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className={styles.submitButton}
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    <span>Activate Goal</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Active Goals list and History */}
          <div className={styles.listsColumn}>
            <Card className={styles.goalCard}>
              <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitle}>
                  <Activity className={styles.iconActivity} />
                  <span>Active Goals</span>
                </CardTitle>
                <CardDescription>Track and update progress of ongoing objectives.</CardDescription>
              </CardHeader>
              <CardContent className={styles.cardContent}>
                {activeGoals.length === 0 ? (
                  <div className={styles.emptyState}>
                    No active goals set. Use the form to start tracking progress.
                  </div>
                ) : (
                  activeGoals.map((goal) => (
                    <div key={goal.id} className={styles.goalItem}>
                      <div className={styles.goalInfo}>
                        {renderGoalCircle(goal)}
                        <div className={styles.goalDetails}>
                          <h4 className={styles.goalName}>{getGoalTypeName(goal.goalType)}</h4>
                          <div className={styles.goalStats}>
                            Current: <span className={styles.statHighlight}>{goal.currentValue}</span> / Target: <span className={styles.statHighlight}>{goal.targetValue} {goal.unit}</span>
                          </div>
                          <div className={styles.goalMeta}>
                            <span className={styles.metaItem}><Calendar className={styles.iconSmall} /> {getDaysRemaining(goal.targetDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.goalActions}>
                        {updatingGoalId === goal.id ? (
                          <div className={styles.updateContainer}>
                            <Input
                              type="number"
                              placeholder="New value"
                              value={newProgressValue}
                              onChange={(e) => setNewProgressValue(e.target.value)}
                              className={styles.updateGoalInput}
                            />
                            <Button size="sm" onClick={() => handleUpdateProgress(goal.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setUpdatingGoalId(null)} className="h-9 px-3">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className={styles.actionButtons}>
                            <Button size="sm" variant="outline" onClick={() => {
                              setUpdatingGoalId(goal.id);
                              setNewProgressValue(goal.currentValue.toString());
                            }} className="flex items-center">
                              <RefreshCw className={styles.iconSmall} /> Update
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
            <Card className={styles.goalCard}>
              <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitle}>
                  <Award className={styles.iconAward} />
                  <span>Completed Achievements</span>
                </CardTitle>
                <CardDescription>Historical accomplishments.</CardDescription>
              </CardHeader>
              <CardContent className={styles.cardContent}>
                {completedGoals.length === 0 ? (
                  <div className={styles.emptyState}>
                    No achievements unlocked yet. Keep working towards your active goals!
                  </div>
                ) : (
                  completedGoals.map((goal) => (
                    <div key={goal.id} className={styles.completedGoalItem}>
                      <div className={styles.completedGoalInfo}>
                        <div className={styles.awardIconBg}>
                          <Award className={styles.iconAward} />
                        </div>
                        <div>
                          <h4 className={styles.completedGoalName}>{getGoalTypeName(goal.goalType)}</h4>
                          <p className={styles.completedGoalDesc}>
                            Reached target of {goal.targetValue} {goal.unit}
                          </p>
                        </div>
                      </div>
                      <span className={styles.unlockedBadge}>
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
