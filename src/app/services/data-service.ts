import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { FoursquarePlace, FoursquareSearchResponse } from '../models/place.model';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const CACHE_TIME_MS = 600000;

@Injectable({
  providedIn: 'root',
})

export class DataService {
  private apiUrl = '/api-foursquare/places';
  private headers = new HttpHeaders({
    'X-Places-Api-Version': '2025-06-17',
    accept: 'application/json',
    Authorization: 'Bearer NQ3ZGDZUE5FNOCI5X3SJAOUNVJBZ1LR4CEYKK0A21MP1DP2R'
  });

  private searchCache = new Map<string, CacheEntry<FoursquareSearchResponse>>();
  private placeDetailsCache = new Map<string, CacheEntry<FoursquarePlace>>();

  constructor(private http: HttpClient) {}

  getPlaces(query: string): Observable<FoursquareSearchResponse> {
    const normalizedQuery = query.trim().toLowerCase();
    const now = Date.now();

    if (this.searchCache.has(normalizedQuery)) {
      const entry = this.searchCache.get(normalizedQuery)!;
      if (now < entry.expiry) {
        return of(entry.data);
      }
      this.searchCache.delete(normalizedQuery);
    }

    return this.http.get<FoursquareSearchResponse>(`${this.apiUrl}/search`, {
      headers: this.headers,
      params: {query}
    }).pipe(
      tap((response) => {
        this.searchCache.set(normalizedQuery, {
          data: response,
          expiry: Date.now() + CACHE_TIME_MS
        });
      })
    );
  }

  private geoCache = new Map<string, CacheEntry<FoursquarePlace[]>>();
  getPlacesByCoordinates(lat: number, lng: number, radius: number): Observable<FoursquarePlace[]> {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}_${radius}`;
    const now = Date.now();

    if (this.geoCache.has(cacheKey)) {
      const entry = this.geoCache.get(cacheKey)!;
      if (now < entry.expiry) {
        return of(entry.data);
      }
      this.geoCache.delete(cacheKey);
    }

    const params = new HttpParams()
      .set('ll', `${lat},${lng}`)
      .set('radius', radius)
      .set('limit', '20')

    return this.http.get<{ results: FoursquarePlace[] }>(`${this.apiUrl}/search`, 
      { headers: this.headers, params }
    ).pipe(
      map(response => response.results),
      tap((places) => {
        this.geoCache.set(cacheKey, {
          data: places,
          expiry: Date.now() + CACHE_TIME_MS
        });
      })
    );
  }

  
  getPlaceDetails(id: string): Observable<FoursquarePlace> {
    const now = Date.now();

    if (this.placeDetailsCache.has(id)) {
      const entry = this.placeDetailsCache.get(id)!;
      if (now < entry.expiry) {
        return of(entry.data);
      }
      this.placeDetailsCache.delete(id);
    }

    return this.http.get<FoursquarePlace>(`${this.apiUrl}/${id}`, {
      headers: this.headers
    }).pipe(
      tap((response) => {
        this.placeDetailsCache.set(id, {
          data: response,
          expiry: Date.now() + CACHE_TIME_MS
        });
      })
    );
  }
}