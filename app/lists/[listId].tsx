import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {useEffect,useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {API_URL} from '../../config';

const IMG_URL='https://image.tmdb.org/t/p/w500';

interface ListMovie{
  id:number;
  movieId:string;
  title:string;
  posterPath:string|null;
  addedAt:string;
}

interface ListDetail{
  id:number;
  name:string;
  movies:ListMovie[];
}

export default function ListDetailScreen(){
  const {listId}=useLocalSearchParams<{listId:string}>();
  const router=useRouter();
  const [list,setList]=useState<ListDetail|null>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(listId) fetchList();
  },[listId]);

  const getToken=async()=>{
    try{return await AsyncStorage.getItem('token');}
    catch{return null;}
  };

  const fetchList=async()=>{
    try{
      setLoading(true);
      const token=await getToken();
      const res=await fetch(`${API_URL}/lists/${listId}`,{
        headers:{Authorization:`Bearer ${token}`},
      });
      if(res.ok){
        const data=await res.json();
        setList(data);
      }
    }catch(error){
      console.error('Error fetching list:',error);
    }finally{
      setLoading(false);
    }
  };

  const removeMovie=async(movieId:string)=>{
    Alert.alert('Quitar película','¿Querés quitar esta película de la lista?',[
      {text:'Cancelar',style:'cancel'},
      {text:'Quitar',style:'destructive',onPress:async()=>{
        try{
          const token=await getToken();
          await fetch(`${API_URL}/lists/${listId}/movies/${movieId}`,{
            method:'DELETE',
            headers:{Authorization:`Bearer ${token}`},
          });
          setList(prev=>prev?{...prev,movies:prev.movies.filter(m=>m.movieId!==movieId)}:prev);
        }catch(error){
          console.error('Error removing movie:',error);
        }
      }},
    ]);
  };

  const deleteList=async()=>{
    Alert.alert('Eliminar lista','¿Seguro que querés eliminar esta lista?',[
      {text:'Cancelar',style:'cancel'},
      {text:'Eliminar',style:'destructive',onPress:async()=>{
        try{
          const token=await getToken();
          await fetch(`${API_URL}/lists/${listId}`,{
            method:'DELETE',
            headers:{Authorization:`Bearer ${token}`},
          });
          router.back();
        }catch(error){
          console.error('Error deleting list:',error);
        }
      }},
    ]);
  };

  if(loading){
    return(
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#F2A8A8"/>
        </View>
      </SafeAreaView>
    );
  }

  if(!list){
    return(
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={()=>router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F2A8A8"/>
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Lista no encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return(
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F2A8A8"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{list.name}</Text>
        <TouchableOpacity onPress={deleteList} style={styles.trashBtn}>
          <Ionicons name="trash-outline" size={22} color="#ff6b6b"/>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {list.movies.length} {list.movies.length===1?'película':'películas'}
      </Text>

      {list.movies.length===0?(
        <View style={styles.centered}>
          <Ionicons name="film-outline" size={64} color="#444"/>
          <Text style={styles.emptyText}>No hay películas en esta lista</Text>
          <Text style={styles.emptySubtext}>Agregá películas desde el detalle de cada una</Text>
        </View>
      ):(
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {list.movies.map(movie=>(
            <View key={movie.id} style={styles.movieContainer}>
              <TouchableOpacity
                style={styles.movieItem}
                onPress={()=>router.push(`/movie/${movie.movieId}`)}
              >
                {movie.posterPath?(
                  <Image source={{uri:IMG_URL+movie.posterPath}} style={styles.poster}/>
                ):(
                  <View style={[styles.poster,styles.placeholder]}>
                    <Ionicons name="film-outline" size={32} color="#555"/>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
              <TouchableOpacity style={styles.removeBtn} onPress={()=>removeMovie(movie.movieId)}>
                <Ionicons name="close-circle" size={20} color="#ff6b6b"/>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:'#1B1935'},
  centered:{flex:1,justifyContent:'center',alignItems:'center',paddingHorizontal:32},
  header:{
    flexDirection:'row',alignItems:'center',
    paddingHorizontal:16,paddingVertical:14,
    borderBottomWidth:1,borderBottomColor:'#2A273F',
  },
  backBtn:{padding:4,marginRight:12},
  headerTitle:{flex:1,fontSize:20,fontWeight:'bold',color:'#F2A8A8'},
  trashBtn:{padding:4,marginLeft:12},
  subtitle:{color:'#aaa',fontSize:13,paddingHorizontal:20,paddingTop:10,paddingBottom:4},
  errorText:{color:'#aaa',fontSize:16},
  emptyText:{color:'#fff',fontSize:18,fontWeight:'600',marginTop:16,textAlign:'center'},
  emptySubtext:{color:'#888',fontSize:13,marginTop:8,textAlign:'center'},
  grid:{flexDirection:'row',flexWrap:'wrap',padding:12,gap:10,paddingBottom:40},
  movieContainer:{width:'31%',position:'relative'},
  movieItem:{width:'100%',aspectRatio:2/3},
  poster:{width:'100%',height:'100%',borderRadius:8},
  placeholder:{backgroundColor:'#2A273F',justifyContent:'center',alignItems:'center'},
  movieTitle:{color:'#aaa',fontSize:11,marginTop:4,textAlign:'center'},
  removeBtn:{position:'absolute',top:4,right:4},
});
