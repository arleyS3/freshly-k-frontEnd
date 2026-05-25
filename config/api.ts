import { Platform } from "react-native";

// URL por defecto de producción (Railway)
const RAILWAY_BASE_URL =
  "https://freshly-api-k-ktor-production.up.railway.app/";
/**
 * getApiBaseUrl
 * Determina la base URL de la API según el entorno.
 * Prioridad:
 * 1. Variable de entorno EXPO_PUBLIC_API_BASE_URL (si está definida)
 * 2. En producción (no __DEV__) usar RAILWAY_BASE_URL
 * 3. En desarrollo seleccionar por plataforma (web, android, default)
 *
 * Devuelve la URL sin una barra final.
 *
 * @returns {string} Base URL de la API
 */
export function getApiBaseUrl() {
  const envBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || "").trim();
  if (envBaseUrl) return envBaseUrl.replace(/\/$/, "");

  // En release/producción usa Railway.
  if (!__DEV__) return RAILWAY_BASE_URL;

  // En dev, mantener comportamiento por plataforma.
  const selected = Platform.select({
    web: "http://localhost:8080",
    android: "https://freshly-api-k-ktor-production.up.railway.app/",
    default: `https://freshly-api-k-ktor-production.up.railway.app/`,
  });
  return String(selected).replace(/\/$/, "");
}

/**
 * API_BASE_URL
 * Constante exportada con el valor resuelto de getApiBaseUrl().
 */
export const API_BASE_URL = getApiBaseUrl();
