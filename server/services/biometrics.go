package services

import (
	"amobagan/lib"
	"amobagan/models"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/genai"
)

func AnalyzeBiometrics(userID string, input models.BiometricInput) (*models.BiometricAnalysisResponse, error) {
	// Fetch user to get height, age, activity level
	user, err := GetUserByID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %v", err)
	}

	analysis := &models.BiometricAnalysisResponse{
		RawInput: input,
	}

	// Parsing inputs
	weight, _ := strconv.ParseFloat(input.Weight, 64)
	heightCm, _ := strconv.ParseFloat(user.Height, 64)
	if heightCm == 0 {
		heightCm = 170 // Default
	}
	heightM := heightCm / 100.0
	age, _ := strconv.ParseInt(user.Age, 10, 64)
	if age == 0 {
		age = 25 // Default
	}
	bodyFat, _ := strconv.ParseFloat(input.BodyFat, 64)
	water, _ := strconv.ParseFloat(input.Water, 64)
	systolicBP, _ := strconv.ParseInt(input.SystolicBP, 10, 64)
	diastolicBP, _ := strconv.ParseInt(input.DiastolicBP, 10, 64)
	heartRate, _ := strconv.ParseInt(input.HeartRate, 10, 64)

	// Gender from input
	gender := strings.ToLower(input.Gender)
	if gender != "male" && gender != "female" {
		gender = "male" // Default fallback
	}

	var riskScorePoints int

	// 1. BMI & BMI Classification
	var bmi float64
	if heightM > 0 {
		bmi = weight / (heightM * heightM)
	}
	analysis.BMI = fmt.Sprintf("%.1f", bmi)

	if bmi < 18.5 {
		analysis.BMIClassification = "Underweight"
		riskScorePoints += 1
	} else if bmi < 25 {
		analysis.BMIClassification = "Normal"
	} else if bmi < 30 {
		analysis.BMIClassification = "Overweight"
		riskScorePoints += 1
	} else {
		analysis.BMIClassification = "Obese"
		riskScorePoints += 2
	}

	// 2. Body Fat Classification
	if gender == "male" {
		if bodyFat < 6 {
			analysis.BodyFatClassification = "Essential Fat"
		} else if bodyFat <= 24 {
			analysis.BodyFatClassification = "Healthy"
		} else {
			analysis.BodyFatClassification = "High Fat"
			riskScorePoints += 1
		}
	} else {
		if bodyFat < 14 {
			analysis.BodyFatClassification = "Essential Fat"
		} else if bodyFat <= 31 {
			analysis.BodyFatClassification = "Healthy"
		} else {
			analysis.BodyFatClassification = "High Fat"
			riskScorePoints += 1
		}
	}

	// 3. Heart Rate Classification
	if heartRate < 60 {
		analysis.HeartRateClassification = "Low"
		riskScorePoints += 1
	} else if heartRate <= 100 {
		analysis.HeartRateClassification = "Normal"
	} else {
		analysis.HeartRateClassification = "High"
		riskScorePoints += 2
	}

	// 4. Blood Pressure Classification
	if systolicBP < 120 && diastolicBP < 80 {
		analysis.BloodPressureClassification = "Normal"
	} else if systolicBP <= 129 && diastolicBP < 80 {
		analysis.BloodPressureClassification = "Elevated"
		riskScorePoints += 1
	} else if systolicBP <= 139 || (diastolicBP >= 80 && diastolicBP <= 89) {
		analysis.BloodPressureClassification = "Stage 1 Hypertension"
		riskScorePoints += 2
	} else {
		analysis.BloodPressureClassification = "Stage 2 Hypertension"
		riskScorePoints += 3
	}

	// 5. Hydration Status
	if water < 50 {
		analysis.HydrationStatus = "Dehydrated"
		riskScorePoints += 1
	} else if water <= 65 {
		analysis.HydrationStatus = "Normal"
	} else {
		analysis.HydrationStatus = "Excellent"
	}

	// 6. BMR
	var bmr float64
	if gender == "male" {
		bmr = 10*weight + 6.25*heightCm - 5*float64(age) + 5
	} else {
		bmr = 10*weight + 6.25*heightCm - 5*float64(age) - 161
	}
	analysis.BMR = fmt.Sprintf("%.0f kcal/day", bmr)

	// 7. Daily Calorie Requirement
	activityFactor := 1.2 // Sedentary default
	workoutsStr := strings.ToLower(user.WorkOutsPerWeek)
	if strings.Contains(workoutsStr, "1-2") || strings.Contains(workoutsStr, "light") {
		activityFactor = 1.375
	} else if strings.Contains(workoutsStr, "3-5") || strings.Contains(workoutsStr, "moderate") {
		activityFactor = 1.55
	} else if strings.Contains(workoutsStr, "6-7") || strings.Contains(workoutsStr, "active") {
		activityFactor = 1.725
	}
	dailyCals := bmr * activityFactor
	analysis.DailyCalorieRequirement = fmt.Sprintf("%.0f kcal/day", dailyCals)

	// 8. Ideal Weight Range
	minWeight := 18.5 * heightM * heightM
	maxWeight := 24.9 * heightM * heightM
	analysis.IdealWeightRange = fmt.Sprintf("%.1fkg - %.1fkg", minWeight, maxWeight)

	// 9. Risk Score
	if riskScorePoints <= 2 {
		analysis.RiskScore = "Low Risk"
	} else if riskScorePoints <= 5 {
		analysis.RiskScore = "Medium Risk"
	} else {
		analysis.RiskScore = "High Risk"
	}

	// AI Call for Recommendations
	client, err := lib.GetGeminiClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %v", err)
	}

	dietaryPreferences := strings.Join(user.DietaryPreferences, ", ")
	if dietaryPreferences == "" {
		dietaryPreferences = "No specific preference"
	}

	prompt := fmt.Sprintf(`
You are a professional wellness AI. Based on the user's deterministic biometrics calculation:
- BMI: %s (%s)
- Body Fat: %s%% (%s)
- Heart Rate: %s bpm (%s)
- Blood Pressure: %s/%s mmHg (%s)
- Hydration Status: %s
- Daily Calories needed: %s
- Risk Score: %s
- Dietary Preferences: %s

Provide personalized recommendations. Return ONLY a valid JSON object exactly matching this structure:
{
  "nutritionAdvice": "Concise nutrition advice incorporating daily calories...",
  "hydrationAlerts": "Concise hydration advice...",
  "wellnessGoals": "Concise wellness goals...",
  "lifestyleTips": "Concise lifestyle tips...",
  "mealPlanForDay": "A suggested 1-day meal plan (Breakfast, Lunch, Dinner, Snack) totaling around the daily calorie requirement that fits their dietary preferences..."
}
Keep the advice concise, positive, and direct.
`, analysis.BMI, analysis.BMIClassification, input.BodyFat, analysis.BodyFatClassification, 
	input.HeartRate, analysis.HeartRateClassification, input.SystolicBP, input.DiastolicBP, 
	analysis.BloodPressureClassification, analysis.HydrationStatus, analysis.DailyCalorieRequirement, 
	analysis.RiskScore, dietaryPreferences)

	response, err := client.Models.GenerateContent(context.Background(), lib.GEMINI_MODEL, genai.Text(prompt), &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
	})
	
	if err != nil {
		log.Printf("Failed to generate content with Gemini: %v", err)
		// Fallback if Gemini fails
		analysis.NutritionAdvice = "Data processing successful, but AI recommendations are currently unavailable."
		analysis.HydrationAlerts = "Stay hydrated according to your hydration status."
		analysis.WellnessGoals = "Aim for your ideal weight range."
		analysis.LifestyleTips = "Maintain a balanced lifestyle."
		analysis.MealPlanForDay = "Meal plan unavailable."
		return analysis, nil
	}

	type AIResponse struct {
		NutritionAdvice string `json:"nutritionAdvice"`
		HydrationAlerts string `json:"hydrationAlerts"`
		WellnessGoals   string `json:"wellnessGoals"`
		LifestyleTips   string `json:"lifestyleTips"`
		MealPlanForDay  string `json:"mealPlanForDay"`
	}

	var aiResp AIResponse
	err = json.Unmarshal([]byte(response.Text()), &aiResp)
	if err != nil {
		log.Printf("Failed to parse Gemini response: %v. Raw response: %s", err, response.Text())
	} else {
		analysis.NutritionAdvice = aiResp.NutritionAdvice
		analysis.HydrationAlerts = aiResp.HydrationAlerts
		analysis.WellnessGoals = aiResp.WellnessGoals
		analysis.LifestyleTips = aiResp.LifestyleTips
		analysis.MealPlanForDay = aiResp.MealPlanForDay
	}

	// Save to MongoDB
	collection := lib.DB.Database("amobagan").Collection("biometric_scans")
	
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Printf("Invalid user ID for saving biometrics: %v", err)
		return analysis, nil // Return analysis anyway
	}

	record := models.BiometricScanRecord{
		ID:        primitive.NewObjectID(),
		UserID:    objectID,
		CreatedAt: primitive.DateTime(time.Now().UnixNano() / int64(time.Millisecond)),
		Analysis:  *analysis,
	}

	_, err = collection.InsertOne(context.Background(), record)
	if err != nil {
		log.Printf("Failed to save biometric scan to database: %v", err)
	}

	return analysis, nil
}

// GetBiometricHistory fetches the user's past biometric scans
func GetBiometricHistory(userID string) ([]models.BiometricScanRecord, error) {
	collection := lib.DB.Database("amobagan").Collection("biometric_scans")
	
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	// Find records for user, sorted by CreatedAt ascending
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: 1}})
	cursor, err := collection.Find(context.Background(), bson.M{"userId": objectID}, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch history: %v", err)
	}
	defer cursor.Close(context.Background())

	var history []models.BiometricScanRecord
	if err = cursor.All(context.Background(), &history); err != nil {
		return nil, fmt.Errorf("failed to decode history: %v", err)
	}

	return history, nil
}
