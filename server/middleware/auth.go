package middleware

import (
	"amobagan/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header is required",
			})
			c.Abort()
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header must start with 'Bearer '",
			})
			c.Abort()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		claims, err := utils.VerifyJWT(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		userID, ok := claims["userId"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token claims",
			})
			c.Abort()
			return
		}

		c.Set("userID", userID)
		c.Set("fullName", claims["fullName"])
		c.Set("phoneNo", claims["phoneNo"])
		c.Set("petraWalletAddress", claims["petraWalletAddress"])
		c.Set("petraPublicKey", claims["petraPublicKey"])
		c.Set("role", claims["role"])

		c.Next()
	}
}

func GetUserIDFromContext(c *gin.Context) (string, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		return "", false
	}
	return userID.(string), true
}

func GetUserFromContext(c *gin.Context) (map[string]interface{}, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		return nil, false
	}

	user := map[string]interface{}{
		"userID":             userID,
		"fullName":           c.GetString("fullName"),
		"phoneNo":            c.GetString("phoneNo"),
		"petraWalletAddress": c.GetString("petraWalletAddress"),
		"petraPublicKey":     c.GetString("petraPublicKey"),
		"role":               c.GetString("role"),
	}

	return user, true
}
