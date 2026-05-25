import { apiClient } from '../config/apiClient';
import { LoginResponse, RegisterRequest } from '../models/Auth';

/**
 * Servicio de autenticación
 * Contiene llamadas HTTP puras relacionadas con autenticación.
 * No modifica estado ni UI.
 */

/**
 * Inicia sesión contra la API y retorna la respuesta cruda.
 * @param {string} email - Email del usuario (ya normalizado si es necesario)
 * @param {string} contra - Contraseña del usuario
 * @returns {Promise<LoginResponse>} Datos devueltos por la API (token y datos de usuario)
 * @throws Lanzará si la petición HTTP falla (manejar en el controller o catch del llamador)
 */
export async function iniciarSesionService(email: string, contra: string): Promise<LoginResponse> {
  const payload = { email, contra };
  return apiClient.post<LoginResponse>('/api/auth/login', payload);
}

/**
 * Registra un nuevo usuario en el backend.
 * @param {RegisterRequest} datos - Datos para crear el usuario
 * @returns {Promise<any>} Respuesta cruda del backend
 * @throws Lanzará si la petición HTTP falla
 */
export async function registrarUsuarioService(datos: RegisterRequest): Promise<any> {
  const payload = {
    nombre: datos.name.trim(),
    email: datos.email.trim().toLowerCase(),
    contra: datos.password,
  };

  return apiClient.post('/api/auth/register', payload);
}
