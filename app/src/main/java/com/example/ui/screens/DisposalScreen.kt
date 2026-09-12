package com.example.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Park
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Recycling
import androidx.compose.material.icons.filled.Scale
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.navigation.Screen
import com.example.ui.theme.EcoAmber
import com.example.ui.theme.EcoBioGreen
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoEmeraldDark
import com.example.ui.theme.EcoRecycleBlue
import com.example.ui.viewmodel.EcoViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DisposalScreen(
    viewModel: EcoViewModel,
    onNavigate: (String) -> Unit
) {
    val binStations by viewModel.binStations.collectAsState()
    val draftCategory by viewModel.draftCategory.collectAsState()
    val draftSubCategory by viewModel.draftSubCategory.collectAsState()
    val draftWeightKg by viewModel.draftWeightKg.collectAsState()

    var selectedBin by remember(binStations) {
        mutableStateOf(binStations.firstOrNull()?.name ?: "Bin Point #402 - Green Valley Park")
    }
    var qrScannedSuccess by remember { mutableStateOf(false) }
    var proofPhotoUri by remember { mutableStateOf<String?>("verified_bin_photo") }
    var weightText by remember(draftWeightKg) { mutableStateOf(draftWeightKg) }
    var isSubmitted by remember { mutableStateOf(false) }

    val photoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        if (uri != null) {
            proofPhotoUri = uri.toString()
        }
    }

    val weightDouble = weightText.toDoubleOrNull() ?: 0.0
    val calculatedPoints = (weightDouble * 100).toInt().coerceAtLeast(0)
    val calculatedInr = calculatedPoints * 0.10

    if (isSubmitted) {
        // Success Dialog / Card
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("disposal_success_card"),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFDCFCE7)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = EcoEmerald,
                            modifier = Modifier.size(40.dp)
                        )
                    }
                    Text(
                        text = "Disposal Verified!",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = EcoEmeraldDark
                    )
                    Text(
                        text = "Your $weightDouble kg of $draftSubCategory at $selectedBin was validated successfully.",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )

                    Surface(
                        color = Color(0xFFFEF3C7),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Points Credited",
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF78350F),
                                fontSize = 13.sp
                            )
                            Text(
                                text = "+$calculatedPoints pts (₹${String.format("%.2f", calculatedInr)})",
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF78350F),
                                fontSize = 15.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = {
                            isSubmitted = false
                            onNavigate(Screen.Home.route)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("back_to_home_button"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EcoEmerald)
                    ) {
                        Text("View on Dashboard", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("disposal_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column {
                Text(
                    text = "Waste Disposal & Drop-off",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 20.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Deposit segregated waste at an authorized bin point to earn 100 points per kg.",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Collection Bin Point Selector & QR Scan
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
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = EcoEmerald, modifier = Modifier.size(18.dp))
                            Text("1. Authorized Bin Station", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (qrScannedSuccess) Color(0xFFDCFCE7) else MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier.clickable { qrScannedSuccess = !qrScannedSuccess }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    Icons.Default.QrCodeScanner,
                                    contentDescription = null,
                                    tint = if (qrScannedSuccess) EcoEmerald else MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = if (qrScannedSuccess) "QR Verified" else "Scan QR",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (qrScannedSuccess) EcoEmeraldDark else MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }

                    // Bin Station Options
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        binStations.forEach { station ->
                            val isSelected = selectedBin == station.name
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) Color(0xFFD1FAE5).copy(alpha = 0.6f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedBin = station.name }
                                    .then(
                                        if (isSelected) Modifier.border(1.5.dp, EcoEmerald, RoundedCornerShape(10.dp))
                                        else Modifier
                                    )
                                    .testTag("bin_station_${station.id}")
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = station.name,
                                            fontWeight = FontWeight.SemiBold,
                                            fontSize = 12.sp
                                        )
                                        Text(
                                            text = station.address,
                                            fontSize = 10.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    if (isSelected) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = EcoEmerald, modifier = Modifier.size(18.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Category & Sub-category
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("2. Waste Category", fontWeight = FontWeight.Bold, fontSize = 14.sp)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        FilterChip(
                            selected = draftCategory == "Biodegradable",
                            onClick = {
                                viewModel.setDraftDetails("Biodegradable", "Wet Organic Compost", weightText)
                            },
                            label = { Text("Biodegradable (Wet)") },
                            leadingIcon = {
                                Icon(Icons.Default.Park, contentDescription = null, modifier = Modifier.size(16.dp))
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFFDCFCE7),
                                selectedLabelColor = EcoBioGreen
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("chip_bio")
                        )

                        FilterChip(
                            selected = draftCategory == "Non-Biodegradable",
                            onClick = {
                                viewModel.setDraftDetails("Non-Biodegradable", "PET Plastic (#1)", weightText)
                            },
                            label = { Text("Non-Bio (Dry)") },
                            leadingIcon = {
                                Icon(Icons.Default.Recycling, contentDescription = null, modifier = Modifier.size(16.dp))
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFFDBEAFE),
                                selectedLabelColor = EcoRecycleBlue
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("chip_non_bio")
                        )
                    }

                    // Sub-category selector
                    val subCategories = if (draftCategory == "Biodegradable") {
                        listOf("Wet Organic Compost", "Food & Vegetable Scraps", "Garden Leaves & Trimmings")
                    } else {
                        listOf("PET Plastic (#1)", "Corrugated Cardboard", "Aluminum / Metal Cans", "E-Waste / Battery")
                    }

                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(subCategories) { sub ->
                            val isChosen = draftSubCategory == sub
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isChosen) EcoEmeraldDark else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .clickable {
                                        viewModel.setDraftDetails(draftCategory, sub, weightText)
                                    }
                                    .testTag("sub_category_$sub")
                            ) {
                                Text(
                                    text = sub,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (isChosen) Color.White else MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Weight Input & Points Calculator
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
                    Text("3. Waste Weight (kg)", fontWeight = FontWeight.Bold, fontSize = 14.sp)

                    OutlinedTextField(
                        value = weightText,
                        onValueChange = { weightText = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("weight_input_field"),
                        label = { Text("Weight in kg (e.g. 1.5)") },
                        leadingIcon = {
                            Icon(Icons.Default.Scale, contentDescription = null, tint = EcoEmerald)
                        },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        singleLine = true
                    )

                    // Quick weight stepper presets
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("0.5", "1.0", "2.0", "3.5", "5.0").forEach { preset ->
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (weightText == preset) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .clickable { weightText = preset }
                                    .testTag("preset_weight_$preset")
                            ) {
                                Text(
                                    text = "$preset kg",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (weightText == preset) EcoEmeraldDark else MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }

                    // Live Points Calculator Box
                    Surface(
                        color = Color(0xFFF0FDF4),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBBF7D0)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Reward Preview",
                                    fontSize = 11.sp,
                                    color = EcoEmeraldDark
                                )
                                Text(
                                    text = "100 pts per validated kg",
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "+$calculatedPoints Points",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = EcoEmerald
                                )
                                Text(
                                    text = "= ₹${String.format("%.2f", calculatedInr)} INR",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EcoAmber
                                )
                            }
                        }
                    }
                }
            }
        }

        // Disposal Photo Proof Upload
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("4. Proof of Disposal at Bin Point", fontWeight = FontWeight.Bold, fontSize = 14.sp)

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                photoLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                            }
                            .testTag("upload_disposal_proof_box")
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFFDCFCE7)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AddAPhoto,
                                    contentDescription = null,
                                    tint = EcoEmerald,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = if (proofPhotoUri != null) "Photo Proof Attached ✓" else "Take / Upload Photo at Bin",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp,
                                    color = if (proofPhotoUri != null) EcoEmeraldDark else MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Shows deposited waste inside the designated bin",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        }

        // Submit Button
        item {
            Button(
                onClick = {
                    if (weightDouble > 0) {
                        viewModel.submitDisposal(
                            weightKg = weightDouble,
                            binLocation = selectedBin,
                            imageProofUri = proofPhotoUri ?: "bin_deposit_photo",
                            onSuccess = {
                                isSubmitted = true
                            }
                        )
                    }
                },
                enabled = weightDouble > 0,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("submit_disposal_button"),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EcoEmerald)
            ) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Confirm Disposal & Earn $calculatedPoints pts",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }
    }
}
