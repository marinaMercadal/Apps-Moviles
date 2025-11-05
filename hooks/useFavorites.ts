import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://172.29.135.101:3000";

export interface FavMovie {
  id: string;
  title: string;
  posterUri?: string;
  releaseYear?: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const [favs, setFavs] = useState<FavMovie[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavoritesFromBackend = useCallback(async () => {
    if (!user) {
      setFavs([]);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const transformedFavs: FavMovie[] = data.map((fav: any) => ({
          id: fav.movieId || fav.id,
          title: fav.title || fav.movieTitle,
          posterUri: fav.posterPath ? `https://image.tmdb.org/t/p/w500${fav.posterPath}` : undefined,
          releaseYear: fav.releaseDate ? new Date(fav.releaseDate).getFullYear().toString() : undefined,
        }));
        setFavs(transformedFavs);
      } else {
        console.error("Error loading favorites from backend:", response.status);
        await loadFromLocalStorage();
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      await loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadFromLocalStorage = async () => {
    if (!user) return;
    try {
      const raw = await AsyncStorage.getItem(`favs:${user.id}`);
      if (raw) {
        setFavs(JSON.parse(raw));
      }
    } catch (error) {
      console.error("Error loading from local storage:", error);
    }
  };

  useEffect(() => {
    loadFavoritesFromBackend();
  }, [loadFavoritesFromBackend]);

  const isFavorite = (id: string) => favs.some((f) => f.id === id);

  const toggleFavorite = async (item: FavMovie) => {
    if (!user) {
      console.warn("User must be logged in to add favorites");
      return;
    }

    const exists = isFavorite(item.id);
    const optimisticFavs = exists
      ? favs.filter((f) => f.id !== item.id)
      : [item, ...favs];

    setFavs(optimisticFavs);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.error("No token found, saving locally only");
        await AsyncStorage.setItem(`favs:${user.id}`, JSON.stringify(optimisticFavs));
        return;
      }

      if (exists) {
        const response = await fetch(`${API_URL}/api/favorites/${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to remove favorite:", response.status, errorText);
          throw new Error(`Failed to remove favorite: ${response.status}`);
        }
      } else {
        const payload = {
          movieId: item.id,
          title: item.title,
          posterPath: item.posterUri?.replace("https://image.tmdb.org/t/p/w500", "") || null,
          releaseDate: item.releaseYear ? `${item.releaseYear}-01-01` : null,
        };

        const response = await fetch(`${API_URL}/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to add favorite:", response.status, errorText);
          throw new Error(`Failed to add favorite: ${response.status}`);
        }
      }

      await AsyncStorage.setItem(`favs:${user.id}`, JSON.stringify(optimisticFavs));
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setFavs(favs);
      try {
        await AsyncStorage.setItem(`favs:${user.id}`, JSON.stringify(optimisticFavs));
      } catch (storageError) {
        console.error("Error saving to local storage:", storageError);
      }
    }
  };

  return {
    favs,
    isFavorite,
    toggleFavorite,
    loading,
    refresh: loadFavoritesFromBackend,
  };
}
