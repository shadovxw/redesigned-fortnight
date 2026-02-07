package services

import (
	"backend/internal/database"
	"database/sql"
	"time"
)

type Meeting struct {
	ID              int       `json:"id"`
	Title           string    `json:"title"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Transcript      string    `json:"transcript"`
	Notes           string    `json:"notes"`
	AudioPath       string    `json:"audio_path"`
	DurationSeconds int       `json:"duration_seconds"`
	IsRecording     bool      `json:"is_recording"`
}

type MeetingService struct{}

func NewMeetingService() *MeetingService {
	return &MeetingService{}
}

// Create creates a new meeting and returns its ID
func (s *MeetingService) Create(title string) (*Meeting, error) {
	result, err := database.DB.Exec(
		"INSERT INTO meetings (title, is_recording) VALUES (?, TRUE)",
		title,
	)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return s.GetByID(int(id))
}

// GetByID retrieves a meeting by ID
func (s *MeetingService) GetByID(id int) (*Meeting, error) {
	row := database.DB.QueryRow(`
		SELECT id, title, created_at, updated_at, transcript, notes, audio_path, duration_seconds, is_recording
		FROM meetings WHERE id = ?
	`, id)

	var m Meeting
	var createdAt, updatedAt string
	err := row.Scan(&m.ID, &m.Title, &createdAt, &updatedAt, &m.Transcript, &m.Notes, &m.AudioPath, &m.DurationSeconds, &m.IsRecording)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	m.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	m.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)
	return &m, nil
}

// GetAll retrieves all meetings ordered by creation date
func (s *MeetingService) GetAll() ([]Meeting, error) {
	rows, err := database.DB.Query(`
		SELECT id, title, created_at, updated_at, transcript, notes, audio_path, duration_seconds, is_recording
		FROM meetings ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var meetings []Meeting
	for rows.Next() {
		var m Meeting
		var createdAt, updatedAt string
		if err := rows.Scan(&m.ID, &m.Title, &createdAt, &updatedAt, &m.Transcript, &m.Notes, &m.AudioPath, &m.DurationSeconds, &m.IsRecording); err != nil {
			return nil, err
		}
		m.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		m.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)
		meetings = append(meetings, m)
	}

	return meetings, nil
}

// UpdateTitle updates a meeting's title
func (s *MeetingService) UpdateTitle(id int, title string) error {
	_, err := database.DB.Exec(
		"UPDATE meetings SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		title, id,
	)
	return err
}

// UpdateNotes updates a meeting's notes
func (s *MeetingService) UpdateNotes(id int, notes string) error {
	_, err := database.DB.Exec(
		"UPDATE meetings SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		notes, id,
	)
	return err
}

// AppendTranscript appends text to a meeting's transcript
func (s *MeetingService) AppendTranscript(id int, text string) error {
	_, err := database.DB.Exec(
		"UPDATE meetings SET transcript = transcript || ' ' || ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		text, id,
	)
	return err
}

// FinishRecording marks recording as complete and updates audio path
func (s *MeetingService) FinishRecording(id int, audioPath string, duration int) error {
	_, err := database.DB.Exec(
		"UPDATE meetings SET is_recording = FALSE, audio_path = ?, duration_seconds = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		audioPath, duration, id,
	)
	return err
}

// Delete removes a meeting
func (s *MeetingService) Delete(id int) error {
	_, err := database.DB.Exec("DELETE FROM meetings WHERE id = ?", id)
	return err
}
