package services

import (
	"amobagan/lib"
	"amobagan/models"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"google.golang.org/genai"
)

func GetUserByID(userID string) (*models.User, error) {
	collection := lib.DB.Database("amobagan").Collection("users")
	
	log.Printf("Looking for user with ID: %s", userID)
	
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Printf("Error converting userID to ObjectID: %v", err)
		return nil, err
	}
	
	filter := bson.M{"_id": objectID}
	log.Printf("Database filter: %+v", filter)
	
	var user models.User
	err = collection.FindOne(context.Background(), filter).Decode(&user)
	if err != nil {
		log.Printf("Error finding user in database: %v", err)
		
		// If user doesn't exist, create a basic user profile
		if err.Error() == "mongo: no documents in result" {
			log.Printf("User not found, creating basic user profile")
			return createBasicUserProfile(userID, objectID)
		}
		
		return nil, err
	}

	log.Printf("Found user: %+v", user)

	userData := models.User{
		ID: user.ID,
		HealthGoals: user.HealthGoals,
		DietaryPreferences: user.DietaryPreferences,
		NutritionPriorities: user.NutritionPriorities,
		FullName: user.FullName,
		PhoneNo: user.PhoneNo,
		HealthStatus: user.HealthStatus,
		WorkOutsPerWeek: user.WorkOutsPerWeek,
		Age: user.Age,
		Height: user.Height,
		Weight: user.Weight,
		NutritionalStatus: user.NutritionalStatus,
	}

	log.Println("Returning user data:", userData)

	return &userData, nil
}

// GetOrCreateUser gets a user by ID, or creates and inserts a basic user profile if they don't exist
func GetOrCreateUser(userID string) (*models.User, error) {
	collection := lib.DB.Database("amobagan").Collection("users")
	
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}
	
	// Try to find existing user
	var user models.User
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		// If user doesn't exist, create and insert a basic user profile
		if err.Error() == "mongo: no documents in result" {
			log.Printf("User not found, creating and inserting basic user profile")
			basicUser, err := createBasicUserProfile(userID, objectID)
			if err != nil {
				return nil, fmt.Errorf("failed to create basic user profile: %v", err)
			}
			
			// Insert the basic user into the database
			_, err = collection.InsertOne(context.Background(), basicUser)
			if err != nil {
				return nil, fmt.Errorf("failed to insert basic user profile: %v", err)
			}
			
			log.Printf("Successfully created and inserted basic user profile for ID: %s", userID)
			return basicUser, nil
		}
		
		return nil, fmt.Errorf("failed to find user: %v", err)
	}
	
	log.Printf("Found existing user: %+v", user)
	return &user, nil
}

// UpdateNutritionalStatus updates the user's nutritional status by incrementing counts
func UpdateNutritionalStatus(userID string, nutritionalElements []string) error {
	collection := lib.DB.Database("amobagan").Collection("users")
	
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return fmt.Errorf("invalid user ID: %v", err)
	}
	
	// Get existing user from database
	var user models.User
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		return fmt.Errorf("user not found: %v", err)
	}
	
	log.Printf("Found user: %+v", user)
	log.Printf("User nutrition priorities: %v", user.NutritionPriorities)
	log.Printf("Received nutritional elements: %v", nutritionalElements)
	
	// Initialize NutritionalStatus if it doesn't exist
	if user.NutritionalStatus == nil {
		user.NutritionalStatus = make(map[string]int)
		log.Printf("Initialized empty nutritionalStatus map")
	}
	
	// Create update operations for each nutritional element
	// Only include elements that are in the user's nutrition priorities
	updateOperations := bson.M{}
	filteredElements := []string{}
	
	for _, element := range nutritionalElements {
		normalizedElement := strings.Title(strings.ToLower(element))
		
		// Check if this element is in the user's nutrition priorities
		elementInPriorities := false
		for _, priority := range user.NutritionPriorities {
			if strings.Contains(strings.ToLower(priority), strings.ToLower(element)) ||
			   strings.Contains(strings.ToLower(element), strings.ToLower(priority)) {
				elementInPriorities = true
				break
			}
		}
		
		if elementInPriorities {
			updateOperations[fmt.Sprintf("nutritionalStatus.%s", normalizedElement)] = 1
			filteredElements = append(filteredElements, normalizedElement)
			log.Printf("Including element '%s' in update (matches user priorities)", normalizedElement)
		} else {
			log.Printf("Excluding element '%s' from update (not in user priorities)", normalizedElement)
		}
	}
	
	log.Printf("Filtered elements to update: %v", filteredElements)
	log.Printf("Update operations: %+v", updateOperations)
	
	// Only perform update if there are elements to update
	if len(updateOperations) == 0 {
		log.Printf("No nutritional elements match user priorities, skipping update")
		return nil
	}
	
	// Use $inc to increment the counts
	result, err := collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$inc": updateOperations},
	)
	
	if err != nil {
		return fmt.Errorf("failed to update nutritional status: %v", err)
	}
	
	log.Printf("Update result - Matched: %d, Modified: %d", result.MatchedCount, result.ModifiedCount)
	log.Printf("Updated nutritional status for user %s with elements: %v", userID, filteredElements)
	return nil
}

