/**
 * Theme switcher: persistence, menu UI, smooth transitions.
 */
const Theme = {
    STORAGE_KEY: 'dishswipe_theme',
    DEFAULT: 'styles/common.css',
    VALID: new Set([
        'styles/common.css',
        'styles/theme_kawaii.css',
        'styles/theme_neo.css'
    ]),
    SWITCH_MS: 280,

    getCurrent() {
        const stored = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT;
        return this.VALID.has(stored) ? stored : this.DEFAULT;
    },

    isActiveHref(link, href) {
        const attr = link.getAttribute('href');
        if (attr === href) return true;
        try {
            return new URL(link.href, window.location.href).pathname.endsWith(href);
        } catch {
            return link.href.endsWith(href);
        }
    },

    apply(href, animate = true) {
        if (!this.VALID.has(href)) return Promise.resolve();

        const link = document.getElementById('theme-stylesheet');
        if (!link) return Promise.resolve();

        if (this.isActiveHref(link, href)) {
            localStorage.setItem(this.STORAGE_KEY, href);
            this.markActiveOption(href);
            return Promise.resolve();
        }

        const root = document.documentElement;
        localStorage.setItem(this.STORAGE_KEY, href);
        this.markActiveOption(href);

        const swap = () => new Promise((resolve) => {
            let settled = false;
            const done = () => {
                if (settled) return;
                settled = true;
                clearTimeout(fallback);
                link.removeEventListener('load', done);
                link.removeEventListener('error', done);
                resolve();
            };
            const fallback = setTimeout(done, 800);
            link.addEventListener('load', done);
            link.addEventListener('error', done);
            link.href = href;
        });

        if (!animate) return swap();

        root.classList.add('theme-switching');

        return new Promise((resolve) => {
            setTimeout(() => {
                swap().then(() => {
                    requestAnimationFrame(() => {
                        root.classList.remove('theme-switching');
                        setTimeout(resolve, this.SWITCH_MS);
                    });
                });
            }, this.SWITCH_MS);
        });
    },

    markActiveOption(href) {
        document.querySelectorAll('.theme-option').forEach((btn) => {
            const isActive = btn.dataset.themeHref === href;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    },

    bindSwitcher(root) {
        const btn = root.querySelector('#theme-switcher-btn');
        const menu = root.querySelector('#theme-switcher-menu');
        if (!btn || !menu) return;

        this.markActiveOption(this.getCurrent());

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = menu.hidden;
            menu.hidden = !open;
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        menu.querySelectorAll('.theme-option').forEach((option) => {
            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                const optionHref = option.dataset.themeHref;
                menu.hidden = true;
                btn.setAttribute('aria-expanded', 'false');
                await this.apply(optionHref, true);
            });
        });

        root.addEventListener('click', (e) => e.stopPropagation());

        document.addEventListener('click', () => {
            if (!menu.hidden) {
                menu.hidden = true;
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menu.hidden) {
                menu.hidden = true;
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }
};
