import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApiBaseUrl } from './api';

const TOKEN_KEY = '@app_token';

// Manejo de SecureStore solo en nativo
let SecureStore: any = null;
if (Platform.OS !== 'web') {
    try {
        // eslint-disable-next-line global-require
        SecureStore = require('expo-secure-store');
    } catch (e) {
        SecureStore = null;
    }
}

/**
 * ApiClient
 * Cliente HTTP central usando axios que agrega:
 * - baseURL resuelta desde getApiBaseUrl
 * - timeout por defecto
 * - interceptor de request para añadir Authorization si existe token
 * - interceptor de response para normalizar errores y limpiar token en 401
 *
 * Exporta métodos get/post/put/delete que retornan la respuesta ya desestructurada
 */
class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: getApiBaseUrl(),
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Interceptor: agregar token a cada request
        this.client.interceptors.request.use(
            async (config) => {
                const token = await this.getStoredToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Interceptor: manejar errores de respuesta
        this.client.interceptors.response.use(
            (response) => response.data,
            (error: AxiosError<any>) => {
                if (error.response?.status === 401) {
                    // Token expirado o inválido
                    this.clearStoredToken().catch(console.warn);
                }

                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    'Error en la petición';

                return Promise.reject({
                    status: error.response?.status,
                    message: errorMessage,
                    data: error.response?.data,
                    originalError: error,
                });
            }
        );
    }

    /**
     * Lee el token persistido desde storage.
     *
     * Se usa en el interceptor para añadir Authorization automáticamente
     * y también desde AuthContext para restaurar la sesión al recargar.
     *
     * @returns {Promise<string | null>} Token JWT guardado o null si no existe
     */
    async getStoredToken(): Promise<string | null> {
        try {
            if (SecureStore && Platform.OS !== 'web') {
                return await SecureStore.getItemAsync(TOKEN_KEY);
            }
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.warn('Error retrieving token:', error);
            return null;
        }
    }

    /**
     * Persiste un token en storage (SecureStore en nativo, AsyncStorage en web).
     * @param token - Token JWT
     */
    async setToken(token: string): Promise<void> {
        try {
            if (SecureStore && Platform.OS !== 'web') {
                await SecureStore.setItemAsync(TOKEN_KEY, token);
            } else {
                await AsyncStorage.setItem(TOKEN_KEY, token);
            }
        } catch (error) {
            console.warn('Error saving token:', error);
        }
    }

    /**
     * Elimina el token persistido de storage.
     *
     * Se usa al cerrar sesión o cuando el backend responde 401.
     *
     * @returns {Promise<void>}
     */
    async clearStoredToken(): Promise<void> {
        try {
            if (SecureStore && Platform.OS !== 'web') {
                await SecureStore.deleteItemAsync(TOKEN_KEY);
            } else {
                await AsyncStorage.removeItem(TOKEN_KEY);
            }
        } catch (error) {
            console.warn('Error clearing token:', error);
        }
    }

    // Métodos públicos tipados
    async get<T = any>(url: string) {
        return this.client.get<any, T>(url);
    }

    async post<T = any>(url: string, data?: any) {
        return this.client.post<any, T>(url, data);
    }

    async put<T = any>(url: string, data?: any) {
        return this.client.put<any, T>(url, data);
    }

    async delete<T = any>(url: string) {
        return this.client.delete<any, T>(url);
    }
}

export const apiClient = new ApiClient();
