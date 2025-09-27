import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";


const popularMovies = [
  {
    id: "1",
    title: "Viernes De Locos",
    poster: require("../assets/images/viernesDeLocos.png"),
    descripcion: "Una madre y su hija intercambian cuerpos por un día.",
    duracion: "97 min",
    anio: 2003,
    genero: "Comedia, Fantasía",
    actores: "Jamie Lee Curtis, Lindsay Lohan",
    edad: "+13",
  },
  {
    id: "2",
    title: "Homo Argentum",
    poster: require("../assets/images/homoArgentum.png"),
    descripcion: "Una sátira argentina que mezcla humor y reflexión.",
    duracion: "110 min",
    anio: 2022,
    genero: "Comedia, Drama",
    actores: "Actores argentinos varios",
    edad: "+16",
  },
  {
    id: "3",
    title: "Lilo y Stitch",
    poster: require("../assets/images/liloYStitch.jpg"),
    descripcion: "Una niña hawaiana adopta a una criatura alienígena fugitiva.",
    duracion: "85 min",
    anio: 2002,
    genero: "Animación, Familiar",
    actores: "Daveigh Chase, Chris Sanders",
    edad: "ATP",
  },
];

const reviews = [
  {
    id: "1",
    userName: "Martina Ruiz",
    movieTitle: "Homo Argentum",
    userAvatar: require("../assets/images/profile-placeholder.png"),
    moviePoster: require("../assets/images/homoArgentum.png"),
    rating: 4,
    comment: "Peliculon, no pare de reirme en toda la pelicula.",
  },
  {
    id: "2",
    userName: "Marina Mercadal",
    movieTitle: "Lilo y Stitch",
    userAvatar: require("../assets/images/profile-placeholder.png"),
    moviePoster: require("../assets/images/liloYStitch.jpg"),
    rating: 5,
    comment: "Imperdible, la verdad que me hice reconectar con la pelicula vieja.",
  },
  {
    id: "3",
    userName: "Carolina Suarez",
    movieTitle: "Viernes De Locos",
    userAvatar: require("../assets/images/profile-placeholder.png"),
    moviePoster: require("../assets/images/viernesDeLocos.png"),
    rating: 4,
    comment: "Muy buena película, ultra recomendable para ver con amigas y familia!",
  },
];

type Movie = {
  id: string;
  title: string;
  poster: any;
  descripcion: string;
  duracion: string;
  anio: number;
  genero: string;
  actores: string;
  edad: string;
};

export default function HomeScreen() {
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState<Movie | null>(null);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Bienvenida */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>¡Bienvenido a VEOVEO! </Text>
        <Text style={styles.welcomeSubText}>
          Descubrí las películas más populares y donde verlas
        </Text>
      </View>

      {/* Películas populares */}
      <View style={styles.popularSection}>
        <Text style={styles.genreTitle}>Películas Populares Este Mes</Text>
        <FlatList
          data={popularMovies}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              onPress={() => setPeliculaSeleccionada(item)}
            />
          )}
        />
      </View>

      {/* Modal de detalles */}
      <Modal
  visible={!!peliculaSeleccionada}
  transparent
  animationType="slide"
  onRequestClose={() => setPeliculaSeleccionada(null)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {/*  Botón de cierre en la esquina */}
     <Pressable
      style={styles.closeIcon}
      onPress={() => setPeliculaSeleccionada(null)}
    >
      <Ionicons name="close" style= {styles.closeIconIcon} />
    </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        {peliculaSeleccionada && (
          <>
            <Text style={styles.modalTitle}>
              {peliculaSeleccionada.title}
            </Text>
            <Image
              source={peliculaSeleccionada.poster}
              style={styles.modalPoster}
            />
            <Text style={styles.modalText}>
              <Text style={styles.bold}>Año:</Text> {peliculaSeleccionada.anio}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>Duración:</Text> {peliculaSeleccionada.duracion}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>Género:</Text> {peliculaSeleccionada.genero}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>Actores:</Text> {peliculaSeleccionada.actores}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.bold}>Edad:</Text> {peliculaSeleccionada.edad}
            </Text>
            <Text style={styles.modalText}>
              {peliculaSeleccionada.descripcion}
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  </View>
</Modal>

      {/* Reviews recientes */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Reviews Más Recientes</Text>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <Image source={review.userAvatar} style={styles.userAvatarLarge} />

            <View style={styles.reviewContent}>
              <Text style={styles.movieTitleReview}>{review.movieTitle}</Text>
              <Text style={styles.reviewBy}>
                <Text style={styles.reviewByGray}>Reseña de </Text>
                <Text style={styles.reviewByUser}>{review.userName}</Text>
              </Text>

              {/* Estrellas */}
              <StarRating rating={review.rating} />

              <Text style={styles.comment}>{review.comment}</Text>
            </View>

            <Image source={review.moviePoster} style={styles.moviePosterSmall} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

type MovieCardProps = {
  movie: any;
  onPress: () => void;
};

function MovieCard({ movie, onPress }: MovieCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 1.1, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.Image
        source={movie.poster}
        style={[styles.moviePoster, { transform: [{ scale }] }]}
      />
    </Pressable>
  );
}

type StarRatingProps = {
  rating: number;
};

function StarRating({ rating }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, index) =>
    index < rating ? "★" : "☆"
  );
  return <Text style={styles.stars}>{stars.join(" ")}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B1935",
    paddingHorizontal: 16,
  },
  welcomeSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  welcomeText: {
    color: "#F2A8A8",
    fontSize: 22,
    fontWeight: "bold",
  },
  welcomeSubText: {
    color: "#DDD",
    fontSize: 14,
    marginTop: 4,
  },
  popularSection: {
    height: 250,
    marginVertical: 10,
  },
  moviePoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 12,
  },
  genreTitle: {
    color: "#eeececff",
    fontSize: 18,
    marginBottom: 6,
    fontWeight: "bold",
  },

  //  Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxHeight: "80%", // scroll si el contenido es muy largo
  },
modalPoster: {
  width: "80%",
  height: "50%",    
  aspectRatio: 2 / 3,   // relación de pósters (ancho : alto)
  borderRadius: 8,
  alignSelf: "center",
  marginBottom: 10,
  resizeMode: "contain", 
},
modalTitle: {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 12,
  textAlign: "center",
  color: "#1B1935",         
  letterSpacing: 1.2,       //  más espacio entre letras
  textShadowColor: "rgba(0,0,0,0.25)", //  sombra sutil
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
},
  modalText: {
    fontSize: 14,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  closeIcon: {
  position: "absolute",
  top: 10,
  right: 10,
  zIndex: 1,
  padding: 6,
},
closeIconIcon: {
  fontSize: 26,
  color: "#2A273F", // rojo elegante
},

  // ⭐ Reviews
  reviewsSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    color: "#eeececff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reviewCard: {
    flexDirection: "row",
    backgroundColor: "#2A273F",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  userAvatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  reviewContent: {
    flex: 1,
    marginRight: 10,
  },
  movieTitleReview: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  reviewBy: {
    fontSize: 12,
    marginBottom: 4,
  },
  reviewByGray: {
    color: "#AAA",
  },
  reviewByUser: {
    color: "#F2A8A8",
    fontWeight: "bold",
  },
  stars: {
    color: "#d20404ff",
    fontSize: 14,
    marginBottom: 4,
  },
  comment: {
    color: "#DDD",
    fontSize: 14,
  },
  moviePosterSmall: {
    width: 60,
    height: 80,
    borderRadius: 6,
  },
});
