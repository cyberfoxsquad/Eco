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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Leaderboard
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material.icons.filled.Recycling
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.UserEntity
import com.example.ui.components.EcoAvatar
import com.example.ui.theme.EcoAmber
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoEmeraldDark
import com.example.ui.theme.EcoSky
import com.example.ui.viewmodel.EcoViewModel

@Composable
fun LeaderboardScreen(
    viewModel: EcoViewModel
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val weeklyUsers by viewModel.weeklyLeaderboard.collectAsState()
    val allTimeUsers by viewModel.allTimeLeaderboard.collectAsState()

    var filterType by remember { mutableStateOf("This Week") } // "This Week" or "All Time"

    val sampleNames = remember { setOf("Priya Sharma", "Alex Green", "Ananya Sen", "Rahul Patel", "New Citizen") }
    fun isRealProfile(user: UserEntity): Boolean {
        return user.role == "user" &&
                !user.id.startsWith("user_citizen_") &&
                user.name !in sampleNames &&
                !user.email.endsWith("@example.com")
    }

    val userList = if (filterType == "This Week") {
        weeklyUsers.filter { isRealProfile(it) }
    } else {
        allTimeUsers.filter { isRealProfile(it) }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("leaderboard_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = EcoAmber, modifier = Modifier.size(24.dp))
                    Text(
                        text = "Community Leaderboard",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 20.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                Text(
                    text = "Weekly competitive citizen rankings. Highest segregated volume earns top rewards.",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Reset Countdown Banner (Resets every Monday 00:00 UTC)
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7))
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.Schedule, contentDescription = null, tint = Color(0xFF92400E), modifier = Modifier.size(18.dp))
                    Column {
                        Text(
                            text = "Weekly Cycle Resets Every Monday 00:00 UTC",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = Color(0xFF78350F)
                        )
                        Text(
                            text = "Next reset in: 5 days, 14 hours • Top 3 receive 500 bonus points!",
                            fontSize = 10.sp,
                            color = Color(0xFF92400E)
                        )
                    }
                }
            }
        }

        // Filter Toggle (This Week vs All Time)
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                FilterChip(
                    selected = filterType == "This Week",
                    onClick = { filterType = "This Week" },
                    label = { Text("This Week's Race") },
                    leadingIcon = {
                        Icon(Icons.Default.MilitaryTech, contentDescription = null, modifier = Modifier.size(16.dp))
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFFDCFCE7),
                        selectedLabelColor = EcoEmeraldDark
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("filter_this_week")
                )

                FilterChip(
                    selected = filterType == "All Time",
                    onClick = { filterType = "All Time" },
                    label = { Text("All-Time Champions") },
                    leadingIcon = {
                        Icon(Icons.Default.WorkspacePremium, contentDescription = null, modifier = Modifier.size(16.dp))
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFFFEF3C7),
                        selectedLabelColor = Color(0xFF78350F)
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("filter_all_time")
                )
            }
        }

        if (userList.isEmpty()) {
            // Clean Empty State when no real users have accumulated rankings yet
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .testTag("leaderboard_empty_card"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFFEF3C7)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.EmojiEvents,
                                contentDescription = null,
                                tint = EcoAmber,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                        Text(
                            text = "Real Profiles Only",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Sample profiles have been removed. The community leaderboard exclusively ranks real citizens. Log in, deposit segregated waste at any smart bin station, and claim your #1 spot on the leaderboard!",
                            fontSize = 12.sp,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        } else {
            // Adaptive Podium (Gold, Silver, Bronze for real profiles)
            item {
                PodiumSection(topUsers = userList.take(3), isWeekly = filterType == "This Week")
            }

            // Ranking List Items
            item {
                Text(
                    text = "Rankings Table (${userList.size} Real ${if (userList.size == 1) "Citizen" else "Citizens"})",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            itemsIndexed(userList) { index, user ->
                val rank = index + 1
                val isCurrent = user.id == currentUser?.id
                LeaderboardRankRow(
                    rank = rank,
                    user = user,
                    isCurrentUser = isCurrent,
                    isWeekly = filterType == "This Week"
                )
            }
        }
    }
}

@Composable
fun PodiumSection(topUsers: List<UserEntity>, isWeekly: Boolean) {
    val first = topUsers.getOrNull(0)
    val second = topUsers.getOrNull(1)
    val third = topUsers.getOrNull(2)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("podium_card"),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Top Waste Segregators",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.Bottom
            ) {
                // Rank 2: Silver (if present)
                second?.let {
                    PodiumColumn(
                        user = it,
                        rank = 2,
                        badgeColor = Color(0xFF94A3B8),
                        heightDp = 90,
                        isWeekly = isWeekly
                    )
                }

                // Rank 1: Gold
                first?.let {
                    PodiumColumn(
                        user = it,
                        rank = 1,
                        badgeColor = Color(0xFFF59E0B),
                        heightDp = 120,
                        isWeekly = isWeekly
                    )
                }

                // Rank 3: Bronze (if present)
                third?.let {
                    PodiumColumn(
                        user = it,
                        rank = 3,
                        badgeColor = Color(0xFFD97706),
                        heightDp = 75,
                        isWeekly = isWeekly
                    )
                }
            }
        }
    }
}

