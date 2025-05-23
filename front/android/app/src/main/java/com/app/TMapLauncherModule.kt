package com.app

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class TMapLauncherModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "TMapLauncher"
    }

    @ReactMethod
    fun openTMapActivity() {
        val currentActivity = currentActivity
        if (currentActivity != null) {
            val intent = Intent(currentActivity, TMapModule::class.java)
            currentActivity.startActivity(intent)
        }
    }
}