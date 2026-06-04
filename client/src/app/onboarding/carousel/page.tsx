"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const carouselItems = [
  {
    title: "Personalized Product Nutri-Score",
    description:
      "Scan the product QR to show Nutri score between A to E based on my personal preferences",
    image:
      "https://res.cloudinary.com/dqqyuvg1v/image/upload/v1750527766/Frame_2610294_exiv54.png",
  },
  {
    title: "Personalized to-dos",
    description:
      "Generate personalized to-dos based on the health goals and based on the Gemini analysis of the scanned product Barcode.",
    image:
      "https://res.cloudinary.com/dqqyuvg1v/image/upload/v1750527851/Frame_2610382_jp5u28.png",
  },
  {
    title: "Track Your Nutrition Progress",
    description:
      "Log the food you scan and get suggestions and warnings based on your selected parameters.",
    image:
      "https://res.cloudinary.com/dqqyuvg1v/image/upload/v1750528235/Group_5_nmzptc.png",
  },
];

export default function CarouselPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    router.push("/onboarding/user-details");
  };

  return (
    <div className="min-h-screen bg-[#F5F3F0] flex flex-col items-center justify-center p-4">
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {" "}
        <Card className="bg-[#F0EDE4] overflow-hidden shadow-xl">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="py-12 px-4 text-center min-h-[300px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {carouselItems.map(
                  (item, index) =>
                    currentIndex === index && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.9 }}
                        transition={{
                          duration: 0.5,
                          type: "spring",
                          stiffness: 100,
                          damping: 20,
                        }}
                        className="w-full"
                      >
                        <motion.div
                          className="flex justify-center mb-4"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            duration: 0.6,
                            type: "spring",
                            stiffness: 150,
                            damping: 15,
                            delay: 0.2,
                          }}
                        >
                          <div className="relative">
                            <motion.div
                              className="absolute inset-0 bg-[#004743]/10 rounded-full"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />{" "}
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={280}
                              height={280}
                              className="w-56 h-56 relative z-10"
                            />
                          </div>
                        </motion.div>

                        <motion.h2
                          className="text-3xl font-bold mb-6 text-[#004743]"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          {item.title}
                        </motion.h2>

                        <motion.p
                          className="text-gray-600 text-lg leading-relaxed"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          {item.description}
                        </motion.p>
                      </motion.div>
                    )
                )}{" "}
              </AnimatePresence>
            </div>

            {/* Progress indicators as circles */}
            <motion.div
              className="flex justify-center space-x-2 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {carouselItems.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? "bg-[#004743] scale-110"
                      : "bg-gray-300"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: currentIndex === index ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </motion.div>

            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleContinue}
                  className="w-full mt-4 bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-xl rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Continue
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
