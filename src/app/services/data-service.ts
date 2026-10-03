import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { FoursquarePlace, FoursquareSearchResponse } from '../models/place.model';
import { CacheService } from './cache-service';

@Injectable({
  providedIn: 'root',
})

export class DataService {
  private http = inject(HttpClient);
  private cache = inject(CacheService);

  private apiUrl = '/api-foursquare/places';

  getPlaces(searchStr: string, radius: number): Observable<FoursquareSearchResponse> {
    const cacheKey = searchStr.trim().toLowerCase();
    const cachedData = this.cache.get<FoursquareSearchResponse>(cacheKey);

    if (cachedData) {
      return of(cachedData);
    }

    const params = new HttpParams()
      .set('query', searchStr)
      .set('radius', radius)


    return this.http.get<FoursquareSearchResponse>(`${this.apiUrl}/search`, {params}).pipe(
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
      {params}
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

    return this.http.get<FoursquarePlace>(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        this.cache.set(id, response);
      })
    );
  }
}