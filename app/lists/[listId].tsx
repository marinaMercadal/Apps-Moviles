import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {useEffect,useRef,useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

interface SearchMovie{
  id:number;
  title:string;
  poster_path:string|null;
}

export default function ListDetailScreen(){
  const {listId}=useLocalSearchParams<{listId:string}>();
  const router=useRouter();
  const [list,setList]=useState<ListDetail|null>(null);
  const [loading,setLoading]=useState(true);

  const [addMovieModalVisible,setAddMovieModalVisible]=useState(false);
  const [searchQuery,setSearchQuery]=useState('');
  const [searchResults,setSearchResults]=useState<SearchMovie[]>([]);
  const [popularMovies,setPopularMovies]=useState<SearchMovie[]>([]);
  const [searching,setSearching]=useState(false);
  const searchTimeout=useRef<ReturnType<typeof setTimeout>|null>(null);

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

  const fetchPopularMovies=async()=>{
    try{
      const res=await fetch(`${API_URL}/movies/popular`);
      if(res.ok){
        const data=await res.json();
        setPopularMovies((data.results||[]).slice(0,20));
      }
    }catch(error){
      console.error('Error fetching popular movies:',error);
    }
  };

  const searchMovies=async(query:string)=>{
    setSearchQuery(query);
    if(searchTimeout.current) clearTimeout(searchTimeout.current);
    if(!query.trim()){setSearchResults([]);return;}
    searchTimeout.current=setTimeout(async()=>{
      try{
        setSearching(true);
        const res=await fetch(`${API_URL}/search?query=${encodeURIComponent(query.trim())}`);
        if(res.ok){
          const data=await res.json();
          setSearchResults((data.results||[]).slice(0,20));
        }
      }catch(error){
        console.error('Error searching movies:',error);
      }finally{
        setSearching(false);
      }
    },400);
  };

  const addMovieToList=async(movie:SearchMovie)=>{
    try{
      const token=await getToken();
      const res=await fetch(`${API_URL}/lists/${listId}/movies`,{
        method:'POST',
        headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
        body:JSON.stringify({movieId:String(movie.id),title:movie.title,posterPath:movie.poster_path}),
      });
      if(res.ok){
        const newMovie:ListMovie={
          id:Date.now(),
          movieId:String(movie.id),
          title:movie.title,
          posterPath:movie.poster_path,
          addedAt:new Date().toISOString(),
        };
        setList(prev=>prev?{...prev,movies:[...prev.movies,newMovie]}:prev);
      }
    }catch(error){
      console.error('Error adding movie:',error);
    }
  };

  const isInList=(movieId:number)=>
    list?.movies.some(m=>m.movieId===String(movieId))??false;

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

  const openAddModal=()=>{
    setSearchQuery('');
    setSearchResults([]);
    setAddMovieModalVisible(true);
    if(popularMovies.length===0) fetchPopularMovies();
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
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Ionicons name="add" size={26} color="#F2A8A8"/>
        </TouchableOpacity>
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
          <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal}>
            <Ionicons name="add" size={18} color="#1B1935"/>
            <Text style={styles.emptyAddBtnText}>Agregar película</Text>
          </TouchableOpacity>
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

      <Modal
        transparent
        visible={addMovieModalVisible}
        animationType="slide"
        onRequestClose={()=>setAddMovieModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar película</Text>
              <TouchableOpacity onPress={()=>setAddMovieModalVisible(false)}>
                <Ionicons name="close" size={24} color="#aaa"/>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar película..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={searchMovies}
              autoFocus
            />
            <Text style={styles.sectionLabel}>
              {searchQuery.trim()?'Resultados':'Películas populares'}
            </Text>
            {searching?(
              <ActivityIndicator size="small" color="#F2A8A8" style={{marginVertical:20}}/>
            ):(
              <FlatList
                data={searchQuery.trim()?searchResults:popularMovies}
                keyExtractor={item=>String(item.id)}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  searchQuery.trim()?(
                    <Text style={styles.noResults}>No se encontraron resultados</Text>
                  ):null
                }
                renderItem={({item})=>{
                  const already=isInList(item.id);
                  return(
                    <View style={styles.resultRow}>
                      {item.poster_path?(
                        <Image source={{uri:IMG_URL+item.poster_path}} style={styles.resultPoster}/>
                      ):(
                        <View style={[styles.resultPoster,styles.placeholder]}>
                          <Ionicons name="film-outline" size={16} color="#555"/>
                        </View>
                      )}
                      <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
                      <TouchableOpacity
                        style={[styles.addMovieBtn,already&&styles.addMovieBtnDone]}
                        onPress={()=>!already&&addMovieToList(item)}
                        disabled={already}
                      >
                        <Ionicons
                          name={already?'checkmark':'add'}
                          size={20}
                          color={already?'#aaa':'#1B1935'}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
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
  addBtn:{padding:4,marginLeft:8},
  trashBtn:{padding:4,marginLeft:8},
  subtitle:{color:'#aaa',fontSize:13,paddingHorizontal:20,paddingTop:10,paddingBottom:4},
  errorText:{color:'#aaa',fontSize:16},
  emptyText:{color:'#fff',fontSize:18,fontWeight:'600',marginTop:16,textAlign:'center',marginBottom:20},
  emptyAddBtn:{
    flexDirection:'row',alignItems:'center',gap:6,
    backgroundColor:'#F2A8A8',borderRadius:10,
    paddingVertical:10,paddingHorizontal:20,
  },
  emptyAddBtnText:{color:'#1B1935',fontWeight:'bold',fontSize:15},
  grid:{flexDirection:'row',flexWrap:'wrap',padding:12,gap:10,paddingBottom:40},
  movieContainer:{width:'31%',position:'relative'},
  movieItem:{width:'100%',aspectRatio:2/3},
  poster:{width:'100%',height:'100%',borderRadius:8},
  placeholder:{backgroundColor:'#2A273F',justifyContent:'center',alignItems:'center'},
  movieTitle:{color:'#aaa',fontSize:11,marginTop:4,textAlign:'center'},
  removeBtn:{position:'absolute',top:4,right:4},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'flex-end'},
  modalContent:{
    backgroundColor:'#1A1833',borderTopLeftRadius:20,borderTopRightRadius:20,
    padding:20,maxHeight:'80%',
  },
  modalHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},
  modalTitle:{fontSize:18,fontWeight:'bold',color:'#F2A8A8'},
  searchInput:{
    backgroundColor:'#2A273F',borderRadius:10,
    padding:12,color:'#fff',fontSize:15,marginBottom:12,
  },
  sectionLabel:{color:'#aaa',fontSize:12,marginBottom:8},
  noResults:{color:'#aaa',textAlign:'center',marginTop:20,fontSize:14},
  resultRow:{
    flexDirection:'row',alignItems:'center',
    paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#2A273F',gap:10,
  },
  resultPoster:{width:40,height:60,borderRadius:6},
  resultTitle:{flex:1,color:'#fff',fontSize:14},
  addMovieBtn:{
    width:34,height:34,borderRadius:17,
    backgroundColor:'#F2A8A8',alignItems:'center',justifyContent:'center',
  },
  addMovieBtnDone:{backgroundColor:'#2A273F'},
});
