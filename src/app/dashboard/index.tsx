import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Dashboard() {
  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoBox}>
          <Text style={styles.logoTitle}>Droply</Text>
          <Text style={styles.logoSub}>DISCOVER QUALITY, DELIVERED FAST</Text>
        </View>

        <View style={styles.profileCircle} />
      </View>

      {/* STATS BIG CARD */}
      <View style={styles.statsCard}>

        <View style={styles.circleBig}>
          <Text style={styles.circleText}>Total deliveries</Text>
        </View>

        <View style={styles.circleMedium}>
          <Text style={styles.circleText}>Pending tasks</Text>
        </View>

        <View style={styles.circleSmall}>
          <Text style={styles.circleText}>Rating</Text>
        </View>

      </View>

      {/* MY DELIVERY LIST */}
      <Text style={styles.sectionTitle}>My delivery</Text>

      <View style={styles.listContainer}>
        <DeliveryItem code="k5695895fg" />
        <DeliveryItem code="dd28365fk" />
        <DeliveryItem code="fg7566457f" />
      </View>

    </ScrollView>
  );
}

/* COMPONENT: Delivery List Row */
type DeliveryItemProps = {
  code: string;
};

const DeliveryItem: React.FC<DeliveryItemProps> = ({ code }) => (
  <View style={styles.deliveryRow}>
    <View style={styles.dot} />
    <Text style={styles.deliveryCode}>{code}</Text>

    <TouchableOpacity style={styles.detailsBtn}>
      <Text style={styles.detailsText}>details</Text>
    </TouchableOpacity>
  </View>
);

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoBox: {
    flexDirection: "column",
  },

  logoTitle: {
    fontSize: 32,
    fontWeight: "700",
  },

  logoSub: {
    fontSize: 12,
    letterSpacing: 0.5,
    opacity: 0.7,
  },

  profileCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "black",
  },

  backButton: {
    marginRight: 10,
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  /* STATS CARD */
  statsCard: {
    marginTop: 25,
    backgroundColor: "#efe7f2",
    borderRadius: 25,
    padding: 25,
    height: 250,
  },

  circleBig: {
    position: "absolute",
    top: 20,
    left: 15,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
  },

  circleMedium: {
    position: "absolute",
    top: 30,
    right: 25,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },

  circleSmall: {
    position: "absolute",
    bottom: 20,
    left: 100,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
  },

  circleText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    top: "40%",
    fontWeight: "600",
  },

  /* MY DELIVERY */
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 20,
  },

  listContainer: {
    gap: 15,
  },

  deliveryRow: {
    backgroundColor: "#f7e9ff",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: "black",
    marginRight: 15,
  },

  deliveryCode: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },

  detailsBtn: {
    backgroundColor: "#e3d4e8",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
  },

  detailsText: {
    fontWeight: "600",
    opacity: 0.8,
  },
});

