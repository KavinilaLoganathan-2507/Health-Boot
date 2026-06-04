package lib

import (
	"amobagan/config"
	"amobagan/utils"
	"errors"
	"io"
	"log"
	"net/http"
)



func RetrieveProductDetailsByBarcode(barcode string) (*utils.ExtractedNutritionData, error) {
	url := config.OPEN_FOOD_FACTS_BASE_URL + barcode + ".json"

	response, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	if response.StatusCode == http.StatusNotFound {
		return nil,errors.New("product not found")
	}

	jsonData, err := utils.ParseJSONResponse(body)
	if err != nil {
		log.Println("Error parsing JSON response:", err)
		return nil,err
	}

	extractedNutritionData, err := utils.ExtractNutritionData(jsonData)
	if err != nil {
		log.Println("Error extracting nutrition data:", err)
		return nil,err
	}

	return extractedNutritionData,nil
}