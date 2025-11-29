import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.85;
const SHEET_MIN_HEIGHT = SCREEN_HEIGHT * 0.2;
// When peeking, we want to show SHEET_MIN_HEIGHT from the bottom
// So we translate down by (SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT)
const SHEET_PEEK_TRANSLATE_Y = SCREEN_HEIGHT * 0.65; // 85% - 20% = 65%

export default function SendPackage() {
  const [locationMethod, setLocationMethod] = useState('map');
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  
  const webViewRef = useRef<WebView>(null);
  const slideAnim = useRef(new Animated.Value(SHEET_PEEK_TRANSLATE_Y)).current;
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      reverseGeocode(location.coords.latitude, location.coords.longitude, setFromAddress);
    })();
  }, []);

  const reverseGeocode = async (lat: number, lng: number, setter: (addr: string) => void) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: {
          'User-Agent': 'DroplyApp/1.0 (contact@droply.com)'
        }
      });
      
      const text = await response.text();

      if (!response.ok) {
        console.error("Reverse geocoding failed with status:", response.status);
        return;
      }

      try {
        const data = JSON.parse(text);
        if (data.display_name) {
          setter(data.display_name);
        } else if (data.error) {
            console.warn("Nominatim error:", data.error);
        }
      } catch (e) {
        console.error("Error parsing JSON:", e, "Response start:", text.substring(0, 50));
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  const expandMap = () => {
    setIsExpanded(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const collapseMap = () => {
    setIsExpanded(false);
    Animated.spring(slideAnim, {
      toValue: SHEET_PEEK_TRANSLATE_Y,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          expandMap();
        } else if (gestureState.dy > 50) {
          collapseMap();
        }
      },
    })
  ).current;

  const lat = currentLocation?.coords.latitude || 36.75;
  const lng = currentLocation?.coords.longitude || 3.05;
  const hasLocation = !!currentLocation;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat}, ${lng}], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          var marker;
          var hasLocation = ${hasLocation};

          if (hasLocation) {
            L.marker([${lat}, ${lng}]).addTo(map)
              .bindPopup('You are here')
              .openPopup();
          }

          map.on('click', function(e) {
            if (marker) {
              map.removeLayer(marker);
            }
            marker = L.marker(e.latlng).addTo(map);
            window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
          });
        </script>
      </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setSelectedLocation(data);
      reverseGeocode(data.lat, data.lng, setToAddress);
    } catch (e) {
      console.error("Error parsing message from WebView", e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingBottom: SHEET_MIN_HEIGHT }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View>
              <Text style={styles.logoTitle}>Droply</Text>
              <Text style={styles.logoSub}>DISCOVER QUALITY, DELIVERED FAST</Text>
          </View>
          <View style={styles.profileCircle} />
        </View>

        <Text style={styles.pageTitle}>customize your package</Text>

        <View style={styles.locationSection}>
          <View style={styles.timelineContainer}>
              <View style={styles.dot} />
              <View style={styles.line} />
              <View style={styles.dot} />
          </View>
          <View style={styles.inputsContainer}>
              <TextInput 
                  style={styles.inputBox} 
                  placeholder="From..." 
                  placeholderTextColor="#999"
                  value={fromAddress}
                  editable={false}
                  multiline
              />
              <TouchableOpacity style={styles.inputBox} onPress={expandMap}>
                <Text style={{ color: toAddress ? '#000' : '#999', fontSize: 16 }}>
                  {toAddress || "To (Select on map below)..."}
                </Text>
              </TouchableOpacity>
          </View>
        </View>

        <View style={styles.radioGroup}>
          <TouchableOpacity style={styles.radioRow} onPress={() => setLocationMethod('map')}>
              <View style={[styles.radioOuter, locationMethod === 'map' && styles.radioSelected]}>
                  {locationMethod === 'map' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>choose on the map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.radioRow} onPress={() => setLocationMethod('current')}>
              <View style={[styles.radioOuter, locationMethod === 'current' && styles.radioSelected]}>
                  {locationMethod === 'current' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>use my current location</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.extraInputs}>
          <TextInput style={styles.inputBox} placeholder="Package details..." placeholderTextColor="#999" />
          <TextInput style={styles.inputBox} placeholder="Recipient info..." placeholderTextColor="#999" />
        </View>
      </ScrollView>

      <Animated.View 
        style={[
          styles.bottomSheet, 
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.sheetHeader}>
          <View style={styles.dragHandle} />
          <Text style={styles.sheetTitle}>
            {isExpanded ? "Swipe down to minimize" : "Swipe up to expand map"}
          </Text>
        </View>
        
        <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.map}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
        />
        
        {selectedLocation && isExpanded && (
            <View style={styles.selectedLocationBanner}>
              <Text numberOfLines={1} style={styles.selectedLocationText}>
                Selected: {toAddress || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
              </Text>
              <TouchableOpacity style={styles.confirmButton} onPress={collapseMap}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  logoSub: {
    fontSize: 10,
    color: '#666',
  },
  profileCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'black',
    borderRadius: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 20,
    marginLeft: 10,
  },
  locationSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 25,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#d0d0d0',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: 'black',
    marginVertical: 5,
  },
  inputsContainer: {
    flex: 1,
    gap: 15,
  },
  inputBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    minHeight: 50,
    justifyContent: 'center',
  },
  radioGroup: {
    marginBottom: 20,
    gap: 10,
    marginLeft: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: 'black',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'black',
  },
  radioText: {
    fontSize: 16,
  },
  extraInputs: {
    gap: 15,
    marginBottom: 40,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_MAX_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  sheetHeader: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginBottom: 5,
  },
  sheetTitle: {
    fontSize: 12,
    color: '#999',
  },
  map: {
    flex: 1,
  },
  selectedLocationBanner: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedLocationText: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
