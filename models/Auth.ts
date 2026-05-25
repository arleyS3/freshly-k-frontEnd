/**
 * Modelo: Auth
 * Define los tipos y respuestas de autenticación en la aplicación
 *
 * @module models/Auth
 */

import { Usuario } from './Usuario';

// ============================================================
// REQUEST TYPES
// ============================================================

/**
 * Datos para iniciar sesión
 * @typedef {Object} LoginRequest
 * @property {string} email - Email del usuario
 * @property {string} contra - Contraseña del usuario
 */
export interface LoginRequest {
	email: string;
	contra: string;
}

/**
 * Datos para registrar un nuevo usuario
 * @typedef {Object} RegisterRequest
 * @property {string} email - Email del nuevo usuario
 * @property {string} password - Contraseña
 * @property {string} name - Nombre del usuario
 */
export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
}

// ============================================================
// RESPONSE TYPES
// ============================================================

/**
 * Respuesta exitosa del login
 * Contiene el token JWT y datos del usuario
 *
 * @typedef {Object} LoginResponse
 * @property {string} token - Token JWT para autenticación
 * @property {number} usuario_id - ID del usuario
 * @property {string} nombre - Nombre completo del usuario
 * @property {string} email - Email del usuario
 */
export interface LoginResponse {
	token: string;
	usuario_id: number;
	nombre: string;
	email: string;
}

/**
 * Respuesta genérica de API de autenticación
 * Estructura uniforme para todas las respuestas
 *
 * @template T - Tipo de datos en caso de éxito
 * @typedef {Object} AuthResponse
 * @property {boolean} ok - Indica si la operación fue exitosa
 * @property {string} [message] - Mensaje de error (si ok=false) o mensaje informativo
 * @property {T} [data] - Datos adicionales según la operación
 *
 * @example
 * const response: AuthResponse = {
 *   ok: true,
 *   data: usuarioData
 * };
 *
 * const error: AuthResponse = {
 *   ok: false,
 *   message: 'Email o contraseña incorrectos'
 * };
 */
export interface AuthResponse<T = any> {
	ok: boolean;
	message?: string;
	data?: T;
}

// ============================================================
// CONTEXT TYPE
// ============================================================

/**
 * Tipo del contexto de autenticación
 * Define la interfaz que proporciona AuthContext
 *
 * @typedef {Object} AuthContextType
 * @property {Usuario | null} user - Usuario actualmente autenticado (null si no est autenticado)
 * @property {string | null} token - Token JWT del usuario (null si no está autenticado)
 * @property {boolean} loading - Indica si se está restaurando la sesión
 * @property {Function} signIn - Función para iniciar sesión
 * @property {Function} signOut - Función para cerrar sesión
 * @property {Function} register - Función para registrarse
 *
 * @example
 * const { usuario, tokenSesion, cargando, iniciarSesion, cerrarSesion } = useAutenticacion();
 */
export interface AuthContextType {
	/** Usuario actualmente autenticado */
	usuario: Usuario | null;

	/** Token JWT para peticiones autenticadas */
	tokenSesion: string | null;

	/** true mientras se restaura la sesión, false cuando está lista */
	cargando: boolean;

	/**
	 * Iniciar sesión
	 * @param {string} email - Email del usuario
	 * @param {string} password - Contraseña
	 * @returns {Promise<AuthResponse>} Resultado del login
	 */
	iniciarSesion: (email: string, password: string) => Promise<AuthResponse>;

	/**
	 * Cerrar sesión
	 * @returns {Promise<void>}
	 */
	cerrarSesion: () => Promise<void>;

	/**
	 * Registrar nuevo usuario
	 * @param {RegisterRequest} data - Datos del nuevo usuario
	 * @returns {Promise<AuthResponse>} Resultado del registro
	 */
	registrarUsuario: (data: RegisterRequest) => Promise<AuthResponse>;

	/**
	 * Registrar push token para notificaciones
	 * Obtiene el Expo push token del dispositivo y lo registra en el backend.
	 * @returns {Promise<void>}
	 */
	registrarPushToken: () => Promise<void>;
}
