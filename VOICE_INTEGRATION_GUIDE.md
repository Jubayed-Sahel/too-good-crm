# 🎤 Voice Integration Guide - Complete Implementation

## 📋 Overview

This guide provides a **complete, production-ready solution** for adding voice capabilities to your CRM chatbot using **FREE browser APIs only**:

- ✅ **Web Speech API** (SpeechRecognition) for speech-to-text
- ✅ **SpeechSynthesis API** for text-to-speech
- ✅ **No external services or paid APIs**
- ✅ **Works in modern Chromium browsers**
- ✅ **Clean, reusable React hooks**
- ✅ **Fully integrated with existing Gemini chatbot**

---

## 🎯 What's Been Created

### 1. **Custom React Hooks** (Reusable)

#### `useSpeechToText.ts`
Location: `web-frontend/src/hooks/useSpeechToText.ts`

**Features:**
- ✅ Wraps Web Speech API (SpeechRecognition)
- ✅ Real-time transcript updates (interim + final)
- ✅ Multi-language support
- ✅ Error handling with user-friendly messages
- ✅ Browser compatibility detection
- ✅ Auto-send on completion

**Usage Example:**
```typescript
import { useSpeechToText } from '@/hooks/useSpeechToText';

const {
  isListening,
  transcript,
  finalTranscript,
  isSupported,
  error,
  startListening,
  stopListening,
  resetTranscript,
  setLanguage,
} = useSpeechToText({
  lang: 'en-US',
  interimResults: true,
  onTranscript: (text) => {
    console.log('Final transcript:', text);
  },
});
```

#### `useTextToSpeech.ts`
Location: `web-frontend/src/hooks/useTextToSpeech.ts`

**Features:**
- ✅ Wraps SpeechSynthesis API
- ✅ Voice selection by language
- ✅ Adjustable rate, pitch, volume
- ✅ Pause/resume/cancel controls
- ✅ Multi-language support
- ✅ Browser compatibility detection

**Usage Example:**
```typescript
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

const {
  isSpeaking,
  speak,
  cancel,
  pause,
  resume,
  voices,
  setLanguage,
  setRate,
} = useTextToSpeech({
  lang: 'en-US',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
});

// Speak text
speak('Hello, how can I help you?');
```

---

### 2. **Voice-Enabled Chat Components**

#### `VoiceGeminiChatWindow.tsx` (Full-Featured)
Location: `web-frontend/src/components/messages/VoiceGeminiChatWindow.tsx`

**Features:**
- ✅ Voice input with microphone button
- ✅ Real-time speech recognition display
- ✅ Auto-send when speech completes
- ✅ Auto-speak bot responses
- ✅ Multi-language selector (10+ languages)
- ✅ Toggle auto-speak on/off
- ✅ Manual speak button for each message
- ✅ Browser compatibility warnings
- ✅ Clean, modern UI with Chakra UI

#### `SimpleVoiceChat.tsx` (Minimal Example)
Location: `web-frontend/src/components/messages/SimpleVoiceChat.tsx`

**Features:**
- ✅ Minimal implementation (~100 lines)
- ✅ Shows core concepts clearly
- ✅ Easy to understand and customize
- ✅ Perfect for learning

---

## 🚀 How to Use

### Option 1: Replace Existing Chat Component

If you want to replace your current `GeminiChatWindow` with the voice-enabled version:

**File:** `web-frontend/src/pages/MessagesPage.tsx` (or wherever you use the chat)

```typescript
// Old import
// import { GeminiChatWindow } from '@/components/messages/GeminiChatWindow';

// New import
import { VoiceGeminiChatWindow } from '@/components/messages/VoiceGeminiChatWindow';

// In your component:
export const MessagesPage = () => {
  return (
    <div>
      {/* Old */}
      {/* <GeminiChatWindow /> */}
      
      {/* New - Voice Enabled */}
      <VoiceGeminiChatWindow 
        autoSpeak={true}
        defaultLanguage="en-US"
      />
    </div>
  );
};
```

---

### Option 2: Add Voice to Existing Component

If you want to add voice capabilities to your existing chat:

