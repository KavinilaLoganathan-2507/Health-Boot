package services

import (
	"amobagan/lib"
	"amobagan/models"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/genai"
)

type WeeklyTodoService struct {
	client *genai.Client
	db     *mongo.Database
}

func NewWeeklyTodoService() (*WeeklyTodoService, error) {
	client, err := lib.GetGeminiClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %v", err)
	}

	// Use the correct database access pattern
	db := lib.DB.Database("amobagan")

	return &WeeklyTodoService{
		client: client,
		db:     db,
	}, nil
}

// GenerateWeeklyTodo creates a personalized weekly todo list
func (s *WeeklyTodoService) GenerateWeeklyTodo(userID string, generateNewWeek bool) (*models.WeeklyTodo, error) {
	// Get user data from database
	user, err := GetUserByID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user data: %v", err)
	}

	// Convert user data to UserProfile
	userProfile, err := s.convertUserToProfile(user)
	if err != nil {
		return nil, fmt.Errorf("failed to convert user data: %v", err)
	}

	// Get previous week's data if generating new week
	var previousWeek *models.WeeklyTodo
	if generateNewWeek {
		previousWeek, err = s.getCurrentWeekTodo(userID)
		if err != nil && err != mongo.ErrNoDocuments {
			return nil, fmt.Errorf("failed to get previous week data: %v", err)
		}
	}

	// Read prompt template
	promptTemplate, err := s.readPromptTemplate()
	if err != nil {
		return nil, fmt.Errorf("failed to read prompt template: %v", err)
	}

	// Create the prompt for weekly todo list
	prompt := s.createWeeklyTodoPrompt(userProfile, promptTemplate, previousWeek)

	// Create JSON schema for structured output
	schema := s.createWeeklyTodoSchema()

	// Generate content with structured output
	response, err := s.client.Models.GenerateContent(
		context.Background(),
		lib.GEMINI_MODEL,
		genai.Text(prompt),
		&genai.GenerateContentConfig{
			ResponseMIMEType: "application/json",
			ResponseSchema:   schema,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate weekly todo: %v", err)
	}

	// Parse the structured response
	var weeklyTodo models.WeeklyTodo
	if err := json.Unmarshal([]byte(response.Text()), &weeklyTodo); err != nil {
		return nil, fmt.Errorf("failed to parse weekly todo response: %v", err)
	}

	// Set additional fields
	weeklyTodo.GeneratedAt = time.Now()
	weeklyTodo.Status = "active"
	
	// Set user ID
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}
	weeklyTodo.UserID = userObjectID

	// Set week dates and number
	s.setWeekDates(&weeklyTodo, generateNewWeek)

	// Set previous week ID if generating new week
	if generateNewWeek && previousWeek != nil {
		weeklyTodo.PreviousWeekID = &previousWeek.ID
	}

	// Initialize completion rates
	s.initializeCompletionRates(&weeklyTodo)

	// Validate the weekly todo
	if err := s.validateWeeklyTodo(&weeklyTodo); err != nil {
		return nil, fmt.Errorf("weekly todo validation failed: %v", err)
	}

	return &weeklyTodo, nil
}

