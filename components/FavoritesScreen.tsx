import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";

export default function FavoritesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { favs: items, toggleFavorite, loading, refresh } = useFavorites();

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mis Me Gusta</Text>
        <Text style={styles.empty}>Inicia sesión para ver tus favoritos.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Me Gusta</Text>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#F2A8A8" />
        </View>
      ) : items.length === 0 ? (
        <Text style={styles.empty}>Aún no tenés favoritos.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity onPress={() => router.push(`/movie/${item.id}`)}>
                <Image
                  source={{ uri: item.posterUri || "https://via.placeholder.com/120x180?text=Sin+Imagen" }}
                  style={styles.poster}
                />
              </TouchableOpacity>
              <Pressable 
                style={styles.heartIcon} 
                onPress={() => toggleFavorite(item)}
              >
                <Ionicons name="heart" size={22} color="#F2A8A8" />
              </Pressable>
              <Text style={styles.titleMovie} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.year}>{item.releaseYear || "N/A"}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B1935", padding: 16 },
  title: { color: "#F2A8A8", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  empty: { color: "#ccc", textAlign: "center" },
  card: { flex: 1, alignItems: "center", backgroundColor: "#2A273F", padding: 8, borderRadius: 8, position: "relative" },
  poster: { width: 120, height: 180, borderRadius: 6, marginBottom: 6 },
  heartIcon: { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 16, padding: 4 },
  titleMovie: { color: "#fff", fontSize: 14, fontWeight: "600", textAlign: "center" },
  year: { color: "#aaa", fontSize: 12, marginTop: 2 },
});
