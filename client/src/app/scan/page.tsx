"use client";

import { useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import QRScanner from "@/components/features/scanner/QRBarcodeScanner";

export default function ScanPage() {
  const router = useRouter();

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      console.log("Scanned QR Code:", decodedText);
      if (decodedText.length) {
        const productId = encodeURIComponent(decodedText.trim());
        router.push(`/streaming?barcode=${productId}`);
      }
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-[#F5F3F0] px-4 py-6">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-[#004743]/15 bg-white px-4 py-2 text-sm font-medium text-[#004743] shadow-sm transition-colors hover:bg-[#f0ede4]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <p className="text-sm font-medium text-[#004743]/70">
          Scan a barcode to start nutrition analysis
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-3xl rounded-3xl border border-[#004743]/10 bg-white p-4 shadow-sm sm:p-6">
        <QRScanner onScanSuccess={handleScanSuccess} />
      </div>
    </div>
  );
}
