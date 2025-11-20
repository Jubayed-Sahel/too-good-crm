package too.good.crm.features.customers

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomersScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    
    val viewModel: CustomersViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()
    
    var searchQuery by remember { mutableStateOf("") }
    var filterStatus by remember { mutableStateOf<CustomerStatus?>(null) }

    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }

    // Show snackbar for success messages
    val snackbarHostState = remember { SnackbarHostState() }
    
    LaunchedEffect(uiState.successMessage) {
        uiState.successMessage?.let { message ->
            snackbarHostState.showSnackbar(
                message = message,
                duration = SnackbarDuration.Short
            )
            viewModel.clearSuccessMessage()
        }
    }

    val filteredCustomers = uiState.customers.filter { customer ->
        val matchesSearch = searchQuery.isEmpty() ||
                customer.name.contains(searchQuery, ignoreCase = true) ||
                customer.company.contains(searchQuery, ignoreCase = true) ||
                customer.email.contains(searchQuery, ignoreCase = true)
        val matchesFilter = filterStatus == null || customer.status == filterStatus
        matchesSearch && matchesFilter
    }

    // Show create customer dialog
    if (uiState.showAddCustomerDialog) {
        CreateCustomerDialog(
            onDismiss = { viewModel.hideAddCustomerDialog() },
            onCreateCustomer = { name, email, phone, firstName, lastName, companyName, 
                                customerType, address, city, state, country, postalCode, 
                                website, notes ->
                viewModel.createCustomer(
                    name = name,
                    email = email,
                    phone = phone,
                    firstName = firstName,
                    lastName = lastName,
                    companyName = companyName,
                    customerType = customerType,
                    address = address,
                    city = city,
                    state = state,
                    country = country,
                    postalCode = postalCode,
                    website = website,
                    notes = notes
                )
            },
            isCreating = uiState.isCreatingCustomer,
            error = uiState.error
        )
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { viewModel.showAddCustomerDialog() },
                containerColor = DesignTokens.Colors.Primary,
                contentColor = DesignTokens.Colors.OnPrimary
            ) {
                Icon(
                    Icons.Default.Add,
                    contentDescription = "Add Customer"
                )
            }
        }
    ) { paddingValues ->
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
            title = "Customers",
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
                .background(DesignTokens.Colors.Background)
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
                // Header Section
                Column(
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Customers",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = DesignTokens.Typography.FontWeightBold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            Text(
                                text = "Manage your customer relationships and track activity",
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                        if (uiState.isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                strokeWidth = 2.dp
                            )
                        }
                    }
                }

                // Error message
                uiState.error?.let { errorMessage ->
                    Surface(
                        color = DesignTokens.Colors.ErrorLight,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(DesignTokens.Spacing.Space3),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = errorMessage,
                                color = DesignTokens.Colors.ErrorDark,
                                style = MaterialTheme.typography.bodyMedium,
                                modifier = Modifier.weight(1f)
                            )
                            IconButton(onClick = { viewModel.clearError() }) {
                                Icon(
                                    Icons.Default.Close,
                                    contentDescription = "Dismiss error",
                                    tint = DesignTokens.Colors.ErrorDark
                                )
                            }
                        }
                    }
                }

                // Stats Grid - Responsive (1/2/3 columns)
                StatsGrid(
                    stats = listOf(
                        StatData(
                            title = "TOTAL CUSTOMERS",
                            value = uiState.customers.size.toString(),
                            icon = {
                                Icon(
                                    Icons.Default.People,
                                    contentDescription = null,
                                    tint = DesignTokens.Colors.Primary
                                )
                            },
                            change = "+12%",
                            isPositive = true,
                            iconBackgroundColor = DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f),
                            iconTintColor = DesignTokens.Colors.Primary
                        ),
                        StatData(
                            title = "ACTIVE",
                            value = uiState.customers.count { it.status == CustomerStatus.ACTIVE }.toString(),
                            icon = {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = DesignTokens.Colors.Success
                                )
                            },
                            change = "+8%",
                            isPositive = true,
                            iconBackgroundColor = DesignTokens.Colors.SuccessLight,
                            iconTintColor = DesignTokens.Colors.Success
                        ),
                        StatData(
                            title = "TOTAL VALUE",
                            value = "$${uiState.customers.sumOf { it.value }.toInt() / 1000}K",
                            icon = {
                                Icon(
                                    Icons.Default.AttachMoney,
                                    contentDescription = null,
                                    tint = DesignTokens.Colors.Secondary
                                )
                            },
                            change = "+23%",
                            isPositive = true,
                            iconBackgroundColor = DesignTokens.Colors.SecondaryContainer,
                            iconTintColor = DesignTokens.Colors.Secondary
                        )
                    )
                )

                // Search Bar - Responsive
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = {
                        Text(
                            "Search customers...",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    },
                    leadingIcon = {
                        Icon(
                            Icons.Default.Search,
                            contentDescription = null,
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(
                                    Icons.Default.Clear,
                                    contentDescription = "Clear",
                                    tint = DesignTokens.Colors.OnSurfaceVariant
                                )
                            }
                        }
                    },
                    shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = DesignTokens.Colors.Surface,
                        unfocusedContainerColor = DesignTokens.Colors.Surface,
                        focusedBorderColor = DesignTokens.Colors.Primary,
                        unfocusedBorderColor = DesignTokens.Colors.Outline
                    )
                )

                // Customer List - Responsive
                if (uiState.isLoading && uiState.customers.isEmpty()) {
                    // Initial loading state
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            modifier = Modifier.padding(DesignTokens.Spacing.Space6),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                        ) {
                            CircularProgressIndicator()
                            Text(
                                text = "Loading customers...",
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                } else if (filteredCustomers.isEmpty()) {
                    EmptyState(
                        title = "No customers found",
                        message = "Try adjusting your search or add a new customer.",
                        icon = {
                            Icon(
                                Icons.Default.SearchOff,
                                contentDescription = null,
                                modifier = Modifier.size(DesignTokens.Heights.IconXl),
                                tint = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    )
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(
                            responsiveSpacing(
                                compact = DesignTokens.Spacing.Space3,
                                medium = DesignTokens.Spacing.Space4
                            )
                        )
                    ) {
                        items(filteredCustomers) { customer ->
                            ResponsiveCustomerCard(customer = customer)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ResponsiveCustomerCard(customer: Customer) {
    ResponsiveCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* Navigate to customer detail */ }
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            // Left: Customer Info
            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
            ) {
                // Avatar
                Surface(
                    modifier = Modifier.size(DesignTokens.Heights.AvatarMd),
                    shape = CircleShape,
                    color = DesignTokens.Colors.PrimaryContainer
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = customer.name.take(1).uppercase(),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = DesignTokens.Typography.FontWeightBold,
                            color = DesignTokens.Colors.Primary
                        )
                    }
                }

                // Info
                Column(
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space1)
                ) {
                    Text(
                        text = customer.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    Text(
                        text = customer.company,
                        style = MaterialTheme.typography.bodyMedium,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Text(
                        text = customer.email,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }

            // Right: Status and Value
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
            ) {
                val (text, color) = when (customer.status) {
                    CustomerStatus.ACTIVE -> "Active" to DesignTokens.Colors.Success
                    CustomerStatus.INACTIVE -> "Inactive" to DesignTokens.Colors.OnSurfaceVariant
                    CustomerStatus.PENDING -> "Pending" to DesignTokens.Colors.Warning
                }
                StatusBadge(text = text, color = color)
                Text(
                    text = NumberFormat.getCurrencyInstance(Locale.US).format(customer.value),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
            }
        }
    }
}

// Legacy CustomerCard for backward compatibility (if needed elsewhere)
@Composable
fun CustomerCard(customer: Customer) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* Navigate to detail */ },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = customer.name.first().uppercase(),
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Customer Info
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = customer.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    val (text, color) = when (customer.status) {
                        CustomerStatus.ACTIVE -> "Active" to DesignTokens.Colors.Success
                        CustomerStatus.INACTIVE -> "Inactive" to DesignTokens.Colors.OnSurfaceVariant
                        CustomerStatus.PENDING -> "Pending" to DesignTokens.Colors.Warning
                    }
                    StatusBadge(text = text, color = color)
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = customer.company,
                    style = MaterialTheme.typography.bodyMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Email,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = customer.email,
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }

                    Text(
                        text = NumberFormat.getCurrencyInstance(Locale.US).format(customer.value),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.Success
                    )
                }
            }

            Icon(
                Icons.Default.ChevronRight,
                contentDescription = "View details",
                tint = DesignTokens.Colors.OnSurfaceTertiary
            )
        }
    }
}

@Composable
fun StatCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    color: Color
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontSize = 12.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = color,
                fontSize = 24.sp
            )
        }
    }
}
