import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  UtensilsCrossed,
  AlarmClock,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserPreferencesStepProps {
  preferences: {
    healthGoals: string[];
    dietaryPreferences: string[];
    allergies: string[];
  };
  setPreferences: (preferences: {
    healthGoals: string[];
    dietaryPreferences: string[];
    allergies: string[];
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const UserPreferencesStep = ({
  preferences,
  setPreferences,
  onSubmit,
  onBack,
  isSubmitting = false,
}: UserPreferencesStepProps) => {
  // Add state to track which step of the preferences form we're on
  const [preferencesStep, setPreferencesStep] = useState<1 | 2 | 3>(1);

  const healthGoalsOptions = [
    { id: "weight_loss", label: "Weight Loss" },
    { id: "muscle_gain", label: "Muscle Gain" },
    { id: "heart_health", label: "Heart Health" },
    { id: "diabetes_management", label: "Diabetes Management" },
    { id: "general_wellness", label: "General Wellness" },
    { id: "energy_boost", label: "Energy Boost" },
  ];

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
  ];

  const allergiesOptions = [
    { id: "peanuts", label: "Peanuts" },
    { id: "tree_nuts", label: "Tree Nuts" },
    { id: "dairy", label: "Dairy" },
    { id: "eggs", label: "Eggs" },
    { id: "wheat", label: "Wheat" },
    { id: "soy", label: "Soy" },
    { id: "fish", label: "Fish" },
    { id: "shellfish", label: "Shellfish" },
    { id: "sesame", label: "Sesame" },
    { id: "none", label: "No Allergies" },
  ];

  const toggleSelection = (
    category: "healthGoals" | "dietaryPreferences" | "allergies",
    itemId: string
  ) => {
    const currentSelection = [...preferences[category]];

    if (category === "allergies" && itemId === "none") {
      // If "No Allergies" is selected, clear all other allergies
      setPreferences({
        ...preferences,
        allergies: currentSelection.includes("none") ? [] : ["none"],
      });
      return;
    }

    if (category === "allergies" && preferences.allergies.includes("none")) {
      // If selecting a specific allergy and "No Allergies" was selected before
      setPreferences({
        ...preferences,
        allergies: [itemId],
      });
      return;
    }

    const newSelection = currentSelection.includes(itemId)
      ? currentSelection.filter((id) => id !== itemId)
      : [...currentSelection, itemId];

    setPreferences({
      ...preferences,
      [category]: newSelection,
    });
  };

  // Progress indicator component
  const StepIndicator = () => (
    <div className="flex justify-center space-x-2 mb-4">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`w-2 h-2 rounded-full ${
            step === preferencesStep
              ? "bg-[#004743]"
              : step < preferencesStep
              ? "bg-green-500"
              : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );

  // Handle form step navigation
  const handleNext = () => {
    if (preferencesStep === 1) setPreferencesStep(2);
    else if (preferencesStep === 2) setPreferencesStep(3);
  };

  const handlePrevious = () => {
    if (preferencesStep === 3) setPreferencesStep(2);
    else if (preferencesStep === 2) setPreferencesStep(1);
    else onBack();
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  // Step-specific icon and title
  const getStepIcon = () => {
    switch (preferencesStep) {
      case 1:
        return <Heart className="w-6 h-6 text-[#004743]" />;
      case 2:
        return <UtensilsCrossed className="w-6 h-6 text-[#004743]" />;
      case 3:
        return <AlarmClock className="w-6 h-6 text-[#004743]" />;
    }
  };

  const getStepTitle = () => {
    switch (preferencesStep) {
      case 1:
        return "Your Health Goals";
      case 2:
        return "Your Dietary Preferences";
      case 3:
        return "Your Food Allergies";
    }
  };

  // Custom checkbox option component
  const CheckboxOption = ({
    label,
    isSelected,
    onClick,
  }: {
    id: string;
    label: string;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-5 mb-2 border-2 cursor-pointer transition-all ${
        isSelected
          ? "bg-white border-black"
          : "bg-inherit hover:bg-gray-50 border-black"
      }`}
    >
      <div
        className={`w-6 h-6 rounded flex items-center justify-center ${
          isSelected ? "bg-[#004743]" : " border-black border-2"
        }`}
      >
        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <span className="text-lg tracking-wide">{label}</span>
    </div>
  );

  return (
    <Card className="bg-transparent w-full">
      <CardHeader className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          {getStepIcon()}
          <CardTitle className="text-2xl flex font-bold bg-[#000] bg-clip-text text-transparent">
            {getStepTitle()}
          </CardTitle>
        </div>
        <StepIndicator />
      </CardHeader>

      <CardContent>
        <div className="text-center mb-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            className="text-gray-600 text-md hover:border-black border-2 hover:text-black hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {preferencesStep === 1 ? "Back" : "Previous"}
          </Button>
        </div>

        <form onSubmit={handleSubmitForm} className="space-y-6">
          {/* Form Step 1: Health Goals */}
          {preferencesStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium text-black">
                What are your health goals?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select all that apply to you
              </p>
              <div className="space-y-1">
                {healthGoalsOptions.map((option) => (
                  <CheckboxOption
                    key={option.id}
                    id={option.id}
                    label={option.label}
                    isSelected={preferences.healthGoals.includes(option.id)}
                    onClick={() => toggleSelection("healthGoals", option.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Form Step 2: Dietary Preferences */}
          {preferencesStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-2xl text-black">
                Do you follow any specific diet?
              </h3>
              <p className="text-md text-gray-600 mb-4">
                Select all diets you follow
              </p>
              <div className="space-y-5">
                {dietaryPreferencesOptions.map((option) => (
                  <CheckboxOption
                    key={option.id}
                    id={option.id}
                    label={option.label}
                    isSelected={preferences.dietaryPreferences.includes(
                      option.id
                    )}
                    onClick={() =>
                      toggleSelection("dietaryPreferences", option.id)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Form Step 3: Allergies */}
          {preferencesStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium text-black">
                Any food allergies we should know about?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                We&apos;ll help you avoid these ingredients
              </p>
              <div className="space-y-1">
                {allergiesOptions.map((option) => (
                  <CheckboxOption
                    key={option.id}
                    id={option.id}
                    label={option.label}
                    isSelected={preferences.allergies.includes(option.id)}
                    onClick={() => toggleSelection("allergies", option.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {preferencesStep !== 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="w-full bg-[#004743] text-white font-medium py-6 transition-all duration-300 transform text-xl hover:scale-[1.02] mt-6"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#004743] text-white font-medium py-3 transition-all duration-300 transform hover:scale-[1.02] mt-6"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving Preferences...
                </>
              ) : (
                <>
                  Continue to Nutrition Dashboard
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default UserPreferencesStep;
