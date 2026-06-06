package services

import (
	"amobagan/lib"
	"amobagan/models"
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateGoal(userID string, input models.GoalInput) (*models.Goal, error) {
	collection := lib.DB.Database("amobagan").Collection("goals")

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	targetTime := time.Now().AddDate(0, 1, 0) // default 1 month out
	if input.TargetDate != "" {
		parsedDate, err := time.Parse(time.RFC3339, input.TargetDate)
		if err != nil {
			parsedDate, err = time.Parse("2006-01-02", input.TargetDate)
		}
		if err == nil {
			targetTime = parsedDate
		}
	}

	now := time.Now()
	
	goal := &models.Goal{
		ID:           primitive.NewObjectID(),
		UserID:       userObjectID,
		GoalType:     input.GoalType,
		TargetValue:  input.TargetValue,
		CurrentValue: input.CurrentValue,
		Unit:         input.Unit,
		StartDate:    primitive.NewDateTimeFromTime(now),
		TargetDate:   primitive.NewDateTimeFromTime(targetTime),
		Status:       "active",
		CreatedAt:    primitive.NewDateTimeFromTime(now),
		UpdatedAt:    primitive.NewDateTimeFromTime(now),
	}

	// Double-check completion upon initial creation
	completed := false
	if goal.GoalType == "weight_loss" {
		if goal.CurrentValue <= goal.TargetValue {
			completed = true
		}
	} else {
		if goal.CurrentValue >= goal.TargetValue {
			completed = true
		}
	}
	if completed {
		goal.Status = "completed"
	}

	_, err = collection.InsertOne(context.Background(), goal)
	if err != nil {
		return nil, fmt.Errorf("failed to insert goal: %v", err)
	}

	return goal, nil
}

func GetUserGoals(userID string) ([]models.Goal, error) {
	collection := lib.DB.Database("amobagan").Collection("goals")

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	filter := bson.M{"userId": userObjectID}
	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		return nil, fmt.Errorf("failed to find goals: %v", err)
	}
	defer cursor.Close(context.Background())

	var goals []models.Goal
	if err = cursor.All(context.Background(), &goals); err != nil {
		return nil, fmt.Errorf("failed to decode goals: %v", err)
	}

	if goals == nil {
		goals = []models.Goal{}
	}

	return goals, nil
}

func UpdateGoalProgress(userID, goalID string, update models.GoalProgressUpdate) (*models.Goal, error) {
	collection := lib.DB.Database("amobagan").Collection("goals")

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	goalObjectID, err := primitive.ObjectIDFromHex(goalID)
	if err != nil {
		return nil, fmt.Errorf("invalid goal ID: %v", err)
	}

	filter := bson.M{
		"_id":    goalObjectID,
		"userId": userObjectID,
	}

	var goal models.Goal
	err = collection.FindOne(context.Background(), filter).Decode(&goal)
	if err != nil {
		return nil, fmt.Errorf("goal not found: %v", err)
	}

	completed := false
	if goal.GoalType == "weight_loss" {
		if update.CurrentValue <= goal.TargetValue {
			completed = true
		}
	} else {
		if update.CurrentValue >= goal.TargetValue {
			completed = true
		}
	}

	status := "active"
	if completed {
		status = "completed"
	}

	updateBSON := bson.M{
		"$set": bson.M{
			"currentValue": update.CurrentValue,
			"status":       status,
			"updatedAt":    primitive.NewDateTimeFromTime(time.Now()),
		},
	}

	_, err = collection.UpdateOne(context.Background(), filter, updateBSON)
	if err != nil {
		return nil, fmt.Errorf("failed to update goal: %v", err)
	}

	var updatedGoal models.Goal
	err = collection.FindOne(context.Background(), filter).Decode(&updatedGoal)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve updated goal: %v", err)
	}

	return &updatedGoal, nil
}

func DeleteGoal(userID, goalID string) error {
	collection := lib.DB.Database("amobagan").Collection("goals")

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return fmt.Errorf("invalid user ID: %v", err)
	}

	goalObjectID, err := primitive.ObjectIDFromHex(goalID)
	if err != nil {
		return fmt.Errorf("invalid goal ID: %v", err)
	}

	filter := bson.M{
		"_id":    goalObjectID,
		"userId": userObjectID,
	}

	result, err := collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return fmt.Errorf("failed to delete goal: %v", err)
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("goal not found or unauthorized")
	}

	return nil
}
