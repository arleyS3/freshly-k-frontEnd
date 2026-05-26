/**
 * Translation service using MyMemory API.
 *
 * Traduce texto del inglés al español y cachea resultados
 * en memoria para evitar llamadas repetidas a la API.
 *
 * Si MyMemory no está disponible, devuelve el texto original
 * sin interrumpir la experiencia del usuario.
 *
 * MyMemory es gratuita, no requiere API key para uso básico
 * y tiene buena calidad de traducción neuronal.
 *
 * @see https://mymemory.translated.net/doc/spec.php
 */

const translationCache = new Map<string, string>();

/**
 * Traduce un texto usando la API de MyMemory.
 * @param texto - Texto a traducir
 * @param source - Idioma de origen (default: 'en')
 * @param target - Idioma de destino (default: 'es')
 * @returns Texto traducido, o el original si falla la traducción
 */
export async function traducirTexto(
  texto: string,
  source = 'en',
  target = 'es',
): Promise<string> {
  if (!texto || texto.trim().length === 0) return texto;

  const cacheKey = `${source}:${target}:${texto}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const q = encodeURIComponent(texto);
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${q}&langpair=${source}|${target}`,
    );
    const data = await res.json();
    const translated = data?.responseData?.translatedText || texto;
    translationCache.set(cacheKey, translated);
    return translated;
  } catch (e) {
    console.warn('Translation failed, using original:', e);
    return texto;
  }
}
