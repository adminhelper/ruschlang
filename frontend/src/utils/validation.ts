export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function isValidRating(rating: number): boolean {
  return rating >= 0.5 && rating <= 5 && (rating * 2) === Math.round(rating * 2);
}

export function sanitizeText(text: string): string {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}
