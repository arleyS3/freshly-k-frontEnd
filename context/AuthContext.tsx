import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../config/apiClient';
import { iniciarSesionService, registrarUsuarioService } from '../services/authService';
import { obtenerToken, registrarTokenEnBackend } from '../services/notificationService';
import {
	LoginResponse,
	RegisterRequest,
	AuthResponse,
	AuthContextType,
} from '../models/Auth';
import { Usuario } from '../models';

// ============================================================
// CONSTANTES
// ============================================================

const STORAGE_KEY_USER = '@app_user';
const STORAGE_KEY_PUSH_TOKEN = '@app_push_token';

/**
 * AuthContext
 * Contexto global que expone el estado de autenticación y los métodos
 * principales para iniciar/cerrar sesión y registrar usuarios.
 *
 * Uso:
 * const ctx = useAutenticacion();
 * ctx.iniciarSesion(email, password);
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// INTERFAZ LOCAL
// ============================================================

interface AuthProviderProps {
	children: ReactNode;
}

// ============================================================
// CONTROLLER: AuthProvider
// ============================================================

/**
 * AuthProvider
 * Proveedor de autenticación que actúa como controller en el patrón MVC.
 * Mantiene usuario, token y estado de carga; orquesta llamadas a services/api
 * y persiste datos en storage.
 *
 * Coloca el contexto accesible para toda la app:
 * <AuthProvider>{children}</AuthProvider>
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	// ========================================================
	// ESTADO
	// ========================================================

	const [usuario, setUsuario] = useState<Usuario | null>(null);
	const [tokenSesion, setTokenSesion] = useState<string | null>(null);
	const [cargando, setCargando] = useState<boolean>(true);

	// ========================================================
	// INICIALIZACIÓN: Restaurar sesión al montar
	// ========================================================

	/**
	 * useEffect: Restaurar sesión del usuario al iniciar la app
	 * Se ejecuta solo una vez al montar el componente
	 */
	useEffect(() => {
		let mounted = true;

		const restaurarSesion = async (): Promise<void> => {
			setCargando(true);
			try {
				// Recuperar token y usuario del storage local
				const [storedUserJson, storedToken] = await Promise.all([
					AsyncStorage.getItem(STORAGE_KEY_USER),
					apiClient.getStoredToken(),
				]);

				if (storedToken && mounted) {
					setTokenSesion(storedToken);
				}

				if (storedUserJson && mounted) {
					const parsedUser: Usuario = JSON.parse(storedUserJson);
					setUsuario(parsedUser);
				}

				// Intentar registrar push token si hay sesión restaurada (no bloqueante)
				if (storedToken && mounted) {
					registrarPushToken().catch(console.warn);
				}
			} catch (error) {
				console.warn('[Auth] Error restoring session:', error);
				// En caso de error, continuar sin usuario
			} finally {
				if (mounted) {
					setCargando(false);
				}
			}
		};

		restaurarSesion();

		return () => {
			mounted = false;
		};
	}, []);

	// ========================================================
	// FUNCIONES DE CONTROLADOR
	// ========================================================

    /**
     * iniciarSesion
     * Valida credenciales, llama al service, persiste token/usuario y actualiza estado.
     * @param email - Email del usuario (se normaliza a minúsculas)
     * @param password - Contraseña del usuario
     * @returns {Promise<AuthResponse>} Resultado con ok y posible mensaje de error
     */
    const iniciarSesion = useCallback(
		async (email: string, password: string): Promise<AuthResponse> => {
			try {
				// Validación básica
				if (!email?.trim() || !password?.trim()) {
					return {
						ok: false,
						message: 'Email y contraseña son requeridos',
					};
				}

                // Llamar servicio de autenticación (Services no manejan estado)
                const response = await iniciarSesionService(email.trim().toLowerCase(), password);

                // Extraer datos de respuesta
                const { token: accessToken, usuario_id, nombre, email: userEmail } = response;

				// Crear objeto de usuario
				const userObj: Usuario = {
					usuario_id,
					nombre,
					email: userEmail,
				};

				// Guardar token en apiClient (para futuros requests)
				await apiClient.setToken(accessToken);

				// Guardar usuario en storage persistente
				await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userObj));

				// Actualizar estado local
				setTokenSesion(accessToken);
				setUsuario(userObj);

				// Registrar push token después del login exitoso (no bloqueante)
				registrarPushToken().catch(console.warn);

				return { ok: true };
			} catch (error: any) {
				const errorMessage = error?.message || 'Error desconocido durante el login';
				console.warn('[Auth] SignIn error:', error);

				return {
					ok: false,
					message: errorMessage,
				};
			}
		},
		[]
	);

    /**
     * cerrarSesion
     * Elimina token/usuario del storage y limpia el estado local.
     */
    const cerrarSesion = useCallback(async (): Promise<void> => {
		try {
			// Limpiar storage
			await AsyncStorage.removeItem(STORAGE_KEY_USER);
			await apiClient.clearStoredToken();

			// Limpiar estado
			setTokenSesion(null);
			setUsuario(null);

			console.log('[Auth] User signed out successfully');
		} catch (error) {
			console.warn('[Auth] SignOut error:', error);
		}
	}, []);

    /**
     * registrarPushToken
     * Obtiene el Expo push token del dispositivo y lo registra en el backend.
     * Si ya existe un token almacenado (misma instalación), lo re-registra.
     * Si no, solicita permiso, obtiene el token y lo guarda localmente.
     */
    const registrarPushToken = useCallback(async (): Promise<void> => {
        try {
            // Verificar si ya registramos un token en esta instalación
            const existingToken = await AsyncStorage.getItem(STORAGE_KEY_PUSH_TOKEN);
            if (existingToken) {
                // Re-registrar token existente (backend deduplica)
                await registrarTokenEnBackend(existingToken);
                return;
            }

            const token = await obtenerToken();
            if (token) {
                await registrarTokenEnBackend(token);
                await AsyncStorage.setItem(STORAGE_KEY_PUSH_TOKEN, token);
            }
        } catch (error) {
            console.warn('[Auth] Error registering push token:', error);
        }
    }, []);

    /**
     * registrarUsuario
     * Valida y delega el registro al service. No hace auto-login.
     * @param data - Datos para crear la cuenta
     * @returns {Promise<AuthResponse>} Resultado del registro
     */
    const registrarUsuario = useCallback(
		async (data: RegisterRequest): Promise<AuthResponse> => {
			try {
				// Validación básica
				if (!data?.email?.trim() || !data?.password?.trim() || !data?.name?.trim()) {
					return {
						ok: false,
						message: 'Todos los campos son requeridos',
					};
				}

                // Llamar servicio de registro
                const response = await registrarUsuarioService(data);

                // Retornar respuesta sin hacer auto-login
                return {
                    ok: true,
                    data: response,
                };
			} catch (error: any) {
				const errorMessage = error?.message || 'Error desconocido durante el registro';
				console.warn('[Auth] Register error:', error);

				return {
					ok: false,
					message: errorMessage,
				};
			}
		},
		[]
	);

	// ========================================================
	// VALOR DEL CONTEXTO
	// ========================================================

	/**
	 * Valor que se proporciona al contexto
	 * Contiene estado y métodos de controlador
	 */
	const contextValue: AuthContextType = {
		usuario,
		tokenSesion,
		cargando,
		iniciarSesion,
		cerrarSesion,
		registrarUsuario,
		registrarPushToken,
	};

	// ========================================================
	// RENDERIZAR
	// ========================================================

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	);
};
