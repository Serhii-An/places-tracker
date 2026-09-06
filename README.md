# 🌍 PlacesTracker — Offline-First Discovery SPA

A modern single-page web application (SPA) for discovering interesting places nearby and around the world, powered by the **Foursquare Places API v3**. Built with **Angular 22**, focusing on reactive state management, client-side optimizations, and a clean Glassmorphism UI.

---

## 🚀 Key Tech Stack & Architecture

* **Framework**: Angular 18+ (Standalone Components, Signals API, Computed Signals)
* **UI & Styling**: Angular Material (`MatSliderThumb`, `MatSelect`, `MatChips`, `MatAutocomplete`), SCSS
* **API Integration**: Foursquare Places API v3

### 🛠️ Technical Highlights:

1. **Signal-Based Reactive State Management**:
   * Search logic, geolocation state, and category filtering are completely driven by `signal()` and `computed()`.
   * Dynamic category extraction (`availableCategories`) with item counts `(count)` is automatically calculated via computed signals directly from raw API responses.

2. **Client-Side Category Filtering**:
   * Results are filtered **client-side** by the category's `name` property. This eliminates redundant API network requests when switching filters and solves potential ID mismatch issues within Foursquare API v3 taxonomy.

3. **Hybrid Location Search & Autocomplete**:
   * Supports browser Geolocation API with fully customizable search radius control (1 km – 20 km) via an integrated `mat-slider`.

4. **Security Note (API Key)**:
   * For testing and review convenience, the API key is currently kept in `DataService` to avoid additional environment setup steps. In a production environment, the key would be offloaded to a Backend proxy (Serverless / Node.js) or restricted via domain policies (Allowed Origins) in the Foursquare Developer Console.

5. **Foursquare API Tier Limitations**:
   * Features such as **place photos, tip details, and numerical ratings** are intentionally omitted from the venue details. These fields require Foursquare's Premium / Paid API endpoints (`/v3/places/{fsq_id}/photos`, `/tips`) and are restricted on standard free developer tier accounts.

---

## 🛠️ Development Server & Commands (Angular CLI)

### Development Server
To start a local development server, run:
```bash
ng serve
