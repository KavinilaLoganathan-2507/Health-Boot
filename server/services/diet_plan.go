package services

import (
	"amobagan/lib"
	"amobagan/models"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"google.golang.org/genai"
)

type DietPlanService struct {
	client *genai.Client
}

func NewDietPlanService() (*DietPlanService, error) {
	client, err := lib.GetGeminiClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %v", err)
	}
	return &DietPlanService{client: client}, nil
}

// GenerateDietPlan creates a personalized diet plan using structured output
func (s *DietPlanService) GenerateDietPlan(userID string) (*models.DietPlan, error) {
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

	// Read prompt template
	promptTemplate, err := s.readPromptTemplate()
	if err != nil {
		return nil, fmt.Errorf("failed to read prompt template: %v", err)
	}

	// Create the prompt for weekly todo list
	prompt := s.createWeeklyTodoPrompt(userProfile, promptTemplate)

	// Create JSON schema for structured output
	schema := s.createDietPlanSchema()

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
		return nil, fmt.Errorf("failed to generate diet plan: %v", err)
	}

	// Parse the structured response
	var dietPlan models.DietPlan
	if err := json.Unmarshal([]byte(response.Text()), &dietPlan); err != nil {
		return nil, fmt.Errorf("failed to parse diet plan response: %v", err)
	}

	// Set additional fields
	dietPlan.GeneratedAt = time.Now()
	dietPlan.Status = "active"
	
	// Set user ID
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}
	dietPlan.UserID = userObjectID

	// Validate the diet plan
	if err := s.validateDietPlan(&dietPlan); err != nil {
		return nil, fmt.Errorf("diet plan validation failed: %v", err)
	}

	return &dietPlan, nil
}

