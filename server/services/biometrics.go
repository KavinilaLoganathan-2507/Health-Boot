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
	var riskBreakdown []string

	// 1. BMI & BMI Classification
	var bmi float64
	if heightM > 0 {
		bmi = weight / (heightM * heightM)
	}
	analysis.BMI = fmt.Sprintf("%.1f", bmi)

	if bmi < 18.5 {
		analysis.BMIClassification = "Underweight"
		analysis.BMIReason = fmt.Sprintf("BMI %.1f < 18.5", bmi)
		riskScorePoints += 1
		riskBreakdown = append(riskBreakdown, "BMI(1)")
	} else if bmi < 25 {
		analysis.BMIClassification = "Normal"
		analysis.BMIReason = fmt.Sprintf("BMI %.1f is between 18.5 and 24.9", bmi)
		riskBreakdown = append(riskBreakdown, "BMI(0)")
	} else if bmi < 30 {
		analysis.BMIClassification = "Overweight"
		analysis.BMIReason = fmt.Sprintf("BMI %.1f is between 25.0 and 29.9", bmi)
		riskScorePoints += 1
		riskBreakdown = append(riskBreakdown, "BMI(1)")
	} else {
		analysis.BMIClassification = "Obese"
		analysis.BMIReason = fmt.Sprintf("BMI %.1f ≥ 30", bmi)
		riskScorePoints += 2
		riskBreakdown = append(riskBreakdown, "BMI(2)")
	}

	// 2. Body Fat Classification
	if gender == "male" {
		if bodyFat < 6 {
			analysis.BodyFatClassification = "Essential Fat"
			analysis.BodyFatReason = fmt.Sprintf("Body fat %.1f%% < 6%% (male)", bodyFat)
			riskBreakdown = append(riskBreakdown, "BodyFat(0)")
		} else if bodyFat <= 24 {
			analysis.BodyFatClassification = "Healthy"
			analysis.BodyFatReason = fmt.Sprintf("Body fat %.1f%% is between 6%% and 24%% (male healthy range)", bodyFat)
			riskBreakdown = append(riskBreakdown, "BodyFat(0)")
		} else {
			analysis.BodyFatClassification = "High Fat"
			analysis.BodyFatReason = fmt.Sprintf("Body fat %.1f%% > 24%% (male threshold)", bodyFat)
			riskScorePoints += 1
			riskBreakdown = append(riskBreakdown, "BodyFat(1)")
		}
	} else {
		if bodyFat < 14 {
			analysis.BodyFatClassification = "Essential Fat"
			analysis.BodyFatReason = fmt.Sprintf("Body fat %.1f%% < 14%% (female)", bodyFat)
			riskBreakdown = append(riskBreakdown, "BodyFat(0)")
		} else if bodyFat <= 31 {
			analysis.BodyFatClassification = "Healthy"
			analysis.BodyFatReason = fmt.Sprintf("Body fat %.1f%% is between 14%% and 31%% (female healthy range)", bodyFat)
			riskBreakdown = append(riskBreakdown, "BodyFat(0)")
		} else {
			analysis.BodyFatClassification = "High Fat"
			analysis.BodyFatReason = fmt.Sprintf("Body fat %.1f%% > 31%% (female threshold)", bodyFat)
			riskScorePoints += 1
			riskBreakdown = append(riskBreakdown, "BodyFat(1)")
		}
	}

	// 3. Heart Rate Classification
	if heartRate < 60 {
		analysis.HeartRateClassification = "Low"
		analysis.HeartRateReason = fmt.Sprintf("%d bpm < 60 bpm", heartRate)
		riskScorePoints += 1
		riskBreakdown = append(riskBreakdown, "HR(1)")
	} else if heartRate <= 100 {
		analysis.HeartRateClassification = "Normal"
		analysis.HeartRateReason = fmt.Sprintf("%d bpm is between 60 and 100 bpm", heartRate)
		riskBreakdown = append(riskBreakdown, "HR(0)")
	} else {
		analysis.HeartRateClassification = "High"
		analysis.HeartRateReason = fmt.Sprintf("%d bpm > 100 bpm", heartRate)
		riskScorePoints += 1
		riskBreakdown = append(riskBreakdown, "HR(1)")
	}

	// 4. Blood Pressure Classification (with validation)
	if systolicBP < 50 || diastolicBP < 30 {
		analysis.BloodPressureClassification = "Invalid Reading"
		analysis.BloodPressureReason = fmt.Sprintf("%d/%d mmHg is below the physiological range. Please measure again.", systolicBP, diastolicBP)
		// No risk points for invalid readings
		riskBreakdown = append(riskBreakdown, "BP(0-invalid)")
	} else if systolicBP < 120 && diastolicBP < 80 {
		analysis.BloodPressureClassification = "Normal"
		analysis.BloodPressureReason = fmt.Sprintf("Systolic %d < 120 and Diastolic %d < 80", systolicBP, diastolicBP)
		riskBreakdown = append(riskBreakdown, "BP(0)")
	} else if systolicBP <= 129 && diastolicBP < 80 {
		analysis.BloodPressureClassification = "Elevated"
		analysis.BloodPressureReason = fmt.Sprintf("Systolic %d is between 120-129 and Diastolic %d < 80", systolicBP, diastolicBP)
		riskScorePoints += 1
		riskBreakdown = append(riskBreakdown, "BP(1)")
	} else if systolicBP <= 139 || (diastolicBP >= 80 && diastolicBP <= 89) {
		analysis.BloodPressureClassification = "Stage 1 Hypertension"
		analysis.BloodPressureReason = fmt.Sprintf("Systolic %d (130-139) or Diastolic %d (80-89)", systolicBP, diastolicBP)
		riskScorePoints += 2
		riskBreakdown = append(riskBreakdown, "BP(2)")
	} else {
		analysis.BloodPressureClassification = "Stage 2 Hypertension"
		analysis.BloodPressureReason = fmt.Sprintf("Systolic %d ≥ 140 or Diastolic %d ≥ 90", systolicBP, diastolicBP)
		riskScorePoints += 3
		riskBreakdown = append(riskBreakdown, "BP(3)")
	}

	// 5. Hydration Status
	if water < 50 {
		analysis.HydrationStatus = "Dehydrated"
		analysis.HydrationReason = fmt.Sprintf("Water %.0f%% < 50%%", water)
		riskScorePoints += 1
		riskBreakdown = append(riskBreakdown, "Hydration(1)")
	} else if water <= 65 {
		analysis.HydrationStatus = "Normal"
		analysis.HydrationReason = fmt.Sprintf("Water %.0f%% is between 50%% and 65%%", water)
		riskBreakdown = append(riskBreakdown, "Hydration(0)")
	} else {
		analysis.HydrationStatus = "Excellent"
		analysis.HydrationReason = fmt.Sprintf("Water %.0f%% > 65%%", water)
		riskBreakdown = append(riskBreakdown, "Hydration(0)")
	}

	// 6. BMR
	var bmr float64
	if gender == "male" {
		bmr = 10*weight + 6.25*heightCm - 5*float64(age) + 5
		analysis.BMRReason = fmt.Sprintf("Male: 10×%.0f + 6.25×%.0f - 5×%d + 5 = %.0f kcal/day", weight, heightCm, age, bmr)
	} else {
		bmr = 10*weight + 6.25*heightCm - 5*float64(age) - 161
		analysis.BMRReason = fmt.Sprintf("Female: 10×%.0f + 6.25×%.0f - 5×%d - 161 = %.0f kcal/day", weight, heightCm, age, bmr)
	}
	analysis.BMR = fmt.Sprintf("%.0f kcal/day", bmr)

	// 7. Daily Calorie Requirement
	activityFactor := 1.2 // Sedentary default
	activityLevel := "Sedentary"
	workoutsStr := strings.ToLower(user.WorkOutsPerWeek)
	if strings.Contains(workoutsStr, "1-2") || strings.Contains(workoutsStr, "light") {
		activityFactor = 1.375
		activityLevel = "Light (1-2 workouts/week)"
	} else if strings.Contains(workoutsStr, "3-5") || strings.Contains(workoutsStr, "moderate") {
		activityFactor = 1.55
		activityLevel = "Moderate (3-5 workouts/week)"
	} else if strings.Contains(workoutsStr, "6-7") || strings.Contains(workoutsStr, "active") {
		activityFactor = 1.725
		activityLevel = "Active (6-7 workouts/week)"
	}
	dailyCals := bmr * activityFactor
	analysis.DailyCalorieRequirement = fmt.Sprintf("%.0f kcal/day", dailyCals)
	analysis.DailyCalorieReason = fmt.Sprintf("BMR %.0f × %.3f (%s) = %.0f kcal/day", bmr, activityFactor, activityLevel, dailyCals)

	// 8. Ideal Weight Range
	minWeight := 18.5 * heightM * heightM
	maxWeight := 24.9 * heightM * heightM
	analysis.IdealWeightRange = fmt.Sprintf("%.1fkg - %.1fkg", minWeight, maxWeight)
	analysis.IdealWeightReason = fmt.Sprintf("18.5 × %.2f² = %.1fkg, 24.9 × %.2f² = %.1fkg", heightM, minWeight, heightM, maxWeight)

	// 9. Risk Score
	if riskScorePoints <= 2 {
		analysis.RiskScore = "Low Risk"
	} else if riskScorePoints <= 5 {
		analysis.RiskScore = "Medium Risk"
	} else {
		analysis.RiskScore = "High Risk"
	}
	analysis.RiskScoreReason = fmt.Sprintf("Total: %d = %s", riskScorePoints, strings.Join(riskBreakdown, " + "))

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
  "mealPlanForDay": "A suggested 1-day meal plan (Breakfast, Lunch, Dinner, Snack) totaling around the daily calorie requirement that fits their dietary preferences...",
  "workoutPlan": "A concise, targeted daily workout plan based on their BMI, heart rate, and health status."
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
		analysis.WorkoutPlan = "Workout plan unavailable."
		return analysis, nil
	}

	type AIResponse struct {
		NutritionAdvice string `json:"nutritionAdvice"`
		HydrationAlerts string `json:"hydrationAlerts"`
		WellnessGoals   string `json:"wellnessGoals"`
		LifestyleTips   string `json:"lifestyleTips"`
		MealPlanForDay  any    `json:"mealPlanForDay"`
		WorkoutPlan     string `json:"workoutPlan"`
	}

	var aiResp AIResponse
	cleanedText := cleanJSONString(response.Text())
	err = json.Unmarshal([]byte(cleanedText), &aiResp)
	if err != nil {
		log.Printf("Failed to parse Gemini response: %v. Raw response: %s. Cleaned: %s", err, response.Text(), cleanedText)
	} else {
		analysis.NutritionAdvice = aiResp.NutritionAdvice
		analysis.HydrationAlerts = aiResp.HydrationAlerts
		analysis.WellnessGoals = aiResp.WellnessGoals
		analysis.LifestyleTips = aiResp.LifestyleTips
		
		// Robust parsing for MealPlanForDay since Gemini sometimes returns an object instead of a string
		if mpString, ok := aiResp.MealPlanForDay.(string); ok {
			analysis.MealPlanForDay = mpString
		} else if mpMap, ok := aiResp.MealPlanForDay.(map[string]interface{}); ok {
			var sb strings.Builder
			for k, v := range mpMap {
				sb.WriteString(fmt.Sprintf("%s: %v\n", k, v))
			}
			analysis.MealPlanForDay = sb.String()
		} else {
			analysis.MealPlanForDay = "Meal plan generated but format was unrecognized."
		}

		analysis.WorkoutPlan = aiResp.WorkoutPlan
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

func cleanJSONString(raw string) string {
	cleaned := strings.TrimSpace(raw)
	if strings.HasPrefix(cleaned, "```") {
		// Find first newline
		if firstNL := strings.Index(cleaned, "\n"); firstNL != -1 {
			cleaned = cleaned[firstNL+1:]
		}
		// Remove trailing backticks
		if strings.HasSuffix(cleaned, "```") {
			cleaned = cleaned[:len(cleaned)-3]
		}
		cleaned = strings.TrimSpace(cleaned)
	}
	return cleaned
}
