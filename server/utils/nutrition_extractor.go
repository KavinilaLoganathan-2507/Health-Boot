package utils

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// ExtractedNutritionData represents the structured nutrition data for health analysis
type ExtractedNutritionData struct {
	ProductIdentification      ProductIdentification      `json:"product_identification"`
	NutritionalInformation     NutritionalInformation     `json:"nutritional_information"`
	HealthScoring              HealthScoring              `json:"health_scoring"`
	ProcessingClassification   ProcessingClassification   `json:"processing_classification"`
	FoodCategorization         FoodCategorization         `json:"food_categorization"`
	HealthRiskAssessment       HealthRiskAssessment       `json:"health_risk_assessment"`
	IngredientsAndAdditives    IngredientsAndAdditives    `json:"ingredients_and_additives"`
	ProductImages              ProductImages              `json:"product_images"`
	ConsumptionRecommendations ConsumptionRecommendations `json:"consumption_recommendations"`
	MarketInformation          MarketInformation          `json:"market_information"`
	DataQualityIndicators      DataQualityIndicators      `json:"data_quality_indicators"`
	ExtractionMetadata         ExtractionMetadata         `json:"extraction_metadata"`
}

// Product identification structures
type ProductIdentification struct {
	Barcode            string `json:"barcode"`
	ProductName        string `json:"product_name"`
	Brand              string `json:"brand"`
	Quantity           string `json:"quantity"`
	ProductType        string `json:"product_type"`
	LastUpdated        string `json:"last_updated"`
	DataFreshnessScore string `json:"data_freshness_score"`
}

// Nutritional information structures
type NutritionalInformation struct {
	Per100g              NutrientValues `json:"per_100g"`
	PerServing           NutrientValues `json:"per_serving"`
	NutritionDataQuality string         `json:"nutrition_data_quality"`
	NutritionDataPer     string         `json:"nutrition_data_per"`
}

type NutrientValues struct {
	ServingSize        string   `json:"serving_size,omitempty"`
	ServingDescription string   `json:"serving_description,omitempty"`
	EnergyKcal         float64  `json:"energy_kcal"`
	EnergyKj           float64  `json:"energy_kj"`
	Carbohydrates      float64  `json:"carbohydrates"`
	Sugars             float64  `json:"sugars"`
	Proteins           float64  `json:"proteins"`
	FatTotal           float64  `json:"fat_total"`
	SaturatedFat       float64  `json:"saturated_fat"`
	Salt               float64  `json:"salt"`
	Sodium             float64  `json:"sodium"`
	Fiber              *float64 `json:"fiber"`
	TransFat           *float64 `json:"trans_fat"`
}

// Health scoring structures
type HealthScoring struct {
	Nutriscore            NutriScore            `json:"nutriscore"`
	NutrientLevels        NutrientLevels        `json:"nutrient_levels"`
	NutritionScoreDetails NutritionScoreDetails `json:"nutrition_score_details"`
}

type NutriScore struct {
	Grade            string `json:"grade"`
	Score            int    `json:"score"`
	Version          string `json:"version"`
	GradeDescription string `json:"grade_description"`
}

type NutrientLevels struct {
	Fat          string `json:"fat"`
	SaturatedFat string `json:"saturated_fat"`
	Sugars       string `json:"sugars"`
	Salt         string `json:"salt"`
}

type NutritionScoreDetails struct {
	NegativePoints int `json:"negative_points"`
	PositivePoints int `json:"positive_points"`
	FinalScore     int `json:"final_score"`
}

// Processing classification structures
type ProcessingClassification struct {
	NovaGroup            string               `json:"nova_group"`
	NovaGroupError       string               `json:"nova_group_error"`
	ProcessingIndicators ProcessingIndicators `json:"processing_indicators"`
}

type ProcessingIndicators struct {
	CategoriesSuggestProcessed bool     `json:"categories_suggest_processed"`
	CategoryTags               []string `json:"category_tags"`
	LikelyProcessingLevel      string   `json:"likely_processing_level"`
}

