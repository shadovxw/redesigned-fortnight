package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

// Initialize sets up the SQLite database connection and creates tables
func Initialize(dbPath, storagePath string) error {
	// Create storage directory if it doesn't exist
	if err := os.MkdirAll(storagePath, 0755); err != nil {
		return fmt.Errorf("failed to create storage directory: %w", err)
	}

	// Create audio directory
	audioPath := filepath.Join(storagePath, "audio")
	if err := os.MkdirAll(audioPath, 0755); err != nil {
		return fmt.Errorf("failed to create audio directory: %w", err)
	}

	// Create temp directory for chunks
	tempPath := filepath.Join(storagePath, "temp")
	if err := os.MkdirAll(tempPath, 0755); err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}

	// Ensure DB directory exists
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return fmt.Errorf("failed to create database directory: %w", err)
	}

	// Open SQLite database
	var err error
	DB, err = sql.Open("sqlite", dbPath+"?cache=shared&mode=rwc")
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	// Create tables
	if err := createTables(); err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	log.Printf("📦 Database initialized at: %s", dbPath)
	return nil
}

func createTables() error {
	schema := `
	CREATE TABLE IF NOT EXISTS meetings (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT DEFAULT 'Untitled Meeting',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		transcript TEXT DEFAULT '',
		notes TEXT DEFAULT '',
		audio_path TEXT DEFAULT '',
		duration_seconds INTEGER DEFAULT 0,
		is_recording BOOLEAN DEFAULT FALSE
	);

	CREATE TABLE IF NOT EXISTS tasks (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		meeting_id INTEGER NOT NULL,
		content TEXT NOT NULL,
		completed BOOLEAN DEFAULT FALSE,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
	);
	`

	_, err := DB.Exec(schema)
	return err
}

// Close closes the database connection
func Close() {
	if DB != nil {
		DB.Close()
	}
}
