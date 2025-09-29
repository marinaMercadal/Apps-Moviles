import React from "react";
import {
  FlatList,
  Image,
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
    {id:"1",title:"Weapons",poster:Images.weapons},
    {id:"2",title:"Gatillero",poster:Images.gatillero},
    {id:"3",title:"Dos Tumbas",poster:Images.liloYStitch},
  ],
  masBuscadas:[
    {id:"4",title:"Detrás de sus Ojos",poster:Images.viernesDeLocos},
    {id:"5",title:"Los Sobrevivientes",poster:Images.homoArgentum},
    {id:"6",title:"El Bosque",poster:Images.liloYStitch},
  ],
  mejoresReviews:[
    {id:"7",title:"Incontrolables",poster:Images.viernesDeLocos},
    {id:"8",title:"La Huésped",poster:Images.homoArgentum},
    {id:"9",title:"French Lover",poster:Images.liloYStitch},
  ],
  comedia:[
    {id:"10",title:"Viernes De Locos",poster:Images.viernesDeLocos},
    {id:"11",title:"Lilo y Stitch",poster:Images.liloYStitch},
    {id:"12",title:"Homo Argentum",poster:Images.homoArgentum},
  ],
  drama:[
    {id:"13",title:"El Padrino",poster:Images.viernesDeLocos},
    {id:"14",title:"Forrest Gump",poster:Images.homoArgentum},
    {id:"15",title:"Titanic",poster:Images.liloYStitch},
  ],
};

export default function PeliculasScreen(){
  const renderMovieItem=({item}:{item:Movie})=>(
    <TouchableOpacity style={styles.movieItem} onPress={()=>console.log("Movie pressed:",item.title)}>
      <Image source={item.poster} style={styles.moviePoster}/>
      <Text style={styles.movieTitle}>{item.title}</Text>
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

  return(
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.screenTitle}>Películas</Text>
        {renderCategory("Más recientes:",moviesData.masRecientes)}
        {renderCategory("Más buscadas:",moviesData.masBuscadas)}
        {renderCategory("Mejores Reviews:",moviesData.mejoresReviews)}
        {renderCategory("Comedia:",moviesData.comedia)}
        {renderCategory("Drama:",moviesData.drama)}
      </View>
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#1B1935",
  },
  content:{
    paddingHorizontal:20,
    paddingTop:20,
    paddingBottom:100,
  },
  screenTitle:{
    fontSize:32,
    fontWeight:"bold",
    color:"#F2A8A8",
    marginBottom:30,
    textAlign:"center",
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
});