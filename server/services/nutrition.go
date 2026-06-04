package services

import (
	"amobagan/lib"
	"amobagan/models"
	"amobagan/utils"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strings"

	"github.com/gorilla/websocket"
	"google.golang.org/genai"
)

type NutritionAnalysisService struct {
	client *genai.Client
}

func NewNutritionAnalysisService() (*NutritionAnalysisService, error) {
	client, err := lib.GetGeminiClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %v", err)
	}
	return &NutritionAnalysisService{client: client}, nil
}

func (s *NutritionAnalysisService) AnalyzeNutritionWithPreferences(
	product *utils.ExtractedNutritionData,
	userPrefs *models.UserPreferences,
) (*models.NutritionAnalysis, error) {
	
	promptTemplate, err := s.readPromptTemplate()
	if err != nil {
		return nil, fmt.Errorf("failed to read prompt template: %v", err)
	}

	prompt := s.createAnalysisPrompt(product, userPrefs, promptTemplate)

	schema := s.createJSONSchema()

	response, err := s.client.Models.GenerateContent(
		context.Background(),
		lib.GEMINI_MODEL,
		genai.Text(prompt),
		&genai.GenerateContentConfig{
			ResponseMIMEType: "application/json",
			ResponseSchema:   schema,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate nutrition analysis: %v", err)
	}

	var analysis models.NutritionAnalysis
	if err := json.Unmarshal([]byte(response.Text()), &analysis); err != nil {
		return nil, fmt.Errorf("failed to parse nutrition analysis response: %v", err)
	}

	return &analysis, nil
}

func (s *NutritionAnalysisService) readPromptTemplate() (string, error) {
	content, err := ioutil.ReadFile("llm_context/output.txt")
	if err != nil {
		return "", fmt.Errorf("failed to read prompt template: %v", err)
	}
	return string(content), nil
}

func (s *NutritionAnalysisService) createAnalysisPrompt(
	product *utils.ExtractedNutritionData,
	userPrefs *models.UserPreferences,
	template string,
) string {
	
	productJSON, _ := json.MarshalIndent(product, "", "  ")
	
	userPrefsJSON, _ := json.MarshalIndent(userPrefs, "", "  ")

	prompt := fmt.Sprintf(`
%s

PRODUCT DATA:
%s

USER PREFERENCES:
%s

Please analyze this product according to the user's health goals, dietary preferences, and nutrition priorities. 
Provide a personalized nutrition analysis in the exact JSON format specified in the schema above.
`, template, string(productJSON), string(userPrefsJSON))

	return prompt
}

func (s *NutritionAnalysisService) createJSONSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"product_name": {
				Type: genai.TypeString,
			},
			"instant_health_rating": {
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"grade": {
						Type: genai.TypeString,
					},
					"recommendation": {
						Type: genai.TypeString,
					},
					"positive_aspects": {
						Type: genai.TypeArray,
						Items: &genai.Schema{
							Type: genai.TypeString,
						},
					},
					"negative_aspects": {
						Type: genai.TypeArray,
						Items: &genai.Schema{
							Type: genai.TypeString,
						},
					},
					"fssai_verified": {
						Type: genai.TypeBoolean,
					},
				},
				PropertyOrdering: []string{"grade", "recommendation", "positive_aspects", "negative_aspects", "fssai_verified"},
			},
			"key_health_concerns": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"concern": {
							Type: genai.TypeString,
						},
						"explanation": {
							Type: genai.TypeString,
						},
						"impact": {
							Type: genai.TypeString,
						},
					},
					PropertyOrdering: []string{"concern", "explanation", "impact"},
				},
			},
			"smarter_alternatives": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"name": {
							Type: genai.TypeString,
						},
						"benefits": {
							Type: genai.TypeArray,
							Items: &genai.Schema{
								Type: genai.TypeString,
							},
						},
						"why_better": {
							Type: genai.TypeString,
						},
						"key_features": {
							Type: genai.TypeArray,
							Items: &genai.Schema{
								Type: genai.TypeString,
							},
						},
					},
					PropertyOrdering: []string{"name", "benefits", "why_better", "key_features"},
				},
			},
			"personalized_callout": {
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"greeting": {
						Type: genai.TypeString,
					},
					"acknowledgment": {
						Type: genai.TypeString,
					},
					"explanation": {
						Type: genai.TypeString,
					},
					"encouragement": {
						Type: genai.TypeString,
					},
					"motivational_close": {
						Type: genai.TypeString,
					},
				},
				PropertyOrdering: []string{"greeting", "acknowledgment", "explanation", "encouragement", "motivational_close"},
			},
			"detailed_nutrition_breakdown": {
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"serving_size": {
						Type: genai.TypeString,
					},
					"nutrients": {
						Type: genai.TypeArray,
						Items: &genai.Schema{
							Type: genai.TypeObject,
							Properties: map[string]*genai.Schema{
								"nutrient": {
									Type: genai.TypeString,
								},
								"amount": {
									Type: genai.TypeString,
								},
								"assessment": {
									Type: genai.TypeString,
								},
								"daily_value": {
									Type: genai.TypeString,
								},
							},
							PropertyOrdering: []string{"nutrient", "amount", "assessment", "daily_value"},
						},
					},
					"additives": {
						Type: genai.TypeArray,
						Items: &genai.Schema{
							Type: genai.TypeString,
						},
					},
				},
				PropertyOrdering: []string{"serving_size", "nutrients", "additives"},
			},
		},
		PropertyOrdering: []string{
			"product_name",
			"instant_health_rating",
			"key_health_concerns",
			"smarter_alternatives",
			"personalized_callout",
			"detailed_nutrition_breakdown",
		},
	}
}

