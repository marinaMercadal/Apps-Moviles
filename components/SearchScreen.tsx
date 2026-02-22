import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";

const IMG_URL = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER = "https://via.placeholder.com/120x180?text=Sin+Imagen";

const GENRES = [
  { id: 28, name: "Acción" },
  { id: 12, name: "Aventura" },
  { id: 16, name: "Animación" },
  { id: 35, name: "Comedia" },
  { id: 80, name: "Crimen" },
  { id: 99, name: "Documental" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Familia" },
  { id: 14, name: "Fantasía" },
  { id: 36, name: "Historia" },
  { id: 27, name: "Terror" },
  { id: 10402, name: "Música" },
  { id: 9648, name: "Misterio" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Ciencia ficción" },
  { id: 53, name: "Suspenso" },
  { id: 10752, name: "Bélica" },
  { id: 37, name: "Western" },
];

export default function BuscarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popular, setPopular] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      searchMovies(query);
    } else {
      filterByGenre(selectedGenre);
    }
  }, [selectedGenre]);

  const fetchPopularMovies = async () => {
    try {
      const [res1, res2, res3] = await Promise.all([
        fetch(`${API_URL}/movies/popular?page=1`),
        fetch(`${API_URL}/movies/popular?page=2`),
        fetch(`${API_URL}/movies/popular?page=3`),
      ]);

      const [data1, data2, data3] = await Promise.all([
        res1.json(), res2.json(), res3.json(),
      ]);

      const allMovies = [
        ...(data1.results || []),
        ...(data2.results || []),
        ...(data3.results || []),
      ];

      const seen = new Set();
      const uniqueMovies = allMovies.filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      setPopular(uniqueMovies);
      setResults(uniqueMovies);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
    }
  };

  const filterByGenre = (genreId: number | null) => {
    if (!genreId) {
      setResults(popular);
      return;
    }
    const filtered = popular.filter((m: any) =>
      m.genre_ids?.includes(genreId)
    );
    setResults(filtered);
  };

  const searchMovies = async (text: string) => {
    setQuery(text);

    if (!text) {
      filterByGenre(selectedGenre);
      return;
    }

    setLoading(true);
    try {
      const url = `${API_URL}/search?query=${encodeURIComponent(text)}&page=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      let movies = data.results || [];

      const seen = new Set();
      movies = movies.filter((m: any) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      if (selectedGenre) {
        movies = movies.filter((m: any) =>
          m.genre_ids?.includes(selectedGenre)
        );
      }

      setResults(movies);
    } catch (error) {
      console.error("Error searching movies:", error instanceof Error ? error.message : error);
      setResults([]);
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

  const onSelectGenre = (genreId: number) => {
    const newGenre = selectedGenre === genreId ? null : genreId;
    setSelectedGenre(newGenre);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#1B1935" }} behavior="padding">
      <View style={styles.container}>
        <Text style={styles.title}>Buscar Películas</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Escribí el nombre de la película..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={searchMovies}
          onSubmitEditing={Keyboard.dismiss}
          returnKeyType="search"
        />

        {/* ✅ Chips de género con espacio y altura visible */}
        <View style={styles.genreWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreScrollContent}
          >
            <TouchableOpacity
              style={[styles.genreChip, selectedGenre === null && styles.genreChipActive]}
              onPress={() => setSelectedGenre(null)}
            >
              <Text style={[styles.genreChipText, selectedGenre === null && styles.genreChipTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>

            {GENRES.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                style={[styles.genreChip, selectedGenre === genre.id && styles.genreChipActive]}
                onPress={() => onSelectGenre(genre.id)}
              >
                <Text style={[styles.genreChipText, selectedGenre === genre.id && styles.genreChipTextActive]}>
                  {genre.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <Text style={styles.infoText}>Buscando...</Text>
        ) : query.length > 0 && results.length === 0 ? (
          <Text style={styles.infoText}>No se encontraron películas</Text>
        ) : results.length === 0 ? (
          <Text style={styles.infoText}>No hay películas para este género</Text>
        ) : null}

        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          renderItem={({ item }) => {
            const posterUri = item.poster_path
              ? IMG_URL + item.poster_path
              : PLACEHOLDER;
            const fav = isFavorite(String(item.id));

            return (
              <View style={styles.movieCard}>
                <TouchableOpacity onPress={() => router.push(`/movie/${item.id}`)}>
                  <Image source={{ uri: posterUri }} style={styles.poster} />
                </TouchableOpacity>

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
    </KeyboardAvoidingView>
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
    marginBottom: 12,
  },
  genreWrapper: {
    height: 50,
    marginBottom: 14,
  },
  genreScrollContent: {
    gap: 10,
    paddingHorizontal: 2,
    alignItems: "center",
  },
  genreChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#2A273F",
    borderWidth: 1,
    borderColor: "#3A3760",
  },
  genreChipActive: {
    backgroundColor: "#F2A8A8",
    borderColor: "#F2A8A8",
  },
  genreChipText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "600",
  },
  genreChipTextActive: {
    color: "#1B1935",
  },
  infoText: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 16,
  },
  movieCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#2A273F",
    padding: 8,
    borderRadius: 8,
    position: "relative",
    marginHorizontal: 6,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 6,
    marginBottom: 6,
  },
  heartIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 16,
    padding: 4,
  },
  movieTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  movieYear: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
});