package com.tpstreams

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.TpstreamsViewManagerInterface
import com.facebook.react.viewmanagers.TpstreamsViewManagerDelegate

@ReactModule(name = TpstreamsViewManager.NAME)
class TpstreamsViewManager : SimpleViewManager<TpstreamsView>(),
  TpstreamsViewManagerInterface<TpstreamsView> {
  private val mDelegate: ViewManagerDelegate<TpstreamsView>

  init {
    mDelegate = TpstreamsViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<TpstreamsView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): TpstreamsView {
    return TpstreamsView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: TpstreamsView?, color: String?) {
    view?.setBackgroundColor(Color.parseColor(color))
  }

  companion object {
    const val NAME = "TpstreamsView"
  }
}
