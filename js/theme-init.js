/**
 * Runs in <head> before paint — applies saved theme and prevents flash.
 * IIFE = runs immediately on page load
 */
(function () {

    // Key used to store selected theme in browser storage
    const STORAGE_KEY = 'dishswipe_theme';

    // Default theme used when nothing is saved or when existing data is invalid
    const DEFAULT_THEME = 'styles/default.css';

    // Allowed / safe themes only
    const VALID_THEMES = new Set([
        'styles/default.css',
        'styles/theme_kawaii.css',
        'styles/theme_neo.css'
    ]);

    // Load saved theme from localStorage, fallback to default
    let href = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;

    // Prevent any usage of invalid theme href
    if (!VALID_THEMES.has(href)) {
        href = DEFAULT_THEME;
    }

    // Create stylesheet link dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = 'theme-stylesheet';

    // If CSS fails to load → fallback handling
    link.addEventListener('error', function onError() {
        // If current theme is not default, switch to default
        if (href !== DEFAULT_THEME) {
            link.href = DEFAULT_THEME;
            localStorage.setItem(STORAGE_KEY, DEFAULT_THEME);
        }

        // Clean up listener to avoid repeated triggers
        link.removeEventListener('error', onError);
    });

    // Inject stylesheet into document head (starts loading CSS)
    document.head.appendChild(link);
})();
