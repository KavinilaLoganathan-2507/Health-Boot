import Image from "next/image";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBackButton?: boolean;
  variant?: "light" | "dark";
  className?: string;
}

const StepIndicator = ({
  currentStep,
  totalSteps,
  onBack,
  showBackButton = true,
  variant = "dark",
  className = "",
}: StepIndicatorProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;
  const isDark = variant === "dark";
  return (
    <div className={`space-y-4 mb-8 ${className}`}>
      {onBack && showBackButton && currentStep > 1 && (
        <div className="flex justify-start">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              isDark
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
            aria-label="Go back to previous step"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>
      )}
      <div className="flex items-center justify-center">
        <div className="relative w-full max-w-80">
          <div
            className="absolute -top-2.5 transform -translate-x-1/2 transition-all duration-500 ease-out z-10"
            style={{
              left: `${progressPercentage}%`,
            }}
          >
            <Image
              src="https://res.cloudinary.com/dqqyuvg1v/image/upload/v1750560411/Vector_guwvbf.svg"
              alt="Progress indicator"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </div>
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500 ease-out bg-[#004743] rounded-full"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </div>
      </div>
      <div
        className={`text-center text-sm ${
          isDark ? "text-white/60" : "text-gray-500"
        }`}
      >
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
};

export default StepIndicator;
