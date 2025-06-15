/**
 * Dark Mode Toggle
 * 
 * Features:
 * - Three modes: light, dark, auto (follows system preference)
 * - Persists user preference in localStorage
 * - No flash of unstyled content
 * - Smooth transitions between modes
 * - Intelligent image inversion (excludes graphs/diagrams with data-no-invert)
 */

(function() {
    'use strict';
    
    // Constants
    const STORAGE_KEY = 'theme-preference';
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark',
        AUTO: 'auto'
    };
    
    // State
    let currentTheme = localStorage.getItem(STORAGE_KEY) || THEMES.AUTO;
    
    // DOM elements
    const toggle = document.getElementById('theme-toggle');
    const root = document.documentElement;
    
    /**
     * Detects system color scheme preference
     */
    function getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
    }
    
    /**
     * Applies theme to the document
     */
    function applyTheme(theme) {
        const effectiveTheme = theme === THEMES.AUTO ? getSystemPreference() : theme;
        
        if (effectiveTheme === THEMES.DARK) {
            root.classList.add('dark-mode');
        } else {
            root.classList.remove('dark-mode');
        }
        
        // Update toggle button text
        if (toggle) {
            const modeText = theme === THEMES.AUTO ? 'auto' : theme;
            toggle.setAttribute('title', `Theme: ${modeText}`);
            toggle.setAttribute('aria-label', `Toggle theme (current: ${modeText})`);
        }
    }
    
    /**
     * Cycles through theme options
     */
    function cycleTheme() {
        const themeOrder = [THEMES.LIGHT, THEMES.DARK, THEMES.AUTO];
        const currentIndex = themeOrder.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        
        currentTheme = themeOrder[nextIndex];
        localStorage.setItem(STORAGE_KEY, currentTheme);
        applyTheme(currentTheme);
        
        // Visual feedback
        if (toggle) {
            toggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                toggle.style.transform = '';
            }, 150);
        }
    }
    
    /**
     * Initialize theme system
     */
    function init() {
        // Apply initial theme
        applyTheme(currentTheme);
        
        // Set up toggle button
        if (toggle) {
            toggle.addEventListener('click', cycleTheme);
            
            // Keyboard support
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    cycleTheme();
                }
            });
        }
        
        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', () => {
                if (currentTheme === THEMES.AUTO) {
                    applyTheme(THEMES.AUTO);
                }
            });
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(() => {
                if (currentTheme === THEMES.AUTO) {
                    applyTheme(THEMES.AUTO);
                }
            });
        }
        
        // Handle theme changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                currentTheme = e.newValue;
                applyTheme(currentTheme);
            }
        });
    }
    
    /**
     * Utility function to mark images that shouldn't be inverted
     * Usage: markNoInvert(document.querySelectorAll('.graph, .chart, [data-no-invert]'));
     */
    window.markNoInvert = function(elements) {
        elements.forEach(el => {
            if (el.tagName === 'IMG' || el.querySelector('img')) {
                el.setAttribute('data-no-invert', 'true');
            }
        });
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for potential programmatic use
    window.themeManager = {
        get: () => currentTheme,
        set: (theme) => {
            if (Object.values(THEMES).includes(theme)) {
                currentTheme = theme;
                localStorage.setItem(STORAGE_KEY, theme);
                applyTheme(theme);
            }
        },
        toggle: cycleTheme
    };
})();