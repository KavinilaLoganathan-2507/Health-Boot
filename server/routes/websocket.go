package routes

import (
	"amobagan/controllers"

	"github.com/gin-gonic/gin"
)

func setupWebSocketRoutes(router *gin.Engine) {
	websocketController := controllers.NewWebSocketController()

	router.GET("/ws/nutrition/stream", websocketController.StreamNutritionAnalysis)
} 