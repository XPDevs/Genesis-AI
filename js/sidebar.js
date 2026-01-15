/**
 * Sidebar Module for Genesis AI
 * XPDevs Custom UI
 */

(function() {
    const sidebar = document.getElementById('sidebarContainer');
    
    if (sidebar) {
        sidebar.innerHTML = `
            <div class="sidebar-header" style="display: flex; flex-direction: column; gap: 10px; padding: 15px;">
                <div style="display: flex; gap: 8px; width: 100%;">
                    <button id="toggleSidebarBtn" style="background:none; border:none; color:white; cursor:pointer; font-size:1.5rem;">≡</button>
                    <button id="newChatBtn" style="flex-grow:1; background:#333; color:white; border:none; border-radius:10px; padding:10px; cursor:pointer; overflow:hidden;">
                        <b>+</b> <span class="nav-text">New Chat</span>
                    </button>
                </div>
                <button id="settingsBtn" style="background:#333; color:white; border:none; border-radius:10px; padding:10px; cursor:pointer; width: 100%;">
                    ⚙️ <span class="nav-text">Settings</span>
                </button>
            </div>
            <ul id="chatList" class="chat-list" style="list-style:none; padding:10px; margin:0; flex-grow:1; overflow-y:auto;"></ul>
        `;

        const toggleBtn = document.getElementById('toggleSidebarBtn');
        const navTexts = document.querySelectorAll('.nav-text');

        const applyState = (isCollapsed) => {
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
                navTexts.forEach(t => t.style.display = 'none');
            } else {
                sidebar.classList.remove('collapsed');
                navTexts.forEach(t => t.style.display = 'inline');
            }
        };

        toggleBtn.addEventListener('click', () => {
            const willCollapse = !sidebar.classList.contains('collapsed');
            applyState(willCollapse);
            localStorage.setItem('genesis_sidebar_collapsed', willCollapse);
        });

        // Initialize state
        const savedState = localStorage.getItem('genesis_sidebar_collapsed') === 'true';
        applyState(savedState);
    }
})();
