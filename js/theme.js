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
    // befor the Default css was called coommon so wwe dont want it to brake on other people computers that used the app before and saved it as common.css so this fixes it for them
    normalizeHref(href) {
        return href === 'styles/common.css' ? this.DEFAULT : href;
    },
    SWITCH_MS: 280, // Theme transition timing milli seconds
    //gets curtent selected theme
    getCurrent() {
        const stored = this.normalizeHref(localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT); 
        return this.VALID.has(stored) ? stored : this.DEFAULT;
    },

    isActiveHref(link, href) {
        const attr = link.getAttribute('href');
        if (attr === href) return true;
        try {
            //fixes return of http://localhost/styles/default.css we dont whant the ttp://localhost bull shit
            return new URL(link.href, window.location.href).pathname.endsWith(href);
        } catch {
            return link.href.endsWith(href);
        }
    },
    //this is the main and the REALY Importent function you ccould say its main it changes the theme
    apply(href, animate = true) {
        href = this.normalizeHref(href);
        //User selected a theme that is already applied
        if (!this.VALID.has(href)) return Promise.resolve();
        //gets the link that the themes-init created
        const link = document.getElementById('theme-stylesheet');
        if (!link) return Promise.resolve();
               //if the theme is active then 
        if (this.isActiveHref(link, href)) {
            //Save Theme localy to dishswipe_theme
            localStorage.setItem(this.STORAGE_KEY, href);
            //Highlight Selected Option so it will be preaty
            this.markActiveOption(href);
            //stops the finction from continuing 
            return Promise.resolve();
        }
        // gets the html file so root = the whole document root this way we can apply css to the html file
        const root = document.documentElement;
        //save 
        localStorage.setItem(this.STORAGE_KEY, href);
        // and mark for visual
        this.markActiveOption(href);
        //the changer of the css style Promise is like a async it will call resolve after it finished   
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
        // if we dont whant animation its here 
        if (!animate) return swap();
        // css animation
        root.classList.add('theme-switching');
            //waits for animation and clean up
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
        // adds or removes css class is active for visual 
    markActiveOption(href) {
        document.querySelectorAll('.theme-option').forEach((btn) => {
            const isActive = btn.dataset.themeHref === href;
            btn.classList.toggle('is-active', isActive);
            // for accesability => aria-selected
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
            // prevents document.addEventListener to overide the button click and backwords
            e.stopPropagation();
            
            const open = menu.hidden;
            menu.hidden = !open;
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        menu.querySelectorAll('.theme-option').forEach((option) => {
            option.addEventListener('click', async (e) => {
             // prevents document.addEventListener to overide the click and backwords
                e.stopPropagation();
                
                const optionHref = option.dataset.themeHref;
                menu.hidden = true;
              
                btn.setAttribute('aria-expanded', 'false');
                // calles apply to changge the theme
                await this.apply(optionHref, true);
            });
        });

        // click any were els closes the menu
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
