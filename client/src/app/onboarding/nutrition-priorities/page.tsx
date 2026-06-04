"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/components/features/onboarding_flow/components/StepIndicator";
import { motion } from "framer-motion";
import { SERVER_URL } from "@/lib/constants";

const prioritiesOptions = [
  { id: "low_sugar", label: "Low Sugar" },
  { id: "low_sodium", label: "Low Sodium" },
  { id: "low_fat", label: "Low Fat" },
  { id: "high_protein", label: "High Protein" },
  { id: "high_fiber", label: "High Fiber" },
  { id: "low_calories", label: "Low Calories" },
  { id: "no_artificial_ingredients", label: "No Artificial Ingredients" },
  { id: "organic", label: "Organic" },
  { id: "sustainable", label: "Sustainable" },
  { id: "balanced", label: "Balanced Nutrition" },
];

export default function NutritionPrioritiesPage() {
  const router = useRouter();
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const parseResponseBody = async (response: Response) => {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  };

  const togglePriority = (priorityId: string) => {
    if (selectedPriorities.includes(priorityId)) {
      setSelectedPriorities(
        selectedPriorities.filter((id) => id !== priorityId)
      );
    } else {
      setSelectedPriorities([...selectedPriorities, priorityId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Store nutrition priorities in session storage
    const userPreferences = JSON.parse(
      sessionStorage.getItem("userPreferences") || "{}"
    );

    sessionStorage.setItem(
      "userPreferences",
      JSON.stringify({
        ...userPreferences,
        nutritionPriorities: selectedPriorities,
      })
    );

    // Get all user data from session storage
    const finalUserData = JSON.parse(
      sessionStorage.getItem("userPreferences") || "{}"
    );

    // Get user details from sessionStorage
    const userDetails = JSON.parse(
      sessionStorage.getItem("userDetails") || "{}"
    );

    // Convert allergy ingredients from string to array if available
    const foodAllergies = finalUserData.allergyIngredients
      ? finalUserData.allergyIngredients
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];

    // Prepare the payload for the API - match the exact structure expected by the API
    const payload = {
      fullName: userDetails.name || "",
      phoneNo: userDetails.phone || "",
      password: userDetails.password || "",
      healthStatus: "Healthy", // Default value
      healthGoals: finalUserData.healthGoals || [],
      dietaryPreferences: finalUserData.dietaryPreferences || [],
      foodAllergies: foodAllergies,
      nutritionPriorities: selectedPriorities.map((priority) => {
        const label =
          prioritiesOptions.find((option) => option.id === priority)?.label ||
          "";
        return label;
      }),
      workOutsPerWeek: finalUserData.workoutFrequency || "",
      age: finalUserData.userInfo?.age || "",
      height: finalUserData.userInfo?.height || "",
      weight: finalUserData.userInfo?.weight || "",
    };

    console.log("Submitting payload:", payload); // For debugging

    try {
      // Make API call to create user
      const response = await fetch(`${SERVER_URL}/api/user/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await parseResponseBody(response);

      if (!response.ok) {
        console.log("API error response:", {
          status: response.status,
          statusText: response.statusText,
          body: responseData,
        });
        const errorMessage =
          responseData?.message ||
          responseData?.error?.message ||
          response.statusText ||
          "Unknown error occurred";

        alert(`Error creating account: ${errorMessage}`);
        return;
      }

      if (!responseData) {
        throw new Error("Server returned an empty response");
      }

      console.log("User created successfully", responseData);

      // Store user ID and authentication token from response
      const createdUser = responseData.data ?? responseData;

      if (createdUser?._id) {
        sessionStorage.setItem("userId", createdUser._id);
      }

      // Store the token - important for authentication
      if (createdUser?.token) {
        localStorage.setItem("authToken", createdUser.token);
        sessionStorage.setItem("authToken", createdUser.token);
      }

      // Redirect to congratulations page
      router.push("/onboarding/congratulations");
    } catch (error) {
      console.error("API request failed:", error);
      alert("Network error. Please check your connection and try again.");
    }
  };

  const handleBack = () => {
    router.push("/onboarding/food-allergies");
  };
  return (
    <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <StepIndicator
          currentStep={7}
          totalSteps={7}
          onBack={handleBack}
          variant="light"
          className="mb-6"
        />

        <Card className="bg-[#F0EDE4] shadow-xl border-2 border-[#004743]/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-[#004743]">
                Set your nutrition priorities
              </CardTitle>
            </CardHeader>
          </motion.div>

          <CardContent>
            <motion.p
              className="text-center text-gray-600 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Select what matters most to you in your food choices
            </motion.p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {prioritiesOptions.map((priority, index) => (
                  <motion.div
                    key={priority.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                    onClick={() => togglePriority(priority.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all border-2 flex items-center
                      ${
                        selectedPriorities.includes(priority.id)
                          ? "border-[#004743] bg-[#004743]/10 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }
                    `}
                  >
                    <div
                      className={`
                      w-5 h-5 rounded-sm border-2 mr-2 flex items-center justify-center flex-shrink-0
                      ${
                        selectedPriorities.includes(priority.id)
                          ? "border-[#004743] bg-[#004743]"
                          : "border-gray-400"
                      }
                    `}
                    >
                      {selectedPriorities.includes(priority.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm">{priority.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-lg transition-all duration-300 transform hover:scale-[1.02] mt-6 shadow-lg hover:shadow-xl"
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
