package handlers

import (
	"backend/internal/services"
	"fmt"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

type TranscriptionHandler struct {
	Service *services.TranscriptionService
}

func NewTranscriptionHandler(service *services.TranscriptionService) *TranscriptionHandler {
	return &TranscriptionHandler{Service: service}
}

// HandleUpload handles file-based transcription (existing functionality)
func (h *TranscriptionHandler) HandleUpload(c *gin.Context) {
	file, err := c.FormFile("audio")
	if err != nil {
		c.JSON(400, gin.H{"error": "No file received"})
		return
	}

	// Save locally for debugging
	filePath := filepath.Join("./uploads", file.Filename)
	c.SaveUploadedFile(file, filePath)

	// Transcribe using Groq
	transcript, err := h.Service.TranscribeFile(filePath)
	if err != nil {
		fmt.Println("Groq Error:", err)
		c.JSON(500, gin.H{"error": "Transcription failed"})
		return
	}

	// Return the text to Frontend
	if len(transcript) > 20 {
		fmt.Printf("✨ Transcribed: %s...\n", transcript[:20])
	} else {
		fmt.Printf("✨ Transcribed: %s\n", transcript)
	}

	c.JSON(200, gin.H{
		"status":     "success",
		"transcript": transcript,
	})
}

// HandleLiveChunk handles real-time 5-second audio chunks
func (h *TranscriptionHandler) HandleLiveChunk(c *gin.Context) {
	file, err := c.FormFile("audio")
	if err != nil {
		c.JSON(400, gin.H{"error": "No audio chunk received"})
		return
	}

	// Save to temp file
	tmpPath := filepath.Join(os.TempDir(), file.Filename)
	err = c.SaveUploadedFile(file, tmpPath)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save chunk"})
		return
	}
	defer os.Remove(tmpPath) // Clean up after transcription

	// Transcribe the chunk
	text, err := h.Service.TranscribeFile(tmpPath)
	if err != nil {
		fmt.Println("Live chunk transcription error:", err)
		c.JSON(500, gin.H{"error": "Transcription failed"})
		return
	}

	fmt.Printf("🎤 Live chunk: %s\n", text)

	// Send back just the text
	c.JSON(200, gin.H{"text": text})
}
