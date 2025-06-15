/**
 * Sidenotes System
 * 
 * Features:
 * - Desktop: Notes appear in right margin
 * - Mobile: Notes appear inline as toggleable elements
 * - Smooth positioning and transitions
 * - Accessible keyboard navigation
 * - Automatic numbering and referencing
 */

(function() {
    'use strict';
    
    // Configuration
    const MOBILE_BREAKPOINT = 1400; // px
    const SIDENOTE_OFFSET = 20; // px vertical offset
    
    /**
     * Checks if we're on mobile viewport
     */
    function isMobile() {
        return window.innerWidth < MOBILE_BREAKPOINT;
    }
    
    /**
     * Positions a sidenote on desktop
     */
    function positionSidenote(ref, note) {
        if (isMobile()) return;
        
        const refRect = ref.getBoundingClientRect();
        const noteHeight = note.offsetHeight;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate optimal position
        let targetTop = refRect.top + scrollY - SIDENOTE_OFFSET;
        
        // Check for collisions with previous sidenotes
        const previousNotes = Array.from(document.querySelectorAll('.sidenote'))
            .filter(n => n !== note && n.offsetTop < targetTop);
        
        if (previousNotes.length > 0) {
            const lastNote = previousNotes[previousNotes.length - 1];
            const lastBottom = lastNote.offsetTop + lastNote.offsetHeight + SIDENOTE_OFFSET;
            
            if (targetTop < lastBottom) {
                targetTop = lastBottom;
            }
        }
        
        note.style.top = `${targetTop - note.parentElement.offsetTop}px`;
    }
    
    /**
     * Creates sidenote HTML structure
     */
    function createSidenote(content, number) {
        const note = document.createElement('aside');
        note.className = 'sidenote';
        note.setAttribute('role', 'note');
        note.setAttribute('aria-label', `Sidenote ${number}`);
        
        const noteNumber = document.createElement('span');
        noteNumber.className = 'sidenote-number';
        noteNumber.textContent = number;
        
        const noteContent = document.createElement('span');
        noteContent.innerHTML = ` ${content}`;
        
        note.appendChild(noteNumber);
        note.appendChild(noteContent);
        
        return note;
    }
    
    /**
     * Creates sidenote reference
     */
    function createSidenoteRef(number) {
        const ref = document.createElement('sup');
        ref.className = 'sidenote-ref';
        ref.textContent = number;
        ref.setAttribute('role', 'button');
        ref.setAttribute('aria-label', `Show sidenote ${number}`);
        ref.setAttribute('tabindex', '0');
        
        return ref;
    }
    
    /**
     * Toggles mobile sidenote visibility
     */
    function toggleMobileSidenote(ref, note) {
        const isActive = note.classList.contains('active');
        
        // Hide all other active sidenotes
        document.querySelectorAll('.sidenote.active').forEach(n => {
            if (n !== note) n.classList.remove('active');
        });
        
        // Toggle current sidenote
        note.classList.toggle('active');
        
        // Update ARIA
        ref.setAttribute('aria-expanded', !isActive);
        
        // Smooth scroll to note if opening
        if (!isActive && note.getBoundingClientRect().top > window.innerHeight) {
            note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    /**
     * Process all sidenotes in the document
     */
    function processSidenotes() {
        const container = document.querySelector('.content article');
        if (!container) return;
        
        // Find all sidenote markers
        const markers = container.querySelectorAll('.sidenote-mark');
        
        markers.forEach((marker, index) => {
            const number = index + 1;
            const content = marker.getAttribute('data-content') || marker.innerHTML;
            
            // Create reference and note
            const ref = createSidenoteRef(number);
            const note = createSidenote(content, number);
            
            // Replace marker with reference
            marker.parentNode.replaceChild(ref, marker);
            
            // Insert note
            if (isMobile()) {
                // On mobile, insert after the paragraph
                const paragraph = ref.closest('p') || ref.parentNode;
                paragraph.parentNode.insertBefore(note, paragraph.nextSibling);
            } else {
                // On desktop, append to container
                container.appendChild(note);
                requestAnimationFrame(() => positionSidenote(ref, note));
            }
            
            // Event handlers
            const handleActivation = () => {
                if (isMobile()) {
                    toggleMobileSidenote(ref, note);
                } else {
                    // On desktop, highlight the note
                    note.style.opacity = '0.5';
                    setTimeout(() => {
                        note.style.opacity = '';
                    }, 1000);
                }
            };
            
            ref.addEventListener('click', handleActivation);
            ref.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleActivation();
                }
            });
        });
    }
    
    /**
     * Reposition all sidenotes (for responsive changes)
     */
    function repositionSidenotes() {
        if (isMobile()) return;
        
        const refs = document.querySelectorAll('.sidenote-ref');
        const notes = document.querySelectorAll('.sidenote');
        
        refs.forEach((ref, index) => {
            if (notes[index]) {
                positionSidenote(ref, notes[index]);
            }
        });
    }
    
    /**
     * Initialize sidenotes system
     */
    function init() {
        processSidenotes();
        
        // Handle resize events
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                repositionSidenotes();
            }, 250);
        });
        
        // Handle print events
        window.addEventListener('beforeprint', () => {
            document.querySelectorAll('.sidenote').forEach(note => {
                note.classList.add('active');
            });
        });
        
        window.addEventListener('afterprint', () => {
            if (isMobile()) {
                document.querySelectorAll('.sidenote').forEach(note => {
                    note.classList.remove('active');
                });
            }
        });
    }
    
    // Utility function to add sidenotes programmatically
    window.addSidenote = function(element, content) {
        const marker = document.createElement('span');
        marker.className = 'sidenote-mark';
        marker.setAttribute('data-content', content);
        
        if (element.nodeType === Node.TEXT_NODE) {
            element.parentNode.insertBefore(marker, element.nextSibling);
        } else {
            element.appendChild(marker);
        }
        
        processSidenotes();
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for potential programmatic use
    window.sidenotes = {
        process: processSidenotes,
        reposition: repositionSidenotes
    };
})();