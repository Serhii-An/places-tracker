import { Routes } from '@angular/router';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { WishlistComponent } from './components/wishlist-component/wishlist-component';

export const routes: Routes = [
  { 
    path: '', 
    component: SearchFormComponent, 
    title: 'Search' 
  },
  { 
    path: 'wishlist', 
    component: WishlistComponent, 
    title: 'Wishlist' 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
