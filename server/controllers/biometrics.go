package controllers

import (
	"amobagan/models"
	"amobagan/services"
	"amobagan/utils"

	"github.com/gin-gonic/gin"
)

type BiometricsController struct{}

func NewBiometricsController() *BiometricsController {
	return &BiometricsController{}
}

func (bc *BiometricsController) HandleBiometricsAnalysis(c *gin.Context) {
	// Optional: we can require auth but since it's just processing, let's keep it under the same auth or just general.
	// We'll extract user ID if available, though Gemini doesn't strictly need it.
	
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	var input models.BiometricInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "Invalid biometric data", err.Error())
		return
	}

	analysis, err := services.AnalyzeBiometrics(userID, input)
	if err != nil {
		utils.InternalServerError(c, "Failed to analyze biometric data", err.Error())
		return
	}

	utils.OK(c, "Biometric data analyzed successfully", analysis)
}

func (bc *BiometricsController) HandleGetBiometricHistory(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	history, err := services.GetBiometricHistory(userID)
	if err != nil {
		utils.InternalServerError(c, "Failed to fetch biometric history", err.Error())
		return
	}

	utils.OK(c, "Biometric history fetched successfully", history)
}
