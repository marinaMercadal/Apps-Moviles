import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import useFavorites from "../hooks/useFavorites";

export default function MiLista() {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Lista ❤️</Text>

      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>
          Todavía no agregaste ninguna película a tu lista.
        </Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.poster} style={styles.poster} resizeMode="cover" />

              {/* Corazón para eliminar */}
              <TouchableOpacity
                style={styles.heartIcon}
                onPress={() => toggleFavorite(item)}
              >
                <Ionicons name="heart" size={22} color="#F2A8A8" />
              </TouchableOpacity>

              {/* Nombre de la película */}
              <Text style={styles.movieTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B1935",
    padding: 16,
  },
  title: {
    color: "#F2A8A8",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  emptyText: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 60,
    fontSize: 16,
    opacity: 0.8,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#2A273F",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  poster: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  heartIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    padding: 5,
  },
  movieTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
});
