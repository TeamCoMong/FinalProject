package com.app;


import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.skt.tmap.TMapData;
import com.skt.tmap.TMapPoint;
import com.skt.tmap.TMapView;

public class TmapNavigationActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TMapView tMapView = new TMapView(this);
        setContentView(tMapView);

        double startLat = getIntent().getDoubleExtra("startLat", 0);
        double startLon = getIntent().getDoubleExtra("startLon", 0);
        double endLat = getIntent().getDoubleExtra("endLat", 0);
        double endLon = getIntent().getDoubleExtra("endLon", 0);

        tMapView.setSKTMapApiKey("N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB");
        tMapView.setZoomLevel(15);
        tMapView.setCenterPoint(startLon, startLat);

        TMapPoint startPoint = new TMapPoint(startLat, startLon);
        TMapPoint endPoint = new TMapPoint(endLat, endLon);

        TMapData tMapData = new TMapData();
        tMapData.findPathData(startPoint, endPoint, polyline -> {
            tMapView.setTMapPath(polyline);
        });
    }
}