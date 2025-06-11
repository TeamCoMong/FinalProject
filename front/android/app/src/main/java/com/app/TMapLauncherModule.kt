package com.app

import android.content.Intent
import android.util.Log
import com.app.utils.GlobalData
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.skt.tmap.TMapData
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

var isReverseGeoReady = false
@ReactModule(name = "TMapLauncher")
class TMapLauncherModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        // ReactContext 저장 → Activity 에서 사용 가능
        GlobalData.reactContext = reactContext
    }

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
        Log.d("DESTINATION", "목적지 도착 이름: $destinationName")
        GlobalData.destination = destinationName
    }

    //이벤트 핸들링용 필수 메서드
    @ReactMethod
    fun addListener(eventName: String?) {
        // JS의 NativeEventEmitter가 내부적으로 호출하는 Stub (비워도 무방)
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // 메모리 누수 방지용 Stub (비워도 무방)
    }

    @ReactMethod
    fun notifyReverseGeoReady() {
        Log.d("ReverseGeo", "JS 로부터 Ready flag 수신 → emit 가능 상태 설정")
        GlobalData.isReverseGeoReady = true

        GlobalData.reverseGeoEmitQueue.forEach { address ->
            GlobalData.reactContext?.let { reactContext ->
                val params = com.facebook.react.bridge.Arguments.createMap()
                params.putString("address", address)

                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("ReverseGeocodeAddress", params)

                Log.d("ReverseGeo", "Queued 주소 emit 성공 $address")
            }
        }

        GlobalData.reverseGeoEmitQueue.clear()
    }

    fun emitReverseGeoAddress(address: String) {
        Log.d("ReverseGeo", "emitReverseGeoAddress 호출됨  $address")
        GlobalData.reactContext?.let { reactContext ->
            if (GlobalData.isReverseGeoReady) {
                // JS Ready 상태 → 바로 emit
                val params = com.facebook.react.bridge.Arguments.createMap()
                params.putString("address", address)

                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("ReverseGeocodeAddress", params)

                Log.d("ReverseGeo", "주소 emit 성공 → $address")
            } else {
                // JS Ready 안됨 → queue에 저장
                GlobalData.reverseGeoEmitQueue.add(address)
                Log.w("ReverseGeo", "JS Ready flag 수신 전 emit 보류 Queue 저장 (${GlobalData.reverseGeoEmitQueue.size}개)")
            }
        } ?: run {
            Log.e("ReverseGeo", "ReactContext is null → emit 불가")
        }
    }
}

