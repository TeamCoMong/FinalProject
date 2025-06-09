package com.app

import android.util.Log
import com.app.views.TMapNativeView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter


class TMapViewManager : SimpleViewManager<TMapNativeView>() {

    override fun getName(): String {
        return "TMapView"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): TMapNativeView {
        val view = TMapNativeView(reactContext)

        view.post {
            view.setMapReadyListener {
                Log.d("TMapManager", "Listener 등록 성공 from Manager")
            }
        }

        return view
    }
}
