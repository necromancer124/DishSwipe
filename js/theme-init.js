/**
 * Runs in <head> before paint — applies saved theme and prevents flash.
 */
(function () {
    const STORAGE_KEY = 'dishswipe_theme';
    const DEFAULT_THEME = 'styles/default.css';
    const VALID_THEMES = new Set([
        'styles/default.css',
        'styles/theme_kawaii.css',
        'styles/theme_neo.css'
    ]);

    let href = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    if (href === 'styles/common.css') {
        href = DEFAULT_THEME;
        localStorage.setItem(STORAGE_KEY, DEFAULT_THEME);
    }
    if (!VALID_THEMES.has(href)) {
        href = DEFAULT_THEME;
    }

    document.documentElement.classList.add('theme-preload');

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = 'theme-stylesheet';

    function reveal() {
        document.documentElement.classList.remove('theme-preload');
    }

    link.addEventListener('load', reveal);

    link.addEventListener('error', function onError() {
        if (href !== DEFAULT_THEME) {
            link.href = DEFAULT_THEME;
            localStorage.setItem(STORAGE_KEY, DEFAULT_THEME);
        } else {
            document.documentElement.classList.remove('theme-preload');
        }
        link.removeEventListener('error', onError);
    });

    document.head.appendChild(link);

    if (link.sheet) {
        reveal();
    }
})();
