package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Goal struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID       primitive.ObjectID `json:"userId" bson:"userId"`
	GoalType     string             `json:"goalType" bson:"goalType"`       // weight_loss|weight_gain|hydration|activity|nutrition
	TargetValue  float64            `json:"targetValue" bson:"targetValue"` // e.g. 65 (kg), 8 (glasses), 10000 (steps)
	CurrentValue float64            `json:"currentValue" bson:"currentValue"`
	Unit         string             `json:"unit" bson:"unit"` // kg|glasses|steps|kcal|%
	StartDate    primitive.DateTime `json:"startDate" bson:"startDate"`
	TargetDate   primitive.DateTime `json:"targetDate" bson:"targetDate"`
	Status       string             `json:"status" bson:"status"` // active|completed|abandoned
	CreatedAt    primitive.DateTime `json:"createdAt" bson:"createdAt"`
	UpdatedAt    primitive.DateTime `json:"updatedAt" bson:"updatedAt"`
}

type GoalInput struct {
	GoalType     string  `json:"goalType" binding:"required"`
	TargetValue  float64 `json:"targetValue" binding:"required"`
	CurrentValue float64 `json:"currentValue"`
	Unit         string  `json:"unit" binding:"required"`
	TargetDate   string  `json:"targetDate" binding:"required"` // ISO date string / YYYY-MM-DD
}

type GoalProgressUpdate struct {
	CurrentValue float64 `json:"currentValue" binding:"required"`
}
