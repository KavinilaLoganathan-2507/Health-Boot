"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/welcome");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 0,
        padding: 0,
      }}
      className="bg-[#F0EDE4]"
    >
      <Image
        src="https://res.cloudinary.com/dqqyuvg1v/image/upload/v1750537445/ChatGPT_Image_Jun_22_2025_12_34_08_AM_t2mgyn.png"
        alt="NutriScan Landing"
        width={500}
        height={500}
        priority
        style={{
          objectFit: "cover",
        }}
      />
    </div>
  );
}