// convertUserToProfile converts User model to UserProfile
func (s *WeeklyTodoService) convertUserToProfile(user *models.User) (*models.UserProfile, error) {
	// Parse age
	age, err := strconv.Atoi(user.Age)
	if err != nil {
		return nil, fmt.Errorf("invalid age format: %v", err)
	}

	// Parse weight
	weight, err := strconv.ParseFloat(user.Weight, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid weight format: %v", err)
	}

	// Parse height
	height, err := strconv.ParseFloat(user.Height, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid height format: %v", err)
	}

	// Calculate BMI
	bmi := s.calculateBMI(weight, height)

	// Determine primary goal from health goals
	primaryGoal := s.determinePrimaryGoal(user.HealthGoals)

	// Map workout frequency
	workoutFrequency := s.mapWorkoutFrequency(user.WorkOutsPerWeek)

	// Set default values for missing fields
	goalPace := 0.5 // Default goal pace
	timeline := "12 weeks" // Default timeline
	foodAllergies := []string{} // Default empty allergies
	completedGoals := []string{} // Default empty completed goals
	remainingGoals := []string{} // Default empty remaining goals

	userProfile := &models.UserProfile{
		Name:                user.FullName,
		Age:                 age,
		Weight:              weight,
		Height:              height,
		BMI:                 bmi,
		WorkoutFrequency:    workoutFrequency,
		PrimaryGoal:         primaryGoal,
		GoalPace:            goalPace,
		Timeline:            timeline,
		DietaryPreferences:  user.DietaryPreferences,
		FoodAllergies:       foodAllergies,
		NutritionPriorities: user.NutritionPriorities,
		CompletedGoals:      completedGoals,
		RemainingGoals:      remainingGoals,
		HealthStatus:        user.HealthStatus,
	}

	return userProfile, nil
}

// determinePrimaryGoal determines the primary goal from health goals
func (s *WeeklyTodoService) determinePrimaryGoal(healthGoals []string) string {
	if len(healthGoals) == 0 {
		return "general_wellness"
	}

	// Priority order for goals
	goalPriority := map[string]int{
		"diabetes":        1,
		"weight_loss":     2,
		"muscle_gain":     3,
		"heart_health":    4,
		"general_wellness": 5,
	}

	highestPriority := 999
	primaryGoal := "general_wellness"

	for _, goal := range healthGoals {
		if priority, exists := goalPriority[goal]; exists && priority < highestPriority {
			highestPriority = priority
			primaryGoal = goal
		}
	}

	return primaryGoal
}

// mapWorkoutFrequency maps workout frequency to descriptive string
func (s *WeeklyTodoService) mapWorkoutFrequency(workoutsPerWeek string) string {
	switch workoutsPerWeek {
	case "0-2":
		return "1-2 light workouts"
	case "3-5":
		return "3-5 moderate workouts"
	case "6+":
		return "6+ intense workouts"
	default:
		return "1-2 light workouts"
	}
}

// readPromptTemplate reads the weekly todo prompt template
func (s *WeeklyTodoService) readPromptTemplate() (string, error) {
	content, err := ioutil.ReadFile("llm_context/diet_plan.txt")
	if err != nil {
		return "", fmt.Errorf("failed to read weekly todo template: %v", err)
	}
	return string(content), nil
}

// createWeeklyTodoPrompt creates the prompt for generating weekly todos
func (s *WeeklyTodoService) createWeeklyTodoPrompt(userProfile *models.UserProfile, template string, previousWeek *models.WeeklyTodo) string {
	// Replace template variables with actual user data
	prompt := template

	// Basic variable substitution
	prompt = s.replaceVariable(prompt, "{user_name}", userProfile.Name)
	prompt = s.replaceVariable(prompt, "{age}", strconv.Itoa(userProfile.Age))
	prompt = s.replaceVariable(prompt, "{weight}", fmt.Sprintf("%.1f", userProfile.Weight))
	prompt = s.replaceVariable(prompt, "{height}", fmt.Sprintf("%.1f", userProfile.Height))
	prompt = s.replaceVariable(prompt, "{calculated_bmi}", fmt.Sprintf("%.1f", userProfile.BMI))
	prompt = s.replaceVariable(prompt, "{workout_frequency}", userProfile.WorkoutFrequency)
	prompt = s.replaceVariable(prompt, "{primary_goal}", userProfile.PrimaryGoal)
	prompt = s.replaceVariable(prompt, "{health_status}", userProfile.HealthStatus)
	prompt = s.replaceVariable(prompt, "{dietary_preferences}", s.arrayToString(userProfile.DietaryPreferences))
	prompt = s.replaceVariable(prompt, "{nutrition_priorities}", s.arrayToString(userProfile.NutritionPriorities))

	// Add previous week context if generating new week
	if previousWeek != nil {
		prompt += "\n\n## Previous Week Performance:\n"
		prompt += fmt.Sprintf("- Overall Completion Rate: %.1f%%\n", previousWeek.CompletionRate*100)
		prompt += fmt.Sprintf("- Week Number: %d\n", previousWeek.WeekNumber)
		prompt += fmt.Sprintf("- Status: %s\n", previousWeek.Status)
		prompt += "\nConsider the previous week's performance when creating the new week's todos. Adjust difficulty and focus areas based on completion rates."
	}

	return prompt
}

