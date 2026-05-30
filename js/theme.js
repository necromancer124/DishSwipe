/**
 * Theme switcher: persistence, menu UI, smooth transitions.
 */
const Theme = {
    STORAGE_KEY: 'dishswipe_theme',
    DEFAULT: 'styles/default.css',
    VALID: new Set([
        'styles/default.css',
        'styles/theme_kawaii.css',
        'styles/theme_neo.css'
    ]),
    // dosnt allow to load common as a theme (becoese it just common values for all themes)
    normalizeHref(href) {
        return href === 'styles/common.css' ? this.DEFAULT : href;
    },
    SWITCH_MS: 280, // Theme transition timing miliseconds

    // Getting the theme from local storage
    getCurrent() {
        const stored = this.normalizeHref(localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT); 
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

    // The main function for applying the needed theme
    apply(href, animate = true) {
        href = this.normalizeHref(href);

        // Exiting if the selected theme isn't valid
        if (!this.VALID.has(href)) return Promise.resolve();

        // gets the link that the themes-init created
        const link = document.getElementById('theme-stylesheet');

        if (!link) return Promise.resolve();

        if (this.isActiveHref(link, href)) { // if the theme is already active then 
            // Save the theme to the local storage 
            localStorage.setItem(this.STORAGE_KEY, href);
            // Highlight the selected option visually
            this.markActiveOption(href);
            
            return Promise.resolve();
        }

        // Gets the html file so root = the whole document root this way we can apply css to the html file
        const root = document.documentElement;
        //save 
        localStorage.setItem(this.STORAGE_KEY, href);
        // and mark for visual
        this.markActiveOption(href);

        // This function loads the new CSS file. It returns a promise, so we can wait for the file to actually load
        const swap = () => new Promise((resolve) => {
            // flag so it will do its job ones
            let settled = false;
            //the clean up what we call when the event heppends when a listener is trigered
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

        // without the animation, the function will exit here
        if (!animate) return swap();
        // css animation
        root.classList.add('theme-switching');
        // waits for animation and clean up
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

    // Marks only the needed theme as active
    markActiveOption(href) {
        document.querySelectorAll('.theme-option').forEach((btn) => {
            const isActive = btn.dataset.themeHref === href;
            btn.classList.toggle('is-active', isActive);
            // for accesability -> aria-selected
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    },

    bindSwitcher(root) {
        const btn = root.querySelector('#theme-switcher-btn');
        const menu = root.querySelector('#theme-switcher-menu');
        if (!btn || !menu) return;
        // mark the curent theme batton
        this.markActiveOption(this.getCurrent());
        // Open/Close Menu
        btn.addEventListener('click', (e) => {
            // prevents document.addEventListener to override the button click and backwards
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
                // calls apply to change the theme
                await this.apply(optionHref, true);
            });
        });

        // click anywhere else closes the menu
        document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
            menu.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
            }
        });
        // same for esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menu.hidden) {
                menu.hidden = true;
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }
};
