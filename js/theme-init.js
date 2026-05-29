/**
 * Runs in <head> before paint — applies saved theme and prevents flash.
 * IIFE = runs immediately on page load
 */
(function () {

    // Key used to store selected theme in browser storage
    const STORAGE_KEY = 'dishswipe_theme';

    // Default theme used when nothing is saved or invalid value exists
    const DEFAULT_THEME = 'styles/default.css';

    // Allowed / safe themes only (prevents loading random CSS)
    const VALID_THEMES = new Set([
        'styles/default.css',
        'styles/theme_kawaii.css',
        'styles/theme_neo.css'
    ]);

    // Load saved theme from localStorage, fallback to default
    let href = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;

    // Legacy fix: old version used "common.css"
    if (href === 'styles/common.css') {
        href = DEFAULT_THEME;
        localStorage.setItem(STORAGE_KEY, DEFAULT_THEME);
    }

    // Validate theme (fallback if corrupted or invalid value)
    if (!VALID_THEMES.has(href)) {
        href = DEFAULT_THEME;
    }

    // Add preload class to prevent flash of wrong/unstyled content
    document.documentElement.classList.add('theme-preload');

    // Create stylesheet link dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = 'theme-stylesheet';

    // Called when CSS successfully loads
    function reveal() {
        document.documentElement.classList.remove('theme-preload');
    }

    // When CSS file loads successfully → show page
    link.addEventListener('load', reveal);

    // If CSS fails to load → fallback handling
    link.addEventListener('error', function onError() {

        // If current theme is not default, switch to default
        if (href !== DEFAULT_THEME) {
            link.href = DEFAULT_THEME;
            localStorage.setItem(STORAGE_KEY, DEFAULT_THEME);
        } else {
            // If even default fails, just show page anyway
            document.documentElement.classList.remove('theme-preload');
        }

        // Clean up listener to avoid repeated triggers
        link.removeEventListener('error', onError);
    });

    // Inject stylesheet into document head (starts loading CSS)
    document.head.appendChild(link);

    // If CSS is already cached and available, reveal immediately
    if (link.sheet) {
        reveal();
    }

})();
