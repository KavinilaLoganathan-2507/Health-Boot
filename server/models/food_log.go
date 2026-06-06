package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FoodLog struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	MealType  string             `json:"mealType" bson:"mealType"` // Breakfast|Lunch|Dinner|Snack
	FoodName  string             `json:"foodName" bson:"foodName"`
	Calories  float64            `json:"calories" bson:"calories"`
	Protein   float64            `json:"protein" bson:"protein"`
	Carbs     float64            `json:"carbs" bson:"carbs"`
	Fat       float64            `json:"fat" bson:"fat"`
	Quantity  float64            `json:"quantity" bson:"quantity"`
	CreatedAt primitive.DateTime `json:"createdAt" bson:"createdAt"`
}

type FoodLogInput struct {
	MealType string  `json:"mealType" binding:"required"`
	FoodName string  `json:"foodName" binding:"required"`
	Calories float64 `json:"calories" binding:"required"`
	Protein  float64 `json:"protein"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
	Quantity float64 `json:"quantity"`
}

type DailyNutritionSummary struct {
	TotalCalories float64 `json:"totalCalories"`
	TotalProtein  float64 `json:"totalProtein"`
	TotalCarbs    float64 `json:"totalCarbs"`
	TotalFat      float64 `json:"totalFat"`
	CalorieGoal   float64 `json:"calorieGoal"`
	Remaining     float64 `json:"remaining"`
}
