package services

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
)

type AudioMergerService struct {
	StoragePath string
}

func NewAudioMergerService(storagePath string) *AudioMergerService {
	return &AudioMergerService{StoragePath: storagePath}
}

// GetTempDir returns the temp directory for a meeting's chunks
func (s *AudioMergerService) GetTempDir(meetingID int) string {
	return filepath.Join(s.StoragePath, "temp", fmt.Sprintf("meeting_%d", meetingID))
}

// GetAudioDir returns the final audio directory
func (s *AudioMergerService) GetAudioDir() string {
	return filepath.Join(s.StoragePath, "audio")
}

// SaveChunk saves an audio chunk to the temp directory
func (s *AudioMergerService) SaveChunk(meetingID int, chunkData io.Reader, filename string) (string, error) {
	tempDir := s.GetTempDir(meetingID)
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create temp dir: %w", err)
	}

	chunkPath := filepath.Join(tempDir, filename)
	file, err := os.Create(chunkPath)
	if err != nil {
		return "", fmt.Errorf("failed to create chunk file: %w", err)
	}
	defer file.Close()

	if _, err := io.Copy(file, chunkData); err != nil {
		return "", fmt.Errorf("failed to write chunk: %w", err)
	}

	return chunkPath, nil
}

// MergeChunks merges all audio chunks into a single file
func (s *AudioMergerService) MergeChunks(meetingID int) (string, error) {
	tempDir := s.GetTempDir(meetingID)
	audioDir := s.GetAudioDir()

	// Get all chunk files
	chunks, err := s.getChunkFiles(tempDir)
	if err != nil {
		return "", fmt.Errorf("failed to get chunk files: %w", err)
	}

	if len(chunks) == 0 {
		return "", fmt.Errorf("no audio chunks found")
	}

	// If only one chunk, just move it
	outputPath := filepath.Join(audioDir, fmt.Sprintf("meeting_%d.webm", meetingID))

	if len(chunks) == 1 {
		// Just copy the single chunk
		if err := s.copyFile(chunks[0], outputPath); err != nil {
			return "", err
		}
	} else {
		// Use ffmpeg to concatenate
		if err := s.mergeWithFFmpeg(chunks, outputPath); err != nil {
			// Fallback: just use the first chunk if ffmpeg fails
			if err := s.copyFile(chunks[0], outputPath); err != nil {
				return "", err
			}
		}
	}

	// Clean up temp directory
	os.RemoveAll(tempDir)

	return outputPath, nil
}

func (s *AudioMergerService) getChunkFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var chunks []string
	for _, entry := range entries {
		if !entry.IsDir() && (strings.HasSuffix(entry.Name(), ".webm") || strings.HasSuffix(entry.Name(), ".wav")) {
			chunks = append(chunks, filepath.Join(dir, entry.Name()))
		}
	}

	// Sort by filename (assumes chronological naming like chunk-1234567890.webm)
	sort.Strings(chunks)
	return chunks, nil
}

func (s *AudioMergerService) mergeWithFFmpeg(chunks []string, outputPath string) error {
	// Create a temporary file list for ffmpeg
	listPath := filepath.Join(filepath.Dir(chunks[0]), "filelist.txt")
	listFile, err := os.Create(listPath)
	if err != nil {
		return err
	}

	for _, chunk := range chunks {
		// Escape single quotes in path and write in ffmpeg format
		fmt.Fprintf(listFile, "file '%s'\n", strings.ReplaceAll(chunk, "'", "'\\''"))
	}
	listFile.Close()
	defer os.Remove(listPath)

	// Run ffmpeg to concatenate
	cmd := exec.Command("ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outputPath)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("ffmpeg error: %s - %w", string(output), err)
	}

	return nil
}

func (s *AudioMergerService) copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	return err
}

// CleanupMeeting removes all files associated with a meeting
func (s *AudioMergerService) CleanupMeeting(meetingID int, audioPath string) error {
	// Remove temp chunks
	os.RemoveAll(s.GetTempDir(meetingID))

	// Remove final audio file
	if audioPath != "" {
		os.Remove(audioPath)
	}

	return nil
}
