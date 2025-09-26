import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function TabsLayout() {
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
          name="profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={26}
                color={color}
              />
            ),
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
