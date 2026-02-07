package api

import (
	"backend/internal/api/handlers"
	"backend/internal/api/middleware"
	"backend/internal/config"
	"backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Enable CORS for frontend
	r.Use(cors.Default())

	// Initialize services
	transcriptionService := services.NewTranscriptionService(cfg.GroqAPIKey)
	geminiService := services.NewGeminiService(cfg.GeminiAPIKey)
	meetingService := services.NewMeetingService()
	audioMergerService := services.NewAudioMergerService(cfg.StoragePath)

	// Initialize handlers
	transcriptionHandler := handlers.NewTranscriptionHandler(transcriptionService)
	aiHandler := handlers.NewAIHandler(geminiService)
	authHandler := handlers.NewAuthHandler(cfg)
	meetingHandler := handlers.NewMeetingHandler(meetingService, audioMergerService)

	// Public routes (no authentication required)
	r.POST("/auth/login", authHandler.HandleLogin)

	// Protected routes (JWT authentication required)
	protected := r.Group("/")
	protected.Use(middleware.JWTAuth())
	{
		// Transcription endpoints
		protected.POST("/upload", transcriptionHandler.HandleUpload)
		protected.POST("/live-chunk", transcriptionHandler.HandleLiveChunk)
		protected.POST("/ai-format", aiHandler.HandleAIFormat)

		// Meeting CRUD endpoints
		protected.GET("/meetings", meetingHandler.GetAll)
		protected.GET("/meetings/:id", meetingHandler.GetOne)
		protected.POST("/meetings", meetingHandler.Create)
		protected.PUT("/meetings/:id", meetingHandler.Update)
		protected.DELETE("/meetings/:id", meetingHandler.Delete)
		protected.POST("/meetings/:id/finish", meetingHandler.FinishRecording)
	}

	return r
}
