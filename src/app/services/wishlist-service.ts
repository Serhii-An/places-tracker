import { Injectable, signal } from '@angular/core';
import { FoursquarePlace } from '../models/place.model';

const WISHLIST_KEY = 'travel_tracker_wishlist';

@Injectable({
    providedIn: 'root'
})

export class WishlistService {
    private wishlistPlacesSignal = signal<FoursquarePlace[]>(this.loadFromStorage());

    readonly wishlistPlaces = this.wishlistPlacesSignal.asReadonly();

    toggleWishlist(place: FoursquarePlace): void {
        const currentList = this.wishlistPlacesSignal();
        const exists = currentList.some(item => item.fsq_place_id === place.fsq_place_id);

        let updatedList: FoursquarePlace[];
        if (exists) {
            updatedList = currentList.filter(item => item.fsq_place_id !== place.fsq_place_id);
        } else {
            updatedList = [...currentList, place];
        }

        this.saveToStorage(updatedList);
    }


    isInWishlist(fsqId: string): boolean {
        return this.wishlistPlacesSignal().some(item => item.fsq_place_id === fsqId);
    }
  

    private loadFromStorage(): FoursquarePlace[] {
        try {
            const data = localStorage.getItem(WISHLIST_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }


    private saveToStorage(places: FoursquarePlace[]): void {
        try {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(places));
            this.wishlistPlacesSignal.set(places);
        } catch (err) {
            console.error('Error writing to localStorage:', err);
        }
    }
}
