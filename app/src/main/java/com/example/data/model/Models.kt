package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val email: String,
    val name: String,
    val role: String, // "user" or "admin"
    val phone: String,
    val upiId: String,
    val avatarId: String,
    val ward: String,
    val pointsBalance: Int,
    val totalKgDisposed: Double,
    val weeklyKgDisposed: Double,
    val joinedTimestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "disposal_logs")
data class DisposalLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: String,
    val userName: String,
    val userAvatarId: String,
    val category: String, // "Biodegradable" or "Non-Biodegradable"
    val subCategory: String, // e.g. "Organic Kitchen Waste", "PET Plastic Bottles"
    val weightKg: Double,
    val pointsAwarded: Int,
    val binLocation: String,
    val imageProofUri: String,
    val status: String, // "Verified", "Pending Review", "Flagged"
    val flagReason: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "wallet_transactions")
data class WalletTransactionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: String,
    val userName: String,
    val pointsDebited: Int,
    val amountInr: Double,
    val payoutMethod: String, // "UPI" or "Bank Transfer"
    val payoutDestination: String, // UPI ID or Account Number
    val status: String, // "Pending", "Approved", "Transferred", "Rejected"
    val requestTimestamp: Long = System.currentTimeMillis(),
    val processedTimestamp: Long? = null
)

@Entity(tableName = "bin_stations")
data class BinStationEntity(
    @PrimaryKey val id: String,
    val name: String,
    val ward: String,
    val address: String,
    val qrCode: String,
    val status: String = "Active", // "Active", "Full", "Maintenance"
    val acceptedTypes: String = "Biodegradable & Non-Biodegradable"
)

data class SearchSource(
    val title: String,
    val url: String
)

data class WasteScanResult(
    val itemName: String,
    val wasteType: String, // "Biodegradable" or "Non-Biodegradable"
    val subCategory: String,
    val binColorName: String, // "Green Bin", "Blue Bin", "Red/Hazard Bin"
    val binColorHex: Long,
    val disposalInstructions: String,
    val preparationTip: String,
    val estimatedWeightKg: Double,
    val estimatedPoints: Int,
    val co2SavedKg: Double,
    val confidence: Float = 0.95f,
    val isSearchGrounded: Boolean = false,
    val searchSources: List<SearchSource> = emptyList(),
    val searchQueries: List<String> = emptyList(),
    val searchSummary: String? = null
)