// createWeeklyTodoSchema creates the JSON schema for structured output
func (s *WeeklyTodoService) createWeeklyTodoSchema() *genai.Schema {
	return &genai.Schema{
		Type: "object",
		Properties: map[string]*genai.Schema{
			"weekly_goals": {
				Type: "array",
				Items: &genai.Schema{
					Type: "object",
					Properties: map[string]*genai.Schema{
						"category":    {Type: "string"},
						"description": {Type: "string"},
						"target":      {Type: "string"},
						"measurable":  {Type: "boolean"},
						"completed":   {Type: "boolean"},
					},
					Required: []string{"category", "description", "target", "measurable"},
				},
			},
			"daily_todos": {
				Type: "array",
				Items: &genai.Schema{
					Type: "object",
					Properties: map[string]*genai.Schema{
						"day": {
							Type: "string",
						},
						"date": {
							Type: "string",
						},
						"meal_todos": {
							Type: "array",
							Items: s.createTodoItemSchema(),
						},
						"workout_todos": {
							Type: "array",
							Items: s.createTodoItemSchema(),
						},
						"health_todos": {
							Type: "array",
							Items: s.createTodoItemSchema(),
						},
						"lifestyle_todos": {
							Type: "array",
							Items: s.createTodoItemSchema(),
						},
					},
					Required: []string{"day", "meal_todos", "workout_todos", "health_todos", "lifestyle_todos"},
				},
			},
		},
		Required: []string{"weekly_goals", "daily_todos"},
	}
}

// createTodoItemSchema creates the JSON schema for todo items
func (s *WeeklyTodoService) createTodoItemSchema() *genai.Schema {
	return &genai.Schema{
		Type: "object",
		Properties: map[string]*genai.Schema{
			"title":       {Type: "string"},
			"description": {Type: "string"},
			"category":    {Type: "string"},
			"priority":    {Type: "string"},
			"timing":      {Type: "string"},
		},
		Required: []string{"title", "description", "category", "priority", "timing"},
	}
}

// setWeekDates sets the week start/end dates and week number
func (s *WeeklyTodoService) setWeekDates(weeklyTodo *models.WeeklyTodo, generateNewWeek bool) {
	now := time.Now()
	
	if generateNewWeek {
		// Start from next Monday
		daysUntilMonday := (8 - int(now.Weekday())) % 7
		if daysUntilMonday == 0 {
			daysUntilMonday = 7
		}
		weeklyTodo.WeekStartDate = now.AddDate(0, 0, daysUntilMonday)
	} else {
		// Start from current Monday
		daysSinceMonday := int(now.Weekday()) - 1
		if daysSinceMonday < 0 {
			daysSinceMonday = 6
		}
		weeklyTodo.WeekStartDate = now.AddDate(0, 0, -daysSinceMonday)
	}
	
	weeklyTodo.WeekEndDate = weeklyTodo.WeekStartDate.AddDate(0, 0, 6)
	
	// Calculate week number (weeks since epoch)
	epoch := time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
	weeks := int(weeklyTodo.WeekStartDate.Sub(epoch).Hours() / 24 / 7)
	weeklyTodo.WeekNumber = weeks
}

