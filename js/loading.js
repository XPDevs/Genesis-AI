(function() {
    // 1. Create the overlay container
    const overlay = document.createElement('div');
    overlay.id = 'xpdevs-loading-overlay';
    
    // 2. Style the overlay (Black screen)
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        zIndex: '99999',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'opacity 0.8s ease-in-out',
        opacity: '0' // Start at 0 for the fade-in effect
    });

    // 3. Create the icon image
    const icon = document.createElement('img');
    icon.src = 'https://xpdevs.github.io/Gensis-AI/icon.png';
    Object.assign(icon.style, {
        width: '80px',
        height: '80px',
        marginBottom: '20px',
        borderRadius: '12px' // Matches your preference for rounded UI
    });

    // 4. Assemble the overlay
    overlay.appendChild(icon);
    document.documentElement.appendChild(overlay);

    // 5. Trigger Fade In immediately
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    });

    // 6. Fade Out logic once everything (images, scripts, etc.) is finished
    window.addEventListener('load', function() {
        // Small delay to ensure the user actually sees the icon if the load is instant
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 800); // Wait for the opacity transition to finish before removing
        }, 500); 
    });
})();
