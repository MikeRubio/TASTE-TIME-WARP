export interface WarpData {
  id: string;
  seeds: string[];
  target_year: number;
  bundle: RecommendationBundle;
  essay: string;
  divergence: number;
  created_at: string;
}

export interface RecommendationBundle {
  music: string;
  film: string;
  food: string;
  fashion: string;
  travel: string;
  modern_equivalents: {
    music: string;
    film: string;
    food: string;
    fashion: string;
    travel: string;
  };
}

export interface WarpRequest {
  seeds: string[];
  target_year: number;
}

export interface QlooEntity {
  id: string;
  name: string;
  type: string;
}

export interface CategoryFavorites {
  music?: QlooEntity;
  film?: QlooEntity;
  food?: QlooEntity;
  fashion?: QlooEntity;
  travel?: QlooEntity;
}

export interface CategoryConfig {
  key: keyof CategoryFavorites;
  label: string;
  icon: any;
  placeholder: string;
  qlooTypes: string[];
}