import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Reusable Bento Card Component
const BentoCard = ({ style, onPress, delay = 0, children }: any) => (
  <Animated.View entering={ZoomIn.delay(delay).duration(600).springify()} style={[styles.cardContainer, style]}>
    <TouchableOpacity 
      style={styles.touchable} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      {children}
    </TouchableOpacity>
  </Animated.View>
);

export default function Home() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.mainContainer}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP HEADER: Sidebar + Greeting + Profile */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={styles.menuIcon}>
                <Ionicons name="grid-outline" size={28} color="#333" />
            </TouchableOpacity>
            
            <View style={styles.greetingBox}>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.nameText}>{userName}</Text>
            </View>

            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileAvatar}>
                <Text style={styles.avatarText}>{userName[0]}</Text>
                <View style={styles.onlineDot} />
            </TouchableOpacity>
        </Animated.View>

        {/* SEARCH BAR (Quick Track) */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput 
                placeholder="Track a package (e.g. #TRK-123)..."
                placeholderTextColor="#999"
                style={styles.searchInput}
                onFocus={() => router.push('/track-package')}
            />
            <View style={styles.searchButton}>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
            </View>
        </Animated.View>

        {/* BENTO GRID LAYOUT */}
        <View style={styles.bentoGrid}>
            
            {/* ROW 1: Hero (Send) + Tall (Deliver) */}
            <View style={styles.row}>
                {/* HERO CARD: SEND PACKAGE */}
                <BentoCard 
                    style={[styles.card, styles.heroCard]} 
                    onPress={() => router.push('/send-package' as any)}
                    delay={200}
                >
                    <View style={styles.heroTop}>
                        <View style={styles.heroIconBox}>
                            <FontAwesome5 name="paper-plane" size={24} color="#7b68ee" />
                        </View>
                        <MaterialCommunityIcons name="arrow-top-right" size={24} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.heroTitle}>Send Package</Text>
                        <Text style={styles.heroSubtitle}>Instant pickup & delivery</Text>
                    </View>
                </BentoCard>

                {/* TALL CARD: DELIVER */}
                <BentoCard 
                    style={[styles.card, styles.tallCard]} 
                    onPress={() => router.push('/deliver-package')}
                    delay={300}
                >
                     <View style={[styles.iconCircle, { backgroundColor: '#FCE4EC' }]}>
                        <MaterialCommunityIcons name="truck-fast" size={28} color="#E91E63" />
                     </View>
                     <View style={styles.tallCardContent}>
                        <Text style={styles.cardTitleDark}>Deliver</Text>
                        <Text style={styles.cardSubtitleDark}>Earn money</Text>
                     </View>
                </BentoCard>
            </View>

            {/* ROW 2: WIDE MAP CARD */}
            <BentoCard 
                style={[styles.card, styles.wideCard]} 
                onPress={() => router.push('/droply-map')}
                delay={400}
            >
                <View style={styles.mapBackground}>
                    <Ionicons name="map" size={120} color="#f0f0f0" style={{ transform: [{ rotate: '-15deg' }] }} />
                </View>
                <View style={styles.wideCardContent}>
                    <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                       <Ionicons name="map-outline" size={24} color="#2196F3" />
                    </View>
                    <View>
                         <Text style={styles.cardTitleDark}>Live Map</Text>
                         <Text style={styles.cardSubtitleDark}>Find nearby zones</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </BentoCard>

            {/* ROW 3: DASHBOARD + EXTRAS */}
            <View style={styles.row}>
                <BentoCard 
                    style={[styles.card, styles.squareCard]} 
                    onPress={() => router.push('/dashboard')}
                    delay={500}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                        <MaterialCommunityIcons name="view-dashboard-outline" size={26} color="#4CAF50" />
                    </View>
                    <Text style={styles.cardTitleDark}>Dashboard</Text>
                    <Text style={styles.tinyText}>Stats & Data</Text>
                </BentoCard>

                <BentoCard 
                    style={[styles.card, styles.squareCard]} 
                    onPress={() => router.push('/coming-soon')}
                    delay={600}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="headset-outline" size={26} color="#FF9800" />
                    </View>
                    <Text style={styles.cardTitleDark}>Support</Text>
                    <Text style={styles.tinyText}>help center</Text>
                </BentoCard>
            </View>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuIcon: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  greetingBox: {
    flex: 1,
    marginLeft: 16,
  },
  greetingText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  profileAvatar: {
    width: 44,
    height: 44,
    backgroundColor: '#7b68ee',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#7b68ee",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  searchButton: {
    width: 32,
    height: 32,
    backgroundColor: '#7b68ee',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoGrid: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  cardContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  touchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  
  // Hero Card Styles
  heroCard: {
    backgroundColor: '#7b68ee',
    flex: 1.5, // Takes up more space
    height: 180,
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },

  // Tall Card Styles
  tallCard: {
    flex: 1,
    height: 180,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tallCardContent: {
    alignItems: 'center',
    marginBottom: 10,
  },

  // Wide Card Styles
  wideCard: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  mapBackground: {
    position: 'absolute',
    right: -20,
    top: -20,
    opacity: 0.5,
  },
  wideCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  // Square Card Styles
  squareCard: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
  },
  tinyText: {
    fontSize: 12,
    color: '#999',
  },

  // General Shared Styles
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitleDark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  cardSubtitleDark: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
});
