package routes

import (
	"amobagan/controllers"
	"amobagan/middleware"

	"github.com/gin-gonic/gin"
)

func setupInsightRoutes(api *gin.RouterGroup) {
	insightsController := controllers.NewInsightsController()

	protected := api.Group("/user/insights")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("", insightsController.HandleGetInsights)
	}
}
