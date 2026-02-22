import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { API_ORIGIN, API_URL } from '../../config';

interface Movie{
  id:string;
  title:string;
  poster_path:string;
  rating?:number;
  release_date?:string;
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

const ProfileScreen=()=>{
  const { user } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

    const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      const token = await getToken();
      
      const [favoritesRes, reviewsRes, listsRes] = await Promise.all([
        fetch(`${API_URL}/favorites`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/reviews/my-reviews`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/lists`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      
      let favorites: Movie[] = [];
      if (favoritesRes.ok) {
        const favData = await favoritesRes.json();
        favorites = (Array.isArray(favData) ? favData : []).map((fav: any) => ({
          id: fav.movieId,
          title: fav.title,
          poster_path: fav.posterPath,
          release_date: fav.releaseDate
        }));
      }

      let reviewedMovies: Movie[] = [];
      let reviews: any[] = [];
      if (reviewsRes.ok) {
        const reviewData = await reviewsRes.json();
        reviews = reviewData.reviews || [];
        
        const movieDetailsPromises = reviews.map(async (review: any) => {
          try {
            const tmdbRes = await fetch(
              `${API_URL}/movies/${review.movieId}`
            );
            if (tmdbRes.ok) {
              const movieData = await tmdbRes.json();
              return {
                id: review.movieId,
                title: movieData.title,
                poster_path: movieData.poster_path,
                rating: review.rating,
                release_date: movieData.release_date
              };
            }
          } catch (error) {
            console.error(`Error fetching movie ${review.movieId}:`, error);
          }
          return null;
        });
        
        const moviesData = await Promise.all(movieDetailsPromises);
        reviewedMovies = moviesData.filter((movie) => movie !== null) as Movie[];
      }

      let listsCount = 0;
      if (listsRes.ok) {
        const listsData = await listsRes.json();
        listsCount = Array.isArray(listsData) ? listsData.length : 0;
      }

      const stats = {
        totalMovies: favorites.length,
        moviesThisYear: 0,
        lists: listsCount,
        reviews: reviews.length
      };

      setProfileData({
        favoriteMovies: favorites,
        recentlyWatched: reviewedMovies,
        recentReviews: reviews.slice(0, 3),
        stats
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setProfileData({
        favoriteMovies: [],
        recentlyWatched: [],
        recentReviews: [],
        stats: { totalMovies: 0, moviesThisYear: 0, lists: 0, reviews: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle-outline" size={100} color="#F2A8A8" />
          <Text style={styles.loginTitle}>Perfil</Text>
          <Text style={styles.loginSubtitle}>
            Inicia sesión para ver y editar tu perfil
          </Text>
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
          <Text style={[styles.loginSubtitle, { marginTop: 20 }]}>
            Cargando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderStars=(rating:number)=>{
    const fullStars=Math.floor(rating);
    const hasHalfStar=rating%1!==0;
    const stars=[];

    for(let i=0;i<5;i++){
      if(i<fullStars){
        stars.push(
          <Ionicons key={i} name="star" size={14} color="#ff6b6b" />
        );
      }else if(i===fullStars&&hasHalfStar){
        stars.push(
          <Ionicons key={i} name="star-half" size={14} color="#ff6b6b" />
        );
      }else{
        stars.push(
          <Ionicons key={i} name="star-outline" size={14} color="#ff6b6b" />
        );
      }
    }
    return stars;
  };

  const full = (url?: string | null) =>
    url ? (url.startsWith("http") ? url : `${API_ORIGIN}${url}`) : undefined;

  const avatarUri = full(user?.profileImage?.url ?? user?.avatarUrl ?? null);

  const renderMovieScroll=(movies:Movie[],showRating:boolean=false)=>(
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.movieScrollContainer}
    >
      {movies.length === 0 ? (
        <Text style={styles.emptyText}>No hay películas para mostrar</Text>
      ) : (
        movies.map((movie)=>(
          <TouchableOpacity 
            key={movie.id} 
            style={styles.movieScrollItem}
            onPress={() => router.push(`/movie/${movie.id}`)}
          >
            <Image 
              source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} 
              style={styles.movieScrollPoster} 
            />
            {showRating&&movie.rating&&(
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {renderStars(movie.rating)}
                </View>
                <Text style={styles.readReview}>Leer Reseña ›</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  return(
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image 
            source={Images.header} 
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
          
          <View style={styles.profileInfo}>
            <Image 
              source={avatarUri ? { uri: avatarUri } : Images.profilePlaceholder}
              style={styles.profileImage}
            />
            
            <Text style={styles.nameText}>{user?.name || 'Usuario'}</Text>
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
            <Text style={styles.statNumber}>
              {profileData?.stats.reviews || 0}
            </Text>
            <Text style={styles.statLabel}>Reseñas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Películas Favoritas de {user?.name || 'Usuario'}</Text>
          {renderMovieScroll(profileData?.favoriteMovies || [])}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Películas Reseñadas por {user?.name || 'Usuario'}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver Todo</Text>
            </TouchableOpacity>
          </View>
          {renderMovieScroll(profileData?.recentlyWatched || [], true)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#1a1a2e',
  },
  scrollView:{
    flex:1,
  },
  profileHeader:{
    height:200,
    position:'relative',
  },
  backgroundImage:{
    width:'100%',
    height:'100%',
    position:'absolute',
  },
  overlay:{
    ...StyleSheet.absoluteFillObject,
    backgroundColor:'rgba(26, 26, 46, 0.7)',
  },
  profileInfo:{
    position:'absolute',
    bottom:20,
    left:20,
    right:20,
    alignItems:'center',
  },
  profileImage:{
    width:80,
    height:80,
    borderRadius:40,
    marginBottom:10,
  },
  nameText:{
    fontSize:24,
    fontWeight:'bold',
    color:'white',
    marginBottom:10,
  },
  followContainer:{
    flexDirection:'row',
    gap:20,
  },
  followText:{
    color:'white',
    fontSize:14,
  },
  statsContainer:{
    flexDirection:'row',
    justifyContent:'space-around',
    paddingVertical:15,
    backgroundColor:'#16213e',
  },
  statItem:{
    alignItems:'center',
  },
  statNumber:{
    fontSize:20,
    fontWeight:'bold',
    color:'white',
    marginBottom:3,
  },
  statLabel:{
    fontSize:11,
    color:'#8b94a8',
  },
  section:{
    padding:20,
  },
  sectionHeader:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:15,
  },
  sectionTitle:{
    fontSize:18,
    fontWeight:'bold',
    color:'white',
    marginBottom:15,
  },
  seeAllText:{
    color:'#ff6b6b',
    fontSize:14,
  },
  movieGrid:{
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent:'space-between',
  },
  movieItem:{
    width:'23%',
    marginBottom:15,
  },
  moviePoster:{
    width:'100%',
    height:100,
    borderRadius:8,
  },
  movieScrollContainer:{
    paddingRight:20,
  },
  movieScrollItem:{
    width:120,
    marginRight:12,
  },
  movieScrollPoster:{
    width:120,
    height:180,
    borderRadius:8,
  },
  ratingContainer:{
    marginTop:5,
  },
  stars:{
    flexDirection:'row',
    marginBottom:2,
  },
  readReview:{
    color:'#8b94a8',
    fontSize:11,
  },
  reviewItem:{
    flexDirection:'row',
    backgroundColor:'#16213e',
    padding:15,
    borderRadius:8,
    marginBottom:15,
  },
  reviewerImage:{
    width:40,
    height:40,
    borderRadius:20,
    marginRight:10,
  },
  reviewContent:{
    flex:1,
    marginRight:10,
  },
  reviewHeader:{
    flexDirection:'row',
    alignItems:'center',
    marginBottom:2,
  },
  reviewerName:{
    fontSize:16,
    fontWeight:'bold',
    color:'white',
    marginRight:8,
  },
  reviewYear:{
    fontSize:14,
    color:'#8b94a8',
  },
  reviewBy:{
    fontSize:12,
    color:'#8b94a8',
    marginBottom:5,
  },
  reviewStars:{
    flexDirection:'row',
    alignItems:'center',
    marginBottom:8,
  },
  likeCount:{
    marginLeft:10,
    fontSize:12,
    color:'#8b94a8',
  },
  reviewText:{
    fontSize:13,
    color:'#8b94a8',
    lineHeight:18,
  },
  reviewMoviePoster:{
    width:60,
    height:80,
    borderRadius:6,
  },
  emptyText: {
    color: '#8b94a8',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#F2A8A8',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#1B1935',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;