// initializeCompletionRates initializes completion rates for all todos
func (s *WeeklyTodoService) initializeCompletionRates(weeklyTodo *models.WeeklyTodo) {
	for i := range weeklyTodo.DailyTodos {
		daily := &weeklyTodo.DailyTodos[i]
		
		// Set dates for each day
		daily.Date = weeklyTodo.WeekStartDate.AddDate(0, 0, i)
		
		// Initialize completion counts
		daily.TotalCount = len(daily.MealTodos) + len(daily.WorkoutTodos) + len(daily.HealthTodos) + len(daily.LifestyleTodos)
		daily.CompletedCount = 0
		daily.CompletionRate = 0.0
		
		// Initialize todo items with IDs
		s.initializeTodoItems(&daily.MealTodos)
		s.initializeTodoItems(&daily.WorkoutTodos)
		s.initializeTodoItems(&daily.HealthTodos)
		s.initializeTodoItems(&daily.LifestyleTodos)
	}
	
	weeklyTodo.CompletionRate = 0.0
}

// initializeTodoItems initializes todo items with IDs and default values
func (s *WeeklyTodoService) initializeTodoItems(todos *[]models.TodoItem) {
	for i := range *todos {
		(*todos)[i].ID = primitive.NewObjectID()
		(*todos)[i].IsCompleted = false
		(*todos)[i].CompletedAt = nil
	}
}

// calculateBMI calculates BMI from weight and height
func (s *WeeklyTodoService) calculateBMI(weight, height float64) float64 {
	heightInMeters := height / 100
	return weight / (heightInMeters * heightInMeters)
}

// validateWeeklyTodo validates the generated weekly todo
func (s *WeeklyTodoService) validateWeeklyTodo(weeklyTodo *models.WeeklyTodo) error {
	if len(weeklyTodo.WeeklyGoals) == 0 {
		return fmt.Errorf("weekly goals cannot be empty")
	}
	
	if len(weeklyTodo.DailyTodos) != 7 {
		return fmt.Errorf("must have exactly 7 daily todos")
	}
	
	for i, daily := range weeklyTodo.DailyTodos {
		if err := s.validateDailyTodo(&daily, i+1); err != nil {
			return fmt.Errorf("day %d validation failed: %v", i+1, err)
		}
	}
	
	return nil
}

// validateDailyTodo validates a single day's todos
func (s *WeeklyTodoService) validateDailyTodo(daily *models.DailyTodo, dayNumber int) error {
	if daily.Day == "" {
		return fmt.Errorf("day name is required")
	}
	
	if len(daily.MealTodos) != 1 {
		return fmt.Errorf("must have exactly 1 meal todo per day")
	}
	
	if len(daily.WorkoutTodos) != 1 {
		return fmt.Errorf("must have exactly 1 workout todo per day")
	}
	
	if len(daily.HealthTodos) != 1 {
		return fmt.Errorf("must have exactly 1 health todo per day")
	}
	
	if len(daily.LifestyleTodos) != 1 {
		return fmt.Errorf("must have exactly 1 lifestyle todo per day")
	}
	
	return nil
}

// SaveWeeklyTodo saves a weekly todo to the database
func (s *WeeklyTodoService) SaveWeeklyTodo(weeklyTodo *models.WeeklyTodo) error {
	collection := s.db.Collection("weekly_todos")
	
	// If generating new week, mark current week as completed
	if weeklyTodo.PreviousWeekID != nil {
		_, err := collection.UpdateOne(
			context.Background(),
			bson.M{"_id": *weeklyTodo.PreviousWeekID},
			bson.M{"$set": bson.M{"status": "completed"}},
		)
		if err != nil {
			return fmt.Errorf("failed to update previous week status: %v", err)
		}
	}
	
	_, err := collection.InsertOne(context.Background(), weeklyTodo)
	if err != nil {
		return fmt.Errorf("failed to save weekly todo: %v", err)
	}
	
	return nil
}

// GetWeeklyTodo retrieves a specific weekly todo
func (s *WeeklyTodoService) GetWeeklyTodo(todoID string) (*models.WeeklyTodo, error) {
	collection := s.db.Collection("weekly_todos")
	
	objectID, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		return nil, fmt.Errorf("invalid todo ID: %v", err)
	}
	
	var weeklyTodo models.WeeklyTodo
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&weeklyTodo)
	if err != nil {
		return nil, fmt.Errorf("weekly todo not found: %v", err)
	}
	
	return &weeklyTodo, nil
}

