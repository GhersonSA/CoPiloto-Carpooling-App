/**
 * Transforma una URL de imagen del backend a una URL accesible
 * Para imágenes locales del backend, las devuelve directamente con la URL completa
 * El componente que las use debe usar <img> en lugar de <Image> de Next.js
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return '/default-avatar.png';
  
  // Si ya es una URL completa externa (https://...)
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  
  // Si es una URL relativa del backend (/uploads/...)
  // Convertirla a URL absoluta del backend
  if (url.startsWith('/uploads')) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    return `${backendUrl}${url}`;
  }
  
  // Para otras URLs, devolverlas como están
  return url;
}
