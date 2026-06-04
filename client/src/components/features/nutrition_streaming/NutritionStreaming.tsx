import React, { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { WS_URL } from "@/lib/constants";

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
    <div className="w-full mx-auto space-y-6 font-inter">
      {productSummary && (
        <Card className="bg-[#f0ede4] border border-[#004743]/10">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="h-3 w-3 rounded-full bg-[#004743] animate-pulse mt-2" />
              <div>
                <p className="text-sm uppercase tracking-wide text-[#004743]/70 font-medium">
                  Product found
                </p>
                <p className="text-base text-[#004743] font-semibold">
                  {productSummary}
                </p>
                {productName && (
                  <p className="text-sm text-gray-700 mt-1">
                    {productName}
                  </p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-white/70 p-3">
                    <p className="text-gray-500">Nutri-Score</p>
                    <p className="font-semibold text-[#004743]">
                      {nutriScore || "Pending"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/70 p-3">
                    <p className="text-gray-500">Serving</p>
                    <p className="font-semibold text-[#004743]">
                      {servingSize || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/70 p-3">
                    <p className="text-gray-500">Calories</p>
                    <p className="font-semibold text-[#004743]">
                      {typeof calories === "number" ? `${calories} kcal` : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/70 p-3">
                    <p className="text-gray-500">Protein</p>
                    <p className="font-semibold text-[#004743]">
                      {typeof protein === "number" ? `${protein} g` : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-lg bg-white/70 p-3 text-sm text-gray-600">
                  <span className="font-medium text-[#004743]">Sugar: </span>
                  {typeof sugar === "number" ? `${sugar} g per 100g` : "N/A"}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Showing the product first while the personalized nutrition analysis continues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {streamError && (
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="py-4">
            <p className="text-sm uppercase tracking-wide text-red-700 font-medium">
              Scan issue
            </p>
            <p className="text-base text-red-800 font-semibold mt-1">
              {streamError}
            </p>
            <p className="text-sm text-red-700 mt-2">
              Double-check that the scanned code is a product barcode. If it’s a QR code or custom ID, the OpenFoodFacts lookup may not find it.
            </p>
          </CardContent>
        </Card>
      )}

      {/* <Card>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={isConnected ? "default" : "destructive"}
                        >
                            {isConnected ? "Connected" : "Disconnected"}
                        </Badge>
                        {isStreaming && (
                            <Badge variant="secondary">Streaming...</Badge>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Barcode{" "}
                                {initialBarcode && <span className="text-blue-600">(from scan)</span>}
                            </label>
                            <Input
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Enter product barcode"
                                disabled={isStreaming}
                                className={initialBarcode ? "border-blue-300 bg-blue-50" : ""}
                            />
                            Commented out for automatic mode - might need later
                            {initialBarcode && (
                                <p className="text-xs text-blue-600 mt-1">
                                    Barcode automatically loaded from scan
                                </p>
                            )}
                           
                        </div>

                        <Button
                            onClick={startAnalysis}
                            disabled={
                                !isConnected || isStreaming || !barcode.trim()
                            }
                            className="w-full"
                        >
                            {isStreaming ? "Analyzing..." : "Start Analysis"}
                        </Button>
                    </div>
                </CardContent>
            </Card> */}

      {/* Analysis Output */}
      {currentAnalysis && (
        <Card className="bg-[#f0ede4]">
          <CardContent>
            <div
              className="prose prose-sm w-full"
              dangerouslySetInnerHTML={{
                __html: currentAnalysis,
              }}
            >
              {/* <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                // Remove rehypePlugins={[rehypeRaw]} - not needed anymore
                                components={{
                                    h1: ({ children }) => (
                                        <h1 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => {
                                        const text = children?.toString() || "";
                                        if (text.includes("NUTRI-SCORE")) {
                                            return (
                                                <h2 className="text-xl font-semibold mb-3 text-center">
                                                    {children}
                                                </h2>
                                            );
                                        }
                                        return (
                                            <h2 className="text-xl font-semibold mb-3 text-gray-700">
                                                {children}
                                            </h2>
                                        );
                                    },
                                    h3: ({ children }) => (
                                        <h3 className="text-lg font-semibold mb-2 text-gray-700">
                                            {children}
                                        </h3>
                                    ),
                                    p: ({ children }) => (
                                        <p className="mb-4 text-gray-700 leading-relaxed">
                                            {children}
                                        </p>
                                    ),
                                    blockquote: ({ children }) => {
                                        const text = children?.toString() || "";
                                        if (
                                            text.includes("Critical") ||
                                            text.includes("Not Recommended")
                                        ) {
                                            return (
                                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
                                                    <div className="text-red-700 font-semibold">
                                                        {children}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        if (text.includes("Grade:")) {
                                            return (
                                                <div className="bg-white border-2 border-red-400 p-4 mb-4 rounded-lg text-center">
                                                    <div className="text-gray-800">
                                                        {children}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <blockquote className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-lg">
                                                <div className="text-blue-800">
                                                    {children}
                                                </div>
                                            </blockquote>
                                        );
                                    },
                                    ul: ({ children }) => (
                                        <ul className="space-y-2 mb-4">
                                            {children}
                                        </ul>
                                    ),
                                    li: ({ children }) => {
                                        const text = children?.toString() || "";
                                        if (text.includes("❌")) {
                                            return (
                                                <li className="flex items-start space-x-2 p-2 bg-red-50 rounded-md">
                                                    <span className="text-red-600 font-medium">
                                                        {children}
                                                    </span>
                                                </li>
                                            );
                                        }
                                        if (text.includes("✅")) {
                                            return (
                                                <li className="flex items-start space-x-2 p-2 bg-green-50 rounded-md">
                                                    <span className="text-green-700 font-medium">
                                                        {children}
                                                    </span>
                                                </li>
                                            );
                                        }
                                        return (
                                            <li className="mb-1 text-gray-700">
                                                {children}
                                            </li>
                                        );
                                    },
                                    table: ({ children }) => (
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4 shadow-sm">
                                            <table className="w-full">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    thead: ({ children }) => (
                                        <thead className="bg-gray-50">
                                            {children}
                                        </thead>
                                    ),
                                    th: ({ children }) => (
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">
                                            {children}
                                        </th>
                                    ),
                                    td: ({ children }) => {
                                        const text = children?.toString() || "";
                                        if (text.includes("🔴")) {
                                            return (
                                                <td className="px-4 py-3 border-b border-gray-100 text-red-600 font-semibold">
                                                    {children}
                                                </td>
                                            );
                                        }
                                        return (
                                            <td className="px-4 py-3 border-b border-gray-100 text-gray-700">
                                                {children}
                                            </td>
                                        );
                                    },
                                    strong: ({ children }) => {
                                        const text = children?.toString() || "";
                                        if (
                                            text.includes("E") ||
                                            text.includes("Critical") ||
                                            text.includes("Not Recommended")
                                        ) {
                                            return (
                                                <strong className="text-red-600 font-bold">
                                                    {children}
                                                </strong>
                                            );
                                        }
                                        if (text.includes("Grade:")) {
                                            return (
                                                <strong className="text-lg font-bold text-gray-800">
                                                    {children}
                                                </strong>
                                            );
                                        }
                                        return (
                                            <strong className="font-semibold text-gray-800">
                                                {children}
                                            </strong>
                                        );
                                    },
                                    hr: () => (
                                        <hr className="my-6 border-gray-200" />
                                    ),
                                }}
                            >
                                {currentAnalysis}
                            </ReactMarkdown> */}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
