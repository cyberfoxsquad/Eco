package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = DarkPrimary,
    onPrimary = Color(0xFF003822),
    primaryContainer = EcoEmeraldDark,
    onPrimaryContainer = Color(0xFF6EE7B7),
    secondary = DarkSecondary,
    onSecondary = Color(0xFF003544),
    secondaryContainer = EcoSkyDark,
    onSecondaryContainer = Color(0xFFBAE6FD),
    tertiary = DarkTertiary,
    onTertiary = Color(0xFF452B00),
    tertiaryContainer = Color(0xFF654100),
    onTertiaryContainer = Color(0xFFFFDDB3),
    background = DarkBackground,
    onBackground = Color(0xFFE2E8F0),
    surface = DarkSurface,
    onSurface = Color(0xFFE2E8F0),
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = Color(0xFF94A3B8)
)

private val LightColorScheme = lightColorScheme(
    primary = EcoEmerald,
    onPrimary = Color.White,
    primaryContainer = EcoEmeraldContainer,
    onPrimaryContainer = EcoEmeraldDark,
    secondary = EcoSky,
    onSecondary = Color.White,
    secondaryContainer = EcoSkyContainer,
    onSecondaryContainer = EcoSkyDark,
    tertiary = EcoAmber,
    onTertiary = Color.White,
    tertiaryContainer = EcoAmberContainer,
    onTertiaryContainer = Color(0xFF78350F),
    background = NeutralBg,
    onBackground = NeutralDark,
    surface = Color.White,
    onSurface = NeutralDark,
    surfaceVariant = Color(0xFFF1F5F9),
    onSurfaceVariant = NeutralSlate,
    outline = NeutralBorder
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Prefer our cohesive brand green/teal theme
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
