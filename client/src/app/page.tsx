"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import styles from "./landing.module.css";

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
      className={styles.landingContainer}
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
        className={styles.videoBg}
      />

      {/* Glassmorphism Tap-to-Start Overlay */}
      {!hasInteracted && (
        <div className={styles.overlay}>
          <button
            onClick={startVideo}
            className={styles.tapButton}
          >
            {/* CTA Text */}
            <span className={styles.tapText}>
              Tap to Start 
            </span>
          </button>
        </div>
      )}
    </div>
  );
}