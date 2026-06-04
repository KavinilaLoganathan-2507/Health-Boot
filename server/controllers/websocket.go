package controllers

import (
	"amobagan/lib"
	"amobagan/models"
	"amobagan/services"
	"amobagan/utils"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WebSocketController struct {
	nutritionService *services.NutritionAnalysisService
	upgrader         websocket.Upgrader
}

func NewWebSocketController() *WebSocketController {
	nutritionService, err := services.NewNutritionAnalysisService()
	if err != nil {
		nutritionService = nil
	}

	return &WebSocketController{
		nutritionService: nutritionService,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins for development
			},
		},
	}
}

type StreamNutritionRequest struct {
	Barcode        string                `json:"barcode"`
	UserPreferences models.UserPreferences `json:"user_preferences"`
}

type StreamMessage struct {
	Type    string      `json:"type"`
	Content string      `json:"content"`
	Data    interface{} `json:"data,omitempty"`
}

func (w *WebSocketController) GetUserPreferences(c *gin.Context) (*models.UserPreferences, error) {
	_, userID, err := utils.VerifyTokenFromQuery(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return nil, err
	}

	user, err := services.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user preferences"})
		return nil, err
	}

	userPrefs := models.UserPreferences{
		HealthGoals:        user.HealthGoals,
		DietaryPreferences: user.DietaryPreferences,
		NutritionPriorities: user.NutritionPriorities,
		UserName:           user.FullName,
	}

	log.Println("User Preferences in getUserPreferences:", userPrefs)
	return &userPrefs, nil
}

func (w *WebSocketController) StreamNutritionAnalysis(c *gin.Context) {
	userPrefs, err := w.GetUserPreferences(c)
	if err != nil {
		return // Error already handled in GetUserPreferences
	}
	
	conn, err := w.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection to WebSocket: %v", err)
		return
	}
	defer conn.Close()

	initialMsg := StreamMessage{
		Type:    "connection",
		Content: "Connected to nutrition analysis stream",
	}
	if err := conn.WriteJSON(initialMsg); err != nil {
		log.Printf("Failed to send initial message: %v", err)
		return
	}

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Failed to read message: %v", err)
			break
		}

		var request StreamNutritionRequest
		if err := json.Unmarshal(message, &request); err != nil {
			errorMsg := StreamMessage{
				Type:    "error",
				Content: "Invalid request format",
			}
			conn.WriteJSON(errorMsg)
			continue
		}

		if request.Barcode == "" {
			errorMsg := StreamMessage{
				Type:    "error",
				Content: "Barcode is required",
			}
			conn.WriteJSON(errorMsg)
			continue
		}

		if w.nutritionService == nil {
			errorMsg := StreamMessage{
				Type:    "error",
				Content: "Nutrition analysis service not available",
			}
			conn.WriteJSON(errorMsg)
			continue
		}

		w.streamNutritionAnalysis(conn, request.Barcode, &request.UserPreferences, userPrefs)
	}
}

func (w *WebSocketController) streamNutritionAnalysis(
	conn *websocket.Conn,
	barcode string,
	requestUserPrefs *models.UserPreferences,
	userPrefs *models.UserPreferences,
) {
	startMsg := StreamMessage{
		Type:    "analysis_start",
		Content: "Starting nutrition analysis...",
		Data: gin.H{
			"barcode": barcode,
		},
	}
	if err := conn.WriteJSON(startMsg); err != nil {
		log.Printf("Failed to send start message: %v", err)
		return
	}

	product, err := lib.RetrieveProductDetailsByBarcode(barcode)
	if err != nil {
		errorMsg := StreamMessage{
			Type:    "error",
			Content: "Product not found",
		}
		conn.WriteJSON(errorMsg)
		return
	}

	productMsg := StreamMessage{
		Type:    "product_found",
		Content: fmt.Sprintf("Found product: %s", product.ProductIdentification.ProductName),
		Data:    product,
	}
	if err := conn.WriteJSON(productMsg); err != nil {
		log.Printf("Failed to send product message: %v", err)
		return
	}

	err = w.nutritionService.StreamNutritionAnalysisWithPreferences(
		conn,
		product,
		userPrefs,
	)
	if err != nil {
		errorMsg := StreamMessage{
			Type:    "error",
			Content: fmt.Sprintf("Analysis failed: %v", err),
		}
		conn.WriteJSON(errorMsg)
		return
	}

	completeMsg := StreamMessage{
		Type:    "analysis_complete",
		Content: "Nutrition analysis completed successfully",
		Data: gin.H{
			"userName": userPrefs.UserName,
		},
	}
	conn.WriteJSON(completeMsg)
} 