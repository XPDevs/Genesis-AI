(function() {
    // 1. Hide the body content immediately
    const style = document.createElement('style');
    style.innerHTML = `
        body { 
            visibility: hidden !important; 
            overflow: hidden !important; 
        }
        #xpdevs-loading-overlay { 
            visibility: visible !important; 
        }
    `;
    document.head.appendChild(style);

    // 2. Create the overlay container
    const overlay = document.createElement('div');
    overlay.id = 'xpdevs-loading-overlay';
    
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        zIndex: '2147483647', // Maximum possible z-index
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        visibility: 'visible'
    });

    // 3. Create the icon
    const icon = document.createElement('img');
    icon.src = 'https://xpdevs.github.io/Genesis-AI/icon.png';
    Object.assign(icon.style, {
        width: '80px',
        height: '80px',
        borderRadius: '12px',
        transition: 'opacity 0.8s ease-in-out',
        opacity: '1'
    });

    overlay.appendChild(icon);
    document.documentElement.appendChild(overlay);

    // 4. Final reveal logic
    window.addEventListener('load', function() {
        // Wait 2 seconds after load
        setTimeout(() => {
            // Fade out the icon
            icon.style.opacity = '0';
            
            // Wait for icon fade to finish, then reveal site
            setTimeout(() => {
                overlay.remove();
                style.remove(); // Removes the hidden/overflow rules
                document.body.style.visibility = 'visible';
            }, 800); 
        }, 2000); 
    });
})();
