package lib

import (
	"amobagan/config"
	"context"
	"fmt"

	"google.golang.org/genai"
)

func GetGeminiClient() (*genai.Client, error) {
	cfg := config.LoadConfig()
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  cfg.GeminiAPIKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %v", err)
	}
	return client, nil
}

const GEMINI_MODEL = "gemini-2.5-flash-lite"
