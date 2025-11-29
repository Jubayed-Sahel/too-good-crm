/**
 * EXAMPLE: How to Add Voice to Your Existing GeminiChatWindow
 * 
 * This file shows the MINIMAL changes needed to add voice capabilities
 * to your existing chat component.
 * 
 * BEFORE: Text-only chat
 * AFTER: Text + Voice chat
 */

// ===================================================================
// STEP 1: Add the hook imports at the top
// ===================================================================

// Add these two lines:
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

// ===================================================================
// STEP 2: Inside your component, add the hooks
// ===================================================================

export const GeminiChatWindow = () => {
  const { messages, sendMessage, isLoading } = useGemini();
  const [input, setInput] = useState('');

  // ADD THIS: Voice input hook
  const {
    isListening,
    transcript,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText({
    lang: 'en-US',
    onTranscript: (text) => {
      // Auto-send when done speaking
      if (text.trim()) {
        sendMessage(text);
        setInput('');
      }
    },
  });

  // ADD THIS: Voice output hook
  const { speak, isSpeaking } = useTextToSpeech({
    lang: 'en-US',
  });

  // ADD THIS: Auto-speak bot responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && !lastMessage.isStreaming) {
      speak(lastMessage.content);
    }
  }, [messages, speak]);

  // ADD THIS: Update input when speaking
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // ADD THIS: Voice button handler
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setInput('');
      startListening();
    }
  };

  // ===================================================================
  // STEP 3: Add microphone button to your UI
  // ===================================================================

  return (
    <Box>
      {/* ... your existing UI ... */}

      {/* Recording indicator - ADD THIS */}
      {isListening && (
        <Box p={2} bg="red.50" borderRadius="md" mb={2}>
          <HStack>
            <Text fontSize="sm" color="red.600" fontWeight="medium">
              🎤 Listening... Speak now
            </Text>
          </HStack>
        </Box>
      )}

      {/* Input area - MODIFY THIS */}
      <HStack gap={3}>
        {/* ADD THIS: Microphone button */}
        {voiceSupported && (
          <IconButton
            size="lg"
            colorScheme={isListening ? 'red' : 'purple'}
            icon={isListening ? <FiMicOff /> : <FiMic />}
            onClick={handleVoiceClick}
            disabled={isLoading}
            aria-label="Voice input"
          />
        )}

        {/* Your existing textarea - ADD disabled prop */}
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Type or speak...'}
          disabled={isLoading || isListening}  // ADD THIS
        />

        {/* Your existing send button */}
        <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
          Send
        </Button>
      </HStack>
    </Box>
  );
};

// ===================================================================
// THAT'S IT! Your chat now has:
// - 🎤 Voice input with microphone button
// - 🔊 Auto-speak bot responses
// - 👁️ Visual feedback when listening
// - ✅ Fallback to text if voice not supported
// ===================================================================


// ===================================================================
// OPTIONAL ENHANCEMENTS
// ===================================================================

// 1. Add language selector
const [language, setLanguage] = useState('en-US');

// In hooks, use dynamic language:
useSpeechToText({ lang: language });
useTextToSpeech({ lang: language });

// Add selector:
<Select value={language} onChange={(e) => setLanguage(e.target.value)}>
  <option value="en-US">🇺🇸 English</option>
  <option value="bn-BD">🇧🇩 Bengali</option>
  <option value="es-ES">🇪🇸 Spanish</option>
</Select>


// 2. Add toggle for auto-speak
const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);

useEffect(() => {
  if (autoSpeakEnabled) {  // Only speak if enabled
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && !lastMessage.isStreaming) {
      speak(lastMessage.content);
    }
  }
}, [messages, speak, autoSpeakEnabled]);

// Add toggle button:
<IconButton
  icon={autoSpeakEnabled ? <FiVolume2 /> : <FiVolumeX />}
  onClick={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
/>


// 3. Add manual speak button for each message
{messages.map((msg) => (
  <Box key={msg.id}>
    <Text>{msg.content}</Text>
    {msg.role === 'assistant' && (
      <IconButton
        size="xs"
        icon={<FiVolume2 />}
        onClick={() => speak(msg.content)}
        aria-label="Speak message"
      />
    )}
  </Box>
))}


// 4. Show browser compatibility warning
{!voiceSupported && (
  <Alert status="warning" mb={4}>
    <AlertIcon />
    Voice input not supported. Please use Chrome, Edge, or Safari.
  </Alert>
)}


// 5. Add keyboard shortcut for voice
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + M to toggle microphone
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
      e.preventDefault();
      handleVoiceClick();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleVoiceClick]);
