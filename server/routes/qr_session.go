package routes

import (
	"amobagan/controllers"
	"amobagan/middleware"

	"github.com/gin-gonic/gin"
)

func setupQRRoutes(api *gin.RouterGroup) {
	qrController := controllers.NewQRSessionController()

	// Public endpoints for booth/scanners
	api.POST("/user/qr/validate", qrController.HandleValidateQR)
	api.GET("/user/qr/status/:token", qrController.HandleGetQRStatus)

	// Protected endpoint for user to generate QR code
	protected := api.Group("/user/qr")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/generate", qrController.HandleGenerateQR)
	}
}
