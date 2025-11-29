import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = new Animated.Value(isOpen ? 0 : -250);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    Animated.timing(slideAnim, {
      toValue: !isOpen ? 0 : -250,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const menuItems = [
    { id: 1, label: 'Home', icon: '🏠' },
    { id: 2, label: 'Packages', icon: '📦' },
    { id: 3, label: 'Deliveries', icon: '🚚' },
    { id: 4, label: 'Reviews', icon: '⭐' },
    { id: 5, label: 'Notifications', icon: '🔔' },
    { id: 6, label: 'Profile', icon: '👤' },
    { id: 7, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <Text style={styles.sidebarTitle}>Menu</Text>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Toggle Button */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleSidebar}>
        <Text style={styles.toggleIcon}>{isOpen ? '✕' : '☰'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#2c3e50',
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#34495e',
    borderRadius: 10,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  toggleButton: {
    width: 50,
    height: 50,
    backgroundColor: '#e89ea0',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 101,
  },
  toggleIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});