// Food categorization structures
type FoodCategorization struct {
	PrimaryCategory string     `json:"primary_category"`
	Subcategories   []string   `json:"subcategories"`
	FoodGroups      FoodGroups `json:"food_groups"`
}

type FoodGroups struct {
	PnnsGroup1    string `json:"pnns_group_1"`
	PnnsGroup2    string `json:"pnns_group_2"`
	MainFoodGroup string `json:"main_food_group"`
}

// Health risk assessment structures
type HealthRiskAssessment struct {
	MajorHealthAlerts          MajorHealthAlerts          `json:"major_health_alerts"`
	PopulationSpecificWarnings PopulationSpecificWarnings `json:"population_specific_warnings"`
}

type MajorHealthAlerts struct {
	DiabetesRisk         HealthRisk `json:"diabetes_risk"`
	CardiovascularRisk   HealthRisk `json:"cardiovascular_risk"`
	ObesityRisk          HealthRisk `json:"obesity_risk"`
	DentalHealthRisk     HealthRisk `json:"dental_health_risk"`
}

type HealthRisk struct {
	Level                        string  `json:"level"`
	Reason                       string  `json:"reason"`
	SugarPer100g                 float64 `json:"sugar_per_100g,omitempty"`
	SaturatedFatPer100g          float64 `json:"saturated_fat_per_100g,omitempty"`
	CaloriesPer100g              float64 `json:"calories_per_100g,omitempty"`
	SugarPercentageOfProduct     string  `json:"sugar_percentage_of_product,omitempty"`
	SaturatedFatLevel            string  `json:"saturated_fat_level,omitempty"`
}

type PopulationSpecificWarnings struct {
	Children         string `json:"children"`
	Diabetics        string `json:"diabetics"`
	HeartPatients    string `json:"heart_patients"`
	WeightManagement string `json:"weight_management"`
}

// Other structures
type IngredientsAndAdditives struct {
	IngredientsAvailable bool      `json:"ingredients_available"`
	IngredientsStatus    string    `json:"ingredients_status"`
	Allergens            Allergens `json:"allergens"`
	Additives            Additives `json:"additives"`
	Traces               Traces    `json:"traces"`
}

type Allergens struct {
	DeclaredAllergens        []string `json:"declared_allergens"`
	AllergensFromIngredients string   `json:"allergens_from_ingredients"`
	AllergensStatus          string   `json:"allergens_status"`
}

type Additives struct {
	AdditivesDetected bool   `json:"additives_detected"`
	AdditivesStatus   string `json:"additives_status"`
}

type Traces struct {
	DeclaredTraces []string `json:"declared_traces"`
	TracesStatus   string   `json:"traces_status"`
}

type ProductImages struct {
	FrontImage       ImageSet `json:"front_image"`
	IngredientsImage ImageSet `json:"ingredients_image"`
}

type ImageSet struct {
	FullSize  string `json:"full_size"`
	Medium    string `json:"medium"`
	Thumbnail string `json:"thumbnail"`
}

type ConsumptionRecommendations struct {
	SafeServingSize         string                `json:"safe_serving_size"`
	SafeServingReasoning    string                `json:"safe_serving_reasoning"`
	FrequencyRecommendation string                `json:"frequency_recommendation"`
	MaxWeeklyConsumption    string                `json:"max_weekly_consumption"`
	DailyValuePercentages   DailyValuePercentages `json:"daily_value_percentages"`
}

type DailyValuePercentages struct {
	CaloriesPerServing     string `json:"calories_per_serving"`
	SugarsPerServing       string `json:"sugars_per_serving"`
	SaturatedFatPerServing string `json:"saturated_fat_per_serving"`
	SaltPerServing         string `json:"salt_per_serving"`
}

type MarketInformation struct {
	CountriesSold     []string          `json:"countries_sold"`
	PopularityMetrics PopularityMetrics `json:"popularity_metrics"`
}

type PopularityMetrics struct {
	ScansCount        int    `json:"scans_count"`
	UniqueScans       int    `json:"unique_scans"`
	PopularityRanking string `json:"popularity_ranking"`
}

