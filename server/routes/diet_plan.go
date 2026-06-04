package routes

import (
	"amobagan/controllers"
	"amobagan/middleware"

	"github.com/gin-gonic/gin"
)

// setupDietPlanRoutes sets up the diet plan routes
func setupDietPlanRoutes(api *gin.RouterGroup) {
	dietPlanController, err := controllers.NewDietPlanController()
	if err != nil {
		panic(err)
	}

	// Diet plan routes group - all protected
	dietPlanGroup := api.Group("/diet-plans")
	dietPlanGroup.Use(middleware.AuthMiddleware())
	{
		// Test endpoint to debug user authentication
		dietPlanGroup.GET("/test-user", dietPlanController.TestUserExists)
		
		// Generate new weekly diet plan (GET request - no body needed)
		dietPlanGroup.GET("/generate", dietPlanController.GenerateDietPlan)
		
		// Get all diet plans for the user
		dietPlanGroup.GET("/", dietPlanController.GetUserDietPlans)
		
		// Get specific diet plan
		dietPlanGroup.GET("/:planId", dietPlanController.GetDietPlan)
		
		// Save diet plan
		dietPlanGroup.POST("/save", dietPlanController.SaveDietPlan)
		
		// Update progress
		dietPlanGroup.PUT("/:planId/progress", dietPlanController.UpdateDietPlanProgress)
		
		// Get diet plan summaries
		dietPlanGroup.GET("/summary", dietPlanController.GetDietPlanSummary)
	}
} 