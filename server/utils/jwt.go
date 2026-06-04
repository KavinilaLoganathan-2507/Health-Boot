package utils

import (
	"amobagan/config"
	"amobagan/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var cfg = config.LoadConfig()

func GenerateJWT(user models.User) (string, error) {
	claims := jwt.MapClaims{
		"userId": user.ID.Hex(),
		"fullName": user.FullName,
		"phoneNo": user.PhoneNo,
		"workOutsPerWeek": user.WorkOutsPerWeek,
		"age": user.Age,
		"height": user.Height,
		"weight": user.Weight,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWT_SECRET))
}

func VerifyJWT(token string) (jwt.MapClaims, error) {
	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWT_SECRET), nil
	})
	if err != nil {
		return nil, err
	}
	return claims, nil
}

func GetUserIDFromToken(token string) (string, error) {
	claims, err := VerifyJWT(token)
	if err != nil {
		return "", err
	}
	
	userID, ok := claims["userId"].(string)
	if !ok {
		return "", jwt.ErrSignatureInvalid
	}
	
	return userID, nil
}

// VerifyTokenFromQuery extracts and verifies a token from query parameters
// Returns the claims, user ID, and any error
func VerifyTokenFromQuery(c *gin.Context) (jwt.MapClaims, string, error) {
	token := c.Query("token")
	if token == "" {
		return nil, "", jwt.ErrSignatureInvalid
	}

	claims, err := VerifyJWT(token)
	if err != nil {
		return nil, "", err
	}

	userID, ok := claims["userId"].(string)
	if !ok {
		return nil, "", jwt.ErrSignatureInvalid
	}

	return claims, userID, nil
}
