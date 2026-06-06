package controllers

import (
	"amobagan/lib"
	"amobagan/utils"
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/gin-gonic/gin"
	"google.golang.org/genai"
)

type ChatController struct {
	client *genai.Client
}

func NewChatController() *ChatController {
	client, err := lib.GetGeminiClient()
	if err != nil {
		client = nil
	}

	return &ChatController{client: client}
}

type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}

func nutritionFallback(message string) string {
	lower := strings.ToLower(strings.TrimSpace(message))

	switch {
	case strings.Contains(lower, "your name") || strings.Contains(lower, "who are you"):
		return "I’m Health Boot, your nutrition assistant. I help you read labels, compare foods, and make healthier choices."
	case strings.Contains(lower, "apple"):
		return "Apple: low calorie, high water, and a good source of fiber. A whole apple is better than juice because it keeps the fiber."
	case strings.Contains(lower, "orange"):
		return "Orange: vitamin C-rich, hydrating, and generally a good low-calorie fruit. Whole oranges are better than juice because you keep the fiber."
	case strings.Contains(lower, "banana"):
		return "Banana: good quick-energy fruit with potassium and natural sugar. It’s a solid snack, especially before a workout."
	case strings.Contains(lower, "kiwi"):
		return "Kiwi: nutrient-dense and a good source of vitamin C and fiber. It gives a nice fiber boost for relatively few calories."
	case strings.Contains(lower, "sugar") || strings.Contains(lower, "diabetes"):
		return "For blood-sugar-friendly choices, compare total carbs, added sugar, fiber, and portion size. Higher fiber and lower added sugar are usually better."
	case strings.Contains(lower, "sodium") || strings.Contains(lower, "salt"):
		return "For heart health, pick lower-sodium options and avoid products where sodium is very high per serving."
	case strings.Contains(lower, "weight loss"):
		return "For weight loss, prioritize lower calorie density, more fiber, and enough protein to keep you full. Watch portion size and liquid calories too."
	case strings.Contains(lower, "healthy"):
		return "A healthier choice usually has lower added sugar, lower sodium, and lower saturated fat, while still giving you useful protein or fiber."
	default:
		return "I can help with product scanning, nutrition labels, ingredient checks, blood-sugar-friendly choices, weight-loss tips, and healthier swaps."
	}
}

func (c *ChatController) Chat(cxt *gin.Context) {
	var req ChatRequest
	if err := cxt.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(cxt, "Message is required", err.Error())
		return
	}

	message := strings.TrimSpace(req.Message)
	if message == "" {
		utils.BadRequest(cxt, "Message is required", nil)
		return
	}

	if c.client == nil {
		log.Println("chat: Gemini client unavailable, using fallback")
		utils.OK(cxt, "Chat response generated successfully", gin.H{
			"reply":  nutritionFallback(message),
			"source": "fallback",
		})
		return
	}

	systemPrompt := `You are Health Boot, a nutrition expert chatbot.
Rules:
1. Answer like a practical nutrition coach.
2. Be specific and useful.
3. If the user asks about a food, give a nutrition-style explanation with calories, sugar, fiber, protein, sodium, and practical advice when relevant.
4. If the user asks about labels, explain what to look for.
5. Keep the answer concise, warm, and easy to understand.
6. If you are unsure, say what to check on the label rather than inventing data.

Respond in plain text only.`

	response, err := c.client.Models.GenerateContent(
		context.Background(),
		lib.GEMINI_MODEL,
		genai.Text(fmt.Sprintf("%s\n\nUser question: %s", systemPrompt, message)),
		&genai.GenerateContentConfig{},
	)
	if err != nil {
		log.Printf("chat: Gemini generation failed: %v", err)
		utils.OK(cxt, "Chat response generated successfully", gin.H{
			"reply":  nutritionFallback(message),
			"source": "fallback",
		})
		return
	}

	reply := strings.TrimSpace(response.Text())
	if reply == "" {
		log.Println("chat: Gemini returned empty text, using fallback")
		reply = nutritionFallback(message)
		utils.OK(cxt, "Chat response generated successfully", gin.H{
			"reply":  reply,
			"source": "fallback",
		})
		return
	}

	utils.OK(cxt, "Chat response generated successfully", gin.H{
		"reply":  reply,
		"source": "gemini",
	})
}
