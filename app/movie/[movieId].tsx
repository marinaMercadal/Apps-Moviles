import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Images } from "../../assets/images";

const popularMovies = [
  {
    id: "1",
    title: "Viernes De Locos",
    year: 2003,
    poster: Images.viernesDeLocos,
    summary: "Madre e hija intercambian cuerpos y viven divertidas situaciones. Comedia familiar con momentos emotivos.",
    reviews: [
      { userName: "Martina Ruiz", rating: 4, comment: "Peliculón, no paré de reírme en toda la película." },
      { userName: "Carolina Suarez", rating: 4, comment: "Muy buena película, ultra recomendable para ver con amigas y familia!" },
    ],
    trailerUrl: "https://www.youtube.com/watch?v=97ExuMBIE8Y"
  },
  {
    id: "2",
    title: "Homo Argentum",
    year: 2022,
    poster: Images.homoArgentum,
    summary: "Sátira sobre la vida argentina, con humor y crítica social. Ideal para fans del cine nacional.",
    reviews: [
      { userName: "Martina Ruiz", rating: 4, comment: "Peliculón, no paré de reírme en toda la película." },
    ],
    trailerUrl: "https://www.youtube.com/watch?v=_Tdk26fRQE0",
  },
  {
    id: "3",
    title: "Lilo y Stitch",
    year: 2002,
    poster: Images.liloYStitch,
    summary: "Lilo adopta a Stitch y juntos aprenden sobre familia y amistad. Aventura animada para todas las edades.",
    reviews: [
      { userName: "Marina Mercadal", rating: 5, comment: "Imperdible, la verdad que me hizo reconectar con la película vieja." },
    ],
    trailerUrl: "https://www.youtube.com/watch?v=9JIyINjMfcc"
  },
];

const cast = [
  Images.robpattinson,
  Images.robpattinson,
  Images.robpattinson,
  Images.robpattinson,
];

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
  const movie = popularMovies.find((m) => m.id === movieId);

  if (!movie) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Película no encontrada</Text>
      </View>
    );
  }

  const avgRating = (
    movie.reviews.reduce((acc, r) => acc + r.rating, 0) / movie.reviews.length
  ).toFixed(1);

  const videoId = movie.trailerUrl.split("v=")[1];
  const trailerThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const openTrailer = () => {
    Linking.openURL(movie.trailerUrl);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Fila superior: Poster + Info */}
      <View style={styles.topRow}>
        <Image source={movie.poster} style={styles.posterLarge} />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.year}</Text>
          <Text style={styles.summary}>{movie.summary}</Text>

          {/* Dónde ver */}
          <View style={styles.whereToWatchRow}>
            <Text style={styles.whereToWatchLabel}>Dónde ver:</Text>
            <View style={styles.iconRow}>
              <Image source={Images.hbo} style={styles.platformIcon} />
              <Image source={Images.netflix} style={styles.platformIcon} />
              <Image source={Images.amazon} style={styles.platformIcon} />
            </View>
          </View>
        </View>
      </View>

      {/* Fila inferior: Trailer + Rating */}
      <View style={styles.trailerRow}>
        <TouchableOpacity onPress={openTrailer} style={styles.trailerWrapper}>
          <Image source={{ uri: trailerThumbnail }} style={styles.trailerLarge} />
          
          {/* Overlay oscuro */}
          <View style={styles.trailerOverlay} />

          {/* Icono de Play */}
          <Ionicons
            name="play-circle"
            size={60}
            color="white"
            style={styles.playIcon}
          />
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
        {cast.map((actor, idx) => (
          <View key={idx} style={styles.castCircle}>
            <Image source={actor} style={styles.castCirclePhoto} />
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Reviews */}
      <Text style={styles.sectionTitle}>Reseñas</Text>
      <View style={styles.reviewsSection}>
        {movie.reviews.map((review, idx) => (
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

  // Fila superior
  topRow: { flexDirection: "row", width: "100%", marginBottom: 16, gap: 12 },
  posterLarge: { width: 120, height: 180, borderRadius: 12 },
  headerInfo: { flex: 1 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginBottom: 2 },
  year: { color: "#FFF", fontSize: 15, fontWeight: "400", marginBottom: 6 },
  summary: { color: "#CCC", fontSize: 13, lineHeight: 17, marginBottom: 8 },

  // Fila inferior
  trailerRow: { flexDirection: "row", width: "100%", gap: 12, marginBottom: 16 },
  trailerWrapper: { position: "relative" },
  trailerLarge: { width: 220, height: 140, borderRadius: 12 },
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
  ratingBlockRight: { justifyContent: "center", alignItems: "flex-start" },
  ratingNumber: { color: "#FFF", fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  ratingStarsText: { color: "#d20404", fontSize: 22, fontWeight: "bold", letterSpacing: 2, marginBottom: 4 },
  ratingBarsContainer: { flexDirection: "row", alignItems: "flex-end", height: 48, marginBottom: 4 },
  ratingBar: { width: 8, marginHorizontal: 2, borderRadius: 2, alignSelf: "flex-end" },
  ratingBarFilled: { backgroundColor: "#d20404ff" },
  ratingBarEmpty: { backgroundColor: "#949191ff" },

  // Dónde ver
  whereToWatchRow: { flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 8, gap: 8 },
  whereToWatchLabel: { color: "#FFF", fontSize: 13, fontWeight: "bold" },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  platformIcon: { width: 26, height: 26, borderRadius: 11, borderWidth: 1, borderColor: "#444" },

  divider: { width: "100%", height: 1, backgroundColor: "#18162c", opacity: 0.7, marginVertical: 8 },

  // Cast
  castCircleRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 16, width: "100%" },
  castCircle: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  castCirclePhoto: { width: 48, height: 48, borderRadius: 24 },

  // Reviews
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