```typescript
import { useState, useEffect } from 'react';
import { useGemini } from '@/hooks/useGemini';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

export const YourChatComponent = () => {
  const { messages, sendMessage } = useGemini();
  const [input, setInput] = useState('');

  // 1. Add Speech-to-Text
  const {
    isListening,
    finalTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText({
    lang: 'en-US',
    onTranscript: (text) => {
      // Auto-send when speech completes
      sendMessage(text);
      setInput('');
    },
  });

  // 2. Add Text-to-Speech
  const { speak } = useTextToSpeech({
    lang: 'en-US',
  });

  // 3. Auto-speak bot responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && !lastMessage.isStreaming) {
      speak(lastMessage.content);
    }
  }, [messages, speak]);

  // 4. Update input when transcript changes
  useEffect(() => {
    if (finalTranscript) {
      setInput(finalTranscript);
    }
  }, [finalTranscript]);

  // 5. Add microphone button to your UI
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setInput('');
      startListening();
    }
  };

  return (
    <div>
      {/* Your existing chat UI */}
      
      {/* Add microphone button */}
      <button onClick={handleVoiceClick}>
        {isListening ? '⏹️ Stop' : '🎤 Speak'}
      </button>
      
      {/* Your existing input */}
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isListening ? 'Listening...' : 'Type or speak...'}
        disabled={isListening}
      />
    </div>
  );
};
```

---

## 🌍 Multi-Language Support

### Supported Languages

The components support 10+ languages out of the box:

```typescript
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'bn-BD', label: 'Bengali' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'zh-CN', label: 'Chinese' },
  { code: 'ar-SA', label: 'Arabic' },
];
```

### How to Change Language

```typescript
// In your component
const { setLanguage: setSpeechLanguage } = useSpeechToText();
const { setLanguage: setSpeakLanguage } = useTextToSpeech();

// Change to Bengali
setSpeechLanguage('bn-BD');
setSpeakLanguage('bn-BD');
```

---

## 🔧 Customization Options

### Voice Recognition Settings

```typescript
useSpeechToText({
  lang: 'en-US',              // Language
  interimResults: true,       // Show partial results while speaking
  continuous: false,          // Keep listening after recognition
  maxAlternatives: 1,         // Number of alternative transcripts
  onTranscript: (text) => {   // Callback when done
    console.log(text);
  },
  onError: (error) => {       // Error callback
    console.error(error);
  },
});
```

### Voice Output Settings

```typescript
useTextToSpeech({
  lang: 'en-US',              // Language
  rate: 1.0,                  // Speed (0.1 to 10)
  pitch: 1.0,                 // Pitch (0 to 2)
  volume: 1.0,                // Volume (0 to 1)
  voiceName: 'Google UK English Female',  // Specific voice
  onStart: () => {},          // When speech starts
  onEnd: () => {},            // When speech ends
  onError: (error) => {},     // Error callback
});
```

### Component Props

```typescript
<VoiceGeminiChatWindow 
  autoSpeak={true}            // Auto-speak bot responses
  defaultLanguage="en-US"     // Starting language
/>
```

---

## 🌐 Browser Compatibility

### Speech Recognition (Voice Input)

| Browser | Support | Notes |
|---------|---------|-------|
| ✅ Chrome | Full | Best support |
| ✅ Edge | Full | Chromium-based |
| ✅ Safari | Full | iOS 14.5+ |
| ❌ Firefox | None | Not supported |
| ❌ Opera | Partial | May work |

### SpeechSynthesis (Voice Output)

| Browser | Support | Notes |
|---------|---------|-------|
| ✅ Chrome | Full | Best support |
| ✅ Edge | Full | Chromium-based |
| ✅ Safari | Full | All versions |
| ✅ Firefox | Full | Good support |
| ✅ Opera | Full | Good support |

**Recommendation:** Use Chrome, Edge, or Safari for best experience.

---

## ⚠️ Important Notes

### 1. **Microphone Permissions**

Users will see a browser permission prompt on first use:
```
"example.com wants to use your microphone"
[Block] [Allow]
```

**Best Practice:**
- Show clear instructions before asking for permission
- Explain why you need microphone access
- Handle permission denial gracefully

### 2. **HTTPS Required**

Web Speech API requires HTTPS (except for localhost):
- ✅ `https://yourapp.com` - Works
- ✅ `http://localhost:3000` - Works
- ❌ `http://yourapp.com` - Doesn't work

