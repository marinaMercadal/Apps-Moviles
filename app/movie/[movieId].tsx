import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Images } from "../../assets/images";
import { API_ORIGIN, API_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = `${API_URL}/movies`;
const REVIEWS_BASE_URL = `${API_URL}/reviews`;
const IMG_URL = "https://image.tmdb.org/t/p/w500";

function AnimatedModal({
  visible, progress, scaleAnim, opacityAnim, onClose, type = "success", children,
}: {
  visible: boolean; progress: number; scaleAnim: Animated.Value; opacityAnim: Animated.Value;
  onClose: () => void; type?: "success" | "delete"; onConfirm?: () => void; children: React.ReactNode;
}) {
  const borderColor = type === "success" ? "#F2A8A8" : "#FF6B6B";
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.successModalOverlay}>
        <Animated.View style={[styles.borderContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.modalBorder, styles.borderTop, { width: `${Math.min(progress, 25) * 4}%`, backgroundColor: borderColor }]} />
          <View style={[styles.modalBorder, styles.borderRight, { height: progress > 25 ? `${Math.min((progress - 25) * 4, 100)}%` : "0%", backgroundColor: borderColor }]} />
          <View style={[styles.modalBorder, styles.borderBottom, { width: progress > 50 ? `${Math.min((progress - 50) * 4, 100)}%` : "0%", backgroundColor: borderColor }]} />
          <View style={[styles.modalBorder, styles.borderLeft, { height: progress > 75 ? `${Math.min((progress - 75) * 4, 100)}%` : "0%", backgroundColor: borderColor }]} />
          <View style={styles.successModalContent}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function StarRating({ rating }: { rating: number }) {
  return <Text style={styles.stars}>{"★".repeat(rating) + "☆".repeat(5 - rating)}</Text>;
}

function RatingBars({ value }: { value: number }) {
  const maxHeight = 48;
  const heights = [maxHeight * 0.3, maxHeight * 0.5, maxHeight * 0.7, maxHeight * 0.85, maxHeight];
  const bars = Array.from({ length: 5 }, (_, i) => ({ filled: i < Math.round(value), height: heights[i] }));
  return (
    <View style={styles.ratingBarsContainer}>
      {bars.map((bar, idx) => (
        <View key={idx} style={[styles.ratingBar, { height: bar.height }, bar.filled ? styles.ratingBarFilled : styles.ratingBarEmpty]} />
      ))}
    </View>
  );
}

function StarSelector({ rating, onRatingChange }: { rating: number; onRatingChange: (r: number) => void }) {
  return (
    <View style={styles.starSelector}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRatingChange(star)}>
          <Text style={[styles.selectableStar, { color: star <= rating ? "#d20404" : "#666" }]}>{"★"}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function MovieDetails() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [reviewSuccessVisible, setReviewSuccessVisible] = useState(false);
  const [reviewProgress, setReviewProgress] = useState(0);

  const [listsModalVisible, setListsModalVisible] = useState(false);
  const [userLists, setUserLists] = useState<any[]>([]);
  const [addingToList, setAddingToList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creatingNewList, setCreatingNewList] = useState(false);

  const [addToListSuccessVisible, setAddToListSuccessVisible] = useState(false);
  const [addToListProgress, setAddToListProgress] = useState(0);
  const addToListScaleAnim = useRef(new Animated.Value(0)).current;
  const addToListOpacityAnim = useRef(new Animated.Value(0)).current;

  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [deleteProgress, setDeleteProgress] = useState(0);

  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const deleteModalScaleAnim = useRef(new Animated.Value(0)).current;
  const deleteModalOpacityAnim = useRef(new Animated.Value(0)).current;
  const scrollTranslateY = useRef(new Animated.Value(0)).current;

  // ✅ Estado para modal "ya está en lista"
  const [alreadyInListVisible, setAlreadyInListVisible] = useState(false);
  const alreadyInListScaleAnim = useRef(new Animated.Value(0)).current;
  const alreadyInListOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (movieId) {
      fetchMovieData(movieId);
      fetchReviews(movieId);
    }
  }, [movieId]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      Animated.timing(scrollTranslateY, { toValue: -150, duration: 150, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
      Animated.timing(scrollTranslateY, { toValue: 0, duration: 150, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    if (reviewSuccessVisible) {
      Animated.parallel([
        Animated.timing(modalScaleAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(modalOpacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalScaleAnim, { toValue: 0, duration: 300, easing: Easing.in(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(modalOpacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [reviewSuccessVisible]);

  useEffect(() => {
    if (deleteConfirmationVisible) {
      Animated.parallel([
        Animated.timing(deleteModalScaleAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(deleteModalOpacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(deleteModalScaleAnim, { toValue: 0, duration: 300, easing: Easing.in(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(deleteModalOpacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [deleteConfirmationVisible]);

  useEffect(() => {
    if (addToListSuccessVisible) {
      Animated.parallel([
        Animated.timing(addToListScaleAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(addToListOpacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(addToListScaleAnim, { toValue: 0, duration: 300, easing: Easing.in(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(addToListOpacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [addToListSuccessVisible]);

  // ✅ useEffect para el modal "ya está en lista"
  useEffect(() => {
    if (alreadyInListVisible) {
      Animated.parallel([
        Animated.timing(alreadyInListScaleAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(alreadyInListOpacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(alreadyInListScaleAnim, { toValue: 0, duration: 300, easing: Easing.in(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(alreadyInListOpacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [alreadyInListVisible]);

  const fetchMovieData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const [detailsRes, castRes, similarRes, providersRes, videosRes] = await Promise.all([
        fetch(`${BASE_URL}/${id}`),
        fetch(`${BASE_URL}/${id}/credits`),
        fetch(`${BASE_URL}/${id}/similar`),
        fetch(`${BASE_URL}/${id}/watch/providers`),
        fetch(`${BASE_URL}/${id}/videos`),
      ]);
      if (!detailsRes.ok) throw new Error(`Details: ${detailsRes.status}`);
      if (!castRes.ok) throw new Error(`Cast: ${castRes.status}`);
      if (!similarRes.ok) throw new Error(`Similar: ${similarRes.status}`);
      if (!providersRes.ok) throw new Error(`Providers: ${providersRes.status}`);
      if (!videosRes.ok) throw new Error(`Videos: ${videosRes.status}`);
      const detailsData = await detailsRes.json();
      const castData = await castRes.json();
      const similarData = await similarRes.json();
      const providersData = await providersRes.json();
      const videosData = await videosRes.json();
      setMovie(detailsData);
      setCast(castData.cast?.slice(0, 5) || []);
      setSimilar(similarData.results?.slice(0, 10) || []);
      const flatrateProviders = providersData.results?.AR?.flatrate || [];
      setProviders(flatrateProviders);
      const trailer = videosData.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
      setTrailerKey(trailer?.key || null);
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Error fetching movie data:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const fetchReviews = async (id: string) => {
    try {
      const res = await fetch(`${REVIEWS_BASE_URL}?movieId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("❌ Error fetching reviews:", error);
    }
  };

  const submitReview = async () => {
    if (!user) { Alert.alert("Error", "Debes estar logueado para escribir una reseña"); return; }
    if (userRating === 0) { Alert.alert("Error", "Selecciona una calificación"); return; }
    if (userComment.trim().length === 0) { Alert.alert("Error", "Escribe un comentario"); return; }

    setSubmittingReview(true);
    setReviewProgress(0);
    Keyboard.dismiss();

    const progressInterval = setInterval(() => {
      setReviewProgress((prev) => { if (prev >= 85) { clearInterval(progressInterval); return prev; } return prev + Math.random() * 12; });
    }, 400);

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${REVIEWS_BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ movieId: Number(movieId), userId: user.id, rating: userRating, comment: userComment }),
      });
      const responseData = await res.json();
      clearInterval(progressInterval);
      if (res.ok) {
        setUserRating(0);
        setUserComment("");
        setSubmittingReview(false);
        setReviewProgress(0);
        const newReview = {
          id: responseData.id, movieId: Number(movieId), userId: user.id,
          rating: userRating, comment: userComment,
          user: { id: user.id, name: user.name, profileImage: user.profileImage },
        };
        setReviews([newReview, ...reviews]);
        setReviewSuccessVisible(true);
        const completionInterval = setInterval(() => {
          setReviewProgress((prev) => { if (prev >= 100) { clearInterval(completionInterval); return 100; } return prev + Math.random() * 40; });
        }, 80);
        setTimeout(() => {
          clearInterval(completionInterval);
          setReviewSuccessVisible(false);
          setReviewProgress(0);
          fetchReviews(movieId!);
        }, 1200);
      } else {
        setReviewProgress(0);
        setSubmittingReview(false);
        Alert.alert("Error", responseData.error || "No se pudo guardar la reseña");
      }
    } catch (error) {
      setReviewProgress(0);
      setSubmittingReview(false);
      Alert.alert("Error", "Ocurrió un error al guardar la reseña");
    }
  };

  const deleteReview = async (reviewId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      setDeleteProgress(0);
      const progressInterval = setInterval(() => {
        setDeleteProgress((prev) => { if (prev >= 85) { clearInterval(progressInterval); return prev; } return prev + Math.random() * 12; });
      }, 400);
      const res = await fetch(`${REVIEWS_BASE_URL}/${reviewId}`, {
        method: "DELETE",
        headers: { "Authorization": token ? `Bearer ${token}` : "", "Content-Type": "application/json" },
      });
      const responseData = await res.text();
      clearInterval(progressInterval);
      if (res.ok) {
        const completionInterval = setInterval(() => {
          setDeleteProgress((prev) => { if (prev >= 100) { clearInterval(completionInterval); return 100; } return prev + Math.random() * 40; });
        }, 80);
        setTimeout(() => {
          clearInterval(completionInterval);
          setReviews(reviews.filter(r => r.id !== reviewId));
          setDeleteConfirmationVisible(false);
          setReviewToDelete(null);
          setDeleteProgress(0);
        }, 1200);
      } else {
        setDeleteProgress(0);
        setDeleteConfirmationVisible(false);
        setReviewToDelete(null);
        Alert.alert("Error", `No se pudo eliminar la reseña (${res.status}): ${responseData}`);
      }
    } catch (error) {
      setDeleteProgress(0);
      setDeleteConfirmationVisible(false);
      setReviewToDelete(null);
      Alert.alert("Error", `Ocurrió un error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const fetchUserLists = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/lists`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setUserLists(data); }
    } catch (error) { console.error("Error fetching lists:", error); }
  };

  const addToList = async (listId: number) => {
    if (!movie) return;
    try {
      setAddingToList(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/lists/${listId}/movies`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: String(movie.id), title: movie.title, posterPath: movie.poster_path }),
      });

      if (res.ok) {
        setListsModalVisible(false);
        setAddToListProgress(0);
        setAddToListSuccessVisible(true);
        const progressInterval = setInterval(() => {
          setAddToListProgress((prev) => { if (prev >= 85) { clearInterval(progressInterval); return prev; } return prev + Math.random() * 12; });
        }, 400);
        setTimeout(() => {
          const completionInterval = setInterval(() => {
            setAddToListProgress((prev) => { if (prev >= 100) { clearInterval(completionInterval); return 100; } return prev + Math.random() * 40; });
          }, 80);
          setTimeout(() => { clearInterval(completionInterval); setAddToListSuccessVisible(false); setAddToListProgress(0); }, 1200);
        }, 0);
      } else {
        const data = await res.json();
        // ✅ Si ya está en la lista mostramos modal, sino Alert normal
        if (data.message?.toLowerCase().includes("ya está") || res.status === 409) {
          setListsModalVisible(false);
          setAlreadyInListVisible(true);
          setTimeout(() => setAlreadyInListVisible(false), 2500);
        } else {
          Alert.alert("Aviso", data.message || "No se pudo agregar");
        }
      }
    } catch (error) {
      console.error("Error adding to list:", error);
      Alert.alert("Error", "No se pudo agregar la película");
    } finally {
      setAddingToList(false);
    }
  };

  const createListAndAdd = async (listName: string) => {
    if (!movie || !listName.trim()) return;
    try {
      setCreatingNewList(true);
      const token = await AsyncStorage.getItem("token");
      const createRes = await fetch(`${API_URL}/lists`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: listName.trim() }),
      });
      if (createRes.ok) {
        const newList = await createRes.json();
        const addRes = await fetch(`${API_URL}/lists/${newList.id}/movies`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ movieId: String(movie.id), title: movie.title, posterPath: movie.poster_path }),
        });
        if (addRes.ok) {
          setNewListName("");
          setListsModalVisible(false);
          setAddToListProgress(0);
          setAddToListSuccessVisible(true);
          const progressInterval = setInterval(() => {
            setAddToListProgress((prev) => { if (prev >= 85) { clearInterval(progressInterval); return prev; } return prev + Math.random() * 12; });
          }, 400);
          setTimeout(() => {
            const completionInterval = setInterval(() => {
              setAddToListProgress((prev) => { if (prev >= 100) { clearInterval(completionInterval); return 100; } return prev + Math.random() * 40; });
            }, 80);
            setTimeout(() => { clearInterval(completionInterval); setAddToListSuccessVisible(false); setAddToListProgress(0); fetchUserLists(); }, 1200);
          }, 0);
        }
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la lista");
    } finally {
      setCreatingNewList(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F2A8A8" />
        <Text style={styles.loadingText}>Cargando película...</Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Error: {error || "Película no encontrada"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => movieId && fetchMovieData(movieId)}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avgRating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : "4.0";
  const trailerUrl = trailerKey
    ? `https://www.youtube.com/watch?v=${trailerKey}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title)} trailer`;

  const openTrailer = () => Linking.openURL(trailerUrl);

  return (
    <Animated.ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      style={{ transform: [{ translateY: scrollTranslateY }] }}
    >
      <View style={styles.topRow}>
        <Image source={{ uri: IMG_URL + movie.poster_path }} style={styles.posterLarge} />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.release_date?.slice(0, 4)}</Text>
          <Text style={styles.summary}>{movie.overview || "Sin descripción disponible."}</Text>
          {providers.length > 0 && (
            <View style={styles.whereToWatchRow}>
              <Text style={styles.whereToWatchLabel}>Dónde ver:</Text>
              <View style={styles.iconRow}>
                {providers.map((p: any) => {
                  const icon = p.provider_name.toLowerCase().includes("netflix") ? Images.netflix
                    : p.provider_name.toLowerCase().includes("hbo") ? Images.hbo
                    : p.provider_name.toLowerCase().includes("prime") ? Images.amazon : null;
                  if (!icon) return null;
                  return <Image key={p.provider_id} source={icon} style={styles.platformIcon} />;
                })}
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.trailerRow}>
        <TouchableOpacity onPress={openTrailer} style={styles.trailerWrapper}>
          <Image source={{ uri: IMG_URL + movie.poster_path }} style={styles.trailerLarge} />
          <View style={styles.trailerOverlay} />
          <Ionicons name="play-circle" size={60} color="white" style={styles.playIcon} />
        </TouchableOpacity>
        <View style={styles.ratingBlockRight}>
          <RatingBars value={Number(avgRating)} />
          <Text style={styles.ratingNumber}>{avgRating}</Text>
          <Text style={styles.ratingStarsText}>
            {"★".repeat(Math.round(Number(avgRating)))}{"☆".repeat(5 - Math.round(Number(avgRating)))}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {user && (
        <TouchableOpacity style={styles.addToListButton} onPress={() => { fetchUserLists(); setListsModalVisible(true); }}>
          <Ionicons name="list-outline" size={18} color="#1B1935" />
          <Text style={styles.addToListButtonText}>Agregar a lista</Text>
        </TouchableOpacity>
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Elenco</Text>
      <View style={styles.castCircleRow}>
        {cast.filter((actor) => actor.profile_path).map((actor) => (
          <View key={actor.id} style={styles.castCircle}>
            <Image source={{ uri: IMG_URL + actor.profile_path }} style={styles.castCirclePhoto} />
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Películas similares</Text>
      <FlatList
        horizontal showsHorizontalScrollIndicator={false} data={similar}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/movie/${item.id}`)} style={{ marginRight: 12 }}>
            <Image source={{ uri: IMG_URL + item.poster_path }} style={{ width: 120, height: 180, borderRadius: 12 }} />
            <Text style={{ color: "#FFF", width: 120, textAlign: "center", marginTop: 4 }} numberOfLines={1}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal transparent visible={listsModalVisible} animationType="fade" onRequestClose={() => setListsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar a lista</Text>
            {userLists.length > 0 && userLists.map((list: any) => (
              <TouchableOpacity key={list.id} style={styles.modalListItem} onPress={() => addToList(list.id)} disabled={addingToList}>
                <Ionicons name="film-outline" size={18} color="#F2A8A8" />
                <Text style={styles.modalListName}>{list.name}</Text>
                <Text style={styles.modalListCount}>{list._count.movies}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.newListSeparator} />
            <Text style={styles.newListTitle}>Crear nueva lista</Text>
            <TextInput
              style={styles.newListInput} placeholder="Nombre de la lista..." placeholderTextColor="#666"
              value={newListName} onChangeText={setNewListName} editable={!creatingNewList}
            />
            <TouchableOpacity
              style={[styles.newListButton, !newListName.trim() && styles.newListButtonDisabled]}
              onPress={() => createListAndAdd(newListName)} disabled={!newListName.trim() || creatingNewList}
            >
              {creatingNewList ? <ActivityIndicator size="small" color="#1B1935" /> : (
                <><Ionicons name="add" size={18} color="#1B1935" /><Text style={styles.newListButtonText}>Crear y agregar</Text></>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => { setListsModalVisible(false); setNewListName(""); }}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AnimatedModal visible={addToListSuccessVisible} progress={addToListProgress} scaleAnim={addToListScaleAnim} opacityAnim={addToListOpacityAnim} onClose={() => {}} type="success">
        <View style={styles.successIconContainer}><Ionicons name="checkmark-circle" size={80} color="#F2A8A8" /></View>
        <Text style={styles.successTitle}>¡Película agregada!</Text>
        <Text style={styles.successDescription}>Se agregó a tu lista correctamente</Text>
        <Text style={styles.progressText}>{addToListProgress === 100 ? "¡Listo!" : "Agregando..."}</Text>
      </AnimatedModal>

      {/* ✅ Modal "ya está en la lista" */}
      <AnimatedModal visible={alreadyInListVisible} progress={100} scaleAnim={alreadyInListScaleAnim} opacityAnim={alreadyInListOpacityAnim} onClose={() => setAlreadyInListVisible(false)} type="delete">
        <View style={styles.successIconContainer}><Ionicons name="alert-circle" size={80} color="#F2A8A8" /></View>
        <Text style={styles.successTitle}>¡Ya está en la lista!</Text>
        <Text style={styles.successDescription}>Esta película ya fue agregada a esta lista anteriormente</Text>
      </AnimatedModal>

      <AnimatedModal visible={reviewSuccessVisible} progress={reviewProgress} scaleAnim={modalScaleAnim} opacityAnim={modalOpacityAnim} onClose={() => {}} type="success">
        <View style={styles.successIconContainer}><Ionicons name="checkmark-circle" size={80} color="#F2A8A8" /></View>
        <Text style={styles.successTitle}>¡Reseña hecha con éxito!</Text>
        <Text style={styles.successDescription}>Tu opinión nos ayuda a mejorar</Text>
        <Text style={styles.progressText}>{reviewProgress === 100 ? "¡Listo!" : "Publicando..."}</Text>
      </AnimatedModal>

      <AnimatedModal visible={deleteConfirmationVisible} progress={deleteProgress} scaleAnim={deleteModalScaleAnim} opacityAnim={deleteModalOpacityAnim} onClose={() => setDeleteConfirmationVisible(false)} type="delete">
        <View style={styles.successIconContainer}><Ionicons name="trash-outline" size={80} color="#FF6B6B" /></View>
        <Text style={[styles.successTitle, { color: "#FF6B6B" }]}>¿Eliminar reseña?</Text>
        <Text style={styles.successDescription}>Esta acción no se puede deshacer</Text>
        <View style={styles.deleteButtonsContainer}>
          <TouchableOpacity style={styles.deleteModalCancelButton} onPress={() => setDeleteConfirmationVisible(false)}>
            <Text style={styles.deleteModalCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteModalConfirmButton} onPress={() => { if (reviewToDelete) deleteReview(reviewToDelete); }}>
            <Text style={styles.deleteModalConfirmText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.progressText}>{deleteProgress === 100 ? "¡Listo!" : deleteProgress > 0 ? "Eliminando..." : ""}</Text>
      </AnimatedModal>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Reseñas</Text>

      {user && (
        <View style={[styles.addReviewContainer, keyboardVisible && styles.addReviewContainerShift]}>
          <Text style={styles.addReviewTitle}>Tu reseña</Text>
          <StarSelector rating={userRating} onRatingChange={setUserRating} />
          <TextInput
            style={styles.commentInput} placeholder="Escribe tu comentario..." placeholderTextColor="#666"
            value={userComment} onChangeText={setUserComment} multiline maxLength={500}
          />
          <Text style={styles.charCount}>{userComment.length}/500</Text>
          <TouchableOpacity style={[styles.submitButton, submittingReview && styles.submitButtonDisabled]} onPress={submitReview} disabled={submittingReview}>
            {submittingReview ? <ActivityIndicator size="small" color="#1B1935" /> : <Text style={styles.submitButtonText}>Publicar reseña</Text>}
          </TouchableOpacity>
        </View>
      )}

      {!user && (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>Inicia sesión para escribir una reseña</Text>
        </View>
      )}

      <View style={styles.divider} />
      <View style={styles.reviewsSection}>
        {reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <TouchableOpacity onPress={() => { if (review.user?.id) router.push(`/profile/${review.user.id}`); }}>
                <Image
                  source={review.user?.profileImage?.url ? { uri: `${API_ORIGIN}${review.user.profileImage.url}` } : Images.profilePlaceholder}
                  style={styles.userAvatarLarge}
                />
              </TouchableOpacity>
              <View style={styles.reviewContent}>
                <Text style={styles.movieTitleReview}>{movie.title}</Text>
                <TouchableOpacity onPress={() => { if (review.user?.id) router.push(`/profile/${review.user.id}`); }}>
                  <Text style={styles.reviewBy}>
                    <Text style={styles.reviewByGray}>Reseña de </Text>
                    <Text style={styles.reviewByUser}>{review.user?.name || "Usuario"}</Text>
                  </Text>
                </TouchableOpacity>
                <StarRating rating={review.rating} />
                <Text style={styles.comment}>{review.comment}</Text>
              </View>
              {user && review.user?.id === user.id && (
                <TouchableOpacity style={styles.deleteButton} onPress={() => { setReviewToDelete(review.id); setDeleteConfirmationVisible(true); }}>
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>No hay reseñas aún. ¡Sé el primero!</Text>
        )}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "stretch", backgroundColor: "#1B1935", padding: 20, paddingBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1B1935" },
  loadingText: { color: "#DDD", marginTop: 10, fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1B1935", padding: 20 },
  errorText: { color: "#FF6B6B", fontSize: 16, textAlign: "center", marginBottom: 20 },
  retryButton: { backgroundColor: "#F2A8A8", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  retryButtonText: { color: "#1B1935", fontWeight: "bold", fontSize: 14 },
  topRow: { flexDirection: "row", width: "100%", marginBottom: 16, gap: 12 },
  posterLarge: { width: 120, height: 180, borderRadius: 12 },
  headerInfo: { flex: 1 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginBottom: 2 },
  year: { color: "#FFF", fontSize: 15, fontWeight: "400", marginBottom: 6 },
  summary: { color: "#CCC", fontSize: 13, lineHeight: 17, marginBottom: 8 },
  trailerRow: { flexDirection: "row", width: "100%", gap: 12, marginBottom: 16 },
  trailerWrapper: { position: "relative" },
  trailerLarge: { width: 220, height: 140, borderRadius: 12 },
  trailerOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 12 },
  playIcon: { position: "absolute", top: "50%", left: "50%", marginLeft: -30, marginTop: -30 },
  ratingBlockRight: { justifyContent: "center", alignItems: "flex-start" },
  ratingNumber: { color: "#FFF", fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  ratingStarsText: { color: "#d20404", fontSize: 22, fontWeight: "bold", letterSpacing: 2, marginBottom: 4 },
  ratingBarsContainer: { flexDirection: "row", alignItems: "flex-end", height: 48, marginBottom: 4 },
  ratingBar: { width: 8, marginHorizontal: 2, borderRadius: 2, alignSelf: "flex-end" },
  ratingBarFilled: { backgroundColor: "#d20404ff" },
  ratingBarEmpty: { backgroundColor: "#949191ff" },
  whereToWatchRow: { flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 8, gap: 8 },
  whereToWatchLabel: { color: "#FFF", fontSize: 13, fontWeight: "bold" },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  platformIcon: { width: 26, height: 26, borderRadius: 11, borderWidth: 1, borderColor: "#444" },
  divider: { width: "100%", height: 1, backgroundColor: "#18162c", opacity: 0.7, marginVertical: 8 },
  castCircleRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 16, width: "100%" },
  castCircle: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  castCirclePhoto: { width: 48, height: 48, borderRadius: 24 },
  sectionTitle: { color: "#eeececff", fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  addReviewContainer: { backgroundColor: "#2A273F", borderRadius: 10, padding: 16, marginBottom: 16 } as any,
  addReviewContainerShift: { marginBottom: 300 } as any,
  addReviewTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  starSelector: { flexDirection: "row", gap: 8, marginBottom: 12 },
  selectableStar: { fontSize: 28 },
  commentInput: { backgroundColor: "#1B1935", borderRadius: 8, padding: 12, color: "#FFF", borderWidth: 1, borderColor: "#444", marginBottom: 8, maxHeight: 100 },
  charCount: { color: "#999", fontSize: 12, marginBottom: 12, textAlign: "right" },
  submitButton: { backgroundColor: "#F2A8A8", borderRadius: 8, padding: 12, alignItems: "center" },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#1B1935", fontWeight: "bold", fontSize: 14 },
  loginPrompt: { backgroundColor: "#2A273F", borderRadius: 10, padding: 16, marginBottom: 16, alignItems: "center" },
  loginPromptText: { color: "#999", fontSize: 14 },
  reviewsSection: { marginVertical: 20, width: "100%" },
  noReviewsText: { color: "#999", fontSize: 14, textAlign: "center", paddingVertical: 20 },
  reviewCard: { flexDirection: "row", backgroundColor: "#2A273F", borderRadius: 10, padding: 12, marginBottom: 12, alignItems: "flex-start" },
  deleteButton: { padding: 8, marginLeft: 8 },
  userAvatarLarge: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  reviewContent: { flex: 1 },
  movieTitleReview: { color: "#FFF", fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  reviewBy: { fontSize: 12, marginBottom: 4 },
  reviewByGray: { color: "#AAA" },
  reviewByUser: { color: "#F2A8A8", fontWeight: "bold" },
  stars: { color: "#d20404ff", fontSize: 14, marginBottom: 4 },
  comment: { color: "#DDD", fontSize: 14 },
  addToListButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#F2A8A8", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  addToListButtonText: { color: "#1B1935", fontWeight: "bold", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#1A1833", borderRadius: 16, padding: 24, width: "85%", maxWidth: 340 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#F2A8A8", marginBottom: 16, textAlign: "center" },
  modalEmpty: { color: "#aaa", fontSize: 14, textAlign: "center", marginBottom: 16 },
  modalListItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "rgba(242,168,168,0.1)", marginBottom: 8, gap: 10 },
  modalListName: { flex: 1, color: "#fff", fontSize: 15 },
  modalListCount: { color: "#aaa", fontSize: 13 },
  modalCancelButton: { marginTop: 8, paddingVertical: 10, alignItems: "center" },
  modalCancelText: { color: "#aaa", fontSize: 15 },
  newListSeparator: { height: 1, backgroundColor: "#2A273F", marginVertical: 16 },
  newListTitle: { fontSize: 14, fontWeight: "600", color: "#F2A8A8", marginBottom: 8 },
  newListInput: { backgroundColor: "#2A273F", borderRadius: 10, padding: 12, color: "#fff", marginBottom: 10, fontSize: 14 },
  newListButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#F2A8A8", borderRadius: 10, paddingVertical: 12, marginBottom: 8, gap: 8 },
  newListButtonDisabled: { opacity: 0.5 },
  newListButtonText: { color: "#1B1935", fontWeight: "600", fontSize: 14 },
  successModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  borderContainer: { position: "relative", width: 340, alignItems: "center" },
  successModalContent: { backgroundColor: "#1A1833", borderRadius: 20, padding: 32, width: 340, alignItems: "center", marginTop: 3 },
  successIconContainer: { marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: "bold", color: "#F2A8A8", marginBottom: 8, textAlign: "center" },
  successDescription: { fontSize: 14, color: "#AAA", textAlign: "center", marginBottom: 20, fontStyle: "italic" },
  progressText: { fontSize: 12, color: "#F2A8A8", fontWeight: "600", textAlign: "center", marginTop: 4 },
  modalBorder: { borderRadius: 2, zIndex: 10 },
  borderTop: { position: "absolute", top: 0, left: 0, height: 3 },
  borderRight: { position: "absolute", right: 0, top: 0, width: 3 },
  borderBottom: { position: "absolute", bottom: 0, left: 0, height: 3 },
  borderLeft: { position: "absolute", left: 0, bottom: 0, width: 3 },
  deleteButtonsContainer: { flexDirection: "row", gap: 12, width: "100%", marginBottom: 8 },
  deleteModalCancelButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "rgba(255, 107, 107, 0.1)", alignItems: "center", borderWidth: 1, borderColor: "#FF6B6B" },
  deleteModalCancelText: { color: "#FF6B6B", fontSize: 14, fontWeight: "600" },
  deleteModalConfirmButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#FF6B6B", alignItems: "center" },
  deleteModalConfirmText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
});