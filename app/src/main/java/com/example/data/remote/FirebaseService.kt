package com.example.data.remote

import android.content.Context
import android.util.Log
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import com.example.BuildConfig
import com.example.data.model.DisposalLogEntity
import com.example.data.model.UserEntity
import com.example.data.model.WalletTransactionEntity
import com.google.android.gms.tasks.Task
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class FirebaseService(private val context: Context) {

    companion object {
        private const val TAG = "FirebaseService"
        @Volatile
        private var instance: FirebaseService? = null

        fun getInstance(context: Context): FirebaseService {
            return instance ?: synchronized(this) {
                instance ?: FirebaseService(context.applicationContext).also { instance = it }
            }
        }
    }

    init {
        ensureFirebaseInitialized()
    }

    private fun ensureFirebaseInitialized() {
        if (FirebaseApp.getApps(context).isEmpty()) {
            try {
                val projectId = try {
                    BuildConfig.FIREBASE_PROJECT_ID.ifEmpty { "gen-lang-client-0876694483" }
                } catch (e: Throwable) {
                    "gen-lang-client-0876694483"
                }
                val apiKey = try {
                    BuildConfig.GEMINI_API_KEY.ifEmpty { "AIzaSyFakeKeyForDefaultFirebaseInit" }
                } catch (e: Throwable) {
                    "AIzaSyFakeKeyForDefaultFirebaseInit"
                }

                val options = FirebaseOptions.Builder()
                    .setApplicationId(context.packageName)
                    .setApiKey(apiKey)
                    .setProjectId(projectId)
                    .build()
                FirebaseApp.initializeApp(context, options)
                Log.d(TAG, "FirebaseApp initialized dynamically with project: $projectId")
            } catch (e: Exception) {
                Log.w(TAG, "FirebaseApp initialization note: ${e.localizedMessage}")
            }
        }
    }

    val auth: FirebaseAuth?
        get() = try {
            FirebaseAuth.getInstance()
        } catch (e: Exception) {
            Log.w(TAG, "FirebaseAuth not available: ${e.message}")
            null
        }

    val firestore: FirebaseFirestore?
        get() = try {
            FirebaseFirestore.getInstance()
        } catch (e: Exception) {
            Log.w(TAG, "FirebaseFirestore not available: ${e.message}")
            null
        }

    val currentFirebaseUser: FirebaseUser?
        get() = auth?.currentUser

    /**
     * Google Sign-in with Firebase Auth via Credential Manager
     */
    suspend fun signInWithGoogle(): Result<FirebaseUser> {
        return try {
            val firebaseAuth = auth ?: return Result.failure(IllegalStateException("Firebase Auth is not available"))
            val credentialManager = CredentialManager.create(context)

            val serverClientId = try {
                val id = BuildConfig.GOOGLE_WEB_CLIENT_ID
                if (id.isNotBlank() && !id.contains("YOUR_GOOGLE_WEB_CLIENT_ID")) id else ""
            } catch (e: Throwable) {
                ""
            }

            val googleIdOptionBuilder = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setAutoSelectEnabled(false)

            if (serverClientId.isNotBlank()) {
                googleIdOptionBuilder.setServerClientId(serverClientId)
            } else {
                // If not configured in secrets yet, prompt fallback or standard client ID
                googleIdOptionBuilder.setServerClientId("751771178617-apps.googleusercontent.com")
            }

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOptionBuilder.build())
                .build()

            val result = credentialManager.getCredential(context, request)
            val credential = result.credential

            if (credential is CustomCredential && credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                val idToken = googleIdTokenCredential.idToken
                val authCredential = GoogleAuthProvider.getCredential(idToken, null)
                val authResult = firebaseAuth.signInWithCredential(authCredential).awaitResult()
                val user = authResult.user
                if (user != null) {
                    Result.success(user)
                } else {
                    Result.failure(IllegalStateException("Google Sign-In succeeded but user is null"))
                }
            } else {
                Result.failure(IllegalStateException("Unexpected credential type: ${credential.type}"))
            }
        } catch (e: GetCredentialCancellationException) {
            Result.failure(Exception("Google Sign-In was cancelled by user."))
        } catch (e: GetCredentialException) {
            Result.failure(Exception("Google Sign-In failed: ${e.message}"))
        } catch (e: Exception) {
            Log.e(TAG, "Error during Google Sign-In", e)
            Result.failure(e)
        }
    }

    /**
     * Firebase Auth Email & Password Sign In
     */
    suspend fun signInWithEmail(email: String, password: String): Result<FirebaseUser> {
        return try {
            val firebaseAuth = auth ?: return Result.failure(IllegalStateException("Firebase Auth not initialized"))
            val result = firebaseAuth.signInWithEmailAndPassword(email.trim(), password).awaitResult()
            val user = result.user ?: return Result.failure(IllegalStateException("User is null"))
            Result.success(user)
        } catch (e: Exception) {
            Log.e(TAG, "Firebase signInWithEmail error", e)
            Result.failure(e)
        }
    }

    /**
     * Firebase Auth Email & Password Register
     */
    suspend fun registerWithEmail(email: String, password: String): Result<FirebaseUser> {
        return try {
            val firebaseAuth = auth ?: return Result.failure(IllegalStateException("Firebase Auth not initialized"))
            val result = firebaseAuth.createUserWithEmailAndPassword(email.trim(), password).awaitResult()
            val user = result.user ?: return Result.failure(IllegalStateException("User is null"))
            Result.success(user)
        } catch (e: Exception) {
            Log.e(TAG, "Firebase registerWithEmail error", e)
            Result.failure(e)
        }
    }

    suspend fun signOut() {
        try {
            auth?.signOut()
            val credentialManager = CredentialManager.create(context)
            credentialManager.clearCredentialState(ClearCredentialStateRequest())
        } catch (e: Exception) {
            Log.w(TAG, "Sign out cleanup note: ${e.message}")
        }
    }

    // ==========================================
    // FIRESTORE PERSISTENCE
    // ==========================================

    /**
     * Syncs or saves a User profile to Firestore collection "users"
     */
    suspend fun saveUserToFirestore(user: UserEntity): Result<Unit> {
        return try {
            val db = firestore ?: return Result.failure(IllegalStateException("Firestore is not available"))
            val userMap = hashMapOf(
                "id" to user.id,
                "email" to user.email,
                "name" to user.name,
                "role" to user.role,
                "phone" to user.phone,
                "upiId" to user.upiId,
                "avatarId" to user.avatarId,
                "ward" to user.ward,
                "pointsBalance" to user.pointsBalance,
                "totalKgDisposed" to user.totalKgDisposed,
                "weeklyKgDisposed" to user.weeklyKgDisposed,
                "joinedTimestamp" to user.joinedTimestamp,
                "lastSyncedAt" to FieldValue.serverTimestamp()
            )
            db.collection("users")
                .document(user.id)
                .set(userMap, SetOptions.merge())
                .awaitResult()
            Result.success(Unit)
        } catch (e: Exception) {
            Log.w(TAG, "saveUserToFirestore error: ${e.message}")
            Result.failure(e)
        }
    }

    /**
     * Fetches a User from Firestore by ID
     */
    suspend fun getUserFromFirestore(userId: String): UserEntity? {
        return try {
            val db = firestore ?: return null
            val snapshot = db.collection("users").document(userId).get().awaitResult()
            if (!snapshot.exists()) return null

            UserEntity(
                id = snapshot.getString("id") ?: userId,
                email = snapshot.getString("email") ?: "",
                name = snapshot.getString("name") ?: "Citizen",
                role = snapshot.getString("role") ?: "user",
                phone = snapshot.getString("phone") ?: "+91 90000 12345",
                upiId = snapshot.getString("upiId") ?: "citizen@upi",
                avatarId = snapshot.getString("avatarId") ?: "avatar_1",
                ward = snapshot.getString("ward") ?: "Green Valley Ward 4",
                pointsBalance = (snapshot.getLong("pointsBalance") ?: 0L).toInt(),
                totalKgDisposed = snapshot.getDouble("totalKgDisposed") ?: 0.0,
                weeklyKgDisposed = snapshot.getDouble("weeklyKgDisposed") ?: 0.0,
                joinedTimestamp = snapshot.getLong("joinedTimestamp") ?: System.currentTimeMillis()
            )
        } catch (e: Exception) {
            Log.w(TAG, "getUserFromFirestore error: ${e.message}")
            null
        }
    }

    /**
     * Real-time listener for user profile from Firestore
     */
    fun observeUserFromFirestore(userId: String): Flow<UserEntity?> = callbackFlow {
        val db = firestore
        if (db == null) {
            trySend(null)
            close()
            return@callbackFlow
        }

        val listener = db.collection("users").document(userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w(TAG, "Firestore user listener error: ${error.message}")
                    return@addSnapshotListener
                }
                if (snapshot != null && snapshot.exists()) {
                    val user = UserEntity(
                        id = snapshot.getString("id") ?: userId,
                        email = snapshot.getString("email") ?: "",
                        name = snapshot.getString("name") ?: "Citizen",
                        role = snapshot.getString("role") ?: "user",
                        phone = snapshot.getString("phone") ?: "+91 90000 12345",
                        upiId = snapshot.getString("upiId") ?: "citizen@upi",
                        avatarId = snapshot.getString("avatarId") ?: "avatar_1",
                        ward = snapshot.getString("ward") ?: "Green Valley Ward 4",
                        pointsBalance = (snapshot.getLong("pointsBalance") ?: 0L).toInt(),
                        totalKgDisposed = snapshot.getDouble("totalKgDisposed") ?: 0.0,
                        weeklyKgDisposed = snapshot.getDouble("weeklyKgDisposed") ?: 0.0,
                        joinedTimestamp = snapshot.getLong("joinedTimestamp") ?: System.currentTimeMillis()
                    )
                    trySend(user)
                }
            }

        awaitClose { listener.remove() }
    }

    /**
     * Real-time listener for all real registered users from Firestore for the community leaderboard
     */
    fun observeAllRealUsersFromFirestore(): Flow<List<UserEntity>> = callbackFlow {
        val db = firestore
        if (db == null) {
            trySend(emptyList())
            close()
            return@callbackFlow
        }

        val sampleNames = setOf("Priya Sharma", "Alex Green", "Ananya Sen", "Rahul Patel", "New Citizen")
        val listener = db.collection("users")
            .whereEqualTo("role", "user")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w(TAG, "Firestore all users listener error: ${error.message}")
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val users = snapshot.documents.mapNotNull { doc ->
                        val id = doc.getString("id") ?: doc.id
                        val name = doc.getString("name") ?: "Citizen"
                        val email = doc.getString("email") ?: ""
                        if (id.startsWith("user_citizen_") || name in sampleNames || email.endsWith("@example.com")) {
                            null
                        } else {
                            UserEntity(
                                id = id,
                                email = email,
                                name = name,
                                role = doc.getString("role") ?: "user",
                                phone = doc.getString("phone") ?: "+91 90000 12345",
                                upiId = doc.getString("upiId") ?: "citizen@upi",
                                avatarId = doc.getString("avatarId") ?: "avatar_1",
                                ward = doc.getString("ward") ?: "Green Valley Ward 4",
                                pointsBalance = (doc.getLong("pointsBalance") ?: 0L).toInt(),
                                totalKgDisposed = doc.getDouble("totalKgDisposed") ?: 0.0,
                                weeklyKgDisposed = doc.getDouble("weeklyKgDisposed") ?: 0.0,
                                joinedTimestamp = doc.getLong("joinedTimestamp") ?: System.currentTimeMillis()
                            )
                        }
                    }
                    trySend(users)
                }
            }

        awaitClose { listener.remove() }
    }

    /**
     * Saves disposal log to Firestore and increments points atomically
     */
    suspend fun saveDisposalToFirestore(disposal: DisposalLogEntity): Result<Unit> {
        return try {
            val db = firestore ?: return Result.failure(IllegalStateException("Firestore not available"))
            val docId = "${disposal.userId}_${disposal.timestamp}"
            val disposalMap = hashMapOf(
                "id" to disposal.id,
                "userId" to disposal.userId,
                "userName" to disposal.userName,
                "userAvatarId" to disposal.userAvatarId,
                "category" to disposal.category,
                "subCategory" to disposal.subCategory,
                "weightKg" to disposal.weightKg,
                "pointsAwarded" to disposal.pointsAwarded,
                "binLocation" to disposal.binLocation,
                "imageProofUri" to disposal.imageProofUri,
                "status" to disposal.status,
                "flagReason" to disposal.flagReason,
                "timestamp" to disposal.timestamp
            )

            // Write disposal log document
            db.collection("disposals")
                .document(docId)
                .set(disposalMap)
                .awaitResult()

            // Atomically update user document points and kg disposed in Firestore
            val userRef = db.collection("users").document(disposal.userId)
            db.runTransaction { transaction ->
                val snapshot = transaction.get(userRef)
                if (snapshot.exists()) {
                    val currentPoints = (snapshot.getLong("pointsBalance") ?: 0L).toInt()
                    val currentTotalKg = snapshot.getDouble("totalKgDisposed") ?: 0.0
                    val currentWeeklyKg = snapshot.getDouble("weeklyKgDisposed") ?: 0.0

                    transaction.update(
                        userRef,
                        "pointsBalance", currentPoints + disposal.pointsAwarded,
                        "totalKgDisposed", currentTotalKg + disposal.weightKg,
                        "weeklyKgDisposed", currentWeeklyKg + disposal.weightKg,
                        "lastDisposalAt", FieldValue.serverTimestamp()
                    )
                }
            }.awaitResult()

            Result.success(Unit)
        } catch (e: Exception) {
            Log.w(TAG, "saveDisposalToFirestore error: ${e.message}")
            Result.failure(e)
        }
    }

    /**
     * Saves wallet cashout transaction to Firestore
     */
    suspend fun saveTransactionToFirestore(transaction: WalletTransactionEntity): Result<Unit> {
        return try {
            val db = firestore ?: return Result.failure(IllegalStateException("Firestore not available"))
            val docId = "${transaction.userId}_${transaction.requestTimestamp}"
            val map = hashMapOf(
                "id" to transaction.id,
                "userId" to transaction.userId,
                "userName" to transaction.userName,
                "pointsDebited" to transaction.pointsDebited,
                "amountInr" to transaction.amountInr,
                "payoutMethod" to transaction.payoutMethod,
                "payoutDestination" to transaction.payoutDestination,
                "status" to transaction.status,
                "requestTimestamp" to transaction.requestTimestamp,
                "processedTimestamp" to transaction.processedTimestamp
            )
            db.collection("transactions").document(docId).set(map).awaitResult()
            Result.success(Unit)
        } catch (e: Exception) {
            Log.w(TAG, "saveTransactionToFirestore error: ${e.message}")
            Result.failure(e)
        }
    }
}

/**
 * Clean coroutine await extension for Google/Firebase Tasks
 */
suspend fun <T> Task<T>.awaitResult(): T = suspendCancellableCoroutine { cont ->
    addOnSuccessListener { result ->
        if (cont.isActive) cont.resume(result)
    }
    addOnFailureListener { exception ->
        if (cont.isActive) cont.resumeWithException(exception)
    }
    addOnCanceledListener {
        if (cont.isActive) cont.cancel()
    }
}
