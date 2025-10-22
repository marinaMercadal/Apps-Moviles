import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

type FavMovie = {
  id: string;
  title: string;
  posterUri?: string;
  releaseYear?: string;
};

// ---- Hook simple de favoritos por usuario (persistente en AsyncStorage)
function useFavorites(userId?: number | string) {
  const storageKey = useMemo(
    () => (userId ? `favs:${userId}` : undefined),
    [userId]
  );
  const [favs, setFavs] = useState<FavMovie[]>([]);

  useEffect(() => {
    (async () => {
      if (!storageKey) return setFavs([]);
      const raw = await AsyncStorage.getItem(storageKey);
      setFavs(raw ? JSON.parse(raw) : []);
    })();
  }, [storageKey]);

  const persist = async (next: FavMovie[]) => {
    if (!storageKey) return;
    setFavs(next);
    await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  };

  const isFavorite = (id: string) => favs.some((f) => f.id === id);

  const toggleFavorite = async (item: FavMovie) => {
    const exists = isFavorite(item.id);
    const next = exists
      ? favs.filter((f) => f.id !== item.id)
      : [item, ...favs];
    await persist(next);
  };

  return { favs, isFavorite, toggleFavorite };
}
// ---------------------------------------------------------------

const API_KEY = "fc59c56c3c4eee0a42ffda0c5cbcc701";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER = "https://via.placeholder.com/120x180?text=Sin+Imagen";

export default function BuscarScreen() {
  const router = useRouter();
  const { user } = useAuth(); // <-- si hay user, mostramos corazón y guardamos
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popular, setPopular] = useState<any[]>([]);

  const { isFavorite, toggleFavorite } = useFavorites(user?.id);

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  const fetchPopularMovies = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`
      );
      const data = await res.json();
      setPopular(data.results.slice(0, 12));
      setResults(data.results.slice(0, 12));
    } catch (error) {
      console.error("Error fetching popular movies:", error);
    }
  };

  const searchMovies = async (text: string) => {
    setQuery(text);
    if (!text) {
      setResults(popular);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(
          text
        )}&page=1`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const onToggleFav = async (item: any) => {
    if (!user) {
      Alert.alert(
        "Inicia sesión",
        "Tenés que estar logueado para agregar a tu lista.",
        [
          { text: "Cancelar" },
          { text: "Ir a Login", onPress: () => router.push("/login") },
        ]
      );
      return;
    }
    const posterUri = item.poster_path ? IMG_URL + item.poster_path : PLACEHOLDER;
    await toggleFavorite({
      id: String(item.id),
      title: item.title,
      posterUri,
      releaseYear: item.release_date?.slice(0, 4),
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Buscar Películas</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Escribí el nombre de la película..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={searchMovies}
          />

          {loading ? (
            <Text style={styles.infoText}>Buscando...</Text>
          ) : query.length > 0 && results.length === 0 ? (
            <Text style={styles.infoText}>No se encontraron películas</Text>
          ) : query.length === 0 && results.length === 0 ? (
            <Text style={styles.infoText}>Películas populares:</Text>
          ) : null}

          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
            renderItem={({ item }) => {
              const posterUri = item.poster_path ? IMG_URL + item.poster_path : PLACEHOLDER;
              const fav = isFavorite(String(item.id));

              return (
                <View style={styles.movieCard}>
                  <TouchableOpacity onPress={() => router.push(`/movie/${item.id}`)}>
                    <Image source={{ uri: posterUri }} style={styles.poster} />
                  </TouchableOpacity>

                  {/* ❤️ corazon SOLO si hay sesión */}
                  {user && (
                    <Pressable style={styles.heartIcon} onPress={() => onToggleFav(item)}>
                      <Ionicons
                        name={fav ? "heart" : "heart-outline"}
                        size={22}
                        color={fav ? "#F2A8A8" : "#ddd"}
                      />
                    </Pressable>
                  )}

                  <Text style={styles.movieTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.movieYear}>
                    {item.release_date?.slice(0, 4) || "N/A"}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B1935", padding: 16 },
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
  infoText: { color: "#ccc", textAlign: "center", marginBottom: 12, fontSize: 16 },
  movieCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#2A273F",
    padding: 8,
    borderRadius: 8,
    position: "relative",
  },
  poster: { width: 120, height: 180, borderRadius: 6, marginBottom: 6 },
  heartIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 16,
    padding: 4,
  },
  movieTitle: { color: "#fff", fontSize: 14, fontWeight: "600", textAlign: "center" },
  movieYear: { color: "#aaa", fontSize: 12, marginTop: 2 },
});
