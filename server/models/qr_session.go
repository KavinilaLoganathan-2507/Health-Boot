package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type QRSession struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	Token     string             `json:"token" bson:"token"`
	Status    string             `json:"status" bson:"status"` // pending|checked_in|expired
	ExpiresAt primitive.DateTime `json:"expiresAt" bson:"expiresAt"`
	CreatedAt primitive.DateTime `json:"createdAt" bson:"createdAt"`
}

type QRValidateInput struct {
	Token string `json:"token" binding:"required"`
}
