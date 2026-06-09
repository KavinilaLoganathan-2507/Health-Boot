"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const startVideo = (e: React.MouseEvent) => {
    // Prevent clicking the button from triggering the parent div's click event
    e.stopPropagation(); 
    setHasInteracted(true);
    
    if (videoRef.current) {
      videoRef.current.muted = false; // Turn audio back on safely
      videoRef.current.play().catch((err) => {
        console.log("Play failed, fallback to muted:", err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
    }
  };

  const handleNavigation = () => {
    // Skip intro if they click while video is playing
    if (!hasInteracted || isNavigating) return;
    setIsNavigating(true);
    if (videoRef.current) videoRef.current.pause();
    router.push("/welcome");
  };

  return (
    <div
      onClick={handleNavigation}
      className="relative w-full h-screen overflow-hidden bg-black flex flex-col justify-center items-center cursor-pointer select-none"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        playsInline
        preload="auto"
        onEnded={handleNavigation}
        // If not interacted yet, keep it paused on frame 1
        autoPlay={hasInteracted} 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Glassmorphism Tap-to-Start Overlay */}
      {!hasInteracted && (
        <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <button
            onClick={startVideo}
            className="group flex flex-col items-center justify-center w-64 h-64 md:w-72 md:h-72 rounded-full border border-white/30 bg-white/10 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-white/40"
          >
            {/* Heart/Plus Icon (Matching your image) */}
            {/* <div className="text-white/80 group-hover:text-white transition-colors duration-300 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </div> */}

            {/* CTA Text */}
            <span className="text-white/90 text-xl font-medium tracking-wide flex items-center gap-1 group-hover:text-white transition-colors duration-300">
              Tap to Start 
              {/* <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
                →
              </span> */}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}