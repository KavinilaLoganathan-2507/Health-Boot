package routes

import (
	"amobagan/controllers"

	"github.com/gin-gonic/gin"
)

func setupChatRoutes(api *gin.RouterGroup) {
	chatController := controllers.NewChatController()
	api.POST("/chat", chatController.Chat)
}
