"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Apple, Trash2, Edit2, Plus, ArrowLeft, Loader2, Sparkles, Check, X, Search, Barcode } from "lucide-react";
import { SERVER_URL } from "@/lib/constants";
import { toast } from "sonner";

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
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#0f172a] animate-spin" />
          <p className="text-slate-500 font-medium">Loading food logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-6 text-[#0f172a]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2 text-sm text-slate-500 cursor-pointer hover:text-slate-800 transition-colors" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold mt-2 tracking-tight">Food Intake Tracker</h1>
            <p className="text-slate-600 mt-1">Log your daily meals, count macros, and reach your calorie goals.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left: Logger and Listing */}
          <div className="lg:col-span-2 space-y-8">
            {/* Meal Type Tabs */}
            <div className="flex bg-white border border-slate-200/60 p-1.5 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.01)]">
              {["Breakfast", "Lunch", "Dinner", "Snack"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setEditingId(null);
                  }}
                  className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-[#0f172a] text-white shadow-md scale-[1.01]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Quick Barcode Scan Section */}
            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center space-x-2">
                  <Barcode className="w-5 h-5 text-indigo-600" />
                  <span>Autofill via Barcode Scan</span>
                </CardTitle>
                <CardDescription>Scan or type product barcode to search OpenFoodFacts database.</CardDescription>
              </CardHeader>
              <CardContent className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter EAN/UPC Barcode (e.g., 5449000000996)"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                </div>
                <Button 
                  onClick={handleBarcodeSearch} 
                  disabled={scanning}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
                </Button>
              </CardContent>
            </Card>

            {/* Log Food Form */}
            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Apple className="w-5 h-5 text-blue-600" />
                  <span>Log Food to {activeTab}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Food Name *</label>
                      <Input
                        placeholder="e.g. Avocado Toast"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Calories (kcal) *</label>
                      <Input
                        type="number"
                        placeholder="e.g. 320"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Protein (g)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 12"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Carbs (g)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 24"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Fat (g)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 8"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Quantity (Portions)</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="1.0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-medium flex items-center justify-center space-x-2 py-3 rounded-lg"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    <span>Add to {activeTab}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Today's Meals Section */}
            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-lg font-bold">Logged in {activeTab}</CardTitle>
                <CardDescription>Review and modify entries logged for this meal category.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 pt-0">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No items logged in {activeTab} yet.
                  </div>
                ) : (
                  filteredLogs.map((item) => (
                    <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {editingId === item.id ? (
                        /* Edit Row State */
                        <div className="w-full space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              value={editFoodName}
                              onChange={(e) => setEditFoodName(e.target.value)}
                              placeholder="Food name"
                              className="h-9"
                            />
                            <Input
                              type="number"
                              value={editCalories}
                              onChange={(e) => setEditCalories(e.target.value)}
                              placeholder="Calories"
                              className="h-9"
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Input
                              type="number"
                              value={editProtein}
                              onChange={(e) => setEditProtein(e.target.value)}
                              placeholder="Protein"
                              className="h-9"
                            />
                            <Input
                              type="number"
                              value={editCarbs}
                              onChange={(e) => setEditCarbs(e.target.value)}
                              placeholder="Carbs"
                              className="h-9"
                            />
                            <Input
                              type="number"
                              value={editFat}
                              onChange={(e) => setEditFat(e.target.value)}
                              placeholder="Fat"
                              className="h-9"
                            />
                            <Input
                              type="number"
                              step="0.1"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              placeholder="Quantity"
                              className="h-9"
                            />
                          </div>
                          <div className="flex space-x-2 pt-1">
                            <Button size="sm" onClick={() => handleSaveEdit(item.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                              <Check className="w-4 h-4 mr-1" /> Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                              <X className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Regular Row Display */
                        <>
                          <div>
                            <div className="font-semibold text-[#0f172a] text-base">
                              {item.foodName}
                              {item.quantity !== 1 && (
                                <span className="text-xs font-normal text-slate-400 ml-2">({item.quantity} portions)</span>
                              )}
                            </div>
                            <div className="flex space-x-3 text-xs text-slate-500 mt-1">
                              <span>P: {Math.round(item.protein * item.quantity)}g</span>
                              <span>C: {Math.round(item.carbs * item.quantity)}g</span>
                              <span>F: {Math.round(item.fat * item.quantity)}g</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <span className="font-bold text-[#0f172a] text-lg">{Math.round(item.calories * item.quantity)}</span>
                              <span className="text-xs text-slate-400 font-normal ml-1">kcal</span>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
          <div className="space-y-8">
            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
              <CardHeader className="bg-[#0f172a] text-white py-6">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Calorie Intake Progress</span>
                </CardTitle>
                <CardDescription className="text-indigo-200">Daily calorie summary metrics.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* SVG Progress Ring */}
                <div className="flex justify-center items-center py-4">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        className="stroke-slate-100 fill-none"
                        strokeWidth="12"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        className="stroke-[#0f172a] fill-none transition-all duration-1000 ease-out"
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-[#0f172a] tracking-tight">{Math.round(summary.totalCalories)}</span>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">/ {Math.round(summary.calorieGoal)} kcal</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Goal Limit</span>
                    <p className="text-xl font-extrabold text-[#0f172a] mt-1">{Math.round(summary.calorieGoal)} kcal</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Remaining</span>
                    <p className={`text-xl font-extrabold mt-1 ${summary.remaining > 0 ? "text-blue-600" : "text-red-500"}`}>
                      {Math.round(summary.remaining)} kcal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Macro Splits Card */}
            <Card className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Daily Macro Splits</CardTitle>
                <CardDescription>Track distribution of macronutrients.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {/* Protein Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Protein</span>
                    <span className="text-[#0f172a]">{Math.round(summary.totalProtein)}g ({Math.round(pPct)}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pPct || 0}%` }}></div>
                  </div>
                </div>

                {/* Carbohydrates Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Carbs</span>
                    <span className="text-[#0f172a]">{Math.round(summary.totalCarbs)}g ({Math.round(cPct)}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${cPct || 0}%` }}></div>
                  </div>
                </div>

                {/* Fats Bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Fats</span>
                    <span className="text-[#0f172a]">{Math.round(summary.totalFat)}g ({Math.round(fPct)}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${fPct || 0}%` }}></div>
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
