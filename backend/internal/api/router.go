package api

import (
	"backend/internal/api/handlers"
	"backend/internal/api/middleware"
	"backend/internal/config"
	"backend/internal/services"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Enable CORS for frontend
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(corsConfig))

	// Initialize services
	transcriptionService := services.NewTranscriptionService(cfg.GroqAPIKey)
	geminiService, err := services.NewGeminiService(cfg.GeminiAPIKey)
	if err != nil {
		log.Fatalf("Failed to initialize Gemini service: %v", err)
	}
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
