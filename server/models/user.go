package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                 primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	FullName           string             `json:"fullName" bson:"fullName" binding:"required"`
	PhoneNo            string             `json:"phoneNo" bson:"phoneNo" binding:"required,min=10,max=10"`
	Password           string             `json:"password" bson:"password" binding:"required,min=6"`
	HealthStatus       string             `json:"healthStatus" bson:"healthStatus"`
	HealthGoals        []string  `json:"healthGoals" bson:"healthGoals"`
	DietaryPreferences []string  `json:"dietaryPreferences" bson:"dietaryPreferences"`
	NutritionPriorities []string  `json:"nutritionPriorities" bson:"nutritionPriorities"`
	WorkOutsPerWeek     string              `json:"workOutsPerWeek" bson:"workOutsPerWeek"`
	Age                string              `json:"age" bson:"age"`
	Height             string              `json:"height" bson:"height"`
	Weight             string              `json:"weight" bson:"weight"`
	NutritionalStatus  map[string]int      `json:"nutritionalStatus" bson:"nutritionalStatus"`
}

// NutritionalUpdateRequest represents the request to update nutritional status
type NutritionalUpdateRequest struct {
	NutritionalElements []string `json:"nutritionalElements" binding:"required"`
}