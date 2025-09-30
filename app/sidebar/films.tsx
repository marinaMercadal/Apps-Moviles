import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Images } from "../../assets/images";

interface Movie{
  id:string;
  title:string;
  poster:any;
}

const moviesData={
  masRecientes:[
    {id:"1",title:"Materialists",poster:Images.materialists},
    {id:"2",title:"Highest 2 Lowest",poster:Images.highestLowest},
    {id:"3",title:"Hot Milk",poster:Images.hotMilk},
    {id:"4",title:"The Wrong Paris",poster:Images.wrongParis},
    {id:"5",title:"Weapons",poster:Images.weapons},
    {id:"6",title:"Gatillero",poster:Images.gatillero},
    {id:"7",title:"Ballerina",poster:Images.ballerina},
    {id:"8",title:"Death of a Unicorn",poster:Images.deathOfUnicorn},
    {id:"28",title:"Enemies",poster:Images.enemies}
  ],
  masBuscadas:[
    {id:"9",title:"French Lover",poster:Images.frenchLover},
    {id:"10",title:"I Know What You Did Last Summer",poster:Images.iKnowWhatYouDidLastSummer},
    {id:"11",title:"Enemies",poster:Images.enemies},
    {id:"12",title:"Lilo y Stitch",poster:Images.liloYStitch},
    {id:"13",title:"Los Sobrevivientes",poster:Images.homoArgentum},
    {id:"14",title:"El Bosque",poster:Images.viernesDeLocos},
  ],
  mejoresReviews:[
    {id:"15",title:"French Lover",poster:Images.frenchLover},
    {id:"16",title:"Death of a Unicorn",poster:Images.deathOfUnicorn},
    {id:"17",title:"Materialists",poster:Images.materialists},
    {id:"18",title:"Hot Milk",poster:Images.hotMilk},
    {id:"19",title:"Ballerina",poster:Images.ballerina},
  ],
  comedia:[
    {id:"20",title:"Lilo y Stitch",poster:Images.liloYStitch},
    {id:"21",title:"Viernes De Locos",poster:Images.viernesDeLocos},
    {id:"22",title:"The Wrong Paris",poster:Images.wrongParis},
    {id:"23",title:"Homo Argentum",poster:Images.homoArgentum},
  ],
  drama:[
    {id:"24",title:"I Know What You Did Last Summer",poster:Images.iKnowWhatYouDidLastSummer},
    {id:"25",title:"Enemies",poster:Images.enemies},
    {id:"26",title:"Weapons",poster:Images.weapons},
    {id:"27",title:"Gatillero",poster:Images.gatillero},
  ],
};

