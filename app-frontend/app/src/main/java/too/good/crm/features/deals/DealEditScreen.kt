package too.good.crm.features.deals

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.CreateDealRequest
import too.good.crm.data.model.Deal
import too.good.crm.data.model.PipelineStage
import too.good.crm.data.repository.DealRepository
import too.good.crm.ui.components.ResponsiveCard
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.responsivePadding
import too.good.crm.ui.utils.responsiveSpacing

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DealEditScreen(
    dealId: Int,
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val repository = remember { DealRepository() }
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }
    
    var deal by remember { mutableStateOf<Deal?>(null) }
    var stages by remember { mutableStateOf<List<PipelineStage>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var isSaving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    
    // Form fields
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var value by remember { mutableStateOf("") }
    var currency by remember { mutableStateOf("USD") }
    var probability by remember { mutableStateOf("") }
    var expectedCloseDate by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf("medium") }
    var notes by remember { mutableStateOf("") }
    var nextAction by remember { mutableStateOf("") }
    var nextActionDate by remember { mutableStateOf("") }
    
    // Validation errors
    var titleError by remember { mutableStateOf<String?>(null) }
    var valueError by remember { mutableStateOf<String?>(null) }
    
    // Load deal details
    LaunchedEffect(dealId) {
        isLoading = true
        when (val result = repository.getDeal(dealId)) {
            is NetworkResult.Success -> {
                deal = result.data
                // Populate form fields
                title = result.data.title
                description = result.data.description ?: ""
                value = result.data.value
                currency = result.data.currency
                probability = result.data.probability?.toString() ?: ""
                expectedCloseDate = result.data.expectedCloseDate ?: ""
                priority = result.data.priority
                notes = result.data.notes ?: ""
                nextAction = result.data.nextAction ?: ""
                nextActionDate = result.data.nextActionDate ?: ""
                
                // Load pipeline stages
                result.data.pipelineId?.let { pipelineId ->
                    when (val stagesResult = repository.getPipelineStages(pipelineId)) {
                        is NetworkResult.Success -> stages = stagesResult.data
                        else -> {}
                    }
                }
                isLoading = false
            }
            is NetworkResult.Error -> {
                error = result.message
                isLoading = false
            }
            is NetworkResult.Exception -> {
                error = result.exception.message
                isLoading = false
            }
        }
    }
    
    fun validateAndSave() {
        // Reset errors
        titleError = null
        valueError = null
        
        // Validate
        var isValid = true
        
        if (title.isBlank()) {
            titleError = "Title is required"
            isValid = false
        }
        
        if (value.isBlank()) {
            valueError = "Value is required"
            isValid = false
        } else {
            val valueNum = value.toDoubleOrNull()
            if (valueNum == null || valueNum <= 0) {
                valueError = "Please enter a valid value"
                isValid = false
            }
        }
        
        if (!isValid) return
        
        // Save
        scope.launch {
            isSaving = true
            
            // Convert value to Double
            val valueDouble = value.toDoubleOrNull() ?: 0.0
            
            val updateRequest = CreateDealRequest(
                organization = deal!!.organization,
                title = title,
                description = description.ifBlank { null },
                customer = deal!!.customer?.id ?: 0,
                value = valueDouble,
                currency = currency,
                pipeline = deal!!.pipelineId,
                stage = deal!!.stageId ?: 1,
                probability = probability.toIntOrNull(),
                expectedCloseDate = expectedCloseDate.ifBlank { null },
                assignedTo = deal!!.assignedTo?.id,
                priority = priority,
                notes = notes.ifBlank { null },
                nextAction = nextAction.ifBlank { null },
                nextActionDate = nextActionDate.ifBlank { null }
            )
            
            when (val result = repository.updateDeal(dealId, updateRequest)) {
                is NetworkResult.Success -> {
                    isSaving = false
                    snackbarHostState.showSnackbar("Deal updated successfully")
                    onBack()
                }
                is NetworkResult.Error -> {
                    isSaving = false
                    snackbarHostState.showSnackbar(result.message)
                }
                is NetworkResult.Exception -> {
                    isSaving = false
                    snackbarHostState.showSnackbar(result.exception.message ?: "Failed to update deal")
                }
            }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit Deal") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    TextButton(
                        onClick = { validateAndSave() },
                        enabled = !isSaving
                    ) {
                        if (isSaving) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text("Save")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DesignTokens.Colors.Surface
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        when {
            isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            error != null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.Error,
                            contentDescription = null,
                            tint = DesignTokens.Colors.Error,
                            modifier = Modifier.size(48.dp)
                        )
                        Text(
                            text = error ?: "Failed to load deal",
                            style = MaterialTheme.typography.bodyLarge,
                            color = DesignTokens.Colors.Error
                        )
                        Button(onClick = onBack) {
                            Text("Go Back")
                        }
                    }
                }
            }
            deal != null -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(DesignTokens.Colors.Background)
                        .padding(paddingValues)
                        .padding(
                            responsivePadding(
                                compact = DesignTokens.Spacing.Space4,
                                medium = DesignTokens.Spacing.Space5,
                                expanded = DesignTokens.Spacing.Space6
                            )
                        ),
                    verticalArrangement = Arrangement.spacedBy(
                        responsiveSpacing(
                            compact = DesignTokens.Spacing.Space4,
                            medium = DesignTokens.Spacing.Space5
                        )
                    )
                ) {
                    // Basic Information
                    item {
                        ResponsiveCard {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(DesignTokens.Spacing.Space4),
                                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                            ) {
                                Text(
                                    text = "Basic Information",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                
                                // Title
                                OutlinedTextField(
                                    value = title,
                                    onValueChange = {
                                        title = it
                                        titleError = null
                                    },
                                    label = { Text("Deal Title *") },
                                    placeholder = { Text("Enterprise Software License") },
                                    isError = titleError != null,
                                    supportingText = titleError?.let { { Text(it) } },
                                    modifier = Modifier.fillMaxWidth(),
                                    singleLine = true
                                )
                                
                                // Description
                                OutlinedTextField(
                                    value = description,
                                    onValueChange = { description = it },
                                    label = { Text("Description") },
                                    placeholder = { Text("Additional details about the deal...") },
                                    modifier = Modifier.fillMaxWidth(),
                                    minLines = 3,
                                    maxLines = 5
                                )
                            }
                        }
                    }
                    
                    // Financial Details
                    item {
                        ResponsiveCard {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(DesignTokens.Spacing.Space4),
                                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                            ) {
                                Text(
                                    text = "Financial Details",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    // Value
                                    OutlinedTextField(
                                        value = value,
                                        onValueChange = {
                                            value = it
                                            valueError = null
                                        },
                                        label = { Text("Deal Value *") },
                                        placeholder = { Text("50000") },
                                        isError = valueError != null,
                                        supportingText = valueError?.let { { Text(it) } },
                                        modifier = Modifier.weight(2f),
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                        leadingIcon = {
                                            Icon(Icons.Default.AttachMoney, contentDescription = null)
                                        }
                                    )
                                    
                                    // Currency
                                    OutlinedTextField(
                                        value = currency,
                                        onValueChange = { currency = it },
                                        label = { Text("Currency") },
                                        modifier = Modifier.weight(1f),
                                        singleLine = true
                                    )
                                }
                                
                                // Probability
                                OutlinedTextField(
                                    value = probability,
                                    onValueChange = { 
                                        if (it.isEmpty() || (it.toIntOrNull()?.let { num -> num in 0..100 } == true)) {
                                            probability = it
                                        }
                                    },
                                    label = { Text("Probability (%)") },
                                    placeholder = { Text("75") },
                                    modifier = Modifier.fillMaxWidth(),
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    supportingText = { Text("Win probability (0-100)") }
                                )
                            }
                        }
                    }
                    
                    // Customer Information (Read-only)
                    item {
                        ResponsiveCard {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(DesignTokens.Spacing.Space4),
                                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                            ) {
                                Text(
                                    text = "Customer & Assignment",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                
                                // Customer (Read-only)
                                OutlinedTextField(
                                    value = deal!!.customerName ?: "Unknown Customer",
                                    onValueChange = {},
                                    label = { Text("Customer") },
                                    modifier = Modifier.fillMaxWidth(),
                                    enabled = false,
                                    leadingIcon = {
                                        Icon(Icons.Default.Business, contentDescription = null)
                                    }
                                )
                                
                                // Assigned To (Read-only)
                                deal!!.assignedToName?.let { assignedTo ->
                                    OutlinedTextField(
                                        value = assignedTo,
                                        onValueChange = {},
                                        label = { Text("Assigned To") },
                                        modifier = Modifier.fillMaxWidth(),
                                        enabled = false,
                                        leadingIcon = {
                                            Icon(Icons.Default.Person, contentDescription = null)
                                        }
                                    )
                                }
                            }
                        }
                    }
                    
                    // Priority
                    item {
                        ResponsiveCard {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(DesignTokens.Spacing.Space4),
                                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                            ) {
                                Text(
                                    text = "Priority",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    listOf("low", "medium", "high", "urgent").forEach { priorityOption ->
                                        FilterChip(
                                            selected = priority == priorityOption,
                                            onClick = { priority = priorityOption },
                                            label = { 
                                                Text(
                                                    priorityOption.replaceFirstChar { it.uppercase() }
                                                ) 
                                            },
                                            modifier = Modifier.weight(1f)
                                        )
                                    }
                                }
                            }
                        }
                    }
                    
                    // Dates
                    item {
                        ResponsiveCard {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(DesignTokens.Spacing.Space4),
                                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                            ) {
                                Text(
                                    text = "Important Dates",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                
                                // Expected Close Date
                                OutlinedTextField(
                                    value = expectedCloseDate,
                                    onValueChange = { expectedCloseDate = it },
                                    label = { Text("Expected Close Date") },
                                    placeholder = { Text("YYYY-MM-DD") },
                                    modifier = Modifier.fillMaxWidth(),
                                    leadingIcon = {
                                        Icon(Icons.Default.CalendarToday, contentDescription = null)
                                    },
                                    supportingText = { Text("Format: YYYY-MM-DD") }
                                )
                                
                                // Next Action Date
                                OutlinedTextField(
                                    value = nextActionDate,
                                    onValueChange = { nextActionDate = it },
                                    label = { Text("Next Action Date") },
                                    placeholder = { Text("YYYY-MM-DD") },
                                    modifier = Modifier.fillMaxWidth(),
                                    leadingIcon = {
                                        Icon(Icons.Default.Alarm, contentDescription = null)
                                    },
                                    supportingText = { Text("Format: YYYY-MM-DD") }
                                )
                            }
                        }
                    }
                    
                    // Additional Details
                    item {
                        ResponsiveCard {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(DesignTokens.Spacing.Space4),
                                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                            ) {
                                Text(
                                    text = "Additional Details",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                
                                // Next Action
                                OutlinedTextField(
                                    value = nextAction,
                                    onValueChange = { nextAction = it },
                                    label = { Text("Next Action") },
                                    placeholder = { Text("Schedule follow-up meeting") },
                                    modifier = Modifier.fillMaxWidth(),
                                    minLines = 2,
                                    maxLines = 3
                                )
                                
                                // Notes
                                OutlinedTextField(
                                    value = notes,
                                    onValueChange = { notes = it },
                                    label = { Text("Notes") },
                                    placeholder = { Text("Internal notes about the deal...") },
                                    modifier = Modifier.fillMaxWidth(),
                                    minLines = 3,
                                    maxLines = 6
                                )
                            }
                        }
                    }
                    
                    // Action Buttons
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            OutlinedButton(
                                onClick = onBack,
                                modifier = Modifier.weight(1f),
                                enabled = !isSaving
                            ) {
                                Text("Cancel")
                            }
                            
                            Button(
                                onClick = { validateAndSave() },
                                modifier = Modifier.weight(1f),
                                enabled = !isSaving
                            ) {
                                if (isSaving) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(20.dp),
                                        strokeWidth = 2.dp,
                                        color = MaterialTheme.colorScheme.onPrimary
                                    )
                                } else {
                                    Text("Save Changes")
                                }
                            }
                        }
                    }
                    
                    // Bottom Spacing
                    item {
                        Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                    }
                }
            }
        }
    }
}
