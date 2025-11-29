/**
 * Text-to-Speech Hook using Web Speech Synthesis API
 * Provides voice output functionality for all modern browsers
 * 
 * Browser Support: Chrome, Edge, Safari, Firefox (all support SpeechSynthesis)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseTextToSpeechOptions {
  /**
   * Language code (e.g., 'en-US', 'bn-BD')
   * @default 'en-US'
   */
  lang?: string;
  
  /**
   * Speech rate (0.1 to 10)
   * @default 1
   */
  rate?: number;
  
  /**
   * Speech pitch (0 to 2)
   * @default 1
   */
  pitch?: number;
  
  /**
   * Speech volume (0 to 1)
   * @default 1
   */
  volume?: number;
  
  /**
   * Voice name (optional, will auto-select if not provided)
   */
  voiceName?: string;
  
  /**
   * Callback when speech starts
   */
  onStart?: () => void;
  
  /**
   * Callback when speech ends
   */
  onEnd?: () => void;
  
  /**
   * Callback on error
   */
  onError?: (error: string) => void;
}

export interface UseTextToSpeechReturn {
  /** Whether speech is currently playing */
  isSpeaking: boolean;
  
  /** Whether text-to-speech is supported */
  isSupported: boolean;
  
  /** Available voices */
  voices: SpeechSynthesisVoice[];
  
  /** Currently selected voice */
  selectedVoice: SpeechSynthesisVoice | null;
  
  /** Error message if any */
  error: string | null;
  
  /** Speak the given text */
  speak: (text: string) => void;
  
  /** Cancel current speech */
  cancel: () => void;
  
  /** Pause current speech */
  pause: () => void;
  
  /** Resume paused speech */
  resume: () => void;
  
  /** Set voice by name */
  setVoice: (voiceName: string) => void;
  
  /** Set language */
  setLanguage: (lang: string) => void;
  
  /** Set rate */
  setRate: (rate: number) => void;
  
  /** Set pitch */
  setPitch: (pitch: number) => void;
  
  /** Set volume */
  setVolume: (volume: number) => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const {
    lang = 'en-US',
    rate = 1,
    pitch = 1,
    volume = 1,
    voiceName,
    onStart,
    onEnd,
    onError,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [language, setLanguage] = useState(lang);
  const [speechRate, setSpeechRate] = useState(rate);
  const [speechPitch, setSpeechPitch] = useState(pitch);
  const [speechVolume, setSpeechVolume] = useState(volume);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if Web Speech Synthesis API is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Select voice based on language or voice name
      if (voiceName) {
        const voice = availableVoices.find(v => v.name === voiceName);
        if (voice) {
          setSelectedVoice(voice);
        }
      } else {
        // Auto-select voice for language
        const voice = availableVoices.find(v => v.lang === language) || 
                      availableVoices.find(v => v.lang.startsWith(language.split('-')[0])) ||
                      availableVoices[0];
        if (voice) {
          setSelectedVoice(voice);
        }
      }
    };

    // Load voices immediately
    loadVoices();

    // Some browsers load voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, language, voiceName]);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!isSupported) {
      const errorMessage = 'Text-to-speech is not supported in this browser.';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      return;
    }

    if (!text.trim()) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set properties
      utterance.lang = language;
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = speechVolume;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setError(null);
        if (onStart) {
          onStart();
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        if (onEnd) {
          onEnd();
        }
      };

      utterance.onerror = (event) => {
        const errorMessage = `Speech synthesis error: ${event.error}`;
        setError(errorMessage);
        setIsSpeaking(false);
        utteranceRef.current = null;
        
        if (onError) {
          onError(errorMessage);
        }
        
        console.error('Speech synthesis error:', event);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      
    } catch (err) {
      const errorMessage = 'Failed to start text-to-speech. Please try again.';
      setError(errorMessage);
      setIsSpeaking(false);
      
      if (onError) {
        onError(errorMessage);
      }
      
      console.error('Error in text-to-speech:', err);
    }
  }, [isSupported, language, speechRate, speechPitch, speechVolume, selectedVoice, onStart, onEnd, onError]);

  // Cancel speech
  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  // Pause speech
  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  // Resume speech
  const resume = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isSpeaking]);

  // Set voice
  const setVoice = useCallback((voiceName: string) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [voices]);

  // Setters for speech parameters
  const setRate = useCallback((newRate: number) => {
    setSpeechRate(Math.max(0.1, Math.min(10, newRate)));
  }, []);

  const setPitch = useCallback((newPitch: number) => {
    setSpeechPitch(Math.max(0, Math.min(2, newPitch)));
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setSpeechVolume(Math.max(0, Math.min(1, newVolume)));
  }, []);

  return {
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    error,
    speak,
    cancel,
    pause,
    resume,
    setVoice,
    setLanguage,
    setRate,
    setPitch,
    setVolume,
  };
}
