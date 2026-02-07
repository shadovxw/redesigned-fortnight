package handlers

import (
	"backend/internal/config"
	"crypto/subtle"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthHandler struct {
	Config *config.Config
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

var jwtSecret = []byte("your-secret-key-change-this-in-production")

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{Config: cfg}
}

// HandleLogin processes login requests and returns JWT token
func (h *AuthHandler) HandleLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	// Verify credentials using constant-time comparison
	validUsername := subtle.ConstantTimeCompare([]byte(req.Username), []byte(h.Config.AuthUsername)) == 1
	validPassword := subtle.ConstantTimeCompare([]byte(req.Password), []byte(h.Config.AuthPassword)) == 1

	if !validUsername || !validPassword {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": req.Username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(), // Token expires in 24 hours
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create token"})
		return
	}

	c.JSON(200, LoginResponse{Token: tokenString})
}
