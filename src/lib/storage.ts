export const STORAGE_KEYS = {
  LAST_SEEDS: 'taste-timewarp-last-seeds', // Legacy - keep for migration
  LAST_FAVORITES: 'taste-timewarp-last-favorites',
  LAST_YEAR: 'taste-timewarp-last-year',
} as const;

export function saveToStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}