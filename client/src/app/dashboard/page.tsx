"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  QrCode,
  Loader2,
  CheckCircle,
  ListTodo,
  Home,
  Utensils,
  User,
  History,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SERVER_URL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Leaf, AlertCircle } from "lucide-react";

// Define types for the API responses
interface TodoItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  timing: string;
  is_completed: boolean;
}

interface DailyTodo {
  day: string;
  date: string;
  meal_todos: TodoItem[];
  workout_todos: TodoItem[];
  health_todos: TodoItem[];
  lifestyle_todos: TodoItem[];
  completed_count: number;
  total_count: number;
  completion_rate: number;
}

interface WeeklyGoal {
  category: string;
  description: string;
  target: string;
  measurable: boolean;
  completed: boolean;
}

interface WeeklyTodoResponse {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  week_number: number;
  weekly_goals: WeeklyGoal[];
  daily_todos: DailyTodo[];
  status: string;
  completion_rate: number;
}

interface NutritionFeedback {
  count: number;
  message: string;
  priority: string;
  type: string;
}

interface NutritionDetailsResponse {
  success: boolean;
  message: string;
  data: {
    feedback: NutritionFeedback[];
    nutritionPriorities: string[];
    nutritionalStatus: Record<string, unknown>;
  };
  timestamp: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingTodos, setGeneratingTodos] = useState(false);
  const [weeklyData, setWeeklyData] = useState<WeeklyTodoResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(3);
  const [days, setDays] = useState([
    { day: "Sun", date: "11" },
    { day: "Mon", date: "12" },
    { day: "Tue", date: "13" },
    { day: "Wed", date: "14", active: true },
    { day: "Thu", date: "15" },
    { day: "Fri", date: "16" },
    { day: "Sat", date: "17" },
  ]);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [nutritionDetails, setNutritionDetails] =
    useState<NutritionDetailsResponse | null>(null);
  const [loadingNutrition, setLoadingNutrition] = useState<boolean>(false);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const cardVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.2 },
    },
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    return (
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    );
  };

  // Generate todos for the week
  const generateWeeklyTodos = async () => {
    setGeneratingTodos(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${SERVER_URL}/api/weekly-todos/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ generate_new_week: false }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Weekly todos generated successfully");
        fetchCurrentWeekTodos();
      } else {
        toast.error(data.message || "Failed to generate todos");
      }
    } catch (error) {
      console.error("Error generating todos:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setGeneratingTodos(false);
    }
  };

  // Fetch current week todos
  const fetchCurrentWeekTodos = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${SERVER_URL}/api/weekly-todos/current`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setWeeklyData(data.data);

        // Update calendar days from API data
        if (data.data.daily_todos && data.data.daily_todos.length > 0) {
          const apiDays = data.data.daily_todos.map(
            (todo: DailyTodo, index: number) => {
              const date = new Date(todo.date);
              return {
                day: todo.day.substring(0, 3),
                date: date.getDate().toString(),
                active: index === selectedDay,
              };
            }
          );
          setDays(apiDays);
        }
      } else {
        console.error("Failed to fetch todos:", data.message);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  // Toggle completion status of a todo item
  const toggleTodoCompletion = async (todoId: string, isCompleted: boolean) => {
    try {
      const token = getAuthToken();
      if (!weeklyData) return;

      const response = await fetch(
        `${SERVER_URL}/api/weekly-todos/${weeklyData.id}/items/${todoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_completed: isCompleted,
            notes: isCompleted ? "Completed!" : "",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchCurrentWeekTodos();
        toast.success(
          isCompleted ? "Task marked as complete!" : "Task marked as incomplete"
        );
      } else {
        toast.error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Select a day in the calendar
  const selectDay = (index: number) => {
    setSelectedDay(index);
    setDays((prevDays) =>
      prevDays.map((day, i) => ({
        ...day,
        active: i === index,
      }))
    );
  };

  // Navigate to scan page
  const handleScan = () => {
    router.push("/scan");
  };

  // Fetch nutrition details
  const fetchNutritionDetails = useCallback(async () => {
    setLoadingNutrition(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${SERVER_URL}/api/user/nutrition-details`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setNutritionDetails(data);
      } else {
        console.error("Failed to fetch nutrition details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching nutrition details:", error);
    } finally {
      setLoadingNutrition(false);
    }
  }, []);

  // Initialize dashboard on load
  useEffect(() => {
    fetchCurrentWeekTodos();
  }, [fetchCurrentWeekTodos]);

  // Get todos for selected day
  const getSelectedDayTodos = () => {
    if (
      !weeklyData ||
      !weeklyData.daily_todos ||
      weeklyData.daily_todos.length === 0
    ) {
      return null;
    }

    return weeklyData.daily_todos[selectedDay];
  };

  const selectedDayTodos = getSelectedDayTodos();

  // Get all todos for selected day as a flat array
  const getTodosForSelectedDay = () => {
    if (!selectedDayTodos) return [];

    const todos = [
      ...(selectedDayTodos.meal_todos || []),
      ...(selectedDayTodos.workout_todos || []),
      ...(selectedDayTodos.health_todos || []),
      ...(selectedDayTodos.lifestyle_todos || []),
    ];

    return todos;
  };

  // Check if we have data to show
  const hasData =
    weeklyData && weeklyData.daily_todos && weeklyData.daily_todos.length > 0;

  // Fetch nutrition details when data is available
  useEffect(() => {
    if (hasData) {
      fetchNutritionDetails();
    }
  }, [hasData, fetchNutritionDetails]);

  return (
    <div className="min-h-screen bg-[#F5F3F0] flex flex-col items-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

      <motion.div
        className="relative w-full max-w-xl"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        {/* Header */}

        {/* Generate Todos Button (shown only if no data) */}
        {!hasData && !loading && (
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            className="w-full"
          >
            <Card className="bg-[#F0EDE4] border-[#004743] border-2 overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#004743] to-[#009688]"></div>
              <CardContent className="p-8 text-center">
                <motion.div
                  className="flex justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 bg-[#004743]/10 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <div className="w-20 h-20 bg-[#004743] rounded-full flex items-center justify-center relative z-10">
                      <ListTodo className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </motion.div>
                <motion.h3
                  className="text-xl font-semibold text-[#004743] mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Get Your Personalized Health Plan
                </motion.h3>
                <motion.p
                  className="text-gray-600 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Generate customized health tasks based on your profile and
                  preferences
                </motion.p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={generateWeeklyTodos}
                    disabled={generatingTodos}
                    className="w-full bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {generatingTodos ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Your Plan...
                      </>
                    ) : (
                      "Generate My Weekly Plan"
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <Loader2 className="h-12 w-12 animate-spin text-[#004743] mb-4" />
            <p className="text-[#004743] font-medium">
              Loading your health plan...
            </p>
          </motion.div>
        )}

        {/* Content (shown only if data is available) */}
        {hasData && !loading && (
          <Card className="bg-[#F0EDE4] border-[#004743] border-2 shadow-xl">
            <CardContent className="p-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 text-center -mt-5"
              >
                <h1 className="text-2xl font-bold text-[#004743]">
                  Your Health Dashboard
                </h1>
                <p className="text-gray-600">
                  Track your personalized health journey
                </p>
              </motion.div>
              {/* Calendar */}
              <motion.div
                className="mb-6"
                variants={cardVariants}
                initial="initial"
                animate="animate"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-5 h-5 text-[#004743]" />
                  <h3 className="font-semibold text-[#004743] text-xl">
                    Select Date
                  </h3>
                </div>
                <div className="flex justify-between items-center bg-in p-3 rounded-lg">
                  {days.map((day, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      custom={index}
                      variants={itemVariants}
                      initial="initial"
                      animate="animate"
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-16 h-18 p-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                          day.active
                            ? "bg-white border-2 border-black text-[#004743] shadow-md"
                            : "text-gray-700 hover:bg-[#004743]/10"
                        }`}
                        onClick={() => selectDay(index)}
                      >
                        <span
                          className={`text-xl ${
                            day.active
                              ? "text-[#004743] font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {day.day}
                        </span>
                        <span className="text-lg font-medium mt-1">
                          {day.date}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Today's Tasks */}
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#004743]" />
                    <h3 className="font-semibold text-xl text-[#004743]">
                      Today&apos;s Tasks
                    </h3>
                  </div>
                </div>

                <div className="bg-[#FFFDF3] rounded-lg p-4">
                  {selectedDayTodos && getTodosForSelectedDay().length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {getTodosForSelectedDay()
                          .slice(
                            0,
                            showAllTasks ? getTodosForSelectedDay().length : 3
                          )
                          .map((todo, index) => (
                            <motion.div
                              key={todo.id}
                              className="flex items-start rounded-sm px-3 py-3 bg-[#F0EDE4] gap-3 pb-3 border-b border-gray-100 last:border-0"
                              custom={index}
                              variants={itemVariants}
                              initial="initial"
                              animate="animate"
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 cursor-pointer transition-all ${
                                  todo.is_completed
                                    ? "bg-[#004743] border-[#004743]"
                                    : "border-gray-300 bg-white hover:border-[#004743]/50"
                                }`}
                                onClick={() =>
                                  toggleTodoCompletion(
                                    todo.id,
                                    !todo.is_completed
                                  )
                                }
                              >
                                {todo.is_completed && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-lg font-medium ${
                                    todo.is_completed
                                      ? "text-gray-400 line-through"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {todo.title}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {todo.description}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </div>

                      {getTodosForSelectedDay().length > 3 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex justify-center pt-3"
                        >
                          <Button
                            variant="ghost"
                            onClick={() => setShowAllTasks(!showAllTasks)}
                            className="text-[#004743] hover:bg-[#004743]/10 text-sm"
                          >
                            {showAllTasks
                              ? "Show Less"
                              : `View ${
                                  getTodosForSelectedDay().length - 3
                                } More Tasks`}
                          </Button>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-gray-500 text-center py-8"
                    >
                      No tasks for this day
                    </motion.p>
                  )}
                </div>
              </motion.div>
              {/* Nutrition Insights Section */}
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <Leaf className="w-5 h-5 text-[#004743]" />
                    <h3 className="font-semibold text-xl text-[#004743]">
                      Nutrition Insights
                    </h3>
                  </div>
                </div>

                <div className="bg-[#FFFDF3] rounded-lg p-4">
                  {loadingNutrition ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-[#004743] mb-2" />
                      <p className="text-[#004743] text-sm">
                        Loading nutrition details...
                      </p>
                    </div>
                  ) : nutritionDetails ? (
                    <>
                      {/* Priorities */}
                      {nutritionDetails.data.nutritionPriorities &&
                        nutritionDetails.data.nutritionPriorities.length >
                          0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-[#004743]/80 mb-2">
                              Your Nutrition Priorities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {nutritionDetails.data.nutritionPriorities.map(
                                (priority, index) => (
                                  <Badge
                                    key={index}
                                    className="bg-[#004743]/10 text-[#004743] border-none"
                                  >
                                    {priority}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Feedback Messages */}
                      <div className="space-y-4">
                        {nutritionDetails.data.feedback.map(
                          (feedback, index) => (
                            <motion.div
                              key={index}
                              className={`flex items-start rounded-sm px-3 py-3 bg-[#F0EDE4] gap-3 pb-3 border-b border-gray-100 last:border-0`}
                              custom={index}
                              variants={itemVariants}
                              initial="initial"
                              animate="animate"
                            >
                              <div className="flex-shrink-0 mt-1">
                                {feedback.type === "positive" ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-amber-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-sm font-medium text-[#004743]">
                                    {feedback.priority}
                                  </p>
                                  {feedback.count > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {feedback.count} items
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {feedback.message}
                                </p>
                              </div>
                            </motion.div>
                          )
                        )}

                        {nutritionDetails.data.feedback.length === 0 && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-gray-500 text-center py-6"
                          >
                            No nutrition feedback available yet. Try scanning
                            more food items!
                          </motion.p>
                        )}
                      </div>
                    </>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-gray-500 text-center py-6"
                    >
                      Unable to load nutrition details
                    </motion.p>
                  )}
                </div>
              </motion.div>
              {/* Scan Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 flex items-center justify-center"
              >
                <Button
                  onClick={handleScan}
                  className="w-56 h-11 bg-[#004743] hover:bg-[#004743] text-white rounded-md border-[1.5px] border-[#598582] shadow-[0px_3px_0px_0px_#4B7D7A] flex items-center justify-center gap-2.5 px-4 py-2 flex-shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  Scan Barcode
                </Button>
              </motion.div>
            </CardContent>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg -mb-6 rounded-b-2xl"
            >
              <div className="flex justify-around items-center  max-w-md mx-auto">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  custom={0}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  className="flex flex-col items-center p-2 cursor-pointer"
                  onClick={() => router.push("/dashboard")}
                >
                  <div className="w-10 h-10 rounded-full bg-[#004743]/10 flex items-center justify-center">
                    <Home className="w-5 h-5 text-[#004743]" />
                  </div>
                  <span className="text-xs mt-1 font-medium text-[#004743]">
                    Home
                  </span>
                </motion.div>

                <motion.div
                  whileTap={{ scale: 0.9 }}
                  custom={1}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  className="flex flex-col items-center p-2 cursor-pointer"
                  onClick={() => router.push("/streaming")}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="text-xs mt-1 text-gray-500">Meal Plan</span>
                </motion.div>

                <motion.div
                  whileTap={{ scale: 0.9 }}
                  custom={2}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  className="flex flex-col items-center p-2 cursor-pointer"
                  onClick={() => router.push("/history")}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <History className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="text-xs mt-1 text-gray-500">History</span>
                </motion.div>

                <motion.div
                  whileTap={{ scale: 0.9 }}
                  custom={3}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  className="flex flex-col items-center p-2 cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="text-xs mt-1 text-gray-500">Profile</span>
                </motion.div>
              </div>
            </motion.div>
          </Card>
        )}
      </motion.div>
      <div className="h-28"></div>
    </div>
  );
}
