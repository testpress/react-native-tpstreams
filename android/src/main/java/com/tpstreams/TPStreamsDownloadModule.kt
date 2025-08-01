package com.tpstreams

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.tpstreams.player.download.DownloadClient
import com.tpstreams.player.download.DownloadItem

class TPStreamsDownloadModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), DownloadClient.Listener {

    private val downloadClient: DownloadClient by lazy {
        DownloadClient.getInstance(reactContext)
    }

    private var isListening = false

    override fun getName(): String {
        return "TPStreamsDownload"
    }

    @ReactMethod
    fun addDownloadProgressListener(promise: Promise) {
        try {
            if (!isListening) {
                downloadClient.addListener(this)
                isListening = true
                Log.d(TAG, "Started listening for download progress")
            }
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting progress listener: ${e.message}", e)
            promise.reject("PROGRESS_LISTENER_START_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun removeDownloadProgressListener(promise: Promise) {
        try {
            if (isListening) {
                downloadClient.removeListener(this)
                isListening = false
                Log.d(TAG, "Stopped listening for download progress")
            }
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping progress listener: ${e.message}", e)
            promise.reject("PROGRESS_LISTENER_STOP_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required by NativeEventEmitter - no action needed
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required by NativeEventEmitter - no action needed
    }

    override fun onDownloadsChanged() {
        try {
            val currentDownloads = downloadClient.getAllDownloadItems()
            
            val result = Arguments.createArray()
            for (item in currentDownloads) {
                val map = Arguments.createMap()
                map.putString("videoId", item.assetId)
                map.putString("title", item.title)
                item.thumbnailUrl?.let { map.putString("thumbnailUrl", it) }
                map.putDouble("totalBytes", item.totalBytes.toDouble())
                map.putDouble("downloadedBytes", item.downloadedBytes.toDouble())
                map.putDouble("progressPercentage", item.progressPercentage.toDouble())
                map.putString("state", downloadClient.getDownloadStatus(item.assetId))
                
                val metadataJson = org.json.JSONObject()
                item.metadata.forEach { (key, value) ->
                    metadataJson.put(key, value)
                }
                map.putString("metadata", metadataJson.toString())
                
                result.pushMap(map)
            }
            
            emitEvent("onDownloadProgressChanged", result)
                
        } catch (e: Exception) {
            Log.e(TAG, "Error in onDownloadsChanged: ${e.message}", e)
        }
    }

    private fun emitEvent(eventName: String, data: Any) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }

    @ReactMethod
    fun pauseDownload(videoId: String, promise: Promise) {
        try {
            downloadClient.pauseDownload(videoId)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error pausing download: ${e.message}", e)
            promise.reject("DOWNLOAD_PAUSE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun resumeDownload(videoId: String, promise: Promise) {
        try {
            downloadClient.resumeDownload(videoId)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error resuming download: ${e.message}", e)
            promise.reject("DOWNLOAD_RESUME_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun removeDownload(videoId: String, promise: Promise) {
        try {
            downloadClient.removeDownload(videoId)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing download: ${e.message}", e)
            promise.reject("DOWNLOAD_REMOVE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isDownloaded(videoId: String, promise: Promise) {
        try {
            val isDownloaded = downloadClient.isDownloaded(videoId)
            promise.resolve(isDownloaded)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if downloaded: ${e.message}", e)
            promise.reject("DOWNLOAD_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isDownloading(videoId: String, promise: Promise) {
        try {
            val isDownloading = downloadClient.isDownloading(videoId)
            promise.resolve(isDownloading)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if downloading: ${e.message}", e)
            promise.reject("DOWNLOAD_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isPaused(videoId: String, promise: Promise) {
        try {
            val isPaused = downloadClient.isPaused(videoId)
            promise.resolve(isPaused)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if paused: ${e.message}", e)
            promise.reject("DOWNLOAD_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getDownloadStatus(videoId: String, promise: Promise) {
        try {
            val status = downloadClient.getDownloadStatus(videoId)
            promise.resolve(status)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting download status: ${e.message}", e)
            promise.reject("DOWNLOAD_STATUS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getAllDownloads(promise: Promise) {
        try {
            val downloadItems = downloadClient.getAllDownloadItems()
            val result = Arguments.createArray()
            
            for (item in downloadItems) {
                val map = Arguments.createMap()
                map.putString("videoId", item.assetId)
                map.putString("title", item.title)
                item.thumbnailUrl?.let { map.putString("thumbnailUrl", it) }
                map.putDouble("totalBytes", item.totalBytes.toDouble())
                map.putDouble("downloadedBytes", item.downloadedBytes.toDouble())
                map.putDouble("progressPercentage", item.progressPercentage.toDouble())
                map.putString("state", downloadClient.getDownloadStatus(item.assetId))
                
                try {
                    val metadataJson = org.json.JSONObject(item.metadata as Map<*, *>)
                    map.putString("metadata", metadataJson.toString())
                } catch (e: Exception) {
                    Log.w(TAG, "Error serializing metadata for item ${item.assetId}: ${e.message}")
                    map.putString("metadata", "{}")
                }
                
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