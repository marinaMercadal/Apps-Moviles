import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import useFavorites from "../hooks/useFavorites"; // 💾 Hook para persistencia

const allMovies = [
  {
    id: "1",
    title: "Viernes De Locos",
    poster: require("../assets/images/viernesDeLocos.png"),
  },
  {
    id: "2",
    title: "Homo Argentum",
    poster: require("../assets/images/homoArgentum.png"),
  },
  {
    id: "3",
    title: "Lilo y Stitch",
    poster: require("../assets/images/liloYStitch.jpg"),
  },
];

export default function BuscarScreen() {
  const [query, setQuery] = useState("");
  const { favorites, toggleFavorite } = useFavorites(); // ❤️ Hook favorito

  const filteredMovies = allMovies.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar Películas</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Escribí el nombre de la película..."
        placeholderTextColor={styles.placeholder.color}
        value={query}
        onChangeText={setQuery}
      />

      {filteredMovies.length === 0 ? (
        <Text style={styles.noResults}>No se encontraron películas</Text>
      ) : (
        <FlatList
          data={filteredMovies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isFavorite = favorites.some((fav) => fav.id === item.id);

            return (
              <View style={styles.movieCard}>
                <Image source={item.poster} style={styles.poster} />
                <Text style={styles.movieTitle}>{item.title}</Text>

                <Pressable onPress={() => toggleFavorite(item)}>
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={26}
                    color={isFavorite ? "#F2A8A8" : "#ccc"}
                    style={styles.heartIcon}
                  />
                </Pressable>
              </View>
            );
          }}
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#F2A8A8",
    marginBottom: 16,
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: "#2A273F",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  placeholder: {
    color: "#aaa",
  },
  noResults: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  movieCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A273F",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 6,
    marginRight: 12,
  },
  movieTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  heartIcon: {
    marginLeft: 10,
  },
});