type DataQualityIndicators struct {
	CompletenessScore   float64  `json:"completeness_score"`
	CompleteFields      []string `json:"complete_fields"`
	IncompleteFields    []string `json:"incomplete_fields"`
	DataQualityWarnings []string `json:"data_quality_warnings"`
}

type ExtractionMetadata struct {
	ExtractionTimestamp string          `json:"extraction_timestamp"`
	DataSource          string          `json:"data_source"`
	APIVersion          string          `json:"api_version"`
	ConfidenceScore     ConfidenceScore `json:"confidence_score"`
}

type ConfidenceScore struct {
	NutritionData    string `json:"nutrition_data"`
	HealthAssessment string `json:"health_assessment"`
	IngredientsData  string `json:"ingredients_data"`
	AlternativesData string `json:"alternatives_data"`
}

// ExtractNutritionData extracts structured nutrition data from OpenFoodFacts API response
func ExtractNutritionData(rawData interface{}) (*ExtractedNutritionData, error) {
	dataMap, ok := rawData.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid data format: expected map[string]interface{}")
	}

	// Check if product exists
	status, exists := dataMap["status"]
	if !exists {
		return nil, fmt.Errorf("product not found: status field missing")
	}
	
	// Handle different status types (could be int, float64, or string)
	statusValid := false
	switch v := status.(type) {
	case int:
		statusValid = v == 1
	case float64:
		statusValid = v == 1.0
	case string:
		statusValid = v == "1" || v == "success"
	}
	
	if !statusValid {
		return nil, fmt.Errorf("product not found or invalid: status=%v (type: %T)", status, status)
	}

	productData, exists := dataMap["product"]
	if !exists {
		return nil, fmt.Errorf("product data not found")
	}

	product, ok := productData.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid product data format")
	}

	// Initialize extraction result
	extracted := &ExtractedNutritionData{
		ExtractionMetadata: ExtractionMetadata{
			ExtractionTimestamp: time.Now().Format("2006-01-02T15:04:05Z"),
			DataSource:          "OpenFoodFacts",
			APIVersion:          "detected",
			ConfidenceScore: ConfidenceScore{
				NutritionData:    "high",
				HealthAssessment: "high",
				IngredientsData:  determineIngredientsConfidence(product),
				AlternativesData: "unavailable",
			},
		},
	}

	// Extract all sections
	extracted.ProductIdentification = extractProductIdentification(product)

	nutritionInfo, err := extractNutritionalInformation(product)
	if err != nil {
		return nil, fmt.Errorf("failed to extract nutritional information: %w", err)
	}
	extracted.NutritionalInformation = nutritionInfo

	extracted.HealthScoring = extractHealthScoring(product)
	extracted.ProcessingClassification = extractProcessingClassification(product)
	extracted.FoodCategorization = extractFoodCategorization(product)
	extracted.HealthRiskAssessment = generateHealthRiskAssessment(nutritionInfo, extracted.HealthScoring)
	extracted.IngredientsAndAdditives = extractIngredientsAndAdditives(product)
	extracted.ProductImages = extractProductImages(product)
	extracted.ConsumptionRecommendations = generateConsumptionRecommendations(nutritionInfo)
	extracted.MarketInformation = extractMarketInformation(product)
	extracted.DataQualityIndicators = extractDataQualityIndicators(product)

	return extracted, nil
}

// Extraction helper functions

func extractProductIdentification(product map[string]interface{}) ProductIdentification {
	return ProductIdentification{
		Barcode:            getStringValue(product, "code"),
		ProductName:        getStringValue(product, "product_name"),
		Brand:              getStringValue(product, "brands"),
		Quantity:           getStringValue(product, "quantity"),
		ProductType:        "food",
		LastUpdated:        time.Now().Format("2006-01-02"),
		DataFreshnessScore: "recent",
	}
}

