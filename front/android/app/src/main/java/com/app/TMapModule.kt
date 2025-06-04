package com.app;

import android.Manifest
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.PointF
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.widget.*
import android.widget.AdapterView.OnItemClickListener
import android.widget.ExpandableListView.OnChildClickListener
import android.widget.ExpandableListView.OnGroupClickListener
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.drawerlayout.widget.DrawerLayout
import com.skt.tmap.*
import com.skt.tmap.TMapData.*
import com.skt.tmap.TMapView.*
import com.skt.tmap.overlay.*
import com.skt.tmap.overlay.TMapTrafficLine.TrafficLine
import com.skt.tmap.poi.TMapPOIItem
import com.app.geofence.GeofenceData
import com.app.geofence.Geofencer
import com.app.postcode.PostCode
import org.json.JSONException
import org.json.JSONObject
import org.w3c.dom.Document
import org.w3c.dom.Element
import kotlin.math.max
import kotlin.math.min

import com.app.geofence.Geofencer.OnGeofencingBaseDataReceivedCallback
import com.app.geofence.Geofencer.OnGeofencingPolygonCreatedCallback
import com.app.SLHttpRequest.OnResponseListener
import org.w3c.dom.Node
import org.w3c.dom.NodeList

import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.app.utils.GlobalData
import com.facebook.react.bridge.*
import java.io.File
import java.util.*


//데이터 파싱 임포트
import java.io.StringWriter
import javax.xml.transform.OutputKeys
import javax.xml.transform.TransformerFactory
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult
import javax.xml.xpath.XPathFactory
import javax.xml.xpath.XPathConstants
import javax.xml.namespace.NamespaceContext
import javax.xml.XMLConstants
import java.io.InputStream
import javax.xml.parsers.DocumentBuilderFactory
import com.facebook.react.modules.core.DeviceEventManagerModule


class TMapModule : AppCompatActivity() , TextToSpeech.OnInitListener {

    //마지막 안내 point
    private var lastAnnouncedTurnType: Int? = null
    private lateinit var currentPlacemarks: Document
    private lateinit var tts: TextToSpeech
    private var initPoint: TMapPoint? = null
    private lateinit var menuButton: Button
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var zoomInImage: ImageView
    private lateinit var zoomOutImage: ImageView
    private lateinit var locationImage: ImageView

    private lateinit var zoomLevelTextView: TextView
    private lateinit var latitudeTextView: TextView
    private lateinit var longitudeTextView: TextView
    private lateinit var rotationTextView: TextView
    private lateinit var pinchTextView: TextView
    private lateinit var centerImage: ImageView
    private lateinit var centerPointTextView: TextView
    private lateinit var menuListView: ExpandableListView

    private lateinit var autoCompleteLayout: LinearLayout
    private lateinit var autoCompleteEdit: EditText
    private lateinit var autoCompleteListView: ListView
    private lateinit var autoCompleteListAdapter: AutoCompleteListAdapter
    private lateinit var autoComplete2Layout: LinearLayout
    private lateinit var autoComplete2Edit: EditText
    private lateinit var autoComplete2ListView: ListView
    private lateinit var autoComplete2ListAdapter: AutoComplete2ListAdapter
    private lateinit var reactContext: ReactApplicationContext


    private lateinit var routeLayout: LinearLayout
    private lateinit var routeDistanceTextView: TextView
    private lateinit var routeTimeTextView: TextView
    private lateinit var routeFareTextView: TextView

    private var isReverseGeocoding = false

    private lateinit var tMapView: TMapView
    private var geofencingType = 0

    // === TMap 경로 시뮬레이션 관련 전역 변수 ===
    private lateinit var currentPolyline: TMapPolyLine
    private var currentStep = 0


    private var zoomIndex = -1

    private var isVisibleCenter = false
    private var gpsManager: TMapGpsManager? = null
    private var marker: TMapMarkerItem? = null



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val tmapLayout = findViewById<FrameLayout>(R.id.tmapLayout)


        //음성안내
        tts = TextToSpeech(this, this)

        initView()
        initTmap()
        initTTS(this)
        // 목적지 꺼내서 사용
       val destinationName = GlobalData.destination
       Log.d("CHECK", "📥 onCreate에서 받은 목적지: $destinationName")
       if (!destinationName.isNullOrEmpty()) {
           searchPOIAndStartRoute(destinationName)
        } else {
            Log.e("CHECK", "❌ 목적지 없음")
        }


    }

    private fun moveToCurrentLocationOnce() {
        if (gpsManager == null) {
            gpsManager = TMapGpsManager(this)
        }

        gpsManager!!.provider = TMapGpsManager.PROVIDER_NETWORK

        // 🔑 1. 먼저 리스너부터 설정 (순서 중요할 수 있음)
        gpsManager!!.setOnLocationChangeListener { location: TMapPoint ->
            val lat = location.latitude
            val lon = location.longitude
            Log.d("GPS_TEST", "📍 위치 업데이트: 위도=$lat, 경도=$lon")

            // 지도 중심 이동
            tMapView.setCenterPoint(lat, lon)
            tMapView.locationPoint = location

            // 현재 위치 마커
            val marker = TMapMarkerItem().apply {
                icon = BitmapFactory.decodeResource(resources, com.skt.tmap.R.drawable.location_marker)
                id = "current_location"
                tMapPoint = location
                setPosition(0.5f, 0.5f)
            }

            if (tMapView.getMarkerItemFromId("current_location") == null) {
                tMapView.addTMapMarkerItem(marker)
            } else {
                tMapView.updateTMapMarkerItem(marker)
            }

            // 콜백 제거 (한 번만 동작)
            gpsManager?.setOnLocationChangeListener(null)

            // ✅ 현재 위치 설정이 끝났으니 이제 목적지 검색 시작 가능
            val destination = GlobalData.destination
            if (!destination.isNullOrEmpty()) {
                searchPOIAndStartRoute(destination)
            } else {
                Log.e("GPS", "❌ 목적지 정보 없음")
            }

        }

        // 🔑 2. 콜백 등록 이후에 GPS 열기
        gpsManager!!.openGps()
    }




    // js 양뱡향 통신 목적지 입력 기능
    private fun searchPOIAndStartRoute(destinationName: String) {
        val tMapData = TMapData()

        // 1️⃣ 목적지 POI 검색
        tMapData.findAllPOI(destinationName) { poiList ->
            if (poiList != null && poiList.isNotEmpty()) {
                val poi = poiList[0]
                val endPoint = poi.poiPoint
                Log.d("ROUTE", "🎯 목적지 좌표: ${endPoint.latitude}, ${endPoint.longitude}")

                // 2️⃣ 현재 GPS 위치 (출발지)
                val startPoint = tMapView.locationPoint
                if (startPoint != null) {
                    Log.d("ROUTE", "🚶 출발지(GPS): ${startPoint.latitude}, ${startPoint.longitude}")
                    // 3️⃣ 경로 탐색 함수 호출
                    findPathAllType(TMapPathType.PEDESTRIAN_PATH ,this, startPoint, endPoint)
//                    ,startPoint, destPoint
                } else {
                    Log.e("ROUTE", "❌ 출발지(GPS 위치) 없음")
                }
            } else {
                Log.e("ROUTE", "❌ 목적지 POI 검색 실패")
                // ✅ 여기에서 JS로 이벤트 전송
                sendEventToJS("PoiSearchFailed")
                // ✅ JS 화면으로 돌아가게 Activity 종료도 수행
                finish()
            }
        }
    }
    // js 양뱡향 통신 목적지 입력 기능

    // js 양뱡향 통신 목적지 검색 실패 시
    private fun sendEventToJS(eventName: String) {
        GlobalData.reactContext
            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, null)
    }







