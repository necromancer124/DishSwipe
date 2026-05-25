# DishSwipe 🍽️

DishSwipe is a vanilla JavaScript web application that makes finding your next meal engaging and interactive. Users can discover new recipes "Tinder-style" via a Smash-or-Pass interface, search for specific dishes, and save their favorites for later—all powered by **TheMealDB API**.

---

##  Features

* **Smash or Pass (Swipe):** Discover random recipes. Tap "Smash" (❤) to save a recipe to your favorites, or "Pass" (✖) to skip to the next one.
* **Search Functionality:** Look up specific recipes by name.
* **Favorites Manager:** Keep track of your saved recipes. Favorites are stored persistently in your browser.
* **Detailed Recipe Views:** Get comprehensive meal details, including high-quality images, category tags, step-by-step instructions, ingredient lists with measurements, and direct YouTube video links.
* **Dynamic Components:** The application uses dynamic includes for the header, footer, and theme switcher, keeping the codebase DRY (Don't Repeat Yourself).
* **Dark/Light Theme Support:** Integrated theme switching built directly into the UI.

---

##  Project Structure

| File / Directory | Purpose |
| --- | --- |
| `index.html` | The landing page featuring a hero section and primary navigation CTAs. |
| `swipe.html` | The "Smash or Pass" interface that loads random meals via the API. |
| `search.html` | The search interface with a text input and results grid. |
| `favorites.html` | Displays all recipes the user has saved. |
| `details.html` | A dedicated view for rendering a single recipe's full details. |
| `script.js` | The core application logic, API fetching, and state management. |
| `styles/` | Directory for CSS files (`common.css`, `default.css`). |
| `js/` | Directory for theme logic (`theme-init.js`, `theme.js`). |
| `includes/` | Contains `.inc` files (`header.inc`, `footer.inc`) fetched dynamically by `script.js`. |

---

## 🛠️ Technical Architecture

### API Integration

The application relies on [TheMealDB](https://www.themealdb.com/api.php).

* **Random Recipe:** `api/json/v1/1/random.php`
* **Search Recipe:** `api/json/v1/1/search.php?s={query}`
* **Lookup Recipe Details:** `api/json/v1/1/lookup.php?i={id}`

### State & Data Management

DishSwipe uses browser storage to manage user data and page transitions without requiring a backend database.

* **`localStorage`:** Uses the key `dishswipe_favs` to permanently store an array of the user's "Smashed" (favorited) recipes. This ensures data persists even if the user closes the browser.
* **`sessionStorage`:** Uses the key `selectedMealId` to temporarily hold a recipe's ID when a user clicks a recipe card from the Search, Swipe, or Favorites pages. The `details.html` page reads this ID to fetch the full recipe, and then clears the storage.

### Navigation Flow

Because this is a multi-page application (MPA) rather than a single-page application (SPA), routing is handled via standard HTML links. `script.js` identifies the current page using `window.location.pathname` and initializes the relevant functions (e.g., `loadRandomRecipe()` for `swipe.html` or `renderFavorites()` for `favorites.html`).
