package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// DietPlan represents the complete weekly diet plan structure
type DietPlan struct {
	ID                  primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID              primitive.ObjectID `json:"user_id" bson:"user_id"`
	UserProfile         UserProfile        `json:"user_profile"`
	WeeklyGoals         []WeeklyGoal       `json:"weekly_goals"`
	DailyPlans          []DailyPlan        `json:"daily_plans"`
	SpecialConsiderations []string         `json:"special_considerations"`
	GeneratedAt         time.Time          `json:"generated_at"`
	Status              string             `json:"status" bson:"status"` // "active", "completed", "paused"
}

// UserProfile represents the user's health profile
type UserProfile struct {
	Name                string   `json:"name"`
	Age                 int      `json:"age"`
	Weight              float64  `json:"weight"`
	Height              float64  `json:"height"`
	BMI                 float64  `json:"bmi"`
	WorkoutFrequency    string   `json:"workout_frequency"`
	PrimaryGoal         string   `json:"primary_goal"`
	GoalPace            float64  `json:"goal_pace"`
	Timeline            string   `json:"timeline"`
	DietaryPreferences  []string `json:"dietary_preferences"`
	FoodAllergies       []string `json:"food_allergies"`
	NutritionPriorities []string `json:"nutrition_priorities"`
	CompletedGoals      []string `json:"completed_goals"`
	RemainingGoals      []string `json:"remaining_goals"`
	HealthStatus        string   `json:"health_status"`
}

// DailyPlan represents a complete day's plan
type DailyPlan struct {
	Day             string           `json:"day"` // "Monday", "Tuesday", etc.
	Date            string           `json:"date"`
	MealPlan        MealPlan         `json:"meal_plan"`
	Workout         Workout          `json:"workout"`
	HealthTasks     []HealthTask     `json:"health_tasks"`
	LifestyleTasks  []LifestyleTask  `json:"lifestyle_tasks"`
	ProgressTracking []ProgressMetric `json:"progress_tracking"`
}

// MealPlan represents the day's meal structure
type MealPlan struct {
	Breakfast      Meal   `json:"breakfast"`
	Lunch          Meal   `json:"lunch"`
	Dinner         Meal   `json:"dinner"`
	Snacks         []Meal `json:"snacks"`
	HydrationGoal  string `json:"hydration_goal"`
}

// Meal represents a single meal
type Meal struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Ingredients []string `json:"ingredients"`
	PortionSize string   `json:"portion_size"`
	Calories    int      `json:"calories"`
	Macros      Macros   `json:"macros"`
	PrepTime    string   `json:"prep_time"`
	Notes       string   `json:"notes,omitempty"`
}

// Macros represents macronutrient breakdown
type Macros struct {
	Protein float64 `json:"protein"`
	Carbs   float64 `json:"carbs"`
	Fat     float64 `json:"fat"`
	Fiber   float64 `json:"fiber"`
}

// Workout represents the day's exercise plan
type Workout struct {
	Type        string     `json:"type"` // "cardio", "strength", "flexibility", "rest"
	Duration    string     `json:"duration"`
	Intensity   string     `json:"intensity"` // "light", "moderate", "intense"
	Exercises   []Exercise `json:"exercises"`
	Notes       string     `json:"notes,omitempty"`
}

// Exercise represents a single exercise
type Exercise struct {
	Name         string `json:"name"`
	Sets         int    `json:"sets,omitempty"`
	Reps         int    `json:"reps,omitempty"`
	Duration     string `json:"duration,omitempty"`
	RestTime     string `json:"rest_time,omitempty"`
	Instructions string `json:"instructions"`
}

// HealthTask represents health-related tasks
type HealthTask struct {
	Category  string `json:"category"` // "hydration", "supplements", "health_checks"
	Task      string `json:"task"`
	Timing    string `json:"timing"`
	Frequency string `json:"frequency"`
	Notes     string `json:"notes,omitempty"`
}

// LifestyleTask represents lifestyle and habit tasks
type LifestyleTask struct {
	Category string `json:"category"` // "sleep", "stress", "habits"
	Task     string `json:"task"`
	Timing   string `json:"timing"`
	Duration string `json:"duration,omitempty"`
	Notes    string `json:"notes,omitempty"`
}

// ProgressMetric represents what to track daily
type ProgressMetric struct {
	Metric string `json:"metric"`
	Target string `json:"target"`
	Unit   string `json:"unit"`
	Method string `json:"method"` // "measure", "count", "log"
	Notes  string `json:"notes,omitempty"`
}

// DietPlanRequest represents the input for generating a diet plan
type DietPlanRequest struct {
	PlanType        string `json:"plan_type"` // "weight_loss", "muscle_gain", "diabetes_management", etc.
	Duration        int    `json:"duration"` // number of weeks
	IncludeWorkouts bool   `json:"include_workouts"`
	IncludeMealPrep bool   `json:"include_meal_prep"`
	// User profile will be fetched from database based on user ID
}

// DietPlanResponse represents the API response
type DietPlanResponse struct {
	Success bool      `json:"success"`
	Message string    `json:"message"`
	Data    *DietPlan `json:"data,omitempty"`
	Error   string    `json:"error,omitempty"`
}

// DietPlanSummary represents a summary of the diet plan
type DietPlanSummary struct {
	PlanID          string       `json:"plan_id"`
	UserID          string       `json:"user_id"`
	GeneratedAt     time.Time    `json:"generated_at"`
	Duration        int          `json:"duration"`
	PrimaryGoal     string       `json:"primary_goal"`
	WeeklyGoals     []WeeklyGoal `json:"weekly_goals"`
	AverageCalories int          `json:"average_calories"`
	WorkoutDays     int          `json:"workout_days"`
	Status          string       `json:"status"` // "active", "completed", "paused"
}

// DietPlanProgress represents user progress on the diet plan
type DietPlanProgress struct {
	PlanID          string                 `json:"plan_id"`
	UserID          string                 `json:"user_id"`
	CurrentDay      int                    `json:"current_day"`
	CompletedDays   int                    `json:"completed_days"`
	DailyProgress   map[string]DayProgress `json:"daily_progress"`
	WeeklyProgress  map[string]WeekProgress `json:"weekly_progress"`
	OverallProgress float64                `json:"overall_progress"`
	LastUpdated     time.Time              `json:"last_updated"`
}

// DayProgress represents progress for a specific day
type DayProgress struct {
	Date                    string `json:"date"`
	MealsCompleted          int    `json:"meals_completed"`
	WorkoutCompleted        bool   `json:"workout_completed"`
	HealthTasksCompleted    int    `json:"health_tasks_completed"`
	LifestyleTasksCompleted int    `json:"lifestyle_tasks_completed"`
	Notes                   string `json:"notes,omitempty"`
}

// WeekProgress represents progress for a specific week
type WeekProgress struct {
	WeekNumber      int     `json:"week_number"`
	GoalsCompleted  int     `json:"goals_completed"`
	TotalGoals      int     `json:"total_goals"`
	AverageCalories int     `json:"average_calories"`
	WorkoutDays     int     `json:"workout_days"`
	Notes           string  `json:"notes,omitempty"`
} 