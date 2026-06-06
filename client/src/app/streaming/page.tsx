"use client";
import "./styles.css";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import EatFoodButton from "@/components/EatFoodButton";
import { NutritionStreaming } from "@/components/features/nutrition_streaming/NutritionStreaming";
import TTS from "@/components/tts";

// Client component that uses useSearchParams
function StreamingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [barcode, setBarcode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [productPreview, setProductPreview] = useState<any>(null);
  const [previewError, setPreviewError] = useState<string>("");
  const [ttsContent, setTtsContent] = useState<string>("");
  const [streamingComplete, setStreamingComplete] = useState<boolean>(false);
  const [nutritionalElements, setNutritionalElements] = useState<string[]>([]);

  useEffect(() => {
    const barcodeParam = searchParams.get("barcode");
    if (!barcodeParam) return;

    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    setBarcode(barcodeParam);
    setIsLoading(true);
    setPreviewError("");
    setProductPreview(null);
    console.log("Extracted barcode from URL:", barcodeParam);

    const controller = new AbortController();

    const loadPreview = async () => {
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(barcodeParam)}`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        const text = await response.text();
        const body = text ? JSON.parse(text) : null;

        if (!response.ok) {
          setPreviewError(body?.message || body?.error?.message || response.statusText || "Unable to load product preview");
          return;
        }

        setProductPreview(body?.data ?? body);
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        setPreviewError("Unable to load product preview");
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();

    return () => controller.abort();
  }, [searchParams]);

  const handleFirstStreamChunk = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    if (!streamingComplete) return;
    const elements = document.getElementById("nutritionalInfos")?.textContent;
    if (elements) {
      try {
        const elementArray = elements
          .split(",")
          .map((element) => element.trim());
        setNutritionalElements(elementArray);
      } catch (error) {
        console.error("Error parsing nutritional elements:", error);
      }
    }
  }, [streamingComplete]);

  const handleAnalysisComplete = () => {
    setStreamingComplete(true);

    const textContent =
      document.getElementById("transcript_summary")?.textContent;

    if (textContent && textContent.trim()) {
      setTtsContent(textContent);
    }
  };

  const handleEatFood = (elements: string[]) => {
    console.log("User ate food with elements:", elements);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <button
          type="button"
          onClick={() => router.push("/scan")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-900/15 bg-[#F4F7FB] px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-[#f0ede4]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to scan
        </button>
      </div>

      {/* Eat Food Button */}
      <EatFoodButton
        barcode={barcode}
        nutritionalElements={nutritionalElements}
        onEatFood={handleEatFood}
      />

      {/* Only show TTS when streaming is complete */}
      {streamingComplete && <TTS text={ttsContent} />}
      <div>
        {isLoading && barcode && (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-slate-700 font-medium">
                Something is cooking...
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Analyzing your product&apos;s nutrition information
              </p>
            </div>
          </div>
        )}
        {productPreview && (
          <div className="mx-auto max-w-3xl px-4 pb-4">
            <div className="rounded-2xl border border-slate-900/10 bg-[#f0ede4] p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-900/70 font-semibold">
                Fast product preview
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {productPreview?.product_identification?.product_name ||
                  productPreview?.product_identification?.brand ||
                  "Product details"}
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-[#F4F7FB]/80 p-3">
                  <p className="text-slate-500">Nutri-Score</p>
                  <p className="font-semibold text-slate-900">
                    {productPreview?.health_scoring?.nutriscore?.grade || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg bg-[#F4F7FB]/80 p-3">
                  <p className="text-slate-500">Calories</p>
                  <p className="font-semibold text-slate-900">
                    {typeof productPreview?.nutritional_information?.per_100g?.energy_kcal === "number"
                      ? `${productPreview.nutritional_information.per_100g.energy_kcal} kcal`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {previewError && (
          <div className="mx-auto max-w-3xl px-4 pb-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">
                {previewError}
              </p>
            </div>
          </div>
        )}
        <NutritionStreaming
          initialBarcode={barcode}
          onFirstStreamChunk={handleFirstStreamChunk}
          onAnalysisComplete={handleAnalysisComplete}
        />
      </div>
    </div>
  );
}

export default function StreamingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StreamingContent />
    </Suspense>
  );
}
