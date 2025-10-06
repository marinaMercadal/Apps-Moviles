import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import Toast from "react-native-root-toast";

export interface Movie {
  id: string;
  title: string;
  poster: any;
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loaded, setLoaded] = useState(false); // 🔹 Para evitar guardar antes de cargar

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem("@favorites");
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error al cargar favoritos", error);
      } finally {
        setLoaded(true);
      }
    };
    loadFavorites();
  }, []);

  const saveFavorites = async (newFavorites: Movie[]) => {
    try {
      await AsyncStorage.setItem("@favorites", JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Error al guardar favoritos", error);
    }
  };

  const toggleFavorite = (movie: Movie) => {
    if (!loaded) return; // 🚫 Evita guardar antes de que se cargue todo
    const exists = favorites.some((f) => f.id === movie.id);
    const updated = exists
      ? favorites.filter((f) => f.id !== movie.id)
      : [...favorites, movie];

    saveFavorites(updated);

    // 🩷 Mostrar toast con animación agradable
    Toast.show(exists ? "💔 Eliminada de tu lista" : "❤️ Agregada a tu lista", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      backgroundColor: "rgba(0,0,0,0.8)",
      textColor: "#fff",
      opacity: 0.9,
      shadow: true,
      animation: true,
    });
  };

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  return { favorites, toggleFavorite, isFavorite, loaded };
}
