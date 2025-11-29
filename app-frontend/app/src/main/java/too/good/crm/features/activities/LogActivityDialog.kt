package too.good.crm.features.activities

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import too.good.crm.data.model.CreateActivityRequest
import too.good.crm.ui.theme.DesignTokens
import java.text.SimpleDateFormat
import java.util.*

/**
 * Dialog for logging a new activity
 * Supports 6 activity types: call, email, telegram, meeting, note, task
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LogActivityDialog(
    dealId: Int?,
    customerId: Int?,
    leadId: Int?,
    onDismiss: () -> Unit,
    onSave: (CreateActivityRequest) -> Unit,
    isLoading: Boolean = false
) {
    // Core fields
    var activityType by remember { mutableStateOf("call") }
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("scheduled") }
    var scheduledDateTime by remember { mutableStateOf(Calendar.getInstance()) }
    var showDatePicker by remember { mutableStateOf(false) }
    var showTimePicker by remember { mutableStateOf(false) }
    
    // Type-specific fields
    var phoneNumber by remember { mutableStateOf("") }
    var callDuration by remember { mutableStateOf("") }
    var emailSubject by remember { mutableStateOf("") }
    var emailBody by remember { mutableStateOf("") }
    var emailTo by remember { mutableStateOf("") }
    var telegramUsername by remember { mutableStateOf("") }
    var telegramMessage by remember { mutableStateOf("") }
    var meetingLocation by remember { mutableStateOf("") }
    var meetingUrl by remember { mutableStateOf("") }
    var taskPriority by remember { mutableStateOf("medium") }
    var taskDueDate by remember { mutableStateOf("") }
    var isPinned by remember { mutableStateOf(false) }
    
    // Validation
    val isTitleValid = title.isNotBlank()
    val canSave = isTitleValid && !isLoading
    
    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight(0.9f)
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            shape = MaterialTheme.shapes.large,
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Log Activity",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, "Close")
                    }
                }
                
                Divider()
                
                // Content
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Activity Type Selector
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "Activity Type *",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            ActivityTypeChip(
                                type = "call",
                                label = "Call",
                                icon = Icons.Default.Phone,
                                isSelected = activityType == "call",
                                onClick = { activityType = "call" },
                                modifier = Modifier.weight(1f)
                            )
                            ActivityTypeChip(
                                type = "email",
                                label = "Email",
                                icon = Icons.Default.Email,
                                isSelected = activityType == "email",
                                onClick = { activityType = "email" },
                                modifier = Modifier.weight(1f)
                            )
                            ActivityTypeChip(
                                type = "meeting",
                                label = "Meeting",
                                icon = Icons.Default.Event,
                                isSelected = activityType == "meeting",
                                onClick = { activityType = "meeting" },
                                modifier = Modifier.weight(1f)
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            ActivityTypeChip(
                                type = "telegram",
                                label = "Telegram",
                                icon = Icons.Default.Send,
                                isSelected = activityType == "telegram",
                                onClick = { activityType = "telegram" },
                                modifier = Modifier.weight(1f)
                            )
                            ActivityTypeChip(
                                type = "note",
                                label = "Note",
                                icon = Icons.Default.Note,
                                isSelected = activityType == "note",
                                onClick = { activityType = "note" },
                                modifier = Modifier.weight(1f)
                            )
                            ActivityTypeChip(
                                type = "task",
                                label = "Task",
                                icon = Icons.Default.CheckCircle,
                                isSelected = activityType == "task",
                                onClick = { activityType = "task" },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                    
                    // Title
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Title *") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = title.isBlank(),
                        supportingText = if (title.isBlank()) {
                            { Text("Title is required") }
                        } else null
                    )
                    
                    // Description
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Description") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 100.dp),
                        maxLines = 4
                    )
                    
                    // Status
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "Status",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilterChip(
                                selected = status == "scheduled",
                                onClick = { status = "scheduled" },
                                label = { Text("Scheduled") }
                            )
                            FilterChip(
                                selected = status == "completed",
                                onClick = { status = "completed" },
                                label = { Text("Completed") }
                            )
                        }
                    }
                    
                    // Scheduled Date/Time
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { showDatePicker = true },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.CalendarToday, null, Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(formatDate(scheduledDateTime))
                        }
                        OutlinedButton(
                            onClick = { showTimePicker = true },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Schedule, null, Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(formatTime(scheduledDateTime))
                        }
                    }
                    
                    // Type-specific Fields
                    when (activityType) {
                        "call" -> CallFields(
                            phoneNumber = phoneNumber,
                            onPhoneNumberChange = { phoneNumber = it },
                            callDuration = callDuration,
                            onCallDurationChange = { callDuration = it }
                        )
                        "email" -> EmailFields(
                            emailSubject = emailSubject,
                            onEmailSubjectChange = { emailSubject = it },
                            emailBody = emailBody,
                            onEmailBodyChange = { emailBody = it },
                            emailTo = emailTo,
                            onEmailToChange = { emailTo = it }
                        )
                        "telegram" -> TelegramFields(
                            telegramUsername = telegramUsername,
                            onTelegramUsernameChange = { telegramUsername = it },
                            telegramMessage = telegramMessage,
                            onTelegramMessageChange = { telegramMessage = it }
                        )
                        "meeting" -> MeetingFields(
                            meetingLocation = meetingLocation,
                            onMeetingLocationChange = { meetingLocation = it },
                            meetingUrl = meetingUrl,
                            onMeetingUrlChange = { meetingUrl = it }
                        )
                        "task" -> TaskFields(
                            taskPriority = taskPriority,
                            onTaskPriorityChange = { taskPriority = it },
                            taskDueDate = taskDueDate,
                            onTaskDueDateChange = { taskDueDate = it }
                        )
                        "note" -> NoteFields(
                            isPinned = isPinned,
                            onIsPinnedChange = { isPinned = it }
                        )
                    }
                }
                
                // Actions
                Divider()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End)
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    Button(
                        onClick = {
                            val request = CreateActivityRequest(
                                activityType = activityType,
                                title = title,
                                description = description.ifBlank { null },
                                customer = customerId,
                                lead = leadId,
                                deal = dealId,
                                status = status,
                                scheduledAt = formatIsoDateTime(scheduledDateTime),
                                phoneNumber = phoneNumber.ifBlank { null },
                                callDuration = callDuration.toIntOrNull(),
                                emailSubject = emailSubject.ifBlank { null },
                                emailBody = emailBody.ifBlank { null },
                                emailTo = emailTo.ifBlank { null },
                                telegramUsername = telegramUsername.ifBlank { null },
                                telegramMessage = telegramMessage.ifBlank { null },
                                meetingLocation = meetingLocation.ifBlank { null },
                                meetingUrl = meetingUrl.ifBlank { null },
                                taskPriority = taskPriority.ifBlank { null },
                                taskDueDate = taskDueDate.ifBlank { null },
                                isPinned = if (activityType == "note") isPinned else null
                            )
                            onSave(request)
                        },
                        enabled = canSave
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                strokeWidth = 2.dp
                            )
                            Spacer(Modifier.width(8.dp))
                        }
                        Text("Save Activity")
                    }
                }
            }
        }
    }
    
    // Date Picker Dialog
    if (showDatePicker) {
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = scheduledDateTime.timeInMillis
        )
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let {
                        scheduledDateTime.timeInMillis = it
                    }
                    showDatePicker = false
                }) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text("Cancel")
                }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }
    
    // Time Picker Dialog
    if (showTimePicker) {
        val timePickerState = rememberTimePickerState(
            initialHour = scheduledDateTime.get(Calendar.HOUR_OF_DAY),
            initialMinute = scheduledDateTime.get(Calendar.MINUTE)
        )
        AlertDialog(
            onDismissRequest = { showTimePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    scheduledDateTime.set(Calendar.HOUR_OF_DAY, timePickerState.hour)
                    scheduledDateTime.set(Calendar.MINUTE, timePickerState.minute)
                    showTimePicker = false
                }) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(onClick = { showTimePicker = false }) {
                    Text("Cancel")
                }
            },
            text = {
                TimePicker(state = timePickerState)
            }
        )
    }
}

// Type-specific field composables

@Composable
private fun CallFields(
    phoneNumber: String,
    onPhoneNumberChange: (String) -> Unit,
    callDuration: String,
    onCallDurationChange: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        OutlinedTextField(
            value = phoneNumber,
            onValueChange = onPhoneNumberChange,
            label = { Text("Phone Number") },
            leadingIcon = { Icon(Icons.Default.Phone, null) },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
        )
        OutlinedTextField(
            value = callDuration,
            onValueChange = onCallDurationChange,
            label = { Text("Duration (minutes)") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
        )
    }
}

@Composable
private fun EmailFields(
    emailSubject: String,
    onEmailSubjectChange: (String) -> Unit,
    emailBody: String,
    onEmailBodyChange: (String) -> Unit,
    emailTo: String,
    onEmailToChange: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        OutlinedTextField(
            value = emailTo,
            onValueChange = onEmailToChange,
            label = { Text("To") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
        )
        OutlinedTextField(
            value = emailSubject,
            onValueChange = onEmailSubjectChange,
            label = { Text("Subject") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = emailBody,
            onValueChange = onEmailBodyChange,
            label = { Text("Body") },
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 120.dp),
            maxLines = 6
        )
    }
}

@Composable
private fun TelegramFields(
    telegramUsername: String,
    onTelegramUsernameChange: (String) -> Unit,
    telegramMessage: String,
    onTelegramMessageChange: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        OutlinedTextField(
            value = telegramUsername,
            onValueChange = onTelegramUsernameChange,
            label = { Text("Telegram Username") },
            leadingIcon = { Icon(Icons.Default.Send, null) },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = telegramMessage,
            onValueChange = onTelegramMessageChange,
            label = { Text("Message") },
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 100.dp),
            maxLines = 4
        )
    }
}

@Composable
private fun MeetingFields(
    meetingLocation: String,
    onMeetingLocationChange: (String) -> Unit,
    meetingUrl: String,
    onMeetingUrlChange: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        OutlinedTextField(
            value = meetingLocation,
            onValueChange = onMeetingLocationChange,
            label = { Text("Location") },
            leadingIcon = { Icon(Icons.Default.Place, null) },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = meetingUrl,
            onValueChange = onMeetingUrlChange,
            label = { Text("Meeting URL") },
            leadingIcon = { Icon(Icons.Default.Link, null) },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun TaskFields(
    taskPriority: String,
    onTaskPriorityChange: (String) -> Unit,
    taskDueDate: String,
    onTaskDueDateChange: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "Priority",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = taskPriority == "low",
                    onClick = { onTaskPriorityChange("low") },
                    label = { Text("Low") }
                )
                FilterChip(
                    selected = taskPriority == "medium",
                    onClick = { onTaskPriorityChange("medium") },
                    label = { Text("Medium") }
                )
                FilterChip(
                    selected = taskPriority == "high",
                    onClick = { onTaskPriorityChange("high") },
                    label = { Text("High") }
                )
            }
        }
        OutlinedTextField(
            value = taskDueDate,
            onValueChange = onTaskDueDateChange,
            label = { Text("Due Date (YYYY-MM-DD)") },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun NoteFields(
    isPinned: Boolean,
    onIsPinnedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = "Pin this note",
            style = MaterialTheme.typography.bodyLarge
        )
        Switch(
            checked = isPinned,
            onCheckedChange = onIsPinnedChange
        )
    }
}

@Composable
private fun ActivityTypeChip(
    type: String,
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    FilterChip(
        selected = isSelected,
        onClick = onClick,
        label = {
            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(icon, null, Modifier.size(16.dp))
                Text(label, modifier = Modifier.weight(1f))
            }
        },
        modifier = modifier
    )
}

// Utility functions

private fun formatDate(calendar: Calendar): String {
    return SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(calendar.time)
}

private fun formatTime(calendar: Calendar): String {
    return SimpleDateFormat("h:mm a", Locale.getDefault()).format(calendar.time)
}

private fun formatIsoDateTime(calendar: Calendar): String {
    return SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).format(calendar.time)
}
