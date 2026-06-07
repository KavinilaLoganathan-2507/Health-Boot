import React, { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { WS_URL } from "@/lib/constants";
import styles from "./NutritionStreaming.module.css";

interface StreamMessage {
  type: string;
  content: string;
  data?: any;
  section?: string;
}

interface NutritionStreamingProps {
  onAnalysisComplete?: (analysis: string) => void;
  onStreamingStart?: () => void;
  onFirstStreamChunk?: () => void;
  initialBarcode?: string;
}

export function NutritionStreaming({
  onAnalysisComplete,
  onStreamingStart,
  onFirstStreamChunk,
  initialBarcode,
}: NutritionStreamingProps) {
  const [barcode, setBarcode] = useState(initialBarcode || "");
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState("");
  const [hasReceivedFirstChunk, setHasReceivedFirstChunk] = useState(false);
  const [productSummary, setProductSummary] = useState<string>("");
  const [productData, setProductData] = useState<any>(null);
  const [streamError, setStreamError] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (initialBarcode) {
      setBarcode(initialBarcode);
    }
  }, [initialBarcode]);

  useEffect(() => {
    if (initialBarcode && isConnected && !isStreaming && barcode.trim()) {
      const timer = setTimeout(() => {
        startAnalysis();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [initialBarcode, isConnected]);

  const connectWebSocket = () => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      alert("Please login to use the nutrition streaming feature");
      return;
    }

    const wsUrl = `${WS_URL}/ws/nutrition/stream?token=${encodeURIComponent(
      token
    )}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const message: StreamMessage = JSON.parse(event.data);
      if (message.type === "stream_chunk") {
        setCurrentAnalysis((prev) => prev + message.content);
        if (!hasReceivedFirstChunk) {
          setHasReceivedFirstChunk(true);
          onFirstStreamChunk?.();
        }
      } else if (message.type === "product_found") {
        setProductSummary(message.content);
        setProductData(message.data ?? null);
        if (!hasReceivedFirstChunk) {
          setHasReceivedFirstChunk(true);
          onFirstStreamChunk?.();
        }
      } else if (message.type === "stream_complete") {
        setIsStreaming(false);
        setCurrentAnalysis(message.content);
        onAnalysisComplete?.(message.content);
      } else if (message.type === "error") {
        setIsStreaming(false);
        setStreamError(message.content);
        console.log("Streaming error:", message.content);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.log("WebSocket error:", error);
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const productName =
    productData?.product_identification?.product_name ||
    productData?.product_identification?.brand ||
    "";
  const nutriScore = productData?.health_scoring?.nutriscore?.grade || "";
  const calories = productData?.nutritional_information?.per_100g?.energy_kcal;
  const protein = productData?.nutritional_information?.per_100g?.proteins;
  const sugar = productData?.nutritional_information?.per_100g?.sugars;
  const servingSize =
    productData?.nutritional_information?.per_100g?.serving_size ||
    productData?.nutritional_information?.per_serving?.serving_size ||
    "";

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const startAnalysis = () => {
    if (!wsRef.current || !isConnected) {
      alert("WebSocket not connected");
      return;
    }

    if (!barcode.trim()) {
      alert("Please enter a barcode");
      return;
    }

    setIsStreaming(true);
    setStreamError("");
    onStreamingStart?.();
    setCurrentAnalysis("");

    const request = {
      barcode: barcode.trim(),
    };

    wsRef.current.send(JSON.stringify(request));
  };

  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, []);

  return (
    <div className={styles.nutritionContainer}>
      {productSummary && (
        <Card className={styles.productCard}>
          <CardContent className={styles.productCardContent}>
            <div className={styles.productHeader}>
              <div className={styles.pulseDot} />
              <div className={styles.productInfo}>
                <p className={styles.productStatus}>
                  Product found
                </p>
                <p className={styles.productTitle}>
                  {productSummary}
                </p>
                {productName && (
                  <p className={styles.productSubtitle}>
                    {productName}
                  </p>
                )}
                <div className={styles.statsGrid}>
                  <div className={styles.statBox}>
                    <p className={styles.statLabel}>Nutri-Score</p>
                    <p className={styles.statValue}>
                      {nutriScore || "Pending"}
                    </p>
                  </div>
                  <div className={styles.statBox}>
                    <p className={styles.statLabel}>Serving</p>
                    <p className={styles.statValue}>
                      {servingSize || "N/A"}
                    </p>
                  </div>
                  <div className={styles.statBox}>
                    <p className={styles.statLabel}>Calories</p>
                    <p className={styles.statValue}>
                      {typeof calories === "number" ? `${calories} kcal` : "N/A"}
                    </p>
                  </div>
                  <div className={styles.statBox}>
                    <p className={styles.statLabel}>Protein</p>
                    <p className={styles.statValue}>
                      {typeof protein === "number" ? `${protein} g` : "N/A"}
                    </p>
                  </div>
                </div>
                <div className={styles.infoBox}>
                  <span className={styles.infoLabel}>Sugar: </span>
                  {typeof sugar === "number" ? `${sugar} g per 100g` : "N/A"}
                </div>
                <p className={styles.infoText}>
                  Showing the product first while the personalized nutrition analysis continues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {streamError && (
        <Card className={styles.errorCard}>
          <CardContent className={styles.errorCardContent}>
            <p className={styles.errorStatus}>
              Scan issue
            </p>
            <p className={styles.errorTitle}>
              {streamError}
            </p>
            <p className={styles.errorText}>
              Double-check that the scanned code is a product barcode. If it’s a QR code or custom ID, the OpenFoodFacts lookup may not find it.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Output */}
      {currentAnalysis && (
        <Card className={styles.analysisCard}>
          <CardContent className={styles.analysisContent}>
            <div className={styles.proseContainer}>
              <div
                className="prose prose-sm w-full"
                dangerouslySetInnerHTML={{
                  __html: currentAnalysis,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
