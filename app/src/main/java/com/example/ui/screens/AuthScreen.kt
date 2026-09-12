package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Eco
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationCity
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.EcoAmber
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoEmeraldDark
import com.example.ui.viewmodel.EcoViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthScreen(
    viewModel: EcoViewModel,
    onNavigateHome: () -> Unit
) {
    // 0 = Sign In, 1 = Register
    var selectedTab by remember { mutableIntStateOf(0) }
    var selectedRole by remember { mutableStateOf("user") } // "user" or "admin"

    // Inputs
    var nameInput by remember { mutableStateOf("") }
    var emailInput by remember { mutableStateOf("") }
    var passwordInput by remember { mutableStateOf("••••••••") }
    var selectedWard by remember { mutableStateOf("Green Valley Ward 4") }
    var wardDropdownExpanded by remember { mutableStateOf(false) }

    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    var isGoogleSigningIn by remember { mutableStateOf(false) }

    val wardOptions = listOf(
        "Green Valley Ward 4",
        "Downtown Central Ward 7",
        "Riverside Colony Ward 12",
        "Silicon Heights Ward 15",
        "Hilltop Sector Ward 9"
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("auth_screen"),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // App Branding Header
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Box(
                modifier = Modifier
                    .size(68.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(
                        Brush.linearGradient(listOf(EcoEmeraldDark, EcoEmerald))
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Eco,
                    contentDescription = "EcoCollect Logo",
                    tint = Color.White,
                    modifier = Modifier.size(42.dp)
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = "EcoCollect",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 26.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Smart Communal Waste Segregation & Rewards",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(4.dp))
            Surface(
                color = Color(0xFFDCFCE7),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Stars,
                        contentDescription = null,
                        tint = EcoEmeraldDark,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "1 kg Segregated Waste = 100 Points",
                        color = EcoEmeraldDark,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Auth Tabs: Login vs Register
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Google Sign-In with Firebase Auth button
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color.White,
                        border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFFCBD5E1)),
                        shadowElevation = 1.dp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .clickable(enabled = !isGoogleSigningIn) {
                                isGoogleSigningIn = true
                                errorMessage = null
                                viewModel.signInWithGoogle { success, error ->
                                    isGoogleSigningIn = false
                                    if (success) {
                                        onNavigateHome()
                                    } else {
                                        errorMessage = error ?: "Google Sign-In failed"
                                    }
                                }
                            }
                            .testTag("google_sign_in_button")
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            if (isGoogleSigningIn) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    strokeWidth = 2.dp,
                                    color = EcoEmerald
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Connecting to Google & Firebase...",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFF334155)
                                )
                            } else {
                                Surface(
                                    shape = CircleShape,
                                    color = Color(0xFFF8FAFC),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0)),
                                    modifier = Modifier.size(26.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            text = "G",
                                            fontWeight = FontWeight.Black,
                                            fontSize = 15.sp,
                                            color = Color(0xFF4285F4)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Sign in with Google",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = Color(0xFF1E293B)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Surface(
                                    color = Color(0xFFFEF3C7),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = "Firebase Auth",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF92400E),
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    }

                    // Divider: OR
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0))
                        Text(
                            text = "OR SIGN IN WITH CREDENTIALS",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF94A3B8),
                            letterSpacing = 0.5.sp
                        )
                        HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0))
                    }

                    // Segmented Tabs: Sign In vs Register
                    TabRow(
                        selectedTabIndex = selectedTab,
                        containerColor = Color(0xFFF1F5F9),
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .padding(3.dp),
                        indicator = { tabPositions ->
                            TabRowDefaults.SecondaryIndicator(
                                Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                                color = EcoEmerald,
                                height = 3.dp
                            )
                        },
                        divider = {}
                    ) {
                        Tab(
                            selected = selectedTab == 0,
                            onClick = {
                                selectedTab = 0
                                errorMessage = null
                            },
                            text = {
                                Text(
                                    "Sign In",
                                    fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 14.sp
                                )
                            },
                            modifier = Modifier.testTag("tab_sign_in")
                        )
                        Tab(
                            selected = selectedTab == 1,
                            onClick = {
                                selectedTab = 1
                                errorMessage = null
                            },
                            text = {
                                Text(
                                    "Register (New)",
                                    fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 14.sp
                                )
                            },
                            modifier = Modifier.testTag("tab_register")
                        )
                    }

                    // Role selector chips (Citizen vs Admin)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        FilterChip(
                            selected = selectedRole == "user",
                            onClick = {
                                selectedRole = "user"
                                if (selectedTab == 0 && emailInput.isBlank() && nameInput.isBlank()) {
                                    emailInput = "priya.sharma@example.com"
                                }
                            },
                            label = { Text("Citizen Account") },
                            leadingIcon = {
                                Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(16.dp))
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFFDCFCE7),
                                selectedLabelColor = EcoEmeraldDark
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("role_user_chip")
                        )

                        FilterChip(
                            selected = selectedRole == "admin",
                            onClick = {
                                selectedRole = "admin"
                                if (selectedTab == 0) {
                                    emailInput = "admin@ecocollect.org"
                                    nameInput = "Officer Marcus Vance"
                                }
                            },
                            label = { Text("Municipal Admin") },
                            leadingIcon = {
                                Icon(Icons.Default.Shield, contentDescription = null, modifier = Modifier.size(16.dp))
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFFF3E8FF),
                                selectedLabelColor = Color(0xFF7C3AED)
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("role_admin_chip")
                        )
                    }

                    // Explanatory Banner per Tab
                    if (selectedTab == 0) {
                        Surface(
                            color = Color(0xFFF8FAFC),
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Info,
                                    contentDescription = null,
                                    tint = EcoEmerald,
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = "Log in using either your Name or your Email Address (or both).",
                                    fontSize = 12.sp,
                                    color = Color(0xFF334155)
                                )
                            }
                        }
                    } else {
                        // Register Info Banner
                        Surface(
                            color = Color(0xFFDCFCE7).copy(alpha = 0.6f),
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF86EFAC)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(10.dp),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Stars,
                                        contentDescription = null,
                                        tint = EcoEmeraldDark,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = "New User Registration Guarantee",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = EcoEmeraldDark
                                    )
                                }
                                Text(
                                    text = "• Starting Balance: Strictly 0 Points\n• Disposal Earnings: 1 kg = 100 Points added automatically",
                                    fontSize = 11.sp,
                                    color = Color(0xFF065F46)
                                )
                            }
                        }
                    }

                    // Input: Full Name
                    OutlinedTextField(
                        value = nameInput,
                        onValueChange = {
                            nameInput = it
                            errorMessage = null
                        },
                        label = {
                            Text(
                                if (selectedTab == 1) "Full Name *"
                                else "Full Name (or leave blank if using Email)"
                            )
                        },
                        placeholder = { Text("e.g. Priya Sharma or Rahul Kumar") },
                        leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("auth_name_input"),
                        singleLine = true
                    )

                    // Input: Email Address
                    OutlinedTextField(
                        value = emailInput,
                        onValueChange = {
                            emailInput = it
                            errorMessage = null
                        },
                        label = {
                            Text(
                                if (selectedTab == 1) "Email Address *"
                                else "Email Address (or leave blank if using Name)"
                            )
                        },
                        placeholder = { Text("e.g. priya.sharma@example.com") },
                        leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("auth_email_input"),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )

                    // Input: Password
                    OutlinedTextField(
                        value = passwordInput,
                        onValueChange = {
                            passwordInput = it
                            errorMessage = null
                        },
                        label = { Text("Password") },
                        leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("auth_password_input"),
                        singleLine = true
                    )

                    // Input: Neighborhood / Ward (shown on Register)
                    if (selectedTab == 1) {
                        ExposedDropdownMenuBox(
                            expanded = wardDropdownExpanded,
                            onExpandedChange = { wardDropdownExpanded = !wardDropdownExpanded }
                        ) {
                            OutlinedTextField(
                                value = selectedWard,
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Neighborhood / Ward") },
                                leadingIcon = { Icon(Icons.Default.LocationCity, contentDescription = null) },
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = wardDropdownExpanded) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor()
                                    .testTag("auth_ward_dropdown")
                            )
                            ExposedDropdownMenu(
                                expanded = wardDropdownExpanded,
                                onDismissRequest = { wardDropdownExpanded = false }
                            ) {
                                wardOptions.forEach { ward ->
                                    DropdownMenuItem(
                                        text = { Text(ward) },
                                        onClick = {
                                            selectedWard = ward
                                            wardDropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    // Error or Status Banner
                    if (errorMessage != null) {
                        Surface(
                            color = Color(0xFFFEF2F2),
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFCA5A5)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = errorMessage ?: "",
                                color = Color(0xFF991B1B),
                                fontSize = 12.sp,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }

                    // Action Button: Sign In or Register
                    Button(
                        onClick = {
                            val trimmedName = nameInput.trim()
                            val trimmedEmail = emailInput.trim()

                            if (selectedTab == 0) {
                                // Login: User can use Name OR Email
                                if (trimmedName.isBlank() && trimmedEmail.isBlank()) {
                                    errorMessage = "Please enter either your Name or your Email to sign in."
                                    return@Button
                                }
                                viewModel.login(
                                    email = trimmedEmail,
                                    role = selectedRole,
                                    name = if (trimmedName.isNotBlank()) trimmedName else "Eco Citizen",
                                    ward = selectedWard,
                                    onComplete = {
                                        onNavigateHome()
                                    }
                                )
                            } else {
                                // Register: Require at least Name or Email
                                if (trimmedName.isBlank() && trimmedEmail.isBlank()) {
                                    errorMessage = "Please provide your Name and Email to register."
                                    return@Button
                                }
                                viewModel.register(
                                    name = if (trimmedName.isNotBlank()) trimmedName else "Eco Citizen",
                                    email = if (trimmedEmail.isNotBlank()) trimmedEmail else "${trimmedName.lowercase().replace(" ", ".")}@example.com",
                                    role = selectedRole,
                                    ward = selectedWard,
                                    onComplete = {
                                        onNavigateHome()
                                    }
                                )
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .testTag("auth_submit_button"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedRole == "admin") Color(0xFF7C3AED) else EcoEmerald
                        )
                    ) {
                        Icon(
                            imageVector = if (selectedTab == 1) Icons.Default.PersonAdd else Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (selectedTab == 1) "Register & Start (0 Points)"
                            else "Sign In as ${if (selectedRole == "admin") "Municipal Admin" else "Citizen"}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }

                    // Toggle bottom text
                    Text(
                        text = if (selectedTab == 1) "Already have an account? Sign In" else "New to EcoCollect? Register here",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier
                            .align(Alignment.CenterHorizontally)
                            .clickable {
                                selectedTab = if (selectedTab == 0) 1 else 0
                                errorMessage = null
                            }
                            .padding(vertical = 4.dp)
                    )
                }
            }
        }

        // Municipal Admin Quick Switch for evaluation/testing
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "Municipal Officer Portal Access",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFFF3E8FF),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                viewModel.switchUser("admin_municipal_1")
                                onNavigateHome()
                            }
                            .testTag("quick_login_admin")
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF7C3AED)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Shield,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Log In as Officer Marcus Vance (Municipal Admin)",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = Color(0xFF7C3AED)
                                )
                                Text(
                                    text = "Inspect municipal analytics, verify citizen disposals & approve cashouts",
                                    fontSize = 11.sp,
                                    color = Color(0xFF5B21B6)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
