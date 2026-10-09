/**
 * useVoiceInput — Web Speech API hook
 * =====================================
 * Provides a toggle to start/stop browser speech recognition.
 * Interim results are streamed into `interimText`; final results
 * are appended to `finalText` and passed to the `onResult` callback.
 *
 * Falls back gracefully when the API is not available (e.g., Firefox).
 */

import { useCallback, useEffect, useRef, useState } from "react";

// Extend Window to include vendor-prefixed SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

export interface UseVoiceInputOptions {
  /** Called with each finalized transcript chunk */
  onResult: (text: string) => void;
  /** Language hint — default "en-US" */
  lang?: string;
}

export interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  interimText: string;
  start: () => void;
  stop: () => void;
}

export function useVoiceInput({ onResult, lang = "en-US" }: UseVoiceInputOptions): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const SpeechRecognitionImpl =
    typeof window !== "undefined"
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined;

  const isSupported = !!SpeechRecognitionImpl;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimText("");
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionImpl) return;
    stop(); // stop any existing session first

    const rec = new SpeechRecognitionImpl();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          onResult(result[0].transcript);
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(interim);
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimText("");
      recognitionRef.current = null;
    };

    rec.onerror = (e) => {
      console.warn("[VoiceInput] SpeechRecognition error:", e.error);
      stop();
    };

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [SpeechRecognitionImpl, lang, onResult, stop]);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return { isListening, isSupported, interimText, start, stop };
}
