package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.data.model.BinStationEntity
import com.example.data.model.DisposalLogEntity
import com.example.data.model.UserEntity
import com.example.data.model.WalletTransactionEntity

@Database(
    entities = [
        UserEntity::class,
        DisposalLogEntity::class,
        WalletTransactionEntity::class,
        BinStationEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class EcoCollectDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun disposalDao(): DisposalDao
    abstract fun walletDao(): WalletDao
    abstract fun binDao(): BinDao

    companion object {
        @Volatile
        private var INSTANCE: EcoCollectDatabase? = null

        fun getDatabase(context: Context): EcoCollectDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    EcoCollectDatabase::class.java,
                    "ecocollect_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
