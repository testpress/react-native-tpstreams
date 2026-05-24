package com.tpstreams

import android.util.Log
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.tpstreams.player.TPStreamsPlayer
import com.tpstreams.player.TPStreamsPlayerView
import com.tpstreams.player.constants.PlaybackError
import androidx.media3.common.Player
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.PlaybackException
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import android.media.MediaCodec
import android.view.View.MeasureSpec
import androidx.media3.database.DatabaseProvider
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.datasource.cache.Cache
import androidx.media3.exoplayer.offline.DownloadManager
import java.util.concurrent.ExecutorService

@OptIn(UnstableApi::class)
class TPStreamsRNPlayerView(context: ThemedReactContext) : FrameLayout(context) {
    private val playerView: TPStreamsPlayerView = TPStreamsPlayerView(context)
    private var player: TPStreamsPlayer? = null
    private val reactContext: ReactContext = context

    companion object {
        private const val DEFAULT_OFFLINE_LICENSE_EXPIRE_TIME = 15L * 24L * 60L * 60L // 15 days in seconds
        private const val ERROR_CODE_PLAYER_CREATION_FAILED = 1001
        private const val ERROR_CODE_DRM_LICENSE_EXPIRED = 5001
    }

    private var videoId: String? = null
    private var accessToken: String? = null
    private var shouldAutoPlay: Boolean = true
    private var startAt: Long = 0
    private var showDefaultCaptions: Boolean = false
    private var startInFullscreen: Boolean = false
    private var enableDownload: Boolean = false
    private var downloadMetadata: Map<String, Any>? = null
    private var offlineLicenseExpireTime: Long = DEFAULT_OFFLINE_LICENSE_EXPIRE_TIME
    private var accessTokenCallback: ((String) -> Unit)? = null
    private var isLayoutUpdatePosted = false

    init {
        addView(playerView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        player?.let { p ->
            playerView.player = p
        }
    }

    override fun requestLayout() {
        super.requestLayout()
        if (!isLayoutUpdatePosted) {
            isLayoutUpdatePosted = true
            post {
                isLayoutUpdatePosted = false
                measure(
                    MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
                )
                layout(left, top, right, bottom)
            }
        }
    }

    // Emit React Native events
    private fun emitEvent(eventName: String, data: Map<String, Any>) {
        val event = Arguments.createMap()
        data.forEach { (key, value) ->
            when (value) {
                is Int -> event.putInt(key, value)
                is Double -> event.putDouble(key, value)
                is Boolean -> event.putBoolean(key, value)
                is String -> event.putString(key, value)
                else -> Log.w("TPStreamsRN", "Unsupported type for event data: ${value::class.java}")
            }
        }
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, eventName, event)
    }

    private fun sendErrorEvent(message: String, code: Int = 0, details: String? = null) {
        val event = Arguments.createMap()
        event.putString("message", message)
        event.putInt("code", code)
        details?.let { event.putString("details", it) }
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onError", event)
    }

    fun setVideoId(videoId: String?) {
        this.videoId = videoId
    }

    fun setAccessToken(accessToken: String?) {
        this.accessToken = accessToken
    }

    fun setShouldAutoPlay(shouldAutoPlay: Boolean) {
        this.shouldAutoPlay = shouldAutoPlay
    }

    fun setStartAt(startAt: Long) {
        this.startAt = startAt
    }

    fun setShowDefaultCaptions(showDefaultCaptions: Boolean) {
        this.showDefaultCaptions = showDefaultCaptions
    }

    fun setStartInFullscreen(startInFullscreen: Boolean) {
        this.startInFullscreen = startInFullscreen
    }

    fun setEnableDownload(enableDownload: Boolean) {
        this.enableDownload = enableDownload
    }
    
    fun setDownloadMetadata(metadata: Map<String, Any>?) {
        this.downloadMetadata = metadata
    }
    
    fun setOfflineLicenseExpireTime(expireTime: Long?) {
        this.offlineLicenseExpireTime = sanitizeLicenseDuration(expireTime)
    }
    
    fun setNewAccessToken(newToken: String) {
        Log.d("TPStreamsRNPlayerView", "Setting new access token")
        accessTokenCallback?.let { callback ->
            callback(newToken)
            accessTokenCallback = null
        } ?: Log.w("TPStreamsRNPlayerView", "No callback available for token refresh")
    }

