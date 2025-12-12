import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.85;
const SHEET_MIN_HEIGHT = SCREEN_HEIGHT * 0.15; 
const SHEET_PEEK_TRANSLATE_Y = SCREEN_HEIGHT * 0.70; 

export default function SendPackage() {
  const { user } = useAuth();
  const [locationMethod, setLocationMethod] = useState<'map' | 'current'>('current'); 
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Form State
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [packageType, setPackageType] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Which field are we picking for?
  const [activeField, setActiveField] = useState<'from' | 'to'>('to');

  const webViewRef = useRef<WebView>(null);
  const slideAnim = useRef(new Animated.Value(SHEET_PEEK_TRANSLATE_Y)).current;
  const [isExpanded, setIsExpanded] = useState(false);

  // Initial Location Fetch
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      
      // If default is 'current', fill From immediately
      if (locationMethod === 'current') {
         reverseGeocode(location.coords.latitude, location.coords.longitude, setFromAddress);
      }
    })();
  }, []);

  // When toggling methods
  const handleMethodChange = async (method: 'map' | 'current') => {
      setLocationMethod(method);
      if (method === 'current') {
          if (currentLocation) {
              reverseGeocode(currentLocation.coords.latitude, currentLocation.coords.longitude, setFromAddress);
          } else {
              let location = await Location.getCurrentPositionAsync({});
              setCurrentLocation(location);
              reverseGeocode(location.coords.latitude, location.coords.longitude, setFromAddress);
          }
      } else {
          setFromAddress(''); 
      }
  };

  const reverseGeocode = async (lat: number, lng: number, setter: (addr: string) => void) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar,en`, {
        headers: { 'User-Agent': 'DroplyApp/1.0' }
      });
      const text = await response.text();
      if (!response.ok) return;
      try {
        const data = JSON.parse(text);
        if (data.display_name) setter(data.display_name);
      } catch (e) {}
    } catch (error) {}
  };

  const openMapFor = (field: 'from' | 'to') => {
      if (locationMethod === 'current' && field === 'from') {
          Alert.alert("Location Locked", "Switch to 'Pin on Map' to select a different starting location.");
          return;
      }

      setActiveField(field);
      setIsExpanded(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
  };

  const collapseMap = () => {
    setIsExpanded(false);
    Animated.spring(slideAnim, { toValue: SHEET_PEEK_TRANSLATE_Y, useNativeDriver: true }).start();
  };

  const confirmLocation = () => {
      if (selectedLocation) {
          if (activeField === 'from') {
               reverseGeocode(selectedLocation.lat, selectedLocation.lng, setFromAddress);
          } else {
               reverseGeocode(selectedLocation.lat, selectedLocation.lng, setToAddress);
          }
          collapseMap();
          setSelectedLocation(null); 
      }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) openMapFor(activeField); 
        else if (gestureState.dy > 50) collapseMap();
      },
    })
  ).current;

  // Supabase Handler
  const handleSendPackage = async () => {
    if (!user) {
        Alert.alert("Error", "You must be logged in to send a package.");
        return;
    }
    if (!fromAddress || !toAddress || !packageType || !recipientName) {
        Alert.alert("Missing Fields", "Please fill in all required fields (Locations, Type, Recipient).");
        return;
    }

    setIsSubmitting(true);
    try {
        const { error } = await supabase
            .from('packages')
            .insert({
                sender_id: user.id,
                title: packageType,
                description: `${recipientName} - ${instructions}`, 
                pickup_address: fromAddress,
                dropoff_address: toAddress,
                weight: weight ? parseFloat(weight) : null,
                price: price ? parseFloat(price) : null,
                status: 'pending'
            });

        if (error) throw error;

        Alert.alert("Success", "Your package request has been sent!", [
            { text: "OK", onPress: () => router.push('/dashboard') }
        ]);
        
    } catch (error: any) {
        Alert.alert("Submission Error", error.message || "Could not send package.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Map HTML Generation
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
        <style> body { margin: 0; padding: 0; } #map { height: 100vh; width: 100%; } </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat}, ${lng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);
          var marker;
          if (${hasLocation}) {
            L.marker([${lat}, ${lng}]).addTo(map).bindPopup('You').openPopup();
          }
          map.on('click', function(e) {
            if (marker) map.removeLayer(marker);
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
    } catch (e) {}
  };

  return (
    <View style={styles.mainContainer}>
      
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Package</Text>
          <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageSubtitle}>Where are we sending this?</Text>

        {/* --- Location Section --- */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Route Details</Text>
        </View>

        <View style={styles.routeContainer}>
            <View style={styles.timeline}>
                <View style={[styles.dot, { borderColor: '#7B1FA2' }]} />
                <View style={styles.line} />
                <View style={[styles.square, { borderColor: '#C2185B' }]} />
            </View>

            <View style={styles.inputsColumn}>
                
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Pick up from</Text>
                    <TouchableOpacity 
                        style={[styles.inputWrapper, locationMethod === 'current' && styles.disabledInput]}
                        onPress={() => openMapFor('from')}
                        activeOpacity={locationMethod === 'current' ? 1 : 0.7}
                    >
                        <Feather name="map-pin" size={18} color="#7B1FA2" style={styles.inputIcon} />
                        <Text style={[styles.inputTextValue, !fromAddress && styles.placeholder]}>
                            {fromAddress || (locationMethod === 'current' ? "Fetching current location..." : "Select Pickup Location")}
                        </Text>
                        {locationMethod === 'current' && <Feather name="lock" size={14} color="#999" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Deliver to</Text>
                    <TouchableOpacity style={styles.inputWrapper} onPress={() => openMapFor('to')}>
                        <Feather name="map" size={18} color="#C2185B" style={styles.inputIcon} />
                        <Text style={[styles.inputTextValue, !toAddress && styles.placeholder]}>
                            {toAddress || "Select Destination on Map"}
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>

        <View style={styles.toggleContainer}>
             <TouchableOpacity 
                style={[styles.pillOption, locationMethod === 'map' && styles.pillSelectedMap]} 
                onPress={() => handleMethodChange('map')}
             >
                <Text style={[styles.pillText, locationMethod === 'map' && styles.textSelected]}>Pin on Map</Text>
             </TouchableOpacity>

             <TouchableOpacity 
                style={[styles.pillOption, locationMethod === 'current' && styles.pillSelectedLoc]} 
                onPress={() => handleMethodChange('current')}
             >
                <Text style={[styles.pillText, locationMethod === 'current' && styles.textSelected]}>Use My Location</Text>
             </TouchableOpacity>
        </View>


        {/* --- Package Details --- */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Package Details</Text>
        </View>
        
        <View style={styles.detailsGrid}>
            <View style={styles.gridItem}>
                <View style={styles.floatingInput}>
                    <Feather name="box" size={20} color="#555" />
                    <TextInput 
                        style={styles.bareInput} 
                        placeholder="Type (e.g., Documents)" 
                        placeholderTextColor="#999"
                        value={packageType}
                        onChangeText={setPackageType}
                    />
                </View>
            </View>

            <View style={styles.gridItem}>
                <View style={styles.floatingInput}>
                    <FontAwesome5 name="weight-hanging" size={18} color="#555" />
                    <TextInput 
                        style={styles.bareInput} 
                        placeholder="Weight (kg)" 
                        placeholderTextColor="#999" 
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={setWeight}
                    />
                </View>
            </View>
        </View>

        <View style={[styles.floatingInput, { marginTop: 15 }]}>
            <Feather name="user" size={20} color="#555" />
            <TextInput 
                style={styles.bareInput} 
                placeholder="Recipient Name" 
                placeholderTextColor="#999"
                value={recipientName}
                onChangeText={setRecipientName}
            />
        </View>

        <View style={[styles.floatingInput, { marginTop: 15 }]}>
            <Feather name="dollar-sign" size={20} color="#555" />
            <TextInput 
                style={styles.bareInput} 
                placeholder="Offering Price (DA)" 
                placeholderTextColor="#999" 
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
            />
        </View>

        <View style={[styles.floatingInput, { marginTop: 15 }]}>
            <MaterialIcons name="notes" size={22} color="#555" />
            <TextInput 
                style={styles.bareInput} 
                placeholder="Special instructions..." 
                placeholderTextColor="#999"
                value={instructions}
                onChangeText={setInstructions} 
            />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitDisabled]} 
            onPress={handleSendPackage}
            disabled={isSubmitting}
        >
            <Text style={styles.submitText}>
                {isSubmitting ? "Sending..." : "Send Request"}
            </Text>
            {!isSubmitting && <Feather name="send" size={20} color="#FFF" style={{ marginLeft: 10 }} />}
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ height: 120 }} />

      </ScrollView>

      {/* Map Bottom Sheet */}
      <Animated.View 
        style={[
          styles.bottomSheet, 
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.sheetHandleContainer}>
          <View style={styles.sheetHandle} />
        </View>
        
        <View style={styles.mapContainer}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                style={{ flex: 1 }}
                onMessage={handleWebViewMessage}
            />
            {isExpanded && (
                <View style={styles.mapOverlay}>
                     {selectedLocation ? (
                         <View style={styles.confirmBanner}>
                             <View style={styles.bannerIcon}>
                                <Feather name="check" size={24} color="#FFF" />
                             </View>
                             <View style={{ flex: 1, marginHorizontal: 12 }}>
                                 <Text style={styles.bannerLabel}>
                                     {activeField === 'from' ? "Confirm Pickup" : "Confirm Destination"}
                                 </Text>
                                 <Text numberOfLines={1} style={styles.bannerAddress}>
                                    {`Lat: ${selectedLocation.lat.toFixed(4)}, Lng: ${selectedLocation.lng.toFixed(4)}`}
                                 </Text>
                             </View>
                             <TouchableOpacity style={styles.minimalConfirmBtn} onPress={confirmLocation}>
                                 <Text style={styles.minimalConfirmText}>OK</Text>
                             </TouchableOpacity>
                         </View>
                     ) : (
                         <View style={styles.instructionBanner}>
                             <Text style={styles.instructionText}>
                                 {activeField === 'from' ? "Tap map to set PICKUP" : "Tap map to set DESTINATION"}
                             </Text>
                         </View>
                     )}
                </View>
            )}
        </View>
      </Animated.View>

    </View>
  );
}

// Need to import FontAwesome5 for Weight icon
import { FontAwesome5 } from '@expo/vector-icons';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  pageSubtitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 30,
    marginTop: 0,
    lineHeight: 34,
  },
  
  /* Sections */
  sectionHeader: {
      marginBottom: 15,
      marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* Route Visuals */
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 45, 
    paddingBottom: 45,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    backgroundColor: '#FFF',
  },
  square: {
      width: 14,
      height: 14,
      borderRadius: 2,
      borderWidth: 3,
      backgroundColor: '#FFF',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
    borderRadius: 1,
  },
  inputsColumn: {
      flex: 1,
      gap: 20,
  },
  
  /* Inputs */
  fieldContainer: {
      flex: 1,
  },
  fieldLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#555',
      marginBottom: 8,
      marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  disabledInput: {
      backgroundColor: '#F5F5F5',
      shadowOpacity: 0,
      elevation: 0,
  },
  inputIcon: {
      marginRight: 14,
  },
  inputTextValue: {
      flex: 1,
      fontSize: 16,
      color: '#1A1A1A',
      fontWeight: '500',
  },
  placeholder: {
      color: '#999',
      fontWeight: '400',
  },

  /* Toggle Pills */
  toggleContainer: {
      flexDirection: 'row',
      backgroundColor: '#F0F0F0',
      borderRadius: 50,
      padding: 4,
      marginTop: 10,
      marginBottom: 10,
  },
  pillOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 40,
  },
  pillSelectedMap: {
      backgroundColor: '#4A148C', 
      shadowColor: "#4A148C",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 4,
  },
  pillSelectedLoc: {
    backgroundColor: '#C2185B', 
    shadowColor: "#C2185B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  pillText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
  },
  textSelected: {
      color: '#FFF',
  },

  /* Details Grid */
  detailsGrid: {
      gap: 15,
      flexDirection: 'row', // Make them side by side
  },
  gridItem: {
      flex: 1,
  },
  floatingInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: '#EEE',
  },
  bareInput: {
      flex: 1,
      fontSize: 16,
      marginLeft: 12,
      color: '#333',
  },

  /* Submit Button */
  submitButton: {
      backgroundColor: '#7B1FA2',
      borderRadius: 16,
      paddingVertical: 18,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
  },
  submitDisabled: {
      backgroundColor: '#888',
  },
  submitText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
  },

  /* Bottom Sheet */
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_MAX_HEIGHT,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 25,
    zIndex: 999,
  },
  sheetHandleContainer: {
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
  },
  mapContainer: {
      flex: 1,
      backgroundColor: '#F5F5F5',
  },
  mapOverlay: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      right: 20,
  },
  confirmBanner: {
      backgroundColor: '#1A1A1A',
      padding: 12,
      borderRadius: 50,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
  },
  bannerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#333',
      justifyContent: 'center',
      alignItems: 'center',
  },
  bannerLabel: {
      color: '#AAA',
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
  },
  bannerAddress: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '600',
  },
  minimalConfirmBtn: {
      backgroundColor: '#FFF',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
  },
  minimalConfirmText: {
      color: '#000',
      fontWeight: '700',
      fontSize: 12,
  },
  instructionBanner: {
      alignSelf: 'center',
      backgroundColor: 'rgba(255,255,255,0.9)',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      elevation: 3,
  },
  instructionText: {
      color: '#333',
      fontSize: 14,
      fontWeight: '600',
  },
});
