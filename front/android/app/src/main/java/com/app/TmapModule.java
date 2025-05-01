package com.app;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class TmapModule extends ReactContextBaseJavaModule implements ActivityEventListener {

    private static final String TAG = "TmapModule";
    private final ReactApplicationContext reactContext;

    public TmapModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(this);  // ActivityEventListener 등록
    }

    @NonNull
    @Override
    public String getName() {
        return "TmapModule";
    }

    @ReactMethod
    public void startNavigation(double startLat, double startLon, double endLat, double endLon, Promise promise) {
        try {
            Intent intent = new Intent(reactContext, TmapNavigationActivity.class);
            intent.putExtra("startLat", startLat);
            intent.putExtra("startLon", startLon);
            intent.putExtra("endLat", endLat);
            intent.putExtra("endLon", endLon);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve("Navigation started");
        } catch (Exception e) {
            promise.reject("START_NAVIGATION_FAILED", e);
        }
    }

    // onNewIntent 메서드 추가 (필요에 따라 처리)
    @Override
    public void onNewIntent(Intent intent) {
        // 새로운 Intent를 처리하는 로직을 추가할 수 있습니다.
        Log.d(TAG, "onNewIntent called");
    }

    // 반드시 onActivityResult 메서드를 구현해야 함
    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        Log.d(TAG, "onActivityResult called with requestCode: " + requestCode + " resultCode: " + resultCode);

        if (requestCode == 1) {  // requestCode를 1로 설정했다고 가정
            if (resultCode == Activity.RESULT_OK) {
                // 길안내가 성공적으로 완료된 경우
                String navigationResult = data.getStringExtra("navigationResult"); // TmapNavigationActivity에서 반환한 결과
                Log.d(TAG, "Navigation Success: " + navigationResult);
                // 여기서 길안내 완료 후 처리 작업을 할 수 있습니다.
            } else if (resultCode == Activity.RESULT_CANCELED) {
                // 길안내가 취소된 경우
                Log.d(TAG, "Navigation Cancelled");
            } else {
                // 다른 결과 코드 처리
                Log.d(TAG, "Unknown resultCode: " + resultCode);
            }
        }
    }
}
