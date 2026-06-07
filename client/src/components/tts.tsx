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

import styles from './tts.module.css';

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
            <div className={styles.fabContainer}>
                <button
                    onClick={handleFloatingButtonClick}
                    className={styles.floatingButton}
                    title="Listen to nutrition analysis"
                >
                    {isGenerating ? (
                        <Loader2 className={styles.spinIconLg} />
                    ) : hasAudio ? (
                        <Play className={styles.iconLarge} />
                    ) : (
                        <Volume2 className={styles.iconLarge} />
                    )}
                </button>
            </div>

            {/* TTS Popup */}
            {isVisible && (
                <div className={styles.popupContainer}>
                    <div className={styles.ttsPopup}>
                        {/* Header */}
                        <div className={styles.popupHeader}>
                            <div className={styles.headerLeft}>
                                <div className={styles.headerIconBg}>
                                    <CheckCircle className={styles.headerIcon} />
                                </div>
                                <span className={styles.headerTitle}>
                                    AI Assistant
                                </span>
                            </div>
                            <button
                                onClick={handleClose}
                                className={styles.closeButton}
                            >
                                <X className={styles.closeIcon} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className={styles.popupContent}>
                            <p className={styles.contentText}>
                                {text.length > 100
                                    ? `${text.substring(0, 100)}...`
                                    : text}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className={styles.popupControls}>
                            {isGenerating ? (
                                <div className={styles.generatingText}>
                                    <Loader2 className={styles.spinIcon} />
                                    Generating audio...
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handlePlayPause}
                                        disabled={!hasAudio}
                                        className={`${styles.controlButton} ${
                                            hasAudio
                                                ? styles.playPauseButtonActive
                                                : styles.playPauseButtonInactive
                                        }`}
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Pause className={styles.iconSmall} />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className={styles.iconSmall} />
                                                Play
                                            </>
                                        )}
                                    </button>

                                    {hasAudio && (
                                        <button
                                            onClick={handleReplay}
                                            className={`${styles.controlButton} ${styles.actionButton}`}
                                        >
                                            <RotateCcw className={styles.iconSmall} />
                                            Replay
                                        </button>
                                    )}

                                    {!hasAudio && (
                                        <button
                                            onClick={handleTTS}
                                            className={`${styles.controlButton} ${styles.actionButton}`}
                                        >
                                            <Volume2 className={styles.iconSmall} />
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
