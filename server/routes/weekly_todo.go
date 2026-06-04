package routes

import (
	"amobagan/controllers"
	"amobagan/middleware"

	"github.com/gin-gonic/gin"
)

// setupWeeklyTodoRoutes sets up the weekly todo routes
func setupWeeklyTodoRoutes(api *gin.RouterGroup) {
	weeklyTodoController, err := controllers.NewWeeklyTodoController()
	if err != nil {
		panic(err)
	}

	// Weekly todo routes group - all protected
	weeklyTodoGroup := api.Group("/weekly-todos")
	weeklyTodoGroup.Use(middleware.AuthMiddleware())
	{
		// Test endpoint to debug user authentication
		weeklyTodoGroup.GET("/test-user", weeklyTodoController.TestUserExists)
		
		// Generate new weekly todo list (POST request with body)
		weeklyTodoGroup.POST("/generate", weeklyTodoController.GenerateWeeklyTodo)
		
		// Get current active week todo
		weeklyTodoGroup.GET("/current", weeklyTodoController.GetCurrentWeekTodo)
		
		// Get all weekly todos for the user
		weeklyTodoGroup.GET("/", weeklyTodoController.GetUserWeeklyTodos)
		
		// Generate weekly analysis (must come before :todoId to avoid conflict)
		weeklyTodoGroup.GET("/:todoId/analysis", weeklyTodoController.GenerateWeeklyAnalysis)
		
		// Get specific weekly todo
		weeklyTodoGroup.GET("/:todoId", weeklyTodoController.GetWeeklyTodo)
		
		// Update specific todo item (mark as complete/incomplete)
		weeklyTodoGroup.PUT("/:todoId/items/:itemId", weeklyTodoController.UpdateTodoItem)
	}
} 