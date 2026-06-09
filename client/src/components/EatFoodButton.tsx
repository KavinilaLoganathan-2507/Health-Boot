import { useState } from 'react';

interface EatFoodButtonProps {
    barcode?: string;
    nutritionalElements?: string[];
    onEatFood?: (elements: string[]) => void;
}

export default function EatFoodButton({
    barcode,
    nutritionalElements = [],
    onEatFood,
}: EatFoodButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEaten, setIsEaten] = useState(false);

    const handleEatFood = async () => {
        if (
            !barcode ||
            !nutritionalElements ||
            nutritionalElements.length === 0
        ) {
            console.log("No barcode or nutritional elements available");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                console.error("No auth token found");
                return;
            }

            const response = await fetch("/api/user/nutritional-status", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nutritionalElements: nutritionalElements,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Nutritional status updated:", data);

                if (onEatFood) {
                    onEatFood(nutritionalElements);
                }

                setIsEaten(true);

                alert("Food consumption recorded! 🍽️");
            } else {
                console.error(
                    "Failed to update nutritional status:",
                    response.statusText
                );
                alert("Failed to record food consumption. Please try again.");
            }
        } catch (error) {
            console.error("Error updating nutritional status:", error);
            alert("Error recording food consumption. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!nutritionalElements || isEaten) {
        return null;
    }

    if (nutritionalElements.length === 0) {
        return null;
    }

    console.log("EatFoodButton showing with elements:", nutritionalElements);

    if (isEaten) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-20 z-50">
            <button
                onClick={handleEatFood}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 px-4 py-3 min-w-[120px] disabled:cursor-not-allowed"
                title="Eat this food"
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
                <span className="text-sm font-medium">
                    {isLoading ? "Recording..." : "Eat this food"}
                </span>
            </button>
        </div>
    );
}
