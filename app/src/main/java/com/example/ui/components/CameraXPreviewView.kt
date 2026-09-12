package com.example.ui.components

import android.graphics.Bitmap
import android.util.Log
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cameraswitch
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FlashOff
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.example.ui.theme.EcoEmerald

@Composable
fun CameraXViewfinder(
    modifier: Modifier = Modifier,
    onImageCaptured: (Bitmap) -> Unit,
    onError: (String) -> Unit = {},
    onClose: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val executor = remember { ContextCompat.getMainExecutor(context) }

    var lensFacing by remember { mutableIntStateOf(CameraSelector.LENS_FACING_BACK) }
    var isTorchOn by remember { mutableStateOf(false) }
    var camera by remember { mutableStateOf<Camera?>(null) }
    var isCapturing by remember { mutableStateOf(false) }
    var previewViewRef by remember { mutableStateOf<PreviewView?>(null) }

    val imageCapture = remember {
        ImageCapture.Builder()
            .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
            .build()
    }

    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }

    LaunchedEffect(lensFacing, previewViewRef) {
        val pv = previewViewRef ?: return@LaunchedEffect
        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()
                val preview = Preview.Builder().build().also {
                    it.surfaceProvider = pv.surfaceProvider
                }
                val cameraSelector = CameraSelector.Builder()
                    .requireLensFacing(lensFacing)
                    .build()

                cameraProvider.unbindAll()
                camera = cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageCapture
                )
            } catch (e: Exception) {
                Log.e("CameraX", "Camera binding error: ${e.message}", e)
                onError("Failed to start camera: ${e.message}")
            }
        }, executor)
    }

    DisposableEffect(Unit) {
        onDispose {
            try {
                if (cameraProviderFuture.isDone) {
                    cameraProviderFuture.get().unbindAll()
                }
            } catch (e: Exception) {
                Log.e("CameraX", "Camera unbind error: ${e.message}", e)
            }
        }
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(Color.Black)
            .testTag("camerax_viewfinder_box")
    ) {
        // CameraX Live Preview View
        AndroidView(
            factory = { ctx ->
                PreviewView(ctx).apply {
                    implementationMode = PreviewView.ImplementationMode.COMPATIBLE
                    previewViewRef = this
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // Overlay Viewfinder Framing Guide
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(160.dp)
                    .border(2.dp, EcoEmerald.copy(alpha = 0.8f), RoundedCornerShape(16.dp))
            )
        }

        // Top Toolbar: Flash, Close, Lens Switch
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Close camera mode
            IconButton(
                onClick = onClose,
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = Color.Black.copy(alpha = 0.5f),
                    contentColor = Color.White
                ),
                modifier = Modifier
                    .size(40.dp)
                    .testTag("camerax_close_button")
            ) {
                Icon(Icons.Default.Close, contentDescription = "Close Camera", modifier = Modifier.size(20.dp))
            }

            Surface(
                color = Color.Black.copy(alpha = 0.55f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "Live CameraX AI Scanner",
                    color = Color.White,
                    fontSize = 11.sp,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                // Torch toggle
                IconButton(
                    onClick = {
                        val cam = camera
                        if (cam != null && cam.cameraInfo.hasFlashUnit()) {
                            isTorchOn = !isTorchOn
                            cam.cameraControl.enableTorch(isTorchOn)
                        }
                    },
                    colors = IconButtonDefaults.iconButtonColors(
                        containerColor = if (isTorchOn) EcoEmerald else Color.Black.copy(alpha = 0.5f),
                        contentColor = Color.White
                    ),
                    modifier = Modifier
                        .size(40.dp)
                        .testTag("camerax_torch_button")
                ) {
                    Icon(
                        imageVector = if (isTorchOn) Icons.Default.FlashOn else Icons.Default.FlashOff,
                        contentDescription = "Toggle Torch",
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Lens switch (Front / Back)
                IconButton(
                    onClick = {
                        lensFacing = if (lensFacing == CameraSelector.LENS_FACING_BACK) {
                            CameraSelector.LENS_FACING_FRONT
                        } else {
                            CameraSelector.LENS_FACING_BACK
                        }
                    },
                    colors = IconButtonDefaults.iconButtonColors(
                        containerColor = Color.Black.copy(alpha = 0.5f),
                        contentColor = Color.White
                    ),
                    modifier = Modifier
                        .size(40.dp)
                        .testTag("camerax_switch_lens_button")
                ) {
                    Icon(Icons.Default.Cameraswitch, contentDescription = "Switch Camera", modifier = Modifier.size(20.dp))
                }
            }
        }

        // Bottom Shutter Button
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color.Black.copy(alpha = 0.4f))
                .padding(bottom = 16.dp, top = 8.dp),
            contentAlignment = Alignment.Center
        ) {
            IconButton(
                onClick = {
                    if (!isCapturing) {
                        isCapturing = true
                        imageCapture.takePicture(
                            executor,
                            object : ImageCapture.OnImageCapturedCallback() {
                                override fun onCaptureSuccess(image: ImageProxy) {
                                    try {
                                        val bitmap = image.toBitmap()
                                        onImageCaptured(bitmap)
                                    } catch (e: Exception) {
                                        Log.e("CameraX", "Bitmap conversion error: ${e.message}", e)
                                        onError("Image capture processing error")
                                    } finally {
                                        image.close()
                                        isCapturing = false
                                    }
                                }

                                override fun onError(exception: ImageCaptureException) {
                                    Log.e("CameraX", "Capture failed: ${exception.message}", exception)
                                    isCapturing = false
                                    onError("Failed to take photo: ${exception.message}")
                                }
                            }
                        )
                    }
                },
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = Color.White,
                    contentColor = EcoEmerald
                ),
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .border(3.dp, EcoEmerald, CircleShape)
                    .testTag("camerax_shutter_button")
            ) {
                if (isCapturing) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(32.dp),
                        color = EcoEmerald,
                        strokeWidth = 3.dp
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.PhotoCamera,
                        contentDescription = "Snap Photo",
                        tint = EcoEmerald,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }
        }
    }
}
