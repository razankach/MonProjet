import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Sidebar from '../components/Sidebar';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  Service: undefined;
};

export default function Index() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.mainContainer}>
      <Sidebar />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header Circle */}
        <View style={styles.bannerRow}>
            <Text style={styles.title}>Hello Droply!</Text>
            <View style={styles.blackCircle} />
        </View>

        {/* Boxes */}
        <View style={styles.boxRow}>
            <TouchableOpacity 
              style={styles.bigBox}
              onPress={() => navigation.navigate('Dashboard')} // ✅ This should work now
            >
              <Text style={styles.boxText}>DASHBOARD</Text>
            </TouchableOpacity>

            <View style={styles.smallColumn}>
              <TouchableOpacity style={styles.smallBoxPurple}>
                <Text style={styles.boxText}>SEND A PACKAGE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallBoxPink}>
                <Text style={styles.boxText}>DELIVER A PACKAGE</Text>
              </TouchableOpacity>
            </View>
        </View>

        {/* Essential Functions */}
        <Text style={styles.sectionTitle}>services</Text>

        <View style={styles.functionList}>
          {["DROPLY MAP", "Track Package", "Droply promotions"].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.functionItem}
            >
              <View style={styles.functionCircle} />
              <Text>{item} </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ... keep your existing styles ...
const styles = StyleSheet.create({

  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },

  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#fff',
  },

  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  blackCircle: {
    width: 50,
    height: 50,
    backgroundColor: 'black',
    borderRadius: 25,
  },

  welcome: {
    fontSize: 26,
    fontWeight: '400',
    marginTop: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },

  boxRow: {
    flexDirection: 'row',
    marginVertical: 20,
  },

  bigBox: {
    width: '55%',
    height: 250,
    backgroundColor: '#e5d9f2',
    borderRadius: 20,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallColumn: {
    width: '40%',
    justifyContent: 'space-between',
  },

  smallBoxPurple: {
    height: 110,
    backgroundColor: '#c9a7e8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallBoxPink: {
    height: 110,
    backgroundColor: '#d992a8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 10,
  },

  functionList: {
    marginTop: 15,
  },

  functionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8eefe',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },

  functionCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'black',
    borderRadius: 20,
    marginRight: 15,
  },

  functionBar: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },

  boxText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
});
