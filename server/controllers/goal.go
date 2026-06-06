package controllers

import (
	"amobagan/models"
	"amobagan/services"
	"amobagan/utils"

	"github.com/gin-gonic/gin"
)

type GoalController struct{}

func NewGoalController() *GoalController {
	return &GoalController{}
}

func (g *GoalController) HandleCreateGoal(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	var input models.GoalInput
	if err := g.bindGoalInput(c, &input); err != nil {
		return
	}

	goal, err := services.CreateGoal(userID, input)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Goal created successfully", goal)
}

func (g *GoalController) HandleGetUserGoals(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	goals, err := services.GetUserGoals(userID)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Goals retrieved successfully", goals)
}

func (g *GoalController) HandleUpdateGoalProgress(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	goalID := c.Param("id")
	if goalID == "" {
		utils.BadRequest(c, "Goal ID is required", nil)
		return
	}

	var update models.GoalProgressUpdate
	if err := c.ShouldBindJSON(&update); err != nil {
		utils.BadRequest(c, err.Error(), nil)
		return
	}

	goal, err := services.UpdateGoalProgress(userID, goalID, update)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Goal progress updated successfully", goal)
}

func (g *GoalController) HandleDeleteGoal(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	goalID := c.Param("id")
	if goalID == "" {
		utils.BadRequest(c, "Goal ID is required", nil)
		return
	}

	err := services.DeleteGoal(userID, goalID)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Goal deleted successfully", nil)
}

func (g *GoalController) bindGoalInput(c *gin.Context, input *models.GoalInput) error {
	if err := c.ShouldBindJSON(input); err != nil {
		utils.BadRequest(c, err.Error(), nil)
		return err
	}
	return nil
}
