import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Images } from '../../assets/images';
import { API_ORIGIN, API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

interface Movie {
  id: string;
  title: string;
  poster_path: string;
  rating?: number;
  release_date?: string;
}

interface UserProfile {
  favoriteMovies: Movie[];
  recentlyWatched: Movie[];
  recentReviews: any[];
  stats: {
    totalMovies: number;
    moviesThisYear: number;
    lists: number;
    reviews: number;
  };
}

const ProfileScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const fetchReviewedMovies = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getToken();

      // Favoritos
      const favoritesRes = await fetch(`${API_URL}/favorites?userId=${user.id}`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const favData = await favoritesRes.json();
      const favorites: Movie[] = Array.isArray(favData) ? favData.map((fav: any) => ({
        id: fav.movieId,
        title: fav.title,
        poster_path: fav.posterPath,
        release_date: fav.releaseDate
      })) : [];

      // Reseñas del usuario
      const reviewsRes = await fetch(`${API_URL}/reviews/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reviewsData = reviewsRes.ok ? await reviewsRes.json() : { reviews: [] };
      const reviews: any[] = reviewsData.reviews || [];

      // Detalles de las películas reseñadas
      const reviewedMoviesPromises = reviews.map(async (review) => {
        try {
          const movieRes = await fetch(`${API_URL}/movies/${review.movieId}`);
          if (!movieRes.ok) return null;
          const movieData = await movieRes.json();
          return {
            id: review.movieId,
            title: movieData.title,
            poster_path: movieData.poster_path,
            rating: review.rating,
            release_date: movieData.release_date
          } as Movie;
        } catch (err) {
          console.error(`Error fetching movie ${review.movieId}:`, err);
          return null;
        }
      });

      const reviewedMovies = (await Promise.all(reviewedMoviesPromises)).filter(Boolean) as Movie[];

      // Listas del usuario
      const listsRes = await fetch(`${API_URL}/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listsData = listsRes.ok ? await listsRes.json() : [];
      const listsCount = Array.isArray(listsData) ? listsData.length : 0;

      // Estadísticas
      const stats = {
        totalMovies: favorites.length,
        moviesThisYear: 0,
        lists: listsCount,
        reviews: reviews.length,
      };

      setProfileData({
        favoriteMovies: favorites,
        recentlyWatched: reviewedMovies,
        recentReviews: reviews.slice(0, 3),
        stats
      });
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setProfileData({
        favoriteMovies: [],
        recentlyWatched: [],
        recentReviews: [],
        stats: { totalMovies: 0, moviesThisYear: 0, lists: 0, reviews: 0 }
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReviewedMovies();
  }, [user, fetchReviewedMovies]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle-outline" size={100} color="#F2A8A8" />
          <Text style={styles.loginTitle}>Perfil</Text>
          <Text style={styles.loginSubtitle}>Inicia sesión para ver y editar tu perfil</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.loginPrompt, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#F2A8A8" />
          <Text style={[styles.loginSubtitle, { marginTop: 20 }]}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<Ionicons key={i} name="star" size={14} color="#ff6b6b" />);
      else if (i === fullStars && hasHalfStar) stars.push(<Ionicons key={i} name="star-half" size={14} color="#ff6b6b" />);
      else stars.push(<Ionicons key={i} name="star-outline" size={14} color="#ff6b6b" />);
    }
    return stars;
  };



const avatarUri = user?.profileImage?.url
  ? user.profileImage.url.startsWith("http")
    ? user.profileImage.url
    : `${API_ORIGIN}${user.profileImage.url}`
  : user?.avatarUrl || null;
  const renderMovieScroll = (movies: Movie[], showRating = false) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieScrollContainer}>
      {movies.length === 0 ? (
        <Text style={styles.emptyText}>No hay películas para mostrar</Text>
      ) : (
        movies.map((movie) => (
          <TouchableOpacity key={movie.id} style={styles.movieScrollItem} onPress={() => router.push(`/movie/${movie.id}`)}>
            <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} style={styles.movieScrollPoster} />
            {showRating && movie.rating && (
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>{renderStars(movie.rating)}</View>
                <Text style={styles.readReview}>Leer Reseña ›</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image source={Images.header} style={styles.backgroundImage} resizeMode="cover" />
          <View style={styles.overlay} />
          <View style={styles.profileInfo}>
            <Image source={avatarUri ? { uri: avatarUri } : Images.profilePlaceholder} style={styles.profileImage} />
            <Text style={styles.nameText}>{user.name || 'Usuario'}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData?.stats.totalMovies || 0}</Text>
            <Text style={styles.statLabel}>Películas Totales</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData?.stats.lists || 0}</Text>
            <Text style={styles.statLabel}>Listas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData?.stats.reviews || 0}</Text>
            <Text style={styles.statLabel}>Reseñas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Películas Favoritas de {user.name || 'Usuario'}</Text>
          {renderMovieScroll(profileData?.favoriteMovies || [])}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Películas Reseñadas por {user.name || 'Usuario'}</Text>
          {renderMovieScroll(profileData?.recentlyWatched || [], true)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scrollView: { flex: 1 },
  profileHeader: { height: 200, position: 'relative' },
  backgroundImage: { width: '100%', height: '100%', position: 'absolute' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26, 26, 46, 0.7)' },
  profileInfo: { position: 'absolute', bottom: 20, left: 20, right: 20, alignItems: 'center' },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  nameText: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: '#16213e' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 3 },
  statLabel: { fontSize: 11, color: '#8b94a8' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 15 },
  movieScrollContainer: { paddingRight: 20 },
  movieScrollItem: { width: 120, marginRight: 12 },
  movieScrollPoster: { width: 120, height: 180, borderRadius: 8 },
  ratingContainer: { marginTop: 5 },
  stars: { flexDirection: 'row', marginBottom: 2 },
  readReview: { color: '#8b94a8', fontSize: 11 },
  emptyText: { color: '#8b94a8', fontSize: 14, textAlign: 'center', marginVertical: 20 },
  loginPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  loginTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 20, marginBottom: 10 },
  loginSubtitle: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 30 },
  loginButton: { backgroundColor: '#F2A8A8', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25 },
  loginButtonText: { color: '#1B1935', fontSize: 16, fontWeight: 'bold' },
});

export default ProfileScreen;