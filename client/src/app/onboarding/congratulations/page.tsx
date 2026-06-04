"use client";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle, ArrowRight, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CongratulationsPage() {
  const router = useRouter();

  const handleStartScanning = () => {
    // Store user as logged in
    try {
      const userDetails = JSON.parse(
        sessionStorage.getItem("userDetails") || "{}"
      );
      const userPreferences = JSON.parse(
        sessionStorage.getItem("userPreferences") || "{}"
      );

      // Store in localStorage for persistence
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userDetails,
          ...userPreferences,
          isLoggedIn: true,
        })
      );
    } catch (error) {
      console.error("Error storing user data:", error);
    }

    // Navigate to scan page
    router.push("/scan");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const sparkleVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        delay: 0.3,
      },
    },
  };

  const contentVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.5,
      },
    },
  };

  const checklistVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: 0.8,
      },
    },
  };
  return (
    <div className="min-h-screen bg-[#F5F3F0] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

      <motion.div
        className="relative w-full max-w-md"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="bg-[#F0EDE4] border-[#004743] border-2 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#004743] to-[#009688]"></div>

          <CardContent className="p-8 text-center">
            <motion.div
              className="flex justify-center mb-6"
              variants={sparkleVariants}
              initial="initial"
              animate="animate"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-[#004743]/10 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="w-20 h-20 bg-[#004743] rounded-full flex items-center justify-center relative z-10">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
            >
              <motion.h1
                className="text-3xl font-bold mb-4 text-[#004743]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Congratulations!
              </motion.h1>

              <motion.p
                className="text-gray-600 mb-8 text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Your profile is all set up. You&apos;re ready to start making
                healthier food choices with personalized nutrition insights.
              </motion.p>
            </motion.div>

            <motion.div
              className="mb-8 p-6 bg-[#004743]/10 rounded-lg border border-[#004743]/20"
              variants={checklistVariants}
              initial="initial"
              animate="animate"
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-[#004743]" />
                <h3 className="font-semibold text-[#004743] text-lg">
                  Ready to Go!
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Start scanning product barcodes to get instant nutritional
                analysis tailored to your profile.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mb-4"
            >
              <Button
                onClick={handleStartScanning}
                className="w-full bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-xl rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Scanning
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleLogin}
                className="w-full bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-xl rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <span className="flex items-center justify-center gap-2">
                  Login
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <LogIn className="w-5 h-5" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