// convertUserToProfile converts User model to UserProfile
func (s *DietPlanService) convertUserToProfile(user *models.User) (*models.UserProfile, error) {
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
func (s *DietPlanService) determinePrimaryGoal(healthGoals []string) string {
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
func (s *DietPlanService) mapWorkoutFrequency(workoutsPerWeek string) string {
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

// readPromptTemplate reads the diet plan prompt template
func (s *DietPlanService) readPromptTemplate() (string, error) {
	content, err := ioutil.ReadFile("llm_context/diet_plan.txt")
	if err != nil {
		return "", fmt.Errorf("failed to read diet plan template: %v", err)
	}
	return string(content), nil
}

// createWeeklyTodoPrompt creates the complete prompt for weekly todo list generation
func (s *DietPlanService) createWeeklyTodoPrompt(userProfile *models.UserProfile, template string) string {
	// Convert user profile to JSON for the prompt
	userProfileJSON, _ := json.MarshalIndent(userProfile, "", "  ")

	// Create the complete prompt for weekly todo list
	prompt := fmt.Sprintf(`
%s

## User Profile:
%s

## Request:
Generate a comprehensive 7-day weekly todo list based on the user's profile and health goals. 
This should be a practical, actionable weekly plan that the user can follow easily.

The response must be in the exact JSON format specified in the schema above.

Focus on creating a weekly todo list that includes:
1. Daily meal plans with specific foods and portions
2. Daily workout/exercise routines
3. Health tasks (hydration, supplements, health checks)
4. Lifestyle tasks (sleep, stress management, habits)
5. Progress tracking items to measure daily

Ensure the plan is:
1. Personalized to the user's health goals: %s
2. Realistic and achievable for their fitness level: %s
3. Nutritionally balanced and suitable for their dietary preferences: %v
4. Focused on their primary health concern: %s
5. Structured as a clear weekly todo list with daily actionable items

Make it a practical weekly todo list that the user can check off each day.
`, template, string(userProfileJSON), userProfile.PrimaryGoal, userProfile.WorkoutFrequency, userProfile.DietaryPreferences, userProfile.HealthStatus)

	return prompt
}

// createDietPlanPrompt creates the complete prompt for diet plan generation
func (s *DietPlanService) createDietPlanPrompt(userProfile *models.UserProfile, request *models.DietPlanRequest, template string) string {
	// Convert user profile to JSON for the prompt
	userProfileJSON, _ := json.MarshalIndent(userProfile, "", "  ")

	// Create the complete prompt
	prompt := fmt.Sprintf(`
%s

## User Profile:
%s

## Plan Requirements:
- Plan Type: %s
- Duration: %d weeks
- Include Workouts: %t
- Include Meal Prep: %t

Please generate a comprehensive %d-week diet plan based on the user's profile and requirements. 
The response must be in the exact JSON format specified in the schema above.

Ensure the plan is:
1. Personalized to the user's health goals and dietary preferences
2. Realistic and achievable
3. Nutritionally balanced
4. Includes variety to prevent boredom
5. Accounts for the user's current fitness level and schedule
6. Focuses on the user's primary health goal: %s
`, template, string(userProfileJSON), request.PlanType, request.Duration, request.IncludeWorkouts, request.IncludeMealPrep, request.Duration, userProfile.PrimaryGoal)

	return prompt
}

// createDietPlanSchema creates the JSON schema for structured output
func (s *DietPlanService) createDietPlanSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"user_profile": {
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"name": {Type: genai.TypeString},
					"age": {Type: genai.TypeInteger},
					"weight": {Type: genai.TypeNumber},
					"height": {Type: genai.TypeNumber},
					"bmi": {Type: genai.TypeNumber},
					"workout_frequency": {Type: genai.TypeString},
					"primary_goal": {Type: genai.TypeString},
					"goal_pace": {Type: genai.TypeNumber},
					"timeline": {Type: genai.TypeString},
					"dietary_preferences": {
						Type: genai.TypeArray,
						Items: &genai.Schema{Type: genai.TypeString},
					},
					"food_allergies": {
						Type: genai.TypeArray,
						Items: &genai.Schema{Type: genai.TypeString},
					},
					"nutrition_priorities": {
						Type: genai.TypeArray,
						Items: &genai.Schema{Type: genai.TypeString},
					},
					"completed_goals": {
						Type: genai.TypeArray,
						Items: &genai.Schema{Type: genai.TypeString},
					},
					"remaining_goals": {
						Type: genai.TypeArray,
						Items: &genai.Schema{Type: genai.TypeString},
					},
					"health_status": {Type: genai.TypeString},
				},
				PropertyOrdering: []string{
					"name", "age", "weight", "height", "bmi", "workout_frequency",
					"primary_goal", "goal_pace", "timeline", "dietary_preferences",
					"food_allergies", "nutrition_priorities", "completed_goals", "remaining_goals", "health_status",
				},
			},
			"weekly_goals": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"category": {Type: genai.TypeString},
						"description": {Type: genai.TypeString},
						"target": {Type: genai.TypeString},
						"measurable": {Type: genai.TypeBoolean},
					},
					PropertyOrdering: []string{"category", "description", "target", "measurable"},
				},
			},
			"daily_plans": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"day": {Type: genai.TypeString},
						"date": {Type: genai.TypeString},
						"meal_plan": {
							Type: genai.TypeObject,
							Properties: map[string]*genai.Schema{
								"breakfast": s.createMealSchema(),
								"lunch": s.createMealSchema(),
								"dinner": s.createMealSchema(),
								"snacks": {
									Type: genai.TypeArray,
									Items: s.createMealSchema(),
								},
								"hydration_goal": {Type: genai.TypeString},
							},
							PropertyOrdering: []string{"breakfast", "lunch", "dinner", "snacks", "hydration_goal"},
						},
						"workout": {
							Type: genai.TypeObject,
							Properties: map[string]*genai.Schema{
								"type": {Type: genai.TypeString},
								"duration": {Type: genai.TypeString},
								"intensity": {Type: genai.TypeString},
								"exercises": {
									Type: genai.TypeArray,
									Items: &genai.Schema{
										Type: genai.TypeObject,
										Properties: map[string]*genai.Schema{
											"name": {Type: genai.TypeString},
											"sets": {Type: genai.TypeInteger},
											"reps": {Type: genai.TypeInteger},
											"duration": {Type: genai.TypeString},
											"rest_time": {Type: genai.TypeString},
											"instructions": {Type: genai.TypeString},
										},
										PropertyOrdering: []string{"name", "sets", "reps", "duration", "rest_time", "instructions"},
									},
								},
								"notes": {Type: genai.TypeString},
							},
							PropertyOrdering: []string{"type", "duration", "intensity", "exercises", "notes"},
						},
						"health_tasks": {
							Type: genai.TypeArray,
							Items: &genai.Schema{
								Type: genai.TypeObject,
								Properties: map[string]*genai.Schema{
									"category": {Type: genai.TypeString},
									"task": {Type: genai.TypeString},
									"timing": {Type: genai.TypeString},
									"frequency": {Type: genai.TypeString},
									"notes": {Type: genai.TypeString},
								},
								PropertyOrdering: []string{"category", "task", "timing", "frequency", "notes"},
							},
						},
						"lifestyle_tasks": {
							Type: genai.TypeArray,
							Items: &genai.Schema{
								Type: genai.TypeObject,
								Properties: map[string]*genai.Schema{
									"category": {Type: genai.TypeString},
									"task": {Type: genai.TypeString},
									"timing": {Type: genai.TypeString},
									"duration": {Type: genai.TypeString},
									"notes": {Type: genai.TypeString},
								},
								PropertyOrdering: []string{"category", "task", "timing", "duration", "notes"},
							},
						},
						"progress_tracking": {
							Type: genai.TypeArray,
							Items: &genai.Schema{
								Type: genai.TypeObject,
								Properties: map[string]*genai.Schema{
									"metric": {Type: genai.TypeString},
									"target": {Type: genai.TypeString},
									"unit": {Type: genai.TypeString},
									"method": {Type: genai.TypeString},
									"notes": {Type: genai.TypeString},
								},
								PropertyOrdering: []string{"metric", "target", "unit", "method", "notes"},
							},
						},
					},
					PropertyOrdering: []string{"day", "date", "meal_plan", "workout", "health_tasks", "lifestyle_tasks", "progress_tracking"},
				},
			},
			"special_considerations": {
				Type: genai.TypeArray,
				Items: &genai.Schema{Type: genai.TypeString},
			},
		},
		PropertyOrdering: []string{"user_profile", "weekly_goals", "daily_plans", "special_considerations"},
	}
}

