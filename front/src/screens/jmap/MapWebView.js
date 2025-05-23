import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const MapWebView = ({ from, to }) => {
    const tmapApiKey = '2AfJLYy4Roajsr0IORYof7BzkNDbphv8axCMrOFv';

    // from, to가 없으면 기본 지도 (서울역) 띄움
    const hasRoute = from && to;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>T Map 경로 표시</title>
      <script src="https://apis.openapi.sk.com/tmap/js?version=1&appKey=${tmapApiKey}"></script>
      <style>
        html, body, #map_div { height: 100%; margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="map_div"></div>
      <script>
        var map = new Tmapv2.Map("map_div", {
          center: new Tmapv2.LatLng(${hasRoute ? from.latitude : 37.55467884}, ${hasRoute ? from.longitude : 126.9706069}),
          width: "100%",
          height: "100%",
          zoom: 14
        });

        ${hasRoute ? `
          // 출발지 마커
          new Tmapv2.Marker({
            position: new Tmapv2.LatLng(${from.latitude}, ${from.longitude}),
            map: map,
            icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png"
          });

          // 도착지 마커
          new Tmapv2.Marker({
            position: new Tmapv2.LatLng(${to.latitude}, ${to.longitude}),
            map: map,
            icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_s.png"
          });

          // 경로 요청
          fetch("https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "appKey": "${tmapApiKey}"
            },
            body: JSON.stringify({
              startX: ${from.longitude},
              startY: ${from.latitude},
              endX: ${to.longitude},
              endY: ${to.latitude},
              reqCoordType: "WGS84GEO",
              resCoordType: "WGS84GEO",
              searchOption: 0
            })
          })
          .then(res => res.json())
          .then(data => {
            var route = data.features;
            var linePath = [];

            route.forEach(feature => {
              if (feature.geometry.type === "LineString") {
                feature.geometry.coordinates.forEach(coord => {
                  linePath.push(new Tmapv2.LatLng(coord[1], coord[0]));
                });
              }
            });

            if (linePath.length > 0) {
              new Tmapv2.Polyline({
                path: linePath,
                strokeColor: "#FF0000",
                strokeWeight: 4,
                map: map
              });

              var midIndex = Math.floor(linePath.length / 2);
              map.setCenter(linePath[midIndex]);
            }
          })
          .catch(err => {
            console.error("경로 요청 실패:", err);
          });
        ` : ''}
      </script>
    </body>
    </html>
  `;

    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                style={{ flex: 1 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});

export default MapWebView;
