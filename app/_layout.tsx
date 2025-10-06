import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { RootSiblingParent } from "react-native-root-siblings"; // 👈 IMPORTANTE
import { Images } from "../assets/images";
import Header from "../components/Header";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      try {
        const imageAssets = Object.values(Images).map(img =>
          Asset.fromModule(img).downloadAsync()
        );
        await Promise.all(imageAssets);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    loadAssets();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F2A8A8" />
      </View>
    );
  }

  return (
    <RootSiblingParent> {/* ENVUELVE TODO */}
      <View style={styles.container}>
        <Header />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#1B1935" },
          }}
        />
      </View>
    </RootSiblingParent>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B1935" },
  loader: {
    flex: 1,
    backgroundColor: "#1B1935",
    justifyContent: "center",
    alignItems: "center",
  },
});
