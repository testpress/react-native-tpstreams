package com.tpstreams

import android.util.Log
import com.facebook.react.bridge.*
import com.tpstreams.player.download.DownloadClient
import com.tpstreams.player.download.DownloadItem
import androidx.media3.exoplayer.offline.Download

class TPStreamsDownloadModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val downloadClient: DownloadClient by lazy {
        DownloadClient.getInstance(reactContext)
    }

    override fun getName(): String {
        return "TPStreamsDownload"
    }

    @ReactMethod
    fun pauseDownload(assetId: String, promise: Promise) {
        try {
            downloadClient.pauseDownload(assetId)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error pausing download: ${e.message}", e)
            promise.reject("DOWNLOAD_PAUSE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun resumeDownload(assetId: String, promise: Promise) {
        try {
            downloadClient.resumeDownload(assetId)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error resuming download: ${e.message}", e)
            promise.reject("DOWNLOAD_RESUME_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun removeDownload(assetId: String, promise: Promise) {
        try {
            downloadClient.removeDownload(assetId)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing download: ${e.message}", e)
            promise.reject("DOWNLOAD_REMOVE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isDownloaded(assetId: String, promise: Promise) {
        try {
            val isDownloaded = downloadClient.isDownloaded(assetId)
            promise.resolve(isDownloaded)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if downloaded: ${e.message}", e)
            promise.reject("DOWNLOAD_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isDownloading(assetId: String, promise: Promise) {
        try {
            val isDownloading = downloadClient.isDownloading(assetId)
            promise.resolve(isDownloading)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if downloading: ${e.message}", e)
            promise.reject("DOWNLOAD_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isPaused(assetId: String, promise: Promise) {
        try {
            val isPaused = downloadClient.isPaused(assetId)
            promise.resolve(isPaused)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if paused: ${e.message}", e)
            promise.reject("DOWNLOAD_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getDownloadStatus(assetId: String, promise: Promise) {
        try {
            val status = downloadClient.getDownloadStatus(assetId)
            promise.resolve(status)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting download status: ${e.message}", e)
            promise.reject("DOWNLOAD_STATUS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getAllDownloadItems(promise: Promise) {
        try {
            val downloadItems = downloadClient.getAllDownloadItems()
            val result = Arguments.createArray()
            
            for (item in downloadItems) {
                val map = Arguments.createMap()
                map.putString("assetId", item.assetId)
                map.putString("title", item.title)
                item.thumbnailUrl?.let { map.putString("thumbnailUrl", it) }
                map.putDouble("totalBytes", item.totalBytes.toDouble())
                map.putDouble("downloadedBytes", item.downloadedBytes.toDouble())
                map.putDouble("progressPercentage", item.progressPercentage.toDouble())
                map.putInt("state", item.state)
                
                result.pushMap(map)
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all download items: ${e.message}", e)
            promise.reject("DOWNLOAD_ITEMS_ERROR", e.message, e)
        }
    }

    companion object {
        private const val TAG = "TPStreamsDownloadModule"
    }
} 