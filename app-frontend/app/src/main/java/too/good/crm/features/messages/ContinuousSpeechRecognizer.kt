package too.good.crm.features.messages

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log

/**
 * Continuous Speech Recognizer Helper
 * Maintains continuous voice recognition until stopped
 */
class ContinuousSpeechRecognizer(
    private val context: Context,
    private val onResult: (String) -> Unit,
    private val onError: (String) -> Unit = {}
) {
    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false
    private var shouldRestart = true
    
    companion object {
        private const val TAG = "ContinuousSpeechRecognizer"
    }
    
    private val recognitionListener = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            Log.d(TAG, "Ready for speech")
        }
        
        override fun onBeginningOfSpeech() {
            Log.d(TAG, "Beginning of speech")
        }
        
        override fun onRmsChanged(rmsdB: Float) {
            // Volume level changed
        }
        
        override fun onBufferReceived(buffer: ByteArray?) {
            // Partial audio data received
        }
        
        override fun onEndOfSpeech() {
            Log.d(TAG, "End of speech")
        }
        
        override fun onError(error: Int) {
            val errorMessage = when (error) {
                SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                SpeechRecognizer.ERROR_CLIENT -> "Client side error"
                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
                SpeechRecognizer.ERROR_NETWORK -> "Network error"
                SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
                SpeechRecognizer.ERROR_NO_MATCH -> "No speech match"
                SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognition service busy"
                SpeechRecognizer.ERROR_SERVER -> "Server error"
                SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input"
                else -> "Unknown error"
            }
            
            Log.e(TAG, "Recognition error: $errorMessage ($error)")
            
            // Restart listening if continuous mode is enabled and it's not a fatal error
            if (shouldRestart && error != SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) {
                // Wait a bit before restarting to avoid rapid restarts
                android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                    if (shouldRestart) {
                        restartListening()
                    }
                }, 500)
            } else if (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) {
                onError("Microphone permission required")
                isListening = false
            }
        }
        
        override fun onResults(results: Bundle?) {
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val spokenText = matches?.firstOrNull()
            
            if (!spokenText.isNullOrBlank()) {
                Log.d(TAG, "Recognized: $spokenText")
                onResult(spokenText)
            }
            
            // Restart listening for continuous mode
            if (shouldRestart) {
                restartListening()
            }
        }
        
        override fun onPartialResults(partialResults: Bundle?) {
            // Partial recognition results available
            val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val partialText = matches?.firstOrNull()
            Log.d(TAG, "Partial: $partialText")
        }
        
        override fun onEvent(eventType: Int, params: Bundle?) {
            // Reserved for future use
        }
    }
    
    /**
     * Start continuous listening
     */
    fun startListening() {
        if (isListening) return
        
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            onError("Speech recognition not available")
            return
        }
        
        shouldRestart = true
        isListening = true
        
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
        speechRecognizer?.setRecognitionListener(recognitionListener)
        
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        
        speechRecognizer?.startListening(intent)
        Log.d(TAG, "Started continuous listening")
    }
    
    /**
     * Pause listening temporarily (for TTS)
     */
    fun pauseListening() {
        if (!isListening) return
        
        Log.d(TAG, "Pausing listening for TTS")
        shouldRestart = false
        speechRecognizer?.stopListening()
        speechRecognizer?.cancel()
    }
    
    /**
     * Resume listening after pause
     */
    fun resumeListening() {
        if (!isListening) return
        
        Log.d(TAG, "Resuming listening after TTS")
        shouldRestart = true
        
        // Small delay to ensure TTS has fully released the audio focus
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            if (shouldRestart && isListening) {
                restartListening()
            }
        }, 300)
    }
    
    /**
     * Stop continuous listening
     */
    fun stopListening() {
        shouldRestart = false
        isListening = false
        
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
        speechRecognizer = null
        
        Log.d(TAG, "Stopped continuous listening")
    }
    
    /**
     * Restart listening (for continuous mode)
     */
    private fun restartListening() {
        speechRecognizer?.cancel()
        
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        
        speechRecognizer?.startListening(intent)
        Log.d(TAG, "Restarted listening")
    }
    
    fun isCurrentlyListening(): Boolean = isListening
}