// GetUserWeeklyTodos retrieves all weekly todos for a user
func (s *WeeklyTodoService) GetUserWeeklyTodos(userID string) ([]models.WeeklyTodo, error) {
	collection := s.db.Collection("weekly_todos")
	
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}
	
	cursor, err := collection.Find(context.Background(), bson.M{"user_id": objectID})
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve weekly todos: %v", err)
	}
	defer cursor.Close(context.Background())
	
	var weeklyTodos []models.WeeklyTodo
	if err = cursor.All(context.Background(), &weeklyTodos); err != nil {
		return nil, fmt.Errorf("failed to decode weekly todos: %v", err)
	}
	
	return weeklyTodos, nil
}

// GetCurrentWeekTodo gets the current active week todo for a user
func (s *WeeklyTodoService) GetCurrentWeekTodo(userID string) (*models.WeeklyTodo, error) {
	collection := s.db.Collection("weekly_todos")
	
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}
	
	var weeklyTodo models.WeeklyTodo
	err = collection.FindOne(
		context.Background(),
		bson.M{"user_id": objectID, "status": "active"},
	).Decode(&weeklyTodo)
	
	if err != nil {
		return nil, err
	}
	
	return &weeklyTodo, nil
}

// getCurrentWeekTodo is an alias for GetCurrentWeekTodo (used internally)
func (s *WeeklyTodoService) getCurrentWeekTodo(userID string) (*models.WeeklyTodo, error) {
	return s.GetCurrentWeekTodo(userID)
}

// UpdateTodoItem updates a specific todo item
func (s *WeeklyTodoService) UpdateTodoItem(todoID, itemID string, update models.TodoUpdateRequest) error {
	// Get the current weekly todo
	weeklyTodo, err := s.GetWeeklyTodo(todoID)
	if err != nil {
		return fmt.Errorf("failed to get weekly todo: %v", err)
	}
	
	itemObjectID, err := primitive.ObjectIDFromHex(itemID)
	if err != nil {
		return fmt.Errorf("invalid item ID: %v", err)
	}
	
	// Find and update the specific todo item
	found := false
	for i := range weeklyTodo.DailyTodos {
		daily := &weeklyTodo.DailyTodos[i]
		
		// Check meal todos
		for j := range daily.MealTodos {
			if daily.MealTodos[j].ID == itemObjectID {
				daily.MealTodos[j].IsCompleted = update.IsCompleted
				daily.MealTodos[j].Notes = update.Notes
				if update.IsCompleted {
					now := time.Now()
					daily.MealTodos[j].CompletedAt = &now
				} else {
					daily.MealTodos[j].CompletedAt = nil
				}
				found = true
				break
			}
		}
		
		// Check workout todos
		for j := range daily.WorkoutTodos {
			if daily.WorkoutTodos[j].ID == itemObjectID {
				daily.WorkoutTodos[j].IsCompleted = update.IsCompleted
				daily.WorkoutTodos[j].Notes = update.Notes
				if update.IsCompleted {
					now := time.Now()
					daily.WorkoutTodos[j].CompletedAt = &now
				} else {
					daily.WorkoutTodos[j].CompletedAt = nil
				}
				found = true
				break
			}
		}
		
		// Check health todos
		for j := range daily.HealthTodos {
			if daily.HealthTodos[j].ID == itemObjectID {
				daily.HealthTodos[j].IsCompleted = update.IsCompleted
				daily.HealthTodos[j].Notes = update.Notes
				if update.IsCompleted {
					now := time.Now()
					daily.HealthTodos[j].CompletedAt = &now
				} else {
					daily.HealthTodos[j].CompletedAt = nil
				}
				found = true
				break
			}
		}
		
		// Check lifestyle todos
		for j := range daily.LifestyleTodos {
			if daily.LifestyleTodos[j].ID == itemObjectID {
				daily.LifestyleTodos[j].IsCompleted = update.IsCompleted
				daily.LifestyleTodos[j].Notes = update.Notes
				if update.IsCompleted {
					now := time.Now()
					daily.LifestyleTodos[j].CompletedAt = &now
				} else {
					daily.LifestyleTodos[j].CompletedAt = nil
				}
				found = true
				break
			}
		}
		
		if found {
			break
		}
	}
	
	if !found {
		return fmt.Errorf("todo item not found")
	}
	
	// Update completion rates
	s.updateCompletionRatesInMemory(weeklyTodo)
	
	// Save the updated weekly todo
	collection := s.db.Collection("weekly_todos")
	_, err = collection.ReplaceOne(
		context.Background(),
		bson.M{"_id": weeklyTodo.ID},
		weeklyTodo,
	)
	
	if err != nil {
		return fmt.Errorf("failed to update weekly todo: %v", err)
	}
	
	return nil
}

