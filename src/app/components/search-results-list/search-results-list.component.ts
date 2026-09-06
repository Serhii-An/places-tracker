import { Component, computed, input, signal } from '@angular/core';
import { MatLabel, MatSelect } from '@angular/material/select';
import { PlaceDetailsComponent } from '../place-details/place-details.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CategoryFilter, FoursquarePlace } from '../../models/place.model';
import { MatSelectModule } from '@angular/material/select';

@Component({
  imports: [
    MatSelect, 
    MatIcon,
    MatLabel,
    MatFormFieldModule,
    MatSelectModule,
    PlaceDetailsComponent
  ],
  selector: 'app-search-results-list',
  styleUrl: './search-results-list.component.scss',
  templateUrl: './search-results-list.component.html',
})
export class SearchResultsListComponent {
    selectedPlace = input<FoursquarePlace | null>(null);
    searchResults = input<FoursquarePlace[]>([]);

    readonly selectedCategoryName = signal<string | null>(null);

    readonly availableCategories = computed<CategoryFilter[]>(() => {
      const places = this.searchResults();
      const categoriesMap = new Map<string, CategoryFilter>();

      places.forEach(place => {
        place.categories?.forEach((cat: any) => {
          const catName = cat.name?.trim();
          if (!catName) return;

          const existing = categoriesMap.get(catName);
          if (existing) {
            existing.count += 1;
          } else {
            const iconUrl = cat.icon 
              ? `${cat.icon.prefix}bg_32${cat.icon.suffix}` 
              : undefined;

            categoriesMap.set(catName, {
              name: catName,
              iconUrl,
              count: 1
            });
          }
        });
      });

      return Array.from(categoriesMap.values()).sort((a, b) => b.count - a.count);
    });

    
    readonly filteredPlaces = computed(() => {
      const places = this.searchResults();
      const selectedName = this.selectedCategoryName();

      if (!selectedName) return places;

      return places.filter(place => 
        place.categories?.some((cat: any) => cat.name?.trim() === selectedName)
      );
    });
}
