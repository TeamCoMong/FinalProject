package com.app;

import android.Manifest
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


class TMapModule : AppCompatActivity() {


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


    private lateinit var routeLayout: LinearLayout
    private lateinit var routeDistanceTextView: TextView
    private lateinit var routeTimeTextView: TextView
    private lateinit var routeFareTextView: TextView

    private var isReverseGeocoding = false

    private lateinit var tMapView: TMapView
    private var geofencingType = 0

    private var zoomIndex = -1

    private var isVisibleCenter = false
    private var gpsManager: TMapGpsManager? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val tmapLayout = findViewById<FrameLayout>(R.id.tmapLayout)

        initView()
        initTmap()
    }

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

        tMapView.setOnDisableScrollWithZoomLevelListener { v, tMapPoint -> reverseGeoCoding(isReverseGeocoding) }

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


    private fun reverseGeoCoding(isReverseGeocoding: Boolean) {
        this.isReverseGeocoding = isReverseGeocoding

        if (this.isReverseGeocoding) {
            val centerPoint = tMapView.centerPoint
            if (tMapView.isValidTMapPoint(centerPoint)) {
                val tMapData = TMapData()
                tMapData.reverseGeocoding(
                    centerPoint.latitude, centerPoint.longitude, "A10"
                ) { info ->
                    if (info != null) {
                        //법정동
                        var oldAddress = "법정동 : "
                        if (info.strLegalDong != null && info.strLegalDong != "") {
                            oldAddress += info.strCity_do + " " + info.strGu_gun + " " + info.strLegalDong
                            if (info.strRi != null && info.strRi != "") {
                                oldAddress += (" " + info.strRi)
                            }
                            oldAddress += (" " + info.strBunji)
                        } else {
                            oldAddress += "-"
                        }

                        //새주소
                        var newAddress = "도로명 : "
                        newAddress += if (info.strRoadName != null && info.strRoadName != "") {
                            info.strCity_do + " " + info.strGu_gun + " " + info.strRoadName + " " + info.strBuildingIndex
                        } else {
                            "-"
                        }

                        setReverseGeocoding(oldAddress, newAddress, centerPoint)
                    }
                }
            }
        } else {
            tMapView.removeAllTMapMarkerItem2()
        }
    }

    private fun setReverseGeocoding(oldAddress: String, newAddress: String, point: TMapPoint) {
        tMapView.removeAllTMapMarkerItem2()

        val view: ReverseLabelView = ReverseLabelView(this)
        view.setText(oldAddress, newAddress)

        val marker = TMapMarkerItem2("marker2")
        marker.iconView = view
        marker.tMapPoint = point

        tMapView.addTMapMarkerItem2View(marker)
    }

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

    private fun moveToCurrentLocationOnce() {
        if (gpsManager == null) {
            gpsManager = TMapGpsManager(this)
        }

        gpsManager!!.provider = TMapGpsManager.PROVIDER_NETWORK // 또는 PROVIDER_GPS
        gpsManager!!.openGps()

        gpsManager!!.setOnLocationChangeListener { location: TMapPoint ->
            // 지도 중심 위치를 현재 위치로 설정
            tMapView.setCenterPoint(location.latitude, location.longitude)
            tMapView.locationPoint = location

            // 현재 위치 마커 표시 (선택)
            val marker = TMapMarkerItem()
            marker.icon = BitmapFactory.decodeResource(resources, com.skt.tmap.R.drawable.location_marker)
            marker.id = "current_location"
            marker.tMapPoint = location
            marker.setPosition(0.5f, 0.5f)

            if (tMapView.getMarkerItemFromId("current_location") == null) {
                tMapView.addTMapMarkerItem(marker)
            } else {
                tMapView.updateTMapMarkerItem(marker)
            }

            // 리스너 한 번만 실행 후 해제
            gpsManager?.setOnLocationChangeListener(null)
        }
    }






    private fun initView() {
        drawerLayout = findViewById<DrawerLayout>(R.id.drawerLayout)
        drawerLayout.setDrawerLockMode(DrawerLayout.LOCK_MODE_LOCKED_CLOSED)

        menuButton = findViewById<Button>(R.id.menuButton)
        menuButton.setOnClickListener(onClickListener)
        zoomInImage = findViewById<ImageView>(R.id.zoomInImage)
        zoomInImage.setOnClickListener(onClickListener)
        zoomOutImage = findViewById<ImageView>(R.id.zoomOutImage)
        zoomOutImage.setOnClickListener(onClickListener)

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

        initAutoComplete()
        initAuto2Complete2()

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

        val child2 = ArrayList<String>()
        child2.add("POI통합검색")
        child2.add("주변POI검색")
        child2.add("읍면동/도로명조회")
        child2.add("POI자동완성")
        child2.add("POI초기화")
        child2.add("POI자동완성V2")
        val item2: MenuItem = MenuItem("POI", child2)
        menuList.add(item2)

        val child3 = ArrayList<String>()
        child3.add("Reverse Geocoding")
        child3.add("Full Text Geocoding")
        child3.add("우편번호 검색")
        val item3: MenuItem = MenuItem("Geocoding", child3)
        menuList.add(item3)

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

        val child7 = ArrayList<String>()
        child7.add("실행하기")
        child7.add("길안내")
        child7.add("통합검색")
        child7.add("주변 카페 검색")
        child7.add("주변 음식점 검색")
        child7.add("설치")
        val item7: MenuItem = MenuItem("Tmap연동", child7)
        menuList.add(item7)

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
                selectMenu(position, -1)
                drawerLayout.closeDrawer(Gravity.LEFT)
                menuListView.collapseGroup(position)
            }
            false
        })


        menuListView.setOnChildClickListener(OnChildClickListener { expandableListView: ExpandableListView?, view: View?, groupPosition: Int, childPosition: Int, id: Long ->
            selectMenu(groupPosition, childPosition)
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

    private fun initAuto2Complete2() {
        autoComplete2Layout = findViewById<LinearLayout>(R.id.autoComplete2Layout)
        autoComplete2Layout.setVisibility(GONE)
        autoComplete2Edit = findViewById<EditText>(R.id.autoComplete2Edit)
        autoComplete2ListView = findViewById<ListView>(R.id.autoComplete2ListView)
        autoComplete2ListAdapter = AutoComplete2ListAdapter(this)
        autoComplete2ListView.setAdapter(autoComplete2ListAdapter)
        autoComplete2ListView.setOnItemClickListener(OnItemClickListener { adapterView, view, position, id ->
            tMapView.removeAllTMapMarkerItem()
            autoComplete2Layout.setVisibility(GONE)

            val item = autoComplete2ListAdapter.getItem(position) as TMapAutoCompleteV2

            val marker = TMapMarkerItem()
            marker.id = item.poiId
            marker.icon = BitmapFactory.decodeResource(resources, R.drawable.poi_dot)
            marker.setTMapPoint(item.lat.toDouble(), item.lon.toDouble())
            marker.calloutTitle = item.keyword
            marker.calloutSubTitle = item.poiId
            marker.canShowCallout = true
            marker.isAnimation = true

            tMapView.addTMapMarkerItem(marker)
            tMapView.setCenterPoint(item.lat.toDouble(), item.lon.toDouble())
        })


        autoComplete2Edit.addTextChangedListener(object : TextWatcher {
            override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
                val tMapData = TMapData()

                val keyword = s.toString()
                val lat = tMapView.centerPoint.latitude
                val lon = tMapView.centerPoint.longitude

                tMapData.autoCompleteV2(
                    keyword, lat, lon, 0, 100
                ) { arrayList -> runOnUiThread { autoComplete2ListAdapter.setItemList(arrayList) } }
            }

            override fun beforeTextChanged(charSequence: CharSequence, i: Int, i1: Int, i2: Int) {
            }

            override fun afterTextChanged(editable: Editable) {
            }
        })
    }

    private fun initAutoComplete() {
        autoCompleteLayout = findViewById<LinearLayout>(R.id.autoCompleteLayout)
        autoCompleteLayout.setVisibility(GONE)
        autoCompleteEdit = findViewById<EditText>(R.id.autoCompleteEdit)
        autoCompleteListView = findViewById<ListView>(R.id.autoCompleteListView)
        autoCompleteListAdapter = AutoCompleteListAdapter(this)
        autoCompleteListView.setAdapter(autoCompleteListAdapter)
        autoCompleteListView.setOnItemClickListener(OnItemClickListener { adapterView, view, position, l ->
            val keyword = autoCompleteListAdapter.getItem(position) as String
            findAllPoi(keyword)
            autoCompleteLayout.setVisibility(GONE)
        })

        autoCompleteEdit.addTextChangedListener(object : TextWatcher {
            override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
                val keyword = s.toString()

                val tMapData = TMapData()

                tMapData.autoComplete(
                    keyword
                ) { itemList -> runOnUiThread { autoCompleteListAdapter.setItemList(itemList) } }
            }

            override fun beforeTextChanged(charSequence: CharSequence, i: Int, i1: Int, i2: Int) {
            }

            override fun afterTextChanged(editable: Editable) {
            }
        })
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


    private fun selectMenu(groupPosition: Int, childPosition: Int) {
        if (groupPosition == 0) { // 초기화
            initAll()
        } else if (groupPosition == 1) { // 지도컨트롤
            if (childPosition == 0) { // 줌레벨 선택
                selectZoomLevel()
            } else if (childPosition == 1) { // 화면 중심좌표
                selectCenterPoint()
            } else if (childPosition == 2) { // 지도 타입 선택
                Toast.makeText(this, "지원하지 않습니다.", Toast.LENGTH_SHORT).show()
            } else if (childPosition == 3) { // 서클
                selectCircle()
            } else if (childPosition == 4) { // 직선
                selectLine()
            } else if (childPosition == 5) { // 폴리곤
                selectPolygon()
            } else if (childPosition == 6) { // 오버레이
                selectOverlay()
            } else if (childPosition == 7) { //지도 회전
                setRotateEnable()
            } else if (childPosition == 8) { //지도 기울기
                setTiltEnable()
            } else if (childPosition == 9) { // 마커 회전
                selectRotateMarker()
            } else if (childPosition == 10) { // 로고 보기
                selectVisibleLogo()
            } else if (childPosition == 11) { // poi 크기 설정
                selectPOIScale()
            } else if (childPosition == 12) { // 지도 유형 선택
                selectMapType()
            }
        } else if (groupPosition == 2) { // POI
            if (childPosition == 0) { // poi 통합검색
                findAllPoi()
            } else if (childPosition == 1) { // 주변 poi 검색
                findAroundPoi()
            } else if (childPosition == 2) { // 읍면동/도로명 조회
                findRoadPoi()
            } else if (childPosition == 3) { // poi 자동완성
                if (autoCompleteLayout.visibility == GONE) {
                    autoCompleteLayout.visibility = VISIBLE
                    autoCompleteListAdapter.clear()
                    autoCompleteEdit.setText("티맵모빌리티")
                } else {
                    autoCompleteLayout.visibility = GONE
                }
            } else if (childPosition == 4) { // poi 초기화
                tMapView.removeAllTMapMarkerItem()
            } else if (childPosition == 5) { // poi 자동완성 v2
                if (autoComplete2Layout.visibility == GONE) {
                    autoComplete2Layout.visibility = VISIBLE
                    autoComplete2ListAdapter.clear()
                    autoComplete2Edit.setText("")
                } else {
                    autoComplete2Layout.visibility = GONE
                }
            }
        } else if (groupPosition == 3) { // Geocoding
            if (childPosition == 0) { // reverse Geocoding
                selectReverseGeocoding()
            } else if (childPosition == 1) { // full Text Geocoding
                selectFullTextGeocoding()
            } else if (childPosition == 2) { // 우편번호 검색
                selectPostCode()
            }
        } else if (groupPosition == 4) { // 위치트래킹
            if (childPosition == 0) { // 트래킹모드
                selectTrackingMode()
            } else if (childPosition == 1) { // 나침반모드
                selectCompass()
            } else if (childPosition == 2) { // 시야표출여부
                selectSightVisible()
            } else if (childPosition == 3) { // 나침반모드 고정
                selectCompassFix()
            }
        } else if (groupPosition == 5) { // 경로안내
            if (childPosition == 0) { // 자동차 경로
                findPathAllType(TMapPathType.CAR_PATH)
            } else if (childPosition == 1) { // 보행자 경로
                findPathAllType(TMapPathType.PEDESTRIAN_PATH)
            } else if (childPosition == 2) { // 자동차 경로 및 교통정보
                findRouteAndTrafficInfo()
            } else if (childPosition == 3) { // 경로 지우기
                tMapView.removeTMapPath()
                tMapView.removeAllTMapTrafficLine()
                routeLayout.visibility = GONE
            }
        } else if (groupPosition == 6) { // Reverse Label
            selectReverseLabel()
        } else if (groupPosition == 7) { // Tmap 연동
            if (childPosition == 0) { // 실행하기
                selectRunTMap()
            } else if (childPosition == 1) { // 길안내
                selectNaviTMap()
                Handler().postDelayed({ this.selectNaviTMap() }, 1000)
            } else if (childPosition == 2) { // 통합검색
                selectSearchTMap()
            } else if (childPosition == 3) { // 주변 카페 검색
                selectNearCafe()
            } else if (childPosition == 4) { // 주변 음식점 검색
                selectNearFood()
            } else if (childPosition == 5) { // 설치
                selectInstallTmap()
            }
        } else if (groupPosition == 8) { // Geofencing
            selectGeofencing()
        } else if (groupPosition == 9) { // 교통정보
            selectTraffic()
        }
    }


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


    private fun selectPOIScale() {
        AlertDialog.Builder(this)
            .setTitle("POI 크기 설정")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select4, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.setPOIScale(POIScale.SMALL)
                } else if (position == 1) {
                    tMapView.setPOIScale(POIScale.NORMAL)
                } else if (position == 2) {
                    tMapView.setPOIScale(POIScale.LARGE)
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun selectOverlay() {
        AlertDialog.Builder(this)
            .setTitle("오버레이 그리기")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select2, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.removeAllTMapOverlay()

                    val centerX = tMapView.width / 2
                    val centerY = tMapView.height / 2

                    val leftTop = tMapView.convertPointToGps((centerX - 100).toFloat(), (centerY - 100).toFloat())
                    val rightBottom = tMapView.convertPointToGps((centerX + 100).toFloat(), (centerY + 100).toFloat())

                    val overlay = TMapOverlay()
                    overlay.id = "overlay"
                    overlay.setOverlayImage(this@TMapModule, R.drawable.icon)
                    overlay.leftTopPoint = leftTop
                    overlay.rightBottomPoint = rightBottom
                    overlay.alpha = 100

                    tMapView.addTMapOverlay(overlay)
                } else {
                    tMapView.removeAllTMapOverlay()
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun selectPostCode() {
        PostCode(this, API_KEY).showFindPopup()
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

        reverseGeoCoding(false)

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


    private fun selectGeofencing() {
        val regionNames = arrayOf<CharSequence>("시,도 단위", "시,군,구 단위", "법정동", "행정동")
        val builder = android.app.AlertDialog.Builder(this)
        builder.setTitle("Geofencing").setIcon(R.drawable.tmark)
        val input = EditText(this)

        builder.setSingleChoiceItems(
            regionNames, geofencingType
        ) { dialog, whichButton -> geofencingType = whichButton }.setPositiveButton(
            "확인"
        ) { dialog, which ->
            tMapView.removeAllTMapPolygon()
            geofencing(input.text.toString())
        }.setNegativeButton("취소") { dialog, which -> dialog.cancel() }

        builder.setView(input)
        builder.show()
    }


    var geofencingCallback: Geofencer.OnGeofencingPolygonCreatedCallback =
        object : OnGeofencingPolygonCreatedCallback {
            override fun onReceived(polygons: ArrayList<TMapPolygon>) {
                if (polygons.size > 0) {
                    var latitudeSum = 0.0
                    var longitudeSum = 0.0
                    var zoomSum = 0

                    tMapView.removeAllTMapPolygon()

                    for (i in polygons.indices) {
                        polygons[i].areaColor = Color.BLACK
                        polygons[i].areaAlpha = 50
                        tMapView.addTMapPolygon(polygons[i])
                        val mapInfo = tMapView.getDisplayTMapInfo(polygons[i].polygonPoint)
                        latitudeSum += mapInfo.point.latitude
                        longitudeSum += mapInfo.point.longitude
                        zoomSum += mapInfo.zoom
                    }
                    tMapView.zoomLevel = (zoomSum / polygons.size)
                    tMapView.setCenterPoint(latitudeSum / polygons.size, longitudeSum / polygons.size)
                }
            }
        }

    private fun geofencing(regionName: String) {
        val geofencer: Geofencer = Geofencer(API_KEY)
        geofencer.requestGeofencingBaseData(
            geofencer.getRegionTypeFromOrder(geofencingType),
            regionName,
            object : OnGeofencingBaseDataReceivedCallback {
                override fun onReceived(datas: ArrayList<GeofenceData>) {
                    if (datas.size == 1) {
//					Log.d("JSON Test", datas.get(0).getRegionId());
                        // 1개인경우 바로 draw
                        val geofencer2: Geofencer = Geofencer(API_KEY)
                        geofencer2.requestGeofencingPolygon(datas[0], geofencingCallback)
                    } else if (datas.size > 1) {
                        // 1개 이상인경우 리스트 표출하여 선택하도록
                        val regionNames = arrayOfNulls<CharSequence>(datas.size)
                        for (i in datas.indices) regionNames[i] =
                            datas[i].getRegionName() + "/" + datas[i].getDescription()

                        val builder = android.app.AlertDialog.Builder(this@TMapModule)
                        builder.setTitle("결과내 선택").setIcon(R.drawable.tmark)

                        builder.setSingleChoiceItems(
                            regionNames, -1
                        ) { dialog, which ->
                            val geofencer2: Geofencer = Geofencer(API_KEY)
                            geofencer2.requestGeofencingPolygon(datas[which], geofencingCallback)
                            dialog.dismiss()
                        }

                        builder.show()
                    } else {
                        Toast.makeText(this@TMapModule, "검색에 실패하였습니다. 확인 후 다시 시도해주세요.", Toast.LENGTH_SHORT).show()
                    }
                }
            })
    }

    private fun selectInstallTmap() {
        val api = TMapTapi(this)
        val uri = Uri.parse(api.tMapDownUrl[0])
        val intent = Intent(Intent.ACTION_VIEW, uri)
        startActivity(intent)
    }



    private fun selectNearCafe() {
        val api = TMapTapi(this)
        //        api.invokeNearCafe(126.987040, 37.565118);
    }

    private fun selectNearFood() {
        val api = TMapTapi(this)
        //        api.invokeNearFood(126.987040, 37.565118);
    }

    private fun selectSearchTMap() {
        val input = EditText(this)
        AlertDialog.Builder(this)
            .setTitle("TMap 통합 검색")
            .setView(input)
            .setPositiveButton("확인") { dialogInterface, i ->
                val searchText = input.text.toString()
                if (searchText.trim { it <= ' ' }.length > 0) {
                    val api = TMapTapi(this@TMapModule)
                    api.invokeSearchPortal(searchText)
                }
            }
            .setNegativeButton("취소", null)
            .create().show()
    }

    private fun selectNaviTMap() {
        val point = tMapView.centerPoint
        if (tMapView.isValidTMapPoint(point)) {
            val data = TMapData()
            data.convertGpsToAddress(point.latitude, point.longitude) {
                val tmaptapi = TMapTapi(this@TMapModule)
                val pathInfo = HashMap<String, String>()
                pathInfo["rGoName"] = "선문대원화관"
                pathInfo["rGoX"] = "127.0772135"
                pathInfo["rGoY"] = "36.8000655"

                pathInfo["rStName"] = "출발지"
                pathInfo["rStX"] = "127.0772135"
                pathInfo["rStY"] = "36.8000655"

                pathInfo["rV1Name"] = "경유지"
                pathInfo["rV1X"] = "127.0772135"
                pathInfo["rV1Y"] = "36.8000655"


                pathInfo["rSOpt"] = "2"

                //rSOpt
                Log.e("tMapModule", "install ? " + tmaptapi.isTmapApplicationInstalled)
                tmaptapi.invokeRoute(pathInfo)
            }
        }
    }

    private fun selectRunTMap() {
        val api = TMapTapi(this)

        api.invokeTmap()
    }

    private fun selectTraffic() {
        AlertDialog.Builder(this)
            .setTitle("교통정보")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.setTrafficInfoActive(true)
                } else {
                    tMapView.setTrafficInfoActive(false)
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun selectReverseLabel() {
        AlertDialog.Builder(this)
            .setTitle("Reverse Label")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    setReverseLabel(true)
                } else {
                    setReverseLabel(false)
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun setReverseLabel(isReverse: Boolean) {
        if (isReverse) {
            tMapView.setOnClickReverseLabelListener { info ->
                val view: ReverseLabelView = ReverseLabelView(this@TMapModule)
                view.setText(info.name, info.id)

                val marker = TMapMarkerItem2("reverseLabel")
                marker.tMapPoint = TMapPoint(info.lat, info.lon)
                marker.iconView = view

                tMapView.removeTMapMarkerItem2("reverseLabel")
                tMapView.addTMapMarkerItem2View(marker)
            }
        } else {
            tMapView.removeTMapMarkerItem2("reverseLabel")
            tMapView.setOnClickReverseLabelListener(null)
        }
    }

    //보행자 경로 클릭 시 호출 findPathAllType 이 적용된 모든 메소드 호출
    private fun findPathAllType(type: TMapPathType) {
        val startPoint = tMapView.centerPoint
        val endPoint = if (type == TMapPathType.CAR_PATH) {
            //임의의 좌표값  생성
            randomTMapPoint2()
        } else {
            //임의의 좌표값  생성
            randomTMapPoint()
        }

        val data = TMapData()
        TMapData().findPathDataAllType(
            type, startPoint, endPoint
        ) { doc ->
            tMapView.removeTMapPath()
            val polyline = TMapPolyLine()
            polyline.setID(type.name)
            polyline.lineWidth = 10f
            polyline.lineColor = Color.RED
            polyline.lineAlpha = 255
            if (doc != null) {
                val list = doc.getElementsByTagName("Document")
                val item2 = list.item(0) as Element
                val totalDistance = getContentFromNode(item2, "tmap:totalDistance")
                val totalTime = getContentFromNode(item2, "tmap:totalTime")
                val totalFare = if (type == TMapPathType.CAR_PATH) {
                    getContentFromNode(item2, "tmap:totalFare")
                } else {
                    ""
                }

                val list2 = doc.getElementsByTagName("LineString")

                for (i in 0..<list2.length) {
                    val item = list2.item(i) as Element
                    val str = getContentFromNode(item, "coordinates") ?: continue

                    val str2 = str.split(" ".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                    for (k in str2.indices) {
                        try {
                            val str3 = str2[k].split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                            val point = TMapPoint(str3[1].toDouble(), str3[0].toDouble())
                            polyline.addLinePoint(point)
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                }

                tMapView.setTMapPath(polyline)

                val info = tMapView.getDisplayTMapInfo(polyline.linePointList)
                var zoom = info.zoom
                if (zoom > 12) {
                    zoom = 12
                }

                tMapView.zoomLevel = zoom
                tMapView.setCenterPoint(info.point.latitude, info.point.longitude)


                setPathText(totalDistance!!, totalTime!!, totalFare)
            }
        }
    }

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

    private fun findRouteAndTrafficInfo() {
        tMapView.removeAllTMapTrafficLine()
        val startPoint = randomTMapPoint2()
        val endPoint = randomTMapPoint2()

        TMapData().findPathDataAllType(
            TMapPathType.CAR_PATH, startPoint, endPoint
        ) { doc: Document? ->
            if (doc != null) {
                val nodeList = doc.getElementsByTagName("LineString")

                val tmapTrafficLine = TMapTrafficLine("TestTrafficLine")
                tmapTrafficLine.trafficLineList = ArrayList()
                // 교통 정보 표출 여부, 활성화 시 티맵과 동일한 디자인으로 표출
                // trafficLine 생성 시 입력한 traffic 정보 기반
                tmapTrafficLine.isShowTraffic = true
                // Indicator 추가 (화살표)
                tmapTrafficLine.isShowIndicator = true
                // 선의 두께
                tmapTrafficLine.lineWidth = 9
                // 외곽선 두께
                tmapTrafficLine.outLineWidth = 2

                // TMAP API 자동차 경로 조회
                for (i in 0..<nodeList.length) {
                    val item = nodeList.item(i) as Element
                    val pointList = ArrayList<TMapPoint>()

                    // 좌표 파싱
                    val coordStr = getContentFromNode(item, "coordinates")
                    if (coordStr != null) {
                        val coordStrArr = coordStr.split(" ".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                        for (string in coordStrArr) {
                            val lon =
                                string.split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()[0].toDouble()
                            val lat =
                                string.split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()[1].toDouble()
                            pointList.add(TMapPoint(lat, lon))
                        }
                    }

                    // 교통 정보 파싱
                    val trafficStr = getContentFromNode(item, "traffic")
                    if (trafficStr != null) {
                        val trafficStrArr =
                            trafficStr.split(" ".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                        for (s in trafficStrArr) {
                            val trafficItem = s.split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                            val tStart = trafficItem[0].toInt()
                            val tEnd = trafficItem[1].toInt()
                            // 0: 정보없음, 1: 원활, 2: 서행, 3: 지체, 4: 정체
                            var trafficInfo = trafficItem[2].toInt()
                            if (trafficInfo == 4) trafficInfo = 3

                            val tPointList = ArrayList<TMapPoint>()
                            for (k in tStart..<tEnd + 1) {
                                tPointList.add(pointList[k])
                            }
                            // 교통 정보 및 라인 설정
                            val trafficLine = TrafficLine(trafficInfo, tPointList)
                            tmapTrafficLine.trafficLineList.add(trafficLine)
                        }
                    }
                }

                // 지도에 TrafficLine 추가
                tMapView.addTrafficLine(tmapTrafficLine)

                // 지도 영역 이동
                val bounds = tMapView.getBoundsFromTrafficLine(tmapTrafficLine)
                if (bounds != null) {
                    val insets = TMapInsets.of(100, 100, 100, 100)
                    tMapView.fitBounds(bounds, insets)
                }
            }
        }
    }


    private fun getContentFromNode(item: Element, tagName: String): String? {
        val list = item.getElementsByTagName(tagName)
        if (list.length > 0) {
            if (list.item(0).firstChild != null) {
                return list.item(0).firstChild.nodeValue
            }
        }
        return null
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
        super.onDestroy()
        if (tMapView != null) {
            tMapView.onDestroy()
        }
    }

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

    private fun selectFullTextGeocoding() {
        val input = EditText(this)
        AlertDialog.Builder(this)
            .setTitle("Full TextGeocoding")
            .setView(input)
            .setPositiveButton(
                "확인"
            ) { dialogInterface, i -> requestFullAddressGeo(input.text.toString()) }
            .setNegativeButton("취소", null)
            .create().show()
    }


    inner class FullAddrData {
        var lon: Double = 0.0
        var lat: Double = 0.0
        var lonEntr: Double = 0.0
        var latEntr: Double = 0.0
        var addr: String = ""
        var flag: String = ""
    }

    private fun requestFullAddressGeo(strAddr: String) {
        // 지번주소 정확도 순 Flag( 인덱스 작은 수록 정확도 높음 )
        val arrOldMatchFlag = arrayOf("M11", "M21", "M12", "M13", "M22", "M23", "M41", "M42", "M31", "M32", "M33")
        // 도로명주소 정확도 순 Flag( 인덱스 작은 수록 정확도 높음 )
        val arrNewMatchFlag = arrayOf("N51", "N52", "N53", "N54", "N55", "N61", "N62")
        val request: SLHttpRequest = SLHttpRequest("https://api2.sktelecom.com/tmap/geo/fullAddrGeo") // SKT
        request.addParameter("version", "1")
        request.addParameter("appKey", API_KEY)
        request.addParameter("coordType", "WGS84GEO")
        request.addParameter("addressFlag", "F00")
        request.addParameter("fullAddr", strAddr)
        request.send(object : OnResponseListener {
            override fun OnSuccess(data: String?) {
                // TODO Auto-generated method stub

                val fullAddrData: FullAddrData = FullAddrData()

                // JsonParsing
                try {
                    val alMatchFlag = ArrayList<String>() // MatchFlag 수집
                    var indexMatchFlag = -1
                    var i: Int
                    var j: Int

                    val objData = JSONObject(data).getJSONObject("coordinateInfo")
                    val length = objData.getInt("totalCount")
                    val arrCoordinate = objData.getJSONArray("coordinate")
                    var objCoordinate: JSONObject? = null

                    // 1. matchFlag 수집
                    i = 0
                    while (i < length) {
                        objCoordinate = arrCoordinate.getJSONObject(i)

                        if (objCoordinate.getString("matchFlag") != null && objCoordinate.getString("matchFlag") != "") {
                            // 지번주소
                            alMatchFlag.add(objCoordinate.getString("matchFlag"))
                        } else if (objCoordinate.getString("newMatchFlag") != null && objCoordinate.getString("newMatchFlag") != "") {
                            // 도로명주소
                            alMatchFlag.add(objCoordinate.getString("newMatchFlag"))
                        }
                        i++
                    }

                    // 2. < matchFlag 기준으로 더 정확한 항목의 index 결정 >
                    // 2_1. 수집한 matchFlag 중 "M11"(지번주소중 가장 높은정확도) 이 있으면 선택
                    i = 0
                    while (i < alMatchFlag.size) {
                        if (alMatchFlag[i] == "M11") {
                            indexMatchFlag = i
                            break
                        }
                        i++
                    }

                    // 2_2. "M11" 없으면 arrNewMatchFlag(도로명주소) 에서 선택
                    if (indexMatchFlag == -1) {
                        i = 0
                        while (i < arrNewMatchFlag.size) {
                            j = 0
                            while (j < alMatchFlag.size) {
                                if (alMatchFlag[j] == arrNewMatchFlag[i]) {
                                    indexMatchFlag = j
                                    break
                                }
                                j++
                            }
                            if (indexMatchFlag != -1) {
                                break
                            }
                            i++
                        }
                    }
                    // 2_3. 도로명주소 없으면 arrOldMatchFlag(지번주소) 에서 선택
                    if (indexMatchFlag == -1) {
                        i = 0
                        while (i < arrOldMatchFlag.size) {
                            j = 0
                            while (j < alMatchFlag.size) {
                                if (alMatchFlag[j] == arrOldMatchFlag[i]) {
                                    indexMatchFlag = j
                                    break
                                }
                                j++
                            }
                            if (indexMatchFlag != -1) {
                                break
                            }
                            i++
                        }
                    }

                    // 3. 선택된 인덱스의 결과 세팅
                    if (indexMatchFlag != -1) {
                        objCoordinate = arrCoordinate.getJSONObject(indexMatchFlag)
                        if (objCoordinate.getString("matchFlag") != "") {
                            // 지번 주소
                            if (objCoordinate.getString("lat") != "") fullAddrData.lat =
                                objCoordinate.getString("lat").toDouble()
                            if (objCoordinate.getString("lon") != "") fullAddrData.lon =
                                objCoordinate.getString("lon").toDouble()
                            if (objCoordinate.getString("latEntr") != "") fullAddrData.latEntr =
                                objCoordinate.getString("latEntr").toDouble()
                            if (objCoordinate.getString("lonEntr") != "") fullAddrData.lonEntr =
                                objCoordinate.getString("lonEntr").toDouble()
                            fullAddrData.addr =
                                objCoordinate.getString("city_do") + " " + objCoordinate.getString("gu_gun") + " " + objCoordinate.getString(
                                    "legalDong"
                                ) + " " + objCoordinate.getString("bunji")
                            fullAddrData.flag = objCoordinate.getString("matchFlag")
                        } else if (objCoordinate.getString("newMatchFlag") != "") {
                            // 도로명 주소
                            if (objCoordinate.getString("newLat") != "") fullAddrData.lat =
                                objCoordinate.getString("newLat").toDouble()
                            if (objCoordinate.getString("newLon") != "") fullAddrData.lon =
                                objCoordinate.getString("newLon").toDouble()
                            if (objCoordinate.getString("newLatEntr") != "") fullAddrData.latEntr =
                                objCoordinate.getString("newLatEntr").toDouble()
                            if (objCoordinate.getString("newLonEntr") != "") fullAddrData.lonEntr =
                                objCoordinate.getString("newLonEntr").toDouble()
                            fullAddrData.addr =
                                objCoordinate.getString("city_do") + " " + objCoordinate.getString("gu_gun") + " " + objCoordinate.getString(
                                    "newRoadName"
                                ) + " " + objCoordinate.getString("newBuildingIndex") + " " + objCoordinate.getString("newBuildingDong") + " (" + objCoordinate.getString(
                                    "zipcode"
                                ) + ")"
                            fullAddrData.flag = objCoordinate.getString("newMatchFlag")
                        }
                    }
                } catch (e: JSONException) {
                    // TODO Auto-generated catch block
                    Log.d("debug", e.toString())
                }

                //listener.onComplete(fullAddrData);
                setFullTextGeoCoding(fullAddrData)
            }

            override fun OnFail(errorCode: Int, errorMessage: String) {
                // TODO Auto-generated method stub
                Log.d("debug", "errorMessage :$errorMessage")
                //listener.onComplete(null);
            }
        })
    }

    private fun setFullTextGeoCoding(fullAddrData: FullAddrData) {
        tMapView.removeAllTMapMarkerItem2()

        if (fullAddrData.lat != 0.0) {
            //중심좌표 있을 경우
            val address1 = fullAddrData.addr
            val address2 = fullAddrData.flag + " : " + getFullAddrGeoFlagInfo(fullAddrData.flag)
            val view: ReverseLabelView = ReverseLabelView(this)
            view.setText(address1, address2)

            val marker = TMapMarkerItem2("fullTextGeocoding")
            marker.tMapPoint = TMapPoint(fullAddrData.lat, fullAddrData.lon)
            marker.iconView = view

            tMapView.addTMapMarkerItem2View(marker)
            tMapView.setCenterPoint(fullAddrData.lat, fullAddrData.lon)
        }

        if (fullAddrData.latEntr != 0.0) {
            // 입구좌표 있을 경우
            val iconList = ArrayList<Bitmap>()
            iconList.add(BitmapFactory.decodeResource(resources, R.drawable.poi_dot))
            val marker = TMapMarkerItem2("fullTextGeocoding_" + "Entr")
            marker.iconList = iconList
            marker.tMapPoint = TMapPoint(fullAddrData.latEntr, fullAddrData.lonEntr)

            tMapView.addTMapMarkerItem2Icon(marker)
            tMapView.setCenterPoint(fullAddrData.latEntr, fullAddrData.lonEntr)
        }
    }

    fun getFullAddrGeoFlagInfo(flag: String?): String {
        return if (flag != null && flag != "") {
            if (flag == "M11") {
                "법정동 코드 + 지번이 모두 일치"
            } else if (flag == "M12") {
                "법정동 코드 + 지번의 주번이 같고 부번이 ±5 이내로 부번과 일치"
            } else if (flag == "M13") {
                "법정동 코드 + 지번의 주번이 동일하지 않고 ±5 이내로 주번과 일치"
            } else if (flag == "M21") {
                "행정동 코드 + 지번이 모두 일치"
            } else if (flag == "M22") {
                "행정동 코드 + 지번의 주번이 같고 부번이 ±5 이내로 부번과 일치"
            } else if (flag == "M23") {
                "행정동 코드 + 지번의 주번이 동일하지 않고 ±5 이내로 주번과 일치"
            } else if (flag == "M31") {
                "읍/면/동/리의 중심 매칭"
            } else if (flag == "M32") {
                "행정동의 중심 매칭"
            } else if (flag == "M33") {
                "법정동의 중심 매칭"
            } else if (flag == "M41") {
                "법정동 코드 + 건물명칭이 일치(동일 법정동 내 동일 건물명이 없다는 전제)"
            } else if (flag == "M42") {
                "법정동 코드 + 건물 동이 매칭"
            } else if (flag == "N51") {
                "새(도로명) 주소 도로명이 일치하고 건물의 주번/부번이 모두 일치"
            } else if (flag == "N52") {
                "2차 종속도로에서 주번이 같고 부번이 다름(직전 부번[좌/우 구분]의 끝 좌표를 반환)"
            } else if (flag == "N53") {
                "1차 종속도로에서 주번이 같고 부번이 다름(직전 부번[좌/구 구분]의 끝 좌표를 반환)"
            } else if (flag == "N54") {
                "0차 종속도로에서 주번이 같은 것이 없어서 가장 가까운 직전 주번[좌/우 구분]의 가장 끝 좌표"
            } else if (flag == "N55") {
                "새(도로명) 주소 도로명은 일치하나 주번/부번의 직전 근사값이 없는 경우, 새(도로명) 주소 길 중심 좌표를 반환"
            } else if (flag == "N61") {
                "새(도로명) 주소 도로명이 틀리나 동일구 내 1개의 건물명과 일치하는 경우, 해당하는 건물 좌표를 반환"
            } else if (flag == "N62") {
                "새주소 도로명이 틀리나 동일구 내 1개의 건물명과 동명이 일치하는 경우, 해당하는 건물 좌표를 반환"
            } else {
                "해당 matchFlag 에 대한 설명이 없습니다."
            }
        } else {
            "matchFlag 가 비어있습니다."
        }
    }

    private fun selectReverseGeocoding() {
        AlertDialog.Builder(this)
            .setTitle("Reverse Geocoding")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    reverseGeoCoding(true)
                } else {
                    reverseGeoCoding(false)
                }
                dialog.dismiss()
            }).create().show()
    }

    private fun findRoadPoi() {
        val input = EditText(this)
        AlertDialog.Builder(this)
            .setTitle("읍면동/도로명 조회")
            .setView(input)
            .setPositiveButton("확인") { dialogInterface, i ->
                tMapView.removeAllTMapMarkerItem()
                val tMapData = TMapData()
                tMapData.findPoiAreaDataByName(
                    input.text.toString(), 10, 1
                ) { poiList ->
                    val pointList = ArrayList<TMapPoint>()
                    for (i in poiList.indices) {
                        val poi = poiList[i]
                        val marker = TMapMarkerItem()
                        marker.id = "marker$i"
                        marker.icon = BitmapFactory.decodeResource(resources, R.drawable.poi_dot)
                        marker.tMapPoint = poi.poiPoint
                        marker.calloutTitle = poi.poiName
                        marker.canShowCallout = true
                        marker.isAnimation = true

                        tMapView.addTMapMarkerItem(marker)
                        pointList.add(poi.poiPoint)
                    }
                    val info = tMapView.getDisplayTMapInfo(pointList)
                    tMapView.zoomLevel = info.zoom
                    tMapView.setCenterPoint(info.point.latitude, info.point.longitude)
                }
            }
            .setNegativeButton("취소", null)
            .create().show()
    }

    private fun findAroundPoi() {
        val input = EditText(this)
        AlertDialog.Builder(this)
            .setTitle("주변 POI 검색")
            .setMessage("ex) 편의점, 약국, 은행 등..")
            .setView(input)
            .setPositiveButton("확인") { dialogInterface, i ->
                val tMapData = TMapData()
                tMapData.findAroundNamePOI(
                    tMapView.centerPoint, input.text.toString(), 1, 99
                ) { arrayList ->
                    tMapView.removeAllTMapMarkerItem()
                    val pointList = ArrayList<TMapPoint>()
                    if (arrayList != null) {
                        for (item in arrayList) {
                            tMapView.addTMapPOIItem(arrayList)
                            pointList.add(item.poiPoint)
                        }

                        val info = tMapView.getDisplayTMapInfo(pointList)
                        tMapView.zoomLevel = info.zoom
                        tMapView.setCenterPoint(info.point.latitude, info.point.longitude)
                    }
                }
            }
            .setNegativeButton("취소", null)
            .create().show()
    }

    private fun findAllPoi() {
        val input = EditText(this)
        AlertDialog.Builder(this)
            .setTitle("POI 통합 검색")
            .setView(input)
            .setPositiveButton(
                "확인"
            ) { dialog, which -> findAllPoi(input.text.toString()) }
            .setNegativeButton("취소", null)
            .create().show()
    }

    fun findAllPoi(strData: String?) {
        val tmapdata = TMapData()
        tmapdata.findAllPOI(
            strData
        ) { poiItemList -> showPOIResultDialog(poiItemList) }
    }

    private fun showPOIResultDialog(poiItem: ArrayList<TMapPOIItem>?) {
        runOnUiThread {
            if (poiItem != null) {
                val item = arrayOfNulls<CharSequence>(poiItem.size)
                for (i in poiItem.indices) {
                    item[i] = poiItem[i].name
                }
                AlertDialog.Builder(this@TMapModule)
                    .setTitle("POI 검색 결과")
                    .setIcon(R.drawable.tmark)
                    .setItems(item, DialogInterface.OnClickListener { dialog, i ->
                        dialog.dismiss()
                        initAll()
                        val poi = poiItem[i]
                        val marker = TMapMarkerItem()
                        marker.id = poi.id
                        marker.tMapPoint = poi.poiPoint
                        val icon = BitmapFactory.decodeResource(resources, R.drawable.poi_dot)
                        marker.icon = icon

                        marker.calloutTitle = poi.poiName
                        marker.calloutSubTitle = "id:" + poi.poiid
                        marker.canShowCallout = true

                        marker.isAnimation = true

                        tMapView.addTMapMarkerItem(marker)
                        tMapView.setCenterPoint(poi.poiPoint.latitude, poi.poiPoint.longitude)
                    }).create().show()
            }
        }
    }

    private fun selectVisibleLogo() {
        AlertDialog.Builder(this)
            .setTitle("로고 보기")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select3, -1, DialogInterface.OnClickListener { dialog, position ->
                if (position == 0) {
                    tMapView.setVisibleLogo(true)
                } else {
                    tMapView.setVisibleLogo(false)
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

    private fun selectCircle() {
        AlertDialog.Builder(this)
            .setTitle("서클(원) 그리기")
            .setIcon(R.drawable.tmark)
            .setSingleChoiceItems(R.array.select2, -1, DialogInterface.OnClickListener { dialog, i ->
                if (i == 0) {
                    val circle = TMapCircle()
                    circle.id = "circle" + circleIndex++
                    circle.radius = 300.0
                    circle.areaColor = Color.BLUE
                    circle.lineColor = Color.BLUE
                    circle.areaAlpha = 100
                    circle.lineAlpha = 255
                    circle.circleWidth = 10f
                    circle.radiusVisible = true

                    val point = randomTMapPoint()
                    circle.centerPoint = point

                    tMapView.setCenterPoint(point.latitude, point.longitude)
                    tMapView.addTMapCircle(circle)
                } else {
                    tMapView.removeAllTMapCircle()
                }
                dialog.dismiss()
            }).create().show()
    }


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

    companion object {
        private const val API_KEY = "N58gCr0OpV7gn4udSAHyC3PZyY2HC7Jt8e4LQ5WB"
    }
}