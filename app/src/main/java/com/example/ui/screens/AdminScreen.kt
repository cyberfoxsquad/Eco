package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CurrencyRupee
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Park
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Recycling
import androidx.compose.material.icons.filled.ReportProblem
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Toll
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.DisposalLogEntity
import com.example.data.model.WalletTransactionEntity
import com.example.ui.components.EcoAvatar
import com.example.ui.components.StatusBadge
import com.example.ui.theme.EcoAmber
import com.example.ui.theme.EcoBioGreen
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoEmeraldDark
import com.example.ui.theme.EcoHazardRed
import com.example.ui.theme.EcoRecycleBlue
import com.example.ui.theme.EcoSky
import com.example.ui.viewmodel.EcoViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun AdminScreen(
    viewModel: EcoViewModel,
    onNavigateToForbidden: () -> Unit
) {
    val currentUser by viewModel.currentUser.collectAsState()

    // Strict Role Checking: role === 'admin'
    if (currentUser?.role != "admin") {
        onNavigateToForbidden()
        return
    }

    val totalWasteKg by viewModel.totalWasteKg.collectAsState()
    val bioWasteKg by viewModel.biodegradableWasteKg.collectAsState()
    val nonBioWasteKg by viewModel.nonBiodegradableWasteKg.collectAsState()
    val pointsMinted by viewModel.totalPointsMinted.collectAsState()
    val activeCitizens by viewModel.activeCitizenCount.collectAsState()
    val pendingPayouts by viewModel.pendingCashoutSum.collectAsState()
    val settledPayouts by viewModel.settledCashoutSum.collectAsState()

    val allDisposals by viewModel.allDisposalsStream.collectAsState()
    val allTransactions by viewModel.allTransactions.collectAsState()
    val allTimeUsers by viewModel.allTimeLeaderboard.collectAsState()

    var selectedTab by remember { mutableStateOf(0) } // 0: Overview & Payouts, 1: Submissions & Flags, 2: Contributor Tracker
    var flagDialogLog by remember { mutableStateOf<DisposalLogEntity?>(null) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("admin_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Admin Header with Role Badge
        item {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF7C3AED)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Shield, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                        }
                        Column {
                            Text(
                                text = "Municipal Admin Dashboard",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 18.sp
                            )
                            Text(
                                text = "Role-Protected Management Console",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    Surface(
                        color = Color(0xFFF3E8FF),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "OFFICIAL ADMIN",
                            color = Color(0xFF7C3AED),
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
        }

        // Key Metrics Summary Cards Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    AdminMetricCard(
                        title = "Total Waste Diverted",
                        value = "${String.format("%.1f", totalWasteKg ?: 0.0)} kg",
                        sub = "Bio: ${String.format("%.1f", bioWasteKg ?: 0.0)} kg | Dry: ${String.format("%.1f", nonBioWasteKg ?: 0.0)} kg",
                        icon = Icons.Default.DeleteSweep,
                        color = EcoEmerald,
                        modifier = Modifier.weight(1f)
                    )
                    AdminMetricCard(
                        title = "Active Citizens",
                        value = "${activeCitizens ?: 4}",
                        sub = "Ward segregation participation",
                        icon = Icons.Default.Group,
                        color = EcoSky,
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    AdminMetricCard(
                        title = "Points Minted",
                        value = "${pointsMinted ?: 0} pts",
                        sub = "₹${String.format("%.2f", (pointsMinted ?: 0) * 0.10)} INR liability",
                        icon = Icons.Default.Toll,
                        color = EcoAmber,
                        modifier = Modifier.weight(1f)
                    )
                    AdminMetricCard(
                        title = "Cash Outflow Status",
                        value = "₹${String.format("%.0f", pendingPayouts ?: 0.0)} Pending",
                        sub = "₹${String.format("%.0f", settledPayouts ?: 0.0)} Settled",
                        icon = Icons.Default.Payments,
                        color = Color(0xFF7C3AED),
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Section Tabs
        item {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.primary
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Payout Approvals", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Disposal Stream", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = { Text("High-Volume Audit", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
                )
            }
        }

        // Tab Content 0: Payout Management (Pending & Settled)
        if (selectedTab == 0) {
            val pendingList = allTransactions.filter { it.status == "Pending" }
            val settledList = allTransactions.filter { it.status != "Pending" }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Pending Cashout Requests (${pendingList.size})",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                }
            }

            if (pendingList.isEmpty()) {
                item {
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "No pending payouts requiring authorization. All cleared! ✓",
                            fontSize = 12.sp,
                            modifier = Modifier.padding(16.dp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                items(pendingList) { txn ->
                    AdminPendingPayoutCard(
                        txn = txn,
                        onApprove = { viewModel.adminApprovePayout(txn.id) },
                        onReject = { viewModel.adminRejectPayout(txn.id, "Discrepancy in verification") }
                    )
                }
            }

            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Recent Settled Payouts",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }

            items(settledList.take(5)) { txn ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(txn.userName, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                            Text("₹${String.format("%.2f", txn.amountInr)} • ${txn.payoutMethod} (${txn.payoutDestination})", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        StatusBadge(status = txn.status)
                    }
                }
            }
        }

        // Tab Content 1: Real-time Disposal Stream & Flag Controls
        if (selectedTab == 1) {
            item {
                Text(
                    text = "Live Stream of Citizen Submissions",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }

            items(allDisposals) { log ->
                AdminDisposalReviewCard(
                    log = log,
                    onApprove = { viewModel.adminApproveDisposal(log.id) },
                    onFlag = { flagDialogLog = log }
                )
            }
        }

        // Tab Content 2: High-Volume Contributor Tracker & Anomaly Audit
        if (selectedTab == 2) {
            item {
                Text(
                    text = "High-Volume Contributors & Anomaly Monitoring",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }

            items(allTimeUsers.filter { it.role == "user" }) { u ->
                val isAnomalous = u.totalKgDisposed > 50.0
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isAnomalous) Color(0xFFFEF2F2) else MaterialTheme.colorScheme.surface
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            EcoAvatar(avatarId = u.avatarId, sizeDp = 40)
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(u.name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    if (isAnomalous) {
                                        Surface(color = Color(0xFFFEE2E2), shape = RoundedCornerShape(6.dp)) {
                                            Text(
                                                text = "High Volume",
                                                color = EcoHazardRed,
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                }
                                Text(u.ward, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text("Contact: ${u.phone} • ${u.upiId}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${String.format("%.1f", u.totalKgDisposed)} kg",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 15.sp,
                                color = if (isAnomalous) EcoHazardRed else EcoEmerald
                            )
                            Text(
                                text = "${u.pointsBalance} pts",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = EcoAmber
                            )
                        }
                    }
                }
            }
        }
    }

    // Flag Suspicious Disposal Dialog
    if (flagDialogLog != null) {
        val log = flagDialogLog!!
        var reason by remember { mutableStateOf("Repetitive image or abnormal weight spike") }

        AlertDialog(
            onDismissRequest = { flagDialogLog = null },
            title = {
                Text("Flag Disposal Submission", fontWeight = FontWeight.Bold)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        "Flag submission by ${log.userName} (${log.weightKg} kg of ${log.subCategory}):",
                        fontSize = 12.sp
                    )
                    listOf(
                        "Repetitive image or abnormal weight spike",
                        "Incorrect segregation (plastic mixed in wet waste)",
                        "Unauthorized disposal outside bin point",
                        "Blurry / unverified photo proof"
                    ).forEach { r ->
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (reason == r) Color(0xFFFEE2E2) else MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { reason = r }
                        ) {
                            Text(
                                text = r,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (reason == r) EcoHazardRed else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.adminFlagDisposal(log.id, reason)
                        flagDialogLog = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EcoHazardRed)
                ) {
                    Text("Apply Flag")
                }
            },
            dismissButton = {
                TextButton(onClick = { flagDialogLog = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun AdminMetricCard(
    title: String,
    value: String,
    sub: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(30.dp)
                    .clip(CircleShape)
                    .background(color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
            }
            Text(title, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
            Text(value, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text(sub, fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
        }
    }
}

@Composable
fun AdminPendingPayoutCard(
    txn: WalletTransactionEntity,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("admin_pending_payout_${txn.id}"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(txn.userName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(
                        "${txn.payoutMethod}: ${txn.payoutDestination}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        "₹${String.format("%.2f", txn.amountInr)}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 16.sp,
                        color = EcoEmeraldDark
                    )
                    Text("${txn.pointsDebited} pts debited", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onReject,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Block, contentDescription = null, tint = EcoHazardRed, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Reject & Refund", color = EcoHazardRed, fontSize = 11.sp)
                }

                Button(
                    onClick = onApprove,
                    modifier = Modifier.weight(1.5f),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EcoEmerald)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Approve / Mark Paid", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun AdminDisposalReviewCard(
    log: DisposalLogEntity,
    onApprove: () -> Unit,
    onFlag: () -> Unit
) {
    val isFlagged = log.status == "Flagged"

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("admin_disposal_row_${log.id}"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isFlagged) Color(0xFFFEF2F2) else MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    EcoAvatar(avatarId = log.userAvatarId, sizeDp = 32)
                    Column {
                        Text(log.userName, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("${log.category} • ${log.subCategory}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                StatusBadge(status = log.status)
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Weight: ${log.weightKg} kg • +${log.pointsAwarded} pts", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                Text(log.binLocation.substringBefore("-").trim(), fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

            if (log.flagReason != null) {
                Surface(
                    color = Color(0xFFFEE2E2),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = EcoHazardRed, modifier = Modifier.size(14.dp))
                        Text(
                            text = "Flag: ${log.flagReason}",
                            color = EcoHazardRed,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (log.status != "Flagged") {
                    TextButton(onClick = onFlag) {
                        Icon(Icons.Default.Flag, contentDescription = null, tint = EcoHazardRed, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Flag as Suspicious", color = EcoHazardRed, fontSize = 11.sp)
                    }
                }
                if (log.status != "Verified") {
                    Button(
                        onClick = onApprove,
                        colors = ButtonDefaults.buttonColors(containerColor = EcoEmerald),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Verify & Approve", fontSize = 11.sp)
                    }
                }
            }
        }
    }
}