    fun tryCreatePlayer() {
        if (videoId.isNullOrEmpty() || accessToken.isNullOrEmpty()) return
        if (player != null) return

        ensureDownloadManagerHealthy()

        try {
            player = TPStreamsPlayer.create(
                context, 
                videoId!!, 
                accessToken!!, 
                shouldAutoPlay, 
                startAt,
                enableDownload, 
                showDefaultCaptions,
                startInFullscreen,
                downloadMetadata?.mapValues { it.value.toString() },
                offlineLicenseExpireTime
            )
            
            player?.listener = object : TPStreamsPlayer.Listener {
                override fun onAccessTokenExpired(videoId: String, callback: (String) -> Unit) {
                    if (accessTokenCallback != null) {
                        Log.w("TPStreamsRNPlayerView", "onAccessTokenExpired called while another refresh is in progress. Ignoring.")
                        return
                    }
                    accessTokenCallback = callback
                    emitEvent("onAccessTokenExpired", mapOf("videoId" to videoId))
                }

                override fun onError(error: PlaybackError, message: String) {
                    Log.e("TPStreamsRN", "TPStreamsPlayer error: $error - $message")
                    val errorCode = ERROR_CODE_PLAYER_CREATION_FAILED + error.ordinal
                    sendErrorEvent("Player error", errorCode, message)
                }
            }

            // Add player event listeners
            player?.addListener(createPlayerListener())
            
            playerView.player = player
            playerView.showController()
            
            // Send initial events
            emitEvent("onPlayerStateChanged", mapOf("playbackState" to 0))
            emitEvent("onIsPlayingChanged", mapOf("isPlaying" to false))
            emitEvent("onIsLoadingChanged", mapOf("isLoading" to false))
        } catch (e: Exception) {
            Log.e("TPStreamsRN", "Error creating player", e)
            sendErrorEvent("Error creating player", ERROR_CODE_PLAYER_CREATION_FAILED, e.message)
        }
    }

