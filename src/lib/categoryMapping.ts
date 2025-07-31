import { Music, Film, UtensilsCrossed, Shirt, Plane } from 'lucide-react';
import { CategoryConfig } from '../types';

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    key: 'music',
    label: 'Music Artist',
    icon: Music,
    placeholder: 'Search for an artist (e.g., Beyoncé, The Beatles)',
    qlooTypes: ['urn:entity:artist', 'urn:entity:person', 'artist', 'musician', 'band']
  },
  {
    key: 'film',
    label: 'Movie',
    icon: Film,
    placeholder: 'Search for a movie (e.g., Back to the Future, Titanic)',
    qlooTypes: ['urn:entity:movie', 'urn:entity:film', 'movie', 'film']
  },
  {
    key: 'food',
    label: 'Restaurant/Food',
    icon: UtensilsCrossed,
    placeholder: 'Search for a restaurant or cuisine (e.g., Chez Panisse, McDonald\'s)',
    qlooTypes: ['urn:entity:place', 'urn:entity:restaurant', 'restaurant', 'place', 'food', 'cuisine']
  },
  {
    key: 'fashion',
    label: 'Fashion Brand',
    icon: Shirt,
    placeholder: 'Search for a fashion brand (e.g., Nike, Gucci)',
    qlooTypes: ['urn:entity:brand', 'brand', 'fashion', 'clothing']
  },
  {
    key: 'travel',
    label: 'Travel Destination',
    icon: Plane,
    placeholder: 'Search for a destination (e.g., Paris, Tokyo)',
    qlooTypes: ['urn:entity:destination', 'urn:entity:place', 'destination', 'place', 'city', 'country']
  }
];

export function mapEntityToCategory(entity: { type: string }): keyof CategoryFavorites | null {
  const entityType = entity.type.toLowerCase();
  
  for (const config of CATEGORY_CONFIGS) {
    if (config.qlooTypes.some(type => entityType.includes(type.toLowerCase().replace('urn:entity:', '')))) {
      return config.key;
    }
  }
  
  return null;
}

export function getCategoryConfig(categoryKey: string): CategoryConfig | undefined {
  return CATEGORY_CONFIGS.find(config => config.key === categoryKey);
}