// updateCompletionRatesInMemory updates completion rates without database calls
func (s *WeeklyTodoService) updateCompletionRatesInMemory(weeklyTodo *models.WeeklyTodo) {
	totalCompleted := 0
	totalItems := 0
	
	for i := range weeklyTodo.DailyTodos {
		daily := &weeklyTodo.DailyTodos[i]
		dailyCompleted := 0
		
		// Count completed items in each category
		for _, item := range daily.MealTodos {
			if item.IsCompleted {
				dailyCompleted++
			}
		}
		for _, item := range daily.WorkoutTodos {
			if item.IsCompleted {
				dailyCompleted++
			}
		}
		for _, item := range daily.HealthTodos {
			if item.IsCompleted {
				dailyCompleted++
			}
		}
		for _, item := range daily.LifestyleTodos {
			if item.IsCompleted {
				dailyCompleted++
			}
		}
		
		daily.CompletedCount = dailyCompleted
		daily.TotalCount = len(daily.MealTodos) + len(daily.WorkoutTodos) + len(daily.HealthTodos) + len(daily.LifestyleTodos)
		
		if daily.TotalCount > 0 {
			daily.CompletionRate = float64(daily.CompletedCount) / float64(daily.TotalCount)
		}
		
		totalCompleted += dailyCompleted
		totalItems += daily.TotalCount
	}
	
	if totalItems > 0 {
		weeklyTodo.CompletionRate = float64(totalCompleted) / float64(totalItems)
	}
}

// GenerateWeeklyAnalysis generates analysis for a completed week
func (s *WeeklyTodoService) GenerateWeeklyAnalysis(weekID string) (*models.WeeklyAnalysis, error) {
	weeklyTodo, err := s.GetWeeklyTodo(weekID)
	if err != nil {
		return nil, err
	}
	
	// Calculate category statistics
	categoryStats := s.calculateCategoryStats(weeklyTodo)
	
	// Calculate goal progress
	goalProgress := s.calculateGoalProgress(weeklyTodo)
	
	// Generate recommendations based on performance
	recommendations := s.generateRecommendations(weeklyTodo, categoryStats)
	
	analysis := &models.WeeklyAnalysis{
		WeekID:           weeklyTodo.ID,
		UserID:           weeklyTodo.UserID,
		WeekNumber:       weeklyTodo.WeekNumber,
		OverallCompletion: weeklyTodo.CompletionRate,
		CategoryStats:    categoryStats,
		GoalProgress:     goalProgress,
		Recommendations:  recommendations,
		GeneratedAt:      time.Now(),
	}
	
	return analysis, nil
}

