package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.ui.components.AccountSwitcherDialog
import com.example.ui.components.EcoBottomBar
import com.example.ui.components.EcoTopBar
import com.example.ui.navigation.Screen
import com.example.ui.screens.AdminScreen
import com.example.ui.screens.DisposalScreen
import com.example.ui.screens.ForbiddenScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.LeaderboardScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.ScannerScreen
import com.example.ui.screens.WalletScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.EcoViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                EcoCollectApp()
            }
        }
    }
}

@Composable
fun EcoCollectApp(
    viewModel: EcoViewModel = viewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Home.route

    val currentUser by viewModel.currentUser.collectAsState()
    var showAccountSwitcher by remember { mutableStateOf(false) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            EcoTopBar(
                currentUser = currentUser,
                currentRoute = currentRoute,
                onOpenProfile = {
                    navController.navigate(Screen.Profile.route) {
                        launchSingleTop = true
                    }
                },
                onOpenRoleSwitcher = {
                    showAccountSwitcher = true
                }
            )
        },
        bottomBar = {
            EcoBottomBar(
                currentRoute = currentRoute,
                onNavigate = { route ->
                    if (route == Screen.Admin.route && currentUser?.role != "admin") {
                        navController.navigate(Screen.Forbidden.route) {
                            launchSingleTop = true
                        }
                    } else {
                        navController.navigate(route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel = viewModel,
                    onNavigate = { route ->
                        if (route == Screen.Admin.route && currentUser?.role != "admin") {
                            navController.navigate(Screen.Forbidden.route)
                        } else {
                            navController.navigate(route)
                        }
                    }
                )
            }
            composable(Screen.Scanner.route) {
                ScannerScreen(
                    viewModel = viewModel,
                    onNavigate = { route -> navController.navigate(route) }
                )
            }
            composable(Screen.Disposal.route) {
                DisposalScreen(
                    viewModel = viewModel,
                    onNavigate = { route -> navController.navigate(route) }
                )
            }
            composable(Screen.Wallet.route) {
                WalletScreen(
                    viewModel = viewModel
                )
            }
            composable(Screen.Leaderboard.route) {
                LeaderboardScreen(
                    viewModel = viewModel
                )
            }
            composable(Screen.Admin.route) {
                AdminScreen(
                    viewModel = viewModel,
                    onNavigateToForbidden = {
                        navController.navigate(Screen.Forbidden.route) {
                            popUpTo(Screen.Admin.route) { inclusive = true }
                        }
                    }
                )
            }
            composable(Screen.Forbidden.route) {
                ForbiddenScreen(
                    viewModel = viewModel,
                    onNavigate = { route -> navController.navigate(route) }
                )
            }
            composable(Screen.Profile.route) {
                ProfileScreen(
                    viewModel = viewModel,
                    onNavigate = { route -> navController.navigate(route) }
                )
            }
        }
    }

    if (showAccountSwitcher) {
        AccountSwitcherDialog(
            currentUser = currentUser,
            onDismiss = { showAccountSwitcher = false },
            onSelectUser = { selectedUserId ->
                viewModel.switchUser(selectedUserId)
            }
        )
    }
}
