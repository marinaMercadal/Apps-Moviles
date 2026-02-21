# VEOVEO — Grupo 6

App de reseñas de peliculas hecha con React Native y Expo
Sirve para descubrir peliculas, escribir reseñas, guardar a favoritos y manejar tu perfil

=================================

## Antes de empezar

Necesitás tener:
	•	Node 18 o más nuevo
	•	npm
	•	Expo CLI (npm install -g expo-cli)
	•	La app Expo Go instalada en tu celular
	•	El backend levantado y corriendo en tu red


=================================

## Cómo configurarlo

### 1. Instalar dependencias

npm install

### 2. Poner la IP del backend

En el archivo config.ts (esta en la raiz). cambia la IP por la de tu computadora:

export const API_ORIGIN = "http://TU_IP_LOCAL:3000";
export const API_URL = `${API_ORIGIN}/api`;


Ejemplo: si tu backend corre en 192.168.1.50, entonces:
"http://192.168.1.50:3000"


Para ver tu IP:
	•	Mac / Linux → ifconfig | grep "inet "
	•	Windows → ipconfig

El celular y la compu tienen que estar conectados al mismo wifi

=================================

## Como correr la app

npx expo start

Se abre el servidor de Expo
Despues abris Expo Go en el celular y escaneas el QR que aparece en la terminal y listo


=================================

## Que tiene la app

	•	Home → Películas populares del mes + reseñas recientes
	•	Buscar → Buscador con resultados en grilla y botón para agregar a favoritos
	•	Detalle → Poster, descripción, elenco, dónde verla, trailer y reseñas
	•	Favoritos → Lista de pelis guardadas (requiere login)
	•	Perfil → Estadísticas, favoritas y reseñas del usuario
	•	Ajustes → Cambiar nombre y avatar
	•	Login / Registro → Email y contraseña

---

## Tecnologias que usamos

	•	Expo / React Native → para la app
	•	expo-router → navegación por archivos
	•	AsyncStorage → guardar el token
	•	Ionicons → íconos
	•	React Native Reanimated → animaciones
