package main

import (
	"backend/internal/api"
	"backend/internal/config"
	"backend/internal/database"
	"fmt"
	"log"
)

func main() {
	// Load configuration from environment
	cfg := config.Load()

	// Initialize database
	if err := database.Initialize(cfg.DatabasePath, cfg.StoragePath); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer database.Close()

	// Setup router with all handlers
	router := api.SetupRouter(cfg)

	// Start server
	fmt.Printf("🚀 ECHO server starting on port %s\n", cfg.Port)
	fmt.Printf("📦 Storage path: %s\n", cfg.StoragePath)
	fmt.Println("📡 Endpoints:")
	fmt.Println("   POST /auth/login    - User authentication")
	fmt.Println("   GET  /meetings      - List all meetings")
	fmt.Println("   POST /meetings      - Create new meeting")
	fmt.Println("   POST /live-chunk    - Real-time audio chunk streaming")
	fmt.Println("   POST /ai-format     - AI text formatting")

	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
