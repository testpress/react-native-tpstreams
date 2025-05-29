package com.tpstreams

import android.net.Uri
import android.widget.FrameLayout
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import androidx.media3.ui.AspectRatioFrameLayout
import com.facebook.react.uimanager.ThemedReactContext

class TPStreamsRNPlayerView(context: ThemedReactContext) : FrameLayout(context) {
    private val playerView: PlayerView = PlayerView(context)
    private var player: ExoPlayer? = null

    init {
        playerView.useController = true
        addView(playerView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    }

    fun setSource(uri: String?) {
        player = ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(Uri.parse(uri)))
            prepare()
            playWhenReady = true
        }
        playerView.player = player
        playerView.showController()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        player?.release()
        player = null
    }
}
