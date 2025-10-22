import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function Header() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    if (!user) {
      Alert.alert(
        "Iniciar Sesión",
        "Debes iniciar sesión para acceder al menú",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar Sesión", onPress: () => router.push("/login") }
        ]
      );
      return;
    }
    setSidebarVisible(!sidebarVisible);
  };

  const navigateToProfile = () => {
    if (!user) {
      Alert.alert(
        "Iniciar Sesión",
        "Debes iniciar sesión para ver tu perfil",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar Sesión", onPress: () => router.push("/login") }
        ]
      );
      return;
    }
    router.push("/profile/profile");
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={toggleSidebar}>
          <View style={styles.hamburger}>
            <View style={[styles.line, { width: 24 }]} />
            <View style={[styles.line, { width: 18 }]} />
            <View style={[styles.line, { width: 12 }]} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={navigateToProfile}>
          <Image
            source={require("../assets/images/profile-placeholder.png")}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    paddingHorizontal: 16,
    paddingTop: 60,
    marginBottom: 20,
    shadowRadius: 4,
    elevation: 3,
  },
  hamburger: {
    justifyContent: "space-between",
    height: 20,
  },
  line: {
    height: 2,
    backgroundColor: "#B0B0B0",
    borderRadius: 1,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#555",
  },
});