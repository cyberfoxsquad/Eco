package com.example.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Auth : Screen("auth", "Sign In")
    object Home : Screen("home", "Home")
    object Scanner : Screen("scanner", "AI Waste Scanner")
    object Disposal : Screen("disposal", "Disposal Drop-off")
    object Wallet : Screen("wallet", "Rewards Dashboard")
    object Leaderboard : Screen("leaderboard", "Leaderboard")
    object Admin : Screen("admin", "Admin Control")
    object Forbidden : Screen("forbidden", "Access Forbidden")
    object Profile : Screen("profile", "Profile")
}
