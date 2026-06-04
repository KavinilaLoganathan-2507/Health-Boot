package utils

import (
	"encoding/json"
	"fmt"
)

func ParseJSONResponse(data []byte) (interface{}, error) {
	var jsonData interface{}
	err := json.Unmarshal(data, &jsonData)
	if err != nil {
		return nil, fmt.Errorf("failed to parse JSON response: %w", err)
	}
	return jsonData, nil
}