### 3. **Network Dependency**

Speech Recognition uses Google's servers:
- Requires active internet connection
- May have latency issues on slow connections
- Consider fallback to text input

### 4. **Language Support**

Not all languages work equally well:
- English (US/UK): Excellent
- Spanish, French, German: Very Good
- Bengali, Hindi: Good
- Arabic, Japanese: Good
- Less common languages: Varies

---

## 🎯 Best Practices

### 1. **User Experience**

```typescript
// ✅ DO: Show clear visual feedback
{isListening && (
  <div className="recording-indicator">
    🎤 Listening... Speak now
  </div>
)}

// ✅ DO: Provide fallback
{!isSupported && (
  <div className="warning">
    Voice input not supported. Please type your message.
  </div>
)}

// ❌ DON'T: Start listening without user action
// Always require explicit button click
```

### 2. **Performance**

```typescript
// ✅ DO: Reset transcript after use
const handleSend = async (text: string) => {
  await sendMessage(text);
  resetTranscript();
  setInput('');
};

// ✅ DO: Cancel speech when switching messages
const handleNewMessage = () => {
  cancelSpeech();  // Stop current speech
  speak(newMessage);
};

// ✅ DO: Check support before rendering UI
if (!isSupported) {
  return <TextOnlyChat />;
}
```

### 3. **Error Handling**

```typescript
// ✅ DO: Handle common errors gracefully
useSpeechToText({
  onError: (error) => {
    if (error.includes('not-allowed')) {
      showNotification('Please enable microphone access');
    } else if (error.includes('no-speech')) {
      showNotification('No speech detected. Please try again.');
    } else {
      showNotification('Voice input error. Please try typing.');
    }
  },
});
```

### 4. **Accessibility**

```typescript
// ✅ DO: Add proper ARIA labels
<button
  onClick={handleVoiceClick}
  aria-label={isListening ? 'Stop recording' : 'Start voice input'}
  aria-pressed={isListening}
>
  {isListening ? '⏹️' : '🎤'}
</button>

// ✅ DO: Provide keyboard shortcuts
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'm') {
    handleVoiceClick();
  }
};
```

---

## 🐛 Troubleshooting

### Problem: "Microphone not working"

**Solutions:**
1. Check browser permissions (Settings → Privacy → Microphone)
2. Ensure HTTPS is enabled (or using localhost)
3. Try different browser (Chrome recommended)
4. Check if microphone works in other apps
5. Restart browser

### Problem: "Speech not recognized"

**Solutions:**
1. Speak clearly and at normal pace
2. Reduce background noise
3. Try different language setting
4. Check internet connection
5. Move closer to microphone

### Problem: "Voice output not working"

**Solutions:**
1. Check system volume
2. Verify speakers/headphones connected
3. Try `speak('test')` manually
4. Check browser console for errors
5. Try different browser

### Problem: "Component not rendering"

**Solutions:**
1. Verify all imports are correct
2. Check if hooks are used inside functional components
3. Ensure Chakra UI is properly configured
4. Check browser console for errors
5. Clear build cache: `npm run build`

---

## 📊 Code Architecture

### Data Flow

```
User clicks microphone button
    ↓
startListening() called
    ↓
Web Speech API starts listening
    ↓
User speaks: "Show my customers"
    ↓
Interim results: "Show..." → "Show my..." → "Show my customers"
    ↓
Final transcript: "Show my customers"
    ↓
onTranscript callback fired
    ↓
sendMessage() called
    ↓
Message sent to Django API
    ↓
Gemini processes request
    ↓
Response streamed back
    ↓
Message added to UI
    ↓
Auto-speak triggered (if enabled)
    ↓
SpeechSynthesis reads response aloud
```

### Component Structure

```
VoiceGeminiChatWindow
├── useGemini() - Chat logic
├── useSpeechToText() - Voice input
├── useTextToSpeech() - Voice output
├── Header - Status, language selector, settings
├── Messages Area - Chat history
├── Input Area - Mic button, text input, send button
└── Status Bar - Recording indicator, typing indicator
```

---

## 🔄 Integration with Existing Chatbot

Your existing setup:
```
React Component
    ↓
useGemini hook
    ↓
geminiService.streamChat()
    ↓
POST /api/gemini/chat/
    ↓
Django GeminiViewSet
    ↓
GeminiService.chat_stream()
    ↓
Gemini AI + MCP Tools
    ↓
Response streamed back
```

