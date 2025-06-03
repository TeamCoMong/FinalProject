package com.app.views

import android.content.Context
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.ViewGroup
import android.widget.FrameLayout
import com.skt.tmap.TMapView

class TMapNativeView(context: Context) : FrameLayout(context) {

    private lateinit var tMapView: TMapView
    private var isMapInitialized = false

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (!isMapInitialized) {
            Handler(Looper.getMainLooper()).postDelayed({
                setupTMapView()
                isMapInitialized = true
            }, 200)
        }
    }

    private fun setupTMapView() {
        tMapView = TMapView(context)
        tMapView.setSKTMapApiKey("API_KEY")
        tMapView.setOnMapReadyListener {
            Log.d("TMapNativeView", "✅ Map Ready")
        }

        if (tMapView.parent != null) {
            (tMapView.parent as ViewGroup).removeView(tMapView)
        }
        addView(tMapView)
    }

    fun setMapReadyListener(function: () -> Int) {

    }
}