import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
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

  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Image source={movie.poster} style={styles.posterLarge} />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.year}</Text>
          <Text style={styles.summary}>{movie.summary}</Text>
        </View>
      </View>

      <View style={styles.whereToWatchRow}>
        <Text style={styles.whereToWatchLabel}>Dónde ver:</Text>
        <View style={styles.iconRow}>
          <Image source={Images.hbo} style={styles.platformIcon} />
          <Image source={Images.netflix} style={styles.platformIcon} />
          <Image source={Images.amazon} style={styles.platformIcon} />
        </View>
      </View>

      <Text style={styles.subtitle}>Cast</Text>
      <View style={styles.castRow}>
        {cast.map((actor, idx) => (
          <Image key={idx} source={actor} style={styles.castPhoto} />
        ))}
      </View>

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
  container: { 
    flexGrow: 1, 
    alignItems: "center", 
    backgroundColor: "#1B1935", 
    padding: 20,
    marginTop: 80,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 18,
    gap: 18,
  },
  posterLarge: {
    width: 170,
    height: 250,
    borderRadius: 16,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingLeft: 8,
  },
  title: { 
    color: "#FFF", 
    fontSize: 27, 
    fontWeight: "600", 
    marginBottom: 4, 
    textAlign: "left",
  },
  year: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "300",
    marginBottom: 8,
    textAlign: "left",
  },
  summary: {
    color: "#CCC",
    fontSize: 13,
    lineHeight: 17,
    marginBottom: 4,
    textAlign: "left",
  },
  subtitle: { 
    color: "#F2A8A8", 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 8, 
    textAlign: "left",
    alignSelf: "flex-start",
  },
  castRow: { 
    flexDirection: "row", 
    justifyContent: "flex-start",
    alignItems: "center", 
    marginBottom: 24, 
    gap: 16,
    width: "100%",
  },
  castPhoto: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
  },
  reviewsSection: { marginVertical: 20, width: "100%" },
  sectionTitle: { color: "#eeececff", fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  reviewCard: { flexDirection: "row", backgroundColor: "#2A273F", borderRadius: 10, padding: 12, marginBottom: 12, alignItems: "flex-start" },
  userAvatarLarge: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  reviewContent: { flex: 1, marginRight: 10 },
  movieTitleReview: { color: "#FFF", fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  reviewBy: { fontSize: 12, marginBottom: 4 },
  reviewByGray: { color: "#AAA" },
  reviewByUser: { color: "#F2A8A8", fontWeight: "bold" },
  stars: { color: "#d20404ff", fontSize: 14, marginBottom: 4 },
  comment: { color: "#DDD", fontSize: 14 },
  whereToWatchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
    alignSelf: "flex-start",
  },
  whereToWatchLabel: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  platformIcon: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: "#222", 
    marginRight: 4, 
    borderWidth: 1, 
    borderColor: "#444" 
  },
});
