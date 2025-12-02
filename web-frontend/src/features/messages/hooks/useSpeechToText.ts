/**
 * Speech-to-Text Hook using Web Speech API
 * Provides voice recognition functionality for modern browsers
 * 
 * Browser Support: Chrome, Edge, Safari (iOS 14.5+)
 * Note: Firefox does not support Web Speech API
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export interface UseSpeechToTextOptions {
  /**
   * Language code (e.g., 'en-US', 'bn-BD')
   * @default 'en-US'
   */
  lang?: string;
  
  /**
   * Return interim results (partial transcripts)
   * @default true
   */
  interimResults?: boolean;
  
  /**
   * Continue listening after recognition
   * @default false
   */
  continuous?: boolean;
  
  /**
   * Maximum number of alternative transcripts
   * @default 1
   */
  maxAlternatives?: number;
  
  /**
   * Callback when final transcript is ready
   */
  onTranscript?: (transcript: string) => void;
  
  /**
   * Callback on error
   */
  onError?: (error: string) => void;
}

export interface UseSpeechToTextReturn {
  /** Whether speech recognition is currently active */
  isListening: boolean;
  
  /** Current transcript (may be interim) */
  transcript: string;
  
  /** Final transcript (confirmed) */
  finalTranscript: string;
  
  /** Interim transcript (partial, may change) */
  interimTranscript: string;
  
  /** Whether speech recognition is supported */
  isSupported: boolean;
  
  /** Error message if any */
  error: string | null;
  
  /** Start listening */
  startListening: () => void;
  
  /** Stop listening */
  stopListening: () => void;
  
  /** Reset transcript */
  resetTranscript: () => void;
  
  /** Change language */
  setLanguage: (lang: string) => void;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
  const {
    lang = 'en-US',
    interimResults = true,
    continuous = false,
    maxAlternatives = 1,
    onTranscript,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState(lang);
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Check if Web Speech API is supported
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = maxAlternatives;

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          final += transcriptText + ' ';
        } else {
          interim += transcriptText;
        }
      }

      // Update state
      if (interim) {
        setInterimTranscript(interim);
        setTranscript(finalTranscript + interim);
      }

      if (final) {
        const newFinal = (finalTranscript + final).trim();
        setFinalTranscript(newFinal);
        setTranscript(newFinal);
        setInterimTranscript('');
        
        // Call callback if provided
        if (onTranscript) {
          onTranscript(newFinal);
        }
      }
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not found or not working. Please check your device settings.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition aborted.';
          break;
        case 'language-not-supported':
          errorMessage = `Language "${language}" is not supported. Please try "en-US".`;
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      setError(errorMessage);
      setIsListening(false);
      
      if (onError) {
        onError(errorMessage);
      }

      console.error('Speech recognition error:', event.error, event.message);
    };

    // Handle end
    recognition.onend = () => {
      setIsListening(false);
      
      // Auto-restart if continuous mode
      if (continuous && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.log('Could not restart recognition:', e);
        }
      }
    };

    // Handle start
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [isSupported, language, continuous, interimResults, maxAlternatives]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not initialized');
      return;
    }

    if (isListening) {
      console.log('Already listening');
      return;
    }

    try {
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      const errorMessage = 'Failed to start speech recognition. Please try again.';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      console.error('Error starting recognition:', err);
    }
  }, [isListening, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    finalTranscript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
  };
}
