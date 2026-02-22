import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRouter} from 'expo-router';
import {useEffect,useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {API_URL} from '../../config';

interface List{
  id:number;
  name:string;
  createdAt:string;
  _count:{movies:number};
}

export default function ListsScreen(){
  const {user}=useAuth();
  const router=useRouter();
  const [lists,setLists]=useState<List[]>([]);
  const [loading,setLoading]=useState(true);
  const [modalVisible,setModalVisible]=useState(false);
  const [newListName,setNewListName]=useState('');
  const [creating,setCreating]=useState(false);

  useEffect(()=>{
    if(user) fetchLists();
  },[user]);

  const getToken=async()=>{
    try{return await AsyncStorage.getItem('token');}
    catch{return null;}
  };

  const fetchLists=async()=>{
    try{
      setLoading(true);
      const token=await getToken();
      const res=await fetch(`${API_URL}/lists`,{
        headers:{Authorization:`Bearer ${token}`},
      });
      if(res.ok){
        const data=await res.json();
        setLists(data);
      }
    }catch(error){
      console.error('Error fetching lists:',error);
    }finally{
      setLoading(false);
    }
  };

  const createList=async()=>{
    if(!newListName.trim()) return;
    try{
      setCreating(true);
      const token=await getToken();
      const res=await fetch(`${API_URL}/lists`,{
        method:'POST',
        headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
        body:JSON.stringify({name:newListName.trim()}),
      });
      if(res.ok){
        const created=await res.json();
        setLists(prev=>[{...created,_count:{movies:0}},...prev]);
        setNewListName('');
        setModalVisible(false);
      }
    }catch(error){
      console.error('Error creating lists:',error);
    }finally{
      setCreating(false);
    }
  };

  const deleteList=async(listId:number)=>{
    Alert.alert('Eliminar lista','¿Seguro que querés eliminar esta lista?',[
      {text:'Cancelar',style:'cancel'},
      {text:'Eliminar',style:'destructive',onPress:async()=>{
        try{
          const token=await getToken();
          await fetch(`${API_URL}/lists/${listId}`,{
            method:'DELETE',
            headers:{Authorization:`Bearer ${token}`},
          });
          setLists(prev=>prev.filter(l=>l.id!==listId));
        }catch(error){
          console.error('Error deleting list:',error);
        }
      }},
    ]);
  };

  if(!user){
    return(
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="list-outline" size={80} color="#F2A8A8"/>
          <Text style={styles.emptyTitle}>Mis Listas</Text>
          <Text style={styles.emptySubtitle}>Iniciá sesión para ver tus listas</Text>
          <TouchableOpacity style={styles.loginButton} onPress={()=>router.push('/login')}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return(
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F2A8A8"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Listas</Text>
        <TouchableOpacity onPress={()=>setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add" size={28} color="#F2A8A8"/>
        </TouchableOpacity>
      </View>

      {loading?(
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#F2A8A8"/>
        </View>
      ):lists.length===0?(
        <View style={styles.centered}>
          <Ionicons name="list-outline" size={64} color="#444"/>
          <Text style={styles.emptyTitle}>No tenés listas todavía</Text>
          <Text style={styles.emptySubtitle}>Tocá el "+" para crear tu primera lista</Text>
        </View>
      ):(
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {lists.map(list=>(
            <TouchableOpacity
              key={list.id}
              style={styles.listCard}
              onPress={()=>router.push(`/lists/${list.id}`)}
              onLongPress={()=>deleteList(list.id)}
            >
              <View style={styles.listIconContainer}>
                <Ionicons name="film-outline" size={28} color="#F2A8A8"/>
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{list.name}</Text>
                <Text style={styles.listCount}>
                  {list._count.movies} {list._count.movies===1?'película':'películas'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555"/>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={()=>setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Lista</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la lista"
              placeholderTextColor="#666"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={()=>{setModalVisible(false);setNewListName('');}}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton,!newListName.trim()&&styles.createButtonDisabled]}
                onPress={createList}
                disabled={creating||!newListName.trim()}
              >
                {creating?(
                  <ActivityIndicator size="small" color="#1B1935"/>
                ):(
                  <Text style={styles.createButtonText}>Crear</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#1B1935',
  },
  header:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:16,
    paddingVertical:14,
    borderBottomWidth:1,
    borderBottomColor:'#2A273F',
  },
  backButton:{
    padding:4,
  },
  headerTitle:{
    fontSize:22,
    fontWeight:'bold',
    color:'#F2A8A8',
  },
  addButton:{
    padding:4,
  },
  centered:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    paddingHorizontal:40,
  },
  emptyTitle:{
    fontSize:20,
    fontWeight:'bold',
    color:'#fff',
    marginTop:16,
    marginBottom:8,
    textAlign:'center',
  },
  emptySubtitle:{
    fontSize:14,
    color:'#aaa',
    textAlign:'center',
    marginBottom:24,
  },
  loginButton:{
    backgroundColor:'#F2A8A8',
    paddingVertical:12,
    paddingHorizontal:32,
    borderRadius:20,
  },
  loginButtonText:{
    color:'#1B1935',
    fontWeight:'bold',
    fontSize:15,
  },
  listContainer:{
    padding:16,
    paddingBottom:40,
  },
  listCard:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#2A273F',
    borderRadius:12,
    padding:16,
    marginBottom:12,
  },
  listIconContainer:{
    width:48,
    height:48,
    borderRadius:24,
    backgroundColor:'rgba(242,168,168,0.15)',
    justifyContent:'center',
    alignItems:'center',
    marginRight:14,
  },
  listInfo:{
    flex:1,
  },
  listName:{
    fontSize:17,
    fontWeight:'600',
    color:'#fff',
    marginBottom:3,
  },
  listCount:{
    fontSize:13,
    color:'#aaa',
  },
  modalOverlay:{
    flex:1,
    backgroundColor:'rgba(0,0,0,0.6)',
    justifyContent:'center',
    alignItems:'center',
  },
  modalContent:{
    backgroundColor:'#1A1833',
    borderRadius:16,
    padding:24,
    width:'85%',
    maxWidth:340,
  },
  modalTitle:{
    fontSize:20,
    fontWeight:'bold',
    color:'#F2A8A8',
    marginBottom:16,
    textAlign:'center',
  },
  input:{
    backgroundColor:'#2A273F',
    borderRadius:10,
    padding:14,
    color:'#fff',
    fontSize:16,
    marginBottom:20,
  },
  modalButtons:{
    flexDirection:'row',
    gap:12,
  },
  cancelButton:{
    flex:1,
    paddingVertical:12,
    borderRadius:10,
    backgroundColor:'rgba(176,176,176,0.15)',
    alignItems:'center',
  },
  cancelButtonText:{
    color:'#aaa',
    fontWeight:'600',
    fontSize:15,
  },
  createButton:{
    flex:1,
    paddingVertical:12,
    borderRadius:10,
    backgroundColor:'#F2A8A8',
    alignItems:'center',
  },
  createButtonDisabled:{
    opacity:0.4,
  },
  createButtonText:{
    color:'#1B1935',
    fontWeight:'bold',
    fontSize:15,
  },
});