func (s *NutritionAnalysisService) FormatAnalysisForDisplay(analysis *models.NutritionAnalysis) map[string]interface{} {
	formatted := map[string]interface{}{
		"product_name": analysis.ProductName,
		"instant_health_rating": map[string]interface{}{
			"grade":           analysis.InstantHealthRating.Grade,
			"recommendation":  analysis.InstantHealthRating.Recommendation,
			"positive_aspects": analysis.InstantHealthRating.PositiveAspects,
			"negative_aspects": analysis.InstantHealthRating.NegativeAspects,
			"fssai_verified":   analysis.InstantHealthRating.FSSAIVerified,
		},
		"key_health_concerns": analysis.KeyHealthConcerns,
		"smarter_alternatives": analysis.SmarterAlternatives,
		"personalized_callout": map[string]interface{}{
			"greeting":          analysis.PersonalizedCallout.Greeting,
			"acknowledgment":    analysis.PersonalizedCallout.Acknowledgment,
			"explanation":       analysis.PersonalizedCallout.Explanation,
			"encouragement":     analysis.PersonalizedCallout.Encouragement,
			"motivational_close": analysis.PersonalizedCallout.MotivationalClose,
		},
	}

	if analysis.DetailedNutritionBreakdown != nil {
		formatted["detailed_nutrition_breakdown"] = analysis.DetailedNutritionBreakdown
	}

	return formatted
}

func (s *NutritionAnalysisService) StreamNutritionAnalysisWithPreferences(
	conn *websocket.Conn,
	product *utils.ExtractedNutritionData,
	userPrefs *models.UserPreferences,
) error {
	promptTemplate, err := s.readPromptTemplate()
	if err != nil {
		return fmt.Errorf("failed to read prompt template: %v", err)
	}

	log.Println("userPrefs", userPrefs)

	prompt := s.createStreamingPrompt(product, userPrefs, promptTemplate)

	initialMsg := map[string]interface{}{
		"type":    "stream_start",
		"content": "Starting AI analysis...",
	}
	conn.WriteJSON(initialMsg)

	stream := s.client.Models.GenerateContentStream(
		context.Background(),
		lib.GEMINI_MODEL,
		genai.Text(prompt),
		nil,
	)

	var fullResponse strings.Builder
	var currentSection strings.Builder
	var sectionType string

	for chunk, _ := range stream {
		if chunk.Candidates == nil || len(chunk.Candidates) == 0 {
			continue
		}

		text := chunk.Candidates[0].Content.Parts[0].Text
		fullResponse.WriteString(text)
		currentSection.WriteString(text)

		chunkMsg := map[string]interface{}{
			"type":    "stream_chunk",
			"content": text,
		}
		conn.WriteJSON(chunkMsg)

		sectionType, currentSection = s.processStreamingSection(
			conn, 
			currentSection.String(), 
			sectionType,
		)
	}

	finalAnalysis := s.formatStreamingResponse(fullResponse.String(), product, userPrefs)
	finalMsg := map[string]interface{}{
		"type":    "stream_complete",
		"content": finalAnalysis,
	}
	conn.WriteJSON(finalMsg)

	return nil
}

