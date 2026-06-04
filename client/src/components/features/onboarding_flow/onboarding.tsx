"use client";

import { useState } from "react";
import UserDetailsStep from "./steps/UserDetailsStep";
import RoleSelectionStep from "./steps/RoleSelectionStep";
import UserPreferencesStep from "./steps/UserPreferencesStep";
import StepIndicator from "./components/StepIndicator";
import { useOnboardingHandlers } from "./hooks/useOnboardingHandlers";
import { ROLE_OPTIONS } from "./constants/roleOptions";
import { UserDetails, BusinessDetails } from "@/types/userflow";

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: "",
    phone: "",
    password: "",
  });
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    name: "",
    location: "",
    type: "",
    scale: "",
    governmentId: "",
    description: "",
  });
  const [userPreferences, setUserPreferences] = useState({
    healthGoals: ["general_wellness"],
    dietaryPreferences: [] as string[],
    allergies: ["none"],
  });
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [, setApiResponse] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});

  const {
    handleUserDetailsSubmit,
    handleRoleSelection,
    handleUserPreferencesSubmit,
  } = useOnboardingHandlers({
    userDetails,
    setCurrentStep,
    account: {
      address: "",
      publicKey: "",
    },
    connected: false,
    setIsCreatingUser,
    setApiResponse,
    setSelectedRole,
    businessDetails,
    setBusinessDetails,
    userPreferences,
    setUserPreferences,
  });

  return (
    <div className="min-h-screen bg-[#F0EDE4] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

      <div className="relative w-full max-w-xl">
        <StepIndicator currentStep={currentStep} totalSteps={5} />

        {currentStep === 1 && (
          <UserDetailsStep
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            onSubmit={handleUserDetailsSubmit}
          />
        )}

        {currentStep === 2 && (
          <RoleSelectionStep
            roleOptions={ROLE_OPTIONS}
            selectedRole={selectedRole}
            onRoleSelect={handleRoleSelection}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 3 && (
          <UserPreferencesStep
            preferences={userPreferences}
            setPreferences={setUserPreferences}
            onSubmit={handleUserPreferencesSubmit}
            onBack={() => setCurrentStep(3)}
            isSubmitting={isCreatingUser}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
