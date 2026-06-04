"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/components/features/onboarding_flow/components/StepIndicator";
import { motion } from "framer-motion";

const dietaryPreferencesOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "keto", label: "Keto" },
  { id: "paleo", label: "Paleo" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "low_carb", label: "Low Carb" },
  { id: "low_sugar", label: "Low Sugar" },
  { id: "low_sodium", label: "Low Sodium" },
  { id: "high_protein", label: "High Protein" },
  { id: "gluten_free", label: "Gluten Free" },
  { id: "dairy_free", label: "Dairy Free" },
  { id: "no_specific_diet", label: "No Specific Diet" },
];

export default function DietaryPreferencesPage() {
  const router = useRouter();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const togglePreference = (preferenceId: string) => {
    // Handle "No Specific Diet" option specially
    if (preferenceId === "no_specific_diet") {
      if (selectedPreferences.includes(preferenceId)) {
        setSelectedPreferences([]);
      } else {
        setSelectedPreferences(["no_specific_diet"]);
      }
      return;
    }

    // If "No Specific Diet" is already selected, clear it when selecting others
    if (selectedPreferences.includes("no_specific_diet")) {
      setSelectedPreferences([preferenceId]);
      return;
    }

    if (selectedPreferences.includes(preferenceId)) {
      setSelectedPreferences(
        selectedPreferences.filter((id) => id !== preferenceId)
      );
    } else {
      setSelectedPreferences([...selectedPreferences, preferenceId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store dietary preferences in session storage
    const userPreferences = JSON.parse(
      sessionStorage.getItem("userPreferences") || "{}"
    );
    sessionStorage.setItem(
      "userPreferences",
      JSON.stringify({
        ...userPreferences,
        dietaryPreferences: selectedPreferences,
      })
    );

    router.push("/onboarding/food-allergies");
  };

  const handleBack = () => {
    router.push("/onboarding/goal-timeframe");
  };

  return (
    <div className="min-h-screen bg-[#F5F3F0] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <StepIndicator
          currentStep={5}
          totalSteps={7}
          onBack={handleBack}
          variant="light"
          className="mb-6"
        />

        <Card className="bg-[#F0EDE4]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardHeader className="text-center pt-6">
              <CardTitle className="text-2xl font-bold text-[#004743]">
                Do you follow any specific diet?
              </CardTitle>
            </CardHeader>
          </motion.div>

          <CardContent className="p-6">
            <motion.p
              className="text-center text-gray-600 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Select all diets you follow
            </motion.p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                className="flex flex-col space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {dietaryPreferencesOptions.map((preference, index) => (
                  <motion.div
                    key={preference.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    onClick={() => togglePreference(preference.id)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all border-2 flex items-center
                      ${
                        selectedPreferences.includes(preference.id)
                          ? "border-[#004743] bg-[#004743]/10"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div
                      className={`
                      w-5 h-5 rounded-sm border-2 mr-3 flex items-center justify-center flex-shrink-0
                      ${
                        selectedPreferences.includes(preference.id)
                          ? "border-[#004743] bg-[#004743]"
                          : "border-gray-400"
                      }
                    `}
                    >
                      {selectedPreferences.includes(preference.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-md font-medium">
                      {preference.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={selectedPreferences.length === 0}
                  className="w-full bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-lg rounded-lg transition-colors duration-300 shadow-sm"
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
