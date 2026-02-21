import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../../config";

const IMG_URL = "https://image.tmdb.org/t/p/w500";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

interface CategoriesData {
  masRecientes: Movie[];
  masBuscadas: Movie[];
  mejoresReviews: Movie[];
  comedia: Movie[];
  drama: Movie[];
}

export default function PeliculasScreen() {
  const router = useRouter();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [moviesData, setMoviesData] = useState<CategoriesData>({
    masRecientes: [],
    masBuscadas: [],
    mejoresReviews: [],
    comedia: [],
    drama: [],
  });

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const fetchAllCategories = async () => {
    setLoading(true);
    try {
      const [popular, upcoming, topRated, comedy, drama] = await Promise.all([
        fetch(`${API_URL}/movies/popular`).then((r) => r.json()),
        fetch(`${API_URL}/movies/upcoming`).then((r) => r.json()),
        fetch(`${API_URL}/movies/toprated`).then((r) => r.json()),
        fetch(`${API_URL}/movies/genre/comedy`).then((r) => r.json()),
        fetch(`${API_URL}/movies/genre/drama`).then((r) => r.json()),
      ]);

      setMoviesData({
        masRecientes: popular.results || [],
        masBuscadas: upcoming.results || [],
        mejoresReviews: topRated.results || [],
        comedia: comedy.results || [],
        drama: drama.results || [],
      });
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { key: "masRecientes", label: "Más recientes" },
    { key: "masBuscadas", label: "Más buscadas" },
    { key: "mejoresReviews", label: "Mejores Reviews" },
    { key: "comedia", label: "Comedia" },
    { key: "drama", label: "Drama" },
  ];

  const getFilteredMovies = () => {
    if (!selectedFilter) return null;
    return moviesData[selectedFilter as keyof typeof moviesData];
  };

  const handleMoviePress = (id: number) => {
    router.push(`/movie/${id}`);
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => handleMoviePress(item.id)}
    >
      {item.poster_path ? (
        <Image
          source={{ uri: IMG_URL + item.poster_path }}
          style={styles.moviePoster}
        />
      ) : (
        <View style={[styles.moviePoster, styles.placeholderPoster]} />
      )}
      <Text style={styles.movieTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderGridMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.gridMovieItem}
      onPress={() => handleMoviePress(item.id)}
    >
      {item.poster_path ? (
        <Image
          source={{ uri: IMG_URL + item.poster_path }}
          style={styles.gridMoviePoster}
        />
      ) : (
        <View style={[styles.gridMoviePoster, styles.placeholderPoster]} />
      )}
    </TouchableOpacity>
  );

  const renderCategory = (title: string, movies: Movie[]) => (
    <View style={styles.categoryContainer} key={title}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <FlatList
        data={movies}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moviesList}
      />
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filtrar por:</Text>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.filterOption}
              onPress={() => {
                setSelectedFilter(option.key);
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.filterOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.clearFilterOption}
            onPress={() => {
              setSelectedFilter(null);
              setFilterModalVisible(false);
            }}
          >
            <Text style={styles.clearFilterText}>Ver todas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const filteredMovies = getFilteredMovies();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>Películas</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={24} color="#F2A8A8" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F2A8A8" />
            <Text style={styles.loadingText}>Cargando películas...</Text>
          </View>
        ) : filteredMovies ? (
          <View style={styles.gridContainer}>
            <Text style={styles.filterTitle}>
              {filterOptions.find((f) => f.key === selectedFilter)?.label}
            </Text>
            <FlatList
              data={filteredMovies}
              renderItem={renderGridMovieItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridMoviesList}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {renderCategory("Más recientes:", moviesData.masRecientes)}
            {renderCategory("Más buscadas:", moviesData.masBuscadas)}
            {renderCategory("Mejores Reviews:", moviesData.mejoresReviews)}
            {renderCategory("Comedia:", moviesData.comedia)}
            {renderCategory("Drama:", moviesData.drama)}
          </ScrollView>
        )}
      </View>
      {renderFilterModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B1935",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoriesContainer: {
    paddingBottom: 100,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F2A8A8",
    textAlign: "center",
    flex: 1,
  },
  filterButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#DDD",
    marginTop: 10,
    fontSize: 14,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 15,
    marginLeft: 5,
  },
  moviesList: {
    paddingLeft: 5,
  },
  movieItem: {
    marginRight: 15,
    width: 120,
  },
  moviePoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderPoster: {
    backgroundColor: "#2A273F",
  },
  movieTitle: {
    fontSize: 14,
    color: "#B0B0B0",
    textAlign: "center",
    fontWeight: "500",
  },
  gridContainer: {
    flex: 1,
  },
  filterTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#F2A8A8",
    marginBottom: 20,
    textAlign: "center",
  },
  gridMoviesList: {
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  gridMovieItem: {
    width: "32%",
    aspectRatio: 2 / 3,
  },
  gridMoviePoster: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1A1833",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F2A8A8",
    marginBottom: 20,
    textAlign: "center",
  },
  filterOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "rgba(242,168,168,0.1)",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
  clearFilterOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: "rgba(176,176,176,0.2)",
  },
  clearFilterText: {
    fontSize: 16,
    color: "#B0B0B0",
    textAlign: "center",
  },
});
