import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const API_KEY = "fc59c56c3c4eee0a42ffda0c5cbcc701";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

export default function BuscarScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mostrar películas populares al entrar
  const [popular, setPopular] = useState<any[]>([]);

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  const fetchPopularMovies = async () => {
    try {
      const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`);
      const data = await res.json();
      setPopular(data.results.slice(0, 12));
      setResults(data.results.slice(0, 12)); // mostrar por default
    } catch (error) {
      console.error("Error fetching popular movies:", error);
    }
  };

  const searchMovies = async (text: string) => {
    setQuery(text);
    if (!text) {
      setResults(popular); // volver a mostrar populares si borro el input
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(text)}&page=1`);
      const data = await res.json();
      setResults(data.results);
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setLoading(false);
    }
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
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/movie/${item.id}`)}
                style={styles.movieCard}
              >
                <Image
                  source={{
                    uri: item.poster_path
                      ? IMG_URL + item.poster_path
                      : "https://via.placeholder.com/120x180?text=Sin+Imagen",
                  }}
                  style={styles.poster}
                />
                <Text style={styles.movieTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.movieYear}>
                  {item.release_date?.slice(0, 4) || "N/A"}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableWithoutFeedback>
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
    marginBottom: 16,
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
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 6,
    marginBottom: 6,
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
