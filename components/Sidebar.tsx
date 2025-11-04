import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = 280;

// Usa el mismo origin que en Settings
const API_ORIGIN = "http://192.168.0.187:3000";

// Helper para armar URL absoluta
const full = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${API_ORIGIN}${url}`) : undefined;

export interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // URI del avatar actual (prioriza profileImage.url; fallback a avatarUrl)
  const avatarUri = useMemo(
    () => full(user?.profileImage?.url ?? user?.avatarUrl ?? null),
    [user?.profileImage?.url, user?.avatarUrl]
  );

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  const handleClose = () => onClose();

  const getActiveRoute = () => {
    if (pathname === "/") return "home";
    if (pathname === "/search") return "search";
    if (pathname === "/profile/profile") return "profile";
    if (pathname === "/favorites/favorites") return "likes";
    if (pathname === "/watchlist") return "watchlist";
    if (pathname === "/settings") return "settings";
    return "";
  };

  const menuItems = [
    { id: "home", title: "Inicio", icon: "home-outline" },
    { id: "films", title: "Películas", icon: "film-outline" },
    { id: "watchlist", title: "Ver más tarde", icon: "list-outline" },
    { id: "likes", title: "Me gusta", icon: "heart-outline" },
    { id: "settings", title: "Ajustes", icon: "settings-outline" },
  ];

  const handleItemPress = (id: string) => {
    if (id === "home") router.push("/");
    else if (id === "films") router.push("/sidebar/films");
    // else if (id === "watchlist") router.push("/watchlist");
    else if (id === "likes") router.push("../favorites");
    else if (id === "settings") router.push("../settings");
    handleClose();
  };

  const handleProfilePress = () => {
    router.push("/profile/profile");
    handleClose();
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.container}>
            {/* Perfil */}
            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.profileContainer}
                onPress={handleProfilePress}
              >
                <Image
                  source={
                    avatarUri
                      ? { uri: avatarUri }
                      : require("../assets/images/profile-placeholder.png")
                  }
                  style={[
                    styles.profileImage,
                    avatarUri
                      ? { borderWidth: 2, borderColor: "#F2A8A8" }
                      : null,
                  ]}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {user?.name || "Usuario"}
                  </Text>
                  <Text style={styles.profileHandle}>
                    @{user?.username || "usuario"}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.statsContainer}>
                <TouchableOpacity style={styles.statButton}>
                  <Text style={styles.statText}>0 Seguidores</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statButton}>
                  <Text style={styles.statText}>0 Siguiendo</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Menú */}
            <View style={styles.menuSection}>
              {menuItems.map((item) => {
                const active = getActiveRoute() === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, active && styles.activeMenuItem]}
                    onPress={() => handleItemPress(item.id)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={active ? "#1A1833" : "#B0B0B0"}
                    />
                    <Text
                      style={[
                        styles.menuText,
                        active && styles.activeMenuText,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Logout */}
            <View style={styles.logoutSection}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={24} color="#B0B0B0" />
                <Text style={styles.menuText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* Área para cerrar */}
        <TouchableOpacity
          style={styles.closeArea}
          onPress={handleClose}
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
};

export default Sidebar;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: "#1A1833",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  closeArea: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#3a3850",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#F2A8A8",
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 16,
    color: "#B0B0B0",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statButton: {
    borderWidth: 1,
    borderColor: "#F2A8A8",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    flex: 0.48,
  },
  statText: {
    color: "#F2A8A8",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  menuSection: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 25,
    marginBottom: 6,
  },
  activeMenuItem: {
    backgroundColor: "#F2A8A8",
  },
  menuText: {
    fontSize: 16,
    color: "#B0B0B0",
    marginLeft: 15,
    fontWeight: "500",
  },
  activeMenuText: {
    color: "#1A1833",
    fontWeight: "600",
  },
  logoutSection: {
    paddingBottom: 40,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 16,
  },
});
