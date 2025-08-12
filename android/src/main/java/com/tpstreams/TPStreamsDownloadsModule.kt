package com.tpstreams

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.tpstreams.NativeTPStreamsDownloadsSpec
import com.tpstreams.player.download.DownloadClient
import com.tpstreams.player.download.DownloadItem
import org.json.JSONObject
import com.facebook.react.bridge.WritableMap

class TPStreamsDownloadsModule(private val reactContext: ReactApplicationContext) : 
    NativeTPStreamsDownloadsSpec(reactContext), 
    DownloadClient.Listener {

    private val downloadClient: DownloadClient by lazy {
        DownloadClient.getInstance(reactContext)
    }

    private var isListening = false
    private val TAG = "TPStreamsDownloadsModule"

    override fun getAll(promise: Promise) {
        try {
            val downloadItems = downloadClient.getAllDownloadItems()
            val result = Arguments.createArray()
            
            for (item in downloadItems) {
                result.pushMap(convertDownloadItemToMap(item))
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all download items: ${e.message}", e)
            promise.reject("DOWNLOAD_ITEMS_ERROR", e.message, e)
        }
    }

    override fun get(videoId: String, promise: Promise) {
        try {
            val download = downloadClient.getDownload(videoId)
            download?.let { 
                val item = downloadClient.createDownloadItem(it)
                promise.resolve(convertDownloadItemToMap(item))
            } ?: promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting download item: ${e.message}", e)
            promise.reject("DOWNLOAD_ITEM_ERROR", e.message, e)
        }
    }

    override fun pause(videoId: String, promise: Promise) {
        try {
            downloadClient.pauseDownload(videoId)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error pausing download: ${e.message}", e)
            promise.reject("DOWNLOAD_PAUSE_ERROR", e.message, e)
        }
    }

    override fun resume(videoId: String, promise: Promise) {
        try {
            downloadClient.resumeDownload(videoId)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error resuming download: ${e.message}", e)
            promise.reject("DOWNLOAD_RESUME_ERROR", e.message, e)
        }
    }

    override fun remove(videoId: String, promise: Promise) {
        try {
            downloadClient.removeDownload(videoId)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing download: ${e.message}", e)
            promise.reject("DOWNLOAD_REMOVE_ERROR", e.message, e)
        }
    }

    override fun startProgressUpdates() {
        if (!isListening) {
            downloadClient.addListener(this)
            isListening = true
            Log.d(TAG, "Started listening for download progress updates")
        }
    }

    override fun stopProgressUpdates() {
        if (isListening) {
            downloadClient.removeListener(this)
            isListening = false
            Log.d(TAG, "Stopped listening for download progress updates")
        }
    }

    override fun addListener(eventName: String) {
        // Required by NativeEventEmitter, but no-op
        // Actual listener registration happens in startProgressUpdates
    }

    override fun removeListeners(count: Double) {
        // Required by NativeEventEmitter, but no-op
        // Actual listener removal happens in stopProgressUpdates
    }

    override fun onDownloadsChanged() {
        try {
            val currentDownloads = downloadClient.getAllDownloadItems()
            
            val result = Arguments.createArray()
            for (item in currentDownloads) {
                result.pushMap(convertDownloadItemToMap(item))
            }
            
            emitEvent("onDownloadProgressChanged", result)
        } catch (e: Exception) {
            Log.e(TAG, "Error in onDownloadsChanged: ${e.message}", e)
        }
    }

    private fun convertDownloadItemToMap(item: DownloadItem): WritableMap {
        val map = Arguments.createMap()
        map.putString("videoId", item.assetId)
        map.putString("title", item.title)
        item.thumbnailUrl?.let { map.putString("thumbnailUrl", it) }
        map.putDouble("totalBytes", item.totalBytes.toDouble())
        map.putDouble("downloadedBytes", item.downloadedBytes.toDouble())
        map.putDouble("progressPercentage", item.progressPercentage.toDouble())
        map.putString("state", downloadClient.getDownloadStatus(item.assetId))
        return map
    }

    private fun emitEvent(eventName: String, data: Any) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }
}
