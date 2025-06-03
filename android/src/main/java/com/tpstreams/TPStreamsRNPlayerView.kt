package com.tpstreams

import android.util.Log
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.tpstreams.player.TPStreamsPlayer
import com.tpstreams.player.TPStreamsPlayerView

class TPStreamsRNPlayerView(context: ThemedReactContext) : FrameLayout(context) {

    private val playerView: TPStreamsPlayerView = TPStreamsPlayerView(context)
    private var player: TPStreamsPlayer? = null
    private val reactContext: ReactContext = context

    private var videoId: String? = null
    private var accessToken: String? = null

    init {
        addView(playerView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
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
            playerView.player = player
            playerView.showController()
        } catch (e: Exception) {
            Log.e("TPStreamsRN", "Error creating player", e)
        }
    }

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

    fun getCurrentPosition(): Long {
        val position = player?.currentPosition ?: 0L

        val event = Arguments.createMap()
        event.putDouble("position", position.toDouble())
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onCurrentPosition", event)
            
        return position
    }

    fun getDuration(): Long {
        val duration = player?.duration ?: 0L

        val event = Arguments.createMap()
        event.putDouble("duration", duration.toDouble())
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onDuration", event)
            
        return duration
    }

    fun isPlaying(): Boolean {
        val playing = player?.isPlaying ?: false
        
        val event = Arguments.createMap()
        event.putBoolean("isPlaying", playing)
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onIsPlaying", event)
            
        return playing
    }

    fun getPlaybackSpeed(): Float {
        val speed = player?.playbackParameters?.speed ?: 1.0f
        
        val event = Arguments.createMap()
        event.putDouble("speed", speed.toDouble())
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onPlaybackSpeed", event)
            
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
