"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StepIndicator from "@/components/features/onboarding_flow/components/StepIndicator";
import { motion } from "framer-motion";

export default function FoodAllergiesPage() {
  const router = useRouter();
  const [allergyIngredients, setAllergyIngredients] = useState<string>("");
  const [otherRestrictions, setOtherRestrictions] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allergyIngredients.trim() && !otherRestrictions.trim()) return;

    // Store allergies in session storage
    const userPreferences = JSON.parse(
      sessionStorage.getItem("userPreferences") || "{}"
    );
    sessionStorage.setItem(
      "userPreferences",
      JSON.stringify({
        ...userPreferences,
        allergyIngredients: allergyIngredients.trim(),
        otherRestrictions: otherRestrictions.trim(),
      })
    );

    router.push("/onboarding/nutrition-priorities");
  };

  const handleBack = () => {
    router.push("/onboarding/dietary-preferences");
  };

  // Add a skip function near your other handler functions
  const handleSkip = () => {
    // Store empty array for allergies when skipped
    const userPreferences = JSON.parse(
      sessionStorage.getItem("userPreferences") || "{}"
    );

    sessionStorage.setItem(
      "userPreferences",
      JSON.stringify({
        ...userPreferences,
        foodAllergies: [], // Save empty array to indicate no allergies
      })
    );

    // Proceed to next step
    router.push("/onboarding/nutrition-priorities");
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
          currentStep={6}
          totalSteps={7}
          onBack={handleBack}
          variant="light"
          className="mb-6"
        />

        <Card className="bg-[#F0EDE4] shadow-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardHeader className="text-center pt-6">
              <CardTitle className="text-2xl font-bold text-[#004743]">
                Any food allergies we should know about?
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
              We&apos;ll help you avoid these ingredients
            </motion.p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Label
                    htmlFor="allergyIngredients"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    What are those ingredients?
                  </Label>
                  <Textarea
                    id="allergyIngredients"
                    value={allergyIngredients}
                    onChange={(e) => setAllergyIngredients(e.target.value)}
                    placeholder="List any ingredients you're allergic to (e.g., peanuts, dairy, shellfish...)"
                    className="min-h-[100px] bg-[#FFFFFF] resize-none border-gray-300 focus:border-[#004743] focus:ring-[#004743] transition-all duration-300"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Label
                    htmlFor="otherRestrictions"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Any other food restrictions you have?
                  </Label>
                  <Textarea
                    id="otherRestrictions"
                    value={otherRestrictions}
                    onChange={(e) => setOtherRestrictions(e.target.value)}
                    placeholder="Any other dietary restrictions or preferences (e.g., vegetarian, low sodium, religious restrictions...)"
                    className="min-h-[100px] resize-none bg-[#FFFFFF] border-gray-300 focus:border-[#004743] focus:ring-[#004743] transition-all duration-300"
                  />
                </motion.div>
              </div>

              <motion.div
                className="flex space-x-4 w-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button
                  type="button"
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1 border-[#004743] text-[#004743] hover:bg-[#004743]/10 py-6 text-lg rounded-lg transition-all duration-300"
                >
                  Skip
                </Button>

                <Button
                  type="submit"
                  disabled={
                    !allergyIngredients.trim() && !otherRestrictions.trim()
                  }
                  className="flex-1 bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Continue <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
