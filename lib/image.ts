// lib/image.ts
//
// Shared helpers for resolving product images against the backend, so every
// product-card listing (home, categories, catalog, search) shows the same
// image the backend actually serves.

const IMAGE_TYPE_PRIORITIES: Record<string, number> = {
  THUMBNAIL: 100,
  HERO: 90,
  DETAIL: 80,
  GALLERY: 70,
  LIFESTYLE: 60,
  PACKAGING: 50,
  COLOR: 40,
  SIZE: 30,
  OTHER: 20,
};

type ImageEntity =
  | {
      images?: {
        image_type?: string;
        type?: string;
        image?: string;
        original?: string;
        url?: string;
        src?: string;
      }[];
      image?: string | null;
      thumbnail?: string | null;
      image_thumbnail?: string | null;
      url?: string | null;
    }
  | string
  | null
  | undefined;

// The backend can return media URLs relative to itself (e.g. "/media/...").
// Resolve those against BACKEND_URL so <Image> doesn't try to load them from
// the frontend's own origin.
export function toAbsoluteUrl(rawUrl: string, baseUrl: string): string {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('/')) {
    return `${baseUrl.replace(/\/$/, '')}${rawUrl}`;
  }
  return rawUrl;
}

// Picks the best available image for a product/variant: a flat thumbnail
// field first, then the highest-priority entry in an `images` array.
export function extractBestImageUrl(entity: ImageEntity, baseUrl: string): string {
  if (!entity) return '';

  let rawUrl = '';

  if (
    typeof entity === 'object' &&
    entity !== null &&
    Array.isArray(entity.images) &&
    entity.images.length > 0
  ) {
    const sortedImages = [...entity.images].sort((a, b) => {
      const typeA = String(a?.image_type || a?.type || '').toUpperCase();
      const typeB = String(b?.image_type || b?.type || '').toUpperCase();

      const weightA = IMAGE_TYPE_PRIORITIES[typeA] || 0;
      const weightB = IMAGE_TYPE_PRIORITIES[typeB] || 0;

      return weightB - weightA;
    });

    const target = sortedImages[0];
    rawUrl =
      typeof target === 'string'
        ? target
        : target?.image || target?.original || target?.url || target?.src || '';
  } else if (typeof entity === 'object' && entity !== null) {
    rawUrl = entity.image || entity.thumbnail || entity.image_thumbnail || entity.url || '';
  } else if (typeof entity === 'string') {
    rawUrl = entity;
  }

  if (!rawUrl || typeof rawUrl !== 'string') return '';

  return toAbsoluteUrl(rawUrl, baseUrl);
}
