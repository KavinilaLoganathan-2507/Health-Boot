"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Dumbbell, Weight, BicepsFlexed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StepIndicator from "@/components/features/onboarding_flow/components/StepIndicator";
import { motion } from "framer-motion";

const workoutOptions = [
  {
    id: "0-2",
    frequency: "0-2",
    label: "0-2",
    description: "Worksout now and then",
    icon: Weight,
  },
  {
    id: "3-5",
    frequency: "3-5",
    label: "3-5",
    description: "A few times in a week",
    icon: Dumbbell,
  },
  {
    id: "6+",
    frequency: "6+",
    label: "6+",
    description: "Athelete",
    icon: BicepsFlexed,
  },
];

export default function WorkoutFrequencyPage() {
  const router = useRouter();
  const [selectedFrequency, setSelectedFrequency] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFrequency) return;

    // Store the selection in session storage
    const userPreferences = JSON.parse(
      sessionStorage.getItem("userPreferences") || "{}"
    );
    sessionStorage.setItem(
      "userPreferences",
      JSON.stringify({
        ...userPreferences,
        workoutFrequency: selectedFrequency,
      })
    );
    router.push("/onboarding/height-weight");
  };
  const handleBack = () => {
    router.push("/onboarding/user-details");
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };
  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };
  return (
    <div className="min-h-screen bg-[#F5F3F0] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

      <motion.div
        className="relative w-full max-w-md"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <StepIndicator
          currentStep={1}
          totalSteps={7}
          onBack={handleBack}
          variant="light"
          className="mb-6"
        />

        <Card className="bg-[#F0EDE4] shadow-xl border-2 border-[#004743]/10">
          <motion.div variants={itemVariants}>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-[#004743]">
                How many times do you workout per week?
              </CardTitle>
            </CardHeader>
          </motion.div>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {workoutOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFrequency(option.id)}
                    className={`
                      p-6 cursor-pointer rounded-lg transition-all border-2 w-full 
                      ${
                        selectedFrequency === option.id
                          ? "border-[#004743] bg-[#004743]/10 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <div className="text-2xl font-bold text-[#004743]">
                            {option.frequency}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {option.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <motion.div
                          animate={
                            selectedFrequency === option.id
                              ? { rotate: [0, 10, -10, 0] }
                              : {}
                          }
                          transition={{ duration: 0.5 }}
                        >
                          <option.icon
                            className={`w-6 h-6 ${
                              selectedFrequency === option.id
                                ? "text-[#004743]"
                                : "text-gray-400"
                            }`}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={!selectedFrequency}
                  className="w-full bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-lg transition-all duration-300 shadow-lg hover:shadow-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
