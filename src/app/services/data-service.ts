import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { FoursquarePlace, FoursquareSearchResponse } from '../models/place.model';
import { CacheService } from './cache-service';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const CACHE_TIME_MS = 600000;

@Injectable({
  providedIn: 'root',
})

export class DataService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);

  private apiUrl = '/api-foursquare/places';
  private headers = new HttpHeaders({
    'X-Places-Api-Version': '2025-06-17',
    accept: 'application/json',
    Authorization: 'Bearer NQ3ZGDZUE5FNOCI5X3SJAOUNVJBZ1LR4CEYKK0A21MP1DP2R'
  });

  getPlaces(query: string): Observable<FoursquareSearchResponse> {
    const cacheKey = query.trim().toLowerCase();
    const cachedData = this.cache.get<FoursquareSearchResponse>(cacheKey);

    if (cachedData) {
      return of(cachedData);
    }


    return this.http.get<FoursquareSearchResponse>(`${this.apiUrl}/search`, {
      headers: this.headers,
      params: {query}
    }).pipe(
      tap((response) => {
        this.cache.set(cacheKey, response);
      })
    );
  }

  getPlacesByCoordinates(lat: number, lng: number, radius: number): Observable<FoursquarePlace[]> {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}_${radius}`;
    const cachedData = this.cache.get<FoursquarePlace[]>(cacheKey);

    if (cachedData) {
      return of(cachedData);
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
        this.cache.set(cacheKey, places);
      })
    );
  }

  
  getPlaceDetails(id: string): Observable<FoursquarePlace> {
    const cachedData = this.cache.get<FoursquarePlace>(id);
    if (cachedData) {
      return of(cachedData);
    }

    return this.http.get<FoursquarePlace>(`${this.apiUrl}/${id}`, {
      headers: this.headers
    }).pipe(
      tap((response) => {
        this.cache.set(id, response);
      })
    );
  }
}