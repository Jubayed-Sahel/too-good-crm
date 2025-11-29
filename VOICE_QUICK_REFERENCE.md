# 🎤 Voice Integration Quick Reference

## 📦 Files Created

```
web-frontend/src/
├── hooks/
│   ├── useSpeechToText.ts          ✅ Voice input hook
│   └── useTextToSpeech.ts          ✅ Voice output hook
└── components/messages/
    ├── VoiceGeminiChatWindow.tsx   ✅ Full-featured voice chat
    └── SimpleVoiceChat.tsx         ✅ Minimal example

Documentation:
├── VOICE_INTEGRATION_GUIDE.md      ✅ Complete guide
├── VOICE_BEST_PRACTICES.md         ✅ Performance & best practices
└── VOICE_INTEGRATION_EXAMPLE.tsx   ✅ Step-by-step example
```

---

## ⚡ Quick Start (3 Minutes)

### Method 1: Use Pre-Built Component

```typescript
// In your MessagesPage or wherever you want the chat
import { VoiceGeminiChatWindow } from '@/components/messages/VoiceGeminiChatWindow';

export const MessagesPage = () => {
  return <VoiceGeminiChatWindow autoSpeak={true} defaultLanguage="en-US" />;
};
```

**Done!** You now have full voice integration.

---

### Method 2: Add to Existing Component

```typescript
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

// 1. Add hooks
const { isListening, startListening, stopListening } = useSpeechToText({
  onTranscript: (text) => sendMessage(text),
});

const { speak } = useTextToSpeech();

// 2. Auto-speak responses
useEffect(() => {
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.role === 'assistant' && !lastMsg.isStreaming) {
    speak(lastMsg.content);
  }
}, [messages, speak]);

// 3. Add mic button
<button onClick={() => isListening ? stopListening() : startListening()}>
  {isListening ? '⏹️' : '🎤'}
</button>
```

**Done!** Voice added to existing component.

---

## 🎯 Common Use Cases

### 1. Voice Button Only
```typescript
const { isListening, startListening, stopListening } = useSpeechToText({
  onTranscript: (text) => handleMessage(text),
});

return (
  <button onClick={() => isListening ? stopListening() : startListening()}>
    🎤 {isListening ? 'Stop' : 'Speak'}
  </button>
);
```

### 2. Auto-Speak Responses
```typescript
const { speak } = useTextToSpeech({ lang: 'en-US' });

useEffect(() => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === 'assistant' && !lastMessage.isStreaming) {
    speak(lastMessage.content);
  }
}, [messages, speak]);
```

### 3. Multi-Language Support
```typescript
const [lang, setLang] = useState('en-US');
const { setLanguage: setSpeechLang } = useSpeechToText({ lang });
const { setLanguage: setSpeakLang } = useTextToSpeech({ lang });

const changeLang = (newLang: string) => {
  setLang(newLang);
  setSpeechLang(newLang);
  setSpeakLang(newLang);
};
```

### 4. Manual Speak Button
```typescript
const { speak, isSpeaking, cancel } = useTextToSpeech();

return messages.map(msg => (
  <div key={msg.id}>
    <p>{msg.content}</p>
    {msg.role === 'assistant' && (
      <button onClick={() => speak(msg.content)}>
        🔊 Speak
      </button>
    )}
  </div>
));
```

---

## 🔧 Hook API Reference

### `useSpeechToText`

```typescript
const {
  isListening,        // boolean - Is currently recording
  transcript,         // string - Current transcript (interim + final)
  finalTranscript,    // string - Only final transcript
  interimTranscript,  // string - Only interim (partial) transcript
  isSupported,        // boolean - Is API supported
  error,              // string | null - Error message
  startListening,     // () => void - Start recording
  stopListening,      // () => void - Stop recording
  resetTranscript,    // () => void - Clear transcript
  setLanguage,        // (lang: string) => void - Change language
} = useSpeechToText({
  lang: 'en-US',                    // Language code
  interimResults: true,             // Show interim results
  continuous: false,                // Keep listening
  onTranscript: (text) => {},       // Callback when done
  onError: (error) => {},           // Error callback
});
```

### `useTextToSpeech`

```typescript
const {
  isSpeaking,         // boolean - Is currently speaking
  isSupported,        // boolean - Is API supported
  voices,             // SpeechSynthesisVoice[] - Available voices
  selectedVoice,      // SpeechSynthesisVoice | null - Current voice
  error,              // string | null - Error message
  speak,              // (text: string) => void - Speak text
  cancel,             // () => void - Stop speaking
  pause,              // () => void - Pause speech
  resume,             // () => void - Resume speech
  setVoice,           // (name: string) => void - Select voice
  setLanguage,        // (lang: string) => void - Change language
  setRate,            // (rate: number) => void - Speed (0.1-10)
  setPitch,           // (pitch: number) => void - Pitch (0-2)
  setVolume,          // (volume: number) => void - Volume (0-1)
} = useTextToSpeech({
  lang: 'en-US',                    // Language code
  rate: 1.0,                        // Speed
  pitch: 1.0,                       // Pitch
  volume: 1.0,                      // Volume
  voiceName: 'Google US English',  // Specific voice
  onStart: () => {},                // When starts
  onEnd: () => {},                  // When ends
  onError: (error) => {},           // Error callback
});
```

