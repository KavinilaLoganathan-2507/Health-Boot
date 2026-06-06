package models

import "time"

type HealthInsight struct {
	Category       string `json:"category"` // bmi|heart_rate|blood_pressure|hydration|body_fat
	Trend          string `json:"trend"`    // improving|declining|stable
	Summary        string `json:"summary"`
	Recommendation string `json:"recommendation"`
}

type HealthInsightsResponse struct {
	Insights       []HealthInsight `json:"insights"`
	OverallSummary string          `json:"overallSummary"`
	GeneratedAt    time.Time       `json:"generatedAt"`
}