func (s *NutritionAnalysisService) createStreamingPrompt(
	product *utils.ExtractedNutritionData,
	userPrefs *models.UserPreferences,
	template string,
) string {
	productJSON, _ := json.MarshalIndent(product, "", "  ")
	userPrefsJSON, _ := json.MarshalIndent(userPrefs, "", "  ")

	prompt := fmt.Sprintf(`
%s

PRODUCT DATA:
%s

USER PREFERENCES:
%s

Please analyze this product according to the user's health goals, dietary preferences, and nutrition priorities. 
Provide a comprehensive nutrition analysis in markdown format with the following sections:

# Product Analysis: %s

## 🏥 Instant Health Rating
[Provide grade, recommendation, and key points]

## ⚠️ Key Health Concerns
[List specific concerns with explanations]

## 🥗 Smarter Alternatives
[Suggest better alternatives with benefits]

## 💬 Personalized Insights
[Address user by name with personalized advice]

## 📊 Detailed Nutrition Breakdown
[Break down nutrients and their impact]

Please provide this analysis in a conversational, easy-to-understand markdown format that can be streamed to the user.
`, template, string(productJSON), string(userPrefsJSON), product.ProductIdentification.ProductName)

	return prompt
}

func (s *NutritionAnalysisService) processStreamingSection(
	conn *websocket.Conn,
	content string,
	currentSection string,
) (string, strings.Builder) {
	// Check for section headers
	if strings.Contains(content, "# Product Analysis:") {
		if currentSection != "" {
			// Send previous section
			sectionMsg := map[string]interface{}{
				"type":    "stream_section",
				"section": currentSection,
				"content": content,
			}
			conn.WriteJSON(sectionMsg)
		}
		return "product_analysis", strings.Builder{}
	}

	if strings.Contains(content, "## 🏥 Instant Health Rating") {
		if currentSection != "" {
			sectionMsg := map[string]interface{}{
				"type":    "stream_section",
				"section": currentSection,
				"content": content,
			}
			conn.WriteJSON(sectionMsg)
		}
		return "health_rating", strings.Builder{}
	}

	if strings.Contains(content, "## ⚠️ Key Health Concerns") {
		if currentSection != "" {
			sectionMsg := map[string]interface{}{
				"type":    "stream_section",
				"section": currentSection,
				"content": content,
			}
			conn.WriteJSON(sectionMsg)
		}
		return "health_concerns", strings.Builder{}
	}

	if strings.Contains(content, "## 🥗 Smarter Alternatives") {
		if currentSection != "" {
			sectionMsg := map[string]interface{}{
				"type":    "stream_section",
				"section": currentSection,
				"content": content,
			}
			conn.WriteJSON(sectionMsg)
		}
		return "alternatives", strings.Builder{}
	}

	if strings.Contains(content, "## 💬 Personalized Insights") {
		if currentSection != "" {
			sectionMsg := map[string]interface{}{
				"type":    "stream_section",
				"section": currentSection,
				"content": content,
			}
			conn.WriteJSON(sectionMsg)
		}
		return "personalized", strings.Builder{}
	}

	if strings.Contains(content, "## 📊 Detailed Nutrition Breakdown") {
		if currentSection != "" {
			sectionMsg := map[string]interface{}{
				"type":    "stream_section",
				"section": currentSection,
				"content": content,
			}
			conn.WriteJSON(sectionMsg)
		}
		return "nutrition_breakdown", strings.Builder{}
	}

	return currentSection, strings.Builder{}
}

func (s *NutritionAnalysisService) formatStreamingResponse(
	response string,
	product *utils.ExtractedNutritionData,
	userPrefs *models.UserPreferences,
) string {
	// Clean up the response and ensure proper markdown formatting
	formatted := strings.TrimSpace(response)
	
	
	
	return formatted
} 