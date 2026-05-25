/**
 * Modelo: Api Response
 * Define la estructura genérica de respuestas de la API
 */

/**
 * Respuesta genérica de la API.
 * Envuelve todas las respuestas del backend con un indicador de éxito y datos opcionales.
 *
 * @template T - Tipo de los datos en caso de éxito
 * @typedef {Object} ApiResponse
 * @property {boolean} ok - Indica si la operación fue exitosa
 * @property {string} [message] - Mensaje informativo o de error
 * @property {T} [data] - Datos de la respuesta en caso de éxito
 * @property {number} [status] - Código de estado HTTP de la respuesta
 */
export interface ApiResponse<T = any> {
	ok: boolean;
	message?: string;
	data?: T;
	status?: number;
}

/**
 * Error devuelto o generado por la API.
 * Representa un error ocurrido durante una petición, con mensaje y estado opcional.
 *
 * @typedef {Object} ApiError
 * @property {number} [status] - Código de estado HTTP del error
 * @property {string} message - Mensaje descriptivo del error
 * @property {any} [data] - Datos adicionales del error devueltos por el backend
 * @property {Error} [originalError] - Error original de la librería HTTP (útil para depuración)
 */
export interface ApiError {
	status?: number;
	message: string;
	data?: any;
	originalError?: Error;
}
