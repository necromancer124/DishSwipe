/**
 * DishSwipe Application Core
 * Работает с отдельными HTML-страницами
 */

const HREF_TO_PAGE = {
    'index.html': 'index',
    'swipe.html': 'swipe',
    'search.html': 'search',
    'favorites.html': 'favorites'
};

const INCLUDES = ['header', 'footer', 'theme-switcher'];

const app = {
    baseUrl: 'https://www.themealdb.com/api/json/v1/1/',
    currentRecipe: null,
    detailMeal: null,
    favorites: [],

    init() {
        // Загружаем избранное из localStorage
        this.favorites = JSON.parse(localStorage.getItem('dishswipe_favs')) || [];
        
        // Определяем текущую страницу и инициализируем её
        const currentPage = this.getCurrentPage();
        
        this.renderInclude('header', () => {
            this.setupNavigation();
            this.setupMobileNav();
        });
        this.renderInclude('footer');
        this.renderInclude('theme-switcher', (container) => Theme.bindSwitcher(container.firstElementChild || container));
        this.setupNavigation();
        
        // Вызываем инициализацию для конкретной страницы
        switch (currentPage) {
            case 'index':
                // На главной странице ничего особенного не нужно
                break;
            case 'swipe':
                this.loadRandomRecipe();
                break;
            case 'search':
                this.setupSearchPage();
                break;
            case 'favorites':
                this.renderFavorites();
                break;
        }
    },

    // --- Определение текущей страницы ---
    getCurrentPage() {
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop() || 'index.html';
        
        return HREF_TO_PAGE[filename] ?? 'index';
    },

    // --- Навигация ---
    setupNavigation() {
        const links = document.querySelectorAll('nav a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            const currentPage = this.getCurrentPage();
            const linkPage = HREF_TO_PAGE[href] ?? 'index';
            
            // Помечаем текущую страницу как активную
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    },

    setupMobileNav() {
        const header = document.querySelector('header');
        const burger = document.querySelector('.burger-btn');
        const nav = document.getElementById('main-nav');
        if (!header || !burger) return;

        const setOpen = (open) => {
            header.classList.toggle('nav-open', open);
            document.body.classList.toggle('nav-open', open);
            burger.setAttribute('aria-expanded', String(open));
            burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        };

        burger.addEventListener('click', () => {
            setOpen(!header.classList.contains('nav-open'));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setOpen(false);
        });

        document.addEventListener('click', (e) => {
            if (!header.classList.contains('nav-open')) return;
            if (header.contains(e.target)) return;
            setOpen(false);
        });
    },

    async renderInclude(name, callback) {
        const container = document.getElementById(name);
        
        if (!container) return;

        try {
            const response = await fetch(`includes/${name}.inc`);
            if (!response.ok) throw new Error(`Load error: ${response.status}`);
            
            const htmlContent = await response.text();
            container.innerHTML = htmlContent;

            if (typeof(callback) === 'function') callback(container);
        } catch (error) {
            console.error(`${name} include loading error:`, error);
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

    // --- SWIPE PAGE: Smash or Pass Logic ---
    async loadRandomRecipe() {
        const target = document.getElementById('swipe-card-target');
        if (!target) return;
        
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
                <div class="swipe-info">
                    <span class="tag">${meal.strCategory}</span>
                    <h2 style="margin-top:10px">${meal.strMeal}</h2>
                    <p style="color:#777">${meal.strArea} Cuisine</p>
                    <p style="margin-top:10px; font-size: 0.9rem; color: var(--primary)">Tap to see full recipe</p>
                </div>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            </div>
        `;
    },

    smashCurrent() {
        if (!this.currentRecipe) return;
        
        // Избегаем дублей
        if (!this.favorites.find(f => f.idMeal === this.currentRecipe.idMeal)) {
            this.favorites.push({ ...this.currentRecipe });
            localStorage.setItem('dishswipe_favs', JSON.stringify(this.favorites));
        }

        // Визуальная обратная связь
        const card = document.querySelector('.swipe-card');
        if (card) {
            card.style.transform = 'translateX(200px) rotate(20deg) scale(0.5)';
            card.style.opacity = '0';
            
            setTimeout(() => this.loadRandomRecipe(), 300);
        }
    },

    passCurrent() {
        // Просто загружаем следующий рецепт
        const card = document.querySelector('.swipe-card');
        if (card) {
            card.style.transform = 'translateX(-200px) rotate(-20deg) scale(0.5)';
            card.style.opacity = '0';
            
            setTimeout(() => this.loadRandomRecipe(), 300);
        }
    },

    // --- SEARCH PAGE: Search Logic ---
    setupSearchPage() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            // Добавляем слушатель для Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
            
            // Фокусируемся на поле ввода
            searchInput.focus();
        }
    },

    async performSearch(queryInput) {
        const query = queryInput || document.getElementById('search-input').value;
        const resultsGrid = document.getElementById('search-results');
        
        if (!resultsGrid) return;
        if (!query.trim()) {
            resultsGrid.innerHTML = `<div class="empty-state"><p>Enter a recipe name to search</p></div>`;
            return;
        }
        
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

    async showDetails(id) {
        const target = document.getElementById('details-target');
        
        // Если нет контейнера для деталей, переходим на отдельную страницу
        if (!target) {
            // Сохраняем ID в sessionStorage и переходим на details.html
            sessionStorage.setItem('selectedMealId', id);
            window.location.href = 'details.html';
            return;
        }

        target.innerHTML = `<div class="loader">Loading recipe secrets...</div>`;

        const data = await this.fetchData(`lookup.php?i=${id}`);
        if (!data || !data.meals) return;

        const meal = data.meals[0];
        
        // Парсим ингредиенты
        let ingredients = [];
        for (let i = 1; i <= 20 && meal[`strIngredient${i}`]; i++) 
            ingredients.push(`${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}`);

        const favsSnapshot = JSON.parse(localStorage.getItem('dishswipe_favs')) || [];
        const isFav = favsSnapshot.some(f => f.idMeal === meal.idMeal);
        this.detailMeal = meal;

        target.innerHTML = `
            <div class="details-container">
                <img src="${meal.strMealThumb}" class="details-img" alt="${meal.strMeal}">
                <div class="details-content">
                    <button class="btn btn-secondary" onclick="window.history.back()" style="margin-bottom:1rem; padding: 5px 15px; font-size:0.8rem">← Back</button>
                    <span class="tag">${meal.strCategory}</span>
                    <h1 style="margin: 10px 0">${meal.strMeal}</h1>
                    <p><strong>Origin:</strong> ${meal.strArea}</p>
                    
                    <h3 style="margin-top:2rem">Ingredients</h3>
                    <ul class="ingredients-list">
                        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>

                    <h3 style="margin-top:2rem">Instructions</h3>
                    <p class="details-text">${meal.strInstructions}</p>
                    
                    <div class="details-actions" style="display:flex; flex-wrap:wrap; gap:0.75rem; align-items:center; justify-content: space-between; margin-top:2rem;">
                        ${meal.strYoutube ? `
                            <a href="${meal.strYoutube}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-block; text-decoration:none">Watch on YouTube</a>
                        ` : ''}
                        <button type="button" id="detail-favorite-btn" class="action-btn ${isFav ? 'pass' : 'smash'}-btn" onclick="app.toggleDetailFavorite()">${isFav ? '✖' : '❤'}</button>
                    </div>
                </div>
            </div>
        `;
    },

    toggleDetailFavorite() {
        if (!this.detailMeal) return;
        const id = this.detailMeal.idMeal;
        let favs = JSON.parse(localStorage.getItem('dishswipe_favs')) || [];
        const idx = favs.findIndex(f => f.idMeal === id);
        if (idx >= 0) {
            favs.splice(idx, 1);
        } else {
            favs.push({ ...this.detailMeal });
        }
        this.favorites = favs;
        localStorage.setItem('dishswipe_favs', JSON.stringify(favs));

        const btn = document.getElementById('detail-favorite-btn');
        if (btn) {
            const nowFav = favs.some(f => f.idMeal === id);
            btn.textContent = nowFav ? '✖' : '❤';
            btn.classList.toggle('smash-btn', !nowFav);
            btn.classList.toggle('pass-btn', nowFav);
        }
        this.renderFavorites();
    },

    // --- DETAILS PAGE: Load meal details from sessionStorage ---
    loadDetailsPage() {
        const mealId = sessionStorage.getItem('selectedMealId');
        if (mealId) {
            this.showDetails(mealId);
            sessionStorage.removeItem('selectedMealId'); // Очищаем после использования
        }
    },

    // --- FAVORITES PAGE: Favorites Logic ---
    renderFavorites() {
        const grid = document.getElementById('favorites-results');
        if (!grid) return;

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
                    <button class="btn btn-secondary" style="margin-bottom:1rem; padding: 5px 15px; font-size:0.8rem" onclick="event.stopPropagation(); app.removeFavorite('${meal.idMeal}')">Remove</button>
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

// Запуск приложения
window.onload = () => app.init();
