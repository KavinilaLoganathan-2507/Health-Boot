package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// WeeklyTodo represents a complete weekly todo list
type WeeklyTodo struct {
	ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID          primitive.ObjectID `json:"user_id" bson:"user_id"`
	WeekStartDate   time.Time          `json:"week_start_date" bson:"week_start_date"`
	WeekEndDate     time.Time          `json:"week_end_date" bson:"week_end_date"`
	WeekNumber      int                `json:"week_number" bson:"week_number"`
	UserProfile     UserProfile        `json:"user_profile" bson:"user_profile"`
	WeeklyGoals     []WeeklyGoal       `json:"weekly_goals" bson:"weekly_goals"`
	DailyTodos      []DailyTodo        `json:"daily_todos" bson:"daily_todos"`
	GeneratedAt     time.Time          `json:"generated_at" bson:"generated_at"`
	Status          string             `json:"status" bson:"status"` // "active", "completed", "expired"
	CompletionRate  float64            `json:"completion_rate" bson:"completion_rate"`
	PreviousWeekID  *primitive.ObjectID `json:"previous_week_id,omitempty" bson:"previous_week_id,omitempty"`
}

// DailyTodo represents a single day's todo list
type DailyTodo struct {
	Day             string     `json:"day" bson:"day"` // "Monday", "Tuesday", etc.
	Date            time.Time  `json:"date" bson:"date"`
	MealTodos       []TodoItem `json:"meal_todos" bson:"meal_todos"`
	WorkoutTodos    []TodoItem `json:"workout_todos" bson:"workout_todos"`
	HealthTodos     []TodoItem `json:"health_todos" bson:"health_todos"`
	LifestyleTodos  []TodoItem `json:"lifestyle_todos" bson:"lifestyle_todos"`
	CompletedCount  int        `json:"completed_count" bson:"completed_count"`
	TotalCount      int        `json:"total_count" bson:"total_count"`
	CompletionRate  float64    `json:"completion_rate" bson:"completion_rate"`
}

// TodoItem represents a single actionable todo item
type TodoItem struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title       string             `json:"title" bson:"title"`
	Description string             `json:"description" bson:"description"`
	Category    string             `json:"category" bson:"category"` // "meal", "workout", "health", "lifestyle"
	Priority    string             `json:"priority" bson:"priority"` // "high", "medium", "low"
	Timing      string             `json:"timing" bson:"timing"`     // "morning", "afternoon", "evening", "anytime"
	IsCompleted bool               `json:"is_completed" bson:"is_completed"`
	CompletedAt *time.Time         `json:"completed_at,omitempty" bson:"completed_at,omitempty"`
	Notes       string             `json:"notes,omitempty" bson:"notes,omitempty"`
}

// WeeklyGoal represents a specific weekly target
type WeeklyGoal struct {
	Category    string `json:"category" bson:"category"` // "nutrition", "fitness", "lifestyle"
	Description string `json:"description" bson:"description"`
	Target      string `json:"target" bson:"target"`
	Measurable  bool   `json:"measurable" bson:"measurable"`
	Completed   bool   `json:"completed" bson:"completed"`
}

// WeeklyAnalysis represents the analysis of a completed week
type WeeklyAnalysis struct {
	WeekID           primitive.ObjectID `json:"week_id" bson:"week_id"`
	UserID           primitive.ObjectID `json:"user_id" bson:"user_id"`
	WeekNumber       int                `json:"week_number" bson:"week_number"`
	OverallCompletion float64           `json:"overall_completion" bson:"overall_completion"`
	CategoryStats    CategoryStats      `json:"category_stats" bson:"category_stats"`
	GoalProgress     []GoalProgress     `json:"goal_progress" bson:"goal_progress"`
	Recommendations  []string           `json:"recommendations" bson:"recommendations"`
	GeneratedAt      time.Time          `json:"generated_at" bson:"generated_at"`
}

// CategoryStats represents completion statistics by category
type CategoryStats struct {
	Meal       CategoryStat `json:"meal" bson:"meal"`
	Workout    CategoryStat `json:"workout" bson:"workout"`
	Health     CategoryStat `json:"health" bson:"health"`
	Lifestyle  CategoryStat `json:"lifestyle" bson:"lifestyle"`
}

// CategoryStat represents statistics for a specific category
type CategoryStat struct {
	Completed  int     `json:"completed" bson:"completed"`
	Total      int     `json:"total" bson:"total"`
	Percentage float64 `json:"percentage" bson:"percentage"`
}

// GoalProgress represents progress towards weekly goals
type GoalProgress struct {
	Goal       WeeklyGoal `json:"goal" bson:"goal"`
	Progress   float64    `json:"progress" bson:"progress"` // 0.0 to 1.0
	Status     string     `json:"status" bson:"status"`     // "not_started", "in_progress", "completed"
	Notes      string     `json:"notes,omitempty" bson:"notes,omitempty"`
}

// WeeklyTodoRequest represents the request to generate a new weekly todo
type WeeklyTodoRequest struct {
	GenerateNewWeek bool `json:"generate_new_week"` // true if generating next week, false for current week
}

// WeeklyTodoResponse represents the API response
type WeeklyTodoResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    *WeeklyTodo `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// TodoUpdateRequest represents the request to update a todo item
type TodoUpdateRequest struct {
	IsCompleted bool   `json:"is_completed"`
	Notes       string `json:"notes,omitempty"`
}

// WeeklyAnalysisResponse represents the API response for weekly analysis
type WeeklyAnalysisResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message"`
	Data    *WeeklyAnalysis `json:"data,omitempty"`
	Error   string          `json:"error,omitempty"`
} 