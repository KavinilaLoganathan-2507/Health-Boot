import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  CheckCircle,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  X,
} from 'lucide-react';

// Audio cache to store generated audio
const audioCache = new Map<string, HTMLAudioElement>();

export default function TTS({ text }: { text: string }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
        null
    );
    const [hasAudio, setHasAudio] = useState(false);
    const [showFloatingButton, setShowFloatingButton] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Check if audio exists for current text
    useEffect(() => {
        if (text && audioCache.has(text)) {
            setHasAudio(true);
            setAudioElement(audioCache.get(text) || null);
            setShowFloatingButton(true);
        } else if (text && text.trim()) {
            setHasAudio(false);
            setAudioElement(null);
            setShowFloatingButton(true);
        } else {
            setShowFloatingButton(false);
        }
    }, [text]);

    const handleTTS = async () => {
        if (!text || isGenerating || isPlaying) return;

        // Check cache first
        if (audioCache.has(text)) {
            const cachedAudio = audioCache.get(text)!;
            setAudioElement(cachedAudio);
            setHasAudio(true);
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch("/api/tts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: text }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate audio");
            }

            const data = await response.json();
            const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);

            // Cache the audio
            audioCache.set(text, audio);

            audio.onended = () => {
                setIsPlaying(false);
            };

            audio.onplay = () => {
                setIsPlaying(true);
            };

            audio.onpause = () => {
                setIsPlaying(false);
            };

            setAudioElement(audio);
            setHasAudio(true);
        } catch (error) {
            console.error("TTS generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePlayPause = () => {
        if (!audioElement) return;

        if (isPlaying) {
            audioElement.pause();
        } else {
            audioElement.play();
        }
    };

    const handleReplay = () => {
        if (audioElement) {
            audioElement.currentTime = 0;
            audioElement.play();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        if (isPlaying) {
            audioElement?.pause();
        }
    };

    const handleFloatingButtonClick = () => {
        if (!hasAudio && !isGenerating) {
            handleTTS();
        }
        setIsVisible(true);
    };

    if (!showFloatingButton) return null;

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={handleFloatingButtonClick}
                    className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Listen to nutrition analysis"
                >
                    {isGenerating ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : hasAudio ? (
                        <Play className="w-6 h-6" />
                    ) : (
                        <Volume2 className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* TTS Popup */}
            {isVisible && (
                <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-gray-800">
                                    AI Assistant
                                </span>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {text.length > 100
                                    ? `${text.substring(0, 100)}...`
                                    : text}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                            {isGenerating ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating audio...
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handlePlayPause}
                                        disabled={!hasAudio}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            hasAudio
                                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Pause className="w-4 h-4" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4" />
                                                Play
                                            </>
                                        )}
                                    </button>

                                    {hasAudio && (
                                        <button
                                            onClick={handleReplay}
                                            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Replay
                                        </button>
                                    )}

                                    {!hasAudio && (
                                        <button
                                            onClick={handleTTS}
                                            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                            Generate
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden audio element for ref */}
            <audio ref={audioRef} style={{ display: "none" }} />
        </>
    );
}
