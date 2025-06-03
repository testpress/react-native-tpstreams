package com.tpstreams

import android.util.Log
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.tpstreams.player.TPStreamsPlayer
import com.tpstreams.player.TPStreamsPlayerView
import androidx.media3.common.Player
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.PlaybackException

class TPStreamsRNPlayerView(context: ThemedReactContext) : FrameLayout(context) {
    private val playerView: TPStreamsPlayerView = TPStreamsPlayerView(context)
    private var player: TPStreamsPlayer? = null
    private val reactContext: ReactContext = context

    private var videoId: String? = null
    private var accessToken: String? = null

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
        tryCreatePlayer()
    }

    fun setAccessToken(accessToken: String?) {
        this.accessToken = accessToken
        tryCreatePlayer()
    }

    private fun tryCreatePlayer() {
        if (videoId.isNullOrEmpty() || accessToken.isNullOrEmpty()) return
        if (player != null) return

        try {
            player = TPStreamsPlayer.create(context, videoId!!, accessToken!!)
            
            // Add player event listeners
            player?.addListener(createPlayerListener())
            
            playerView.player = player
            playerView.showController()
            
            // Send initial events
            emitEvent("onPlayerStateChanged", mapOf("playbackState" to 0))
            emitEvent("onIsPlayingChanged", mapOf("isPlaying" to false))
            emitEvent("onPlaybackSpeedChanged", mapOf("speed" to 1.0))
            emitEvent("onIsLoadingChanged", mapOf("isLoading" to false))
        } catch (e: Exception) {
            Log.e("TPStreamsRN", "Error creating player", e)
            sendErrorEvent("Error creating player", 1001, e.message)
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
                sendErrorEvent("Playback error", error.errorCode, error.message)
            }
        }
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
        try {
            player?.release()
        } catch (e: Exception) {
            Log.e("TPStreamsRN", "Error releasing player", e)
        }
        player = null
    }
}