// createBasicUserProfile creates a basic user profile with default values
func createBasicUserProfile(userID string, objectID primitive.ObjectID) (*models.User, error) {
	log.Printf("Creating basic user profile for ID: %s", userID)
	
	basicUser := models.User{
		ID: objectID,
		FullName: "User",
		PhoneNo: "",
		HealthStatus: "general_wellness",
		HealthGoals: []string{"general_wellness"},
		DietaryPreferences: []string{"no_restrictions"},
		NutritionPriorities: []string{"balanced"},
		WorkOutsPerWeek: "3-5",
		Age: "25",
		Height: "170",
		Weight: "70",
		NutritionalStatus: make(map[string]int),
	}
	
	log.Printf("Created basic user profile: %+v", basicUser)
	
	return &basicUser, nil
}

// GetUserNutritionDetails gets user nutrition details with smart feedback using Gemini
func GetUserNutritionDetails(userID string) (map[string]interface{}, error) {
	collection := lib.DB.Database("amobagan").Collection("users")
	
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}
	
	// Get existing user from database
	var user models.User
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		return nil, fmt.Errorf("user not found: %v", err)
	}
	
	// Initialize NutritionalStatus if it doesn't exist
	if user.NutritionalStatus == nil {
		user.NutritionalStatus = make(map[string]int)
	}
	
	// Prepare data for Gemini analysis
	nutritionData := map[string]interface{}{
		"nutritionPriorities": user.NutritionPriorities,
		"nutritionalStatus":   user.NutritionalStatus,
	}
	
	// Generate feedback using Gemini
	feedback, err := generateNutritionFeedback(nutritionData)
	if err != nil {
		log.Printf("Error generating feedback with Gemini: %v", err)
		// Fallback to basic feedback if Gemini fails
		feedback = generateBasicFeedback(user.NutritionPriorities, user.NutritionalStatus)
	}
	
	response := map[string]interface{}{
		"nutritionPriorities": user.NutritionPriorities,
		"nutritionalStatus":   user.NutritionalStatus,
		"feedback":            feedback,
	}
	
	return response, nil
}

// generateNutritionFeedback uses Gemini to generate smart nutrition feedback
func generateNutritionFeedback(nutritionData map[string]interface{}) ([]map[string]interface{}, error) {
	// Create Gemini client
	client, err := lib.GetGeminiClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %v", err)
	}
	
	// Prepare the prompt for Gemini
	prompt := fmt.Sprintf(`
Analyze the user's nutrition data and provide personalized feedback.

User's Nutrition Priorities: %v
User's Nutritional Status (count of items consumed WITHOUT each priority): %v

IMPORTANT: The nutritional status count represents how many items the user consumed that LACKED each nutrition priority.

Generate an array of feedback objects with the following structure:
- For each nutrition priority that has a count > 0: Provide negative feedback about consuming items without that priority
- For each nutrition priority that has a count = 0: Provide positive feedback about avoiding items without that priority

Rules:
1. If count > 0: User consumed items WITHOUT that priority (negative feedback)
2. If count = 0: User avoided items WITHOUT that priority (positive feedback)
3. Make the feedback conversational and motivational
4. Use natural language that sounds like a nutrition coach

Return only a valid JSON array of objects with this structure:
[
  {
    "priority": "high_protein",
    "message": "You have eaten 2 items which did not have high protein in them. Consider adding more protein-rich foods to your diet.",
    "type": "negative",
    "count": 2
  },
  {
    "priority": "low_sugar",
    "message": "Great job! You haven't eaten any high-sugar items today. Keep up this healthy habit!",
    "type": "positive",
    "count": 0
  }
]

Only return the JSON array, no additional text.
`, nutritionData["nutritionPriorities"], nutritionData["nutritionalStatus"])
	
	// Call Gemini
	response, err := client.Models.GenerateContent(context.Background(), lib.GEMINI_MODEL, genai.Text(prompt), &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate content with Gemini: %v", err)
	}
	
	// Parse the response
	var feedback []map[string]interface{}
	err = json.Unmarshal([]byte(response.Text()), &feedback)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Gemini response: %v", err)
	}
	
	return feedback, nil
}

// generateBasicFeedback provides fallback feedback when Gemini is unavailable
func generateBasicFeedback(priorities []string, status map[string]int) []map[string]interface{} {
	var feedback []map[string]interface{}
	
	for _, priority := range priorities {
		normalizedPriority := strings.Title(strings.ToLower(priority))
		
		if count, exists := status[normalizedPriority]; exists && count > 0 {
			// Negative feedback - user consumed items without this priority
			feedback = append(feedback, map[string]interface{}{
				"priority": priority,
				"message":  fmt.Sprintf("You have eaten %d items which did not have %s in them. Consider adding more %s-rich foods to your diet.", count, priority, priority),
				"type":     "negative",
				"count":    count,
			})
		} else {
			// Positive feedback - user avoided items without this priority
			count := 0
			if exists {
				count = status[normalizedPriority]
			}
			feedback = append(feedback, map[string]interface{}{
				"priority": priority,
				"message":  fmt.Sprintf("Great job! You haven't eaten any %s-poor items today. Keep up this healthy habit!", priority),
				"type":     "positive",
				"count":    count,
			})
		}
	}
	
	return feedback
}