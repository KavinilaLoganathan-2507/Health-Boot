package services

import (
	"amobagan/lib"
	"amobagan/models"
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CalculateDailyCalorieGoal returns the user's calorie requirements dynamically
func CalculateDailyCalorieGoal(user *models.User) float64 {
	weight, _ := strconv.ParseFloat(user.Weight, 64)
	if weight == 0 {
		weight = 70.0 // default fallback
	}
	heightCm, _ := strconv.ParseFloat(user.Height, 64)
	if heightCm == 0 {
		heightCm = 170.0 // default fallback
	}
	age, _ := strconv.ParseInt(user.Age, 10, 64)
	if age == 0 {
		age = 25 // default fallback
	}
	
	// Default BMR calculation using standard Harris-Benedict formula (male fallback)
	bmr := 10*weight + 6.25*heightCm - 5*float64(age) + 5

	activityFactor := 1.2
	workoutsStr := strings.ToLower(user.WorkOutsPerWeek)
	if strings.Contains(workoutsStr, "1-2") || strings.Contains(workoutsStr, "light") {
		activityFactor = 1.375
	} else if strings.Contains(workoutsStr, "3-5") || strings.Contains(workoutsStr, "moderate") {
		activityFactor = 1.55
	} else if strings.Contains(workoutsStr, "6-7") || strings.Contains(workoutsStr, "active") {
		activityFactor = 1.725
	}

	return bmr * activityFactor
}

func CreateFoodLog(userID string, input models.FoodLogInput) (*models.FoodLog, error) {
	collection := lib.DB.Database("amobagan").Collection("food_logs")
	
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	quantity := input.Quantity
	if quantity <= 0 {
		quantity = 1.0
	}

	foodLog := &models.FoodLog{
		ID:        primitive.NewObjectID(),
		UserID:    userObjectID,
		MealType:  input.MealType,
		FoodName:  input.FoodName,
		Calories:  input.Calories,
		Protein:   input.Protein,
		Carbs:     input.Carbs,
		Fat:       input.Fat,
		Quantity:  quantity,
		CreatedAt: primitive.NewDateTimeFromTime(time.Now()),
	}

	_, err = collection.InsertOne(context.Background(), foodLog)
	if err != nil {
		return nil, fmt.Errorf("failed to insert food log: %v", err)
	}

	return foodLog, nil
}

func GetDailyFoodLogs(userID string, date time.Time) ([]models.FoodLog, error) {
	collection := lib.DB.Database("amobagan").Collection("food_logs")
	
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	// Calculate start and end of target day in local/provided time zone
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 999999999, date.Location())

	filter := bson.M{
		"userId": userObjectID,
		"createdAt": bson.M{
			"$gte": primitive.NewDateTimeFromTime(startOfDay),
			"$lte": primitive.NewDateTimeFromTime(endOfDay),
		},
	}

	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		return nil, fmt.Errorf("failed to find food logs: %v", err)
	}
	defer cursor.Close(context.Background())

	var logs []models.FoodLog
	if err = cursor.All(context.Background(), &logs); err != nil {
		return nil, fmt.Errorf("failed to decode food logs: %v", err)
	}

	if logs == nil {
		logs = []models.FoodLog{}
	}

	return logs, nil
}

func UpdateFoodLog(userID, logID string, input models.FoodLogInput) (*models.FoodLog, error) {
	collection := lib.DB.Database("amobagan").Collection("food_logs")
	
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	logObjectID, err := primitive.ObjectIDFromHex(logID)
	if err != nil {
		return nil, fmt.Errorf("invalid log ID: %v", err)
	}

	quantity := input.Quantity
	if quantity <= 0 {
		quantity = 1.0
	}

	filter := bson.M{
		"_id":    logObjectID,
		"userId": userObjectID,
	}

	update := bson.M{
		"$set": bson.M{
			"mealType": input.MealType,
			"foodName": input.FoodName,
			"calories": input.Calories,
			"protein":  input.Protein,
			"carbs":    input.Carbs,
			"fat":      input.Fat,
			"quantity": quantity,
		},
	}

	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return nil, fmt.Errorf("failed to update food log: %v", err)
	}

	var updatedLog models.FoodLog
	err = collection.FindOne(context.Background(), filter).Decode(&updatedLog)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve updated food log: %v", err)
	}

	return &updatedLog, nil
}

func DeleteFoodLog(userID, logID string) error {
	collection := lib.DB.Database("amobagan").Collection("food_logs")
	
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return fmt.Errorf("invalid user ID: %v", err)
	}

	logObjectID, err := primitive.ObjectIDFromHex(logID)
	if err != nil {
		return fmt.Errorf("invalid log ID: %v", err)
	}

	filter := bson.M{
		"_id":    logObjectID,
		"userId": userObjectID,
	}

	result, err := collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return fmt.Errorf("failed to delete food log: %v", err)
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("food log not found or unauthorized")
	}

	return nil
}

func GetDailyNutritionSummary(userID string, date time.Time) (*models.DailyNutritionSummary, error) {
	logs, err := GetDailyFoodLogs(userID, date)
	if err != nil {
		return nil, err
	}

	// Fetch user to calculate daily goals
	user, err := GetUserByID(userID)
	var calorieGoal float64 = 2000.0 // standard default
	if err == nil && user != nil {
		calorieGoal = CalculateDailyCalorieGoal(user)
	}

	summary := &models.DailyNutritionSummary{
		CalorieGoal: calorieGoal,
	}

	for _, logEntry := range logs {
		summary.TotalCalories += logEntry.Calories * logEntry.Quantity
		summary.TotalProtein += logEntry.Protein * logEntry.Quantity
		summary.TotalCarbs += logEntry.Carbs * logEntry.Quantity
		summary.TotalFat += logEntry.Fat * logEntry.Quantity
	}

	summary.Remaining = calorieGoal - summary.TotalCalories
	if summary.Remaining < 0 {
		summary.Remaining = 0
	}

	return summary, nil
}

func GetWeeklyNutritionTrend(userID string) ([]models.DailyNutritionSummary, error) {
	trend := make([]models.DailyNutritionSummary, 7)
	now := time.Now()
	for i := 0; i < 7; i++ {
		d := now.AddDate(0, 0, -i)
		summary, err := GetDailyNutritionSummary(userID, d)
		if err != nil {
			return nil, fmt.Errorf("failed to get nutrition summary for offset %d: %v", -i, err)
		}
		// Store in chronological order (index 0 is 6 days ago, index 6 is today)
		trend[6-i] = *summary
	}
	return trend, nil
}
