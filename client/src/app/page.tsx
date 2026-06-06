"use client";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function LandingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClick = () => {
    // Any click skips the intro
    router.push("/welcome");
  };

  return (
    <div
      onClick={handleClick}
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 0,
        padding: 0,
        backgroundColor: "black",
      }}
      className="relative w-full h-screen overflow-hidden cursor-pointer flex flex-col justify-center items-center"
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        playsInline
        preload="auto"
        onEnded={() => router.push("/welcome")}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
}
