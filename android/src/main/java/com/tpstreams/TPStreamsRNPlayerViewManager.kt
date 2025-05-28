package com.tpstreams

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.TPStreamsRNPlayerViewManagerInterface
import com.facebook.react.viewmanagers.TPStreamsRNPlayerViewManagerDelegate

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

  public override fun createViewInstance(context: ThemedReactContext): TPStreamsRNPlayerView {
    return TPStreamsRNPlayerView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: TPStreamsRNPlayerView?, color: String?) {
    view?.setBackgroundColor(Color.parseColor(color))
  }

  companion object {
    const val NAME = "TPStreamsRNPlayerView"
  }
}