@Composable
fun PodiumColumn(
    user: UserEntity,
    rank: Int,
    badgeColor: Color,
    heightDp: Int,
    isWeekly: Boolean
) {
    val wasteKg = if (isWeekly) user.weeklyKgDisposed else user.totalKgDisposed

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        // Avatar + Badge
        Box(contentAlignment = Alignment.BottomEnd) {
            EcoAvatar(avatarId = user.avatarId, sizeDp = if (rank == 1) 48 else 40)
            Box(
                modifier = Modifier
                    .size(18.dp)
                    .clip(CircleShape)
                    .background(badgeColor),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "$rank",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp
                )
            }
        }

        Text(
            text = user.name.split(" ").firstOrNull() ?: "",
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            maxLines = 1
        )
        Text(
            text = "${String.format("%.1f", wasteKg)} kg",
            fontSize = 10.sp,
            fontWeight = FontWeight.SemiBold,
            color = EcoEmerald
        )

        // Pillar block
        Box(
            modifier = Modifier
                .width(68.dp)
                .height(heightDp.dp)
                .clip(RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp))
                .background(
                    if (rank == 1) Brush.verticalGradient(listOf(Color(0xFFFDE68A), Color(0xFFF59E0B).copy(alpha = 0.3f)))
                    else if (rank == 2) Brush.verticalGradient(listOf(Color(0xFFE2E8F0), Color(0xFFCBD5E1).copy(alpha = 0.3f)))
                    else Brush.verticalGradient(listOf(Color(0xFFFFEDD5), Color(0xFFFDBA74).copy(alpha = 0.3f)))
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "${user.pointsBalance} pts",
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = Color(0xFF1E293B)
            )
        }
    }
}

@Composable
fun LeaderboardRankRow(
    rank: Int,
    user: UserEntity,
    isCurrentUser: Boolean,
    isWeekly: Boolean
) {
    val wasteKg = if (isWeekly) user.weeklyKgDisposed else user.totalKgDisposed

    val (badgeBg, badgeFg) = when (rank) {
        1 -> Pair(Color(0xFFFEF3C7), Color(0xFFD97706)) // Gold
        2 -> Pair(Color(0xFFF1F5F9), Color(0xFF64748B)) // Silver
        3 -> Pair(Color(0xFFFFEDD5), Color(0xFFC2410C)) // Bronze
        else -> Pair(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.colorScheme.onSurfaceVariant)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .then(
                if (isCurrentUser) Modifier.border(1.5.dp, EcoEmerald, RoundedCornerShape(12.dp))
                else Modifier
            )
            .testTag("leaderboard_row_$rank"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isCurrentUser) Color(0xFFD1FAE5).copy(alpha = 0.3f)
            else MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.5.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Rank number badge
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(badgeBg),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "#$rank",
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = badgeFg
                    )
                }

                EcoAvatar(avatarId = user.avatarId, sizeDp = 36)

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = user.name,
                            fontWeight = if (isCurrentUser) FontWeight.ExtraBold else FontWeight.SemiBold,
                            fontSize = 13.sp
                        )
                        if (isCurrentUser) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = EcoEmerald
                            ) {
                                Text(
                                    text = "YOU",
                                    color = Color.White,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                )
                            }
                        }
                    }
                    Text(
                        text = user.ward,
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${String.format("%.1f", wasteKg)} kg",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = EcoEmeraldDark
                )
                Text(
                    text = "${user.pointsBalance} pts",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = EcoAmber
                )
            }
        }
    }
}
