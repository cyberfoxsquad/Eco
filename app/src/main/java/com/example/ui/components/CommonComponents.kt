package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Eco
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.UserEntity
import com.example.ui.theme.EcoAmber
import com.example.ui.theme.EcoBioGreen
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoHazardRed
import com.example.ui.theme.EcoRecycleBlue
import com.example.ui.theme.EcoSky

@Composable
fun EcoAvatar(
    avatarId: String,
    modifier: Modifier = Modifier,
    sizeDp: Int = 40
) {
    val (bgColor, iconVector) = when (avatarId) {
        "avatar_admin" -> Pair(Color(0xFF7C3AED), Icons.Default.AdminPanelSettings)
        "avatar_2" -> Pair(EcoSky, Icons.Default.Person)
        "avatar_3" -> Pair(EcoAmber, Icons.Default.Person)
        "avatar_4" -> Pair(Color(0xFF8B5CF6), Icons.Default.Person)
        else -> Pair(EcoEmerald, Icons.Default.Person)
    }

    Box(
        modifier = modifier
            .size(sizeDp.dp)
            .clip(CircleShape)
            .background(bgColor),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = iconVector,
            contentDescription = "User Avatar",
            tint = Color.White,
            modifier = Modifier.size((sizeDp * 0.6).dp)
        )
    }
}

@Composable
fun RoleBadge(
    role: String,
    onSwitchRoleClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val isAdmin = role == "admin"
    val bg = if (isAdmin) Color(0xFFF3E8FF) else Color(0xFFD1FAE5)
    val textCol = if (isAdmin) Color(0xFF7C3AED) else Color(0xFF047857)
    val label = if (isAdmin) "Municipal Admin" else "Citizen"

    Surface(
        shape = RoundedCornerShape(16.dp),
        color = bg,
        modifier = modifier
            .then(
                if (onSwitchRoleClick != null) Modifier.clickable { onSwitchRoleClick() }
                else Modifier
            )
            .testTag("role_badge")
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(
                imageVector = if (isAdmin) Icons.Default.Shield else Icons.Default.Eco,
                contentDescription = null,
                tint = textCol,
                modifier = Modifier.size(14.dp)
            )
            Text(
                text = label,
                color = textCol,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp
            )
            if (onSwitchRoleClick != null) {
                Icon(
                    imageVector = Icons.Default.SwapHoriz,
                    contentDescription = "Switch Account",
                    tint = textCol,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
    }
}

@Composable
fun AccountSwitcherDialog(
    currentUser: UserEntity?,
    onDismiss: () -> Unit,
    onSelectUser: (String) -> Unit
) {
    var selectedId by remember { mutableStateOf(currentUser?.id ?: "user_citizen_1") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Switch Active Profile", fontWeight = FontWeight.Bold)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    "Test Citizen workflows (scanning, disposal, wallet) or Municipal Admin controls (approvals, flags, analytics):",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(4.dp))

                val accounts = mutableListOf<Triple<String, String, String>>()
                if (currentUser != null && currentUser.role == "user") {
                    accounts.add(Triple(currentUser.id, "${currentUser.name} (Active Citizen Profile)", "${currentUser.ward} • ${currentUser.pointsBalance} pts"))
                }
                accounts.add(Triple("admin_municipal_1", "Officer Marcus Vance (Municipal Admin)", "Municipal Control HQ • Full Control"))

                accounts.forEach { (id, name, desc) ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedId = id },
                        colors = CardDefaults.cardColors(
                            containerColor = if (selectedId == id) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                            else MaterialTheme.colorScheme.surface
                        ),
                        border = CardDefaults.outlinedCardBorder()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = selectedId == id,
                                onClick = { selectedId = id }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(name, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                Text(desc, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    onSelectUser(selectedId)
                    onDismiss()
                }
            ) {
                Text("Switch Active Profile", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun StatusBadge(status: String) {
    val (bg, fg, icon) = when (status) {
        "Verified", "Approved", "Transferred" -> Triple(
            Color(0xFFD1FAE5),
            Color(0xFF047857),
            Icons.Default.CheckCircle
        )
        "Flagged", "Rejected" -> Triple(
            Color(0xFFFEE2E2),
            EcoHazardRed,
            Icons.Default.Warning
        )
        else -> Triple(
            Color(0xFFFEF3C7),
            EcoAmber,
            Icons.Default.Warning
        )
    }

    Surface(
        color = bg,
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(icon, contentDescription = null, tint = fg, modifier = Modifier.size(12.dp))
            Text(status, color = fg, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}