func extractNutritionalInformation(product map[string]interface{}) (NutritionalInformation, error) {
	nutriments, exists := product["nutriments"]
	if !exists {
		return NutritionalInformation{}, fmt.Errorf("nutriments data not found")
	}

	nutrimentsMap, ok := nutriments.(map[string]interface{})
	if !ok {
		return NutritionalInformation{}, fmt.Errorf("invalid nutriments format")
	}

	// Extract per 100g values
	per100g := NutrientValues{
		EnergyKcal:    getFloatValue(nutrimentsMap, "energy-kcal_100g"),
		EnergyKj:      getFloatValue(nutrimentsMap, "energy-kj_100g"),
		Carbohydrates: getFloatValue(nutrimentsMap, "carbohydrates_100g"),
		Sugars:        getFloatValue(nutrimentsMap, "sugars_100g"),
		Proteins:      getFloatValue(nutrimentsMap, "proteins_100g"),
		FatTotal:      getFloatValue(nutrimentsMap, "fat_100g"),
		SaturatedFat:  getFloatValue(nutrimentsMap, "saturated-fat_100g"),
		Salt:          getFloatValue(nutrimentsMap, "salt_100g"),
		Sodium:        getFloatValue(nutrimentsMap, "sodium_100g"),
	}

	// Handle nullable values
	if fiberVal := getFloatValue(nutrimentsMap, "fiber_100g"); fiberVal > 0 {
		per100g.Fiber = &fiberVal
	}
	if transFatVal := getFloatValue(nutrimentsMap, "trans-fat_100g"); transFatVal > 0 {
		per100g.TransFat = &transFatVal
	}

	// Calculate per serving values
	quantity := getStringValue(product, "quantity")
	servingSize := extractServingSize(quantity)

	perServing := calculatePerServing(per100g, servingSize)
	perServing.ServingSize = quantity
	perServing.ServingDescription = fmt.Sprintf("1 portion (%s)", quantity)

	return NutritionalInformation{
		Per100g:              per100g,
		PerServing:           perServing,
		NutritionDataQuality: "complete",
		NutritionDataPer:     "100g",
	}, nil
}

func extractHealthScoring(product map[string]interface{}) HealthScoring {
	nutriscore := NutriScore{
		Grade:            getStringValue(product, "nutriscore_grade"),
		Score:            int(getFloatValue(product, "nutriscore_score")),
		Version:          getStringValue(product, "nutriscore_version"),
		GradeDescription: getNutriScoreDescription(getStringValue(product, "nutriscore_grade")),
	}

	if nutriscore.Version == "" {
		nutriscore.Version = "2023" // Default to latest version
	}

	nutrientLevels := NutrientLevels{
		Fat:          getNestedStringValue(product, "nutrient_levels", "fat"),
		SaturatedFat: getNestedStringValue(product, "nutrient_levels", "saturated-fat"),
		Sugars:       getNestedStringValue(product, "nutrient_levels", "sugars"),
		Salt:         getNestedStringValue(product, "nutrient_levels", "salt"),
	}

	return HealthScoring{
		Nutriscore:     nutriscore,
		NutrientLevels: nutrientLevels,
		NutritionScoreDetails: NutritionScoreDetails{
			NegativePoints: int(getFloatValue(product, "nutriscore_score")),
			PositivePoints: 0,
			FinalScore:     int(getFloatValue(product, "nutriscore_score")),
		},
	}
}

func extractProcessingClassification(product map[string]interface{}) ProcessingClassification {
	categories := getStringValue(product, "categories")
	categoryTags := extractCategoryTags(categories)

	return ProcessingClassification{
		NovaGroup:      getStringValue(product, "nova_group"),
		NovaGroupError: getStringValue(product, "nova_group_error"),
		ProcessingIndicators: ProcessingIndicators{
			CategoriesSuggestProcessed: isProcessedFood(categories),
			CategoryTags:               categoryTags,
			LikelyProcessingLevel:      determineLikelyProcessingLevel(categories),
		},
	}
}

