/* animations.js - Handles all the smooth moves & Juicy Effects */

const Visuals = {
    
    // --- 1. PARTICLES (The "Juice") ---
    spawnParticles: (x, y, color) => {
        const container = document.body;
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.width = Math.random() * 6 + 4 + 'px';
            p.style.height = p.style.width;
            p.style.background = color;
            p.style.borderRadius = '50%';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '999';
            container.appendChild(p);

            anime({
                targets: p,
                translateX: () => anime.random(-60, 60),
                translateY: () => anime.random(-60, 60),
                scale: [1, 0],
                opacity: [1, 0],
                duration: anime.random(600, 1000),
                easing: 'easeOutExpo',
                complete: () => p.remove()
            });
        }
    },

    // --- 2. SCREEN TRANSITIONS ---
    animateScreenChange: (viewId) => {
        document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
        
        const target = document.querySelector(viewId);
        if (!target) return;
        
        target.style.display = 'flex';
        target.style.opacity = '0';
        
        // Animate elements INSIDE the screen staggering in
        anime({
            targets: target.children,
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 800,
            delay: anime.stagger(100), 
            easing: 'easeOutElastic(1, .8)'
        });
        
        anime({
            targets: target,
            opacity: 1,
            duration: 400,
            easing: 'linear'
        });
    },

    // --- 3. BINGO GRID ENTRY ---
    animateGridEntry: () => {
        anime({
            targets: '.tile',
            scale: [0, 1],
            opacity: [0, 1],
            translateY: [50, 0],
            delay: anime.stagger(60, {grid: [5, 5], from: 'center'}),
            duration: 900,
            easing: 'easeOutElastic(1, .6)' 
        });
    },

    // --- 4. CLICKING A TILE ---
    animateTileClick: (element, isMarked) => {
        const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim();
        const tileBg = getComputedStyle(document.body).getPropertyValue('--tile-bg').trim();
        const textColor = getComputedStyle(document.body).getPropertyValue('--text').trim();

        if (isMarked) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            Visuals.spawnParticles(centerX, centerY, primaryColor);

            anime({
                targets: element,
                scale: [
                    {value: 0.8, duration: 100},
                    {value: 1.1, duration: 150},
                    {value: 1, duration: 100}
                ],
                backgroundColor: primaryColor,
                color: '#FFF',
                boxShadow: `0 0 20px ${primaryColor}`,
                easing: 'easeInOutQuad'
            });
        } else {
            anime({
                targets: element,
                scale: [0.9, 1],
                backgroundColor: tileBg,
                color: textColor,
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                duration: 200,
                easing: 'easeOutQuad'
            });
        }
    },

    // --- 5. INVALID ACTION (Shake) ---
    shakeElement: (element) => {
        anime({
            targets: element,
            translateX: [
                { value: -10, duration: 50 },
                { value: 10, duration: 50 },
                { value: -10, duration: 50 },
                { value: 10, duration: 50 },
                { value: 0, duration: 50 }
            ],
            easing: 'easeInOutQuad'
        });
    },

    // --- 6. WINNING LINE HIGHLIGHT ---
    animateWinLine: (indices) => {
        const allTiles = document.querySelectorAll('#game-grid .tile');
        const tilesToAnimate = [];
        
        indices.forEach(idx => {
            if(allTiles[idx]) tilesToAnimate.push(allTiles[idx]);
        });

        anime({
            targets: tilesToAnimate,
            scale: [1, 1.1, 1],
            direction: 'alternate',
            loop: 2,
            duration: 400,
            easing: 'easeInOutSine',
            filter: ['brightness(1)', 'brightness(1.5)']
        });
    },

    // --- 7. BINGO LETTER JUMP ---
    animateLetter: (selector) => {
        anime({
            targets: selector,
            translateY: [0, -15, 0],
            color: getComputedStyle(document.body).getPropertyValue('--primary'),
            opacity: 1,
            scale: [1, 1.5, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .5)'
        });
    },

    // --- 8. THEME SWITCH (GRENADE EXPLOSION STYLE) ---
    animateThemeSwitch: (themeName, originElement) => {
        const body = document.body;
        
        // 1. Get Origin Coordinates (Where the "grenade" comes from)
        const rect = originElement.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        
        // 2. Create the "Grenade"
        const grenade = document.createElement('div');
        grenade.style.position = 'fixed';
        grenade.style.left = startX + 'px';
        grenade.style.top = startY + 'px';
        grenade.style.width = '20px';
        grenade.style.height = '20px';
        grenade.style.borderRadius = '50%';
        grenade.style.zIndex = '9999';
        
        // Set grenade color based on target theme
        const colors = {
            'theme-peach': '#ff9a9e',
            'theme-midnight': '#0f172a',
            'theme-sage': '#9caf88'
        };
        grenade.style.backgroundColor = colors[themeName];
        grenade.style.boxShadow = `0 0 10px ${colors[themeName]}`;
        document.body.appendChild(grenade);

        // 3. THROW ANIMATION (Arc to Center)
        const timeline = anime.timeline({
            easing: 'easeOutQuad'
        });

        timeline
        .add({
            targets: grenade,
            left: window.innerWidth / 2 - 10, // Center X (minus half width)
            top: window.innerHeight / 2 - 10, // Center Y
            width: 40,  // Grow slightly while flying
            height: 40,
            rotate: 720, // Spin like a throwable
            duration: 600,
            easing: 'easeInBack' // Pull back then shoot
        })
        // 4. EXPLOSION (Screen Fill)
        .add({
            targets: grenade,
            scale: 60, // Massive expansion covering screen
            opacity: 1,
            duration: 500,
            easing: 'easeOutExpo',
            complete: () => {
                // 5. CHANGE ACTUAL THEME (Hidden behind the explosion)
                body.classList.remove('theme-sage', 'theme-midnight', 'theme-peach');
                body.classList.add(themeName);
                
                // Spin background pattern for extra effect
                anime({
                    targets: '.bg-pattern-layer',
                    rotate: '+=180deg',
                    duration: 2000
                });
            }
        })
        // 6. FADE OUT THE EXPLOSION
        .add({
            targets: grenade,
            opacity: 0,
            duration: 400,
            easing: 'linear',
            complete: () => grenade.remove() // Cleanup
        });
    },

    // --- 9. AMBIENT CARD EFFECTS (New! Subtle polish) ---
    initAmbientEffects: () => {
        // Makes the glass panel feel "alive" or "breathing" 
        // especially useful for mobile where background is hidden.
        
        // 1. Subtle Floating/Breathing Motion
        anime({
            targets: '.glass-panel',
            translateY: [0, -3], // Moves up and down very slightly
            boxShadow: [
                '0 8px 32px 0 rgba(0, 0, 0, 0.2)', // Standard shadow
                '0 12px 40px 0 rgba(0, 0, 0, 0.25)' // Slightly deeper shadow
            ],
            borderColor: [
                'rgba(255, 255, 255, 0.18)',
                'rgba(255, 255, 255, 0.3)' // Border gets slightly brighter
            ],
            direction: 'alternate',
            loop: true,
            duration: 4000, // Very slow 4 second cycle
            easing: 'easeInOutSine'
        });

        // 2. Slow Background Gradient Shift on the body
        // This adds a very subtle color shift to the whole page
        anime({
            targets: 'body',
            backgroundPosition: ['0% 50%', '100% 50%'],
            direction: 'alternate',
            loop: true,
            duration: 20000,
            easing: 'linear'
        });
    }
};

// --- INITIALIZE LISTENERS ---
// Make sure this runs after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    
    // Theme Toggles
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;
            if(theme) Visuals.animateThemeSwitch(theme, e.target);
        });
    });

    // Start Ambient Effects
    Visuals.initAmbientEffects();
});