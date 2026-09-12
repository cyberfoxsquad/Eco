package com.example.data.repository

import com.example.data.local.BinDao
import com.example.data.local.DisposalDao
import com.example.data.local.UserDao
import com.example.data.local.WalletDao
import com.example.data.model.BinStationEntity
import com.example.data.model.DisposalLogEntity
import com.example.data.model.UserEntity
import com.example.data.model.WalletTransactionEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull

class EcoRepository(
    private val userDao: UserDao,
    private val disposalDao: DisposalDao,
    private val walletDao: WalletDao,
    private val binDao: BinDao
) {

    val allTimeLeaderboard: Flow<List<UserEntity>> = userDao.getAllUsersByAllTimeWaste()
    val weeklyLeaderboard: Flow<List<UserEntity>> = userDao.getAllUsersByWeeklyWaste()
    val allBinStations: Flow<List<BinStationEntity>> = binDao.getAllBinStations()

    val totalWasteKg: Flow<Double?> = disposalDao.getTotalWasteKg()
    val biodegradableWasteKg: Flow<Double?> = disposalDao.getBiodegradableWasteKg()
    val nonBiodegradableWasteKg: Flow<Double?> = disposalDao.getNonBiodegradableWasteKg()
    val totalPointsMinted: Flow<Int?> = disposalDao.getTotalPointsMinted()
    val activeCitizenCount: Flow<Int> = userDao.getActiveCitizenCount()

    val pendingCashoutSum: Flow<Double?> = walletDao.getPendingCashoutSum()
    val settledCashoutSum: Flow<Double?> = walletDao.getSettledCashoutSum()

    val allDisposalsStream: Flow<List<DisposalLogEntity>> = disposalDao.getAllDisposals()
    val allTransactions: Flow<List<WalletTransactionEntity>> = walletDao.getAllTransactions()

    fun getDisposalsForUser(userId: String): Flow<List<DisposalLogEntity>> =
        disposalDao.getDisposalsForUser(userId)

    fun getTransactionsForUser(userId: String): Flow<List<WalletTransactionEntity>> =
        walletDao.getTransactionsForUser(userId)

    suspend fun getUser(userId: String): UserEntity? = userDao.getUserById(userId)

    suspend fun getUserByEmail(email: String): UserEntity? = userDao.getUserByEmail(email)

    suspend fun getUserByNameOrEmail(identifier: String): UserEntity? =
        userDao.getUserByNameOrEmail(identifier)

    suspend fun getUserByNameAndOrEmail(name: String, email: String): UserEntity? =
        userDao.getUserByNameAndOrEmail(name, email)

    suspend fun registerNewUser(
        name: String,
        email: String,
        role: String = "user",
        ward: String = "Green Valley Ward 4"
    ): UserEntity {
        val newId = "user_" + System.currentTimeMillis()
        val cleanName = name.trim().ifEmpty { "Eco Citizen" }
        val cleanEmail = email.trim().ifEmpty { "${cleanName.lowercase().replace(" ", ".")}@example.com" }
        val newUser = UserEntity(
            id = newId,
            email = cleanEmail,
            name = cleanName,
            role = role,
            phone = "+91 90000 12345",
            upiId = "${cleanName.lowercase().replace(" ", "")}@upi",
            avatarId = if (role == "admin") "avatar_admin" else "avatar_1",
            ward = ward,
            pointsBalance = 0, // Points start strictly at 0
            totalKgDisposed = 0.0,
            weeklyKgDisposed = 0.0
        )
        userDao.insertUser(newUser)
        return newUser
    }

    suspend fun saveUser(user: UserEntity) {
        userDao.insertUser(user)
    }

    suspend fun updateUserProfile(
        userId: String,
        name: String,
        phone: String,
        upiId: String,
        ward: String,
        avatarId: String
    ) {
        val current = userDao.getUserById(userId) ?: return
        val updated = current.copy(
            name = name,
            phone = phone,
            upiId = upiId,
            ward = ward,
            avatarId = avatarId
        )
        userDao.updateUser(updated)
    }

    suspend fun recordDisposalSession(
        userId: String,
        category: String,
        subCategory: String,
        weightKg: Double,
        binLocation: String,
        imageProofUri: String
    ): DisposalLogEntity {
        val user = userDao.getUserById(userId)
        val userName = user?.name ?: "Eco Citizen"
        val userAvatar = user?.avatarId ?: "avatar_1"

        // 100 points per validated kg (1kg = 100 points)
        val points = (weightKg * 100).toInt().coerceAtLeast(1)

        // Potential automatic flag check for suspicious identical submissions or massive single drop
        val isSuspicious = weightKg > 15.0
        val status = if (isSuspicious) "Flagged" else "Verified"
        val flagReason = if (isSuspicious) "Unusual volume spike (>15kg single drop)" else null

        val log = DisposalLogEntity(
            userId = userId,
            userName = userName,
            userAvatarId = userAvatar,
            category = category,
            subCategory = subCategory,
            weightKg = weightKg,
            pointsAwarded = points,
            binLocation = binLocation,
            imageProofUri = imageProofUri,
            status = status,
            flagReason = flagReason,
            timestamp = System.currentTimeMillis()
        )

        val id = disposalDao.insertDisposal(log)

        // Add points and waste to user stats
        userDao.addPointsAndWaste(userId, points, weightKg)

        return log.copy(id = id)
    }

    suspend fun requestWithdrawal(
        userId: String,
        points: Int,
        payoutMethod: String,
        destination: String
    ): Result<WalletTransactionEntity> {
        val user = userDao.getUserById(userId) ?: return Result.failure(Exception("User not found"))
        if (points < 250) {
            return Result.failure(Exception("Minimum withdrawal is 250 points (₹25.00)"))
        }
        if (user.pointsBalance < points) {
            return Result.failure(Exception("Insufficient balance (${user.pointsBalance} pts available)"))
        }

        // 1 pt = ₹0.10, so 500 pts = ₹50
        val amountInr = points * 0.10

        val txn = WalletTransactionEntity(
            userId = userId,
            userName = user.name,
            pointsDebited = points,
            amountInr = amountInr,
            payoutMethod = payoutMethod,
            payoutDestination = destination,
            status = "Pending",
            requestTimestamp = System.currentTimeMillis()
        )

        val txnId = walletDao.insertTransaction(txn)
        userDao.deductPoints(userId, points)

        return Result.success(txn.copy(id = txnId))
    }

    suspend fun approvePayout(transactionId: Long) {
        walletDao.updateTransactionStatus(transactionId, "Transferred", System.currentTimeMillis())
    }

    suspend fun rejectPayout(transactionId: Long, reason: String? = null) {
        val all = walletDao.getAllTransactions().firstOrNull() ?: return
        val txn = all.find { it.id == transactionId } ?: return
        walletDao.updateTransactionStatus(transactionId, "Rejected", System.currentTimeMillis())
        // Refund points back to user
        userDao.addPointsAndWaste(txn.userId, txn.pointsDebited, 0.0)
    }

    suspend fun updateDisposalStatus(logId: Long, status: String, reason: String? = null) {
        disposalDao.updateStatus(logId, status, reason)
    }

    suspend fun removeSampleProfiles() {
        userDao.removeSampleUsers()
        disposalDao.removeSampleDisposals()
        walletDao.removeSampleTransactions()
    }

    suspend fun getFirstRealUser(): UserEntity? {
        return userDao.getFirstRealUser()
    }

    suspend fun initializeDefaultDataIfEmpty() {
        // Purge any lingering legacy sample profiles from the database
        removeSampleProfiles()

        // Seed default Citizen account if not present
        val existingCitizen = userDao.getFirstRealUser()
        if (existingCitizen == null) {
            val citizenUser = UserEntity(
                id = "citizen_primary_1",
                email = "citizen@ecocollect.org",
                name = "Aria Sharma",
                role = "user",
                phone = "+91 98765 43210",
                upiId = "aria.sharma@upi",
                avatarId = "avatar_1",
                ward = "Green Valley Ward 4",
                pointsBalance = 0,
                totalKgDisposed = 0.0,
                weeklyKgDisposed = 0.0
            )
            userDao.insertUser(citizenUser)
        }

        // Ensure Municipal Admin account exists for verification dashboard
        val existingAdmin = userDao.getUserById("admin_municipal_1")
        if (existingAdmin == null) {
            val adminUser = UserEntity(
                id = "admin_municipal_1",
                email = "admin@ecocollect.org",
                name = "Officer Marcus Vance",
                role = "admin",
                phone = "+91 99000 88776",
                upiId = "municipal.treasury@gov",
                avatarId = "avatar_admin",
                ward = "Municipal Control HQ",
                pointsBalance = 0,
                totalKgDisposed = 0.0,
                weeklyKgDisposed = 0.0
            )
            userDao.insertUser(adminUser)
        }

        // Seed Bin Stations if not present
        val existingBins = binDao.getAllBinStations().firstOrNull()
        if (existingBins.isNullOrEmpty()) {
            val bins = listOf(
                BinStationEntity(
                    id = "bin_402",
                    name = "Bin Point #402 - Green Valley Park",
                    ward = "Green Valley Ward 4",
                    address = "Gate 3, Community Garden Promenade",
                    qrCode = "ECO_BIN_402_GV",
                    status = "Active"
                ),
                BinStationEntity(
                    id = "bin_108",
                    name = "Bin Point #108 - Central Metro Gate 2",
                    ward = "Downtown Central Ward 7",
                    address = "Concourse Level Exit B",
                    qrCode = "ECO_BIN_108_MT",
                    status = "Active"
                ),
                BinStationEntity(
                    id = "bin_305",
                    name = "Bin Point #305 - Riverside Market",
                    ward = "Riverside Colony Ward 12",
                    address = "Sector 12 Fresh Produce Pavillion",
                    qrCode = "ECO_BIN_305_RS",
                    status = "Active"
                ),
                BinStationEntity(
                    id = "bin_210",
                    name = "Bin Point #210 - Silicon Tech Hub",
                    ward = "Silicon Heights Ward 15",
                    address = "Tower 4 Eco-Plaza Courtyard",
                    qrCode = "ECO_BIN_210_SH",
                    status = "Active"
                )
            )
            binDao.insertAll(bins)
        }
    }
}
