import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import type { ProductoBusqueda } from '../models';

/**
 * Helper: extrae un array de distintos formatos de payload de API.
 * @param payload - Respuesta cruda de la API
 * @returns Array extraído o null si no hay elementos
 */
function getArrayPayload(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    for (const key of ['data', 'results', 'productos', 'items', 'products']) {
      const value = data[key];
      if (Array.isArray(value)) return value;
    }
  }
  return null;
}

/**
 * Normaliza la respuesta de búsqueda a un formato sencillo usado por las Views.
 * Devuelve un arreglo de ProductoBusqueda aproximado.
 * @param payload - Respuesta cruda de la API
 */
function normalizeSearchResults(payload: unknown): ProductoBusqueda[] {
  const items = getArrayPayload(payload);
  if (!items) return [];

  return items.map((item) => {
    if (!item || typeof item !== 'object') {
      return {
        producto_id: 0,
        nombre: 'Producto',
        imagen_url: null,
        keywords: '',
      } as ProductoBusqueda;
    }

    const raw = item as Record<string, unknown>;
    const rawId = raw.producto_id ?? raw.id;
    const numericId = typeof rawId === 'number' ? rawId : Number(rawId);
    const nombre = typeof raw.nombre === 'string' ? raw.nombre : typeof raw.name === 'string' ? raw.name : 'Producto';
    const keywords = typeof raw.keywords === 'string' ? raw.keywords : '';
    const imagenUrl = typeof raw.imagen_url === 'string' ? raw.imagen_url : null;

    return {
      producto_id: Number.isFinite(numericId) ? numericId : 0,
      nombre,
      imagen_url: imagenUrl,
      keywords,
      descripcion: typeof raw.descripcion === 'string' ? raw.descripcion : keywords,
      // propiedades opcionales que algunas vistas usan
      bgIcon: typeof raw.bgIcon === 'string' ? raw.bgIcon : undefined,
      icon: raw.icon as any,
      urgent: typeof raw.urgent === 'boolean' ? raw.urgent : undefined,
      category: typeof raw.category === 'string' ? raw.category : undefined,
    } as ProductoBusqueda;
  });
}

/**
 * Buscar productos en la API y devolver resultados normalizados.
 * @param q - Texto de búsqueda
 * @param token - Token opcional para Authorization
 * @param signal - AbortSignal opcional para cancelar la petición
 */
export async function buscarProductos(q: string, token?: string, signal?: AbortSignal): Promise<ProductoBusqueda[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const url = `${API_BASE_URL}/api/productos/search`;
  const res = await axios.get(url, { params: { q }, headers, signal });
  return normalizeSearchResults(res.data);
}

/**
 * Obtener detalle de un producto por su id.
 * Usa api pública a través de axios (no modifica estado)
 * @param productoId - ID del producto
 */
export async function obtenerDetalleProducto(productoId: number): Promise<any> {
  const url = `${API_BASE_URL}/api/productos/${productoId}/detalle`;
  const res = await axios.get(url);
  return res.data;
}

export default {
  buscarProductos,
  obtenerDetalleProducto,
};
