package routes

import (
	"amobagan/controllers"
	"amobagan/middleware"

	"github.com/gin-gonic/gin"
)

func setupFoodLogRoutes(api *gin.RouterGroup) {
	foodLogController := controllers.NewFoodLogController()

	// Protected routes (authentication required)
	protected := api.Group("/user/food-logs")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("", foodLogController.HandleCreateFoodLog)
		protected.GET("", foodLogController.HandleGetDailyLogs)
		protected.PUT("/:id", foodLogController.HandleUpdateFoodLog)
		protected.DELETE("/:id", foodLogController.HandleDeleteFoodLog)
		protected.GET("/summary", foodLogController.HandleGetDailySummary)
		protected.GET("/weekly", foodLogController.HandleGetWeeklyTrend)
	}
}