func extractFoodCategorization(product map[string]interface{}) FoodCategorization {
	categories := getStringValue(product, "categories")
	subcategories := strings.Split(categories, ",")

	// Clean up subcategories
	for i, cat := range subcategories {
		subcategories[i] = strings.TrimSpace(cat)
	}

	primaryCategory := "Unknown"
	if len(subcategories) > 0 && subcategories[0] != "" {
		primaryCategory = subcategories[0]
	}

	return FoodCategorization{
		PrimaryCategory: primaryCategory,
		Subcategories:   subcategories,
		FoodGroups: FoodGroups{
			PnnsGroup1:    getStringValue(product, "pnns_groups_1"),
			PnnsGroup2:    getStringValue(product, "pnns_groups_2"),
			MainFoodGroup: getStringValue(product, "food_groups"),
		},
	}
}

func generateHealthRiskAssessment(nutrition NutritionalInformation, scoring HealthScoring) HealthRiskAssessment {
	per100g := nutrition.Per100g

	return HealthRiskAssessment{
		MajorHealthAlerts: MajorHealthAlerts{
			DiabetesRisk:         assessDiabetesRisk(per100g.Sugars),
			CardiovascularRisk:   assessCardiovascularRisk(per100g.SaturatedFat),
			ObesityRisk:          assessObesityRisk(per100g.EnergyKcal),
			DentalHealthRisk:     assessDentalHealthRisk(per100g.Sugars),
		},
		PopulationSpecificWarnings: PopulationSpecificWarnings{
			Children:         assessChildrenRisk(per100g.Sugars),
			Diabetics:        assessDiabeticRisk(per100g.Sugars),
			HeartPatients:    assessHeartPatientRisk(per100g.SaturatedFat),
			WeightManagement: assessWeightManagementRisk(per100g.EnergyKcal),
		},
	}
}

func extractIngredientsAndAdditives(product map[string]interface{}) IngredientsAndAdditives {
	ingredients := getStringValue(product, "ingredients_text")

	return IngredientsAndAdditives{
		IngredientsAvailable: ingredients != "",
		IngredientsStatus:    getIngredientsStatus(ingredients),
		Allergens: Allergens{
			DeclaredAllergens:        extractAllergens(product),
			AllergensFromIngredients: getStringValue(product, "allergens_from_ingredients"),
			AllergensStatus:          "incomplete",
		},
		Additives: Additives{
			AdditivesDetected: false,
			AdditivesStatus:   "cannot_determine_without_ingredients",
		},
		Traces: Traces{
			DeclaredTraces: extractTraces(product),
			TracesStatus:   "incomplete",
		},
	}
}

func extractProductImages(product map[string]interface{}) ProductImages {
	return ProductImages{
		FrontImage: ImageSet{
			FullSize:  getStringValue(product, "image_front_url"),
			Medium:    getStringValue(product, "image_front_small_url"),
			Thumbnail: getStringValue(product, "image_front_thumb_url"),
		},
		IngredientsImage: ImageSet{
			FullSize:  getStringValue(product, "image_ingredients_url"),
			Medium:    getStringValue(product, "image_ingredients_small_url"),
			Thumbnail: getStringValue(product, "image_ingredients_thumb_url"),
		},
	}
}

func generateConsumptionRecommendations(nutrition NutritionalInformation) ConsumptionRecommendations {
	perServing := nutrition.PerServing

	safeServingSize := calculateSafeServingSize(perServing.Sugars, perServing.ServingSize)

	return ConsumptionRecommendations{
		SafeServingSize:         safeServingSize,
		SafeServingReasoning:    "based_on_sugar_content_analysis",
		FrequencyRecommendation: determineFrequencyRecommendation(perServing.Sugars),
		MaxWeeklyConsumption:    calculateMaxWeeklyConsumption(safeServingSize),
		DailyValuePercentages: DailyValuePercentages{
			CaloriesPerServing:     fmt.Sprintf("%.1f%%", (perServing.EnergyKcal/2000)*100),
			SugarsPerServing:       fmt.Sprintf("%.1f%%", (perServing.Sugars/25)*100),
			SaturatedFatPerServing: fmt.Sprintf("%.1f%%", (perServing.SaturatedFat/20)*100),
			SaltPerServing:         fmt.Sprintf("%.1f%%", (perServing.Salt/6)*100),
		},
	}
}

