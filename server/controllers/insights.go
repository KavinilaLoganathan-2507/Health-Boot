package controllers

import (
	"amobagan/services"
	"amobagan/utils"

	"github.com/gin-gonic/gin"
)

type InsightsController struct{}

func NewInsightsController() *InsightsController {
	return &InsightsController{}
}

func (i *InsightsController) HandleGetInsights(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	insights, err := services.GenerateHealthInsights(userID)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Health insights generated successfully", insights)
}
