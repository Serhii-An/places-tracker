import { Injectable } from '@angular/core';

interface CacheEntry<T> {
    data: T;
    expiry: number;
}

const CACHE_TIME_MS = 600000;

@Injectable({
    providedIn: 'root'
})

export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if(!entry) return null;

    if(Date.now() > entry.expiry) {
        this.cache.delete(key);
        return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
        data,
        expiry: Date.now() + CACHE_TIME_MS
    })
  }
}
