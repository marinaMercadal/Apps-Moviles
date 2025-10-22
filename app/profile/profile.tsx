import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Images } from '../../assets/images';
import { useAuth } from '../../context/AuthContext';

interface Movie{
  id:string;
  title:string;
  image:any;
  rating?:number;
  year?:string;
}

const ProfileScreen=()=>{
  const { user } = useAuth();
  const router = useRouter();

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
  
  const favoriteFilms:Movie[]=[
    {
      id:'1',
      title:'homoArgentum',
      image:Images.homoArgentum,
      rating:5,
      year:'2025'
    },
    {
      id:'2',
      title:'materialists',
      image:Images.materialists,
      rating:5,
      year:'2025'
    },
    {
      id:'3',
      title:'lilo Y Stitch',
      image:Images.liloYStitch,
      rating:4.5,
      year:'2025'
    },
    {
      id:'4',
      title:'hot Milk',
      image:Images.hotMilk,
      rating:4.5,
      year:'2025'
    }
  ];

  const recentWatched:Movie[]=[
    {
      id:'5',
      title:'weapons',
      image:Images.weapons,
      rating:4,
      year:'2025'
    },
    {
      id:'6',
      title:'the Wrong Paris',
      image:Images.wrongParis,
      rating:4,
      year:'2025'
    },
    {
      id:'7',
      title:'Enemies',
      image:Images.enemies,
      rating:3.5,
      year:'2025'
    },
    {
      id:'9',
      title:'The Batman',
      image:Images.batman,
      rating:5,
      year:'2022'
    }
  ];

  const recentReviews:Movie[]=[
    {
      id:'10',
      title:'weapons',
      image:Images.weapons,
      rating:4,
      year:'2025'
    }
  ];

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

  const renderMovieGrid=(movies:Movie[],showRating:boolean=false)=>(
    <View style={styles.movieGrid}>
      {movies.map((movie)=>(
        <TouchableOpacity key={movie.id} style={styles.movieItem}>
          <Image source={movie.image} style={styles.moviePoster} />
          {showRating&&(
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {renderStars(movie.rating||0)}
              </View>
              <Text style={styles.readReview}>Leer Reseña ›</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
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
              source={Images.profilePlaceholder} 
              style={styles.profileImage}
            />
            
            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>{user?.name || 'Usuario'}</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proText}>PRO</Text>
              </View>
            </View>
            
            <View style={styles.followContainer}>
              <Text style={styles.followText}>0 Seguidores</Text>
              <Text style={styles.followText}>0 Siguiendo</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>33</Text>
            <Text style={styles.statLabel}>Películas Totales</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber,{color:'#b794f6'}]}>8</Text>
            <Text style={styles.statLabel}>Películas Este Año</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Listas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber,{color:'#b794f6'}]}>6</Text>
            <Text style={styles.statLabel}>Reseñas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Películas Favoritas de {user?.name || 'Usuario'}</Text>
          {renderMovieGrid(favoriteFilms)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vistas Recientemente por {user?.name || 'Usuario'}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver Todo</Text>
            </TouchableOpacity>
          </View>
          {renderMovieGrid(recentWatched,true)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reseñas Recientes de {user?.name || 'Usuario'}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver Todo</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.reviewItem}>
            <Image source={Images.profilePlaceholder} style={styles.reviewerImage} />
            <View style={styles.reviewContent}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>Weapons</Text>
                <Text style={styles.reviewYear}>2025</Text>
              </View>
              <Text style={styles.reviewBy}>Reseña por {user?.name || 'Usuario'}</Text>
              <View style={styles.reviewStars}>
                {renderStars(4)}
                <Text style={styles.likeCount}>🗨 0</Text>
              </View>
              <Text style={styles.reviewText}>
                Muy buena película, ultra recomendable para ver con amigas y familia! 
              </Text>
            </View>
            <Image source={Images.weapons} style={styles.reviewMoviePoster} />
          </View>
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
  nameContainer:{
    flexDirection:'row',
    alignItems:'center',
    marginBottom:10,
  },
  nameText:{
    fontSize:24,
    fontWeight:'bold',
    color:'white',
    marginRight:10,
  },
  proBadge:{
    backgroundColor:'#ff6b6b',
    paddingHorizontal:8,
    paddingVertical:2,
    borderRadius:4,
  },
  proText:{
    color:'white',
    fontSize:12,
    fontWeight:'bold',
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
    color:'#f4a261',
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