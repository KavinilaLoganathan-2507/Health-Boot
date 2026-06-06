package routes

import (
	"amobagan/controllers"
	"amobagan/middleware"

	"github.com/gin-gonic/gin"
)

func setupGoalRoutes(api *gin.RouterGroup) {
	goalController := controllers.NewGoalController()

	protected := api.Group("/user/goals")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("", goalController.HandleCreateGoal)
		protected.GET("", goalController.HandleGetUserGoals)
		protected.PUT("/:id", goalController.HandleUpdateGoalProgress)
		protected.DELETE("/:id", goalController.HandleDeleteGoal)
	}
}
