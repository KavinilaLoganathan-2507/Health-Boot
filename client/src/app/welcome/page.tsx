"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function WelcomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/onboarding/carousel");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F3F0] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-sm space-y-16 z-30 flex flex-col items-center justify-center">
        {/* Header Section */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-center space-y-8 animate-fade-in-up z-10 backdrop-blur-3xl py-2 w-full max-w-sm">
          <div className="space-y-4">
            <h2 className="text-3xl text-gray-700 font-normal">Welcome to</h2>
            <h1 className="text-5xl font-bold text-black">NutriScan</h1>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed px-2">
            A Community driven initiative to let you make better food choices
          </p>
        </div>
        <div className="absolute top-20 z-30 left-1/2 -translate-x-1/2 w-full h-full flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/dqqyuvg1v/image/upload/v1750553055/Phone_3a_Pro_mockup_silver_portrait_uvzdui.png"
            height={150}
            width={150}
            alt={""}
          />
        </div>

        {/* Buttons Section */}
        <div className="absolute bottom-0 z-40 left-1/2 -translate-x-1/2 w-full max-w-sm">
          {/* Gradient overlay */}
          <div
            className="h-[100px] w-full"
            style={{
              background: `linear-gradient(0deg, #F0EDE4 19.8%, rgba(255, 255, 255, 0.00) 115.84%)`,
            }}
          />
          
          {/* Button container */}
          <div className="space-y-8 animate-fade-in-up-more-delayed bg-white/30 rounded-t-3xl p-6 backdrop-blur-2xl mb-5">
            <Button
              onClick={handleGetStarted}
              className="w-full bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-xl rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-sm"
            >
              Get Started
            </Button>

            <button
              onClick={handleLogin}
              className="w-full text-gray-600 hover:text-gray-800 text-lg font-medium transition-colors duration-200"
            >
              Already Have an account? Login
            </button>
          </div>
        </div>
        </div>
      </div>
  );
}
