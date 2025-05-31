package com.tpstreams

import android.util.Log
import android.widget.FrameLayout
import com.facebook.react.uimanager.ThemedReactContext
import com.tpstreams.player.TPStreamsPlayer
import com.tpstreams.player.TPStreamsPlayerView

class TPStreamsRNPlayerView(context: ThemedReactContext) : FrameLayout(context) {

    private val playerView: TPStreamsPlayerView = TPStreamsPlayerView(context)
    private var player: TPStreamsPlayer? = null

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