func extractMarketInformation(product map[string]interface{}) MarketInformation {
	countries := extractCountries(product)

	return MarketInformation{
		CountriesSold: countries,
		PopularityMetrics: PopularityMetrics{
			ScansCount:        int(getFloatValue(product, "scans_n")),
			UniqueScans:       int(getFloatValue(product, "unique_scans_n")),
			PopularityRanking: "unknown",
		},
	}
}

func extractDataQualityIndicators(product map[string]interface{}) DataQualityIndicators {
	completenessScore := getFloatValue(product, "completeness")

	completeFields := []string{}
	incompleteFields := []string{}

	// Check field completeness
	if getStringValue(product, "product_name") != "" {
		completeFields = append(completeFields, "product_name")
	} else {
		incompleteFields = append(incompleteFields, "product_name")
	}

	if getStringValue(product, "brands") != "" {
		completeFields = append(completeFields, "brands")
	} else {
		incompleteFields = append(incompleteFields, "brands")
	}

	if getStringValue(product, "quantity") != "" {
		completeFields = append(completeFields, "quantity")
	} else {
		incompleteFields = append(incompleteFields, "quantity")
	}

	if getStringValue(product, "categories") != "" {
		completeFields = append(completeFields, "categories")
	} else {
		incompleteFields = append(incompleteFields, "categories")
	}

	if _, exists := product["nutriments"]; exists {
		completeFields = append(completeFields, "nutrition_facts")
	} else {
		incompleteFields = append(incompleteFields, "nutrition_facts")
	}

	if getStringValue(product, "ingredients_text") == "" {
		incompleteFields = append(incompleteFields, "ingredients")
	} else {
		completeFields = append(completeFields, "ingredients")
	}

	warnings := extractDataQualityWarnings(product)

	return DataQualityIndicators{
		CompletenessScore:   completenessScore,
		CompleteFields:      completeFields,
		IncompleteFields:    incompleteFields,
		DataQualityWarnings: warnings,
	}
}

// Utility functions

