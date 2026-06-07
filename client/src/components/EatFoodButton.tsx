import { useState } from 'react';
import styles from './EatFoodButton.module.css';

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
        <div className={styles.eatButtonContainer}>
            <button
                onClick={handleEatFood}
                disabled={isLoading}
                className={styles.eatButton}
                title="Eat this food"
            >
                {isLoading ? (
                    <div className={styles.loadingSpinner}></div>
                ) : (
                    <svg
                        className={styles.buttonIcon}
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
                <span className={styles.buttonText}>
                    {isLoading ? "Recording..." : "Eat this food"}
                </span>
            </button>
        </div>
    );
}