export default function PeliculasScreen(){
  const [filterModalVisible,setFilterModalVisible]=useState(false);
  const [selectedFilter,setSelectedFilter]=useState<string|null>(null);
  
  const filterOptions=[
    {key:"masRecientes",label:"Más recientes"},
    {key:"masBuscadas",label:"Más buscadas"},
    {key:"mejoresReviews",label:"Mejores Reviews"},
    {key:"comedia",label:"Comedia"},
    {key:"drama",label:"Drama"},
  ];

  const getFilteredMovies=()=>{
    if(!selectedFilter) return null;
    return moviesData[selectedFilter as keyof typeof moviesData];
  };

  const renderMovieItem=({item}:{item:Movie})=>(
    <TouchableOpacity style={styles.movieItem}>
      <Image source={item.poster} style={styles.moviePoster}/>
      <Text style={styles.movieTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderGridMovieItem=({item}:{item:Movie})=>(
    <TouchableOpacity style={styles.gridMovieItem}>
      <Image source={item.poster} style={styles.gridMoviePoster}/>
    </TouchableOpacity>
  );

  const renderCategory=(title:string,movies:Movie[])=>(
    <View style={styles.categoryContainer} key={title}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <FlatList
        data={movies}
        renderItem={renderMovieItem}
        keyExtractor={(item)=>item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moviesList}
      />
    </View>
  );

  const renderFilterModal=()=>(
    <Modal
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={()=>setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filtrar por:</Text>
          {filterOptions.map((option)=>(
            <TouchableOpacity
              key={option.key}
              style={styles.filterOption}
              onPress={()=>{
                setSelectedFilter(option.key);
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.filterOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.clearFilterOption}
            onPress={()=>{
              setSelectedFilter(null);
              setFilterModalVisible(false);
            }}
          >
            <Text style={styles.clearFilterText}>Ver todas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const filteredMovies=getFilteredMovies();

  return(
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>Películas</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={()=>setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={24} color="#F2A8A8"/>
          </TouchableOpacity>
        </View>
        
        {filteredMovies?(
          <View style={styles.gridContainer}>
            <Text style={styles.filterTitle}>
              {filterOptions.find(f=>f.key===selectedFilter)?.label}
            </Text>
            <FlatList
              data={filteredMovies}
              renderItem={renderGridMovieItem}
              keyExtractor={(item)=>item.id}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridMoviesList}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        ):(
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            {renderCategory("Más recientes:",moviesData.masRecientes)}
            {renderCategory("Más buscadas:",moviesData.masBuscadas)}
            {renderCategory("Mejores Reviews:",moviesData.mejoresReviews)}
            {renderCategory("Comedia:",moviesData.comedia)}
            {renderCategory("Drama:",moviesData.drama)}
          </ScrollView>
        )}
      </View>
      {renderFilterModal()}
    </View>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#1B1935",
  },
  content:{
    flex:1,
    paddingHorizontal:20,
    paddingTop:20,
  },
  categoriesContainer:{
    paddingBottom:100,
  },
  titleContainer:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:30,
  },
  screenTitle:{
    fontSize:32,
    fontWeight:"bold",
    color:"#F2A8A8",
    textAlign:"center",
    flex:1,
  },
  filterButton:{
    padding:8,
  },
  categoryContainer:{
    marginBottom:30,
  },
  categoryTitle:{
    fontSize:22,
    fontWeight:"600",
    color:"#FFFFFF",
    marginBottom:15,
    marginLeft:5,
  },
  moviesList:{
    paddingLeft:5,
  },
  movieItem:{
    marginRight:15,
    width:120,
  },
  moviePoster:{
    width:120,
    height:180,
    borderRadius:8,
    marginBottom:8,
  },
  movieTitle:{
    fontSize:14,
    color:"#B0B0B0",
    textAlign:"center",
    fontWeight:"500",
  },
  gridContainer:{
    flex:1,
  },
  filterTitle:{
    fontSize:24,
    fontWeight:"600",
    color:"#F2A8A8",
    marginBottom:20,
    textAlign:"center",
  },
  gridMoviesList:{
    paddingBottom:20,
  },
  gridRow:{
    justifyContent:"space-between",
    marginBottom:15,
  },
  gridMovieItem:{
    width:"32%",
    aspectRatio:2/3,
  },
  gridMoviePoster:{
    width:"100%",
    height:"100%",
    borderRadius:8,
  },
  modalOverlay:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.5)",
    justifyContent:"center",
    alignItems:"center",
  },
  modalContent:{
    backgroundColor:"#1A1833",
    borderRadius:15,
    padding:20,
    width:"80%",
    maxWidth:300,
  },
  modalTitle:{
    fontSize:20,
    fontWeight:"600",
    color:"#F2A8A8",
    marginBottom:20,
    textAlign:"center",
  },
  filterOption:{
    paddingVertical:15,
    paddingHorizontal:20,
    borderRadius:10,
    marginBottom:10,
    backgroundColor:"rgba(242,168,168,0.1)",
  },
  filterOptionText:{
    fontSize:16,
    color:"#FFFFFF",
    textAlign:"center",
  },
  clearFilterOption:{
    paddingVertical:15,
    paddingHorizontal:20,
    borderRadius:10,
    marginTop:10,
    backgroundColor:"rgba(176,176,176,0.2)",
  },
  clearFilterText:{
    fontSize:16,
    color:"#B0B0B0",
    textAlign:"center",
  },
});