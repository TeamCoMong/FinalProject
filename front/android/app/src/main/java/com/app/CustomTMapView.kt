package com.app

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.skt.tmap.TMapView

class CustomTMapView(context: Context) : TMapView(context) {
    private var hasFired = false

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        Log.i("CustomTMapView", "🧩 onAttachedToWindow 호출됨")

        Handler(Looper.getMainLooper()).postDelayed({
            checkEngineAndFire()
        }, 1000)
    }

    private fun checkEngineAndFire() {
        if (hasFired) return

        try {
            val engineField = TMapView::class.java.getDeclaredField("vsmMapEngine")
            engineField.isAccessible = true
            val engine = engineField.get(this)

            if (engine != null) {
                val isReadyMethod = engine.javaClass.getDeclaredMethod("isReady")
                isReadyMethod.isAccessible = true
                val isReady = isReadyMethod.invoke(engine) as Boolean

                if (isReady) {
                    val listenerField = TMapView::class.java.getDeclaredField("onMapReadyListener")
                    listenerField.isAccessible = true
                    val listener = listenerField.get(this)

                    if (listener != null) {
                        val onMapReadyMethod = listener.javaClass.getDeclaredMethod("onMapReady")
                        onMapReadyMethod.isAccessible = true
                        onMapReadyMethod.invoke(listener)
                        Log.i("CustomTMapView", "✅ 수동 onMapReady 호출 성공 (엔진 감지)")
                        hasFired = true
                    }
                } else {
                    Log.w("CustomTMapView", "❌ isReady == false, 500ms 후 재시도")
                    retry()
                }
            } else {
                Log.w("CustomTMapView", "❌ vsmMapEngine == null, 500ms 후 재시도")
                retry()
            }
        } catch (e: Exception) {
            Log.e("CustomTMapView", "🔥 리플렉션 실패", e)
        }
    }

    private fun retry() {
        Handler(Looper.getMainLooper()).postDelayed({
            checkEngineAndFire()
        }, 500)
    }
}
