import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AuthLogo() {
  return (
    <View style={styles.container}>
      {/* Logo Image - ZoomIn animation */}
      <Animated.Image 
        entering={ZoomIn.duration(1000).springify()}
        source={require('../../public/Logo.jpg')} 
        style={styles.logo} 
        resizeMode="contain" 
      />
      
      {/* Vertical Separator - FadeIn animation */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(800)}
        style={styles.separator} 
      />

      {/* Text Container */}
      <View style={styles.textContainer}>
        <Animated.Text 
            entering={FadeInDown.delay(400).duration(800).springify()}
            style={styles.title}
        >
            Droply
        </Animated.Text>
        <Animated.Text 
            entering={FadeInDown.delay(600).duration(800)}
            style={styles.subtitle}
        >
            DISCOVER QUALITY, DELIVERED FAST
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 60, 
    height: 60,
  },
  separator: {
    width: 1,
    height: 50,
    backgroundColor: '#000',
    marginHorizontal: 15,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#000',
  },
  subtitle: {
    fontSize: 10,
    color: '#555',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
