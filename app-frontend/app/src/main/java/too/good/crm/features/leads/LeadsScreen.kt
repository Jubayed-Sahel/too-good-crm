package too.good.crm.features.leads

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.features.leads.components.FilterDrawer
import too.good.crm.features.leads.components.LeadFilters
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeadsScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    
    val viewModel: LeadsViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
    val uiState by viewModel.uiState.collectAsState()
    
    var searchQuery by remember { mutableStateOf("") }
    var selectedStatus by remember { mutableStateOf("All Statuses") }
    var selectedSource by remember { mutableStateOf("All Sources") }
    var selectedPriority by remember { mutableStateOf("All Priorities") }
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    var showFilterDrawer by remember { mutableStateOf(false) }
    var currentFilters by remember { mutableStateOf(LeadFilters()) }
    
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }

    AppScaffoldWithDrawer(
        profiles = profileState.profiles,
        activeProfile = profileState.activeProfile,
        isSwitchingProfile = profileState.isSwitching,
        onProfileSelected = { profile ->
            profileViewModel.switchProfile(
                profileId = profile.id,
                onSuccess = { user ->
                    val primaryProfile = user.primaryProfile ?: profile
                    val newMode = when (primaryProfile.profileType) {
                        "vendor", "employee" -> ActiveMode.VENDOR
                        else -> ActiveMode.CLIENT
                    }
                    UserSession.activeMode = newMode
                    activeMode = newMode
                    when (primaryProfile.profileType) {
                        "customer" -> onNavigate("client-dashboard")
                        else -> onNavigate("dashboard")
                    }
                },
                onError = { }
            )
        },
        title = "Leads",
        activeMode = activeMode,
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            // Navigate to appropriate dashboard when mode changes
            if (newMode == ActiveMode.CLIENT) {
                onNavigate("client-dashboard")
            } else {
                onNavigate("dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = onBack
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = "Leads",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Manage your lead pipeline and track conversions",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Metrics
            LeadMetricCard(
                title = "TOTAL LEADS",
                value = "10",
                change = "+12%",
                changeLabel = "vs last month",
                icon = Icons.Default.People,
                iconBackgroundColor = DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f),
                iconTintColor = DesignTokens.Colors.Primary
            )

            Spacer(modifier = Modifier.height(16.dp))

            LeadMetricCard(
                title = "QUALIFIED",
                value = "2",
                change = "+15%",
                changeLabel = "vs last month",
                icon = Icons.Default.EmojiEvents,
                iconBackgroundColor = DesignTokens.Colors.InfoLight,
                iconTintColor = DesignTokens.Colors.Info
            )

            Spacer(modifier = Modifier.height(16.dp))

            LeadMetricCard(
                title = "CONVERSION RATE",
                value = "8.5%",
                change = "+8%",
                changeLabel = "vs last month",
                icon = Icons.AutoMirrored.Filled.TrendingUp,
                iconBackgroundColor = DesignTokens.Colors.PinkLight,
                iconTintColor = DesignTokens.Colors.PinkAccent
            )

            Spacer(modifier = Modifier.height(16.dp))

            LeadMetricCard(
                title = "NEW THIS MONTH",
                value = "2",
                change = "+23%",
                changeLabel = "vs last month",
                icon = Icons.Default.CheckCircle,
                iconBackgroundColor = DesignTokens.Colors.SuccessLight,
                iconTintColor = DesignTokens.Colors.Success
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Search and Filter Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Search
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { 
                        searchQuery = it
                        if (it.isNotBlank()) {
                            viewModel.searchLeads(it)
                        } else {
                            viewModel.loadLeads()
                        }
                    },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Search leads...") },
                    leadingIcon = {
                        Icon(Icons.Default.Search, contentDescription = "Search")
                    },
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium
                )
                
                // Filter Button with Badge
                Box {
                    FilledIconButton(
                        onClick = { showFilterDrawer = true },
                        modifier = Modifier.size(56.dp),
                        colors = IconButtonDefaults.filledIconButtonColors(
                            containerColor = if (currentFilters.hasActiveFilters()) 
                                DesignTokens.Colors.Primary 
                            else 
                                DesignTokens.Colors.SurfaceVariant,
                            contentColor = if (currentFilters.hasActiveFilters())
                                DesignTokens.Colors.White
                            else
                                DesignTokens.Colors.OnSurfaceVariant
                        )
                    ) {
                        Icon(
                            Icons.Default.FilterList,
                            contentDescription = "Filter leads",
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    
                    if (currentFilters.hasActiveFilters()) {
                        Badge(
                            modifier = Modifier.align(Alignment.TopEnd).padding(top = 4.dp, end = 4.dp),
                            containerColor = DesignTokens.Colors.Error,
                            contentColor = DesignTokens.Colors.White
                        ) {
                            Text(
                                text = currentFilters.activeFilterCount().toString(),
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
            
            // Active Filters Display
            if (currentFilters.hasActiveFilters()) {
                Spacer(modifier = Modifier.height(12.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Info,
                            contentDescription = null,
                            tint = DesignTokens.Colors.Primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "${currentFilters.activeFilterCount()} filter(s) active",
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.Primary,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    
                    TextButton(
                        onClick = {
                            currentFilters = LeadFilters()
                            viewModel.clearFilters()
                        },
                        contentPadding = PaddingValues(horizontal = 12.dp)
                    ) {
                        Text(
                            "Clear All",
                            style = MaterialTheme.typography.labelMedium,
                            color = DesignTokens.Colors.Error
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // New Lead Button
            Button(
                onClick = { /* TODO: Add new lead */ },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            ) {
                Icon(Icons.Default.Add, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("New Lead")
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Lead Cards
            if (uiState.isLoading && uiState.leads.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        CircularProgressIndicator()
                        Text(
                            text = "Loading leads...",
                            style = MaterialTheme.typography.bodyMedium,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }
            } else if (uiState.error != null) {
                Surface(
                    color = DesignTokens.Colors.ErrorLight,
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = uiState.error ?: "Unknown error",
                        color = DesignTokens.Colors.ErrorDark,
                        modifier = Modifier.padding(DesignTokens.Spacing.Space3),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            } else if (uiState.leads.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        Icon(
                            Icons.Default.SearchOff,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Text(
                            text = "No leads found",
                            style = MaterialTheme.typography.titleMedium,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Text(
                            text = "Try adjusting your filters or add a new lead",
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }
            } else {
                uiState.leads.forEach { lead ->
                    LeadCard(
                        leadId = lead.id.toString(),
                        name = lead.name,
                        company = lead.organizationName ?: "No company",
                        position = lead.jobTitle ?: "",
                        email = lead.email ?: "",
                        score = "${lead.leadScore ?: 0}/100",
                        estimatedValue = lead.estimatedValue ?: "$0",
                        source = lead.source?.replace("_", " ")?.replaceFirstChar { it.uppercase() } ?: "Unknown",
                        created = lead.createdAt,
                        status = lead.qualificationStatus ?: lead.status,
                        statusColor = when (lead.qualificationStatus?.lowercase()) {
                            "new" -> DesignTokens.Colors.Info
                            "contacted" -> DesignTokens.Colors.Warning
                            "qualified" -> DesignTokens.Colors.Success
                            "unqualified", "disqualified" -> DesignTokens.Colors.Error
                            "converted" -> DesignTokens.Colors.Success
                            else -> DesignTokens.Colors.OnSurfaceVariant
                        },
                        onView = { onNavigate("lead-detail/$it") },
                        onEdit = { onNavigate("lead-edit/$it") }
                    )

                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
    
    // Filter Drawer
    FilterDrawer(
        showFilters = showFilterDrawer,
        onDismissRequest = { showFilterDrawer = false },
        currentFilters = currentFilters,
        onApplyFilters = { filters ->
            currentFilters = filters
            
            // Convert LocalDate to ISO string format
            val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE
            val createdAfter = filters.dateRange.first?.format(dateFormatter)
            val createdBefore = filters.dateRange.second?.format(dateFormatter)
            
            // Apply filters to ViewModel
            viewModel.applyFilters(
                statuses = filters.statuses,
                sources = filters.sources,
                leadScoreMin = filters.leadScoreRange.start.toInt(),
                leadScoreMax = filters.leadScoreRange.endInclusive.toInt(),
                qualificationStatus = filters.qualificationStatus,
                createdAfter = createdAfter,
                createdBefore = createdBefore
            )
        }
    )
}

@Composable
fun LeadMetricCard(
    title: String,
    value: String,
    change: String,
    changeLabel: String,
    icon: ImageVector,
    iconBackgroundColor: Color,
    iconTintColor: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White
        ),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant,
                    fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.TrendingUp,
                        contentDescription = null,
                        tint = DesignTokens.Colors.Success,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = change,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.Success,
                        fontWeight = DesignTokens.Typography.FontWeightSemiBold
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = changeLabel,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }
            Surface(
                shape = MaterialTheme.shapes.medium,
                color = iconBackgroundColor,
                modifier = Modifier.size(56.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconTintColor,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun LeadCard(
    leadId: String,
    name: String,
    company: String,
    position: String,
    email: String,
    score: String,
    estimatedValue: String,
    source: String,
    created: String,
    status: String,
    statusColor: Color,
    onView: (String) -> Unit = {},
    onEdit: (String) -> Unit = {}
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White
        ),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = statusColor.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = status,
                        style = MaterialTheme.typography.labelSmall,
                        color = statusColor,
                        fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Business,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = DesignTokens.Colors.OnSurfaceVariant
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = company,
                    style = MaterialTheme.typography.bodyMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = position,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Email,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = DesignTokens.Colors.OnSurfaceVariant
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = email,
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.Primary
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            HorizontalDivider(color = DesignTokens.Colors.OutlineVariant)

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Score",
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontWeight = DesignTokens.Typography.FontWeightMedium
                    )
                    Text(
                        text = score,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Est. Value",
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontWeight = DesignTokens.Typography.FontWeightMedium
                    )
                    Text(
                        text = estimatedValue,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = DesignTokens.Typography.FontWeightBold,
                        color = DesignTokens.Colors.OnSurface
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Source",
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontWeight = DesignTokens.Typography.FontWeightMedium
                    )
                    Text(
                        text = source,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurface
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Created",
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontWeight = DesignTokens.Typography.FontWeightMedium
                    )
                    Text(
                        text = created,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurface
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { onView(leadId) },
                    modifier = Modifier.weight(1f),
                    shape = MaterialTheme.shapes.medium,
                    border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.Outline)
                ) {
                    Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("View")
                }
                OutlinedButton(
                    onClick = { onEdit(leadId) },
                    modifier = Modifier.weight(1f),
                    shape = MaterialTheme.shapes.medium,
                    border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.Outline)
                ) {
                    Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Edit")
                }
            }
        }
    }
}
