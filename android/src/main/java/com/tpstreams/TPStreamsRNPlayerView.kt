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
import android.media.MediaCodec

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
    private var enableDownload: Boolean = false
    private var downloadMetadata: Map<String, Any>? = null
    private var offlineLicenseExpireTime: Long = DEFAULT_OFFLINE_LICENSE_EXPIRE_TIME
    private var accessTokenCallback: ((String) -> Unit)? = null

    init {
        addView(playerView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
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

        try {
            player = TPStreamsPlayer.create(
                context, 
                videoId!!, 
                accessToken!!, 
                shouldAutoPlay, 
                startAt,
                enableDownload, 
                showDefaultCaptions,
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

    private fun sanitizeLicenseDuration(value: Long?): Long {
        if (value == null || value <= 0L) {
            return DEFAULT_OFFLINE_LICENSE_EXPIRE_TIME
        }
        return minOf(value, DEFAULT_OFFLINE_LICENSE_EXPIRE_TIME)
    }
}
