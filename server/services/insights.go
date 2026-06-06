package services

import (
	"amobagan/lib"
	"amobagan/models"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"google.golang.org/genai"
)

func GenerateHealthInsights(userID string) (*models.HealthInsightsResponse, error) {
	history, err := GetBiometricHistory(userID)
	if err != nil {
		return nil, err
	}

	if len(history) == 0 {
		return &models.HealthInsightsResponse{
			Insights:       []models.HealthInsight{},
			OverallSummary: "No biometric data available yet. Please complete a biometric analysis to generate insights.",
			GeneratedAt:    time.Now(),
		}, nil
	}

	var sb strings.Builder
	for i, record := range history {
		t := time.Unix(int64(record.CreatedAt)/1000, 0)
		sb.WriteString(fmt.Sprintf("Scan %d on %s:\n", i+1, t.Format("2006-01-02")))
		sb.WriteString(fmt.Sprintf("- Weight: %s kg, BMI: %s (%s)\n", record.Analysis.RawInput.Weight, record.Analysis.BMI, record.Analysis.BMIClassification))
		sb.WriteString(fmt.Sprintf("- Heart Rate: %s bpm (%s)\n", record.Analysis.RawInput.HeartRate, record.Analysis.HeartRateClassification))
		sb.WriteString(fmt.Sprintf("- Blood Pressure: %s/%s mmHg (%s)\n", record.Analysis.RawInput.SystolicBP, record.Analysis.RawInput.DiastolicBP, record.Analysis.BloodPressureClassification))
		sb.WriteString(fmt.Sprintf("- Body Fat: %s%% (%s)\n", record.Analysis.RawInput.BodyFat, record.Analysis.BodyFatClassification))
		sb.WriteString(fmt.Sprintf("- Water (Hydration): %s%% (%s)\n\n", record.Analysis.RawInput.Water, record.Analysis.HydrationStatus))
	}

	client, err := lib.GetGeminiClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %v", err)
	}

	prompt := fmt.Sprintf(`
You are a professional clinical health informatics specialist and wellness coach.
Analyze the user's historical biometric scan records and determine trends for:
1. bmi (weight management)
2. heart_rate (cardiovascular health)
3. blood_pressure (cardiovascular risk)
4. hydration (fluid balance)
5. body_fat (body composition)

Identify whether each trend is "improving", "declining", or "stable" based on normal clinical reference ranges (e.g. Normal BP is <120/<80, Normal BMI is 18.5-24.9, etc.). Provide a concise, clear summary of the trend and a precise, actionable recommendation for each category.

Also write an inspirational, high-level "overallSummary" of their progress and health path.

Here is the user's scan history:
%s

Return ONLY a valid JSON object matching this structure:
{
  "insights": [
    {
      "category": "bmi",
      "trend": "improving",
      "summary": "Your BMI has decreased from X to Y, moving closer to the healthy range.",
      "recommendation": "Maintain your current calorie deficit and keep tracking your meals."
    },
    {
      "category": "heart_rate",
      "trend": "stable",
      "summary": "Your resting heart rate is consistently within the normal range at X bpm.",
      "recommendation": "Continue your cardiovascular workouts 3 times a week."
    },
    {
      "category": "blood_pressure",
      "trend": "declining",
      "summary": "...",
      "recommendation": "..."
    },
    {
      "category": "hydration",
      "trend": "...",
      "summary": "...",
      "recommendation": "..."
    },
    {
      "category": "body_fat",
      "trend": "...",
      "summary": "...",
      "recommendation": "..."
    }
  ],
  "overallSummary": "Your overall health trajectory is promising. You are showing strong consistency in tracking..."
}
Keep recommendations short, direct, and highly actionable. Return only the JSON object. Do not include markdown code block formatting in your response.
`, sb.String())

	response, err := client.Models.GenerateContent(context.Background(), lib.GEMINI_MODEL, genai.Text(prompt), &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
	})
	if err != nil {
		log.Printf("Gemini failed to generate insights: %v", err)
		return generateFallbackInsights(history), nil
	}

	var insightsResponse models.HealthInsightsResponse
	cleanedText := cleanJSONString(response.Text())
	err = json.Unmarshal([]byte(cleanedText), &insightsResponse)
	if err != nil {
		log.Printf("Failed to unmarshal Gemini insights: %v. Raw text: %s", err, response.Text())
		return generateFallbackInsights(history), nil
	}

	insightsResponse.GeneratedAt = time.Now()
	return &insightsResponse, nil
}

func generateFallbackInsights(history []models.BiometricScanRecord) *models.HealthInsightsResponse {
	latest := history[len(history)-1]
	
	insights := []models.HealthInsight{
		{
			Category:       "bmi",
			Trend:          "stable",
			Summary:        fmt.Sprintf("Your latest BMI is %s classified as %s.", latest.Analysis.BMI, latest.Analysis.BMIClassification),
			Recommendation: "Keep monitoring your meals and active minutes to manage your weight.",
		},
		{
			Category:       "heart_rate",
			Trend:          "stable",
			Summary:        fmt.Sprintf("Your heart rate is %s bpm (%s).", latest.Analysis.RawInput.HeartRate, latest.Analysis.HeartRateClassification),
			Recommendation: "Perform moderate cardio exercise to help maintain a strong heart rate.",
		},
		{
			Category:       "blood_pressure",
			Trend:          "stable",
			Summary:        fmt.Sprintf("Your blood pressure is %s/%s mmHg (%s).", latest.Analysis.RawInput.SystolicBP, latest.Analysis.RawInput.DiastolicBP, latest.Analysis.BloodPressureClassification),
			Recommendation: "Reduce salt intake and maintain high physical activity.",
		},
		{
			Category:       "hydration",
			Trend:          "stable",
			Summary:        fmt.Sprintf("Your hydration level is %s%% (%s).", latest.Analysis.RawInput.Water, latest.Analysis.HydrationStatus),
			Recommendation: "Aim to drink at least 8-10 glasses of water daily.",
		},
		{
			Category:       "body_fat",
			Trend:          "stable",
			Summary:        fmt.Sprintf("Your body fat percentage is %s%% (%s).", latest.Analysis.RawInput.BodyFat, latest.Analysis.BodyFatClassification),
			Recommendation: "Incorporate strength training to build lean muscle mass.",
		},
	}

	return &models.HealthInsightsResponse{
		Insights:       insights,
		OverallSummary: "We have processed your biometrics history. Keep up the regular logging to see long-term trend lines.",
		GeneratedAt:    time.Now(),
	}
}
