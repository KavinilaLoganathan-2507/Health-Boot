package services

import (
	"amobagan/lib"
	"amobagan/models"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func generateRandomToken() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func GenerateQRSession(userID string) (*models.QRSession, error) {
	// Run cleanup first to keep DB clean
	_ = CleanExpiredSessions()

	collection := lib.DB.Database("amobagan").Collection("qr_sessions")

	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	now := time.Now()
	expiresAt := now.Add(15 * time.Minute)

	session := &models.QRSession{
		ID:        primitive.NewObjectID(),
		UserID:    userObjectID,
		Token:     generateRandomToken(),
		Status:    "pending",
		ExpiresAt: primitive.NewDateTimeFromTime(expiresAt),
		CreatedAt: primitive.NewDateTimeFromTime(now),
	}

	_, err = collection.InsertOne(context.Background(), session)
	if err != nil {
		return nil, fmt.Errorf("failed to insert QR session: %v", err)
	}

	return session, nil
}

func ValidateQRSession(token string) (*models.QRSession, error) {
	collection := lib.DB.Database("amobagan").Collection("qr_sessions")

	filter := bson.M{"token": token}
	var session models.QRSession
	err := collection.FindOne(context.Background(), filter).Decode(&session)
	if err != nil {
		return nil, fmt.Errorf("invalid or unrecognized QR token: %v", err)
	}

	now := time.Now()
	sessionExpiresAt := session.ExpiresAt.Time()
	if now.After(sessionExpiresAt) {
		// Update status to expired
		_, _ = collection.UpdateOne(
			context.Background(),
			bson.M{"_id": session.ID},
			bson.M{"$set": bson.M{"status": "expired"}},
		)
		return nil, fmt.Errorf("QR code has expired")
	}

	if session.Status != "pending" {
		return nil, fmt.Errorf("QR code has already been used or is invalid")
	}

	// Update status to checked_in
	update := bson.M{
		"$set": bson.M{
			"status": "checked_in",
		},
	}
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": session.ID}, update)
	if err != nil {
		return nil, fmt.Errorf("failed to update check-in status: %v", err)
	}

	session.Status = "checked_in"
	return &session, nil
}

func CleanExpiredSessions() error {
	collection := lib.DB.Database("amobagan").Collection("qr_sessions")
	now := time.Now()
	filter := bson.M{
		"expiresAt": bson.M{
			"$lt": primitive.NewDateTimeFromTime(now),
		},
	}
	_, err := collection.DeleteMany(context.Background(), filter)
	return err
}
