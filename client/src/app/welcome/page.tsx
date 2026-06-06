"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function WelcomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/scan");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F3F0] flex flex-col lg:flex-row overflow-hidden">
      {/* Left Content Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 xl:p-24 z-10">
        <div className="max-w-xl mx-auto lg:mx-0 space-y-8 animate-fade-in-up">
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl text-gray-700 font-normal">Welcome to</h2>
            <h1 className="text-5xl md:text-7xl font-bold text-black tracking-tight">NutriScan</h1>
          </div>
          
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed text-center lg:text-left">
            A Community driven initiative to let you make better food choices
          </p>

          <div className="space-y-4 pt-8 max-w-sm mx-auto lg:mx-0">
            <Button
              onClick={handleGetStarted}
              className="w-full bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-xl rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md"
            >
              Get Started
            </Button>

            <button
              onClick={handleLogin}
              className="w-full text-gray-600 hover:text-gray-800 text-lg font-medium transition-colors duration-200 mt-4"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>

      {/* Right Visual Section */}
      <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-screen flex items-center justify-center bg-[#e8e4db] p-8">
        {/* Decorative background circle */}
        <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#F5F3F0] rounded-full blur-3xl opacity-60"></div>
        
        <div className="relative z-10 transform transition-transform duration-700 hover:scale-105">
          <Image
            src="https://res.cloudinary.com/dqqyuvg1v/image/upload/v1750553055/Phone_3a_Pro_mockup_silver_portrait_uvzdui.png"
            height={500}
            width={250}
            alt="NutriScan App Preview"
            className="drop-shadow-2xl object-contain h-auto max-h-[80vh] w-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
}
