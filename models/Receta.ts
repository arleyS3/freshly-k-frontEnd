/**
 * Modelo: Receta
 * Define la estructura de datos para recetas sugeridas y detalle de recetas
 * Mapeo camelCase desde snake_case del backend de Spoonacular
 */

/**
 * Ingrediente básico utilizado en recetas sugeridas.
 * Contiene información visual junto con la cantidad como texto.
 *
 * @typedef {Object} Ingrediente
 * @property {number} id - Identificador único del ingrediente en Spoonacular
 * @property {string} nombre - Nombre del ingrediente
 * @property {string} imagenUrl - URL de la imagen del ingrediente
 * @property {string} cantidad - Cantidad del ingrediente como texto (ej: "2 tazas", "1 cucharada")
 */
export interface Ingrediente {
  id: number;
  nombre: string;
  imagenUrl: string;
  cantidad: string;
}

/**
 * Ingrediente con detalle numérico para recetas completas.
 * Incluye cantidad numérica y unidad de medida.
 *
 * @typedef {Object} IngredienteDetalle
 * @property {number} id - Identificador único del ingrediente
 * @property {string} nombre - Nombre del ingrediente
 * @property {number} cantidad - Cantidad numérica del ingrediente
 * @property {string} unidad - Unidad de medida (ej: "g", "ml", "tazas", "unidades")
 */
export interface IngredienteDetalle {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

/**
 * Receta sugerida resumida.
 * Devuelta por el endpoint de sugerencias, incluye ingredientes disponibles y faltantes.
 *
 * @typedef {Object} RecetaSugerida
 * @property {number} id - Identificador único de la receta en Spoonacular
 * @property {string} titulo - Título de la receta
 * @property {string} imagenUrl - URL de la imagen de la receta
 * @property {number} usedIngredientCount - Cantidad de ingredientes disponibles que usa la receta
 * @property {number} missedIngredientCount - Cantidad de ingredientes faltantes para la receta
 * @property {Ingrediente[]} usedIngredients - Lista de ingredientes disponibles que se usan
 * @property {Ingrediente[]} missedIngredients - Lista de ingredientes faltantes que se necesitan
 */
export interface RecetaSugerida {
  id: number;
  titulo: string;
  imagenUrl: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  usedIngredients: Ingrediente[];
  missedIngredients: Ingrediente[];
}

/**
 * Detalle completo de una receta.
 * Incluye tiempo de preparación, porciones, instrucciones e ingredientes detallados.
 *
 * @typedef {Object} RecetaDetalle
 * @property {number} id - Identificador único de la receta en Spoonacular
 * @property {string} titulo - Título de la receta
 * @property {string} imagenUrl - URL de la imagen de la receta
 * @property {number} tiempoMinutos - Tiempo total de preparación en minutos
 * @property {number} porciones - Número de porciones que rinde la receta
 * @property {string} instrucciones - Instrucciones de preparación en texto
 * @property {IngredienteDetalle[]} ingredientes - Lista detallada de ingredientes con cantidad y unidad
 */
export interface RecetaDetalle {
  id: number;
  titulo: string;
  imagenUrl: string;
  tiempoMinutos: number;
  porciones: number;
  instrucciones: string;
  ingredientes: IngredienteDetalle[];
}
