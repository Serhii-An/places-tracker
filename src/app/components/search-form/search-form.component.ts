import { Component, computed, inject, signal, Signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';
import { DataService } from '../../services/data-service';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { of } from 'rxjs';
import { MatInput } from '@angular/material/input';
import { CategoryFilter, FoursquarePlace, FoursquareSearchResponse } from '../../models/place.model';
import { PlaceDetailsComponent } from '../place-details/place-details.component';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatDivider } from '@angular/material/divider';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-search-form',
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInput,
    MatIcon,
    MatProgressSpinner,
    MatSlider,
    MatDivider,
    MatSliderThumb,
    MatSelect,
    PlaceDetailsComponent],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
})

export class SearchFormComponent {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  private dataService = inject(DataService);
  searchForm = new FormGroup({
    searchField: new FormControl('')
  });

  selectedPlace = signal<FoursquarePlace | null>(null);
  readonly searchResults = signal<FoursquarePlace[]>([]);
  readonly isLoadingLocation = signal(false);
  readonly locationError = signal<string | null>(null);
  readonly selectedRadius = signal<number>(5000);
  readonly selectedRadiusKm = computed(() => Math.round(this.selectedRadius() / 1000));
  
  formatLabel(value: number): string {
    return `${Math.round(value / 1000)}`;
  }
  
  readonly rawPlaces = signal<FoursquarePlace[]>([]);
  readonly selectedCategoryName = signal<string | null>(null);

  readonly availableCategories = computed<CategoryFilter[]>(() => {
    const places = this.rawPlaces();
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
    const places = this.rawPlaces();
    const selectedName = this.selectedCategoryName();

    if (!selectedName) return places;

    return places.filter(place => 
      place.categories?.some((cat: any) => cat.name?.trim() === selectedName)
    );
  });


  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.locationError.set('Geolocation is not supported by your browser');
      return;
    }

    this.isLoadingLocation.set(true);
    this.locationError.set(null);
    this.selectedCategoryName.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const radius = this.selectedRadius();
        
        this.dataService.getPlacesByCoordinates(latitude, longitude, radius).subscribe({
          next: (places) => {
            this.selectedPlace.set(null);
            this.searchResults.set(places);
            this.rawPlaces.set(places);
            this.isLoadingLocation.set(false);
            this.autocompleteTrigger?.closePanel();
          },
          error: (err) => {
            console.error('Geolocation search error:', err);
            this.locationError.set('Failed to fetch nearby places');
            this.isLoadingLocation.set(false);
          }
        });
      },
      (error) => {
        this.isLoadingLocation.set(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError.set('Access to geolocation denied');
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError.set('Location information unavailable');
            break;
          case error.TIMEOUT:
            this.locationError.set('Geolocation request timed out');
            break;
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  foundPlaces: Signal<FoursquarePlace[]> = toSignal(
    this.searchForm.get('searchField')!.valueChanges.pipe(
      startWith(''),
      filter((val): val is string => typeof val === 'string'),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (!query.trim()) {
          return of([]);
        }
        return this.dataService.getPlaces(query).pipe(
          map((res: FoursquareSearchResponse) => res.results ?? [])
        );
      })
    ),
    { initialValue: [] }
  );


  displayFn(place: FoursquarePlace): string {
    return place && place.name ? place.name : '';
  }


  onPlaceSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedPlace = event.option.value as FoursquarePlace;

    if (selectedPlace?.fsq_place_id) {
      this.dataService.getPlaceDetails(selectedPlace.fsq_place_id).subscribe({
        next: (details) => {
          this.selectedPlace.set(details);
          this.searchResults.set([]);
          this.autocompleteTrigger?.closePanel();
        },
        error: (err) => {
          this.selectedPlace.set(null);
          console.error('Error:', err);
        }
      });
    }
  }


  onRadiusChange(radius: number): void {
    this.selectedRadius.set(radius);
  }
}