//    음성안내
    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale.KOREAN
            val sentence = "보행자 경로를 안내합니다"
            speak(sentence)
        } else {
            Log.e("TTS", "초기화 실패")
        }
    }

        fun speak(text: String) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
    }
//    음성안내




    private fun initTmap() {
        tMapView = TMapView(this)
        tMapView.setSKTMapApiKey(API_KEY)

        tMapView.setOnApiKeyListenerCallback(object : OnApiKeyListenerCallback {
            override fun onSKTMapApikeySucceed() {
                Log.d("TEST", "onSKTMapApikeySucceed")
            }

            override fun onSKTMapApikeyFailed(s: String) {
                Log.e("TEST", "onSKTMapApikey Failed")
            }
        })

        tMapView.setOnMapReadyListener(onMapReadyListener)

        val tmapLayout = findViewById<FrameLayout>(R.id.tmapLayout)
        tmapLayout.addView(tMapView)

        isReverseGeocoding = false
        geofencingType = 0

        tMapView.setOnEnableScrollWithZoomLevelListener { v, tMapPoint ->
            val zoom = v.toInt()
            zoomIndex = zoom - 6
            if (isVisibleCenter) {
                setCenterPoint()
            }
        }

//        tMapView.setOnDisableScrollWithZoomLevelListener { v, tMapPoint -> reverseGeoCoding(isReverseGeocoding) }

        tMapView.setOnClickListenerCallback(object : OnClickListenerCallback {
            override fun onPressDown(
                arrayList: ArrayList<TMapMarkerItem>,
                arrayList1: ArrayList<TMapPOIItem>,
                tMapPoint: TMapPoint,
                pointF: PointF
            ) {
                if (tMapView.isTrackingMode) {
                    setTrackingMode(false)
                    locationImage.isSelected = false
                }
            }

            override fun onPressUp(
                arrayList: ArrayList<TMapMarkerItem>,
                arrayList1: ArrayList<TMapPOIItem>,
                tMapPoint: TMapPoint,
                pointF: PointF
            ) {
            }
        })

        // POI 클릭 리스너
        tMapView.setOnClickBasePOIListener { poiInfo: String? ->
            val tmapdata = TMapData()
            tmapdata.findPOIDetailInfo(
                poiInfo
            ) { arrayList: ArrayList<TMapPOIItem> ->
                for (tMapPOIItem in arrayList) {
                    Log.d("TEST", "POI: $tMapPOIItem")
                }
            }
        }
        // PAN 변경 리스너
        tMapView.setOnPanChangedListener { tMapPoint: TMapPoint ->
            latitudeTextView.text = String.format("Lat: %s", tMapPoint.latitude)
            longitudeTextView.text = String.format("Lon: %s", tMapPoint.longitude)
        }
        // ZOOM 변경 리스너
        tMapView.setOnZoomChangedListener { zoom: Double ->
            zoomLevelTextView.text = String.format("Zoom: %s Lv", zoom)
        }
        // ROTATE 변경 리스너
        tMapView.setOnRotationChangedListener { rotate: Double ->
            rotationTextView.text = String.format("Rotate: %s", rotate)
        }
        // Pinch 발생 리스너
        tMapView.setOnPinchListener(object : OnPinchListenerCallback {
            override fun onPinchIn() {
                pinchTextView.text = String.format("Pinch: %s", "IN")
            }

            override fun onPinchOut() {
                pinchTextView.text = String.format("Pinch: %s", "OUT")
            }

            override fun onPinchStart() {
                tMapView.setUserScrollMoveEnable(false)
                pinchTextView.text = String.format("Pinch: %s", "START")
            }

            override fun onPinchEnd() {
                tMapView.setUserScrollMoveEnable(true)
                pinchTextView.text = String.format("Pinch: %s", "END")
            }
        })

        // 커스텀 지도 제스쳐 리스너
        tMapView.setOnMapGestureListener(object : OnMapGestureListenerCallback() {
            override fun onSingleTap(e: MotionEvent): Boolean {
                Log.d("TEST", "지도가 클릭되었습니다.")
                return false
            }

            override fun onSingleTapMapObject(
                markerList: ArrayList<TMapMarkerItem>,
                poiList: ArrayList<TMapPOIItem>,
                point: TMapPoint,
                screenPoint: PointF
            ): Boolean {
                Log.d("TEST", "지도 객체가 클릭되었습니다.")
                return false
            }
        })

        // Shape click listener
        tMapView.setOnClickShapeListenerCallback(object : OnClickShapeListenerCallback {
            override fun onClickCircle(tMapCircle: TMapCircle) {
                Toast.makeText(applicationContext, "Circle: " + tMapCircle.id, Toast.LENGTH_SHORT).show()
            }

            override fun onClickPolyLine(tMapPolyLine: TMapPolyLine) {
                Toast.makeText(applicationContext, "PolyLine: " + tMapPolyLine.id, Toast.LENGTH_SHORT).show()
            }

            override fun onClickPolygon(tMapPolygon: TMapPolygon) {
                Toast.makeText(applicationContext, "Polygon: " + tMapPolygon.id, Toast.LENGTH_SHORT).show()
            }
        })
    }


    //사용자 위험 사항 발생 시 사용자의 좌표를 주소로변환에서 보호자에게 사용자의 현재 상세 주소를 알림

