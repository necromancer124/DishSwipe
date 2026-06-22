# 🍽️ DishSwipe
A modern, interactive "Smash-or-Pass" recipe discovery web application.

## 🚀 Overview
DishSwipe transforms the way you find new meals. Instead of scrolling through endless lists, you discover recipes one by one in a Tinder-style interface. Powered by **TheMealDB API**, it allows you to quickly curate a list of favorites for your next cooking session.

## ✨ Features
- **Interactive Swiping**: "Smash" to save a recipe to favorites or "Pass" to skip it.
- **Global Search**: Find specific dishes by name with a responsive results grid.
- **Favorites Vault**: Persistent storage using `localStorage` to keep your saved meals across sessions.
- **Deep-Dive Details**: Comprehensive recipe views including ingredients, measurements, and YouTube tutorials.
- **Theming System**: Built-in support for multiple visual themes (including a "Neo" and "Kawaii" mode) via a dynamic theme switcher.

## 🛠️ Technical Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript.
- **API**: [TheMealDB API](https://www.themealdb.com/api.php) for real-time recipe data.
- **Storage**: Browser `localStorage` and `sessionStorage` for state management.

## 🚀 Getting Started
Since this is a static web application, you can run it instantly:

1. Clone the repository:
   ```bash
   git clone https://github.com/necromancer124/DishSwipe.git
   ```
2. Open `index.html` in any modern web browser.

## 📂 Project Structure
- `/styles`: Contains the global CSS and theme-specific stylesheets.
- `/js`: Core application logic and theme initialization.
- `/includes`: Reusable HTML fragments (header/footer) to ensure a DRY codebase.
- `*.html`: The different views (Swipe, Search, Favorites, Details).

## 📜 License
This project is licensed under the MIT License.
