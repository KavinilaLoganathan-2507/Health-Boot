package controllers

import (
	"amobagan/models"
	"amobagan/services"
	"amobagan/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DietPlanController struct {
	dietPlanService *services.DietPlanService
}

func NewDietPlanController() (*DietPlanController, error) {
	dietPlanService, err := services.NewDietPlanService()
	if err != nil {
		return nil, err
	}
	return &DietPlanController{
		dietPlanService: dietPlanService,
	}, nil
}

// GenerateDietPlan handles the request to generate a new diet plan
func (c *DietPlanController) GenerateDietPlan(ctx *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID := ctx.GetString("userID")
	if userID == "" {
		utils.SendErrorResponse(ctx, http.StatusUnauthorized, "User not authenticated", "")
		return
	}

	// Generate the diet plan using user data from database (no request body needed)
	dietPlan, err := c.dietPlanService.GenerateDietPlan(userID)
	if err != nil {
		utils.SendErrorResponse(ctx, http.StatusInternalServerError, "Failed to generate diet plan", err.Error())
		return
	}

	// Save the diet plan to database
	err = c.dietPlanService.SaveDietPlan(dietPlan)
	if err != nil {
		utils.SendErrorResponse(ctx, http.StatusInternalServerError, "Failed to save diet plan", err.Error())
		return
	}

	// Create response
	response := models.DietPlanResponse{
		Success: true,
		Message: "Weekly diet plan generated and saved successfully",
		Data:    dietPlan,
	}

	ctx.JSON(http.StatusOK, response)
}

// GetDietPlan retrieves a specific diet plan
func (c *DietPlanController) GetDietPlan(ctx *gin.Context) {
	userID := ctx.GetString("userID")
	if userID == "" {
		utils.SendErrorResponse(ctx, http.StatusUnauthorized, "User not authenticated", "")
		return
	}

	planID := ctx.Param("planId")
	if planID == "" {
		utils.SendErrorResponse(ctx, http.StatusBadRequest, "Plan ID is required", "")
		return
	}

	dietPlan, err := c.dietPlanService.GetDietPlan(planID)
	if err != nil {
		utils.SendErrorResponse(ctx, http.StatusNotFound, "Diet plan not found", err.Error())
		return
	}

	// Verify the diet plan belongs to the authenticated user
	if dietPlan.UserID.Hex() != userID {
		utils.SendErrorResponse(ctx, http.StatusForbidden, "Access denied", "This diet plan does not belong to you")
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Diet plan retrieved successfully",
		"data":    dietPlan,
	})
}

// GetUserDietPlans retrieves all diet plans for the authenticated user
func (c *DietPlanController) GetUserDietPlans(ctx *gin.Context) {
	userID := ctx.GetString("userID")
	if userID == "" {
		utils.SendErrorResponse(ctx, http.StatusUnauthorized, "User not authenticated", "")
		return
	}

	dietPlans, err := c.dietPlanService.GetUserDietPlans(userID)
	if err != nil {
		utils.SendErrorResponse(ctx, http.StatusInternalServerError, "Failed to retrieve diet plans", err.Error())
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Diet plans retrieved successfully",
		"data":    dietPlans,
	})
}

