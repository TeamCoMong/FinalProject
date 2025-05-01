package com.app;

import android.content.Context;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.skt.tmap.TMapView;  // 올바른 경로로 import

public class TmapViewManager extends SimpleViewManager<TMapView> {

    @Override
    public String getName() {
        return "TmapView";
    }

    @Override
    protected TMapView createViewInstance(ThemedReactContext reactContext) {
        TMapView tMapView = new TMapView((Context) reactContext);
        tMapView.setSKTMapApiKey("N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB");
        return tMapView;
    }
}