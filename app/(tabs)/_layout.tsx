import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";

export default function TabsLayout() {
  const { user } = useAuth();
  const router = useRouter();

  const handleProfilePress = () => {
    if (user) {
      router.push("/profile/profile");
    } else {
      router.push("/login");
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <Tabs
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
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={26} 
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "search" : "search-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="watchlist"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "bookmark" : "bookmark-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person-circle" : "person-circle-outline"}
                size={26}
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
  container: {
    flex: 1,
    backgroundColor: "#1B1935",
  },
});
