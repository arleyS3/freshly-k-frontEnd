/**
 * Modelo: Usuario
 * Define la estructura y tipos del Usuario en la aplicación
 */

import type { PreferenciasNotificaciones } from './Notificaciones';

/**
 * Usuario de la aplicación.
 * Representa la cuenta de un usuario registrado con sus datos personales y preferencias.
 *
 * @typedef {Object} Usuario
 * @property {number} usuario_id - Identificador único del usuario
 * @property {string} nombre - Nombre completo del usuario
 * @property {string} email - Correo electrónico del usuario
 * @property {PreferenciasNotificaciones} [preferencias] - Preferencias de notificaciones del usuario
 */
export interface Usuario {
	usuario_id: number;
	nombre: string;
	email: string;
	preferencias?: PreferenciasNotificaciones;
}

/**
 * Datos para crear una nueva cuenta de usuario.
 *
 * @typedef {Object} UsuarioCreateRequest
 * @property {string} nombre - Nombre completo del nuevo usuario
 * @property {string} email - Correo electrónico del nuevo usuario
 * @property {string} contra - Contraseña del nuevo usuario
 */
export interface UsuarioCreateRequest {
	nombre: string;
	email: string;
	contra: string;
}
