package routes

import (
	"amobagan/controllers"

	"github.com/gin-gonic/gin"
)

func setupHealthRoutes(router *gin.Engine) {
	healthController := controllers.NewHealthController()
	
	router.GET("/health", healthController.HealthCheck)
} 