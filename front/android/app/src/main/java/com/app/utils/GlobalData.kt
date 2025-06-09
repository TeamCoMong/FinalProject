package com.app.utils

import com.facebook.react.bridge.ReactApplicationContext

object GlobalData {
    var destination: String? = null
    var reactContext: ReactApplicationContext? = null


    // ReverseGeocodeAddress emit 준비 flag
    var isReverseGeoReady: Boolean = false

    // emitQueue → 주소들 잠시 저장 (emit 못 했을 때)
    val reverseGeoEmitQueue = mutableListOf<String>()
}