/**
 * Modelo: Inventario
 * Define la estructura del inventario de productos del usuario
 */

/**
 * Ítem del inventario del usuario.
 * Representa un producto registrado en el inventario personal con su estado y fechas.
 *
 * @typedef {Object} Inventario
 * @property {number} id - Identificador único del ítem en el inventario
 * @property {string} [nombre_personalizado] - Nombre personalizado que el usuario le asignó al producto
 * @property {string} [fecha_vencimiento] - Fecha de vencimiento del producto en formato ISO
 * @property {string} [estado] - Estado del producto (ej: "bueno", "por_vencer", "vencido")
 * @property {Object} [producto] - Información resumida del producto asociado
 * @property {string} producto.nombre - Nombre del producto
 * @property {string} [producto.descripcion] - Descripción del producto
 */
export interface Inventario {
	id: number;
	nombre_personalizado?: string;
	fecha_vencimiento?: string;
	estado?: string;
	producto?: {
		nombre: string;
		descripcion?: string;
	};
}

/**
 * Datos para agregar un nuevo ítem al inventario.
 * Todos los campos son opcionales; al menos producto_id o nombre_personalizado debe enviarse.
 *
 * @typedef {Object} InventarioCreateRequest
 * @property {number} [producto_id] - ID del producto a agregar
 * @property {string} [nombre_personalizado] - Nombre personalizado visible para el usuario
 * @property {string} [fecha_vencimiento] - Fecha de vencimiento del producto
 * @property {string} [estado] - Estado inicial del producto
 */
export interface InventarioCreateRequest {
	producto_id?: number;
	nombre_personalizado?: string;
	fecha_vencimiento?: string;
	estado?: string;
}

/**
 * Datos para actualizar un ítem existente del inventario.
 * Todos los campos son opcionales; solo se envían los que cambian.
 *
 * @typedef {Object} InventarioUpdateRequest
 * @property {string} [nombre_personalizado] - Nuevo nombre personalizado
 * @property {string} [fecha_vencimiento] - Nueva fecha de vencimiento
 * @property {string} [estado] - Nuevo estado del producto
 */
export interface InventarioUpdateRequest {
	nombre_personalizado?: string;
	fecha_vencimiento?: string;
	estado?: string;
}

/**
 * Producto del inventario devuelto por el endpoint /api/inventario/usuario/:usuarioId.
 * Incluye datos del producto con información calculada como días restantes.
 * Los campos están en camelCase (mapeo desde snake_case del backend).
 *
 * @typedef {Object} InventarioUsuarioProducto
 * @property {number} inventarioId - ID del ítem en el inventario
 * @property {number} productoId - ID del producto asociado
 * @property {string | null} nombrePersonalizado - Nombre personalizado asignado por el usuario, o null si no tiene
 * @property {string} nombreProducto - Nombre oficial del producto
 * @property {number} diasRestantes - Días que restan hasta el vencimiento (negativo si ya venció)
 * @property {string | null} imagenUrl - URL de la imagen del producto, o null si no tiene
 */
export interface InventarioUsuarioProducto {
	inventarioId: number;
	productoId: number;
	nombrePersonalizado: string | null;
	nombreProducto: string;
	diasRestantes: number;
	imagenUrl: string | null;
}

/**
 * Respuesta completa del endpoint de inventario por usuario.
 * Agrupa los productos y el conteo de los próximos a vencer.
 *
 * @typedef {Object} InventarioUsuarioResponse
 * @property {InventarioUsuarioProducto[]} productos - Lista de productos en el inventario del usuario
 * @property {number} porVencer - Cantidad de productos próximos a vencer
 */
export interface InventarioUsuarioResponse {
	productos: InventarioUsuarioProducto[];
	porVencer: number;
}

/**
 * Detalle completo de un ítem del inventario.
 * Respuesta del endpoint /api/inventario/:id con información ampliada.
 *
 * @typedef {Object} InventarioDetalleResponse
 * @property {number} inventario_id - ID del ítem en el inventario
 * @property {string} fecha_compra - Fecha de compra del producto en formato ISO
 * @property {string} fecha_vencimiento - Fecha de vencimiento del producto en formato ISO
 * @property {string} tipo_almacenamiento - Tipo de almacenamiento (ej: "nevera", "despensa", "congelador")
 * @property {number} tiempo_restante - Días restantes hasta el vencimiento
 */
export interface InventarioDetalleResponse {
	inventario_id: number;
	fecha_compra: string;
	fecha_vencimiento: string;
	tipo_almacenamiento: string;
	tiempo_restante: number;
}

/**
 * Payload para editar un ítem del inventario.
 * Todos los campos son opcionales; solo se envían los que cambian.
 *
 * @typedef {Object} InventarioDetalleUpdateRequest
 * @property {string} [fecha_compra] - Nueva fecha de compra
 * @property {string} [fecha_vencimiento] - Nueva fecha de vencimiento
 * @property {string} [tipo_almacenamiento] - Nuevo tipo de almacenamiento
 */
export interface InventarioDetalleUpdateRequest {
	fecha_compra?: string;
	fecha_vencimiento?: string;
	tipo_almacenamiento?: string;
}
