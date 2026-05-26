import { apiClient } from '../config/apiClient';
import type { RecetaDetalle, RecetaSugerida } from '../models';
import { traducirTexto } from './translationService';

/**
 * Obtener sugerencias de recetas basadas en una lista de ingredientes disponibles.
 * @param ingredientes - Lista de nombres de ingredientes
 * @param cantidad - Cantidad máxima de recetas a sugerir (default 5)
 */
export async function sugerirRecetas(
  ingredientes: string[],
  cantidad = 5,
): Promise<RecetaSugerida[]> {
  const ingredientesStr = ingredientes.join(',');
  const response = await apiClient.get<{ recetas: RecetaSugerida[] }>(
    `/api/recetas/sugerir?ingredientes=${encodeURIComponent(ingredientesStr)}&cantidad=${cantidad}&ranking=1`,
  );
  const recetas = response.recetas || [];
  // Translate titles in parallel
  return Promise.all(
    recetas.map(async (r) => ({
      ...r,
      titulo: await traducirTexto(r.titulo),
    })),
  );
}

/**
 * Obtener el detalle completo de una receta por su ID.
 * Traduce título, instrucciones y nombres de ingredientes al español.
 * @param id - ID de la receta
 */
export async function obtenerDetalleReceta(
  id: number,
): Promise<RecetaDetalle> {
  const data = await apiClient.get<RecetaDetalle>(`/api/recetas/detalle/${id}`);
  // Translate fields in parallel
  const [titulo, instrucciones] = await Promise.all([
    traducirTexto(data.titulo),
    traducirTexto(data.instrucciones),
  ]);
  const ingredientes = await Promise.all(
    (data.ingredientes ?? []).map(async (ing) => ({
      ...ing,
      nombre: await traducirTexto(ing.nombre),
    })),
  );
  return { ...data, titulo, instrucciones, ingredientes };
}

/**
 * Buscar recetas por nombre o palabra clave.
 * @param query - Término de búsqueda
 * @param cantidad - Cantidad máxima de resultados (default 10)
 */
export async function buscarRecetas(
  query: string,
  cantidad = 10,
): Promise<RecetaSugerida[]> {
  const response = await apiClient.get<{ recetas: RecetaSugerida[] }>(
    `/api/recetas/buscar?q=${encodeURIComponent(query)}&cantidad=${cantidad}`,
  );
  return response.recetas || [];
}

export default { sugerirRecetas, obtenerDetalleReceta, buscarRecetas };
