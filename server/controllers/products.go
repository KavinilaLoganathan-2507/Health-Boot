package controllers

import (
	"amobagan/lib"
	"amobagan/models"
	"amobagan/services"
	"amobagan/utils"

	"github.com/gin-gonic/gin"
)

type ProductController struct {
	nutritionService *services.NutritionAnalysisService
}

func NewProductController() *ProductController {
	nutritionService, err := services.NewNutritionAnalysisService()
	if err != nil {
		nutritionService = nil
	}
	
	return &ProductController{
		nutritionService: nutritionService,
	}
}

func (h *ProductController) GetProductDetailsByBarcode(c *gin.Context) {
	barcode := c.Param("barcode")
	if barcode == "" {
		utils.BadRequest(c, "Barcode is required", nil)
		return
	}
	product, err := lib.RetrieveProductDetailsByBarcode(barcode)
	
	if err != nil {
		utils.NotFound(c, "Product not found")
		return
	}
	
	utils.OK(c, "Product details retrieved successfully", product)
}

func (h *ProductController) AnalyzeNutritionWithPreferences(c *gin.Context) {
	barcode := c.Param("barcode")
	if barcode == "" {
		utils.BadRequest(c, "Barcode is required", nil)
		return
	}

	product, err := lib.RetrieveProductDetailsByBarcode(barcode)
	if err != nil {
		utils.NotFound(c, "Product not found")
		return
	}

	// Parse user preferences from request body
	var userPrefs models.UserPreferences
	if err := c.ShouldBindJSON(&userPrefs); err != nil {
		utils.BadRequest(c, "Invalid user preferences format", err.Error())
		return
	}

	// Validate user preferences
	if len(userPrefs.HealthGoals) == 0 && len(userPrefs.DietaryPreferences) == 0 && len(userPrefs.NutritionPriorities) == 0 {
		utils.BadRequest(c, "At least one health goal, dietary preference, or nutrition priority is required", nil)
		return
	}

	// Check if nutrition service is available
	if h.nutritionService == nil {
		utils.InternalServerError(c, "Nutrition analysis service not available", nil)
		return
	}

	// Perform personalized nutrition analysis
	analysis, err := h.nutritionService.AnalyzeNutritionWithPreferences(product, &userPrefs)
	if err != nil {
		utils.InternalServerError(c, "Failed to analyze nutrition", err.Error())
		return
	}

	// Format the analysis for display
	formattedAnalysis := h.nutritionService.FormatAnalysisForDisplay(analysis)

	utils.OK(c, "Nutrition analysis completed successfully", formattedAnalysis)
}

func (h *ProductController) GetNutritionAnalysis(c *gin.Context) {
	barcode := c.Param("barcode")
	if barcode == "" {
		utils.BadRequest(c, "Barcode is required", nil)
		return
	}

	// Get product data
	product, err := lib.RetrieveProductDetailsByBarcode(barcode)
	if err != nil {
		utils.NotFound(c, "Product not found")
		return
	}

	// Create default user preferences for general analysis
	defaultPrefs := &models.UserPreferences{
		HealthGoals:        []string{models.CleanEating},
		DietaryPreferences: []string{},
		NutritionPriorities: []string{models.NaturalIngredients},
		UserName:           "User",
	}

	// Check if nutrition service is available
	if h.nutritionService == nil {
		utils.InternalServerError(c, "Nutrition analysis service not available", nil)
		return
	}

	// Perform nutrition analysis
	analysis, err := h.nutritionService.AnalyzeNutritionWithPreferences(product, defaultPrefs)
	if err != nil {
		utils.InternalServerError(c, "Failed to analyze nutrition", err.Error())
		return
	}

	// Format the analysis for display
	formattedAnalysis := h.nutritionService.FormatAnalysisForDisplay(analysis)

	utils.OK(c, "Nutrition analysis completed successfully", formattedAnalysis)
}