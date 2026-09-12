package com.example.ui.viewmodel

import android.app.Application
import android.graphics.Bitmap
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.EcoCollectDatabase
import com.example.data.model.BinStationEntity
import com.example.data.model.DisposalLogEntity
import com.example.data.model.UserEntity
import com.example.data.model.WasteScanResult
import com.example.data.model.WalletTransactionEntity
import com.example.data.remote.GeminiWasteClassifier
import com.example.data.repository.EcoRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class EcoViewModel(application: Application) : AndroidViewModel(application) {

    private val db = EcoCollectDatabase.getDatabase(application)
    private val repository = EcoRepository(
        userDao = db.userDao(),
        disposalDao = db.disposalDao(),
        walletDao = db.walletDao(),
        binDao = db.binDao()
    )
    private val geminiClassifier = GeminiWasteClassifier()

    // Current Session
    private val _currentUserId = MutableStateFlow("")
    val currentUserId: StateFlow<String> = _currentUserId.asStateFlow()

    private val _currentUser = MutableStateFlow<UserEntity?>(null)
    val currentUser: StateFlow<UserEntity?> = _currentUser.asStateFlow()

    // Leaderboards
    val allTimeLeaderboard: StateFlow<List<UserEntity>> = repository.allTimeLeaderboard
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val weeklyLeaderboard: StateFlow<List<UserEntity>> = repository.weeklyLeaderboard
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val binStations: StateFlow<List<BinStationEntity>> = repository.allBinStations
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Personal user data
    private val _userDisposals = MutableStateFlow<List<DisposalLogEntity>>(emptyList())
    val userDisposals: StateFlow<List<DisposalLogEntity>> = _userDisposals.asStateFlow()

    private val _userTransactions = MutableStateFlow<List<WalletTransactionEntity>>(emptyList())
    val userTransactions: StateFlow<List<WalletTransactionEntity>> = _userTransactions.asStateFlow()

    // Admin Metrics
    val totalWasteKg: StateFlow<Double?> = repository.totalWasteKg
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val biodegradableWasteKg: StateFlow<Double?> = repository.biodegradableWasteKg
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val nonBiodegradableWasteKg: StateFlow<Double?> = repository.nonBiodegradableWasteKg
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val totalPointsMinted: StateFlow<Int?> = repository.totalPointsMinted
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val activeCitizenCount: StateFlow<Int> = repository.activeCitizenCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val pendingCashoutSum: StateFlow<Double?> = repository.pendingCashoutSum
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val settledCashoutSum: StateFlow<Double?> = repository.settledCashoutSum
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val allDisposalsStream: StateFlow<List<DisposalLogEntity>> = repository.allDisposalsStream
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allTransactions: StateFlow<List<WalletTransactionEntity>> = repository.allTransactions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // AI Scanner State
    private val _isScanning = MutableStateFlow(false)
    val isScanning: StateFlow<Boolean> = _isScanning.asStateFlow()

    private val _scanResult = MutableStateFlow<WasteScanResult?>(null)
    val scanResult: StateFlow<WasteScanResult?> = _scanResult.asStateFlow()

    private val _capturedBitmap = MutableStateFlow<Bitmap?>(null)
    val capturedBitmap: StateFlow<Bitmap?> = _capturedBitmap.asStateFlow()

    // Disposal Draft
    private val _draftCategory = MutableStateFlow("Non-Biodegradable")
    val draftCategory: StateFlow<String> = _draftCategory.asStateFlow()

    private val _draftSubCategory = MutableStateFlow("PET Plastic (#1)")
    val draftSubCategory: StateFlow<String> = _draftSubCategory.asStateFlow()

    private val _draftWeightKg = MutableStateFlow("1.5")
    val draftWeightKg: StateFlow<String> = _draftWeightKg.asStateFlow()

    // Wallet State
    private val _walletMessage = MutableStateFlow<String?>(null)
    val walletMessage: StateFlow<String?> = _walletMessage.asStateFlow()

    init {
        viewModelScope.launch {
            repository.initializeDefaultDataIfEmpty()
            val initialUser = repository.getFirstRealUser()
            val targetUserId = initialUser?.id ?: "citizen_primary_1"
            _currentUserId.value = targetUserId
            refreshCurrentUserData(targetUserId)
        }
    }

    private suspend fun refreshCurrentUserData(userId: String) {
        if (userId.isBlank()) return
        val user = repository.getUser(userId)
        _currentUser.value = user

        // Stream local room disposals
        viewModelScope.launch {
            repository.getDisposalsForUser(userId).collect {
                _userDisposals.value = it
            }
        }
        viewModelScope.launch {
            repository.getTransactionsForUser(userId).collect {
                _userTransactions.value = it
            }
        }
    }

    fun switchUser(userId: String) {
        viewModelScope.launch {
            _currentUserId.value = userId
            refreshCurrentUserData(userId)
        }
    }

    fun resetToCitizen() {
        viewModelScope.launch {
            val citizen = repository.getFirstRealUser()
            val targetId = citizen?.id ?: "citizen_primary_1"
            switchUser(targetId)
        }
    }

    fun scanWaste(bitmap: Bitmap?, sampleLabel: String?) {
        viewModelScope.launch {
            _isScanning.value = true
            _capturedBitmap.value = bitmap
            try {
                val result = geminiClassifier.classifyWasteImage(bitmap, sampleLabel)
                _scanResult.value = result
            } finally {
                _isScanning.value = false
            }
        }
    }

    fun resetScanner() {
        _scanResult.value = null
        _capturedBitmap.value = null
    }

    fun applyScanToDisposal(result: WasteScanResult) {
        _draftCategory.value = result.wasteType
        _draftSubCategory.value = result.subCategory
        _draftWeightKg.value = String.format("%.1f", result.estimatedWeightKg)
    }

    fun setDraftDetails(category: String, subCategory: String, weight: String) {
        _draftCategory.value = category
        _draftSubCategory.value = subCategory
        _draftWeightKg.value = weight
    }

    fun submitDisposal(
        weightKg: Double,
        binLocation: String,
        imageProofUri: String,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            val userId = _currentUserId.value
            repository.recordDisposalSession(
                userId = userId,
                category = _draftCategory.value,
                subCategory = _draftSubCategory.value,
                weightKg = weightKg,
                binLocation = binLocation,
                imageProofUri = imageProofUri
            )
            refreshCurrentUserData(userId)
            onSuccess()
        }
    }

    fun requestWithdrawal(points: Int, method: String, destination: String, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            val userId = _currentUserId.value
            val result = repository.requestWithdrawal(userId, points, method, destination)
            if (result.isSuccess) {
                refreshCurrentUserData(userId)
                _walletMessage.value = "Withdrawal request of ₹${points * 0.10} submitted successfully!"
                onResult(true, "Withdrawal request for ₹${points * 0.10} submitted successfully!")
            } else {
                val err = result.exceptionOrNull()?.message ?: "Failed to process withdrawal"
                _walletMessage.value = err
                onResult(false, err)
            }
        }
    }

    fun adminApprovePayout(transactionId: Long) {
        viewModelScope.launch {
            repository.approvePayout(transactionId)
        }
    }

    fun adminRejectPayout(transactionId: Long, reason: String? = null) {
        viewModelScope.launch {
            repository.rejectPayout(transactionId, reason)
        }
    }

    fun adminFlagDisposal(logId: Long, reason: String) {
        viewModelScope.launch {
            repository.updateDisposalStatus(logId, "Flagged", reason)
        }
    }

    fun adminApproveDisposal(logId: Long) {
        viewModelScope.launch {
            repository.updateDisposalStatus(logId, "Verified", null)
        }
    }

    fun updateProfile(name: String, phone: String, upiId: String, ward: String, avatarId: String) {
        viewModelScope.launch {
            val userId = _currentUserId.value
            repository.updateUserProfile(userId, name, phone, upiId, ward, avatarId)
            refreshCurrentUserData(userId)
        }
    }
}
