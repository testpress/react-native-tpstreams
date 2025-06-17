package com.tpstreams

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.Arguments
import com.tpstreams.player.download.DownloadTracker

class TPStreamsDownloadModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val downloadTracker: DownloadTracker by lazy {
        try {
            DownloadTracker.getInstance(reactApplicationContext)
        } catch (e: Exception) {
            throw RuntimeException("Failed to initialize DownloadTracker. Make sure TPStreams library is properly initialized.", e)
        }
    }

    override fun getName(): String {
        return "TPStreamsDownload"
    }

    @ReactMethod
    fun getDownloads(promise: Promise) {
        try {
            val downloadItems = downloadTracker.getAllDownloadItems()
            val result = Arguments.createArray()
            
            downloadItems.forEach { item ->
                val itemMap = Arguments.createMap()
                
                itemMap.putString("videoId", item.assetId)
                itemMap.putString("title", item.title)
                
                item.thumbnailUrl?.let { thumbnailUrl ->
                    itemMap.putString("thumbnailUrl", thumbnailUrl)
                }
                
                itemMap.putDouble("totalBytes", item.totalBytes.toDouble())
                itemMap.putDouble("downloadedBytes", item.downloadedBytes.toDouble())
                itemMap.putDouble("progressPercentage", item.progressPercentage.toDouble())
                itemMap.putInt("state", item.state)
                
                result.pushMap(itemMap)
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("GET_DOWNLOADS_ERROR", "Failed to get downloads: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getDownloadStatus(videoId: String, promise: Promise) {
        try {
            val status = downloadTracker.getDownloadStatus(videoId)
            promise.resolve(status)
        } catch (e: Exception) {
            promise.reject("GET_STATUS_ERROR", "Failed to get download status for video $videoId: ${e.message}", e)
        }
    }

    @ReactMethod
    fun pauseDownload(videoId: String, promise: Promise) {
        try {
            val success = downloadTracker.pauseDownload(videoId)
            promise.resolve(success)
        } catch (e: Exception) {
            promise.reject("PAUSE_DOWNLOAD_ERROR", "Failed to pause download for video $videoId: ${e.message}", e)
        }
    }

    @ReactMethod
    fun resumeDownload(videoId: String, promise: Promise) {
        try {
            val success = downloadTracker.resumeDownload(videoId)
            promise.resolve(success)
        } catch (e: Exception) {
            promise.reject("RESUME_DOWNLOAD_ERROR", "Failed to resume download for video $videoId: ${e.message}", e)
        }
    }

    @ReactMethod
    fun cancelDownload(videoId: String, promise: Promise) {
        try {
            val success = downloadTracker.removeDownload(videoId)
            promise.resolve(success)
        } catch (e: Exception) {
            promise.reject("CANCEL_DOWNLOAD_ERROR", "Failed to cancel download for video $videoId: ${e.message}", e)
        }
    }

    @ReactMethod
    fun isDownloaded(videoId: String, promise: Promise) {
        try {
            val downloaded = downloadTracker.isDownloaded(videoId)
            promise.resolve(downloaded)
        } catch (e: Exception) {
            promise.reject("IS_DOWNLOADED_ERROR", "Failed to check download status for video $videoId: ${e.message}", e)
        }
    }
} 