import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Images } from "../../assets/images";
import { API_ORIGIN, API_URL } from "../../config";

const IMG_URL = "https://image.tmdb.org/t/p/w500";

interface Review {
  id: number;
  userId: number;
  movieId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
    username: string;
    avatarUrl?: string;
    profileImage?: {
      url: string;
    };
  };
  movie?: {
    title: string;
    poster_path: string;
  };
}

export default function HomeScreen() {
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPopularMovies();
    fetchRecentReviews();
  }, []);

  const fetchRecentReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/reviews/recent`);
      
      if (res.ok) {
        const data = await res.json();
        setRecentReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
    }
  };

  const fetchPopularMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/movies/popular`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const text = await res.text();
      const data = JSON.parse(text);

      if (data.results && Array.isArray(data.results)) {
        setPopularMovies(data.results);
      } else {
        throw new Error("Invalid data format from API");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching popular movies:", errorMessage);
      setError(errorMessage);
      setPopularMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>¡Bienvenido a VEOVEO!</Text>
        <Text style={styles.welcomeSubText}>
          Descubrí las películas más populares y dónde verlas
        </Text>
      </View>

      <View style={styles.popularSection}>
        <Text style={styles.genreTitle}>Películas Populares Este Mes</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F2A8A8" />
            <Text style={styles.loadingText}>Cargando películas...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ Error: {error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchPopularMovies}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : popularMovies.length > 0 ? (
          <FlatList
            data={popularMovies}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <MovieCard
                poster={{ uri: IMG_URL + item.poster_path }}
                id={item.id.toString()}
                title={item.title}
              />
            )}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron películas</Text>
          </View>
        )}
      </View>

      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Reviews Más Recientes</Text>
        {recentReviews.length === 0 ? (
          <Text style={styles.emptyText}>No hay reseñas aún</Text>
        ) : (
          recentReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

type ReviewCardProps = {
  review: Review;
};

function ReviewCard({ review }: ReviewCardProps) {
  const router = useRouter();
  const avatarUri = review.user?.profileImage?.url
    ? `${API_ORIGIN}${review.user.profileImage.url}`
    : review.user?.avatarUrl || null;
  
  const posterUri = review.movie?.poster_path
    ? `${IMG_URL}${review.movie.poster_path}`
    : null;

  const handlePress = () => {
    router.push(`/movie/${review.movieId}`);
  };

  return (
    <Pressable style={styles.reviewCard} onPress={handlePress}>
      <Image 
        source={avatarUri ? { uri: avatarUri } : Images.profilePlaceholder} 
        style={styles.userAvatarLarge} 
      />
      <View style={styles.reviewContent}>
        <Text style={styles.movieTitleReview}>{review.movie?.title || 'Película'}</Text>
        <Text style={styles.reviewBy}>
          <Text style={styles.reviewByGray}>Reseña de </Text>
          <Text style={styles.reviewByUser}>{review.user?.name || 'Usuario'}</Text>
        </Text>
        <StarRating rating={review.rating} />
        <Text style={styles.comment} numberOfLines={3}>{review.comment}</Text>
      </View>
      {posterUri && (
        <Image source={{ uri: posterUri }} style={styles.moviePosterSmall} />
      )}
    </Pressable>
  );
}

type MovieCardProps = {
  poster: any;
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
      onPress={handlePress}
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
  container: {
    flex: 1,
    backgroundColor: "#1B1935",
    paddingHorizontal: 16,
  },
  welcomeSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  welcomeText: {
    color: "#F2A8A8",
    fontSize: 22,
    fontWeight: "bold",
  },
  welcomeSubText: {
    color: "#DDD",
    fontSize: 14,
    marginTop: 4,
  },
  popularSection: {
    marginVertical: 10,
  },
  genreTitle: {
    color: "#eeececff",
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#DDD",
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A1F1F",
    borderRadius: 10,
    padding: 16,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#F2A8A8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#1B1935",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#AAA",
    fontSize: 14,
  },
  moviePoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 12,
  },
  reviewsSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    color: "#eeececff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reviewCard: {
    flexDirection: "row",
    backgroundColor: "#2A273F",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  userAvatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  reviewContent: {
    flex: 1,
    marginRight: 10,
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
  moviePosterSmall: {
    width: 60,
    height: 80,
    borderRadius: 6,
  },
});