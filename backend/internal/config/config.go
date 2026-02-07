package config

import (
	"log"
	"os"
)

type Config struct {
	GroqAPIKey   string
	GeminiAPIKey string
	Port         string
	AuthUsername string
	AuthPassword string
	StoragePath  string // Path to store database and audio files
}

func Load() *Config {
	groqKey := os.Getenv("GROQ_API_KEY")
	if groqKey == "" {
		log.Fatal("GROQ_API_KEY environment variable is required")
	}

	geminiKey := os.Getenv("GEMINI_API_KEY")
	if geminiKey == "" {
		log.Fatal("GEMINI_API_KEY environment variable is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port
	}

	authUsername := os.Getenv("AUTH_USERNAME")
	if authUsername == "" {
		authUsername = "admin" // Default username
	}

	authPassword := os.Getenv("AUTH_PASSWORD")
	if authPassword == "" {
		log.Println("⚠️  WARNING: No AUTH_PASSWORD set. Your server is unprotected!")
	}

	// Storage path - default to local ./storage, override with STORAGE_PATH for NAS
	storagePath := os.Getenv("STORAGE_PATH")
	if storagePath == "" {
		storagePath = "./storage" // Default local storage
	}

	return &Config{
		GroqAPIKey:   groqKey,
		GeminiAPIKey: geminiKey,
		Port:         port,
		AuthUsername: authUsername,
		AuthPassword: authPassword,
		StoragePath:  storagePath,
	}
}