// createMealSchema creates the schema for a meal
func (s *DietPlanService) createMealSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"name": {Type: genai.TypeString},
			"description": {Type: genai.TypeString},
			"ingredients": {
				Type: genai.TypeArray,
				Items: &genai.Schema{Type: genai.TypeString},
			},
			"portion_size": {Type: genai.TypeString},
			"calories": {Type: genai.TypeInteger},
			"macros": {
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"protein": {Type: genai.TypeNumber},
					"carbs": {Type: genai.TypeNumber},
					"fat": {Type: genai.TypeNumber},
					"fiber": {Type: genai.TypeNumber},
				},
				PropertyOrdering: []string{"protein", "carbs", "fat", "fiber"},
			},
			"prep_time": {Type: genai.TypeString},
			"notes": {Type: genai.TypeString},
		},
		PropertyOrdering: []string{"name", "description", "ingredients", "portion_size", "calories", "macros", "prep_time", "notes"},
	}
}

// calculateBMI calculates BMI from weight and height
func (s *DietPlanService) calculateBMI(weight, height float64) float64 {
	heightInMeters := height / 100
	return math.Round((weight / (heightInMeters * heightInMeters)) * 10) / 10
}

// validateDietPlan validates the generated diet plan
func (s *DietPlanService) validateDietPlan(plan *models.DietPlan) error {
	// Validate user profile
	if plan.UserProfile.Name == "" {
		return fmt.Errorf("user name is required")
	}
	if plan.UserProfile.Age <= 0 {
		return fmt.Errorf("invalid age")
	}
	if plan.UserProfile.Weight <= 0 {
		return fmt.Errorf("invalid weight")
	}
	if plan.UserProfile.Height <= 0 {
		return fmt.Errorf("invalid height")
	}

	// Validate weekly goals
	if len(plan.WeeklyGoals) == 0 {
		return fmt.Errorf("at least one weekly goal is required")
	}

	// Validate daily plans
	if len(plan.DailyPlans) == 0 {
		return fmt.Errorf("at least one daily plan is required")
	}

	// Validate each daily plan
	for i, dailyPlan := range plan.DailyPlans {
		if err := s.validateDailyPlan(&dailyPlan, i+1); err != nil {
			return fmt.Errorf("daily plan %d validation failed: %v", i+1, err)
		}
	}

	return nil
}

