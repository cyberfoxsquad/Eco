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
import com.example.data.remote.FirebaseService
import com.example.data.remote.GeminiWasteClassifier
import com.example.data.repository.EcoRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class EcoViewModel(application: Application) : AndroidViewModel(application) {

    val firebaseService = FirebaseService.getInstance(application)
    private val db = EcoCollectDatabase.getDatabase(application)
    private val repository = EcoRepository(
        userDao = db.userDao(),
        disposalDao = db.disposalDao(),
        walletDao = db.walletDao(),
        binDao = db.binDao(),
        firebaseService = firebaseService
    )
    private val geminiClassifier = GeminiWasteClassifier()

    private var firestoreUserJob: Job? = null

    // Firebase & Cloud Status
    private val _isFirebaseActive = MutableStateFlow(firebaseService.auth != null && firebaseService.firestore != null)
    val isFirebaseActive: StateFlow<Boolean> = _isFirebaseActive.asStateFlow()

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

            // Observe real users from Firestore in real-time
            repository.observeAllRealUsersFromFirestore()?.collect { realUsers ->
                for (u in realUsers) {
                    repository.saveUser(u)
                }
            }
        }

        viewModelScope.launch {
            val firebaseUser = firebaseService.currentFirebaseUser
            val targetUserId = if (firebaseUser != null) {
                firebaseUser.uid
            } else {
                repository.getFirstRealUser()?.id
            }

            if (!targetUserId.isNullOrBlank()) {
                _currentUserId.value = targetUserId
                refreshCurrentUserData(targetUserId)
            }
        }
    }

    private suspend fun refreshCurrentUserData(userId: String) {
        if (userId.isBlank()) return
        val user = repository.getUser(userId) ?: repository.syncUserFromFirestore(userId)
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

        // Live Firestore sync for user document (pointsBalance, totalKg, etc.)
        firestoreUserJob?.cancel()
        firestoreUserJob = viewModelScope.launch {
            repository.observeFirestoreUser(userId)?.collect { firestoreUser ->
                if (firestoreUser != null) {
                    _currentUser.value = firestoreUser
                    repository.saveUser(firestoreUser)
                }
            }
        }
    }

    fun switchUser(userId: String) {
        viewModelScope.launch {
            _currentUserId.value = userId
            refreshCurrentUserData(userId)
        }
    }

    fun logout() {
        firestoreUserJob?.cancel()
        viewModelScope.launch {
            firebaseService.signOut()
        }
        _currentUser.value = null
        _userDisposals.value = emptyList()
        _userTransactions.value = emptyList()
    }

    /**
     * Google Sign-in with Firebase Auth via Credential Manager
     */
    fun signInWithGoogle(onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val result = firebaseService.signInWithGoogle()
            if (result.isSuccess) {
                val firebaseUser = result.getOrNull()
                if (firebaseUser != null) {
                    val uid = firebaseUser.uid
                    val email = firebaseUser.email ?: "google.user@example.com"
                    val displayName = firebaseUser.displayName?.ifBlank { "Eco Citizen" } ?: "Eco Citizen"

                    // Try to find existing account in local DB or Firestore
                    val existing = repository.getUser(uid)
                        ?: repository.getUserByEmail(email)
                        ?: repository.syncUserFromFirestore(uid)

                    val activeUser = if (existing != null) {
                        existing
                    } else {
                        // Create a fresh user starting strictly at 0 points
                        val newUser = UserEntity(
                            id = uid,
                            email = email,
                            name = displayName,
                            role = "user",
                            phone = "+91 98000 00000",
                            upiId = "${displayName.lowercase().replace(" ", "")}@upi",
                            avatarId = "avatar_1",
                            ward = "Green Valley Ward 4",
                            pointsBalance = 0,
                            totalKgDisposed = 0.0,
                            weeklyKgDisposed = 0.0
                        )
                        repository.saveUser(newUser)
                        newUser
                    }

                    _currentUserId.value = activeUser.id
                    refreshCurrentUserData(activeUser.id)
                    onResult(true, null)
                } else {
                    onResult(false, "Google account was received but Firebase user was null")
                }
            } else {
                val err = result.exceptionOrNull()?.message ?: "Google Sign-In failed"
                onResult(false, err)
            }
        }
    }

    fun login(
        email: String,
        role: String,
        name: String = "Citizen",
        ward: String = "Green Valley Ward 4",
        onComplete: (() -> Unit)? = null
    ) {
        viewModelScope.launch {
            val trimmedEmail = email.trim()
            val trimmedName = name.trim()
            val existing = repository.getUserByNameAndOrEmail(trimmedName, trimmedEmail)
                ?: repository.getUserByEmail(trimmedEmail)
                ?: repository.getUserByNameOrEmail(trimmedName)

            if (existing != null) {
                _currentUserId.value = existing.id
                refreshCurrentUserData(existing.id)
            } else {
                val registered = repository.registerNewUser(
                    name = if (trimmedName.isNotBlank()) trimmedName else if (role == "admin") "Municipal Officer" else "Eco Citizen",
                    email = if (trimmedEmail.isNotBlank()) trimmedEmail else "citizen_${System.currentTimeMillis()}@example.com",
                    role = role,
                    ward = ward
                )
                _currentUserId.value = registered.id
                refreshCurrentUserData(registered.id)
            }
            onComplete?.invoke()
        }
    }

    fun register(
        name: String,
        email: String,
        role: String = "user",
        ward: String = "Green Valley Ward 4",
        onComplete: (() -> Unit)? = null
    ) {
        viewModelScope.launch {
            val trimmedName = name.trim().ifBlank { "Eco Citizen" }
            val trimmedEmail = email.trim().ifBlank { "${trimmedName.lowercase().replace(" ", ".")}@example.com" }

            val existing = repository.getUserByNameAndOrEmail(trimmedName, trimmedEmail)
            if (existing != null) {
                // Account already exists with this name/email, log into it
                _currentUserId.value = existing.id
                refreshCurrentUserData(existing.id)
            } else {
                // Create brand-new user with 0 points
                val newUser = repository.registerNewUser(
                    name = trimmedName,
                    email = trimmedEmail,
                    role = role,
                    ward = ward
                )
                _currentUserId.value = newUser.id
                refreshCurrentUserData(newUser.id)
            }
            onComplete?.invoke()
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
