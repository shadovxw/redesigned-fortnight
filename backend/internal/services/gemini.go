package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type GeminiService struct {
	client *genai.Client
}

// NewGeminiService initializes the client ONCE to save connection time
func NewGeminiService(apiKey string) (*GeminiService, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}
	
	return &GeminiService{client: client}, nil
}

// Close ensures the client connection is cleaned up when the app stops
func (s *GeminiService) Close() {
	s.client.Close()
}

// Beautify uses Gemini to format and improve text quality
func (s *GeminiService) Beautify(text string) (string, error) {
	ctx := context.Background()

    // UPDATED: Using the model found in your list
	model := s.client.GenerativeModel("gemini-2.5-flash")
	
    // Optimization: Lower temperature for more deterministic formatting
    model.SetTemperature(0.3) 

	prompt := fmt.Sprintf(`You are a professional meeting notes formatter. Clean up and improve the following text while preserving all important information:

Rules:
- Fix grammar and spelling
- Improve clarity and structure
- Keep the same tone and meaning
- Don't add information that wasn't there
- Return ONLY the improved text, no explanations

Text to improve:
%s`, text)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no response from Gemini")
	}

    // Safer text extraction
    var resultBuilder strings.Builder
    for _, part := range resp.Candidates[0].Content.Parts {
        if txt, ok := part.(genai.Text); ok {
            resultBuilder.WriteString(string(txt))
        }
    }
    
	return strings.TrimSpace(resultBuilder.String()), nil
}

// ExtractTasks uses Gemini to extract action items from text
func (s *GeminiService) ExtractTasks(text string) ([]string, error) {
	ctx := context.Background()

    // UPDATED: Using the model found in your list
	model := s.client.GenerativeModel("gemini-2.5-flash")
    model.SetTemperature(0.1) // Low temp for factual extraction

	prompt := fmt.Sprintf(`Extract all action items and tasks from the following meeting notes.

Rules:
- Return each task on a new line starting with "- "
- Be specific and actionable
- Include who should do it if mentioned
- If no tasks found, return "No tasks found"

Meeting notes:
%s`, text)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("no response from Gemini")
	}

    var resultBuilder strings.Builder
    for _, part := range resp.Candidates[0].Content.Parts {
        if txt, ok := part.(genai.Text); ok {
            resultBuilder.WriteString(string(txt))
        }
    }

	// Parse tasks into array
	tasks := []string{}
	lines := strings.Split(resultBuilder.String(), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "- ") {
			tasks = append(tasks, strings.TrimPrefix(line, "- "))
		}
	}

	return tasks, nil
}