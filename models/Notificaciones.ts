/**
 * Modelo: Notificaciones
 * Define la estructura de preferencias de notificaciones push.
 */

/**
 * Preferencias de notificaciones push del usuario.
 * Controla qué tipos de notificaciones recibe el usuario en el dispositivo.
 *
 * @typedef {Object} PreferenciasNotificaciones
 * @property {boolean} alertasVencimiento - Activa notificaciones cuando un producto está por vencer
 * @property {boolean} sugerenciasDiarias - Activa sugerencias diarias de recetas
 * @property {boolean} modoAhorro - Activa recomendaciones para ahorrar en compras
 */
export interface PreferenciasNotificaciones {
	alertasVencimiento: boolean;
	sugerenciasDiarias: boolean;
	modoAhorro: boolean;
}

export type { PreferenciasNotificaciones as PreferenciasNotificacionesType };
