import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

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
  const [deleteConfirmVisible,setDeleteConfirmVisible]=useState(false);
  const [listToDelete,setListToDelete]=useState<{id:number,name:string}|null>(null);
  const [deleting,setDeleting]=useState(false);
  const deleteModalScaleAnim=useRef(new Animated.Value(0)).current;
  const deleteModalOpacityAnim=useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(()=>{
      if(user){
        fetchLists();
      }
    },[user])
  );

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

  const findListName=(listId:number)=>{
    return lists.find(l=>l.id===listId)?.name||'lista';
  };

  const showDeleteConfirm=(listId:number)=>{
    const listName=findListName(listId);
    setListToDelete({id:listId,name:listName});
    setDeleteConfirmVisible(true);
    Animated.parallel([
      Animated.timing(deleteModalScaleAnim,{
        toValue:1,
        duration:300,
        easing:Easing.out(Easing.back(1.5)),
        useNativeDriver:true,
      }),
      Animated.timing(deleteModalOpacityAnim,{
        toValue:1,
        duration:300,
        useNativeDriver:true,
      }),
    ]).start();
  };

  const confirmDeleteList=async()=>{
    if(!listToDelete) return;
    try{
      setDeleting(true);
      const token=await getToken();
      const res=await fetch(`${API_URL}/lists/${listToDelete.id}`,{
        method:'DELETE',
        headers:{Authorization:`Bearer ${token}`},
      });
      if(res.ok){
        setLists(prev=>prev.filter(l=>l.id!==listToDelete.id));
        closeDeleteConfirm();
      }
    }catch(error){
      console.error('Error deleting list:',error);
    }finally{
      setDeleting(false);
    }
  };

  const closeDeleteConfirm=()=>{
    Animated.parallel([
      Animated.timing(deleteModalScaleAnim,{
        toValue:0,
        duration:200,
        useNativeDriver:true,
      }),
      Animated.timing(deleteModalOpacityAnim,{
        toValue:0,
        duration:200,
        useNativeDriver:true,
      }),
    ]).start(()=>{
      setDeleteConfirmVisible(false);
      setListToDelete(null);
    });
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
              onLongPress={()=>showDeleteConfirm(list.id)}
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

      <Modal
        transparent
        visible={deleteConfirmVisible}
        animationType="fade"
        onRequestClose={closeDeleteConfirm}
      >
        <View style={styles.deleteModalOverlay}>
          <Animated.View
            style={[
              styles.deleteModalContent,
              {
                transform:[{scale:deleteModalScaleAnim}],
                opacity:deleteModalOpacityAnim,
              },
            ]}
          >
            <View style={styles.deleteIconContainer}>
              <Ionicons name="trash-outline" size={40} color="#FF6B6B"/>
            </View>
            <Text style={styles.deleteModalTitle}>Eliminar Lista</Text>
            <Text style={styles.deleteModalSubtitle}>
              ¿Seguro que queres eliminar "{listToDelete?.name}"?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={closeDeleteConfirm}
                disabled={deleting}
              >
                <Text style={styles.deleteCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmDeleteList}
                disabled={deleting}
              >
                {deleting?(
                  <ActivityIndicator size="small" color="#fff"/>
                ):(
                  <Text style={styles.deleteConfirmButtonText}>Eliminar</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  container:{ flex:1, backgroundColor:'#1B1935' },
  header:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:16,
    paddingVertical:14,
    borderBottomWidth:1,
    borderBottomColor:'#2A273F',
  },
  backButton:{ padding:4 },
  headerTitle:{ fontSize:22, fontWeight:'bold', color:'#F2A8A8' },
  addButton:{ padding:4 },
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
  listContainer:{ padding:16, paddingBottom:40 },
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
  listInfo:{ flex:1 },
  listName:{ fontSize:17, fontWeight:'600', color:'#fff', marginBottom:3 },
  listCount:{ fontSize:13, color:'#aaa' },
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
  modalButtons:{ flexDirection:'row', gap:12 },
  cancelButton:{
    flex:1,
    paddingVertical:12,
    borderRadius:10,
    backgroundColor:'rgba(176,176,176,0.15)',
    alignItems:'center',
  },
  cancelButtonText:{ color:'#aaa', fontWeight:'600', fontSize:15 },
  createButton:{
    flex:1,
    paddingVertical:12,
    borderRadius:10,
    backgroundColor:'#F2A8A8',
    alignItems:'center',
  },
  createButtonDisabled:{ opacity:0.4 },
  createButtonText:{ color:'#1B1935', fontWeight:'bold', fontSize:15 },
  deleteModalOverlay:{
    flex:1,
    backgroundColor:'rgba(0,0,0,0.7)',
    justifyContent:'center',
    alignItems:'center',
  },
  deleteModalContent:{
    backgroundColor:'#1A1833',
    borderRadius:16,
    padding:24,
    width:'85%',
    maxWidth:340,
    alignItems:'center',
  },
  deleteIconContainer:{
    width:60,
    height:60,
    borderRadius:30,
    backgroundColor:'rgba(255,107,107,0.15)',
    justifyContent:'center',
    alignItems:'center',
    marginBottom:16,
  },
  deleteModalTitle:{
    fontSize:20,
    fontWeight:'bold',
    color:'#FF6B6B',
    marginBottom:8,
    textAlign:'center',
  },
  deleteModalSubtitle:{
    fontSize:14,
    color:'#aaa',
    textAlign:'center',
    marginBottom:24,
    lineHeight:20,
  },
  deleteModalButtons:{ flexDirection:'row', gap:12, width:'100%' },
  deleteCancelButton:{
    flex:1,
    paddingVertical:12,
    borderRadius:10,
    backgroundColor:'rgba(176,176,176,0.15)',
    alignItems:'center',
  },
  deleteCancelButtonText:{ color:'#aaa', fontWeight:'600', fontSize:15 },
  deleteConfirmButton:{
    flex:1,
    paddingVertical:12,
    borderRadius:10,
    backgroundColor:'#FF6B6B',
    alignItems:'center',
  },
  deleteConfirmButtonText:{ color:'#fff', fontWeight:'bold', fontSize:15 },
});