func getStringValue(data map[string]interface{}, key string) string {
	if val, exists := data[key]; exists {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

func getFloatValue(data map[string]interface{}, key string) float64 {
	if val, exists := data[key]; exists {
		switch v := val.(type) {
		case float64:
			return v
		case int:
			return float64(v)
		case string:
			if f, err := strconv.ParseFloat(v, 64); err == nil {
				return f
			}
		}
	}
	return 0
}

func getNestedStringValue(data map[string]interface{}, parentKey, childKey string) string {
	if parent, exists := data[parentKey]; exists {
		if parentMap, ok := parent.(map[string]interface{}); ok {
			return getStringValue(parentMap, childKey)
		}
	}
	return ""
}

func extractServingSize(quantity string) float64 {
	if quantity == "" {
		return 100 // Default to 100g
	}
	
	// Remove common units and extract number
	numStr := strings.TrimSuffix(strings.TrimSuffix(quantity, "g"), "ml")
	numStr = strings.TrimSpace(numStr)
	
	if val, err := strconv.ParseFloat(numStr, 64); err == nil {
		return val
	}
	return 100 // Default if parsing fails
}

func calculatePerServing(per100g NutrientValues, servingSize float64) NutrientValues {
	ratio := servingSize / 100.0

	perServing := NutrientValues{
		EnergyKcal:    per100g.EnergyKcal * ratio,
		EnergyKj:      per100g.EnergyKj * ratio,
		Carbohydrates: per100g.Carbohydrates * ratio,
		Sugars:        per100g.Sugars * ratio,
		Proteins:      per100g.Proteins * ratio,
		FatTotal:      per100g.FatTotal * ratio,
		SaturatedFat:  per100g.SaturatedFat * ratio,
		Salt:          per100g.Salt * ratio,
		Sodium:        per100g.Sodium * ratio,
	}

	if per100g.Fiber != nil {
		fiberVal := *per100g.Fiber * ratio
		perServing.Fiber = &fiberVal
	}

	if per100g.TransFat != nil {
		transFatVal := *per100g.TransFat * ratio
		perServing.TransFat = &transFatVal
	}

	return perServing
}

func getNutriScoreDescription(grade string) string {
	switch strings.ToLower(grade) {
	case "a":
		return "excellent_nutritional_quality"
	case "b":
		return "good_nutritional_quality"
	case "c":
		return "fair_nutritional_quality"
	case "d":
		return "poor_nutritional_quality"
	case "e":
		return "very_poor_nutritional_quality"
	default:
		return "unknown"
	}
}

// Risk assessment functions

func assessDiabetesRisk(sugars float64) HealthRisk {
	var level, reason string

	switch {
	case sugars > 25:
		level = "critical"
		reason = "very_high_sugar_content"
	case sugars > 15:
		level = "high"
		reason = "high_sugar_content"
	case sugars > 5:
		level = "moderate"
		reason = "moderate_sugar_content"
	default:
		level = "low"
		reason = "low_sugar_content"
	}

	return HealthRisk{
		Level:                    level,
		Reason:                   reason,
		SugarPer100g:             sugars,
		SugarPercentageOfProduct: fmt.Sprintf("%.1f%%", sugars),
	}
}

func assessCardiovascularRisk(saturatedFat float64) HealthRisk {
	var level, reason string

	switch {
	case saturatedFat > 10:
		level = "high"
		reason = "high_saturated_fat"
	case saturatedFat > 5:
		level = "moderate"
		reason = "moderate_saturated_fat"
	default:
		level = "low"
		reason = "low_saturated_fat"
	}

	return HealthRisk{
		Level:               level,
		Reason:              reason,
		SaturatedFatPer100g: saturatedFat,
		SaturatedFatLevel:   level,
	}
}

func assessObesityRisk(calories float64) HealthRisk {
	var level, reason string

	switch {
	case calories > 500:
		level = "critical"
		reason = "very_high_caloric_density"
	case calories > 300:
		level = "high"
		reason = "high_caloric_density"
	case calories > 150:
		level = "moderate"
		reason = "moderate_caloric_density"
	default:
		level = "low"
		reason = "low_caloric_density"
	}

	return HealthRisk{
		Level:           level,
		Reason:          reason,
		CaloriesPer100g: calories,
	}
}

func assessDentalHealthRisk(sugars float64) HealthRisk {
	var level, reason string

	if sugars > 15 {
		level = "high"
		reason = "very_high_sugar_content"
	} else if sugars > 5 {
		level = "moderate"
		reason = "moderate_sugar_content"
	} else {
		level = "low"
		reason = "low_sugar_content"
	}

	return HealthRisk{
		Level:        level,
		Reason:       reason,
		SugarPer100g: sugars,
	}
}

// Population-specific risk assessment functions

func assessChildrenRisk(sugars float64) string {
	if sugars > 15 {
		return "high_risk_due_to_sugar"
	} else if sugars > 10 {
		return "moderate_risk"
	}
	return "low_risk"
}

func assessDiabeticRisk(sugars float64) string {
	if sugars > 5 {
		return "avoid"
	}
	return "limited_consumption"
}

func assessHeartPatientRisk(saturatedFat float64) string {
	if saturatedFat > 5 {
		return "avoid_due_to_saturated_fat"
	}
	return "limited_consumption"
}

func assessWeightManagementRisk(calories float64) string {
	if calories > 300 {
		return "very_limited_consumption"
	} else if calories > 200 {
		return "limited_consumption"
	}
	return "moderate_consumption"
}

// Consumption recommendation functions

func calculateSafeServingSize(sugars float64, currentServing string) string {
	servingVal := extractServingSize(currentServing)
	
	// Reduce serving size based on sugar content
	if sugars > 15 {
		// Very high sugar - recommend 1/4 serving
		safeSize := servingVal / 4
		return fmt.Sprintf("%.0fg", safeSize)
	} else if sugars > 10 {
		// High sugar - recommend 1/2 serving
		safeSize := servingVal / 2
		return fmt.Sprintf("%.0fg", safeSize)
	}
	
	return currentServing
}

func determineFrequencyRecommendation(sugars float64) string {
	switch {
	case sugars > 20:
		return "special_occasions_only"
	case sugars > 15:
		return "monthly_treat"
	case sugars > 10:
		return "occasional_treat"
	case sugars > 5:
		return "weekly"
	default:
		return "2-3_times_per_week"
	}
}

func calculateMaxWeeklyConsumption(safeServingSize string) string {
	servingVal := extractServingSize(safeServingSize)
	maxWeekly := servingVal * 2 // Maximum 2 safe servings per week
	return fmt.Sprintf("%.0fg", maxWeekly)
}

// Helper functions for processing

func extractCategoryTags(categories string) []string {
	if categories == "" {
		return []string{}
	}

	cats := strings.Split(categories, ",")
	tags := make([]string, 0, len(cats))

	for _, cat := range cats {
		tag := strings.ToLower(strings.TrimSpace(cat))
		tag = strings.ReplaceAll(tag, " ", "-")
		if tag != "" {
			tags = append(tags, tag)
		}
	}

	return tags
}

func isProcessedFood(categories string) bool {
	processedIndicators := []string{"pastries", "sweet", "chocolate", "dessert", "snack", "biscuits", "cakes"}
	catLower := strings.ToLower(categories)

	for _, indicator := range processedIndicators {
		if strings.Contains(catLower, indicator) {
			return true
		}
	}
	return false
}

func determineLikelyProcessingLevel(categories string) string {
	if isProcessedFood(categories) {
		return "ultra_processed"
	}
	return "processed"
}

func determineIngredientsConfidence(product map[string]interface{}) string {
	ingredients := getStringValue(product, "ingredients_text")
	if ingredients != "" {
		return "high"
	}
	return "unavailable"
}

func getIngredientsStatus(ingredients string) string {
	if ingredients == "" {
		return "to-be-completed"
	}
	return "available"
}

func extractAllergens(product map[string]interface{}) []string {
	allergens := getStringValue(product, "allergens")
	if allergens == "" {
		return []string{}
	}

	result := strings.Split(allergens, ",")
	for i, allergen := range result {
		result[i] = strings.TrimSpace(allergen)
	}
	return result
}

func extractTraces(product map[string]interface{}) []string {
	traces := getStringValue(product, "traces")
	if traces == "" {
		return []string{}
	}

	result := strings.Split(traces, ",")
	for i, trace := range result {
		result[i] = strings.TrimSpace(trace)
	}
	return result
}

func extractCountries(product map[string]interface{}) []string {
	countries := getStringValue(product, "countries")
	if countries == "" {
		return []string{}
	}

	result := strings.Split(countries, ",")
	for i, country := range result {
		result[i] = strings.TrimSpace(country)
	}
	return result
}

func extractDataQualityWarnings(product map[string]interface{}) []string {
	warnings := []string{}

	// Check for high values that might be warnings
	if nutriments, exists := product["nutriments"]; exists {
		if nutrimentsMap, ok := nutriments.(map[string]interface{}); ok {
			if sugars := getFloatValue(nutrimentsMap, "sugars_100g"); sugars > 30 {
				warnings = append(warnings, "nutrition-value-very-high-for-category-sugars")
			}
			if carbs := getFloatValue(nutrimentsMap, "carbohydrates_100g"); carbs > 60 {
				warnings = append(warnings, "nutrition-value-very-high-for-category-carbohydrates")
			}
			if salt := getFloatValue(nutrimentsMap, "salt_100g"); salt > 1 {
				warnings = append(warnings, "nutrition-value-very-high-for-category-salt")
			}
		}
	}

	// Check serving size vs product quantity
	quantity := getStringValue(product, "quantity")
	if quantity != "" {
		servingSize := extractServingSize(quantity)
		if servingSize < 50 { // Very small serving size
			warnings = append(warnings, "serving-quantity-very-small")
		}
	}

	return warnings
} 