import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Images } from "../../assets/images";

const API_KEY = "fc59c56c3c4eee0a42ffda0c5cbcc701";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

function StarRating({ rating }: { rating: number }) {
  return <Text style={styles.stars}>{"★".repeat(rating) + "☆".repeat(5 - rating)}</Text>;
}

function RatingBars({ value }: { value: number }) {
  const maxHeight = 48;
  const heights = [maxHeight * 0.3, maxHeight * 0.5, maxHeight * 0.7, maxHeight * 0.85, maxHeight];
  const bars = Array.from({ length: 5 }, (_, i) => ({
    filled: i < Math.round(value),
    height: heights[i],
  }));
  return (
    <View style={styles.ratingBarsContainer}>
      {bars.map((bar, idx) => (
        <View
          key={idx}
          style={[styles.ratingBar, { height: bar.height }, bar.filled ? styles.ratingBarFilled : styles.ratingBarEmpty]}
        />
      ))}
    </View>
  );
}

export default function MovieDetails() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Reseñas fijas
  const reviews = [
    { userName: "Martina Ruiz", rating: 4, comment: "Peliculón, no paré de reírme en toda la película." },
    { userName: "Carolina Suarez", rating: 4, comment: "Muy buena película, ultra recomendable para ver con amigas y familia!" },
    { userName: "Marina Mercadal", rating: 5, comment: "Imperdible, la verdad que me hizo reconectar con la película vieja." },
  ];

  useEffect(() => {
    if (movieId) {
      fetchMovieData(movieId);
    }
  }, [movieId]);

  const fetchMovieData = async (id: string) => {
    try {
      const [detailsRes, castRes, similarRes, providersRes, videosRes] = await Promise.all([
        fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`),
        fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=es-ES`),
        fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=es-ES`),
        fetch(`${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`),
        fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`),
      ]);

      const detailsData = await detailsRes.json();
      const castData = await castRes.json();
      const similarData = await similarRes.json();
      const providersData = await providersRes.json();
      const videosData = await videosRes.json();

      setMovie(detailsData);
      setCast(castData.cast.slice(0, 5));
      setSimilar(similarData.results.slice(0, 10));

      // Streaming providers (solo flatrate)
      const flatrateProviders = providersData.results?.AR?.flatrate || [];
      setProviders(flatrateProviders);

      // Trailer oficial
      const trailer = videosData.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
      setTrailerKey(trailer?.key || null);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching movie data:", error);
      setLoading(false);
    }
  };

  if (loading || !movie) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F2A8A8" />
      </View>
    );
  }

  const avgRating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : "4.0";
  const trailerUrl = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title)}+trailer`;

  const openTrailer = () => {
    Linking.openURL(trailerUrl);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Fila superior */}
      <View style={styles.topRow}>
        <Image source={{ uri: IMG_URL + movie.poster_path }} style={styles.posterLarge} />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.release_date?.slice(0, 4)}</Text>
          <Text style={styles.summary}>{movie.overview || "Sin descripción disponible."}</Text>

          {/* Streaming providers */}
          {providers.length > 0 && (
            <View style={styles.whereToWatchRow}>
              <Text style={styles.whereToWatchLabel}>Dónde ver:</Text>
              <View style={styles.iconRow}>
                {providers.map((p: any) => {
                  const icon = p.provider_name.toLowerCase().includes("netflix")
                    ? Images.netflix
                    : p.provider_name.toLowerCase().includes("hbo")
                    ? Images.hbo
                    : p.provider_name.toLowerCase().includes("prime")
                    ? Images.amazon
                    : null;
                  if (!icon) return null;
                  return <Image key={p.provider_id} source={icon} style={styles.platformIcon} />;
                })}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Trailer + Rating */}
      <View style={styles.trailerRow}>
        <TouchableOpacity onPress={openTrailer} style={styles.trailerWrapper}>
          <Image source={{ uri: IMG_URL + movie.poster_path }} style={styles.trailerLarge} />
          <View style={styles.trailerOverlay} />
          <Ionicons name="play-circle" size={60} color="white" style={styles.playIcon} />
        </TouchableOpacity>

        <View style={styles.ratingBlockRight}>
          <RatingBars value={Number(avgRating)} />
          <Text style={styles.ratingNumber}>{avgRating}</Text>
          <Text style={styles.ratingStarsText}>
            {"★".repeat(Math.round(Number(avgRating)))}
            {"☆".repeat(5 - Math.round(Number(avgRating)))}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Cast */}
      <Text style={styles.sectionTitle}>Elenco</Text>
      <View style={styles.castCircleRow}>
        {cast.filter(actor => actor.profile_path).map((actor) => (
          <View key={actor.id} style={styles.castCircle}>
            <Image source={{ uri: IMG_URL + actor.profile_path }} style={styles.castCirclePhoto} />
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Películas similares */}
      <Text style={styles.sectionTitle}>Películas similares</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={similar}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/movie/${item.id}`)}
            style={{ marginRight: 12 }}
          >
            <Image source={{ uri: IMG_URL + item.poster_path }} style={{ width: 120, height: 180, borderRadius: 12 }} />
            <Text style={{ color: "#FFF", width: 120, textAlign: "center", marginTop: 4 }} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.divider} />

      {/* Reviews */}
      <Text style={styles.sectionTitle}>Reseñas</Text>
      <View style={styles.reviewsSection}>
        {reviews.map((review, idx) => (
          <View key={idx} style={styles.reviewCard}>
            <Image source={Images.profilePlaceholder} style={styles.userAvatarLarge} />
            <View style={styles.reviewContent}>
              <Text style={styles.movieTitleReview}>{movie.title}</Text>
              <Text style={styles.reviewBy}>
                <Text style={styles.reviewByGray}>Reseña de </Text>
                <Text style={styles.reviewByUser}>{review.userName}</Text>
              </Text>
              <StarRating rating={review.rating} />
              <Text style={styles.comment}>{review.comment}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", backgroundColor: "#1B1935", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1B1935" },
  topRow: { flexDirection: "row", width: "100%", marginBottom: 16, gap: 12 },
  posterLarge: { width: 120, height: 180, borderRadius: 12 },
  headerInfo: { flex: 1 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginBottom: 2 },
  year: { color: "#FFF", fontSize: 15, fontWeight: "400", marginBottom: 6 },
  summary: { color: "#CCC", fontSize: 13, lineHeight: 17, marginBottom: 8 },
  trailerRow: { flexDirection: "row", width: "100%", gap: 12, marginBottom: 16 },
  trailerWrapper: { position: "relative" },
  trailerLarge: { width: 220, height: 140, borderRadius: 12 },
  trailerOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 12 },
  playIcon: { position: "absolute", top: "50%", left: "50%", marginLeft: -30, marginTop: -30 },
  ratingBlockRight: { justifyContent: "center", alignItems: "flex-start" },
  ratingNumber: { color: "#FFF", fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  ratingStarsText: { color: "#d20404", fontSize: 22, fontWeight: "bold", letterSpacing: 2, marginBottom: 4 },
  ratingBarsContainer: { flexDirection: "row", alignItems: "flex-end", height: 48, marginBottom: 4 },
  ratingBar: { width: 8, marginHorizontal: 2, borderRadius: 2, alignSelf: "flex-end" },
  ratingBarFilled: { backgroundColor: "#d20404ff" },
  ratingBarEmpty: { backgroundColor: "#949191ff" },
  whereToWatchRow: { flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 8, gap: 8 },
  whereToWatchLabel: { color: "#FFF", fontSize: 13, fontWeight: "bold" },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  platformIcon: { width: 26, height: 26, borderRadius: 11, borderWidth: 1, borderColor: "#444" },
  divider: { width: "100%", height: 1, backgroundColor: "#18162c", opacity: 0.7, marginVertical: 8 },
  castCircleRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 16, width: "100%" },
  castCircle: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  castCirclePhoto: { width: 48, height: 48, borderRadius: 24 },
  reviewsSection: { marginVertical: 20, width: "100%" },
  sectionTitle: { color: "#eeececff", fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  reviewCard: { flexDirection: "row", backgroundColor: "#2A273F", borderRadius: 10, padding: 12, marginBottom: 12 },
  userAvatarLarge: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  reviewContent: { flex: 1 },
  movieTitleReview: { color: "#FFF", fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  reviewBy: { fontSize: 12, marginBottom: 4 },
  reviewByGray: { color: "#AAA" },
  reviewByUser: { color: "#F2A8A8", fontWeight: "bold" },
  stars: { color: "#d20404ff", fontSize: 14, marginBottom: 4 },
  comment: { color: "#DDD", fontSize: 14 },
});
