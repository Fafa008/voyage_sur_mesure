/**
 * Custom image loader pour Next.js
 * 
 * Ce loader permet de servir les images via le proxy local
 * pour les stores Blob privés tout en maintenant le support
 * des URLs externes et des fichiers locaux.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // Si c'est une URL de proxy local, on la retourne telle quelle
  // Le proxy gère déjà le redimensionnement via Next.js Image
  if (src.startsWith('/api/images/')) {
    return src;
  }
  
  // Pour les URLs locales (uploads précédents)
  // On retourne l'URL telle quelle car Next.js gère le redimensionnement
  if (src.startsWith('/uploads/')) {
    return src;
  }
  
  // Pour les URLs externes (Blob public, etc.), on retourne l'URL telle quelle
  // Next.js utilisera le loader par défaut via remotePatterns
  return src;
}