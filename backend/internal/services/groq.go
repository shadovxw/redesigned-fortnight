package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"time"
)

type TranscriptionService struct {
	APIKey string
}

type groqResponse struct {
	Text string `json:"text"`
}

func NewTranscriptionService(apiKey string) *TranscriptionService {
	return &TranscriptionService{APIKey: apiKey}
}

// --------------------
// PUBLIC ENTRY POINT
// --------------------
func (s *TranscriptionService) TranscribeFile(filePath string) (string, error) {
	text, err := s.callWhisper(filePath)
	if err != nil {
		return "", err
	}

	text = strings.TrimSpace(text)

	// Final hallucination filter
	if isLikelyHallucination(text) {
		return "", nil
	}

	return text, nil
}

// --------------------
// WHISPER CALL (GROQ)
// --------------------
func (s *TranscriptionService) callWhisper(filePath string) (string, error) {
	url := "https://api.groq.com/openai/v1/audio/transcriptions"

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	part, err := writer.CreateFormFile("file", filePath)
	if err != nil {
		return "", err
	}
	if _, err := io.Copy(part, file); err != nil {
		return "", err
	}

	// Groq-supported params ONLY
	writer.WriteField("model", "whisper-large-v3")
	writer.WriteField("temperature", "0")

	writer.Close()

	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+s.APIKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{
		Timeout: 2 * time.Minute,
	}

	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("❌ Groq Request Failed: %v\n", err)
		return "", err
	}
	defer resp.Body.Close()

	fmt.Printf("📡 Groq Status: %s\n", resp.Status)

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("❌ Failed to read response body: %v\n", err)
		return "", err
	}

	fmt.Printf("📦 Groq Raw Response: %s\n", string(bodyBytes))

	var result groqResponse
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		fmt.Printf("❌ JSON Decode Error: %v\n", err)
		return "", err
	}

	return result.Text, nil
}

// --------------------
// HALLUCINATION FILTER
// --------------------
func isLikelyHallucination(text string) bool {
	text = strings.TrimSpace(text)
	if text == "" {
		return true
	}

	lower := strings.ToLower(text)

	junk := []string{
		"thank you for watching",
		"terima kasih",
		"amara.org",
		"subtitle",
		"mbc",
		"copyright",
		"silence",
		"hi everyone, welcome to my channel",
		"E aí",
	}

	for _, j := range junk {
		if strings.Contains(lower, j) {
			return true
		}
	}

	// Repetition spam guard
	words := strings.Fields(lower)
	repeats := 0
	for i := 1; i < len(words); i++ {
		if words[i] == words[i-1] {
			repeats++
		}
	}
	return repeats > len(words)/2
}
