import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

const API_ORIGIN = "http://172.29.135.101:3000"; 

export default function TabsLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const [showTabs, setShowTabs] = useState(false);

  const full = (url?: string | null) =>
    url ? (url.startsWith("http") ? url : `${API_ORIGIN}${url}`) : undefined;


  const avatarUri = useMemo(
    () => full(user?.profileImage?.url ?? user?.avatarUrl ?? null),
    [user?.profileImage?.url, user?.avatarUrl]
  );

  useEffect(() => {
    setShowTabs(false);
    const timer = setTimeout(() => setShowTabs(true), 0);
    return () => clearTimeout(timer);
  }, [user]);

  const handleProfilePress = () => {
    if (user) router.push("/profile/profile");
    else router.push("/login");
  };

  const tabsKey = `${user ? "logged" : "guest"}-${user?.profileImageId || user?.avatarUrl || "na"}`;

  if (!showTabs) return null;

  return (
    <View style={styles.container}>
      <Tabs
        key={tabsKey}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#1A1833",
            borderTopWidth: 0.6,
            borderTopColor: "rgba(255,255,255,0.05)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -0.5 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 4,
            paddingTop: 6,
            paddingBottom: 15,
            height: 80,
          },
          tabBarActiveTintColor: "#F2A8A8",
          tabBarInactiveTintColor: "#B0B0B0",
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "search" : "search-outline"} size={26} color={color} />
            ),
          }}
        />


        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
            ),
          }}
        />
        {user && (
          <Tabs.Screen
            name="favorites"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "heart" : "heart-outline"} size={26} color={color} />
              ),
            }}
          />
        )}
        <Tabs.Screen
          name="login"
          options={{
            tabBarIcon: ({ color, focused }) =>
              user && avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    borderWidth: focused ? 2 : 1,
                    borderColor: focused ? "#F2A8A8" : "#555",
                  }}
                />
              ) : (
                <Ionicons
                  name={focused ? "person-circle" : "person-circle-outline"}
                  size={28}
                  color={color}
                />
              ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleProfilePress();
            },
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B1935" },
});
