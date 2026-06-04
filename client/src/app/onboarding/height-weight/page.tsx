"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Info, User, Scale, Ruler } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StepIndicator from "@/components/features/onboarding_flow/components/StepIndicator";
import { motion } from "framer-motion";

export default function HeightWeightPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    age: "",
    height: "",
    weight: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.age || !userInfo.height || !userInfo.weight) return;

    // Store age, height and weight in session storage
    const userPreferences = JSON.parse(
      sessionStorage.getItem("userPreferences") || "{}"
    );
    sessionStorage.setItem(
      "userPreferences",
      JSON.stringify({
        ...userPreferences,
        userInfo,
      })
    );

    router.push("/onboarding/health-goals");
  };

  const handleBack = () => {
    router.push("/onboarding/workout-frequency");
  };

  // Generate height options (120 to 220 cm)
  const heightOptions = [];
  for (let height = 120; height <= 220; height++) {
    heightOptions.push(height.toString());
  }

  // Generate weight options (40 to 150 kg)
  const weightOptions = [];
  for (let weight = 40; weight <= 150; weight++) {
    weightOptions.push(weight.toString());
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3F0] to-[#EBE7E0] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <StepIndicator
          currentStep={2}
          totalSteps={7}
          onBack={handleBack}
          variant="light"
          className="mb-6"
        />

        <Card className="bg-[#F0EDE4] shadow-xl border-2 border-[#004743]/10 rounded-2xl overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardHeader className="text-center pb-2 pt-8">
              <CardTitle className="text-2xl font-bold text-[#004743]">
                Your Physical Profile
              </CardTitle>
              <CardDescription className="text-[#004743]/70 mt-2">
                This helps us personalize your health journey
              </CardDescription>
            </CardHeader>
          </motion.div>

          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Age Input */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Label
                  htmlFor="age"
                  className="text-lg font-medium text-[#004743] flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-[#004743]/10 text-[#004743] rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  Age
                </Label>
                <div className="relative">
                  <Input
                    id="age"
                    type="number"
                    min="16"
                    max="100"
                    required
                    value={userInfo.age}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        age: e.target.value,
                      })
                    }
                    className="bg-white border-2 border-[#004743]/20 text-black placeholder:text-gray-400 rounded-xl h-14 text-lg font-medium shadow-sm focus:border-[#004743] focus:ring-2 focus:ring-[#004743]/20 pl-4 pr-16"
                    placeholder="Your age"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#004743]/70 font-medium">
                    years
                  </div>
                </div>
                <p className="text-xs text-[#004743]/60 flex items-center gap-1 ml-1">
                  <Info className="w-3 h-3" />
                  Age helps customize your health recommendations
                </p>
              </motion.div>

              {/* Height and Weight Row */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Height Input */}
                <motion.div
                  className="space-y-0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <div className="flex items-center gap-12">
                    <Label
                      htmlFor="height"
                      className="text-lg font-medium text-[#004743] flex items-center gap-3 w-1/3"
                    >
                      <div className="w-10 h-10 bg-[#004743]/10 text-[#004743] rounded-full flex items-center justify-center">
                        <Ruler className="w-5 h-5" />
                      </div>
                      Height
                    </Label>
                    <div className="flex-1">
                      <Select
                        value={userInfo.height}
                        onValueChange={(value) =>
                          setUserInfo({
                            ...userInfo,
                            height: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-white border-2 border-[#004743]/20 text-black rounded-xl h-14 text-base font-medium shadow-sm focus:border-[#004743] focus:ring-2 focus:ring-[#004743]/20">
                          <SelectValue placeholder="Select height" />
                        </SelectTrigger>
                        <SelectContent className="max-h-52 rounded-xl border-2 border-[#004743]/20 bg-white">
                          {heightOptions.map((height) => (
                            <SelectItem
                              key={height}
                              value={height}
                              className="rounded-lg hover:bg-[#004743]/10 focus:bg-[#004743]/10 font-medium"
                            >
                              {height} cm
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>

                {/* Weight Input */}
                <motion.div
                  className="space-y-0 mt-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <div className="flex items-center gap-12">
                    <Label
                      htmlFor="weight"
                      className="text-lg font-medium text-[#004743] flex items-center gap-3 w-1/3"
                    >
                      <div className="w-10 h-10 bg-[#004743]/10 text-[#004743] rounded-full flex items-center justify-center">
                        <Scale className="w-5 h-5" />
                      </div>
                      Weight
                    </Label>
                    <div className="flex-1">
                      <Select
                        value={userInfo.weight}
                        onValueChange={(value) =>
                          setUserInfo({
                            ...userInfo,
                            weight: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-white border-2 border-[#004743]/20 text-black rounded-xl h-14 text-base font-medium shadow-sm focus:border-[#004743] focus:ring-2 focus:ring-[#004743]/20">
                          <SelectValue placeholder="Select weight" />
                        </SelectTrigger>
                        <SelectContent className="max-h-52 rounded-xl border-2 border-[#004743]/20 bg-white">
                          {weightOptions.map((weight) => (
                            <SelectItem
                              key={weight}
                              value={weight}
                              className="rounded-lg hover:bg-[#004743]/10 focus:bg-[#004743]/10 font-medium"
                            >
                              {weight} kg
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="pt-4"
              >
                <Button
                  type="submit"
                  disabled={
                    !userInfo.age || !userInfo.height || !userInfo.weight
                  }
                  className={`w-full bg-[#004743] text-white font-semibold py-4 rounded-xl h-14 text-lg shadow-md transition-all duration-300 ${
                    !userInfo.age || !userInfo.height || !userInfo.weight
                      ? "opacity-100 cursor-not-allowed"
                      : "hover:shadow-lg"
                  }`}
                  style={{ opacity: 1 }} // Force full opacity
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-center text-[#004743]/60 text-xs mt-4">
                  Your data is secure and used only for personalization
                </p>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
