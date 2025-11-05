import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Images } from "../../assets/images";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = "http://172.29.135.101:3000/api/movies";
const REVIEWS_BASE_URL = "http://172.29.135.101:3000/api/reviews";
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
          style={[
            styles.ratingBar,
            { height: bar.height },
            bar.filled ? styles.ratingBarFilled : styles.ratingBarEmpty,
          ]}
        />
      ))}
    </View>
  );
}

function StarSelector({ rating, onRatingChange }: { rating: number; onRatingChange: (r: number) => void }) {
  return (
    <View style={styles.starSelector}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRatingChange(star)}>
          <Text style={[styles.selectableStar, { color: star <= rating ? "#d20404" : "#666" }]}>
            {"★"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function MovieDetails() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (movieId) {
      fetchMovieData(movieId);
      fetchReviews(movieId);
    }
  }, [movieId]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const fetchMovieData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const [detailsRes, castRes, similarRes, providersRes, videosRes] = await Promise.all([
        fetch(`${BASE_URL}/${id}`),
        fetch(`${BASE_URL}/${id}/credits`),
        fetch(`${BASE_URL}/${id}/similar`),
        fetch(`${BASE_URL}/${id}/watch/providers`),
        fetch(`${BASE_URL}/${id}/videos`),
      ]);

      if (!detailsRes.ok) throw new Error(`Details: ${detailsRes.status}`);
      if (!castRes.ok) throw new Error(`Cast: ${castRes.status}`);
      if (!similarRes.ok) throw new Error(`Similar: ${similarRes.status}`);
      if (!providersRes.ok) throw new Error(`Providers: ${providersRes.status}`);
      if (!videosRes.ok) throw new Error(`Videos: ${videosRes.status}`);

      const detailsData = await detailsRes.json();
      const castData = await castRes.json();
      const similarData = await similarRes.json();
      const providersData = await providersRes.json();
      const videosData = await videosRes.json();

      setMovie(detailsData);
      setCast(castData.cast?.slice(0, 5) || []);
      setSimilar(similarData.results?.slice(0, 10) || []);

      const flatrateProviders = providersData.results?.AR?.flatrate || [];
      setProviders(flatrateProviders);

      const trailer = videosData.results?.find(
        (v: any) => v.type === "Trailer" && v.site === "YouTube"
      );
      setTrailerKey(trailer?.key || null);

      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Error fetching movie data:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const fetchReviews = async (id: string) => {
    try {
      const res = await fetch(`${REVIEWS_BASE_URL}?movieId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("❌ Error fetching reviews:", error);
    }
  };

      const submitReview = async () => {
    if (!user) {
      Alert.alert("Error", "Debes estar logueado para escribir una reseña");
      return;
    }

    if (userRating === 0) {
      Alert.alert("Error", "Selecciona una calificación");
      return;
    }

    if (userComment.trim().length === 0) {
      Alert.alert("Error", "Escribe un comentario");
      return;
    }

    setSubmittingReview(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${REVIEWS_BASE_URL}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          movieId: Number(movieId),
          userId: user.id,
          rating: userRating,
          comment: userComment,
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        Alert.alert("Éxito", "Tu reseña se guardó correctamente");
        setUserRating(0);
        setUserComment("");
        fetchReviews(movieId!);
      } else {
        Alert.alert("Error", responseData.error || "No se pudo guardar la reseña");
      }
    } catch (error) {
      console.error("Error enviando reseña:", error);
      Alert.alert("Error", "Ocurrió un error al guardar la reseña");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F2A8A8" />
        <Text style={styles.loadingText}>Cargando película...</Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Error: {error || "Película no encontrada"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => movieId && fetchMovieData(movieId)}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avgRating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : "4.0";
  const trailerUrl = trailerKey
    ? `https://www.youtube.com/watch?v=${trailerKey}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title)} trailer`;

  const openTrailer = () => {
    Linking.openURL(trailerUrl);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <Image source={{ uri: IMG_URL + movie.poster_path }} style={styles.posterLarge} />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.release_date?.slice(0, 4)}</Text>
          <Text style={styles.summary}>{movie.overview || "Sin descripción disponible."}</Text>

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
                  return (
                    <Image key={p.provider_id} source={icon} style={styles.platformIcon} />
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </View>

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

      <Text style={styles.sectionTitle}>Elenco</Text>
      <View style={styles.castCircleRow}>
        {cast
          .filter((actor) => actor.profile_path)
          .map((actor) => (
            <View key={actor.id} style={styles.castCircle}>
              <Image
                source={{ uri: IMG_URL + actor.profile_path }}
                style={styles.castCirclePhoto}
              />
            </View>
          ))}
      </View>

      <View style={styles.divider} />

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
            <Image
              source={{ uri: IMG_URL + item.poster_path }}
              style={{ width: 120, height: 180, borderRadius: 12 }}
            />
            <Text
              style={{
                color: "#FFF",
                width: 120,
                textAlign: "center",
                marginTop: 4,
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Reseñas</Text>

      {user && (
        <View style={[styles.addReviewContainer, keyboardVisible && styles.addReviewContainerShift]}>
          <Text style={styles.addReviewTitle}>Tu reseña</Text>
          
          <StarSelector rating={userRating} onRatingChange={setUserRating} />

          <TextInput
            style={styles.commentInput}
            placeholder="Escribe tu comentario..."
            placeholderTextColor="#666"
            value={userComment}
            onChangeText={setUserComment}
            multiline
            maxLength={500}
          />

          <Text style={styles.charCount}>
            {userComment.length}/500
          </Text>

          <TouchableOpacity
            style={[styles.submitButton, submittingReview && styles.submitButtonDisabled]}
            onPress={submitReview}
            disabled={submittingReview}
          >
            {submittingReview ? (
              <ActivityIndicator size="small" color="#1B1935" />
            ) : (
              <Text style={styles.submitButtonText}>Publicar reseña</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!user && (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>Inicia sesión para escribir una reseña</Text>
        </View>
      )}

      <View style={styles.divider} />
      <View style={styles.reviewsSection}>
        {reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <Image 
                source={
                  review.user?.profileImage?.url
                    ? { uri: `http://172.29.135.101:3000${review.user.profileImage.url}` }
                    : Images.profilePlaceholder
                }
                style={styles.userAvatarLarge}
              />
              <View style={styles.reviewContent}>
                <Text style={styles.movieTitleReview}>{movie.title}</Text>
                <Text style={styles.reviewBy}>
                  <Text style={styles.reviewByGray}>Reseña de </Text>
                  <Text style={styles.reviewByUser}>{review.user?.name || "Usuario"}</Text>
                </Text>
                <StarRating rating={review.rating} />
                <Text style={styles.comment}>{review.comment}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>No hay reseñas aún. ¡Sé el primero!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "stretch",
    backgroundColor: "#1B1935",
    padding: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B1935",
  },
  loadingText: {
    color: "#DDD",
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B1935",
    padding: 20,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#F2A8A8",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#1B1935",
    fontWeight: "bold",
    fontSize: 14,
  },
  topRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 16,
    gap: 12,
  },
  posterLarge: {
    width: 120,
    height: 180,
    borderRadius: 12,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
  year: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "400",
    marginBottom: 6,
  },
  summary: {
    color: "#CCC",
    fontSize: 13,
    lineHeight: 17,
    marginBottom: 8,
  },
  trailerRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  trailerWrapper: {
    position: "relative",
  },
  trailerLarge: {
    width: 220,
    height: 140,
    borderRadius: 12,
  },
  trailerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -30,
    marginTop: -30,
  },
  ratingBlockRight: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  ratingNumber: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  ratingStarsText: {
    color: "#d20404",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 4,
  },
  ratingBarsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 48,
    marginBottom: 4,
  },
  ratingBar: {
    width: 8,
    marginHorizontal: 2,
    borderRadius: 2,
    alignSelf: "flex-end",
  },
  ratingBarFilled: {
    backgroundColor: "#d20404ff",
  },
  ratingBarEmpty: {
    backgroundColor: "#949191ff",
  },
  whereToWatchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  whereToWatchLabel: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  platformIcon: {
    width: 26,
    height: 26,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#444",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#18162c",
    opacity: 0.7,
    marginVertical: 8,
  },
  castCircleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
    width: "100%",
  },
  castCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  castCirclePhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sectionTitle: {
    color: "#eeececff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  addReviewContainer: {
    backgroundColor: "#2A273F",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  } as any,
  addReviewContainerShift: {
    marginBottom: 300,
  } as any,
  addReviewTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  starSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  selectableStar: {
    fontSize: 28,
  },
  commentInput: {
    backgroundColor: "#1B1935",
    borderRadius: 8,
    padding: 12,
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 8,
    maxHeight: 100,
  },
  charCount: {
    color: "#999",
    fontSize: 12,
    marginBottom: 12,
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: "#F2A8A8",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#1B1935",
    fontWeight: "bold",
    fontSize: 14,
  },
  loginPrompt: {
    backgroundColor: "#2A273F",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  loginPromptText: {
    color: "#999",
    fontSize: 14,
  },
  reviewsSection: {
    marginVertical: 20,
    width: "100%",
  },
  noReviewsText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  reviewCard: {
    flexDirection: "row",
    backgroundColor: "#2A273F",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  userAvatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  reviewContent: {
    flex: 1,
  },
  movieTitleReview: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  reviewBy: {
    fontSize: 12,
    marginBottom: 4,
  },
  reviewByGray: {
    color: "#AAA",
  },
  reviewByUser: {
    color: "#F2A8A8",
    fontWeight: "bold",
  },
  stars: {
    color: "#d20404ff",
    fontSize: 14,
    marginBottom: 4,
  },
  comment: {
    color: "#DDD",
    fontSize: 14,
  },
});