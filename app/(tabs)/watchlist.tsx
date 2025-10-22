import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function WatchlistScreen() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.container}>
        <Ionicons name="bookmark-outline" size={80} color="#F2A8A8" />
        <Text style={styles.title}>Ver Más Tarde</Text>
        <Text style={styles.subtitle}>
          Inicia sesión para guardar películas en tu lista
        </Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>Tu lista está vacía</Text>
      <Text style={styles.emptySubtext}>
        Explora películas y agrégalas a tu watchlist
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B1935",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: "#F2A8A8",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  loginButtonText: {
    color: "#1B1935",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
  },
});
