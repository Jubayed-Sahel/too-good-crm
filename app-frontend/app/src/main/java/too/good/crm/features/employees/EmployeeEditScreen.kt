package too.good.crm.features.employees

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeEditScreen(
    employeeId: String,
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    
    val viewModel = remember { EmployeeViewModel(context) }
    val uiState by viewModel.uiState.collectAsState()
    
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    
    // Form state
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var jobTitle by remember { mutableStateOf("") }
    var department by remember { mutableStateOf("") }
    var employmentType by remember { mutableStateOf("full-time") }
    var status by remember { mutableStateOf("active") }
    var hireDate by remember { mutableStateOf("") }
    var emergencyContact by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }
    var zipCode by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("") }
    
    // Load profiles
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }
    
    // Load employee details
    LaunchedEffect(employeeId) {
        viewModel.loadEmployee(employeeId.toInt())
    }
    
    // Populate form when employee loads
    LaunchedEffect(uiState.selectedEmployee) {
        uiState.selectedEmployee?.let { employee ->
            firstName = employee.firstName
            lastName = employee.lastName
            email = employee.email
            phone = employee.phone ?: ""
            jobTitle = employee.jobTitle ?: ""
            department = employee.department ?: ""
            employmentType = employee.employmentType
            status = employee.status
            hireDate = employee.hireDate ?: ""
            emergencyContact = employee.emergencyContact ?: ""
            address = employee.address ?: ""
            city = employee.city ?: ""
            state = employee.state ?: ""
            zipCode = employee.zipCode ?: employee.postalCode ?: ""
            country = employee.country ?: ""
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
        title = "Edit Employee",
        activeMode = activeMode,
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
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
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(defaultResponsivePadding())
        ) {
            // Personal Information Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(getResponsiveCornerRadius()),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = getResponsiveElevation())
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(defaultResponsivePadding())
                ) {
                    Text(
                        text = "Personal Information",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        fontSize = getResponsiveBodySize()
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

                    OutlinedTextField(
                        value = firstName,
                        onValueChange = { firstName = it },
                        label = { Text("First Name *", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    OutlinedTextField(
                        value = lastName,
                        onValueChange = { lastName = it },
                        label = { Text("Last Name *", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email *", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    OutlinedTextField(
                        value = emergencyContact,
                        onValueChange = { emergencyContact = it },
                        label = { Text("Emergency Contact", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                }
            }

            Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

            // Employment Details Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(getResponsiveCornerRadius()),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = getResponsiveElevation())
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(defaultResponsivePadding())
                ) {
                    Text(
                        text = "Employment Details",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        fontSize = getResponsiveBodySize()
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

                    OutlinedTextField(
                        value = jobTitle,
                        onValueChange = { jobTitle = it },
                        label = { Text("Job Title", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    OutlinedTextField(
                        value = department,
                        onValueChange = { department = it },
                        label = { Text("Department", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    // Employment Type Dropdown
                    var employmentTypeExpanded by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = employmentTypeExpanded,
                        onExpandedChange = { employmentTypeExpanded = !employmentTypeExpanded }
                    ) {
                        OutlinedTextField(
                            value = employmentType.replaceFirstChar { it.uppercase() },
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Employment Type", fontSize = getResponsiveBodySize()) },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = employmentTypeExpanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(),
                            shape = RoundedCornerShape(getResponsiveCornerRadius())
                        )
                        ExposedDropdownMenu(
                            expanded = employmentTypeExpanded,
                            onDismissRequest = { employmentTypeExpanded = false }
                        ) {
                            listOf("full-time", "part-time", "contract", "intern").forEach { type ->
                                DropdownMenuItem(
                                    text = { Text(type.replaceFirstChar { it.uppercase() }) },
                                    onClick = {
                                        employmentType = type
                                        employmentTypeExpanded = false
                                    }
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    // Status Dropdown
                    var statusExpanded by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = statusExpanded,
                        onExpandedChange = { statusExpanded = !statusExpanded }
                    ) {
                        OutlinedTextField(
                            value = status.replaceFirstChar { it.uppercase() },
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Status", fontSize = getResponsiveBodySize()) },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = statusExpanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(),
                            shape = RoundedCornerShape(getResponsiveCornerRadius())
                        )
                        ExposedDropdownMenu(
                            expanded = statusExpanded,
                            onDismissRequest = { statusExpanded = false }
                        ) {
                            listOf("active", "inactive", "on-leave", "terminated").forEach { statusOption ->
                                DropdownMenuItem(
                                    text = { Text(statusOption.replaceFirstChar { it.uppercase() }) },
                                    onClick = {
                                        status = statusOption
                                        statusExpanded = false
                                    }
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    OutlinedTextField(
                        value = hireDate,
                        onValueChange = { hireDate = it },
                        label = { Text("Hire Date (YYYY-MM-DD)", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius()),
                        placeholder = { Text("2024-01-15", fontSize = getResponsiveBodySize()) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

            // Address Information Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(getResponsiveCornerRadius()),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = getResponsiveElevation())
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(defaultResponsivePadding())
                ) {
                    Text(
                        text = "Address Information",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        fontSize = getResponsiveBodySize()
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Street Address", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    OutlinedTextField(
                        value = city,
                        onValueChange = { city = it },
                        label = { Text("City", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    OutlinedTextField(
                        value = state,
                        onValueChange = { state = it },
                        label = { Text("State", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    OutlinedTextField(
                        value = zipCode,
                        onValueChange = { zipCode = it },
                        label = { Text("Zip Code", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                    OutlinedTextField(
                        value = country,
                        onValueChange = { country = it },
                        label = { Text("Country", fontSize = getResponsiveBodySize()) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(getResponsiveCornerRadius())
                    )
                }
            }

            Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(defaultResponsiveSpacing() / 2)
            ) {
                OutlinedButton(
                    onClick = onBack,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Cancel", fontSize = getResponsiveBodySize())
                }
                
                Button(
                    onClick = {
                        viewModel.updateEmployee(
                            id = employeeId.toInt(),
                            firstName = firstName.ifBlank { null },
                            lastName = lastName.ifBlank { null },
                            email = email.ifBlank { null },
                            phone = phone.ifBlank { null },
                            jobTitle = jobTitle.ifBlank { null },
                            department = department.ifBlank { null },
                            employmentType = employmentType,
                            status = status,
                            hireDate = hireDate.ifBlank { null },
                            emergencyContact = emergencyContact.ifBlank { null },
                            address = address.ifBlank { null },
                            city = city.ifBlank { null },
                            state = state.ifBlank { null },
                            zipCode = zipCode.ifBlank { null },
                            country = country.ifBlank { null },
                            onSuccess = {
                                onBack()
                            },
                            onError = { error ->
                                // Error is handled in viewModel
                            }
                        )
                    },
                    modifier = Modifier.weight(1f),
                    enabled = firstName.isNotBlank() && lastName.isNotBlank() && email.isNotBlank() && !uiState.isLoading
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(getResponsiveIconSize()),
                            color = Color.White
                        )
                    } else {
                        Icon(Icons.Default.Save, contentDescription = null)
                        Spacer(modifier = Modifier.width(defaultResponsiveSpacing() / 4))
                        Text("Save", fontSize = getResponsiveBodySize())
                    }
                }
            }
        }
    }
}