---

## 🌍 Language Codes

```
en-US  🇺🇸  English (United States)
en-GB  🇬🇧  English (United Kingdom)
bn-BD  🇧🇩  Bengali (Bangladesh)
hi-IN  🇮🇳  Hindi (India)
es-ES  🇪🇸  Spanish (Spain)
fr-FR  🇫🇷  French (France)
de-DE  🇩🇪  German (Germany)
ja-JP  🇯🇵  Japanese (Japan)
zh-CN  🇨🇳  Chinese (Simplified)
ar-SA  🇸🇦  Arabic (Saudi Arabia)
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Mic not working | Check browser permissions, use HTTPS |
| No speech recognized | Speak clearly, reduce background noise |
| Voice not speaking | Check volume, try different browser |
| Component not rendering | Verify imports, check Chakra UI setup |
| Browser not supported | Use Chrome, Edge, or Safari |

---

## 🎨 UI States

### Voice Input States
```typescript
// Not listening
<Button>🎤 Speak</Button>

// Listening
<Button colorScheme="red">⏹️ Stop</Button>
<Text>🎤 Listening... Speak now</Text>

// Processing
<Spinner /> <Text>Processing...</Text>

// Error
<Alert status="error">{error}</Alert>
```

### Voice Output States
```typescript
// Not speaking
<Button>🔊 Speak</Button>

// Speaking
<Button>🔇 Stop</Button>
<Badge>🔊 Speaking</Badge>

// Auto-speak enabled
<IconButton icon={<FiVolume2 />} colorScheme="purple" />

// Auto-speak disabled
<IconButton icon={<FiVolumeX />} variant="outline" />
```

---

## ⚙️ Configuration Examples

### Conservative (Best Performance)
```typescript
useSpeechToText({
  lang: 'en-US',
  interimResults: false,    // No interim results
  continuous: false,
});

useTextToSpeech({
  rate: 1.2,                // Faster speech
  volume: 0.8,
});
```

### Optimal (Balanced)
```typescript
useSpeechToText({
  lang: 'en-US',
  interimResults: true,     // Show interim
  continuous: false,
});

useTextToSpeech({
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
});
```

### Feature-Rich (All Features)
```typescript
useSpeechToText({
  lang: 'en-US',
  interimResults: true,
  continuous: true,         // Keep listening
  maxAlternatives: 3,       // Multiple alternatives
  onTranscript: handleTranscript,
  onError: handleError,
});

useTextToSpeech({
  rate: 0.9,                // Slightly slower
  pitch: 1.1,               // Slightly higher
  volume: 1.0,
  voiceName: 'Google UK English Female',
  onStart: () => console.log('Started'),
  onEnd: () => console.log('Ended'),
});
```

---

## 📊 Feature Support Matrix

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Voice Input | ✅ | ✅ | ✅ | ❌ |
| Voice Output | ✅ | ✅ | ✅ | ✅ |
| Interim Results | ✅ | ✅ | ⚠️ | ❌ |
| Continuous Mode | ✅ | ✅ | ⚠️ | ❌ |
| Multi-Language | ✅ | ✅ | ✅ | ❌ |

✅ Full Support | ⚠️ Partial Support | ❌ Not Supported

---

## 🚀 Next Steps

1. ✅ Read `VOICE_INTEGRATION_GUIDE.md` for complete documentation
2. ✅ Try `SimpleVoiceChat.tsx` example first
3. ✅ Use `VoiceGeminiChatWindow.tsx` for production
4. ✅ Review `VOICE_BEST_PRACTICES.md` for optimization
5. ✅ Check `VOICE_INTEGRATION_EXAMPLE.tsx` for integration steps

---

## 💡 Pro Tips

1. **Always provide text fallback** - Not all browsers support voice
2. **Show clear visual feedback** - Users need to know what's happening
3. **Handle permissions gracefully** - Explain why you need mic access
4. **Test on real devices** - Desktop vs mobile behave differently
5. **Use HTTPS in production** - Required for voice features
6. **Reduce background noise** - Better recognition accuracy
7. **Keep messages concise** - Easier to speak and understand
8. **Add keyboard shortcuts** - Power users love them
9. **Monitor error rates** - Track voice feature adoption
10. **Provide instructions** - Most users are new to voice UI

---

## 📞 Support

- **Documentation**: See `VOICE_INTEGRATION_GUIDE.md`
- **Examples**: Check `SimpleVoiceChat.tsx` and `VoiceGeminiChatWindow.tsx`
- **Best Practices**: Review `VOICE_BEST_PRACTICES.md`
- **Browser Issues**: Try Chrome, Edge, or Safari
- **Permissions**: Check browser settings → Privacy → Microphone

---

**Happy Voice Chatting! 🎤🤖**
