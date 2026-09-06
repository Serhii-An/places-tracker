export interface FoursquareGeoLocation {
  latitude: number;
  longitude: number;
}

export interface FoursquareGeocodes {
  main?: FoursquareGeoLocation;
  roof?: FoursquareGeoLocation;
}

export interface FoursquareCategory {
  fsq_category_id: string;
  name: string;
  short_name?: string;
  plural_name?: string;
  id: number;
  icon?: {
    prefix: string;
    suffix: string;
  };
}

export interface FoursquareLocation {
  address?: string;
  locality?: string;
  region?: string;
  country?: string;
  formatted_address?: string;
}

export interface FoursquarePlace {
  fsq_place_id: string;
  name: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  location?: FoursquareLocation;
  categories?: FoursquareCategory[];
  geocodes?: FoursquareGeocodes;
}

export interface FoursquareSearchResponse {
  results: FoursquarePlace[];
  context?: Record<string, unknown>;
}

export interface CategoryFilter {
  name: string;
  iconUrl?: string; 
  count: number;
}