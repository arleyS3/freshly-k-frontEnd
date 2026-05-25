/**
 * Modelo: Producto
 * Define la estructura de un producto en el catálogo
 */

/**
 * Producto base del catálogo.
 * Representa un producto disponible en el sistema con su información visual y de estado.
 *
 * @typedef {Object} Producto
 * @property {string} nombre - Nombre del producto
 * @property {string} descripcion - Descripción detallada del producto
 * @property {string} [bgIcon] - URL o identificador del ícono de fondo del producto
 * @property {boolean} [urgent] - Indica si el producto es urgente o prioritario
 * @property {any} [icon] - Icono del producto (formato libre según el componente)
 * @property {string} [iconColor] - Color del icono en formato hexadecimal o nombre de color
 */
export interface Producto {
	nombre: string;
	descripcion: string;
	bgIcon?: string;
	urgent?: boolean;
	icon?: any;
	iconColor?: string;
}

/**
 * Detalle completo de un producto.
 * Extiende Producto con información de base de datos como ID, precio y fecha de creación.
 *
 * @typedef {Object} ProductoDetalle
 * @property {number} id - Identificador único del producto
 * @property {string} nombre - Nombre del producto
 * @property {string} descripcion - Descripción detallada del producto
 * @property {string} [bgIcon] - URL o identificador del ícono de fondo
 * @property {boolean} [urgent] - Indica si el producto es urgente
 * @property {any} [icon] - Icono del producto
 * @property {string} [iconColor] - Color del icono
 * @property {number} [precio] - Precio actual del producto
 * @property {string} [fecha_creacion] - Fecha de creación del producto en formato ISO
 */
export interface ProductoDetalle extends Producto {
	id: number;
	precio?: number;
	fecha_creacion?: string;
}

/**
 * Datos necesarios para crear un nuevo producto.
 * Solo incluye los campos obligatorios para la creación.
 *
 * @typedef {Object} ProductoCreateRequest
 * @property {string} nombre - Nombre del producto
 * @property {string} descripcion - Descripción del producto
 */
export interface ProductoCreateRequest {
	nombre: string;
	descripcion: string;
}