**What changes?**
```diff
React Component
+   ↓
+ useSpeechToText() - Converts voice to text
    ↓
useGemini hook (UNCHANGED)
    ↓
geminiService.streamChat() (UNCHANGED)
    ↓
POST /api/gemini/chat/ (UNCHANGED)
    ↓
Django GeminiViewSet (UNCHANGED)
    ↓
GeminiService.chat_stream() (UNCHANGED)
    ↓
Gemini AI + MCP Tools (UNCHANGED)
    ↓
Response streamed back (UNCHANGED)
+   ↓
+ useTextToSpeech() - Converts response to voice
```

**✅ No backend changes required!**

---

## 📝 Testing Checklist

### Functional Tests

- [ ] Microphone button appears
- [ ] Permission prompt shown on first use
- [ ] Recording indicator shows when listening
- [ ] Interim transcript displays while speaking
- [ ] Message sent automatically after speech
- [ ] Bot response appears in chat
- [ ] Bot response spoken aloud (if auto-speak enabled)
- [ ] Stop button works correctly
- [ ] Language selector changes language
- [ ] Auto-speak toggle works
- [ ] Manual speak button works on each message
- [ ] Text input still works normally
- [ ] Keyboard shortcuts work (Ctrl+Enter)

### Error Handling Tests

- [ ] Shows warning when browser not supported
- [ ] Handles permission denial gracefully
- [ ] Shows error for no speech detected
- [ ] Handles network errors
- [ ] Handles API errors from backend
- [ ] Recovers from interrupted speech

### UI/UX Tests

- [ ] Components render correctly
- [ ] Animations smooth
- [ ] No layout shifts
- [ ] Mobile responsive
- [ ] Accessible (keyboard navigation)
- [ ] Screen reader friendly
- [ ] Loading states clear
- [ ] Error messages user-friendly

---

## 🚀 Deployment Checklist

- [ ] All voice components created
- [ ] Hooks implemented and tested
- [ ] HTTPS enabled on production
- [ ] Browser compatibility warnings in place
- [ ] Error handling comprehensive
- [ ] User instructions clear
- [ ] Permission requests explained
- [ ] Fallback to text input available
- [ ] Performance optimized (no memory leaks)
- [ ] Console logs removed (or behind debug flag)
- [ ] TypeScript types correct
- [ ] ESLint warnings resolved
- [ ] Build succeeds without errors
- [ ] Tested in Chrome, Edge, Safari
- [ ] Documentation updated

---

## 📚 Additional Resources

### Web Speech API Documentation
- [MDN: Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [MDN: SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [MDN: SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)

### Browser Support
- [Can I Use: Web Speech API](https://caniuse.com/speech-recognition)
- [Can I Use: Speech Synthesis](https://caniuse.com/speech-synthesis)

### Examples
- See `SimpleVoiceChat.tsx` for minimal example
- See `VoiceGeminiChatWindow.tsx` for full-featured example
- Check `useSpeechToText.ts` for hook implementation
- Check `useTextToSpeech.ts` for TTS implementation

---

## ✅ Summary

You now have:

1. ✅ **Two reusable React hooks** (`useSpeechToText`, `useTextToSpeech`)
2. ✅ **Full-featured voice chat component** (`VoiceGeminiChatWindow`)
3. ✅ **Simple example component** (`SimpleVoiceChat`)
4. ✅ **Complete documentation** (this file)
5. ✅ **No external dependencies** (only free browser APIs)
6. ✅ **No backend changes required**
7. ✅ **Production-ready code** with error handling
8. ✅ **Multi-language support** (10+ languages)
9. ✅ **Browser compatibility warnings**
10. ✅ **Clean, maintainable code**

**Next Steps:**
1. Choose your integration method (replace component or add to existing)
2. Test in Chrome/Edge/Safari
3. Customize UI to match your design
4. Add keyboard shortcuts if needed
5. Deploy and enjoy voice-enabled CRM chatbot! 🎉

---

**Need Help?**
- Check the troubleshooting section
- Review the simple example first
- Test each hook independently
- Verify browser compatibility
- Check browser console for errors

**Happy coding! 🚀**
