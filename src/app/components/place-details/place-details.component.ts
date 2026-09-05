import { Component, inject, input } from '@angular/core';
import { FoursquarePlace } from '../../models/place.model';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { WishlistService } from '../../services/wishlist-service';

@Component({
  imports: [MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
  selector: 'app-place-details',
  styleUrl: './place-details.component.scss',
  templateUrl: './place-details.component.html',
})
export class PlaceDetailsComponent {
  wishlistService = inject(WishlistService);
  place = input<FoursquarePlace | null>(null);

  onToggleWishlist(place: FoursquarePlace): void {
    this.wishlistService.toggleWishlist(place);
  }


  isSaved(fsqId: string): boolean {
    return this.wishlistService.isInWishlist(fsqId);
  }


  getGoogleMapsUrl(place: FoursquarePlace): string {
    if (place.geocodes?.main) {
      const { latitude, longitude } = place.geocodes.main;
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }

    const address = place.location?.formatted_address || `${place.name} ${place.location?.locality || ''}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }


  getCoordinatesUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
}
