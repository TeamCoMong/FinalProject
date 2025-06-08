package com.app

import android.content.Intent
import android.util.Log
import com.app.utils.GlobalData
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.skt.tmap.TMapData
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class TMapLauncherModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "TMapLauncher"
    }

    private fun sendEventToJS(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun notifyPoiSearchFailed() {
        sendEventToJS("PoiSearchFailed", null)
    }


    @ReactMethod
    fun openTMapActivity() {
        val currentActivity = currentActivity
        if (currentActivity != null) {
            val intent = Intent(currentActivity, TMapModule::class.java)
            currentActivity.startActivity(intent)
        }
    }

    @ReactMethod
    fun setDestination(destinationName: String) {
        Log.d("DESTINATION", "✅ 목적지 도착 이름: $destinationName")
        GlobalData.destination = destinationName
    }

    // ✅ 이벤트 핸들링용 필수 메서드
    @ReactMethod
    fun addListener(eventName: String?) {
        // JS의 NativeEventEmitter가 내부적으로 호출하는 Stub (비워도 무방)
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // 메모리 누수 방지용 Stub (비워도 무방)
    }




}