/**
 * DishSwipe Application Core
 */
const app = {
    baseUrl: 'https://www.themealdb.com/api/json/v1/1/',
    currentRecipe: null,
    favorites: JSON.parse(localStorage.getItem('dishswipe_favs')) || [],  // TODO: добавить чтоб реально сохраняло (возможное решение: перенести этот кусок кода вниз, после рендеринга)

    init() {
        this.setupNavigation();
        this.loadRandomRecipe();
        
        // Add Enter key support for search
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
    },

    // --- Navigation System ---
    // TODO: отредактировать, чтоб переносил на отдельные HTML-страницы
    setupNavigation() {
        const links = document.querySelectorAll('nav a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                this.navigate(e.target.dataset.link);
            });
        });
    },

    navigate(viewId) {
        // Update CSS classes
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
        
        const targetView = document.getElementById(`view-${viewId}`);
        const targetLink = document.querySelector(`nav a[data-link="${viewId}"]`);
        
        if (targetView) targetView.classList.add('active');
        if (targetLink) targetLink.classList.add('active');

        // Specific logic for views
        if (viewId === 'favorites') this.renderFavorites();
        if (viewId === 'search' && !document.getElementById('search-results').innerHTML) {
            this.performSearch('a'); // Default load
        }
    },

    // --- API Operations ---
    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) throw new Error('Network error');
            return await response.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    },

    // --- Smash or Pass Logic ---
    async loadRandomRecipe() {
        const target = document.getElementById('swipe-card-target');
        target.innerHTML = `<div class="loader">Finding something tasty...</div>`;
        
        const data = await this.fetchData('random.php');
        if (data && data.meals) {
            this.currentRecipe = data.meals[0];
            this.renderSwipeCard(this.currentRecipe);
        } else {
            target.innerHTML = `<div class="error-msg">Oops! Failed to load recipe. Please try again.</div>`;
        }
    },

    renderSwipeCard(meal) {
        const target = document.getElementById('swipe-card-target');
        target.innerHTML = `
            <div class="swipe-card" onclick="app.showDetails('${meal.idMeal}')">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="swipe-info">
                    <span class="tag">${meal.strCategory}</span>
                    <h2 style="margin-top:10px">${meal.strMeal}</h2>
                    <p style="color:#777">${meal.strArea} Cuisine</p>
                    <p style="margin-top:10px; font-size: 0.9rem; color: var(--primary)">Tap to see full recipe</p>
                </div>
            </div>
        `;
    }, // ПРОВЕРЯТЬ ОТСЮДА

    smashCurrent() {
        if (!this.currentRecipe) return;
        
        // Avoid duplicates
        if (!this.favorites.find(f => f.idMeal === this.currentRecipe.idMeal)) {
            this.favorites.push({
                idMeal: this.currentRecipe.idMeal,
                strMeal: this.currentRecipe.strMeal,
                strMealThumb: this.currentRecipe.strMealThumb,
                strCategory: this.currentRecipe.strCategory
            });
            localStorage.setItem('dishswipe_favs', JSON.stringify(this.favorites));
        }

        // Visual feedback then next
        const card = document.querySelector('.swipe-card');
        card.style.transform = 'translateX(200px) rotate(20deg) scale(0.5)';
        card.style.opacity = '0';
        
        setTimeout(() => this.loadRandomRecipe(), 300);
    },

    // --- Search Logic ---
    async performSearch(queryInput) {
        const query = queryInput || document.getElementById('search-input').value;
        const resultsGrid = document.getElementById('search-results');
        
        resultsGrid.innerHTML = `<div class="loader">Searching for "${query}"...</div>`;

        const data = await this.fetchData(`search.php?s=${query}`);
        
        if (!data || !data.meals) {
            resultsGrid.innerHTML = `
                <div class="empty-state">
                    <p>No recipes found for "${query}". Try something else!</p>
                </div>
            `;
            return;
        }

        resultsGrid.innerHTML = data.meals.map(meal => `
            <div class="recipe-card" onclick="app.showDetails('${meal.idMeal}')">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="recipe-card-content">
                    <span class="tag">${meal.strCategory}</span>
                    <h3 style="margin-top:8px">${meal.strMeal}</h3>
                </div>
            </div>
        `).join('');
    },

    // --- Details Logic ---
    async showDetails(id) {
        const target = document.getElementById('details-target');
        this.navigate('details');
        target.innerHTML = `<div class="loader">Loading recipe secrets...</div>`;

        const data = await this.fetchData(`lookup.php?i=${id}`);
        if (!data || !data.meals) return;

        const meal = data.meals[0];
        
        // Parse ingredients
        let ingredients = [];
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`]) {
                ingredients.push(`${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}`);
            }
        }

        target.innerHTML = `
            <div class="details-container">
                <img src="${meal.strMealThumb}" class="details-img" alt="${meal.strMeal}">
                <div class="details-content">
                    <button class="btn btn-secondary" onclick="app.navigate('search')" style="margin-bottom:1rem; padding: 5px 15px; font-size:0.8rem">← Back</button>
                    <span class="tag">${meal.strCategory}</span>
                    <h1 style="margin: 10px 0">${meal.strMeal}</h1>
                    <p><strong>Origin:</strong> ${meal.strArea}</p>
                    
                    <h3 style="margin-top:2rem">Ingredients</h3>
                    <ul class="ingredients-list">
                        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>

                    <h3 style="margin-top:2rem">Instructions</h3>
                    <p style="white-space: pre-line; color: #555;">${meal.strInstructions}</p>
                    
                    ${meal.strYoutube ? `
                        <a href="${meal.strYoutube}" target="_blank" class="btn btn-primary" style="display:inline-block; margin-top:2rem; text-decoration:none">Watch on YouTube</a>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // --- Favorites Logic ---
    renderFavorites() {
        const grid = document.getElementById('favorites-results');
        if (this.favorites.length === 0) {
            grid.innerHTML = `<div class="empty-state">You haven't smashed any recipes yet! Go to "Smash or Pass" to find some.</div>`;
            return;
        }

        grid.innerHTML = this.favorites.map(meal => `
            <div class="recipe-card" onclick="app.showDetails('${meal.idMeal}')">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="recipe-card-content">
                    <span class="tag">${meal.strCategory}</span>
                    <h3 style="margin-top:8px">${meal.strMeal}</h3>
                    <button class="btn" style="color:var(--primary); font-size:0.7rem; padding:0" onclick="event.stopPropagation(); app.removeFavorite('${meal.idMeal}')">Remove</button>
                </div>
            </div>
        `).join('');
    },

    removeFavorite(id) {
        this.favorites = this.favorites.filter(f => f.idMeal !== id);
        localStorage.setItem('dishswipe_favs', JSON.stringify(this.favorites));
        this.renderFavorites();
    }
};

// Start App
window.onload = () => app.init();