//    private fun reverseGeoCoding(isReverseGeocoding: Boolean) {
//        this.isReverseGeocoding = isReverseGeocoding
//
//        if (this.isReverseGeocoding) {
//            val centerPoint = tMapView.centerPoint
//            if (tMapView.isValidTMapPoint(centerPoint)) {
//                val tMapData = TMapData()
//                tMapData.reverseGeocoding(
//                    centerPoint.latitude, centerPoint.longitude, "A10"
//                ) { info ->
//                    if (info != null) {
//                        //법정동
//                        var oldAddress = "법정동 : "
//                        if (info.strLegalDong != null && info.strLegalDong != "") {
//                            oldAddress += info.strCity_do + " " + info.strGu_gun + " " + info.strLegalDong
//                            if (info.strRi != null && info.strRi != "") {
//                                oldAddress += (" " + info.strRi)
//                            }
//                            oldAddress += (" " + info.strBunji)
//                        } else {
//                            oldAddress += "-"
//                        }
//
//                        //새주소
//                        var newAddress = "도로명 : "
//                        newAddress += if (info.strRoadName != null && info.strRoadName != "") {
//                            info.strCity_do + " " + info.strGu_gun + " " + info.strRoadName + " " + info.strBuildingIndex
//                        } else {
//                            "-"
//                        }
//
//                        setReverseGeocoding(oldAddress, newAddress, centerPoint)
//                    }
//                }
//            }
//        } else {
//            tMapView.removeAllTMapMarkerItem2()
//        }
//    }
//
//    private fun setReverseGeocoding(oldAddress: String, newAddress: String, point: TMapPoint) {
//        tMapView.removeAllTMapMarkerItem2()
//
//        val view: ReverseLabelView = ReverseLabelView(this)
//        view.setText(oldAddress, newAddress)
//
//        val marker = TMapMarkerItem2("marker2")
//        marker.iconView = view
//        marker.tMapPoint = point
//
//        tMapView.addTMapMarkerItem2View(marker)
//    }

    //사용자 위험 사항 발생 시 사용자의 좌표를 주소로변환에서 보호자에게 사용자의 현재 상세 주소를 알림  기능 확장 가능성 있음

    private val onMapReadyListener = OnMapReadyListener {
        initPoint = tMapView.centerPoint // 여기서 초기 로딩된 좌표 저장 이 값은 TMap SDK 내부에서 기본적으로 설정한 지도 중심 위치이며 **서울 시청 근처(대략 37.5665, 126.9780)
        initAll()

        val zoom = tMapView.zoomLevel
        zoomIndex = zoom - 6
        // 현재 위치로 지도 이동 추가
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                moveToCurrentLocationOnce()
            } else {
                requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), 200)
            }
        } else {
            moveToCurrentLocationOnce()
        }
    }




    private fun initView() {
        drawerLayout = findViewById<DrawerLayout>(R.id.drawerLayout)
        drawerLayout.setDrawerLockMode(DrawerLayout.LOCK_MODE_LOCKED_CLOSED)

//        menuButton = findViewById<Button>(R.id.menuButton)
//        menuButton.setOnClickListener(onClickListener)
//        zoomInImage = findViewById<ImageView>(R.id.zoomInImage)
//        zoomInImage.setOnClickListener(onClickListener)
//        zoomOutImage = findViewById<ImageView>(R.id.zoomOutImage)
//        zoomOutImage.setOnClickListener(onClickListener)

        locationImage = findViewById<ImageView>(R.id.locationImage)
        locationImage.setOnClickListener(onClickListener)

        zoomLevelTextView = findViewById<TextView>(R.id.zoomLevelText)
        latitudeTextView = findViewById<TextView>(R.id.latitudeText)
        longitudeTextView = findViewById<TextView>(R.id.longitudeText)
        rotationTextView = findViewById<TextView>(R.id.rotationText)
        pinchTextView = findViewById<TextView>(R.id.pinchText)

        centerImage = findViewById<ImageView>(R.id.centerIconImage)
        centerImage.setVisibility(GONE)
        centerPointTextView = findViewById<TextView>(R.id.centerText)
        centerPointTextView.setVisibility(GONE)

        initRoute()

        menuListView = findViewById<ExpandableListView>(R.id.menuListView)

        val menuList: ArrayList<MenuItem> = ArrayList<MenuItem>()

        val item0: MenuItem = MenuItem("초기화", ArrayList<String>())
        menuList.add(item0)

        val child1 = ArrayList<String>()
        child1.add("줌 레벨 선택")
        child1.add("화면 중심좌표")
        child1.add("지도 타입 선택")
        child1.add("서클(원)")
        child1.add("직선")
        child1.add("폴리곤")
        child1.add("오버레이")
        child1.add("지도회전")
        child1.add("지도기울기")
        child1.add("마커회전")
        child1.add("로고 보기")
        child1.add("POI 크기 설정")
        child1.add("지도 유형 설정")


        val item1: MenuItem = MenuItem("지도 컨트롤", child1)
        menuList.add(item1)

        val child4 = ArrayList<String>()
        child4.add("트래킹 모드")
        child4.add("나침반모드")
        child4.add("시야표출여부")
        child4.add("나침반모드 고정")
        val item4: MenuItem = MenuItem("위치트래킹", child4)
        menuList.add(item4)

        val child5 = ArrayList<String>()
        child5.add("자동차 경로")
        child5.add("보행자 경로")
        child5.add("실시간 교통정보")
        child5.add("경로정보 전체삭제")
        val item5: MenuItem = MenuItem("경로안내", child5)
        menuList.add(item5)

        val child6 = ArrayList<String>()
        val item6: MenuItem = MenuItem("Reverse Label", child6)
        menuList.add(item6)

        val child8 = ArrayList<String>()
        val item8: MenuItem = MenuItem("Geofencing", child8)
        menuList.add(item8)

        val child9 = ArrayList<String>()
        val item9: MenuItem = MenuItem("교통정보", child9)
        menuList.add(item9)

        val adapter: MenuAdapter = MenuAdapter(this, menuList)
        menuListView.setAdapter(adapter)

        menuListView.setOnGroupClickListener(OnGroupClickListener { expandableListView: ExpandableListView?, view: View?, position: Int, id: Long ->
            if (position == 0 || position == 6 || position == 8 || position == 9) {
//                selectMenu(position, -1)
                drawerLayout.closeDrawer(Gravity.LEFT)
                menuListView.collapseGroup(position)
            }
            false
        })


        menuListView.setOnChildClickListener(OnChildClickListener { expandableListView: ExpandableListView?, view: View?, groupPosition: Int, childPosition: Int, id: Long ->
//            selectMenu(groupPosition, childPosition)
            drawerLayout.closeDrawer(Gravity.LEFT)
            false
        })
    }

    private fun initRoute() {
        routeLayout = findViewById<LinearLayout>(R.id.routeLayout)
        routeDistanceTextView = findViewById<TextView>(R.id.routeDistanceText)
        routeTimeTextView = findViewById<TextView>(R.id.routeTimeText)
        routeFareTextView = findViewById<TextView>(R.id.routeFareText)
    }


    private val onClickListener = View.OnClickListener { v ->
        if (v == menuButton) {
            drawerLayout.openDrawer(Gravity.LEFT)
        } else if (v == zoomInImage) {
            tMapView.mapZoomIn()
        } else if (v == zoomOutImage) {
            tMapView.mapZoomOut()
        } else if (v == locationImage) {
            locationImage.isSelected = !locationImage!!.isSelected
            setTrackingMode(locationImage!!.isSelected)
        }
    }


