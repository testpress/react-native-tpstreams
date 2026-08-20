package com.tpstreams

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.tpstreams.player.TPStreamsSDK

class TPStreamsRNModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "TPStreams"
    }

    @ReactMethod
    fun initialize(organizationId: String, config: ReadableMap? = null) {
        val allowFallbackToL3 = config?.getBoolean("allowFallbackToL3") ?: false
        TPStreamsSDK.init(organizationId, allowFallbackToL3 = allowFallbackToL3)
    }
} 