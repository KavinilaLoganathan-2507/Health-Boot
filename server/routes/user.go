package routes

import (
	"amobagan/controllers"
	"amobagan/middleware"

	"github.com/gin-gonic/gin"
)

func setupUserRoutes(api *gin.RouterGroup) {
	userController := controllers.NewUserController()

	// Public routes (no authentication required)
	api.POST("/user/create", userController.CreateUser)
	api.POST("/user/login", userController.LoginUser)
	
	// Protected routes (authentication required)
	protected := api.Group("/user")
	protected.Use(middleware.AuthMiddleware())
	protected.PUT("/nutritional-status", userController.UpdateNutritionalStatus)
	protected.GET("/nutrition-details", userController.GetNutritionDetails)
}