// SaveDietPlan saves a diet plan to the database
func (c *DietPlanController) SaveDietPlan(ctx *gin.Context) {
	userID := ctx.GetString("userID")
	if userID == "" {
		utils.SendErrorResponse(ctx, http.StatusUnauthorized, "User not authenticated", "")
		return
	}

	var dietPlan models.DietPlan
	if err := ctx.ShouldBindJSON(&dietPlan); err != nil {
		utils.SendErrorResponse(ctx, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Set the user ID from the authenticated user
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		utils.SendErrorResponse(ctx, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}
	dietPlan.UserID = userObjectID

	err = c.dietPlanService.SaveDietPlan(&dietPlan)
	if err != nil {
		utils.SendErrorResponse(ctx, http.StatusInternalServerError, "Failed to save diet plan", err.Error())
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Diet plan saved successfully",
		"data":    dietPlan,
	})
}

// UpdateDietPlanProgress updates the user's progress on a diet plan
func (c *DietPlanController) UpdateDietPlanProgress(ctx *gin.Context) {
	userID := ctx.GetString("userID")
	if userID == "" {
		utils.SendErrorResponse(ctx, http.StatusUnauthorized, "User not authenticated", "")
		return
	}

	planID := ctx.Param("planId")
	if planID == "" {
		utils.SendErrorResponse(ctx, http.StatusBadRequest, "Plan ID is required", "")
		return
	}

	var progress models.DietPlanProgress
	if err := ctx.ShouldBindJSON(&progress); err != nil {
		utils.SendErrorResponse(ctx, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	err := c.dietPlanService.UpdateDietPlanProgress(planID, userID, &progress)
	if err != nil {
		utils.SendErrorResponse(ctx, http.StatusInternalServerError, "Failed to update progress", err.Error())
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Progress updated successfully",
	})
}

// GetDietPlanSummary gets a summary of diet plans for a user
func (c *DietPlanController) GetDietPlanSummary(ctx *gin.Context) {
	userID := ctx.GetString("userID")
	if userID == "" {
		utils.SendErrorResponse(ctx, http.StatusUnauthorized, "User not authenticated", "")
		return
	}

	// Get all diet plans for the user
	dietPlans, err := c.dietPlanService.GetUserDietPlans(userID)
	if err != nil {
		utils.SendErrorResponse(ctx, http.StatusInternalServerError, "Failed to retrieve diet plans", err.Error())
		return
	}

	// Create summaries
	var summaries []models.DietPlanSummary
	for _, plan := range dietPlans {
		summary := models.DietPlanSummary{
			PlanID:      plan.ID.Hex(),
			UserID:      plan.UserID.Hex(),
			GeneratedAt: plan.GeneratedAt,
			Duration:    len(plan.DailyPlans) / 7, // Calculate weeks from daily plans
			PrimaryGoal: plan.UserProfile.PrimaryGoal,
			WeeklyGoals: plan.WeeklyGoals,
			Status:      plan.Status,
		}

		// Calculate average calories and workout days
		totalCalories := 0
		workoutDays := 0
		for _, dailyPlan := range plan.DailyPlans {
			totalCalories += dailyPlan.MealPlan.Breakfast.Calories +
				dailyPlan.MealPlan.Lunch.Calories +
				dailyPlan.MealPlan.Dinner.Calories
			
			for _, snack := range dailyPlan.MealPlan.Snacks {
				totalCalories += snack.Calories
			}

			if dailyPlan.Workout.Type != "rest" {
				workoutDays++
			}
		}

		if len(plan.DailyPlans) > 0 {
			summary.AverageCalories = totalCalories / len(plan.DailyPlans)
			summary.WorkoutDays = workoutDays
		}

		summaries = append(summaries, summary)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Diet plan summaries retrieved successfully",
		"data":    summaries,
	})
}

// TestUserExists is a temporary endpoint to debug user authentication
func (c *DietPlanController) TestUserExists(ctx *gin.Context) {
	userID := ctx.GetString("userID")
	if userID == "" {
		utils.SendErrorResponse(ctx, http.StatusUnauthorized, "User not authenticated", "")
		return
	}

	// Try to get user data
	user, err := services.GetUserByID(userID)
	if err != nil {
		ctx.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "User not found in database",
			"userID": userID,
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User found in database",
		"user": gin.H{
			"id": user.ID.Hex(),
			"fullName": user.FullName,
			"phoneNo": user.PhoneNo,
			"healthStatus": user.HealthStatus,
			"healthGoals": user.HealthGoals,
			"dietaryPreferences": user.DietaryPreferences,
			"nutritionPriorities": user.NutritionPriorities,
			"workOutsPerWeek": user.WorkOutsPerWeek,
			"age": user.Age,
			"height": user.Height,
			"weight": user.Weight,
		},
	})
} 