import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function PackageDetails() {
  const { id } = useLocalSearchParams();
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     if (id) fetchPackageDetails();
  }, [id]);

  const fetchPackageDetails = async () => {
    try {
        const { data, error } = await supabase
            .from('packages')
            .select('*, sender:sender_id(full_name, phone_number), deliverer:deliverer_id(full_name, phone_number)')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        setPackageData(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#FFA000'; // Amber
        case 'in_transit': return '#2196F3'; // Blue
        case 'delivered': return '#4CAF50'; // Green
        case 'cancelled': return '#F44336'; // Red
        default: return '#757575';
    }
  };

  const getStatusLabel = (status: string) => status?.replace('_', ' ').toUpperCase();

  if (loading) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A148C" />
          </View>
      );
  }

  if (!packageData) {
      return (
          <View style={styles.loadingContainer}>
              <Text>Package not found.</Text>
              <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                  <Text style={{ color: '#4A148C' }}>Go Back</Text>
              </TouchableOpacity>
          </View>
      );
  }

  // Generate Map HTML with markers for Pickup (Green) and Dropoff (Red)
  // We'll trust the coordinate strings if available, otherwise we can't map easily without geocoding again.
  // Ideally, we should have stored coords. For now, we'll just show a placeholder map or center it.
  // Actually, let's reverse geocode the addresses solely for display if we don't have coords?
  // Simpler: Just render a static helpful map or similar.
  // Since we don't have coords stored in the DB (only addresses string), we can't easily show markers without geocoding.
  // Let's show a nice "Route" UI instead of a map to avoid complexity/errors, or just a generic map.
  // User asked for "see details", map is nice but maybe optional if strictly address-based.
  // Let's stick to a clean UI with no map for now to avoid broken map pins, focusing on the data.
  
  return (
    <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Package #{packageData.id}</Text>
            <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Status Card */}
            <View style={styles.statusCard}>
                <View style={[styles.statusIcon, { backgroundColor: getStatusColor(packageData.status) + '20' }]}>
                    <Feather name="box" size={32} color={getStatusColor(packageData.status)} />
                </View>
                <View style={{ marginLeft: 16 }}>
                    <Text style={styles.statusLabel}>Current Status</Text>
                    <Text style={[styles.statusValue, { color: getStatusColor(packageData.status) }]}>
                        {getStatusLabel(packageData.status)}
                    </Text>
                    <Text style={styles.dateText}>
                        Updated: {new Date(packageData.updated_at || packageData.created_at).toLocaleString()}
                    </Text>
                </View>
            </View>

            {/* Route Section */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Route Information</Text>
                <View style={styles.routeContainer}>
                    {/* Pickup */}
                    <View style={styles.routeRow}>
                        <View style={styles.timelineCol}>
                            <View style={[styles.dot, { borderColor: '#7B1FA2' }]} />
                            <View style={styles.line} />
                        </View>
                        <View style={styles.routeInfo}>
                            <Text style={styles.routeLabel}>Pick Up</Text>
                            <Text style={styles.routeAddress}>{packageData.pickup_address}</Text>
                        </View>
                    </View>
                    {/* Dropoff */}
                    <View style={styles.routeRow}>
                        <View style={styles.timelineCol}>
                            <View style={[styles.dateSquare, { borderColor: '#C2185B' }]} />
                        </View>
                        <View style={styles.routeInfo}>
                            <Text style={styles.routeLabel}>Drop Off</Text>
                            <Text style={styles.routeAddress}>{packageData.dropoff_address}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Package Info */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Package Details</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Type</Text>
                        <Text style={styles.gridValue}>{packageData.title}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Weight</Text>
                        <Text style={styles.gridValue}>{packageData.weight ? `${packageData.weight} kg` : 'N/A'}</Text>
                    </View>
                </View>

                {/* Price Row */}
                <View style={[styles.grid, { marginTop: 15 }]}>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Price</Text>
                        <Text style={styles.gridValue}>
                             {packageData.price ? `${packageData.price} DA` : 'Not Set'}
                        </Text>
                    </View>
                </View>
                <View style={[styles.grid, { marginTop: 15 }]}>
                    <View style={styles.gridItem}>
                         <Text style={styles.gridLabel}>Note</Text>
                         <Text style={styles.gridValue}>{packageData.description || 'No special instructions'}</Text>
                    </View>
                </View>
            </View>

            {/* Parties Info */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Contact Info</Text>
                <View style={styles.partyRow}>
                    <View style={styles.partyIcon}>
                        <Feather name="user" size={20} color="#555" />
                    </View>
                    <View>
                        <Text style={styles.routeLabel}>Sender</Text>
                        <Text style={styles.routeAddress}>{packageData.sender?.full_name || 'Unknown'}</Text>
                        <Text style={styles.subText}>{packageData.sender?.phone_number || 'No phone'}</Text>
                    </View>
                </View>
                
                {packageData.deliverer && (
                    <View style={[styles.partyRow, { marginTop: 15 }]}>
                        <View style={styles.partyIcon}>
                            <FontAwesome5 name="shipping-fast" size={16} color="#555" />
                        </View>
                        <View>
                            <Text style={styles.routeLabel}>Deliverer</Text>
                            <Text style={styles.routeAddress}>{packageData.deliverer?.full_name}</Text>
                            <Text style={styles.subText}>{packageData.deliverer?.phone_number}</Text>
                        </View>
                    </View>
                )}
            </View>

        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: '#4A148C',
  },
  backButton: {
      padding: 8,
  },
  headerTitle: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: '700',
  },
  scrollContent: {
      padding: 20,
  },
  
  /* Status Card */
  statusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      padding: 20,
      borderRadius: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
  },
  statusIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
  },
  statusLabel: {
      color: '#888',
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
  },
  statusValue: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 4,
  },
  dateText: {
      color: '#AAA',
      fontSize: 12,
  },

  /* Sections */
  section: {
      backgroundColor: '#FFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
  },
  sectionHeader: {
      fontSize: 16,
      fontWeight: '700',
      color: '#333',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      paddingBottom: 10,
  },
  
  /* Route */
  routeContainer: {
      paddingLeft: 5,
  },
  routeRow: {
      flexDirection: 'row',
      marginBottom: 0,
  },
  timelineCol: {
      alignItems: 'center',
      width: 30,
      marginRight: 10,
  },
  dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      backgroundColor: '#FFF',
  },
  dateSquare: {
      width: 12,
      height: 12,
      borderRadius: 2,
      borderWidth: 2,
      backgroundColor: '#FFF',
  },
  line: {
      width: 2,
      height: 40,
      backgroundColor: '#E0E0E0',
      marginVertical: 4,
  },
  routeInfo: {
      flex: 1,
      paddingBottom: 20,
  },
  routeLabel: {
      fontSize: 12,
      color: '#888',
      marginBottom: 4,
  },
  routeAddress: {
      fontSize: 15,
      color: '#333',
      fontWeight: '500',
      lineHeight: 20,
  },
  
  /* Grid */
  grid: {
      flexDirection: 'row',
  },
  gridItem: {
      flex: 1,
  },
  gridLabel: {
      color: '#888',
      fontSize: 12,
      marginBottom: 4,
  },
  gridValue: {
      color: '#333',
      fontSize: 16,
      fontWeight: '600',
  },

  /* Party */
  partyRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  partyIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
  },
  subText: {
      color: '#999',
      fontSize: 13,
  },
});