//    private fun selectMenu(groupPosition: Int, childPosition: Int) {
//        if (groupPosition == 0) { // 초기화
//            initAll()
//        } else if (groupPosition == 1) { // 지도컨트롤
//            if (childPosition == 0) { // 줌레벨 선택
//                selectZoomLevel()
//            } else if (childPosition == 1) { // 화면 중심좌표
//                selectCenterPoint()
//            } else if (childPosition == 2) { // 지도 타입 선택
//                Toast.makeText(this, "지원하지 않습니다.", Toast.LENGTH_SHORT).show()
//            } else if (childPosition == 4) { // 직선
//                selectLine()
//            } else if (childPosition == 5) {
//            }
//                selectMapType()
//
//        } else if (groupPosition == 2) { // POI
//            if (childPosition == 0) { // poi 통합검색
//            } else if (childPosition == 1) { // 주변 poi 검색
//
//            } else if (childPosition == 2) { // 읍면동/도로명 조회
//
//            } else if (childPosition == 3) { // poi 자동완성
//                if (autoCompleteLayout.visibility == GONE) {
//                    autoCompleteLayout.visibility = VISIBLE
//                    autoCompleteListAdapter.clear()
//                } else {
//                    autoCompleteLayout.visibility = GONE
//                }
//            } else if (childPosition == 4) { // poi 초기화
//                tMapView.removeAllTMapMarkerItem()
//            } else if (childPosition == 5) { // poi 자동완성 v2
//                if (autoComplete2Layout.visibility == GONE) {
//                    autoComplete2Layout.visibility = VISIBLE
//                    autoComplete2ListAdapter.clear()
//                    autoComplete2Edit.setText("")
//                } else {
//                    autoComplete2Layout.visibility = GONE
//                }
//            }
//        } else if (groupPosition == 3) { // Geocoding
//            if (childPosition == 0) { // reverse Geocoding
//            } else if (childPosition == 1) { // full Text Geocoding
//            }
//        } else if (groupPosition == 4) { // 위치트래킹
//            if (childPosition == 0) { // 트래킹모드
//                selectTrackingMode()
//            } else if (childPosition == 1) { // 나침반모드
//                selectCompass()
//            } else if (childPosition == 2) { // 시야표출여부
//                selectSightVisible()
//            } else if (childPosition == 3) { // 나침반모드 고정
//                selectCompassFix()
//            }
//        } else if (groupPosition == 5) { // 경로안내
//            if (childPosition == 0) { // 자동차 경로
////                findPathAllType(TMapPathType.CAR_PATH,this ) //test 시각 음성 으로 이용시 매개변수 ,this 추가
//            } else if (childPosition == 1) { // 보행자 경로
////                findPathAllType(TMapPathType.PEDESTRIAN_PATH,this ) //test 시각 음성 으로 이용시 매개변수 ,this 추가
//            } else if (childPosition == 2) { // 자동차 경로 및 교통정보
////                findRouteAndTrafficInfo()
//            } else if (childPosition == 3) { // 경로 지우기
//                tMapView.removeTMapPath()
//                tMapView.removeAllTMapTrafficLine()
//                routeLayout.visibility = GONE
//            }
//        }
//    }


    private fun selectMapType() {
        AlertDialog.Builder(this)
            .setTitle("지도 유형 선택")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select5, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.mapType = MapType.DEFAULT
                } else if (position == 1) {
                    tMapView.mapType = MapType.SATELLITE
                } else if (position == 2) {
                    tMapView.mapType = MapType.NIGHT
                }
                dialog.dismiss()
            }).create().show()
    }


    private fun selectRotateMarker() {
        AlertDialog.Builder(this)
            .setTitle("마커 회전")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.setMarkerRotate(true)
                    tMapView.setPOIRotate(true)
                } else {
                    tMapView.setMarkerRotate(false)
                    tMapView.setPOIRotate(false)
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun initAll() {
        tMapView.removeAllTMapMarkerItem2()
        tMapView.removeAllTMapMarkerItem()
        tMapView.removeAllTMapPolyLine()
        tMapView.removeAllTMapPolygon()
        tMapView.removeAllTMapCircle()
        tMapView.removeAllTMapPOIItem()
        tMapView.removeAllTMapOverlay()
        tMapView.removeTMapPath()

        tMapView.setPOIScale(POIScale.NORMAL)

        routeLayout.visibility = GONE

        tMapView.isCompassMode = false
        tMapView.setSightVisible(false)
        tMapView.zoomLevel = 16
        setTrackingMode(false)

        tMapView.setCenterPoint(initPoint!!.latitude, initPoint!!.longitude)

//        reverseGeoCoding(false)

        isVisibleCenter = false
        centerPointTextView.visibility = GONE
        centerImage.visibility = GONE
        setCenterPoint()
    }

    private fun setCenterPoint() {
        val point = tMapView.centerPoint
        val text = """
            ${point.latitude}
            ${point.longitude}
            """.trimIndent()
        centerPointTextView.text = text
    }


    //보행자 길안내 로직
    private fun findPathAllTypeTEST(
        type: TMapPathType,
        context: Context,
        startPoint: TMapPoint,
        endPoint: TMapPoint
    ) {
        val data = TMapData()
        data.findPathDataAllType(type, startPoint, endPoint) { doc ->
            tMapView.removeTMapPath()

            val polyline = TMapPolyLine().apply {
                setID(type.name)
                lineWidth = 10f
                lineColor = Color.RED
                lineAlpha = 255
            }

            if (doc != null) {
                val list = doc.getElementsByTagName("Document")
                val item2 = list.item(0) as Element
                val totalDistance = getContentFromNode(item2, "tmap:totalDistance")
                val totalTime = getContentFromNode(item2, "tmap:totalTime")
                val totalFare = if (type == TMapPathType.CAR_PATH) {
                    getContentFromNode(item2, "tmap:totalFare")
                } else ""

                val lineStrings = doc.getElementsByTagName("LineString")
                for (i in 0 until lineStrings.length) {
                    val item = lineStrings.item(i) as? Element ?: continue
                    val coords = getContentFromNode(item, "coordinates")?.trim()?.split("\\s+".toRegex()) ?: continue

                    for (coord in coords) {
                        try {
                            val parts = coord.split(",")
                            val point = TMapPoint(parts[1].toDouble(), parts[0].toDouble())
                            polyline.addLinePoint(point)
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                }

                if (polyline.linePointList.isNotEmpty()) {
                    tMapView.setTMapPath(polyline)

                    val info = tMapView.getDisplayTMapInfo(polyline.linePointList)
                    val zoom = info.zoom.coerceAtMost(12)
                    tMapView.zoomLevel = zoom
                    tMapView.setCenterPoint(info.point.latitude, info.point.longitude)

                    // 경로 정보 표시
                    setPathText(totalDistance ?: "0", totalTime ?: "0", totalFare ?: "")
                } else {
                    Log.e("TMap", "Polyline 비어 있음 - 경로 없음")
                }
            } else {
                Log.e("TMap", "❌ 경로 응답 없음")
            }
        }
    }

    //보행자 길안내 로직






    //test-시각화-음성안내
    private fun findPathAllType(type: TMapPathType, context: Context, startPoint: TMapPoint, endPoint : TMapPoint) {
//        val startPoint = tMapView.centerPoint
//        val endPoint = if (type == TMapPathType.CAR_PATH) randomTMapPoint() else randomTMapPointTest2()



        val data = TMapData()
        data.findPathDataAllType(type, startPoint, endPoint) { doc ->
            tMapView.removeTMapPath()
            val polyline = TMapPolyLine().apply {
                setID(type.name)
                lineWidth = 10f
                lineColor = Color.RED
                lineAlpha = 255 // 중요: 투명도 설정
            }

            if (doc != null) {
//                // 1️⃣ KML 문자열로 변환
//                val kmlString = StringWriter().apply {
//                    val transformer = TransformerFactory.newInstance().newTransformer()
//                    transformer.setOutputProperty(OutputKeys.INDENT, "yes")
//                    transformer.transform(DOMSource(doc), StreamResult(this))
//                }.toString()
//
//                // 2️⃣ 디버깅용 로그
//                Log.d("KML_RAW", kmlString)
//
//                // 3️⃣ (선택) 파일로 저장
//                try {
//                    val file = File(context.filesDir, "route_kml.xml")
//                    file.writeText(kmlString)
//                    Log.d("FILE_PATH", "✅ KML 저장 완료: ${file.absolutePath}")
//                } catch (e: Exception) {
//                    Log.e("FILE_SAVE", "❌ 파일 저장 실패", e)
//                }

                val lines = doc.getElementsByTagName("LineString")
                for (i in 0 until lines.length) {
                    val item = lines.item(i) as? Element ?: continue
                    val str = getContentFromNode(item, "coordinates") ?: continue
                    val coords = str.trim().split("\\s+".toRegex())

                    for (coord in coords) {
                        try {
                            val parts = coord.split(",")
                            val point = TMapPoint(parts[1].toDouble(), parts[0].toDouble())
                            polyline.addLinePoint(point)
                        } catch (_: Exception) {}
                    }
                }

                if (polyline.linePointList.isNotEmpty()) {
                    tMapView.setTMapPath(polyline)
                    val info = tMapView.getDisplayTMapInfo(polyline.linePointList)
                    tMapView.zoomLevel = info.zoom.coerceAtMost(17)
                    tMapView.setCenterPoint(info.point.latitude, info.point.longitude)

                    currentPolyline = polyline
                    currentPlacemarks = doc
                    currentStep = 0
                    setTracking(true)
                } else {
                    Log.e("TMap", "Polyline이 비어 있음 - 경로 없음")
                }
            }
        }
    }





    private fun simulateRouteWithTTS(context: Context) {
        moveToNextPoint(context)
    }

//    private fun moveToNextPoint(context: Context) {
//        val points = currentPolyline.linePointList
//        if (currentStep >= points.size) return
//
//        val point = points[currentStep]
//        tMapView.setCenterPoint(point.longitude, point.latitude)
//        showMarkerAt(point, context)
//
//        val turnType = findNearbyTurnTypeByXPath(context, point)
//        Log.d("DEBUG", "👉 turnType 결과: $turnType")
//        if (turnType != null) {
//            if (turnType != lastAnnouncedTurnType) {
//                lastAnnouncedTurnType = turnType
//                speakByTurnTypeWithCallback(turnType)
//            } else {
//                Log.d("TTS", "🚫 이미 안내된 turnType=$turnType, 생략")
//            }
//
//            currentStep++
//            Handler(Looper.getMainLooper()).postDelayed({
//                moveToNextPoint(context)
//            }, 3000)
//
//        } else {
//            currentStep++
//            Handler(Looper.getMainLooper()).postDelayed({
//                moveToNextPoint(context)
//            }, 2500)
//        }
//    }

    private fun moveToNextPoint(context: Context) {
        val points = currentPolyline.linePointList
        if (currentStep >= points.size) return

        val point = points[currentStep]
        processLocationPoint(context, point)  // ✅ 공통 처리 함수 사용

        currentStep++
        val delay = if (lastAnnouncedTurnType == null) 2500L else 3000L
        Handler(Looper.getMainLooper()).postDelayed({
            moveToNextPoint(context)
        }, delay)
    }




    private fun processLocationPoint(context: Context, point: TMapPoint) {
        // 1️⃣ 지도 중심 이동
        tMapView.setCenterPoint(point.longitude, point.latitude)

        // 2️⃣ 마커 이동
        showMarkerAt(point, context)

        // 3️⃣ turnType 탐지 및 음성 안내
        val turnType = findNearbyTurnTypeByXPath(context, point)
        Log.d("DEBUG", "👉 turnType 결과: $turnType")

        if (turnType != null && turnType != lastAnnouncedTurnType) {
            lastAnnouncedTurnType = turnType
            speakByTurnTypeWithCallback(turnType)
        } else {
            Log.d("TTS", "🚫 이미 안내된 turnType=$turnType, 생략")
        }
    }







    private fun showMarkerAt(point: TMapPoint, context: Context) {
        if (marker == null) {
            marker = TMapMarkerItem().apply {
                icon = BitmapFactory.decodeResource(context.resources, R.drawable.i_location)
                id = "current_location"
                setPosition(0.5f, 0.5f)
            }
        }
        marker?.tMapPoint = point
        tMapView.removeAllTMapMarkerItem()
        tMapView.addTMapMarkerItem(marker)
    }

    fun speakByTurnTypeWithCallback(turnType: Int) {
        val direction = when (turnType) {
            11 -> "직진하세요"
            12 -> "좌회전하세요"
            13 -> "우회전하세요"
            14 -> "유턴하세요"
            15 -> "횡단보도를 건너세요"
            16 -> "목적지에 도착하였습니다"
            else -> null
        }
        direction?.let {
            Log.d("TTS", "🔊 말합니다: $it (turnType=$turnType)")
            tts.speak(it, TextToSpeech.QUEUE_FLUSH, null, "DIR_$turnType")
        } ?: Log.d("TTS", "❌ 해당 turnType 없음: $turnType")
    }

    fun initTTS(context: Context) {
        tts = TextToSpeech(context) {
            if (it == TextToSpeech.SUCCESS) {
                Log.d("TTS", "✅ TTS 초기화 성공")
                tts.language = Locale.KOREAN
                tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        Log.d("TTS", "🗣 시작됨: $utteranceId")
                    }

                    override fun onDone(utteranceId: String?) {
                        Log.d("TTS", "✅ 끝남: $utteranceId")
                        Handler(Looper.getMainLooper()).post {
                            currentStep++
                            moveToNextPoint(context)
                        }
                    }

                    override fun onError(utteranceId: String?) {
                        Log.e("TTS", "❗오류 발생: $utteranceId")
                    }
                })
            } else {
                Log.e("TTS", "❌ TTS 초기화 실패")
            }
        }
    }

    fun getContentFromNode(element: Element, tag: String): String? {
        val nodes = element.getElementsByTagName(tag)
        return if (nodes.length > 0) nodes.item(0).textContent else null
    }

    fun loadLocalKMLDocument(context: Context): Document? {
        return try {
            val inputStream: InputStream = context.resources.openRawResource(R.raw.tmaptest)
            val builderFactory = DocumentBuilderFactory.newInstance()
            val builder = builderFactory.newDocumentBuilder()
            builder.parse(inputStream)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    fun findNearbyTurnTypeByXPath(context: Context, currentPoint: TMapPoint): Int? {
        val doc = loadLocalKMLDocument(context) ?: run {
            Log.w("TTS", "⚠️ KML 파일 로드 실패")
            return null
        }


        val xpath = XPathFactory.newInstance().newXPath()
        xpath.namespaceContext = object : NamespaceContext {
            override fun getNamespaceURI(prefix: String?) = when (prefix) {
                "tmap" -> "http://tlp.tmap.co.kr/"
                "kml" -> "http://www.opengis.net/kml/2.2"
                else -> XMLConstants.NULL_NS_URI
            }
            override fun getPrefix(namespaceURI: String?) = null
            override fun getPrefixes(namespaceURI: String?) = null
        }

        Log.d("TTS", "📍 currentPoint = (${currentPoint.latitude}, ${currentPoint.longitude})")

        val maxDistance = 0.0005  // 🔧 50m까지 허용

        // ✅ 1차 탐색: POINT 노드
        val expr = xpath.compile("//*[local-name()='Placemark' and *[local-name()='nodeType']='POINT']")
        val placemarks = expr.evaluate(doc, XPathConstants.NODESET) as NodeList
        Log.d("TTS", "📌 [1차] POINT Placemark 수: ${placemarks.length}")

        for (i in 0 until placemarks.length) {
            val node = placemarks.item(i) as? Element ?: continue

            val coordExpr = xpath.compile(".//*[local-name()='Point']/*[local-name()='coordinates']")
            val coordNode = coordExpr.evaluate(node, XPathConstants.NODE) as? Element ?: continue
            val coordStr = coordNode.textContent.trim()


            val (lonStr, latStr) = coordStr.split(",").map { it.trim() }
            val lon = lonStr.toDoubleOrNull()
            val lat = latStr.toDoubleOrNull()
            if (lon == null || lat == null) continue

            val dist = Math.hypot(currentPoint.longitude - lon, currentPoint.latitude - lat)

            // turnType: 네임스페이스가 붙은 경우에도 안전하게 local-name으로 찾기
            val turnExpr = xpath.compile(".//*[local-name()='turnType']")
            val turnNode = turnExpr.evaluate(node, XPathConstants.NODE) as? Element
            val turnTypeStr = turnNode?.textContent

            Log.d("TTS", "🔎 비교 좌표: ($lat, $lon), 거리: $dist, turnType: $turnTypeStr")

            if (dist < maxDistance) {
                Log.d("TTS", "✅ [1차] 매칭 성공: turnType=$turnTypeStr, 좌표=$coordStr")
                return turnTypeStr?.toIntOrNull()
            }
        }

        // ✅ 2차 fallback: LINE 마지막 좌표 → 다음 Placemark에서 turnType
        val lineExpr = xpath.compile("//*[local-name()='Placemark' and *[local-name()='nodeType']='LINE']")
        val linePlacemarks = lineExpr.evaluate(doc, XPathConstants.NODESET) as NodeList
        Log.d("TTS", "📌 [2차] LINE Placemark 수: ${linePlacemarks.length}")

        for (i in 0 until linePlacemarks.length) {
            val lineNode = linePlacemarks.item(i) as? Element ?: continue

            val coordStr = lineNode.getElementsByTagNameNS("http://www.opengis.net/kml/2.2", "coordinates")
                ?.item(0)?.textContent?.trim() ?: continue

            val coordList = coordStr.split("\\s+".toRegex())
            val lastCoord = coordList.lastOrNull() ?: continue

            val (lonStr, latStr) = lastCoord.split("\\s*,\\s*")
            val lon = lonStr.toDoubleOrNull()
            val lat = latStr.toDoubleOrNull()
            if (lon == null || lat == null) continue

            val dist = Math.hypot(currentPoint.longitude - lon, currentPoint.latitude - lat)
            Log.d("TTS", "🔎 [2차] 마지막좌표 거리: $dist")

            if (dist < maxDistance) {
                val nextPlacemark = if (i + 1 < linePlacemarks.length)
                    linePlacemarks.item(i + 1) as? Element else null

                val turnTypeStr = nextPlacemark
                    ?.getElementsByTagNameNS("http://tlp.tmap.co.kr/", "turnType")
                    ?.item(0)?.textContent

                Log.d("TTS", "✅ [2차] fallback: turnType=$turnTypeStr @ $lastCoord")
                return turnTypeStr?.toIntOrNull()
            }
        }

        Log.w("TTS", "⚠️ [결과] 근접한 turnType 못 찾음")
        return null
    }

//test-시각화-음성안내




    private fun setPathText(distance: String, time: String, fare: String?) {
        runOnUiThread {
            routeLayout.visibility = VISIBLE
            val km = distance.toDouble() / 1000
            routeDistanceTextView.text = "총 거리 : $km km"


            val totalSec = time.toInt()
            val day = totalSec / (60 * 60 * 24)
            val hour = (totalSec - day * 60 * 60 * 24) / (60 * 60)
            val minute = (totalSec - day * 60 * 60 * 24 - hour * 3600) / 60
            val t = if (hour > 0) {
                hour.toString() + "시간 " + minute + "분"
            } else {
                minute.toString() + "분 "
            }
            routeTimeTextView.text = "예상시간 : 약 $t"
            if (fare != null && (fare != "0") && (fare != "")) {
                routeFareTextView.visibility = VISIBLE
                routeFareTextView.text = "유료도로 요금 : $fare 원"
            } else {
                routeFareTextView.visibility = GONE
            }
        }
    }


    private fun selectCompassFix() {
        AlertDialog.Builder(this)
            .setTitle("나침반 모드 고정")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.setCompassModeFix(true)
                } else {
                    tMapView.setCompassModeFix(false)
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun selectCompass() {
        AlertDialog.Builder(this)
            .setTitle("나침반 모드")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.isCompassMode = true
                } else {
                    tMapView.isCompassMode = false
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun selectTrackingMode() {
        AlertDialog.Builder(this)
            .setTitle("트래킹 모드")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    setTrackingMode(true)
                    locationImage.isSelected = true
                } else {
                    setTrackingMode(false)
                    locationImage.isSelected = false
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun setTrackingMode(isTracking: Boolean) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            var isGranted = true
            val permissionArr =
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            val checkPer = ArrayList<String>()
            for (per in permissionArr) {
                if (checkSelfPermission(per) == PackageManager.PERMISSION_GRANTED) {
                } else {
                    checkPer.add(per)
                    isGranted = false
                }
            }

            if (isGranted) {
                setTracking(isTracking)
            } else {
                requestPermissions(checkPer.toTypedArray<String>(), 100)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (tMapView != null) {
            tMapView.onResume()
        }
    }

    override fun onPause() {
        super.onPause()
        if (tMapView != null) {
            tMapView.onPause()
        }
    }

    override fun onDestroy() {
        // 🗺 지도 뷰 정리
        tMapView?.onDestroy()

        // 🛰 GPS 추적 중지
        gpsManager?.setOnLocationChangeListener(null)
        gpsManager?.closeGps()

        // 🗣 TTS 정리
        if (::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }

        super.onDestroy()  // 항상 마지막에 호출
    }



//    override fun onDestroy() {
//        super.onDestroy()
//        if (tMapView != null) {
//            tMapView.onDestroy()
//        }
//        //음성안내
//        if (::tts.isInitialized) {
//            tts.stop()
//            tts.shutdown()
//        }
//        //음성안내
//
//    }


 // GPS 기반 실시간 위치 추적
    private fun setTracking(isTracking: Boolean) {
        if (gpsManager == null) {
            gpsManager = TMapGpsManager(this)
        }

        if (isTracking) {
            // gpsManager.setProvider(TMapGpsManager.PROVIDER_GPS);
            gpsManager!!.provider = TMapGpsManager.PROVIDER_NETWORK
            gpsManager!!.openGps()

            // GPS, 방향 변경 이벤트 리스너
            gpsManager!!.setOnLocationChangeListener { location: TMapPoint ->
                // 위치 Tracking
                tMapView.locationPoint = location
                tMapView.setCenterPoint(location.latitude, location.longitude)

                val marker = TMapMarkerItem()
                marker.icon = BitmapFactory.decodeResource(resources, com.skt.tmap.R.drawable.location_marker)
                marker.id = "position"
                marker.setPosition(0.5f, 0.5f)
                marker.alpha = 200
                marker.tMapPoint = location
                if (tMapView.getMarkerItemFromId("position") == null) {
                    tMapView.addTMapMarkerItem(marker)
                } else {
                    tMapView.updateTMapMarkerItem(marker)
                }
            }
        } else {
            gpsManager!!.setOnLocationChangeListener(null)
            tMapView.removeTMapMarkerItem("position")
        }
    }
    // GPS 기반 실시간 위치 추적

    private fun selectSightVisible() {
        AlertDialog.Builder(this)
            .setTitle("시야표출여부")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.setSightVisible(true)
                } else {
                    tMapView.setSightVisible(false)
                }
                dialog.dismiss()
            }).create().show()
    }


    private fun setRotateEnable() {
        AlertDialog.Builder(this)
            .setTitle("지도 회전 여부")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.setRotateEnable(true)
                } else {
                    tMapView.setRotateEnable(false)
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun setTiltEnable() {
        AlertDialog.Builder(this)
            .setTitle("지도 기울기 여부")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.setTiltEnable(true)
                } else {
                    tMapView.setTiltEnable(false)
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun selectPolygon() {
        AlertDialog.Builder(this)
            .setTitle("폴리곤 그리기")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select2, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.removeAllTMapPolygon()
                    val Min = 3
                    val Max = 10
                    var rndNum = (Math.random() * (Max - Min)).toInt()

                    val polygon = TMapPolygon()
                    polygon.id = "polygon"
                    polygon.lineColor = Color.BLUE
                    polygon.areaColor = Color.RED
                    polygon.areaAlpha = 50
                    polygon.lineAlpha = 255
                    polygon.polygonWidth = 4f

                    var point: TMapPoint? = null

                    if (rndNum < 3) {
                        rndNum = rndNum + (3 - rndNum)
                    }

                    for (i in 0..<rndNum) {
                        point = randomTMapPoint()
                        polygon.addPolygonPoint(point)
                    }

                    val info = tMapView.getDisplayTMapInfo(polygon.polygonPoint)
                    tMapView.zoomLevel = info.zoom
                    tMapView.setCenterPoint(info.point.latitude, info.point.longitude)

                    tMapView.addTMapPolygon(polygon)
                } else {
                    tMapView.removeAllTMapPolygon()
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun selectLine() {
        AlertDialog.Builder(this)
            .setTitle("직선 그리기")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select2, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.removeAllTMapPolyLine()

                    val line = TMapPolyLine()
                    line.setID("line")
                    line.lineColor = Color.BLUE
                    line.lineAlpha = 255
                    line.lineWidth = 5f

                    line.outLineColor = Color.RED
                    line.outLineAlpha = 255
                    line.outLineWidth = 7f


                    for (i in 0..4) {
                        val point = randomTMapPoint()
                        line.addLinePoint(point)
                    }

                    tMapView.addTMapPolyLine(line)

                    val info = tMapView.getDisplayTMapInfo(line.linePointList)
                    tMapView.zoomLevel = info.zoom
                    tMapView.setCenterPoint(info.point.latitude, info.point.longitude)
                } else {
                    tMapView.removeAllTMapPolyLine()
                }
                dialog.dismiss()
            }).create().show()
    }

    var circleIndex: Int = 0


    private fun selectCenterPoint() {
        AlertDialog.Builder(this)
            .setTitle("화면중심좌표")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select1, -1, DialogInterface.OnClickListener { dialog, i ->
                if (i == 0) {
                    isVisibleCenter = true
                    centerImage.visibility = VISIBLE
                    centerPointTextView.visibility = VISIBLE
                } else {
                    isVisibleCenter = false
                    centerImage.visibility = GONE
                    centerPointTextView.visibility = GONE
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun selectZoomLevel() {
        val zoomItemArr = resources.getStringArray(R.array.zoom_level_array)
        AlertDialog.Builder(this)
            .setTitle("줌 레벨 선택")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(
                R.array.zoom_level_array, zoomIndex,
                DialogInterface.OnClickListener { dialogInterface, i ->
                    zoomIndex = i
                    val zoom = zoomItemArr[i].toInt()
                    tMapView.zoomLevel = zoom
                    dialogInterface.dismiss()
                })
            .create()
            .show()
    }

    fun randomTMapPoint(): TMapPoint {
        var latitude = Math.random() * (37.575113 - 37.483086) + 37.483086
        var longitude = Math.random() * (127.027359 - 126.878357) + 126.878357

        latitude = min(37.575113, latitude)
        latitude = max(37.483086, latitude)

        longitude = min(127.027359, longitude)
        longitude = max(126.878357, longitude)

        return TMapPoint(latitude, longitude)
    }

    fun randomTMapPoint2(): TMapPoint {
        var latitude = Math.random() * (37.770555 - 37.404194) + 37.483086
        var longitude = Math.random() * (127.426043 - 126.770296) + 126.878357

        latitude = min(37.770555, latitude)
        latitude = max(37.404194, latitude)

        longitude = min(127.426043, longitude)
        longitude = max(126.770296, longitude)

        return TMapPoint(latitude, longitude)
    }


    fun randomTMapPointTest(startPoint: TMapPoint): TMapPoint {
        while (true) {
            val deltaLat = (Math.random() - 0.5) * 0.005
            val deltaLon = (Math.random() - 0.5) * 0.005

            val newLat = startPoint.latitude + deltaLat
            val newLon = startPoint.longitude + deltaLon
            val dist = Math.hypot(startPoint.latitude - newLat, startPoint.longitude - newLon)

            if (dist > 0.0050) {  // 대략 20m 이상 떨어진 곳만
                return TMapPoint(newLat, newLon)
            }
        }
    }

    fun randomTMapPointTest2(): TMapPoint {
        return TMapPoint(36.79882252, 127.07581135)
    }



    companion object {
        private const val API_KEY = "N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB"
    }
}