    private fun createPlayerListener(): Player.Listener {
        return object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                emitEvent("onPlayerStateChanged", mapOf("playbackState" to playbackState))
            }
            
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                emitEvent("onIsPlayingChanged", mapOf("isPlaying" to isPlaying))
            }
            
            override fun onPlaybackParametersChanged(playbackParameters: PlaybackParameters) {
                emitEvent("onPlaybackSpeedChanged", mapOf("speed" to playbackParameters.speed.toDouble()))
            }
            
            override fun onIsLoadingChanged(isLoading: Boolean) {
                emitEvent("onIsLoadingChanged", mapOf("isLoading" to isLoading))
            }
            
            override fun onPlayerError(error: PlaybackException) {
                Log.e("TPStreamsRN", "Player error", error)
                if (isDrmLicenseExpiredError(error)) {
                    sendErrorEvent("Playback error", ERROR_CODE_DRM_LICENSE_EXPIRED, "Offline DRM license expired")
                    return
                }
                sendErrorEvent("Playback error", error.errorCode, error.message)
            }
        }
    }

    private fun isDrmLicenseExpiredError(error: PlaybackException): Boolean {
        val cause = error.cause
        return error.errorCode == PlaybackException.ERROR_CODE_DRM_LICENSE_EXPIRED ||
               error.errorCode == PlaybackException.ERROR_CODE_DRM_DISALLOWED_OPERATION ||
               error.errorCode == PlaybackException.ERROR_CODE_DRM_SYSTEM_ERROR ||
               cause is MediaCodec.CryptoException
    }

    // Player control methods
    fun play() {
        player?.play()
    }
    
    fun pause() {
        player?.pause()
    }
    
    fun seekTo(positionMs: Long) {
        player?.seekTo(positionMs)
    }
    
    fun setPlaybackSpeed(speed: Float) {
        player?.setPlaybackSpeed(speed)
    }

    // Player information methods with event emission
    fun getCurrentPosition(): Long {
        val position = player?.currentPosition ?: 0L
        emitEvent("onCurrentPosition", mapOf("position" to position.toDouble()))
        return position
    }

    fun getDuration(): Long {
        val duration = player?.duration ?: 0L
        emitEvent("onDuration", mapOf("duration" to duration.toDouble()))
        return duration
    }

    fun isPlaying(): Boolean {
        val playing = player?.isPlaying ?: false
        emitEvent("onIsPlaying", mapOf("isPlaying" to playing))
        return playing
    }

    fun getPlaybackSpeed(): Float {
        val speed = player?.playbackParameters?.speed ?: 1.0f
        emitEvent("onPlaybackSpeed", mapOf("speed" to speed.toDouble()))
        return speed
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        playerView.player = null
        player?.pause()
    }

    /**
     * Workaround for a bug in TPStreamsAndroidPlayer: DownloadController.isInitialized is never
     * reset to false even after TPSDownloadService.onDestroy() calls DownloadManager.release(),
     * which kills its internal HandlerThread. On the next download attempt, the stale
     * DownloadManager is reused and sending a message to its dead handler throws:
     *   IllegalStateException: Handler {…} sending message to a Handler on a dead thread
     *
     * Fix: detect the dead HandlerThread via reflection. If dead, replace the DownloadManager
     * inside DownloadController with a fresh instance that reuses the existing SimpleCache
     * (we cannot recreate SimpleCache — a file lock prevents opening the same directory twice).
     * Then reset the DownloadClient singleton so it binds to the new DownloadManager.
     */
    @OptIn(UnstableApi::class)
    private fun ensureDownloadManagerHealthy() {
        try {
            val ctrlClass = Class.forName("com.tpstreams.player.download.DownloadController")
            val instance = ctrlClass.getDeclaredField("INSTANCE").apply { isAccessible = true }.get(null) ?: return

            val isInitField = ctrlClass.getDeclaredField("isInitialized").apply { isAccessible = true }
            if (!(isInitField.get(instance) as Boolean)) return // not yet initialized, TPStreamsPlayer.create will init it

            val dmField = ctrlClass.getDeclaredField("downloadManager").apply { isAccessible = true }
            val dm = dmField.get(instance) ?: return

            if (isDownloadManagerAlive(dm)) return // healthy, nothing to do

            Log.w("TPStreamsRNPlayerView", "DownloadManager HandlerThread is dead — reinitializing with fresh instance")

            // Reuse existing components; SimpleCache must not be recreated (file lock)
            val dbProvider = ctrlClass.getDeclaredField("databaseProvider").apply { isAccessible = true }.get(instance) as? DatabaseProvider ?: return
            val cache = ctrlClass.getDeclaredField("downloadCache").apply { isAccessible = true }.get(instance) as? Cache ?: return
            val httpDsf = ctrlClass.getDeclaredField("httpDataSourceFactory").apply { isAccessible = true }.get(instance) as? DataSource.Factory ?: return
            val executor = ctrlClass.getDeclaredField("downloadExecutor").apply { isAccessible = true }.get(instance) as? ExecutorService ?: return

            val appCtx = context.applicationContext
            val newDm = DownloadManager(
                appCtx, dbProvider, cache,
                DefaultDataSource.Factory(appCtx, httpDsf),
                executor
            ).apply { maxParallelDownloads = 3 }

            dmField.set(instance, newDm)
            Log.d("TPStreamsRNPlayerView", "DownloadController: fresh DownloadManager installed")

            resetDownloadClientSingleton()

        } catch (e: Exception) {
            Log.w("TPStreamsRNPlayerView", "ensureDownloadManagerHealthy: ${e.message}")
        }
    }

    private fun isDownloadManagerAlive(dm: Any): Boolean {
        return try {
            val handlerField = dm.javaClass.getDeclaredField("internalHandler").apply { isAccessible = true }
            val handler = handlerField.get(dm) ?: return false
            var clz: Class<*>? = handler.javaClass
            var mLooperField: java.lang.reflect.Field? = null
            while (clz != null && mLooperField == null) {
                try { mLooperField = clz.getDeclaredField("mLooper").apply { isAccessible = true } }
                catch (_: NoSuchFieldException) { clz = clz.superclass }
            }
            val looper = mLooperField?.get(handler) as? android.os.Looper
            looper?.thread?.isAlive == true
        } catch (e: Exception) {
            // If we can't determine liveness, assume alive — conservative, avoids spurious reinit
            Log.w("TPStreamsRNPlayerView", "isDownloadManagerAlive: can't determine, assuming alive: ${e.message}")
            true
        }
    }

    private fun resetDownloadClientSingleton() {
        try {
            val clientClass = Class.forName("com.tpstreams.player.download.DownloadClient")
            val instanceField = clientClass.getDeclaredField("instance").apply { isAccessible = true }
            instanceField.set(null, null)
            Log.d("TPStreamsRNPlayerView", "DownloadClient: singleton reset for fresh binding")
        } catch (e: Exception) {
            Log.w("TPStreamsRNPlayerView", "resetDownloadClientSingleton: ${e.message}")
        }
    }

    fun releasePlayer() {
        try {
            player?.release()
        } catch (e: Exception) {
            Log.e("TPStreamsRN", "Error releasing player", e)
        }
        player = null
        accessTokenCallback = null
    }

    private fun sanitizeLicenseDuration(value: Long?): Long {
        if (value == null || value <= 0L) {
            return DEFAULT_OFFLINE_LICENSE_EXPIRE_TIME
        }
        return minOf(value, DEFAULT_OFFLINE_LICENSE_EXPIRE_TIME)
    }
}
