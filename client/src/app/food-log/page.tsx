"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Apple, Trash2, Edit2, Plus, ArrowLeft, Loader2, Sparkles, Check, X, Search, Barcode } from "lucide-react";
import { SERVER_URL } from "@/lib/constants";
import { toast } from "sonner";
import styles from "./food-log.module.css";

interface FoodLog {
  id: string;
  mealType: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  createdAt: string;
}

interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  calorieGoal: number;
  remaining: number;
}

export default function FoodLogPage() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [summary, setSummary] = useState<NutritionSummary>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    calorieGoal: 2000,
    remaining: 2000,
  });

  const [activeTab, setActiveTab] = useState<string>("Breakfast");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  
  // Form State
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [barcode, setBarcode] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFoodName, setEditFoodName] = useState("");
  const [editCalories, setEditCalories] = useState("");
  const [editProtein, setEditProtein] = useState("");
  const [editCarbs, setEditCarbs] = useState("");
  const [editFat, setEditFat] = useState("");
  const [editQuantity, setEditQuantity] = useState("1");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthToken(token);
    fetchDailyLogs(token);
    fetchSummary(token);
  }, [router]);

  const fetchDailyLogs = async (token: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/user/food-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setLogs(data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch food logs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (token: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/user/food-logs/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success && data.data) {
        setSummary(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBarcodeSearch = async () => {
    if (!barcode) {
      toast.error("Please enter a barcode.");
      return;
    }
    setScanning(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/products/${barcode}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (response.ok && data.success && data.data) {
        const product = data.data;
        setFoodName(product.product_identification?.product_name || product.product_identification?.brand || "Scanned Food Item");
        
        // Grab nutrient details per serving or per 100g
        const nutrients = product.nutritional_information?.per_serving || product.nutritional_information?.per_100g;
        if (nutrients) {
          setCalories(Math.round(nutrients.energy_kcal || 0).toString());
          setProtein(Math.round(nutrients.proteins || 0).toString());
          setCarbs(Math.round(nutrients.carbohydrates || 0).toString());
          setFat(Math.round(nutrients.fat_total || 0).toString());
        }
        toast.success("Product autofilled from OpenFoodFacts!");
      } else {
        toast.error("Product not found. You can enter details manually.");
      }
    } catch (err) {
      toast.error("Error connecting to scanning service.");
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) {
      toast.error("Food name and calories are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        mealType: activeTab,
        foodName,
        calories: parseFloat(calories),
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fat: fat ? parseFloat(fat) : 0,
        quantity: parseFloat(quantity) || 1,
      };

      const response = await fetch(`${SERVER_URL}/api/user/food-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Meal logged successfully!");
        setFoodName("");
        setCalories("");
        setProtein("");
        setCarbs("");
        setFat("");
        setBarcode("");
        setQuantity("1");
        // Refresh
        if (authToken) {
          fetchDailyLogs(authToken);
          fetchSummary(authToken);
        }
      } else {
        toast.error(data.message || "Failed to log meal.");
      }
    } catch (err) {
      toast.error("Error logging meal.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (item: FoodLog) => {
    setEditingId(item.id);
    setEditFoodName(item.foodName);
    setEditCalories(item.calories.toString());
    setEditProtein(item.protein.toString());
    setEditCarbs(item.carbs.toString());
    setEditFat(item.fat.toString());
    setEditQuantity(item.quantity.toString());
  };

  const handleSaveEdit = async (id: string) => {
    if (!editFoodName || !editCalories) {
      toast.error("Food name and calories are required.");
      return;
    }
    try {
      const payload = {
        mealType: activeTab,
        foodName: editFoodName,
        calories: parseFloat(editCalories),
        protein: editProtein ? parseFloat(editProtein) : 0,
        carbs: editCarbs ? parseFloat(editCarbs) : 0,
        fat: editFat ? parseFloat(editFat) : 0,
        quantity: parseFloat(editQuantity) || 1,
      };

      const response = await fetch(`${SERVER_URL}/api/user/food-logs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Meal updated!");
        setEditingId(null);
        if (authToken) {
          fetchDailyLogs(authToken);
          fetchSummary(authToken);
        }
      } else {
        toast.error(data.message || "Failed to update meal.");
      }
    } catch (err) {
      toast.error("Error updating meal.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      const response = await fetch(`${SERVER_URL}/api/user/food-logs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Meal deleted.");
        if (authToken) {
          fetchDailyLogs(authToken);
          fetchSummary(authToken);
        }
      } else {
        toast.error(data.message || "Failed to delete meal.");
      }
    } catch (err) {
      toast.error("Error deleting meal.");
    }
  };

  // Aggregation values
  const totalGrams = summary.totalProtein + summary.totalCarbs + summary.totalFat;
  const pPct = totalGrams > 0 ? (summary.totalProtein / totalGrams) * 100 : 0;
  const cPct = totalGrams > 0 ? (summary.totalCarbs / totalGrams) * 100 : 0;
  const fPct = totalGrams > 0 ? (summary.totalFat / totalGrams) * 100 : 0;

  // Calorie ring variables
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((summary.totalCalories / summary.calorieGoal) * 100, 100);
  const strokeOffset = circumference - (percentage / 100) * circumference;

  // Filter logs for selected tab
  const filteredLogs = logs.filter((l) => l.mealType.toLowerCase() === activeTab.toLowerCase());

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingIcon} />
          <p className={styles.loadingText}>Loading food logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.foodLogContainer}>
      <div className={styles.foodLogWrapper}>
        {/* Header */}
        <div className={styles.headerSection}>
          <div>
            <div className={styles.backButton} onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </div>
            <h1 className={styles.pageTitle}>Food Intake Tracker</h1>
            <p className={styles.pageSubtitle}>Log your daily meals, count macros, and reach your calorie goals.</p>
          </div>
        </div>

        <div className={styles.gridContainer}>
          {/* Main Left: Logger and Listing */}
          <div className={styles.mainColumn}>
            {/* Meal Type Tabs */}
            <div className={styles.tabsContainer}>
              {["Breakfast", "Lunch", "Dinner", "Snack"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setEditingId(null);
                  }}
                  className={`${styles.tabButton} ${
                    activeTab === tab
                      ? styles.tabButtonActive
                      : styles.tabButtonInactive
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Quick Barcode Scan Section */}
            <Card className={styles.logFormCard}>
              <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitle}>
                  <Barcode className={styles.iconBarcode} />
                  <span>Autofill via Barcode Scan</span>
                </CardTitle>
                <CardDescription className={styles.cardDescription}>Scan or type product barcode to search OpenFoodFacts database.</CardDescription>
              </CardHeader>
              <CardContent className={styles.barcodeFormContent}>
                <div className={styles.barcodeInputWrapper}>
                  <Input
                    placeholder="Enter EAN/UPC Barcode (e.g., 5449000000996)"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className={styles.barcodeInput}
                  />
                  <Search className={styles.barcodeIcon} />
                </div>
                <Button 
                  onClick={handleBarcodeSearch} 
                  disabled={scanning}
                  className={styles.barcodeButton}
                >
                  {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
                </Button>
              </CardContent>
            </Card>

            {/* Log Food Form */}
            <Card className={styles.logFormCard}>
              <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitle}>
                  <Apple className={styles.iconApple} />
                  <span>Log Food to {activeTab}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className={styles.logForm}>
                  <div className={styles.formGrid2}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Food Name *</label>
                      <Input
                        placeholder="e.g. Avocado Toast"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        required
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Calories (kcal) *</label>
                      <Input
                        type="number"
                        placeholder="e.g. 320"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        required
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid4}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Protein (g)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 12"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Carbs (g)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 24"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Fat (g)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 8"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Quantity (Portions)</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="1.0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className={styles.submitButton}
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    <span>Add to {activeTab}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Today's Meals Section */}
            <Card className={styles.logFormCard}>
              <CardHeader className={styles.logsCardHeader}>
                <CardTitle className={styles.cardTitle}>Logged in {activeTab}</CardTitle>
                <CardDescription className={styles.cardDescription}>Review and modify entries logged for this meal category.</CardDescription>
              </CardHeader>
              <CardContent className={styles.logsCardContent}>
                {filteredLogs.length === 0 ? (
                  <div className={styles.emptyLogs}>
                    No items logged in {activeTab} yet.
                  </div>
                ) : (
                  filteredLogs.map((item) => (
                    <div key={item.id} className={styles.logItem}>
                      {editingId === item.id ? (
                        /* Edit Row State */
                        <div className={styles.editRowWrapper}>
                          <div className={styles.formGrid2}>
                            <Input
                              value={editFoodName}
                              onChange={(e) => setEditFoodName(e.target.value)}
                              placeholder="Food name"
                              className={styles.editInput}
                            />
                            <Input
                              type="number"
                              value={editCalories}
                              onChange={(e) => setEditCalories(e.target.value)}
                              placeholder="Calories"
                              className={styles.editInput}
                            />
                          </div>
                          <div className={styles.formGrid4}>
                            <Input
                              type="number"
                              value={editProtein}
                              onChange={(e) => setEditProtein(e.target.value)}
                              placeholder="Protein"
                              className={styles.editInput}
                            />
                            <Input
                              type="number"
                              value={editCarbs}
                              onChange={(e) => setEditCarbs(e.target.value)}
                              placeholder="Carbs"
                              className={styles.editInput}
                            />
                            <Input
                              type="number"
                              value={editFat}
                              onChange={(e) => setEditFat(e.target.value)}
                              placeholder="Fat"
                              className={styles.editInput}
                            />
                            <Input
                              type="number"
                              step="0.1"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              placeholder="Quantity"
                              className={styles.editInput}
                            />
                          </div>
                          <div className={styles.editRowButtons}>
                            <Button size="sm" onClick={() => handleSaveEdit(item.id)} className={styles.saveBtn}>
                              <Check className="w-4 h-4 mr-1" /> Save
                            </Button>
                            <Button size="sm" onClick={() => setEditingId(null)} className={styles.cancelBtn}>
                              <X className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Regular Row Display */
                        <>
                          <div className={styles.displayRowInfo}>
                            <div className={styles.foodName}>
                              {item.foodName}
                              {item.quantity !== 1 && (
                                <span className={styles.foodQuantity}>({item.quantity} portions)</span>
                              )}
                            </div>
                            <div className={styles.foodMacros}>
                              <span>P: {Math.round(item.protein * item.quantity)}g</span>
                              <span>C: {Math.round(item.carbs * item.quantity)}g</span>
                              <span>F: {Math.round(item.fat * item.quantity)}g</span>
                            </div>
                          </div>
                          <div className={styles.displayRowStats}>
                            <div className={styles.caloriesBlock}>
                              <span className={styles.caloriesValue}>{Math.round(item.calories * item.quantity)}</span>
                              <span className={styles.caloriesUnit}>kcal</span>
                            </div>
                            <div className={styles.actionIcons}>
                              <button
                                onClick={() => handleStartEdit(item)}
                                className={`${styles.actionIconBtn} ${styles.editIconBtn}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className={`${styles.actionIconBtn} ${styles.deleteIconBtn}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Nutrition Overview */}
          <div className={styles.sidebarColumn}>
            <Card className={styles.macroCard}>
              <CardHeader className={styles.summaryHeader}>
                <CardTitle className={styles.summaryTitle}>
                  <Sparkles className={styles.summaryIcon} />
                  <span>Calorie Intake Progress</span>
                </CardTitle>
                <CardDescription className={styles.summaryDesc}>Daily calorie summary metrics.</CardDescription>
              </CardHeader>
              <CardContent className={styles.summaryContent}>
                {/* SVG Progress Ring */}
                <div className={styles.ringContainer}>
                  <div className={styles.progressRing}>
                    <svg className={styles.progressSvg}>
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        className={styles.progressCircleBg}
                        strokeWidth="12"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        className={styles.progressCircleFg}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className={styles.ringCenter}>
                      <span className={styles.ringCalories}>{Math.round(summary.totalCalories)}</span>
                      <p className={styles.ringGoal}>/ {Math.round(summary.calorieGoal)} kcal</p>
                    </div>
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <div>
                    <span className={styles.statLabel}>Goal Limit</span>
                    <p className={styles.statValue}>{Math.round(summary.calorieGoal)} kcal</p>
                  </div>
                  <div>
                    <span className={styles.statLabel}>Remaining</span>
                    <p className={`${styles.statRemaining} ${summary.remaining > 0 ? styles.textBlue : styles.textRed}`}>
                      {Math.round(summary.remaining)} kcal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Macro Splits Card */}
            <Card className={styles.macrosCard}>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>Daily Macro Splits</CardTitle>
                <CardDescription className={styles.cardDescription}>Track distribution of macronutrients.</CardDescription>
              </CardHeader>
              <CardContent className={styles.macrosContent}>
                {/* Protein Bar */}
                <div className={styles.macroItem}>
                  <div className={styles.macroLabelRow}>
                    <span className={styles.macroLabel}>Protein</span>
                    <span className={styles.macroValue}>{Math.round(summary.totalProtein)}g ({Math.round(pPct)}%)</span>
                  </div>
                  <div className={styles.macroBarBg}>
                    <div className={`${styles.macroBarFg} ${styles.bgProtein}`} style={{ width: `${pPct || 0}%` }}></div>
                  </div>
                </div>

                {/* Carbohydrates Bar */}
                <div className={styles.macroItem}>
                  <div className={styles.macroLabelRow}>
                    <span className={styles.macroLabel}>Carbs</span>
                    <span className={styles.macroValue}>{Math.round(summary.totalCarbs)}g ({Math.round(cPct)}%)</span>
                  </div>
                  <div className={styles.macroBarBg}>
                    <div className={`${styles.macroBarFg} ${styles.bgCarbs}`} style={{ width: `${cPct || 0}%` }}></div>
                  </div>
                </div>

                {/* Fats Bar */}
                <div className={styles.macroItem}>
                  <div className={styles.macroLabelRow}>
                    <span className={styles.macroLabel}>Fats</span>
                    <span className={styles.macroValue}>{Math.round(summary.totalFat)}g ({Math.round(fPct)}%)</span>
                  </div>
                  <div className={styles.macroBarBg}>
                    <div className={`${styles.macroBarFg} ${styles.bgFat}`} style={{ width: `${fPct || 0}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
