/**
 * Modelo: Historial de usuario
 * Representa los eventos de historial devueltos por la API.
 */

/**
 * Ítem individual del historial del usuario.
 * Representa una acción registrada sobre un producto en el sistema.
 *
 * @typedef {Object} HistorialUsuarioItem
 * @property {number} historial_id - Identificador único del evento de historial
 * @property {string} producto_nombre - Nombre del producto involucrado en el evento
 * @property {string} accion - Tipo de acción realizada (ej: "agregado", "eliminado", "vencido")
 * @property {string} fecha - Fecha y hora del evento en formato ISO
 */
export interface HistorialUsuarioItem {
  historial_id: number;
  producto_nombre: string;
  accion: string;
  fecha: string;
}
