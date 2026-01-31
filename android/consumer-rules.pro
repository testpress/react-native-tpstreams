# Keep DownloadHelper and its Callback to prevent AbstractMethodError in release builds
# This ensures that the Callback interface and DownloadHelper methods are not stripped or renamed incorrectly by R8
-keep class androidx.media3.exoplayer.offline.DownloadHelper { public *; }
-keep interface androidx.media3.exoplayer.offline.DownloadHelper$Callback { *; }
