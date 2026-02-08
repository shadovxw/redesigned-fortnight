package handlers

import (
	"backend/internal/services"
	"fmt"

	"github.com/gin-gonic/gin"
)

type AIHandler struct {
	Service *services.GeminiService
}

func NewAIHandler(service *services.GeminiService) *AIHandler {
	return &AIHandler{Service: service}
}

type AIRequest struct {
	Text   string `json:"text" binding:"required"`
	Action string `json:"action" binding:"required"`
}

// HandleAIFormat processes AI formatting requests (beautify, extract tasks, etc.)
func (h *AIHandler) HandleAIFormat(c *gin.Context) {
	var req AIRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	var result interface{}
	var err error

	switch req.Action {
	case "beautify":
		result, err = h.Service.Beautify(req.Text)
	case "extract-tasks":
		result, err = h.Service.ExtractTasks(req.Text)
	default:
		c.JSON(400, gin.H{"error": "Unknown action. Use 'beautify' or 'extract-tasks'"})
		return
	}

	if err != nil {
		fmt.Printf("AI Error: %v\n", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"result": result})
}
