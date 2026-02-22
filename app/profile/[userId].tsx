import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { API_ORIGIN, API_URL } from '../../config';

interface Movie{
  id:string;
  title:string;
  poster_path:string;
  rating?:number;
}

interface PublicUser{
  id:number;
  name:string;
  username:string;
  profileImage?:{url:string};
  _count:{reviews:number;favorites:number};
}

interface Review{
  id:number;
  rating:number;
  comment:string;
  createdAt:string;
  movieId:string;
  movie?:{title:string;poster_path:string};
}

export default function PublicProfileScreen(){
  const {userId}=useLocalSearchParams<{userId:string}>();
  const router=useRouter();
  const [userData,setUserData]=useState<PublicUser|null>(null);
  const [favoriteMovies,setFavoriteMovies]=useState<Movie[]>([]);
  const [reviewedMovies,setReviewedMovies]=useState<Movie[]>([]);
  const [recentReviews,setRecentReviews]=useState<Review[]>([]);
  const [loading,setLoading]=useState(true);
  const [notFound,setNotFound]=useState(false);

  useEffect(()=>{
    if(userId) fetchUserData();
  },[userId]);

  const fetchUserData=async()=>{
    try{
      setLoading(true);
      const [userRes,favoritesRes,reviewsRes]=await Promise.all([
        fetch(`${API_URL}/users/${userId}`),
        fetch(`${API_URL}/favorites?userId=${userId}`),
        fetch(`${API_URL}/reviews?userId=${userId}`),
      ]);

      if(!userRes.ok){
        setNotFound(true);
        return;
      }

      const user:PublicUser=await userRes.json();
      setUserData(user);

      if(favoritesRes.ok){
        const favsData=await favoritesRes.json();
        const favorites=(Array.isArray(favsData)?favsData:[]).map((fav:any)=>({
          id:fav.movieId,
          title:fav.title,
          poster_path:fav.posterPath,
          rating:fav.rating,
        }));
        setFavoriteMovies(favorites);
      }

      if(reviewsRes.ok){
        const reviewData=await reviewsRes.json();
        const reviews=reviewData.reviews||[];

        const movieDetailsPromises=reviews.map(async(review:any)=>{
          try{
            const tmdbRes=await fetch(`${API_URL}/movies/${review.movieId}`);
            if(tmdbRes.ok){
              const movieData=await tmdbRes.json();
              return{
                id:review.movieId,
                title:movieData.title,
                poster_path:movieData.poster_path,
                rating:review.rating,
              };
            }
          }catch(e){
            console.error(`Error fetching movie ${review.movieId}:`,e);
          }
          return null;
        });

        const movies=await Promise.all(movieDetailsPromises);
        setReviewedMovies(movies.filter((m)=>m!==null) as Movie[]);
        setRecentReviews(reviews.slice(0,3));
      }
    }catch(error){
      console.error('Error fetching user profile:',error);
      setNotFound(true);
    }finally{
      setLoading(false);
    }
  };

  const renderStars=(rating:number)=>{
    const fullStars=Math.floor(rating);
    const hasHalfStar=rating%1!==0;
    const stars=[];
    for(let i=0;i<5;i++){
      if(i<fullStars){
        stars.push(<Ionicons key={i} name="star" size={14} color="#ff6b6b"/>);
      }else if(i===fullStars&&hasHalfStar){
        stars.push(<Ionicons key={i} name="star-half" size={14} color="#ff6b6b"/>);
      }else{
        stars.push(<Ionicons key={i} name="star-outline" size={14} color="#ff6b6b"/>);
      }
    }
    return stars;
  };

  const full=(url?:string|null)=>
    url?(url.startsWith('http')?url:`${API_ORIGIN}${url}`):undefined;

  if(loading){
    return(
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#F2A8A8"/>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if(notFound||!userData){
    return(
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={()=>router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F2A8A8"/>
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Usuario no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avatarUri=full(userData.profileImage?.url??null);

  return(
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image source={Images.header} style={styles.backgroundImage} resizeMode="cover"/>
          <View style={styles.overlay}/>
          <TouchableOpacity style={styles.backButton} onPress={()=>router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff"/>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Image
              source={avatarUri?{uri:avatarUri}:Images.profilePlaceholder}
              style={styles.profileImage}
            />
            <Text style={styles.nameText}>{userData.name||userData.username}</Text>
            <Text style={styles.usernameText}>@{userData.username}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData._count.favorites}</Text>
            <Text style={styles.statLabel}>Películas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData._count.reviews}</Text>
            <Text style={styles.statLabel}>Reseñas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Películas favoritas de {userData.name||userData.username}</Text>
          {favoriteMovies.length===0?(
            <Text style={styles.emptyText}>Sin películas favoritas</Text>
          ):(
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.movieScrollContainer}
            >
              {favoriteMovies.map((movie)=>(
                <TouchableOpacity
                  key={movie.id}
                  style={styles.movieScrollItem}
                  onPress={()=>router.push(`/movie/${movie.id}`)}
                >
                  <Image
                    source={{uri:`https://image.tmdb.org/t/p/w500${movie.poster_path}`}}
                    style={styles.movieScrollPoster}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Películas reseñadas por {userData.name||userData.username}
          </Text>
          {reviewedMovies.length===0?(
            <Text style={styles.emptyText}>No hay reseñas aún</Text>
          ):(
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.movieScrollContainer}
            >
              {reviewedMovies.map((movie)=>(
                <TouchableOpacity
                  key={movie.id}
                  style={styles.movieScrollItem}
                  onPress={()=>router.push(`/movie/${movie.id}`)}
                >
                  <Image
                    source={{uri:`https://image.tmdb.org/t/p/w500${movie.poster_path}`}}
                    style={styles.movieScrollPoster}
                  />
                  {movie.rating&&(
                    <View style={styles.ratingContainer}>
                      <View style={styles.stars}>{renderStars(movie.rating)}</View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#1a1a2e',
  },
  scrollView:{
    flex:1,
  },
  centered:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  loadingText:{
    color:'#aaa',
    marginTop:12,
    fontSize:14,
  },
  errorText:{
    color:'#aaa',
    fontSize:16,
  },
  profileHeader:{
    height:220,
    position:'relative',
  },
  backgroundImage:{
    width:'100%',
    height:'100%',
    position:'absolute',
  },
  overlay:{
    ...StyleSheet.absoluteFillObject,
    backgroundColor:'rgba(26,26,46,0.7)',
  },
  backButton:{
    position:'absolute',
    top:16,
    left:16,
    zIndex:10,
    padding:4,
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
    fontSize:22,
    fontWeight:'bold',
    color:'white',
    marginBottom:4,
  },
  usernameText:{
    fontSize:14,
    color:'#aaa',
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
  sectionTitle:{
    fontSize:18,
    fontWeight:'bold',
    color:'white',
    marginBottom:15,
  },
  emptyText:{
    color:'#8b94a8',
    fontSize:14,
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
  },
  reviewCard:{
    backgroundColor:'#2A273F',
    borderRadius:10,
    padding:12,
    marginBottom:12,
  },
  reviewMovie:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:14,
    marginBottom:6,
  },
  reviewMeta:{
    flexDirection:'row',
    alignItems:'center',
    marginBottom:6,
  },
  reviewComment:{
    color:'#aaa',
    fontSize:13,
    lineHeight:18,
  },
});
