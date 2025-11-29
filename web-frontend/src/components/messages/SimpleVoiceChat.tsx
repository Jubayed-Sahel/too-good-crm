/**
 * Simple Voice Chat Component Example
 * Minimal implementation showing how to add voice to your existing chat
 */

import { useState, useEffect } from 'react';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useGemini } from '@/hooks/useGemini';

export const SimpleVoiceChat = () => {
  const { messages, sendMessage, isLoading } = useGemini();
  const [input, setInput] = useState('');
  
  // Voice Input
  const {
    isListening,
    finalTranscript,
    isSupported: voiceInputSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText({
    lang: 'en-US',
    onTranscript: (text) => {
      // Auto-send when speech completes
      if (text.trim()) {
        sendMessage(text);
        setInput('');
      }
    },
  });

  // Voice Output
  const {
    speak,
    isSupported: voiceOutputSupported,
  } = useTextToSpeech({
    lang: 'en-US',
  });

  // Auto-speak bot responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && !lastMessage.isStreaming) {
      speak(lastMessage.content);
    }
  }, [messages, speak]);

  // Update input when transcript changes
  useEffect(() => {
    if (finalTranscript) {
      setInput(finalTranscript);
    }
  }, [finalTranscript]);

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setInput('');
      startListening();
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🎤 Voice AI Chat</h1>
      
      {/* Browser Support Warning */}
      {!voiceInputSupported && (
        <div style={{ 
          padding: '10px', 
          background: '#fff3cd', 
          borderRadius: '5px',
          marginBottom: '10px' 
        }}>
          ⚠️ Voice input not supported. Please use Chrome, Edge, or Safari.
        </div>
      )}

      {/* Messages */}
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '15px',
        minHeight: '300px',
        maxHeight: '400px',
        overflowY: 'auto',
        marginBottom: '15px',
        background: '#f9f9f9',
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              padding: '10px',
              margin: '8px 0',
              borderRadius: '8px',
              background: msg.role === 'user' ? '#7c3aed' : '#e5e7eb',
              color: msg.role === 'user' ? 'white' : 'black',
              maxWidth: '80%',
              marginLeft: msg.role === 'user' ? 'auto' : '0',
              marginRight: msg.role === 'user' ? '0' : 'auto',
            }}
          >
            <strong>{msg.role === 'user' ? 'You' : '🤖 AI'}:</strong>
            <p style={{ margin: '5px 0 0 0' }}>{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Voice Indicator */}
      {isListening && (
        <div style={{ 
          padding: '10px', 
          background: '#fee2e2', 
          borderRadius: '5px',
          marginBottom: '10px',
          textAlign: 'center',
          fontWeight: 'bold',
        }}>
          🎤 Listening... Speak now!
        </div>
      )}

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {voiceInputSupported && (
          <button
            onClick={handleVoiceClick}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              fontSize: '18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: isListening ? '#ef4444' : '#7c3aed',
              color: 'white',
            }}
          >
            {isListening ? '⏹️ Stop' : '🎤 Speak'}
          </button>
        )}
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? 'Listening...' : 'Type or speak...'}
          disabled={isLoading || isListening}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '14px',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        />
        
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: '#7c3aed',
            color: 'white',
          }}
        >
          ✈️ Send
        </button>
      </div>

      {/* Helper Text */}
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        💡 Click the microphone to speak, or type your message
        {!voiceOutputSupported && ' (Voice output not available)'}
      </p>
    </div>
  );
};
