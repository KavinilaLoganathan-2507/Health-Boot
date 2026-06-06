package controllers

import (
	"amobagan/lib"
	"amobagan/models"
	"amobagan/services"
	"amobagan/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type QRSessionController struct{}

func NewQRSessionController() *QRSessionController {
	return &QRSessionController{}
}

func (q *QRSessionController) HandleGenerateQR(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		utils.BadRequest(c, "User not authenticated", nil)
		return
	}

	session, err := services.GenerateQRSession(userID)
	if err != nil {
		utils.InternalServerError(c, err.Error(), nil)
		return
	}

	utils.OK(c, "QR session generated successfully", session)
}

func (q *QRSessionController) HandleGetQRStatus(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		utils.BadRequest(c, "Token is required", nil)
		return
	}

	collection := lib.DB.Database("amobagan").Collection("qr_sessions")
	var session models.QRSession
	err := collection.FindOne(c, bson.M{"token": token}).Decode(&session)
	if err != nil {
		utils.NotFound(c, "Session not found")
		return
	}

	utils.OK(c, "Session status retrieved", session)
}

func (q *QRSessionController) HandleValidateQR(c *gin.Context) {
	var input models.QRValidateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, err.Error(), nil)
		return
	}

	session, err := services.ValidateQRSession(input.Token)
	if err != nil {
		utils.BadRequest(c, err.Error(), nil)
		return
	}

	utils.OK(c, "Check-in successful", session)
}
