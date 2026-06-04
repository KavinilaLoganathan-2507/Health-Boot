package models

// NutritionAnalysis represents the structured output for personalized nutrition analysis
type NutritionAnalysis struct {
	ProductName              string                 `json:"product_name"`
	InstantHealthRating      InstantHealthRating    `json:"instant_health_rating"`
	KeyHealthConcerns        []HealthConcern        `json:"key_health_concerns"`
	SmarterAlternatives      []Alternative          `json:"smarter_alternatives"`
	PersonalizedCallout      PersonalizedCallout    `json:"personalized_callout"`
	DetailedNutritionBreakdown *DetailedBreakdown   `json:"detailed_nutrition_breakdown,omitempty"`
}

// InstantHealthRating represents the personalized health rating
type InstantHealthRating struct {
	Grade           string   `json:"grade"`
	Recommendation  string   `json:"recommendation"`
	PositiveAspects []string `json:"positive_aspects"`
	NegativeAspects []string `json:"negative_aspects"`
	FSSAIVerified   bool     `json:"fssai_verified"`
}

// HealthConcern represents a specific health concern for the user
type HealthConcern struct {
	Concern     string `json:"concern"`
	Explanation string `json:"explanation"`
	Impact      string `json:"impact"`
}

// Alternative represents a healthier alternative option
type Alternative struct {
	Name        string   `json:"name"`
	Benefits    []string `json:"benefits"`
	WhyBetter   string   `json:"why_better"`
	KeyFeatures []string `json:"key_features"`
}

// PersonalizedCallout represents the personalized message to the user
type PersonalizedCallout struct {
	Greeting        string `json:"greeting"`
	Acknowledgment  string `json:"acknowledgment"`
	Explanation     string `json:"explanation"`
	Encouragement   string `json:"encouragement"`
	MotivationalClose string `json:"motivational_close"`
}

// DetailedBreakdown represents the optional detailed nutrition breakdown
type DetailedBreakdown struct {
	ServingSize    string                    `json:"serving_size"`
	Nutrients      []NutrientDetail          `json:"nutrients"`
	Additives      []string                  `json:"additives,omitempty"`
	GoalSpecificMetrics *GoalSpecificMetrics `json:"goal_specific_metrics,omitempty"`
}

// NutrientDetail represents detailed nutrient information
type NutrientDetail struct {
	Nutrient   string `json:"nutrient"`
	Amount     string `json:"amount"`
	Assessment string `json:"assessment"`
	DailyValue string `json:"daily_value,omitempty"`
}

// GoalSpecificMetrics represents metrics specific to user goals
type GoalSpecificMetrics struct {
	WeightLossMetrics *WeightLossMetrics `json:"weight_loss_metrics,omitempty"`
	MuscleGainMetrics *MuscleGainMetrics `json:"muscle_gain_metrics,omitempty"`
	HeartHealthMetrics *HeartHealthMetrics `json:"heart_health_metrics,omitempty"`
	DiabetesMetrics *DiabetesMetrics `json:"diabetes_metrics,omitempty"`
}

// WeightLossMetrics represents weight loss specific metrics
type WeightLossMetrics struct {
	CaloricDensity    string `json:"caloric_density"`
	SatietyIndex      string `json:"satiety_index"`
	CravingPotential  string `json:"craving_potential"`
	PortionControl    string `json:"portion_control"`
}

// MuscleGainMetrics represents muscle gain specific metrics
type MuscleGainMetrics struct {
	ProteinQuality    string `json:"protein_quality"`
	ProteinAmount     string `json:"protein_amount"`
	CaloricAdequacy   string `json:"caloric_adequacy"`
	TimingOptimization string `json:"timing_optimization"`
}

// HeartHealthMetrics represents heart health specific metrics
type HeartHealthMetrics struct {
	CardiovascularRisk string `json:"cardiovascular_risk"`
	SaturatedFatLevel  string `json:"saturated_fat_level"`
	SodiumImpact       string `json:"sodium_impact"`
	CholesterolLevel   string `json:"cholesterol_level,omitempty"`
}

// DiabetesMetrics represents diabetes specific metrics
type DiabetesMetrics struct {
	GlycemicIndex     string `json:"glycemic_index"`
	SugarImpact       string `json:"sugar_impact"`
	CarbohydrateCount string `json:"carbohydrate_count"`
	BloodSugarStability string `json:"blood_sugar_stability"`
}

// UserPreferences represents the user's health goals and preferences
type UserPreferences struct {
	HealthGoals        []string `json:"health_goals"`
	DietaryPreferences []string `json:"dietary_preferences"`
	NutritionPriorities []string `json:"nutrition_priorities"`
	UserName           string   `json:"user_name,omitempty"`
}

// HealthGoals constants
const (
	WeightLoss      = "weight_loss"
	MuscleGain      = "muscle_gain"
	HeartHealth     = "heart_health"
	Diabetes        = "diabetes"
	LowSodiumDiet   = "low_sodium_diet"
	SugarControl    = "sugar_control"
	PlantBased      = "plant_based"
	CleanEating     = "clean_eating"
)

// DietaryPreferences constants
const (
	Vegetarian       = "vegetarian"
	Vegan            = "vegan"
	Pescatarian      = "pescatarian"
	Keto             = "keto"
	Ayurvedic        = "ayurvedic"
	Jain             = "jain"
	LowSodium        = "low_sodium"
	LowSugar         = "low_sugar"
	GlutenLactoseFree = "gluten_lactose_free"
)

// NutritionPriorities constants
const (
	HighProtein       = "high_protein"
	LowFat            = "low_fat"
	LowSugarPriority  = "low_sugar_priority"
	LowSodiumPriority = "low_sodium_priority"
	HighFiber         = "high_fiber"
	NoAdditives       = "no_additives"
	NaturalIngredients = "natural_ingredients"
	FSSAIVerified     = "fssai_verified"
) 