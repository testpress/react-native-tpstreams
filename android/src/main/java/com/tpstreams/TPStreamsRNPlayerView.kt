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
import com.tpstreams.player.WatermarkConfig
import com.tpstreams.player.WatermarkAnimation
import com.tpstreams.player.WatermarkAnimationType
import androidx.media3.common.Player
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.PlaybackException
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import android.media.MediaCodec
import android.view.View.MeasureSpec

@OptIn(UnstableApi::class)
class TPStreamsRNPlayerView(context: ThemedReactContext) : FrameLayout(context) {
    private val playerView: TPStreamsPlayerView = TPStreamsPlayerView(context)
    private var player: TPStreamsPlayer? = null
    private val reactContext: ReactContext = context

    companion object {
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
    private var offlineLicenseExpireTime: Long = LicenseDurationUtils.DEFAULT_LICENSE_EXPIRY_SECONDS
    private var userId: String? = null
    private var watermarks: String? = null
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
        this.offlineLicenseExpireTime = LicenseDurationUtils.sanitize(expireTime)
    }
    
    fun setUserId(userId: String?) {
        if (this.userId == userId) return
        this.userId = userId
        if (player != null && !videoId.isNullOrEmpty() && !accessToken.isNullOrEmpty()) {
            releasePlayer()
            tryCreatePlayer()
        }
    }
    
    fun setWatermarks(watermarks: String?) {
        this.watermarks = watermarks
        if (player != null) {
            applyWatermarks()
        }
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
                offlineLicenseExpireTime,
                userId = userId
            )
            
            // Apply watermarks if provided
            applyWatermarks()
            
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

    private fun applyWatermarks() {
        val watermarkJson = watermarks ?: return
        try {
            val watermarkArray = org.json.JSONArray(watermarkJson)
            val watermarkConfigs = mutableListOf<WatermarkConfig>()
            
            for (i in 0 until watermarkArray.length()) {
                val obj = watermarkArray.getJSONObject(i)
                
                val animation = if (obj.has("animation") && !obj.isNull("animation")) {
                    val animObj = obj.getJSONObject("animation")
                    val typeStr = animObj.optString("type", "pingPong")
                    val duration = animObj.optLong("duration", 10000L)
                    if (typeStr == "pingPong") {
                        WatermarkAnimation(
                            type = WatermarkAnimationType.PING_PONG,
                            duration = duration
                        )
                    } else null
                } else null
                
                val config = WatermarkConfig(
                    text = obj.getString("text"),
                    x = obj.optInt("x", 0),
                    y = obj.optInt("y", 0),
                    color = obj.optInt("color", android.graphics.Color.WHITE),
                    textSize = obj.optDouble("textSize", 14.0).toFloat(),
                    opacity = obj.optDouble("opacity", 0.3).toFloat(),
                    animation = animation
                )
                watermarkConfigs.add(config)
            }
            
            if (watermarkConfigs.isNotEmpty()) {
                playerView.setWatermarks(watermarkConfigs)
            }
        } catch (e: Exception) {
            Log.e("TPStreamsRN", "Error parsing watermarks", e)
            sendErrorEvent("Invalid watermarks configuration", 0, e.message)
        }
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

    fun releasePlayer() {
        try {
            player?.release()
        } catch (e: Exception) {
            Log.e("TPStreamsRN", "Error releasing player", e)
        }
        player = null
        accessTokenCallback = null
    }
}
