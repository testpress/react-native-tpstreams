package com.tpstreams

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.TPStreamsRNPlayerViewManagerInterface
import com.facebook.react.viewmanagers.TPStreamsRNPlayerViewManagerDelegate
import com.facebook.react.common.MapBuilder

@ReactModule(name = TPStreamsRNPlayerViewManager.NAME)
class TPStreamsRNPlayerViewManager : SimpleViewManager<TPStreamsRNPlayerView>(),
  TPStreamsRNPlayerViewManagerInterface<TPStreamsRNPlayerView> {
  private val mDelegate: ViewManagerDelegate<TPStreamsRNPlayerView>

  init {
    mDelegate = TPStreamsRNPlayerViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<TPStreamsRNPlayerView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
    return MapBuilder.builder<String, Any>()
      .put("onCurrentPosition", MapBuilder.of("registrationName", "onCurrentPosition"))
      .put("onDuration", MapBuilder.of("registrationName", "onDuration"))
      .put("onIsPlaying", MapBuilder.of("registrationName", "onIsPlaying"))
      .put("onPlaybackSpeed", MapBuilder.of("registrationName", "onPlaybackSpeed"))
      .build()
  }

  public override fun createViewInstance(context: ThemedReactContext): TPStreamsRNPlayerView {
    return TPStreamsRNPlayerView(context)
  }

  @ReactProp(name = "videoId")
  override fun setVideoId(view: TPStreamsRNPlayerView, videoId: String?) {
      view.setVideoId(videoId)
  }

  @ReactProp(name = "accessToken")
  override fun setAccessToken(view: TPStreamsRNPlayerView, accessToken: String?) {
      view.setAccessToken(accessToken)
  }

  override fun play(view: TPStreamsRNPlayerView) {
      view.play()
  }

  override fun pause(view: TPStreamsRNPlayerView) {
      view.pause()
  }

  override fun seekTo(view: TPStreamsRNPlayerView, positionMs: Double) {
      view.seekTo(positionMs.toLong())
  }

  override fun setPlaybackSpeed(view: TPStreamsRNPlayerView, speed: Float) {
      view.setPlaybackSpeed(speed)
  }

  override fun getCurrentPosition(view: TPStreamsRNPlayerView) {
      view.getCurrentPosition()
  }

  override fun getDuration(view: TPStreamsRNPlayerView) {
      view.getDuration()
  }

  override fun isPlaying(view: TPStreamsRNPlayerView) {
      view.isPlaying()
  }

  override fun getPlaybackSpeed(view: TPStreamsRNPlayerView) {
      view.getPlaybackSpeed()
  }


  companion object {
    const val NAME = "TPStreamsRNPlayerView"
  }
}
