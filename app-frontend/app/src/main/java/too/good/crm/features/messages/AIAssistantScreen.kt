package too.good.crm.features.messages

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import kotlinx.coroutines.launch
import too.good.crm.ui.theme.DesignTokens
import java.text.SimpleDateFormat
import java.util.*

/**
 * AI Assistant Screen with voice input support
 * Powered by Gemini AI
 */
@OptIn(ExperimentalPermissionsApi::class, ExperimentalMaterial3Api::class)
@Composable
fun AIAssistantScreen(
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val viewModel: AIAssistantViewModel = androidx.lifecycle.viewmodel.compose.viewModel(
        factory = androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.getInstance(
            context.applicationContext as android.app.Application
        )
    )
    val uiState by viewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()
    
    var inputText by remember { mutableStateOf("") }
    var showSettings by remember { mutableStateOf(false) }
    
    // Voice recognition permission
    val audioPermissionState = rememberPermissionState(Manifest.permission.RECORD_AUDIO)
    
    // Continuous speech recognizer
    val continuousSpeechRecognizer = remember {
        ContinuousSpeechRecognizer(
            context = context,
            onResult = { spokenText ->
                // Auto-send recognized speech
                viewModel.sendMessage(spokenText)
            },
            onError = { error ->
                // Handle errors
                android.util.Log.e("AIAssistantScreen", "Speech recognition error: $error")
            }
        )
    }
    
    // Handle continuous listening state changes
    LaunchedEffect(uiState.continuousListeningEnabled) {
        if (uiState.continuousListeningEnabled) {
            if (audioPermissionState.status.isGranted) {
                continuousSpeechRecognizer.startListening()
            } else {
                audioPermissionState.launchPermissionRequest()
                viewModel.toggleContinuousListening() // Turn it back off
            }
        } else {
            continuousSpeechRecognizer.stopListening()
        }
    }
    
    // Pause/resume speech recognition based on TTS state
    LaunchedEffect(uiState.shouldPauseSpeechRecognition, uiState.continuousListeningEnabled) {
        if (uiState.continuousListeningEnabled) {
            if (uiState.shouldPauseSpeechRecognition) {
                continuousSpeechRecognizer.pauseListening()
            } else {
                continuousSpeechRecognizer.resumeListening()
            }
        }
    }
    
    // Cleanup on dispose
    DisposableEffect(Unit) {
        onDispose {
            continuousSpeechRecognizer.stopListening()
        }
    }
    
    // Auto-scroll to bottom when new messages arrive
    LaunchedEffect(uiState.messages.size) {
        if (uiState.messages.isNotEmpty()) {
            listState.animateScrollToItem(uiState.messages.size - 1)
        }
    }
    
    // Settings dialog
    if (showSettings) {
        AlertDialog(
            onDismissRequest = { showSettings = false },
            title = { Text("AI Assistant Settings") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Continuous listening toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Continuous voice mode", fontWeight = FontWeight.Medium)
                            Text(
                                "Always listen and respond to your voice",
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                        Switch(
                            checked = uiState.continuousListeningEnabled,
                            onCheckedChange = { viewModel.toggleContinuousListening() }
                        )
                    }
                    
                    // Auto-speak toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Auto-speak responses", fontWeight = FontWeight.Medium)
                            Text(
                                "Automatically read AI responses aloud",
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                        Switch(
                            checked = uiState.autoSpeakEnabled,
                            onCheckedChange = { viewModel.toggleAutoSpeak() },
                            enabled = uiState.ttsAvailable
                        )
                    }
                    
                    if (!uiState.ttsAvailable) {
                        Text(
                            "Text-to-speech not available on this device",
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.Error
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showSettings = false }) {
                    Text("Close")
                }
            }
        )
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🤖 AI Assistant")
                            if (uiState.isServiceAvailable) {
                                Badge(
                                    containerColor = DesignTokens.Colors.Success,
                                    modifier = Modifier.padding(start = 8.dp)
                                ) {
                                    Text("● Online", fontSize = 10.sp)
                                }
                            }
                            if (uiState.continuousListeningEnabled) {
                                Badge(
                                    containerColor = DesignTokens.Colors.Error,
                                    modifier = Modifier.padding(start = 8.dp)
                                ) {
                                    Text("🎤 Listening", fontSize = 10.sp)
                                }
                            }
                        }
                        Text(
                            "Powered by Gemini",
                            style = MaterialTheme.typography.labelSmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    
                    // Settings button
                    IconButton(onClick = { showSettings = true }) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings")
                    }
                    
                    // Clear chat button
                    IconButton(
                        onClick = { viewModel.clearChat() },
                        enabled = uiState.messages.isNotEmpty()
                    ) {
                        Icon(Icons.Default.DeleteSweep, contentDescription = "Clear chat")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DesignTokens.Colors.Surface
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DesignTokens.Colors.Background)
                .padding(paddingValues)
        ) {
            // Status banner
            if (!uiState.isServiceAvailable && !uiState.isCheckingStatus) {
                Surface(
                    color = DesignTokens.Colors.Error.copy(alpha = 0.1f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Warning,
                            contentDescription = null,
                            tint = DesignTokens.Colors.Error
                        )
                        Text(
                            "AI Assistant is currently unavailable",
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.Error
                        )
                    }
                }
            }
            
            // Error banner
            uiState.error?.let { error ->
                Surface(
                    color = DesignTokens.Colors.Error.copy(alpha = 0.1f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Error,
                            contentDescription = null,
                            tint = DesignTokens.Colors.Error
                        )
                        Text(
                            error,
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.Error,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { viewModel.checkStatus() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Retry")
                        }
                    }
                }
            }
            
            // Messages list
            Box(modifier = Modifier.weight(1f)) {
                if (uiState.messages.isEmpty() && !uiState.isLoading) {
                    // Empty state
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            Icons.Default.SmartToy,
                            contentDescription = null,
                            modifier = Modifier.size(80.dp),
                            tint = DesignTokens.Colors.Primary.copy(alpha = 0.5f)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "Hi! I'm your AI Assistant",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Ask me anything about your CRM data",
                            style = MaterialTheme.typography.bodyMedium,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        // Example queries
                        Column(
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth(0.8f)
                        ) {
                            Text(
                                "Try asking:",
                                style = MaterialTheme.typography.labelMedium,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                            SuggestionChip(
                                onClick = { 
                                    inputText = "Show me my customer statistics"
                                },
                                label = { Text("📊 Show me my customer statistics") }
                            )
                            SuggestionChip(
                                onClick = { 
                                    inputText = "List all high-priority leads"
                                },
                                label = { Text("🎯 List all high-priority leads") }
                            )
                            SuggestionChip(
                                onClick = { 
                                    inputText = "What are my open deals?"
                                },
                                label = { Text("💼 What are my open deals?") }
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.messages) { message ->
                            ChatMessageItem(
                                message = message,
                                onSpeak = { viewModel.speak(message.content, message.id) },
                                isSpeaking = uiState.speakingMessageId == message.id,
                                ttsAvailable = uiState.ttsAvailable,
                                onStopSpeaking = { viewModel.stopSpeaking() }
                            )
                        }
                    }
                }
            }
            
            // Input area
            Surface(
                color = DesignTokens.Colors.Surface,
                tonalElevation = 3.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.Bottom
                    ) {
                        // Continuous voice toggle button
                        IconButton(
                            onClick = {
                                if (audioPermissionState.status.isGranted) {
                                    viewModel.toggleContinuousListening()
                                } else {
                                    audioPermissionState.launchPermissionRequest()
                                }
                            },
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(
                                    if (uiState.continuousListeningEnabled)
                                        DesignTokens.Colors.Error.copy(alpha = 0.2f)
                                    else
                                        DesignTokens.Colors.Primary.copy(alpha = 0.1f)
                                )
                        ) {
                            Icon(
                                if (uiState.continuousListeningEnabled) Icons.Default.MicOff else Icons.Default.Mic,
                                contentDescription = if (uiState.continuousListeningEnabled) "Stop listening" else "Start continuous listening",
                                tint = if (uiState.continuousListeningEnabled) DesignTokens.Colors.Error else DesignTokens.Colors.Primary
                            )
                        }
                        
                        // Text input
                        OutlinedTextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            modifier = Modifier.weight(1f),
                            placeholder = { Text("Ask me anything...") },
                            enabled = !uiState.isLoading && uiState.isServiceAvailable,
                            shape = RoundedCornerShape(24.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = DesignTokens.Colors.Surface,
                                unfocusedContainerColor = DesignTokens.Colors.Surface
                            ),
                            maxLines = 4
                        )
                        
                        // Send button
                        IconButton(
                            onClick = {
                                if (inputText.isNotBlank()) {
                                    viewModel.sendMessage(inputText)
                                    inputText = ""
                                }
                            },
                            enabled = inputText.isNotBlank() && !uiState.isLoading && uiState.isServiceAvailable,
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(
                                    if (inputText.isNotBlank() && uiState.isServiceAvailable) 
                                        DesignTokens.Colors.Primary 
                                    else 
                                        DesignTokens.Colors.OnSurface.copy(alpha = 0.12f)
                                )
                        ) {
                            if (uiState.isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    color = DesignTokens.Colors.White,
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Icon(
                                    Icons.AutoMirrored.Filled.Send,
                                    contentDescription = "Send",
                                    tint = if (inputText.isNotBlank() && uiState.isServiceAvailable) 
                                        DesignTokens.Colors.White 
                                    else 
                                        DesignTokens.Colors.OnSurface.copy(alpha = 0.38f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ChatMessageItem(
    message: ChatMessage,
    onSpeak: () -> Unit,
    isSpeaking: Boolean,
    ttsAvailable: Boolean,
    onStopSpeaking: () -> Unit
) {
    val isUser = message.role == "user"
    val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
    
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier
                .weight(1f, fill = false)
                .then(
                    if (isUser) Modifier else Modifier.widthIn(max = 340.dp)
                ),
            horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
        ) {
            Card(
                shape = RoundedCornerShape(
                    topStart = 16.dp,
                    topEnd = 16.dp,
                    bottomStart = if (isUser) 16.dp else 4.dp,
                    bottomEnd = if (isUser) 4.dp else 16.dp
                ),
                colors = CardDefaults.cardColors(
                    containerColor = if (isUser) 
                        DesignTokens.Colors.Primary 
                    else 
                        DesignTokens.Colors.Surface
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier.padding(12.dp)
                ) {
                    Text(
                        text = message.content,
                        color = if (isUser) DesignTokens.Colors.White else DesignTokens.Colors.OnSurface,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    
                    if (message.isStreaming) {
                        Row(
                            modifier = Modifier.padding(top = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            repeat(3) { index ->
                                TypingDot(index)
                            }
                        }
                    }
                }
            }
            
            Row(
                modifier = Modifier.padding(top = 4.dp, start = 8.dp, end = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = timeFormat.format(message.timestamp),
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
        }
        
        // Volume controls (only for AI messages)
        if (!isUser && !message.isStreaming && message.content.isNotBlank() && ttsAvailable) {
            Spacer(modifier = Modifier.width(8.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                if (isSpeaking) {
                    // Show stop button and pulsing indicator when speaking
                    IconButton(
                        onClick = onStopSpeaking,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            Icons.Default.VolumeOff,
                            contentDescription = "Stop speaking",
                            tint = DesignTokens.Colors.Error,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    PulsingVoiceIndicator()
                } else {
                    // Show play button when not speaking
                    IconButton(
                        onClick = onSpeak,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            Icons.Default.VolumeUp,
                            contentDescription = "Speak message",
                            tint = DesignTokens.Colors.Primary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TypingDot(index: Int) {
    val infiniteTransition = rememberInfiniteTransition(label = "typing")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, delayMillis = index * 100),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dot"
    )
    
    Box(
        modifier = Modifier
            .size(6.dp)
            .scale(scale)
            .clip(CircleShape)
            .background(DesignTokens.Colors.OnSurfaceVariant)
    )
}

@Composable
fun PulsingVoiceIndicator() {
    val infiniteTransition = rememberInfiniteTransition(label = "speaking")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(500),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )
    
    Icon(
        Icons.Default.VolumeUp,
        contentDescription = "Speaking",
        modifier = Modifier
            .size(16.dp)
            .scale(scale)
            .padding(horizontal = 2.dp),
        tint = DesignTokens.Colors.Primary
    )
}
