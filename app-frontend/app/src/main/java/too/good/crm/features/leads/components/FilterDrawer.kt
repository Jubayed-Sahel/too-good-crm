package too.good.crm.features.leads.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import too.good.crm.ui.theme.DesignTokens
import java.time.LocalDate
import java.time.format.DateTimeFormatter

/**
 * Advanced Filter Drawer for Leads
 * Provides comprehensive filtering options with Material 3 design
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterDrawer(
    showFilters: Boolean,
    onDismissRequest: () -> Unit,
    currentFilters: LeadFilters,
    onApplyFilters: (LeadFilters) -> Unit
) {
    var leadScoreRange by remember { mutableStateOf(currentFilters.leadScoreRange) }
    var selectedStatuses by remember { mutableStateOf(currentFilters.statuses) }
    var selectedSources by remember { mutableStateOf(currentFilters.sources) }
    var dateRange by remember { mutableStateOf(currentFilters.dateRange) }
    var selectedQualificationStatus by remember { mutableStateOf(currentFilters.qualificationStatus) }
    var showDatePicker by remember { mutableStateOf(false) }
    var pickingStartDate by remember { mutableStateOf(true) }
    
    val dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy")
    
    if (showFilters) {
        ModalBottomSheet(
            onDismissRequest = onDismissRequest,
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = DesignTokens.Colors.White,
            dragHandle = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        modifier = Modifier
                            .width(32.dp)
                            .height(4.dp),
                        shape = MaterialTheme.shapes.extraLarge,
                        color = DesignTokens.Colors.OutlineVariant
                    ) {}
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .padding(bottom = 20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Filter Leads",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    TextButton(
                        onClick = {
                            leadScoreRange = 0f..100f
                            selectedStatuses = emptySet()
                            selectedSources = emptySet()
                            dateRange = null to null
                            selectedQualificationStatus = null
                        }
                    ) {
                        Text("Reset All", color = DesignTokens.Colors.Primary)
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider(color = DesignTokens.Colors.OutlineVariant)
                Spacer(modifier = Modifier.height(16.dp))
                
                // Scrollable Content
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f, fill = false)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    // Lead Score Range
                    LeadScoreFilter(
                        scoreRange = leadScoreRange,
                        onScoreRangeChange = { leadScoreRange = it }
                    )
                    
                    // Qualification Status
                    QualificationStatusFilter(
                        selectedStatus = selectedQualificationStatus,
                        onStatusChange = { selectedQualificationStatus = it }
                    )
                    
                    // Status Filter
                    StatusFilter(
                        selectedStatuses = selectedStatuses,
                        onStatusesChange = { selectedStatuses = it }
                    )
                    
                    // Source Filter
                    SourceFilter(
                        selectedSources = selectedSources,
                        onSourcesChange = { selectedSources = it }
                    )
                    
                    // Date Range Filter
                    DateRangeFilter(
                        dateRange = dateRange,
                        onDateRangeClick = { isStartDate ->
                            pickingStartDate = isStartDate
                            showDatePicker = true
                        },
                        onClearDateRange = { dateRange = null to null }
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Apply Button
                Button(
                    onClick = {
                        onApplyFilters(
                            LeadFilters(
                                leadScoreRange = leadScoreRange,
                                statuses = selectedStatuses,
                                sources = selectedSources,
                                dateRange = dateRange,
                                qualificationStatus = selectedQualificationStatus
                            )
                        )
                        onDismissRequest()
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Primary
                    ),
                    shape = MaterialTheme.shapes.medium
                ) {
                    Icon(Icons.Default.FilterList, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Apply Filters", style = MaterialTheme.typography.titleSmall)
                }
            }
        }
    }
    
    // Date Picker Dialog
    if (showDatePicker) {
        val datePickerState = rememberDatePickerState()
        
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        datePickerState.selectedDateMillis?.let { millis ->
                            val selectedDate = java.time.Instant.ofEpochMilli(millis)
                                .atZone(java.time.ZoneId.systemDefault())
                                .toLocalDate()
                            dateRange = if (pickingStartDate) {
                                selectedDate to dateRange.second
                            } else {
                                dateRange.first to selectedDate
                            }
                        }
                        showDatePicker = false
                    }
                ) {
                    Text("OK", color = DesignTokens.Colors.Primary)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text("Cancel")
                }
            }
        ) {
            DatePicker(
                state = datePickerState,
                title = {
                    Text(
                        text = if (pickingStartDate) "Select Start Date" else "Select End Date",
                        modifier = Modifier.padding(16.dp)
                    )
                },
                colors = DatePickerDefaults.colors(
                    containerColor = DesignTokens.Colors.White,
                    selectedDayContainerColor = DesignTokens.Colors.Primary
                )
            )
        }
    }
}

@Composable
private fun LeadScoreFilter(
    scoreRange: ClosedFloatingPointRange<Float>,
    onScoreRangeChange: (ClosedFloatingPointRange<Float>) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Lead Score Range",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = DesignTokens.Colors.OnSurface
            )
            Surface(
                shape = MaterialTheme.shapes.small,
                color = DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f)
            ) {
                Text(
                    text = "${scoreRange.start.toInt()} - ${scoreRange.endInclusive.toInt()}",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = DesignTokens.Colors.Primary,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        }
        
        RangeSlider(
            value = scoreRange,
            onValueChange = onScoreRangeChange,
            valueRange = 0f..100f,
            steps = 19, // 5-point increments
            colors = SliderDefaults.colors(
                thumbColor = DesignTokens.Colors.Primary,
                activeTrackColor = DesignTokens.Colors.Primary,
                inactiveTrackColor = DesignTokens.Colors.OutlineVariant
            )
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "0",
                style = MaterialTheme.typography.labelSmall,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
            Text(
                text = "100",
                style = MaterialTheme.typography.labelSmall,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
        }
    }
}

@Composable
private fun QualificationStatusFilter(
    selectedStatus: String?,
    onStatusChange: (String?) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Qualification Status",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = DesignTokens.Colors.OnSurface
        )
        
        val qualificationStatuses = listOf(
            "new" to "New",
            "contacted" to "Contacted",
            "qualified" to "Qualified",
            "unqualified" to "Unqualified",
            "proposal" to "Proposal",
            "negotiation" to "Negotiation",
            "converted" to "Converted",
            "lost" to "Lost"
        )
        
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            qualificationStatuses.chunked(2).forEach { rowStatuses ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    rowStatuses.forEach { (value, label) ->
                        FilterChip(
                            selected = selectedStatus == value,
                            onClick = {
                                onStatusChange(if (selectedStatus == value) null else value)
                            },
                            label = { Text(label) },
                            leadingIcon = if (selectedStatus == value) {
                                { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) }
                            } else null,
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = DesignTokens.Colors.Primary,
                                selectedLabelColor = DesignTokens.Colors.White,
                                containerColor = DesignTokens.Colors.Surface,
                                labelColor = DesignTokens.Colors.OnSurface
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = selectedStatus == value,
                                borderColor = if (selectedStatus == value) 
                                    DesignTokens.Colors.Primary 
                                else 
                                    DesignTokens.Colors.Outline
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }
                    // Add spacer for odd numbers
                    if (rowStatuses.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
private fun StatusFilter(
    selectedStatuses: Set<String>,
    onStatusesChange: (Set<String>) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Status",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = DesignTokens.Colors.OnSurface
            )
            if (selectedStatuses.isNotEmpty()) {
                TextButton(
                    onClick = { onStatusesChange(emptySet()) },
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    Text("Clear", style = MaterialTheme.typography.labelMedium)
                }
            }
        }
        
        val statuses = listOf(
            "active" to "Active",
            "inactive" to "Inactive",
            "pending" to "Pending"
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            statuses.forEach { (value, label) ->
                FilterChip(
                    selected = selectedStatuses.contains(value),
                    onClick = {
                        onStatusesChange(
                            if (selectedStatuses.contains(value)) 
                                selectedStatuses - value 
                            else 
                                selectedStatuses + value
                        )
                    },
                    label = { Text(label) },
                    leadingIcon = if (selectedStatuses.contains(value)) {
                        { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) }
                    } else null,
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = DesignTokens.Colors.Primary,
                        selectedLabelColor = DesignTokens.Colors.White,
                        containerColor = DesignTokens.Colors.Surface,
                        labelColor = DesignTokens.Colors.OnSurface
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        enabled = true,
                        selected = selectedStatuses.contains(value),
                        borderColor = if (selectedStatuses.contains(value)) 
                            DesignTokens.Colors.Primary 
                        else 
                            DesignTokens.Colors.Outline
                    ),
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun SourceFilter(
    selectedSources: Set<String>,
    onSourcesChange: (Set<String>) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Source",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = DesignTokens.Colors.OnSurface
            )
            if (selectedSources.isNotEmpty()) {
                TextButton(
                    onClick = { onSourcesChange(emptySet()) },
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    Text("Clear", style = MaterialTheme.typography.labelMedium)
                }
            }
        }
        
        val sources = listOf(
            "website" to "Website",
            "referral" to "Referral",
            "cold_call" to "Cold Call",
            "email" to "Email",
            "social_media" to "Social Media",
            "advertisement" to "Advertisement",
            "event" to "Event",
            "other" to "Other"
        )
        
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            sources.chunked(3).forEach { rowSources ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    rowSources.forEach { (value, label) ->
                        FilterChip(
                            selected = selectedSources.contains(value),
                            onClick = {
                                onSourcesChange(
                                    if (selectedSources.contains(value)) 
                                        selectedSources - value 
                                    else 
                                        selectedSources + value
                                )
                            },
                            label = { Text(label, maxLines = 1) },
                            leadingIcon = if (selectedSources.contains(value)) {
                                { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) }
                            } else null,
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = DesignTokens.Colors.Primary,
                                selectedLabelColor = DesignTokens.Colors.White,
                                containerColor = DesignTokens.Colors.Surface,
                                labelColor = DesignTokens.Colors.OnSurface
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = selectedSources.contains(value),
                                borderColor = if (selectedSources.contains(value)) 
                                    DesignTokens.Colors.Primary 
                                else 
                                    DesignTokens.Colors.Outline
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }
                    // Add spacers for incomplete rows
                    repeat(3 - rowSources.size) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
private fun DateRangeFilter(
    dateRange: Pair<LocalDate?, LocalDate?>,
    onDateRangeClick: (Boolean) -> Unit,
    onClearDateRange: () -> Unit
) {
    val dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy")
    
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Created Date Range",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = DesignTokens.Colors.OnSurface
            )
            if (dateRange.first != null || dateRange.second != null) {
                TextButton(
                    onClick = onClearDateRange,
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    Text("Clear", style = MaterialTheme.typography.labelMedium)
                }
            }
        }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Start Date
            OutlinedCard(
                onClick = { onDateRangeClick(true) },
                modifier = Modifier.weight(1f),
                colors = CardDefaults.outlinedCardColors(
                    containerColor = if (dateRange.first != null) 
                        DesignTokens.Colors.PrimaryLight.copy(alpha = 0.1f) 
                    else 
                        DesignTokens.Colors.Surface
                ),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(
                        if (dateRange.first != null) 
                            DesignTokens.Colors.Primary 
                        else 
                            DesignTokens.Colors.Outline
                    )
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            Icons.Default.CalendarToday,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Text(
                            text = "From",
                            style = MaterialTheme.typography.labelSmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                    Text(
                        text = dateRange.first?.format(dateFormatter) ?: "Select date",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = if (dateRange.first != null) FontWeight.SemiBold else FontWeight.Normal,
                        color = if (dateRange.first != null) 
                            DesignTokens.Colors.OnSurface 
                        else 
                            DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }
            
            // End Date
            OutlinedCard(
                onClick = { onDateRangeClick(false) },
                modifier = Modifier.weight(1f),
                colors = CardDefaults.outlinedCardColors(
                    containerColor = if (dateRange.second != null) 
                        DesignTokens.Colors.PrimaryLight.copy(alpha = 0.1f) 
                    else 
                        DesignTokens.Colors.Surface
                ),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(
                        if (dateRange.second != null) 
                            DesignTokens.Colors.Primary 
                        else 
                            DesignTokens.Colors.Outline
                    )
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            Icons.Default.Event,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Text(
                            text = "To",
                            style = MaterialTheme.typography.labelSmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                    Text(
                        text = dateRange.second?.format(dateFormatter) ?: "Select date",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = if (dateRange.second != null) FontWeight.SemiBold else FontWeight.Normal,
                        color = if (dateRange.second != null) 
                            DesignTokens.Colors.OnSurface 
                        else 
                            DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }
        }
    }
}

/**
 * Data class to hold all filter values
 */
data class LeadFilters(
    val leadScoreRange: ClosedFloatingPointRange<Float> = 0f..100f,
    val statuses: Set<String> = emptySet(),
    val sources: Set<String> = emptySet(),
    val dateRange: Pair<LocalDate?, LocalDate?> = null to null,
    val qualificationStatus: String? = null
) {
    /**
     * Check if any filters are active
     */
    fun hasActiveFilters(): Boolean {
        return leadScoreRange != 0f..100f ||
                statuses.isNotEmpty() ||
                sources.isNotEmpty() ||
                dateRange.first != null ||
                dateRange.second != null ||
                qualificationStatus != null
    }
    
    /**
     * Get count of active filters
     */
    fun activeFilterCount(): Int {
        var count = 0
        if (leadScoreRange != 0f..100f) count++
        if (statuses.isNotEmpty()) count++
        if (sources.isNotEmpty()) count++
        if (dateRange.first != null || dateRange.second != null) count++
        if (qualificationStatus != null) count++
        return count
    }
}
