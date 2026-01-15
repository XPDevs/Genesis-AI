/**
 * Sidebar Module for Genesis AI
 * Handles responsive animation and collapsed states
 */

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebarContainer');
    
    if (sidebar) {
        // Injecting the structure with a Toggle button and a span for the text
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <button id="toggleSidebarBtn">≡</button>
                <button id="newChatBtn">
                    <b>+</b> <span>New Chat</span>
                </button>
                <button id="settingsBtn">⚙️</button>
            </div>
            <ul id="chatList" class="chat-list"></ul>
        `;

        const toggleBtn = document.getElementById('toggleSidebarBtn');
        
        // Toggle Logic
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            
            // Optional: Save preference to localStorage
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('genesis_sidebar_collapsed', isCollapsed);
        });

        // Restore state from localStorage
        if (localStorage.getItem('genesis_sidebar_collapsed') === 'true') {
            sidebar.classList.add('collapsed');
        }

    } else {
        console.error("Sidebar container not found.");
    }
});
