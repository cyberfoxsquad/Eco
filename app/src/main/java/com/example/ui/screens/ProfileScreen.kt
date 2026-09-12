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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.LocationCity
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.EcoAvatar
import com.example.ui.navigation.Screen
import com.example.ui.theme.EcoAmber
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoEmeraldDark
import com.example.ui.theme.EcoSky
import com.example.ui.viewmodel.EcoViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: EcoViewModel,
    onNavigate: (String) -> Unit
) {
    val user by viewModel.currentUser.collectAsState()

    var name by remember(user) { mutableStateOf(user?.name ?: "") }
    var phone by remember(user) { mutableStateOf(user?.phone ?: "") }
    var upiId by remember(user) { mutableStateOf(user?.upiId ?: "") }
    var ward by remember(user) { mutableStateOf(user?.ward ?: "Green Valley Ward 4") }
    var avatarId by remember(user) { mutableStateOf(user?.avatarId ?: "avatar_1") }
    var wardExpanded by remember { mutableStateOf(false) }
    var saveSuccess by remember { mutableStateOf(false) }

    val wardOptions = listOf(
        "Green Valley Ward 4",
        "Downtown Central Ward 7",
        "Riverside Colony Ward 12",
        "Silicon Heights Ward 15",
        "Municipal Control HQ"
    )

    val avatarOptions = listOf("avatar_1", "avatar_2", "avatar_3", "avatar_4", "avatar_admin")

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("profile_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column {
                Text(
                    text = "Profile & Account Settings",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 20.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Manage your citizen identity, UPI payout routing, and neighborhood ward selection.",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Profile Avatar Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    EcoAvatar(avatarId = avatarId, sizeDp = 72)

                    Text(
                        text = name.ifBlank { "Citizen" },
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp
                    )

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (user?.role == "admin") Color(0xFFF3E8FF) else Color(0xFFD1FAE5)
                    ) {
                        Text(
                            text = if (user?.role == "admin") "Municipal Administrator" else "Verified Citizen",
                            color = if (user?.role == "admin") Color(0xFF7C3AED) else Color(0xFF047857),
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }

                    // Avatar selector options
                    Text(
                        text = "Choose Profile Avatar",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        avatarOptions.forEach { opt ->
                            Box(
                                modifier = Modifier
                                    .clickable { avatarId = opt }
                                    .then(
                                        if (avatarId == opt) Modifier.border(2.dp, EcoEmerald, CircleShape)
                                        else Modifier
                                    )
                                    .padding(2.dp)
                            ) {
                                EcoAvatar(avatarId = opt, sizeDp = 36)
                            }
                        }
                    }
                }
            }
        }

        // Firebase Cloud Firestore & Auth Status
        item {
            Surface(
                color = Color(0xFFF0FDF4),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBBF7D0)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFDCFCE7)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CloudDone,
                            contentDescription = null,
                            tint = EcoEmeraldDark,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Cloud Firestore Persistence Active",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = EcoEmeraldDark
                        )
                        Text(
                            text = "Cloud UID: ${user?.id ?: "N/A"} • Points: ${user?.pointsBalance ?: 0} pts",
                            fontSize = 11.sp,
                            color = Color(0xFF166534)
                        )
                    }
                }
            }
        }

        // Profile Edit Form
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("Account Details", fontWeight = FontWeight.Bold, fontSize = 15.sp)

                    OutlinedTextField(
                        value = name,
                        onValueChange = {
                            name = it
                            saveSuccess = false
                        },
                        label = { Text("Full Name") },
                        leadingIcon = { Icon(Icons.Default.AccountCircle, contentDescription = null) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("profile_name_input"),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = phone,
                        onValueChange = {
                            phone = it
                            saveSuccess = false
                        },
                        label = { Text("Phone Number") },
                        leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("profile_phone_input"),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = upiId,
                        onValueChange = {
                            upiId = it
                            saveSuccess = false
                        },
                        label = { Text("UPI ID for Payout Processing") },
                        leadingIcon = { Icon(Icons.Default.QrCode, contentDescription = null) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("profile_upi_input"),
                        singleLine = true,
                        supportingText = { Text("Cashouts are wired directly to this UPI address") }
                    )

                    // Ward Dropdown
                    ExposedDropdownMenuBox(
                        expanded = wardExpanded,
                        onExpandedChange = { wardExpanded = !wardExpanded }
                    ) {
                        OutlinedTextField(
                            value = ward,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Neighborhood / Ward") },
                            leadingIcon = { Icon(Icons.Default.LocationCity, contentDescription = null) },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = wardExpanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor()
                                .testTag("profile_ward_dropdown")
                        )
                        ExposedDropdownMenu(
                            expanded = wardExpanded,
                            onDismissRequest = { wardExpanded = false }
                        ) {
                            wardOptions.forEach { opt ->
                                DropdownMenuItem(
                                    text = { Text(opt, fontSize = 13.sp) },
                                    onClick = {
                                        ward = opt
                                        wardExpanded = false
                                        saveSuccess = false
                                    }
                                )
                            }
                        }
                    }

                    if (saveSuccess) {
                        Surface(
                            color = Color(0xFFDCFCE7),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = EcoEmeraldDark, modifier = Modifier.size(16.dp))
                                Text("Profile details saved successfully!", color = EcoEmeraldDark, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }

                    Button(
                        onClick = {
                            viewModel.updateProfile(name, phone, upiId, ward, avatarId)
                            saveSuccess = true
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("save_profile_button"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EcoEmerald)
                    ) {
                        Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Save Changes", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Account Switch & Logout
        item {
            OutlinedButton(
                onClick = {
                    viewModel.logout()
                    onNavigate(Screen.Auth.route)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("sign_out_button"),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.ExitToApp, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Switch Account or Sign Out", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}
