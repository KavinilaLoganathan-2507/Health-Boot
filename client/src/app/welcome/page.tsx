"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function WelcomePage() {
  const router = useRouter();

  const clearAuth = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userData");
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const handleGetStarted = () => {
    clearAuth();
    router.push("/login");
  };

  const handleLogin = () => {
    clearAuth();
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] bg-wave flex flex-col lg:flex-row overflow-hidden relative">
      {/* Left Content Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 xl:p-24 z-10">
        <div className="max-w-xl mx-auto lg:mx-0 space-y-8 animate-fade-in-up">
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl text-slate-800 font-normal">Welcome to</h2>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight">Health Boot</h1>
          </div>
          
          <p className="text-slate-700 text-lg md:text-xl leading-relaxed text-center lg:text-left font-light">
            A Community driven initiative to let you make better food choices.
          </p>

          <div className="space-y-4 pt-8 max-w-sm mx-auto lg:mx-0">
            <Button
              onClick={handleGetStarted}
              className="w-full bg-slate-900 hover:animate-heartbeat hover:shadow-cyan-glow hover:scale-[1.02] active:scale-[0.98] text-white font-medium py-6 text-xl rounded-lg transition-all duration-300 shadow-md cursor-pointer"
            >
              Get Started
            </Button>

            <button
              onClick={handleLogin}
              className="w-full text-blue-600 hover:text-cyan-500 text-lg font-medium transition-colors duration-200 mt-4 cursor-pointer"
            >
              Create an account? Signup here
            </button>
          </div>
        </div>
      </div>

      {/* Right Visual Section */}
      <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-screen flex items-center justify-center bg-slate-50/50 p-8 overflow-hidden">
        {/* Dynamic pulsing background circle */}
        <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-cyan-200/40 rounded-full blur-3xl opacity-60 animate-pulse duration-[4000ms]"></div>
        
        {/* Scattered glowing circuit dots/nodes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-2 h-2 bg-cyan-400 rounded-full blur-[1px] animate-pulse opacity-40 top-1/4 left-1/3" />
          <div className="absolute w-3 h-3 bg-cyan-300 rounded-full blur-[1px] animate-pulse opacity-30 top-1/3 left-2/3" />
          <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full blur-[1px] animate-pulse opacity-50 top-2/3 left-1/4" />
          <div className="absolute w-2.5 h-2.5 bg-cyan-300 rounded-full blur-[1px] animate-pulse opacity-40 top-3/4 left-3/4" />
          <div className="absolute w-2 h-2 bg-cyan-400 rounded-full blur-[1px] animate-pulse opacity-60 top-1/2 left-[85%]" />
        </div>
        
        <div className="relative z-10 transform transition-transform duration-700 hover:scale-105">
          <Image
            src="client/public/Screenshot 2026-06-06 at 8.36.02 PM.png"
            height={500}
            width={250}
            alt="Health Boot App Preview"
            className="drop-shadow-2xl object-contain h-auto max-h-[80vh] w-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
}
