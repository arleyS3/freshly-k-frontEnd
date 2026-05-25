/**
 * Modelo: ProductoBusqueda
 * Define la forma de respuesta del endpoint de búsqueda de productos.
 */

/**
 * Resultado de búsqueda de productos.
 * Devuelto por el endpoint de búsqueda, incluye información del producto y datos para visualización.
 *
 * @typedef {Object} ProductoBusqueda
 * @property {number} producto_id - Identificador único del producto
 * @property {string} nombre - Nombre del producto
 * @property {string | null} imagen_url - URL de la imagen del producto, o null si no tiene
 * @property {string} keywords - Palabras clave asociadas al producto para búsqueda
 * @property {string} [descripcion] - Descripción del producto
 * @property {string} [category] - Categoría del producto
 * @property {string} [bgIcon] - URL o identificador del ícono de fondo
 * @property {any} [icon] - Icono del producto (formato libre)
 * @property {boolean} [urgent] - Indica si el producto es urgente
 */
export interface ProductoBusqueda {
	producto_id: number;
	nombre: string;
	imagen_url: string | null;
	keywords: string;
	descripcion?: string;
	category?: string;
	bgIcon?: string;
	icon?: any;
	urgent?: boolean;
}
