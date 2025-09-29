import { useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Images } from "../../assets/images"; // import del archivo central

const popularMovies = [
  { id: "1", title: "Viernes De Locos", poster: Images.viernesDeLocos },
  { id: "2", title: "Homo Argentum", poster: Images.homoArgentum },
  { id: "3", title: "Lilo y Stitch", poster: Images.liloYStitch },
];

const reviews = [
  {
    id: "1",
    userName: "Martina Ruiz",
    movieTitle: "Homo Argentum",
    userAvatar: Images.profilePlaceholder,
    moviePoster: Images.homoArgentum,
    rating: 4,
    comment: "Peliculon, no pare de reirme en toda la pelicula.",
  },
  {
    id: "2",
    userName: "Marina Mercadal",
    movieTitle: "Lilo y Stitch",
    userAvatar: Images.profilePlaceholder,
    moviePoster: Images.liloYStitch,
    rating: 5,
    comment: "Imperdible, la verdad que me hice reconectar con la pelicula vieja.",
  },
  {
    id: "3",
    userName: "Carolina Suarez",
    movieTitle: "Viernes De Locos",
    userAvatar: Images.profilePlaceholder,
    moviePoster: Images.viernesDeLocos,
    rating: 4,
    comment: "Muy buena película, ultra recomendable para ver con amigas y familia!",
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>¡Bienvenido a VEOVEO!</Text>
        <Text style={styles.welcomeSubText}>
          Descubrí las películas más populares y donde verlas
        </Text>
      </View>

      <View style={styles.popularSection}>
        <Text style={styles.genreTitle}>Películas Populares Este Mes</Text>
        <FlatList
          data={popularMovies}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MovieCard poster={item.poster} id={item.id} title={item.title} />
          )}
        />
      </View>

      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Reviews Más Recientes</Text>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <Image source={review.userAvatar} style={styles.userAvatarLarge} />

            <View style={styles.reviewContent}>
              <Text style={styles.movieTitleReview}>{review.movieTitle}</Text>
              <Text style={styles.reviewBy}>
                <Text style={styles.reviewByGray}>Reseña de </Text>
                <Text style={styles.reviewByUser}>{review.userName}</Text>
              </Text>

              <StarRating rating={review.rating} />

              <Text style={styles.comment}>{review.comment}</Text>
            </View>

            <Image source={review.moviePoster} style={styles.moviePosterSmall} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

type MovieCardProps = {
  poster: number;
  id: string;
  title: string;
};

function MovieCard({ poster, id, title }: MovieCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

const handlePress = () => {
  router.push({
    pathname: "/movie/[movieId]",
    params: { movieId: id },
  });
};


  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 1.1, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress} // aquí llamamos la navegación
    >
      <Animated.Image
        source={poster}
        style={[styles.moviePoster, { transform: [{ scale }] }]}
      />
    </Pressable>
  );
}

type StarRatingProps = {
  rating: number;
};

function StarRating({ rating }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, index) =>
    index < rating ? "★" : "☆"
  );
  return <Text style={styles.stars}>{stars.join(" ")}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B1935", paddingHorizontal: 16 },
  welcomeSection: { marginTop: 20, marginBottom: 20 },
  welcomeText: { color: "#F2A8A8", fontSize: 22, fontWeight: "bold" },
  welcomeSubText: { color: "#DDD", fontSize: 14, marginTop: 4 },
  popularSection: { height: 250, marginVertical: 10 },
  moviePoster: { width: 120, height: 180, borderRadius: 8, marginRight: 12 },
  genreTitle: { color: "#eeececff", fontSize: 18, marginBottom: 6, fontWeight: "bold" },
  reviewsSection: { marginVertical: 20 },
  sectionTitle: { color: "#eeececff", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  reviewCard: { flexDirection: "row", backgroundColor: "#2A273F", borderRadius: 10, padding: 12, marginBottom: 12, alignItems: "flex-start" },
  userAvatarLarge: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  reviewContent: { flex: 1, marginRight: 10 },
  movieTitleReview: { color: "#FFF", fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  reviewBy: { fontSize: 12, marginBottom: 4 },
  reviewByGray: { color: "#AAA" },
  reviewByUser: { color: "#F2A8A8", fontWeight: "bold" },
  stars: { color: "#d20404ff", fontSize: 14, marginBottom: 4 },
  comment: { color: "#DDD", fontSize: 14 },
  moviePosterSmall: { width: 60, height: 80, borderRadius: 6 },
});