// validateDailyPlan validates a single daily plan
func (s *DietPlanService) validateDailyPlan(plan *models.DailyPlan, dayNumber int) error {
	if plan.Day == "" {
		return fmt.Errorf("day is required")
	}

	// Validate meal plan
	if err := s.validateMealPlan(&plan.MealPlan); err != nil {
		return fmt.Errorf("meal plan validation failed: %v", err)
	}

	// Validate workout
	if err := s.validateWorkout(&plan.Workout); err != nil {
		return fmt.Errorf("workout validation failed: %v", err)
	}

	return nil
}

// validateMealPlan validates a meal plan
func (s *DietPlanService) validateMealPlan(mealPlan *models.MealPlan) error {
	// Validate breakfast
	if err := s.validateMeal(&mealPlan.Breakfast, "breakfast"); err != nil {
		return err
	}

	// Validate lunch
	if err := s.validateMeal(&mealPlan.Lunch, "lunch"); err != nil {
		return err
	}

	// Validate dinner
	if err := s.validateMeal(&mealPlan.Dinner, "dinner"); err != nil {
		return err
	}

	// Validate snacks
	for i, snack := range mealPlan.Snacks {
		if err := s.validateMeal(&snack, fmt.Sprintf("snack %d", i+1)); err != nil {
			return err
		}
	}

	return nil
}

// validateMeal validates a single meal
func (s *DietPlanService) validateMeal(meal *models.Meal, mealType string) error {
	if meal.Name == "" {
		return fmt.Errorf("%s name is required", mealType)
	}
	if meal.Calories <= 0 {
		return fmt.Errorf("%s calories must be positive", mealType)
	}
	if len(meal.Ingredients) == 0 {
		return fmt.Errorf("%s must have at least one ingredient", mealType)
	}
	return nil
}

// validateWorkout validates a workout
func (s *DietPlanService) validateWorkout(workout *models.Workout) error {
	if workout.Type == "" {
		return fmt.Errorf("workout type is required")
	}
	if workout.Duration == "" {
		return fmt.Errorf("workout duration is required")
	}
	if workout.Intensity == "" {
		return fmt.Errorf("workout intensity is required")
	}
	return nil
}

// SaveDietPlan saves the diet plan to the database
func (s *DietPlanService) SaveDietPlan(plan *models.DietPlan) error {
	collection := lib.DB.Database("amobagan").Collection("diet_plans")
	
	_, err := collection.InsertOne(context.Background(), plan)
	if err != nil {
		return fmt.Errorf("failed to save diet plan: %v", err)
	}
	
	return nil
}

// GetDietPlan retrieves a diet plan from the database
func (s *DietPlanService) GetDietPlan(planID string) (*models.DietPlan, error) {
	collection := lib.DB.Database("amobagan").Collection("diet_plans")
	
	objectID, err := primitive.ObjectIDFromHex(planID)
	if err != nil {
		return nil, fmt.Errorf("invalid plan ID: %v", err)
	}
	
	filter := bson.M{"_id": objectID}
	
	var dietPlan models.DietPlan
	err = collection.FindOne(context.Background(), filter).Decode(&dietPlan)
	if err != nil {
		return nil, fmt.Errorf("diet plan not found: %v", err)
	}
	
	return &dietPlan, nil
}

// GetUserDietPlans retrieves all diet plans for a user
func (s *DietPlanService) GetUserDietPlans(userID string) ([]models.DietPlan, error) {
	collection := lib.DB.Database("amobagan").Collection("diet_plans")
	
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}
	
	filter := bson.M{"user_id": userObjectID}
	
	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch diet plans: %v", err)
	}
	defer cursor.Close(context.Background())
	
	var dietPlans []models.DietPlan
	if err = cursor.All(context.Background(), &dietPlans); err != nil {
		return nil, fmt.Errorf("failed to decode diet plans: %v", err)
	}
	
	return dietPlans, nil
}

// UpdateDietPlanProgress updates the user's progress on a diet plan
func (s *DietPlanService) UpdateDietPlanProgress(planID, userID string, progress *models.DietPlanProgress) error {
	// TODO: Implement progress update logic
	return nil
} 