// calculateCategoryStats calculates completion statistics by category
func (s *WeeklyTodoService) calculateCategoryStats(weeklyTodo *models.WeeklyTodo) models.CategoryStats {
	stats := models.CategoryStats{}
	
	for _, daily := range weeklyTodo.DailyTodos {
		// Meal todos
		for _, item := range daily.MealTodos {
			stats.Meal.Total++
			if item.IsCompleted {
				stats.Meal.Completed++
			}
		}
		
		// Workout todos
		for _, item := range daily.WorkoutTodos {
			stats.Workout.Total++
			if item.IsCompleted {
				stats.Workout.Completed++
			}
		}
		
		// Health todos
		for _, item := range daily.HealthTodos {
			stats.Health.Total++
			if item.IsCompleted {
				stats.Health.Completed++
			}
		}
		
		// Lifestyle todos
		for _, item := range daily.LifestyleTodos {
			stats.Lifestyle.Total++
			if item.IsCompleted {
				stats.Lifestyle.Completed++
			}
		}
	}
	
	// Calculate percentages
	if stats.Meal.Total > 0 {
		stats.Meal.Percentage = float64(stats.Meal.Completed) / float64(stats.Meal.Total)
	}
	if stats.Workout.Total > 0 {
		stats.Workout.Percentage = float64(stats.Workout.Completed) / float64(stats.Workout.Total)
	}
	if stats.Health.Total > 0 {
		stats.Health.Percentage = float64(stats.Health.Completed) / float64(stats.Health.Total)
	}
	if stats.Lifestyle.Total > 0 {
		stats.Lifestyle.Percentage = float64(stats.Lifestyle.Completed) / float64(stats.Lifestyle.Total)
	}
	
	return stats
}

// calculateGoalProgress calculates progress towards weekly goals
func (s *WeeklyTodoService) calculateGoalProgress(weeklyTodo *models.WeeklyTodo) []models.GoalProgress {
	var progress []models.GoalProgress
	
	for _, goal := range weeklyTodo.WeeklyGoals {
		goalProgress := models.GoalProgress{
			Goal: goal,
		}
		
		// Simple goal completion logic - can be enhanced based on specific goal types
		if goal.Completed {
			goalProgress.Progress = 1.0
			goalProgress.Status = "completed"
		} else {
			goalProgress.Progress = 0.0
			goalProgress.Status = "not_started"
		}
		
		progress = append(progress, goalProgress)
	}
	
	return progress
}

// generateRecommendations generates recommendations based on performance
func (s *WeeklyTodoService) generateRecommendations(weeklyTodo *models.WeeklyTodo, stats models.CategoryStats) []string {
	var recommendations []string
	
	// Overall completion rate recommendations
	if weeklyTodo.CompletionRate < 0.5 {
		recommendations = append(recommendations, "Focus on completing high-priority tasks first to build momentum")
		recommendations = append(recommendations, "Consider reducing the number of daily tasks to make them more manageable")
	} else if weeklyTodo.CompletionRate > 0.8 {
		recommendations = append(recommendations, "Excellent progress! Consider adding more challenging tasks for next week")
	}
	
	// Category-specific recommendations
	if stats.Meal.Percentage < 0.6 {
		recommendations = append(recommendations, "Focus on meal planning and preparation to improve nutrition compliance")
	}
	
	if stats.Workout.Percentage < 0.6 {
		recommendations = append(recommendations, "Try shorter, more frequent workouts to build consistency")
	}
	
	if stats.Health.Percentage < 0.6 {
		recommendations = append(recommendations, "Set reminders for health tasks like hydration and supplements")
	}
	
	if stats.Lifestyle.Percentage < 0.6 {
		recommendations = append(recommendations, "Focus on sleep and stress management for better overall health")
	}
	
	return recommendations
}

// Helper functions
func (s *WeeklyTodoService) replaceVariable(template, variable, value string) string {
	// Simple string replacement using strings.ReplaceAll
	return strings.ReplaceAll(template, variable, value)
}

func (s *WeeklyTodoService) arrayToString(arr []string) string {
	if len(arr) == 0 {
		return "[]"
	}
	
	result := "["
	for i, item := range arr {
		if i > 0 {
			result += ", "
		}
		result += "\"" + item + "\""
	}
	result += "]"
	return result
} 