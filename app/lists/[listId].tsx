import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../../config';

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
  
  const [deleteConfirmVisible,setDeleteConfirmVisible]=useState(false);
  const [movieToDelete,setMovieToDelete]=useState<{movieId:string;title:string}|null>(null);

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

  const searchMovies=(query:string)=>{
    setSearchQuery(query);

    if(searchTimeout.current){
      clearTimeout(searchTimeout.current);
    }

    if(!query.trim()){
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    searchTimeout.current=setTimeout(async()=>{
      try{
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
        body:JSON.stringify({
          movieId:String(movie.id),
          title:movie.title,
          posterPath:movie.poster_path
        }),
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

  const removeMovieFromList=async(movieId:string)=>{
    try{
      const token=await getToken();
      const res=await fetch(`${API_URL}/lists/${listId}/movies/${movieId}`,{
        method:'DELETE',
        headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
      });
      if(res.ok){
        setList(prev=>prev?{...prev,movies:prev.movies.filter(m=>m.movieId!==movieId)}:prev);
        setDeleteConfirmVisible(false);
        setMovieToDelete(null);
      }
    }catch(error){
      console.error('Error removing movie:',error);
    }
  };
  
  const showDeleteConfirm=(movieId:string,title:string)=>{
    setMovieToDelete({movieId,title});
    setDeleteConfirmVisible(true);
  };

  const toggleMovieInList=async(movie:SearchMovie)=>{
    if(isInList(movie.id)){
      await removeMovieFromList(String(movie.id));
    }else{
      await addMovieToList(movie);
    }
  };

  const isInList=(movieId:number)=>
    list?.movies.some(m=>m.movieId===String(movieId))??false;

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
        <Text style={styles.headerTitle}>{list.name}</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Ionicons name="add" size={26} color="#F2A8A8"/>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
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
              <TouchableOpacity 
                style={styles.deleteMovieBtn}
                onPress={()=>showDeleteConfirm(movie.movieId,movie.title)}
              >
                <Ionicons name="trash-outline" size={16} color="#FF6B6B"/>
              </TouchableOpacity>
            </TouchableOpacity>
            <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ✅ MODAL FIJO QUE NO SE ACHICA */}
      <Modal
        transparent
        visible={addMovieModalVisible}
        animationType="slide"
        onRequestClose={()=>setAddMovieModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS==='ios'?'padding':'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          style={styles.modalOverlay}
        >
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

            {searching?(
              <ActivityIndicator size="small" color="#F2A8A8" style={{marginVertical:20}}/>
            ):(
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={searchQuery.trim()?searchResults:popularMovies}
                keyExtractor={item=>String(item.id)}
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
                        onPress={()=>toggleMovieInList(item)}
                      >
                        <Ionicons
                          name={already?'checkmark':'add'}
                          size={20}
                          color={already?'#fff':'#1B1935'}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      <Modal
        transparent
        visible={deleteConfirmVisible}
        animationType="fade"
        onRequestClose={()=>setDeleteConfirmVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmContent}>
            <View style={styles.confirmIconContainer}>
              <Ionicons name="trash-outline" size={60} color="#FF6B6B" />
            </View>
            
            <Text style={styles.confirmTitle}>¿Eliminar película?</Text>
            <Text style={styles.confirmSubtitle}>{movieToDelete?.title}</Text>
            <Text style={styles.confirmDescription}>
              Se quitará de tu lista
            </Text>
            
            <View style={styles.confirmButtonsContainer}>
              <TouchableOpacity 
                style={styles.confirmCancelBtn}
                onPress={()=>setDeleteConfirmVisible(false)}
              >
                <Text style={styles.confirmCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmDeleteBtn}
                onPress={()=>movieToDelete&&removeMovieFromList(movieToDelete.movieId)}
              >
                <Text style={styles.confirmDeleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:'#1B1935'},
  centered:{flex:1,justifyContent:'center',alignItems:'center'},
  header:{flexDirection:'row',alignItems:'center',padding:16},
  headerTitle:{flex:1,fontSize:20,fontWeight:'bold',color:'#F2A8A8'},
  backBtn:{padding:4},
  addBtn:{padding:4},
  errorText:{color:'#aaa'},
  grid:{flexDirection:'row',flexWrap:'wrap',padding:12,gap:10},
  movieContainer:{width:'31%'},
  movieItem:{width:'100%',aspectRatio:2/3},
  poster:{width:'100%',height:'100%',borderRadius:8},
  deleteMovieBtn:{
    position:'absolute',
    top:4,
    right:4,
    width:28,
    height:28,
    borderRadius:14,
    backgroundColor:'rgba(0,0,0,0.5)',
    justifyContent:'center',
    alignItems:'center',
    zIndex:10,
  },
  placeholder:{backgroundColor:'#2A273F',justifyContent:'center',alignItems:'center'},
  movieTitle:{color:'#aaa',fontSize:11,marginTop:4,textAlign:'center'},
  modalOverlay:{
    flex:1,
    backgroundColor:'rgba(0,0,0,0.6)',
    justifyContent:'flex-end'
  },
  modalContent:{
    backgroundColor:'#1A1833',
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    padding:20,
    height:'80%',
    overflow:'hidden',
  },
  modalHeader:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:14
  },
  modalTitle:{fontSize:18,fontWeight:'bold',color:'#F2A8A8'},
  searchInput:{
    backgroundColor:'#2A273F',
    borderRadius:10,
    padding:12,
    color:'#fff',
    marginBottom:12,
  },
  resultRow:{
    flexDirection:'row',
    alignItems:'center',
    paddingVertical:8,
    gap:10,
    borderBottomWidth:1,
    borderBottomColor:'#2A273F'
  },
  resultPoster:{width:40,height:60,borderRadius:6},
  resultTitle:{flex:1,color:'#fff'},
  addMovieBtn:{
    width:34,height:34,borderRadius:17,
    backgroundColor:'#F2A8A8',
    alignItems:'center',justifyContent:'center',
  },
  addMovieBtnDone:{backgroundColor:'#4CAF50'},
  confirmOverlay:{
    flex:1,
    backgroundColor:'rgba(0,0,0,0.6)',
    justifyContent:'center',
    alignItems:'center',
  },
  confirmContent:{
    backgroundColor:'#1A1833',
    borderRadius:20,
    padding:24,
    width:'80%',
    maxWidth:320,
    alignItems:'center',
  },
  confirmIconContainer:{
    marginBottom:16,
  },
  confirmTitle:{
    fontSize:20,
    fontWeight:'bold',
    color:'#FF6B6B',
    marginBottom:4,
    textAlign:'center',
  },
  confirmSubtitle:{
    fontSize:14,
    fontWeight:'600',
    color:'#F2A8A8',
    marginBottom:8,
    textAlign:'center',
  },
  confirmDescription:{
    fontSize:12,
    color:'#aaa',
    marginBottom:20,
    textAlign:'center',
    fontStyle:'italic',
  },
  confirmButtonsContainer:{
    flexDirection:'row',
    gap:12,
    width:'100%',
  },
  confirmCancelBtn:{
    flex:1,
    paddingVertical:12,
    borderRadius:10,
    backgroundColor:'rgba(255,107,107,0.1)',
    borderWidth:1,
    borderColor:'#FF6B6B',
    alignItems:'center',
  },
  confirmCancelText:{
    color:'#FF6B6B',
    fontWeight:'600',
    fontSize:14,
  },
  confirmDeleteBtn:{
    flex:1,
    paddingVertical:12,
    borderRadius:10,
    backgroundColor:'#FF6B6B',
    alignItems:'center',
  },
  confirmDeleteText:{
    color:'#fff',
    fontWeight:'600',
    fontSize:14,
  },
});