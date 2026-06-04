package routes

import (
	"amobagan/controllers"
	"amobagan/middleware"

	"github.com/gin-gonic/gin"
)

func setupProductRoutes(api *gin.RouterGroup) {
	productController := controllers.NewProductController()
	protected := api.Group("/products")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("/:barcode", productController.GetProductDetailsByBarcode)
	protected.GET("/:barcode/nutrition", productController.GetNutritionAnalysis)
	protected.POST("/:barcode/nutrition/personalized", productController.AnalyzeNutritionWithPreferences)
}
