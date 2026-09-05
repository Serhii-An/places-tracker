import { Component, inject } from '@angular/core';
import { PlaceDetailsComponent } from '../place-details/place-details.component';
import { WishlistService } from '../../services/wishlist-service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [PlaceDetailsComponent, MatIconModule],
  selector: 'app-wishlist-component',
  styleUrl: './wishlist-component.scss',
  templateUrl: './wishlist-component.html',
})
export class WishlistComponent {
  wishlistService = inject(WishlistService)
}
