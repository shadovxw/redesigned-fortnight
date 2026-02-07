package services

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"os"
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

// TranscribeFile transcribes an audio file using Groq Whisper API
func (s *TranscriptionService) TranscribeFile(filePath string) (string, error) {
	url := "https://api.groq.com/openai/v1/audio/transcriptions"

	// Create buffer for multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Open local file
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// Add file to form
	part, _ := writer.CreateFormFile("file", filePath)
	io.Copy(part, file)

	// Add model parameter
	writer.WriteField("model", "whisper-large-v3")
	writer.Close()

	// Create request
	req, _ := http.NewRequest("POST", url, body)
	req.Header.Set("Authorization", "Bearer "+s.APIKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Parse JSON response
	var result groqResponse
	json.NewDecoder(resp.Body).Decode(&result)

	return result.Text, nil
}
