package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.BinStationEntity
import com.example.data.model.DisposalLogEntity
import com.example.data.model.UserEntity
import com.example.data.model.WalletTransactionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUserById(id: String): UserEntity?

    @Query("SELECT * FROM users WHERE email = :email LIMIT 1")
    suspend fun getUserByEmail(email: String): UserEntity?

    @Query("SELECT * FROM users WHERE LOWER(email) = LOWER(:identifier) OR LOWER(name) = LOWER(:identifier) LIMIT 1")
    suspend fun getUserByNameOrEmail(identifier: String): UserEntity?

    @Query("SELECT * FROM users WHERE (LOWER(email) = LOWER(:email) AND :email != '') OR (LOWER(name) = LOWER(:name) AND :name != '') LIMIT 1")
    suspend fun getUserByNameAndOrEmail(name: String, email: String): UserEntity?

    @Query("SELECT * FROM users WHERE role = 'user' AND id NOT LIKE 'user_citizen_%' AND name NOT IN ('Priya Sharma', 'Alex Green', 'Ananya Sen', 'Rahul Patel', 'New Citizen') ORDER BY totalKgDisposed DESC")
    fun getAllUsersByAllTimeWaste(): Flow<List<UserEntity>>

    @Query("SELECT * FROM users WHERE role = 'user' AND id NOT LIKE 'user_citizen_%' AND name NOT IN ('Priya Sharma', 'Alex Green', 'Ananya Sen', 'Rahul Patel', 'New Citizen') ORDER BY weeklyKgDisposed DESC")
    fun getAllUsersByWeeklyWaste(): Flow<List<UserEntity>>

    @Query("SELECT * FROM users WHERE role = 'user' AND id NOT LIKE 'user_citizen_%' AND name NOT IN ('Priya Sharma', 'Alex Green', 'Ananya Sen', 'Rahul Patel', 'New Citizen') LIMIT 1")
    suspend fun getFirstRealUser(): UserEntity?

    @Query("DELETE FROM users WHERE id LIKE 'user_citizen_%' OR name IN ('Priya Sharma', 'Alex Green', 'Ananya Sen', 'Rahul Patel', 'New Citizen')")
    suspend fun removeSampleUsers()

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Update
    suspend fun updateUser(user: UserEntity)

    @Query("UPDATE users SET pointsBalance = pointsBalance + :deltaPoints, totalKgDisposed = totalKgDisposed + :deltaKg, weeklyKgDisposed = weeklyKgDisposed + :deltaKg WHERE id = :userId")
    suspend fun addPointsAndWaste(userId: String, deltaPoints: Int, deltaKg: Double)

    @Query("UPDATE users SET pointsBalance = pointsBalance - :deductPoints WHERE id = :userId")
    suspend fun deductPoints(userId: String, deductPoints: Int)

    @Query("SELECT COUNT(*) FROM users WHERE role = 'user' AND id NOT LIKE 'user_citizen_%' AND name NOT IN ('Priya Sharma', 'Alex Green', 'Ananya Sen', 'Rahul Patel', 'New Citizen')")
    fun getActiveCitizenCount(): Flow<Int>
}

@Dao
interface DisposalDao {
    @Query("SELECT * FROM disposal_logs ORDER BY timestamp DESC")
    fun getAllDisposals(): Flow<List<DisposalLogEntity>>

    @Query("SELECT * FROM disposal_logs WHERE userId = :userId ORDER BY timestamp DESC")
    fun getDisposalsForUser(userId: String): Flow<List<DisposalLogEntity>>

    @Query("DELETE FROM disposal_logs WHERE userId LIKE 'user_citizen_%' OR userName IN ('Priya Sharma', 'Alex Green', 'Ananya Sen', 'Rahul Patel', 'New Citizen')")
    suspend fun removeSampleDisposals()

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDisposal(log: DisposalLogEntity): Long

    @Update
    suspend fun updateDisposal(log: DisposalLogEntity)

    @Query("UPDATE disposal_logs SET status = :status, flagReason = :reason WHERE id = :id")
    suspend fun updateStatus(id: Long, status: String, reason: String?)

    @Query("SELECT SUM(weightKg) FROM disposal_logs WHERE status != 'Rejected'")
    fun getTotalWasteKg(): Flow<Double?>

    @Query("SELECT SUM(weightKg) FROM disposal_logs WHERE category = 'Biodegradable' AND status != 'Rejected'")
    fun getBiodegradableWasteKg(): Flow<Double?>

    @Query("SELECT SUM(weightKg) FROM disposal_logs WHERE category = 'Non-Biodegradable' AND status != 'Rejected'")
    fun getNonBiodegradableWasteKg(): Flow<Double?>

    @Query("SELECT SUM(pointsAwarded) FROM disposal_logs")
    fun getTotalPointsMinted(): Flow<Int?>
}

@Dao
interface WalletDao {
    @Query("SELECT * FROM wallet_transactions ORDER BY requestTimestamp DESC")
    fun getAllTransactions(): Flow<List<WalletTransactionEntity>>

    @Query("SELECT * FROM wallet_transactions WHERE userId = :userId ORDER BY requestTimestamp DESC")
    fun getTransactionsForUser(userId: String): Flow<List<WalletTransactionEntity>>

    @Query("DELETE FROM wallet_transactions WHERE userId LIKE 'user_citizen_%' OR userName IN ('Priya Sharma', 'Alex Green', 'Ananya Sen', 'Rahul Patel', 'New Citizen')")
    suspend fun removeSampleTransactions()

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: WalletTransactionEntity): Long

    @Query("UPDATE wallet_transactions SET status = :status, processedTimestamp = :timestamp WHERE id = :id")
    suspend fun updateTransactionStatus(id: Long, status: String, timestamp: Long)

    @Query("SELECT SUM(amountInr) FROM wallet_transactions WHERE status = 'Pending'")
    fun getPendingCashoutSum(): Flow<Double?>

    @Query("SELECT SUM(amountInr) FROM wallet_transactions WHERE status IN ('Approved', 'Transferred')")
    fun getSettledCashoutSum(): Flow<Double?>
}

@Dao
interface BinDao {
    @Query("SELECT * FROM bin_stations")
    fun getAllBinStations(): Flow<List<BinStationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(stations: List<BinStationEntity>)
}
