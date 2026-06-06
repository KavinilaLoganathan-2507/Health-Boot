package controllers

import (
	"amobagan/models"
	"amobagan/services"
	"amobagan/utils"
	"time"

	"github.com/gin-gonic/gin"
)

type FoodLogController struct{}

func NewFoodLogController() *FoodLogController {
	return &FoodLogController{}
}

func (f *FoodLogController) HandleCreateFoodLog(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	var input models.FoodLogInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, err.Error(), nil)
		return
	}

	logEntry, err := services.CreateFoodLog(userID, input)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Food log created successfully", logEntry)
}

func (f *FoodLogController) HandleGetDailyLogs(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	dateStr := c.Query("date")
	targetDate := time.Now()
	if dateStr != "" {
		parsedDate, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			parsedDate, err = time.Parse("2006-01-02", dateStr)
		}
		if err == nil {
			targetDate = parsedDate
		}
	}

	logs, err := services.GetDailyFoodLogs(userID, targetDate)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Food logs retrieved successfully", logs)
}

func (f *FoodLogController) HandleUpdateFoodLog(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	logID := c.Param("id")
	if logID == "" {
		utils.BadRequest(c, "Log ID is required", nil)
		return
	}

	var input models.FoodLogInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, err.Error(), nil)
		return
	}

	logEntry, err := services.UpdateFoodLog(userID, logID, input)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Food log updated successfully", logEntry)
}

func (f *FoodLogController) HandleDeleteFoodLog(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	logID := c.Param("id")
	if logID == "" {
		utils.BadRequest(c, "Log ID is required", nil)
		return
	}

	err := services.DeleteFoodLog(userID, logID)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Food log deleted successfully", nil)
}

func (f *FoodLogController) HandleGetDailySummary(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	dateStr := c.Query("date")
	targetDate := time.Now()
	if dateStr != "" {
		parsedDate, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			parsedDate, err = time.Parse("2006-01-02", dateStr)
		}
		if err == nil {
			targetDate = parsedDate
		}
	}

	summary, err := services.GetDailyNutritionSummary(userID, targetDate)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Nutrition summary retrieved successfully", summary)
}

func (f *FoodLogController) HandleGetWeeklyTrend(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	trend, err := services.GetWeeklyNutritionTrend(userID)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Weekly nutrition trend retrieved successfully", trend)
}
