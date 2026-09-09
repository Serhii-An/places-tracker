import { Component, computed, inject, signal, Signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';
import { DataService } from '../../services/data-service';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { of } from 'rxjs';
import { MatInput } from '@angular/material/input';
import { FoursquarePlace, FoursquareSearchResponse } from '../../models/place.model';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatDivider } from '@angular/material/divider';
import { SearchResultsListComponent } from '../search-results-list/search-results-list.component';

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
    SearchResultsListComponent
  ],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
})

export class SearchFormComponent {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  private dataService = inject(DataService);
  searchForm = new FormGroup({
    searchField: new FormControl('')
  });

  readonly searchResults = signal<FoursquarePlace[]>([]);
  readonly isLoadingLocation = signal(false);
  readonly locationError = signal<string | null>(null);
  readonly selectedSearchRadius = signal<number>(5000);
  readonly selectedRadiusKm = computed(() => Math.round(this.selectedSearchRadius() / 1000));
  readonly hasSearched = signal(false);
  
  formatLabel(value: number): string {
    return `${Math.round(value / 1000)}`;
  }


  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.locationError.set('Geolocation is not supported by your browser');
      return;
    }

    this.isLoadingLocation.set(true);
    this.locationError.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        this.dataService.getPlacesByCoordinates(latitude, longitude, this.selectedSearchRadius()).subscribe({
          next: (places) => {
            this.searchResults.set(places);
            this.isLoadingLocation.set(false);
            this.autocompleteTrigger?.closePanel();
            this.hasSearched.set(true);
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
        return this.dataService.getPlaces(query, this.selectedSearchRadius()).pipe(
          map((res: FoursquareSearchResponse) => res.results ?? []),
        );
      })
    ),
    {initialValue: []}
  );


  displayFn(place: FoursquarePlace): string {
    return place && place.name ? place.name : '';
  }


  onPlaceSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedPlace = event.option.value as FoursquarePlace;

    if (selectedPlace?.fsq_place_id) {
      this.dataService.getPlaceDetails(selectedPlace.fsq_place_id).subscribe({
        next: (details) => {
          this.searchResults.set([details]);
          this.autocompleteTrigger?.closePanel();
        },
        error: (err) => {
          this.searchResults.set([]);
          console.error('Error:', err);
        }
      });
    }
  }


  onRadiusChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.selectedSearchRadius.set(value);
  }
}
