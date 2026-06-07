"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import styles from "./welcome.module.css";
import "../../styles/utilities.css";
import "../../styles/animations.css";

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
    <div className={`${styles.heroSection} bgWave`}>
      {/* Left Content Section */}
      <div className={styles.leftContent}>
        <div className={`${styles.contentContainer} animateFadeInUp`}>
          <div className={styles.titleContainer}>
            <h2 className={styles.subtitle}>Welcome to</h2>
            <h1 className={styles.title}>Health Boot</h1>
          </div>
          
          <p className={styles.description}>
            A Community driven initiative to let you make better food choices.
          </p>

          <div className={styles.actionsContainer}>
            <Button
              onClick={handleGetStarted}
              className={styles.getStartedButton}
            >
              Get Started
            </Button>

            <button
              onClick={handleLogin}
              className={styles.loginLink}
            >
              Create an account? Signup here
            </button>
          </div>
        </div>
      </div>

      {/* Right Visual Section */}
      <div className={styles.rightVisualSection}>
        {/* Dynamic pulsing background circle */}
        <div className={styles.pulsingCircle}></div>
        
        {/* Scattered glowing circuit dots/nodes */}
        <div className={styles.dotsContainer}>
          <div className={styles.dot1} />
          <div className={styles.dot2} />
          <div className={styles.dot3} />
          <div className={styles.dot4} />
          <div className={styles.dot5} />
        </div>
        
        <div className={styles.phonePreviewContainer}>
          <Image
            src="/app_demo.png"
            height={500}
            width={250}
            alt="Health Boot App Preview"
            className={styles.phonePreview}
            priority
          />
        </div>
      </div>
    </div>
  );
}
