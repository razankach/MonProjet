import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const { user } = useAuth();

  const toggleSidebar = () => {
    const toValue = isOpen ? -280 : 0;
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  const menuItems = [
    { id: 1, label: 'Home', icon: 'home' },
    { id: 2, label: 'Packages', icon: 'package' },
    { id: 3, label: 'Deliveries', icon: 'truck' },
    { id: 4, label: 'Reviews', icon: 'star' },
    { id: 5, label: 'Notifications', icon: 'bell' },
    { id: 6, label: 'Profile', icon: 'user' },
    { id: 7, label: 'Settings', icon: 'settings' },
  ];

  return (
    <View style={styles.container}>
      
      {isOpen && (
        <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={toggleSidebar} 
        />
      )}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        
        <View style={styles.header}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Text>
            </View>
            <View>
                <Text style={styles.greeting}>Hello,</Text>
                <Text style={styles.username}>{user?.name || 'Guest'}</Text>
            </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.menuContainer}>
            {menuItems.map((item) => (
            <TouchableOpacity 
                key={item.id} 
                style={styles.menuItem}
                onPress={() => {
                    if (item.label === 'Home') router.push('/home');
                    if (item.label === 'Profile') router.push('/profile');
                    toggleSidebar();
                }}
            >
                <Feather name={item.icon as any} size={20} color="#666" style={styles.menuIcon} />
                <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
            ))}
        </View>


      </Animated.View>

      {!isOpen && ( 
        <TouchableOpacity style={styles.toggleButton} onPress={toggleSidebar}>
            <Feather name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', 
    zIndex: 100,
  },
  overlay: {
    position: 'absolute',
    width: 1000, 
    height: 2000,
    backgroundColor: 'rgba(0,0,0,0.3)',
    top: 0,
    left: 0,
    zIndex: 90,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0, 
    height: 1000, 
    width: 280,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5d9f2', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6a1b9a', 
  },
  greeting: {
    fontSize: 14,
    color: '#888',
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 10,
  },
  menuIcon: {
    marginRight: 15,
    color: '#d992a8',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  toggleButton: {
    width: 50,
    height: 50,
    backgroundColor: '#d992a8', 
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 50, 
    left: 20,
    zIndex: 101,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
