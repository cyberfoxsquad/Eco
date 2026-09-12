package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CurrencyRupee
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Recycling
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.WalletTransactionEntity
import com.example.ui.components.StatusBadge
import com.example.ui.theme.EcoAmber
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoEmeraldDark
import com.example.ui.theme.EcoSky
import com.example.ui.viewmodel.EcoViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class CashRedemptionMilestone(
    val tierName: String,
    val pointsRequired: Int,
    val cashAmountInr: Double,
    val description: String
)

val REDEMPTION_MILESTONES = listOf(
    CashRedemptionMilestone("Starter Micro-Payout", 250, 25.0, "2.5 kg waste segregated"),
    CashRedemptionMilestone("Standard Municipal Cashout", 500, 50.0, "5.0 kg waste segregated"),
    CashRedemptionMilestone("Silver Citizen Tier", 1000, 100.0, "10.0 kg waste segregated"),
    CashRedemptionMilestone("Gold Champion Tier", 2500, 250.0, "25.0 kg waste segregated")
)

@Composable
fun WalletScreen(
    viewModel: EcoViewModel
) {
    val user by viewModel.currentUser.collectAsState()
    val transactions by viewModel.userTransactions.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    val userPoints = user?.pointsBalance ?: 0
    val totalKg = user?.totalKgDisposed ?: 0.0
    val cashValueInr = userPoints * 0.10

    // Redemption form states
    var withdrawalPointsText by remember { mutableStateOf(if (userPoints >= 250) "250" else "250") }
    var payoutMethod by remember { mutableStateOf("UPI") } // "UPI" or "Bank Transfer"
    var upiOrAccountInput by remember(user) { mutableStateOf(user?.upiId ?: "citizen@upi") }
    var bankIfscInput by remember { mutableStateOf("HDFC0001234") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }

    val withdrawalPointsInt = withdrawalPointsText.toIntOrNull() ?: 0
    val withdrawalAmountInr = withdrawalPointsInt * 0.10

    // Calculate next milestone progress
    val nextMilestone = REDEMPTION_MILESTONES.firstOrNull { it.pointsRequired > userPoints }
        ?: REDEMPTION_MILESTONES.last()

    val currentMilestoneProgress = if (userPoints >= REDEMPTION_MILESTONES.last().pointsRequired) {
        1.0f
    } else {
        (userPoints.toFloat() / nextMilestone.pointsRequired.toFloat()).coerceIn(0f, 1f)
    }

    val pointsNeededForNext = (nextMilestone.pointsRequired - userPoints).coerceAtLeast(0)
    val kgNeededForNext = pointsNeededForNext / 100.0

    // User Badge based on points
    val rankBadge = when {
        userPoints >= 2500 -> "Planet Guardian"
        userPoints >= 1000 -> "Gold Champion"
        userPoints >= 500 -> "Silver Recycler"
        userPoints >= 250 -> "Bronze Eco Citizen"
        else -> "Eco Sprout"
    }

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .testTag("wallet_screen"),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Screen Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Eco Rewards Dashboard",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 22.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Track points balance and redeem real cash via UPI & Bank.",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Surface(
                        color = Color(0xFFDCFCE7),
                        shape = RoundedCornerShape(20.dp),
                        border = BorderStroke(1.dp, Color(0xFF86EFAC))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Stars,
                                contentDescription = null,
                                tint = EcoEmeraldDark,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = rankBadge,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoEmeraldDark
                            )
                        }
                    }
                }
            }

            // 1. HERO BALANCE CARD (Point Balance & Cash Valuation)
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("wallet_balance_card"),
                    shape = RoundedCornerShape(22.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                brush = Brush.linearGradient(
                                    colors = listOf(
                                        Color(0xFF064E3B),
                                        Color(0xFF059669),
                                        Color(0xFF0F766E)
                                    )
                                )
                            )
                            .padding(20.dp)
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                            // Top Row: Label and Rate Badge
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.AccountBalanceWallet,
                                        contentDescription = null,
                                        tint = Color.White.copy(alpha = 0.9f),
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = "Current Point Balance",
                                        color = Color.White.copy(alpha = 0.9f),
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                                Surface(
                                    color = Color.White.copy(alpha = 0.22f),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text(
                                        text = "1 Point = ₹0.10 Cash",
                                        color = Color.White,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }

                            // Balance & Equivalent Cash In Rupees
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Bottom
                            ) {
                                Column {
                                    Text(
                                        text = String.format(Locale.US, "%,d", userPoints),
                                        color = Color.White,
                                        fontWeight = FontWeight.Black,
                                        fontSize = 38.sp,
                                        lineHeight = 40.sp
                                    )
                                    Text(
                                        text = "Earned from segregation",
                                        color = Color(0xFFD1FAE5),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = String.format(Locale.US, "₹%.2f", cashValueInr),
                                        color = Color(0xFFFDE68A),
                                        fontWeight = FontWeight.Black,
                                        fontSize = 30.sp,
                                        lineHeight = 34.sp
                                    )
                                    Text(
                                        text = "Redeemable Cash (INR)",
                                        color = Color(0xFFFEF3C7),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }

                            // Quick Stats Micro-bar inside Hero
                            Surface(
                                color = Color.Black.copy(alpha = 0.25f),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 14.dp, vertical = 10.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "Total Segregated",
                                            fontSize = 10.sp,
                                            color = Color.White.copy(alpha = 0.75f)
                                        )
                                        Text(
                                            text = String.format(Locale.US, "%.1f kg", totalKg),
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }
                                    Box(
                                        modifier = Modifier
                                            .height(24.dp)
                                            .width(1.dp)
                                            .background(Color.White.copy(alpha = 0.2f))
                                    )
                                    Column {
                                        Text(
                                            text = "Reward Conversion",
                                            fontSize = 10.sp,
                                            color = Color.White.copy(alpha = 0.75f)
                                        )
                                        Text(
                                            text = "1 kg = 100 pts",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF86EFAC)
                                        )
                                    }
                                    Box(
                                        modifier = Modifier
                                            .height(24.dp)
                                            .width(1.dp)
                                            .background(Color.White.copy(alpha = 0.2f))
                                    )
                                    Column(horizontalAlignment = Alignment.End) {
                                        Text(
                                            text = "Redemptions Made",
                                            fontSize = 10.sp,
                                            color = Color.White.copy(alpha = 0.75f)
                                        )
                                        Text(
                                            text = "${transactions.size} payouts",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 2. CASH REDEMPTION PROGRESS TRACKER CARD
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("redemption_progress_card"),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // Section Header
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
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFFFEF3C7)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.TrendingUp,
                                        contentDescription = null,
                                        tint = EcoAmber,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                                Column {
                                    Text(
                                        text = "Cash Redemption Progress",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = if (userPoints >= REDEMPTION_MILESTONES.last().pointsRequired) {
                                            "Max milestone reached! Ready for maximum cashout."
                                        } else {
                                            "Target: ${nextMilestone.tierName} (₹${String.format(Locale.US, "%.0f", nextMilestone.cashAmountInr)})"
                                        },
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            // Percentage Pill
                            Surface(
                                color = if (currentMilestoneProgress >= 1f) Color(0xFFDCFCE7) else Color(0xFFEFF6FF),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "${(currentMilestoneProgress * 100).toInt()}%",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = if (currentMilestoneProgress >= 1f) EcoEmeraldDark else EcoSky,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                        }

                        // Progress Bar
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            LinearProgressIndicator(
                                progress = { currentMilestoneProgress },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(10.dp)
                                    .clip(RoundedCornerShape(5.dp)),
                                color = EcoEmerald,
                                trackColor = MaterialTheme.colorScheme.surfaceVariant
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "$userPoints / ${nextMilestone.pointsRequired} Points",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = if (pointsNeededForNext == 0) {
                                        "Milestone Reached!"
                                    } else {
                                        "$pointsNeededForNext pts to ₹${String.format(Locale.US, "%.0f", nextMilestone.cashAmountInr)}"
                                    },
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (pointsNeededForNext == 0) EcoEmeraldDark else EcoAmber
                                )
                            }
                        }

                        // Next Target Callout Banner
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (userPoints >= 250) Color(0xFFF0FDF4) else Color(0xFFFFFBEB),
                            border = BorderStroke(
                                1.dp,
                                if (userPoints >= 250) Color(0xFFBBF7D0) else Color(0xFFFDE68A)
                            ),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = if (userPoints >= 250) Icons.Default.CheckCircle else Icons.Default.Info,
                                    contentDescription = null,
                                    tint = if (userPoints >= 250) EcoEmeraldDark else Color(0xFFD97706),
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = if (userPoints >= 250) {
                                        "You have unlocked cash redemption! You can withdraw ₹${String.format(Locale.US, "%.2f", cashValueInr)} immediately or keep accumulating points."
                                    } else {
                                        "Segregate $kgNeededForNext kg more waste ($pointsNeededForNext points) to unlock your first cashout of ₹25.00 via UPI."
                                    },
                                    fontSize = 11.sp,
                                    lineHeight = 16.sp,
                                    color = if (userPoints >= 250) EcoEmeraldDark else Color(0xFF92400E)
                                )
                            }
                        }

                        // Stepping Stone Milestones Grid
                        Text(
                            text = "Redemption Tiers & Milestones",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            REDEMPTION_MILESTONES.forEach { milestone ->
                                val isUnlocked = userPoints >= milestone.pointsRequired
                                val isCurrentTarget = nextMilestone == milestone && !isUnlocked

                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = when {
                                        isUnlocked -> Color(0xFFF0FDF4)
                                        isCurrentTarget -> Color(0xFFFFFBEB)
                                        else -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)
                                    },
                                    border = BorderStroke(
                                        width = if (isCurrentTarget) 1.5.dp else 1.dp,
                                        color = when {
                                            isUnlocked -> Color(0xFF86EFAC)
                                            isCurrentTarget -> Color(0xFFF59E0B)
                                            else -> Color(0xFFE2E8F0)
                                        }
                                    ),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable(enabled = isUnlocked) {
                                            withdrawalPointsText = "${milestone.pointsRequired}"
                                        }
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(horizontal = 12.dp, vertical = 10.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(32.dp)
                                                    .clip(CircleShape)
                                                    .background(
                                                        when {
                                                            isUnlocked -> EcoEmerald
                                                            isCurrentTarget -> EcoAmber
                                                            else -> Color(0xFFCBD5E1)
                                                        }
                                                    ),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(
                                                    imageVector = when {
                                                        isUnlocked -> Icons.Default.Check
                                                        isCurrentTarget -> Icons.Default.TrendingUp
                                                        else -> Icons.Default.Lock
                                                    },
                                                    contentDescription = null,
                                                    tint = Color.White,
                                                    modifier = Modifier.size(16.dp)
                                                )
                                            }
                                            Column {
                                                Row(
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                                ) {
                                                    Text(
                                                        text = "₹${String.format(Locale.US, "%.0f", milestone.cashAmountInr)} Cashout",
                                                        fontWeight = FontWeight.Bold,
                                                        fontSize = 13.sp,
                                                        color = MaterialTheme.colorScheme.onSurface
                                                    )
                                                    Text(
                                                        text = "(${milestone.pointsRequired} pts)",
                                                        fontSize = 11.sp,
                                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                                    )
                                                }
                                                Text(
                                                    text = milestone.description,
                                                    fontSize = 10.sp,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                                )
                                            }
                                        }

                                        // Status Pill or Quick Select
                                        if (isUnlocked) {
                                            Surface(
                                                color = EcoEmerald,
                                                shape = RoundedCornerShape(8.dp)
                                            ) {
                                                Text(
                                                    text = "Redeemable",
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color.White,
                                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                                )
                                            }
                                        } else {
                                            val remainingPts = milestone.pointsRequired - userPoints
                                            Surface(
                                                color = Color(0xFFF1F5F9),
                                                shape = RoundedCornerShape(8.dp)
                                            ) {
                                                Text(
                                                    text = "+$remainingPts pts to unlock",
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.SemiBold,
                                                    color = Color(0xFF64748B),
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 3. INSTANT CASH REDEMPTION PORTAL
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("withdrawal_portal_card"),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(30.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFDCFCE7)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.Payments,
                                    contentDescription = null,
                                    tint = EcoEmeraldDark,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Redeem Points to Cash",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Instant credit via UPI or Direct Municipal NEFT Transfer",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        // Quick Preset Buttons
                        Text(
                            text = "Quick Redeem Presets",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(250, 500, 1000).forEach { presetPts ->
                                val isAffordable = userPoints >= presetPts
                                OutlinedButton(
                                    onClick = {
                                        withdrawalPointsText = "$presetPts"
                                        errorMessage = null
                                        successMessage = null
                                    },
                                    enabled = isAffordable,
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(
                                        contentColor = if (withdrawalPointsText == "$presetPts") EcoEmeraldDark else MaterialTheme.colorScheme.onSurface
                                    ),
                                    border = BorderStroke(
                                        width = if (withdrawalPointsText == "$presetPts") 1.8.dp else 1.dp,
                                        color = if (withdrawalPointsText == "$presetPts") EcoEmerald else MaterialTheme.colorScheme.outlineVariant
                                    )
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text(
                                            text = "₹${presetPts / 10}",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp
                                        )
                                        Text(
                                            text = "$presetPts pts",
                                            fontSize = 9.sp
                                        )
                                    }
                                }
                            }
                            // Max All Button
                            OutlinedButton(
                                onClick = {
                                    withdrawalPointsText = "$userPoints"
                                    errorMessage = null
                                    successMessage = null
                                },
                                enabled = userPoints >= 250,
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                border = BorderStroke(
                                    width = if (withdrawalPointsText == "$userPoints" && userPoints >= 250) 1.8.dp else 1.dp,
                                    color = if (withdrawalPointsText == "$userPoints" && userPoints >= 250) EcoAmber else MaterialTheme.colorScheme.outlineVariant
                                )
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "MAX",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = EcoAmber
                                    )
                                    Text(
                                        text = "All Pts",
                                        fontSize = 9.sp
                                    )
                                }
                            }
                        }

                        // Method Chips: UPI vs Bank Transfer
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            FilterChip(
                                selected = payoutMethod == "UPI",
                                onClick = { payoutMethod = "UPI" },
                                label = { Text("UPI Instant") },
                                leadingIcon = {
                                    Icon(Icons.Default.QrCode, contentDescription = null, modifier = Modifier.size(16.dp))
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFFDCFCE7),
                                    selectedLabelColor = EcoEmeraldDark
                                ),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("chip_payout_upi")
                            )

                            FilterChip(
                                selected = payoutMethod == "Bank Transfer",
                                onClick = { payoutMethod = "Bank Transfer" },
                                label = { Text("Bank Transfer") },
                                leadingIcon = {
                                    Icon(Icons.Default.AccountBalance, contentDescription = null, modifier = Modifier.size(16.dp))
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFFDBEAFE),
                                    selectedLabelColor = EcoSky
                                ),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("chip_payout_bank")
                            )
                        }

                        // Points Input Field
                        OutlinedTextField(
                            value = withdrawalPointsText,
                            onValueChange = {
                                withdrawalPointsText = it
                                errorMessage = null
                                successMessage = null
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("withdrawal_points_input"),
                            label = { Text("Points to Redeem (Min 250 pts)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            supportingText = {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Payout: ₹${String.format(Locale.US, "%.2f", withdrawalAmountInr)}",
                                        fontWeight = FontWeight.Bold,
                                        color = EcoEmeraldDark
                                    )
                                    Text(
                                        text = "Remaining: ${(userPoints - withdrawalPointsInt).coerceAtLeast(0)} pts",
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        )

                        // Destination Input (UPI or Account + IFSC)
                        if (payoutMethod == "UPI") {
                            OutlinedTextField(
                                value = upiOrAccountInput,
                                onValueChange = { upiOrAccountInput = it },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("payout_upi_input"),
                                label = { Text("UPI ID (e.g. name@okhdfcbank)") },
                                singleLine = true
                            )
                        } else {
                            OutlinedTextField(
                                value = upiOrAccountInput,
                                onValueChange = { upiOrAccountInput = it },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("payout_bank_account_input"),
                                label = { Text("Bank Account Number") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = bankIfscInput,
                                onValueChange = { bankIfscInput = it },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("payout_bank_ifsc_input"),
                                label = { Text("Bank IFSC Code (e.g. HDFC0001234)") },
                                singleLine = true
                            )
                        }

                        // Error or Success banners
                        if (errorMessage != null) {
                            Surface(
                                color = Color(0xFFFEE2E2),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = errorMessage!!,
                                    color = Color(0xFF991B1B),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.padding(12.dp)
                                )
                            }
                        }

                        if (successMessage != null) {
                            Surface(
                                color = Color(0xFFDCFCE7),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = successMessage!!,
                                    color = EcoEmeraldDark,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(12.dp)
                                )
                            }
                        }

                        Button(
                            onClick = {
                                if (withdrawalPointsInt < 250) {
                                    errorMessage = "Minimum withdrawal is 250 points (₹25.00)"
                                    return@Button
                                }
                                if (userPoints < withdrawalPointsInt) {
                                    errorMessage = "Insufficient points! Available balance: $userPoints pts"
                                    return@Button
                                }
                                val destination = if (payoutMethod == "UPI") upiOrAccountInput
                                else "A/C: $upiOrAccountInput, IFSC: $bankIfscInput"

                                if (destination.isBlank()) {
                                    errorMessage = "Please enter payout details"
                                    return@Button
                                }

                                viewModel.requestWithdrawal(
                                    points = withdrawalPointsInt,
                                    method = payoutMethod,
                                    destination = destination
                                ) { success, msg ->
                                    if (success) {
                                        successMessage = msg
                                        errorMessage = null
                                    } else {
                                        errorMessage = msg
                                        successMessage = null
                                    }
                                }
                            },
                            enabled = userPoints >= 250,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .testTag("submit_withdrawal_button"),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = EcoEmerald)
                        ) {
                            Icon(Icons.Default.ArrowDownward, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (userPoints < 250) {
                                    "Minimum 250 Points Required"
                                } else {
                                    "Redeem ₹${String.format(Locale.US, "%.2f", withdrawalAmountInr)} to $payoutMethod"
                                },
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }

            // 4. HOW TO EARN REWARDS GUIDE
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.Recycling, contentDescription = null, tint = EcoEmerald, modifier = Modifier.size(18.dp))
                            Text(
                                text = "How Points & Cash Conversion Works",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color.White,
                                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                                modifier = Modifier.weight(1f)
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text(text = "Drop Off Waste", fontSize = 11.sp, color = Color(0xFF64748B))
                                    Text(text = "1 kg = 100 Pts", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = EcoEmeraldDark)
                                    Text(text = "Verified at municipal bins", fontSize = 9.sp, color = Color(0xFF94A3B8))
                                }
                            }
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color.White,
                                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                                modifier = Modifier.weight(1f)
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text(text = "Cash Exchange", fontSize = 11.sp, color = Color(0xFF64748B))
                                    Text(text = "100 Pts = ₹10", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = EcoAmber)
                                    Text(text = "1 Pt = ₹0.10 INR", fontSize = 9.sp, color = Color(0xFF94A3B8))
                                }
                            }
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color.White,
                                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                                modifier = Modifier.weight(1f)
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text(text = "Fast Settlement", fontSize = 11.sp, color = Color(0xFF64748B))
                                    Text(text = "UPI / NEFT", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = EcoSky)
                                    Text(text = "Zero transfer fee", fontSize = 9.sp, color = Color(0xFF94A3B8))
                                }
                            }
                        }
                    }
                }
            }

            // 5. REDEMPTION & CASHOUT TRANSACTION HISTORY
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Cash Redemption History",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        text = "${transactions.size} Records",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (transactions.isEmpty()) {
                item {
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CurrencyRupee,
                                contentDescription = null,
                                tint = Color(0xFF94A3B8),
                                modifier = Modifier.size(32.dp)
                            )
                            Text(
                                text = "No cash redemption requests yet",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp
                            )
                            Text(
                                text = "Drop off waste to earn points, then redeem them here for real cash via UPI or bank transfer.",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                }
            } else {
                items(transactions) { txn ->
                    TransactionItemRow(txn)
                }
            }
        }

        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier.align(Alignment.BottomCenter)
        )
    }
}

@Composable
fun TransactionItemRow(txn: WalletTransactionEntity) {
    val dateStr = remember(txn.requestTimestamp) {
        val sdf = SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault())
        sdf.format(Date(txn.requestTimestamp))
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("txn_item_${txn.id}"),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.5.dp)
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
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFFFEF3C7)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.CurrencyRupee,
                        contentDescription = null,
                        tint = EcoAmber,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Column {
                    Text(
                        text = "₹${String.format(Locale.US, "%.2f", txn.amountInr)} Payout (${txn.payoutMethod})",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Text(
                        text = "${txn.pointsDebited} pts debited • $dateStr",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "To: ${txn.payoutDestination}",
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1
                    )
                }
            }

            StatusBadge(status = txn.status)
        }
    }
}
