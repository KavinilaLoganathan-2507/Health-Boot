package controllers

import (
	"amobagan/utils"

	"github.com/gin-gonic/gin"
)

type HealthController struct{}

func NewHealthController() *HealthController {
	return &HealthController{}
}

func (h *HealthController) HealthCheck(c *gin.Context) {
	data := gin.H{
		"status": "ok",
		"service": "amobagan-api",
		"version": "1.0.0",
	}
	utils.OK(c, "Server is running", data)
}

func (h *HealthController) Ping(c *gin.Context) {
	utils.OK(c, "pong", nil)
} 