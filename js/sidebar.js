// sidebar.js – Genesis-AI Sidebar Enhancer
// Adds collapsible sidebar, chat search, and user footer to Genesis-AI

(function() {
    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // ----- Identify Genesis-AI DOM elements -----
        // Sidebar container: it's a <div> with class "chat-sidebar" or similar.
        // Let's locate by known classes (from index.html)
        const sidebar = document.querySelector('.chat-sidebar') ||
                        document.querySelector('.sidebar') ||
                        document.querySelector('.history-sidebar');
        if (!sidebar) {
            console.warn('[Genesis Sidebar] Sidebar container not found');
            return;
        }

        // Chat list container (where conversation items are)
        const chatList = document.getElementById('chatList') ||
                         document.querySelector('.chat-list') ||
                         document.querySelector('.conversation-list');
        if (!chatList) {
            console.warn('[Genesis Sidebar] Chat list container not found');
            return;
        }

        // Original new chat button (its ID is "newChatBtn" in Genesis-AI)
        const newChatBtn = document.getElementById('newChatBtn');
        if (!newChatBtn) {
            console.warn('[Genesis Sidebar] New chat button not found');
            // We'll still continue, but no new chat functionality
        }

        // User icon container (exists in footer)
        const userIcon = document.getElementById('userIcon');
        // If userIcon not found, maybe we can create a placeholder or skip footer

        // ----- Inject minimal CSS for collapse & search -----
        const style = document.createElement('style');
        style.textContent = `
            /* Sidebar collapsed state */
            .genesis-sidebar.collapsed {
                width: 70px !important;
                min-width: 70px !important;
                transition: width 0.2s ease;
            }
            .genesis-sidebar.collapsed .sidebar-header .genesis-logo span,
            .genesis-sidebar.collapsed .sidebar-header .sidebar-controls .collapse-btn,
            .genesis-sidebar.collapsed .search-input-wrapper,
            .genesis-sidebar.collapsed .chat-list .chat-item .chat-title,
            .genesis-sidebar.collapsed .chat-list .chat-item .chat-time,
            .genesis-sidebar.collapsed .chat-list .chat-item .delete-btn,
            .genesis-sidebar.collapsed .sidebar-footer #userIcon span,
            .genesis-sidebar.collapsed .sidebar-footer .user-info {
                display: none !important;
            }
            .genesis-sidebar.collapsed .chat-list .chat-item {
                justify-content: center;
                padding: 8px 0;
            }
            .genesis-sidebar.collapsed .chat-list .chat-item svg,
            .genesis-sidebar.collapsed .chat-list .chat-item img {
                margin: 0 auto;
            }
            .genesis-sidebar.collapsed .collapsed-stack {
                display: flex;
                flex-direction: column;
                gap: 16px;
                align-items: center;
                margin: 16px 0;
            }
            .genesis-sidebar.collapsed .search-container .search-input-wrapper {
                display: none;
            }
            .genesis-sidebar.collapsed .sidebar-footer {
                justify-content: center;
                padding: 16px 0;
            }

            /* Search container */
            .search-container {
                position: relative;
                margin: 12px 8px;
            }
            .search-input-wrapper {
                position: relative;
                width: 100%;
            }
            .search-input {
                width: 100%;
                padding: 8px 28px 8px 12px;
                border: 1px solid var(--border-color, #e2e8f0);
                border-radius: 20px;
                background: var(--bg-secondary, #f9fafb);
                font-size: 14px;
            }
            .search-icon-overlay {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
                color: #94a3b8;
            }

            /* Collapsed stack (icons only) */
            .collapsed-stack {
                display: none;
            }
            .genesis-sidebar.collapsed .collapsed-stack {
                display: flex;
            }

            /* Icon button styles */
            .icon-btn {
                background: transparent;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                border-radius: 8px;
                color: inherit;
            }
            .icon-btn:hover {
                background: rgba(0,0,0,0.05);
            }

            /* Header controls */
            .sidebar-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 12px 0 12px;
                margin-bottom: 8px;
            }
            .sidebar-controls {
                display: flex;
                gap: 4px;
            }

            /* Genesis logo and text */
            .genesis-logo {
                display: flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                color: inherit;
                font-weight: bold;
            }
            .genesis-logo img {
                width: 32px;
                height: 32px;
            }
            .expand-icon {
                display: none;
            }
            .genesis-sidebar.collapsed .genesis-logo .expand-icon {
                display: block;
            }
            .genesis-sidebar.collapsed .genesis-logo span {
                display: none;
            }
        `;
        document.head.appendChild(style);

        // ----- Add class to sidebar for styling -----
        sidebar.classList.add('genesis-sidebar');

        // ----- Toggle function -----
        const toggleSidebar = () => {
            sidebar.classList.toggle('collapsed');
        };

        // ----- Hide original new chat button if it exists (optional) -----
        if (newChatBtn) newChatBtn.style.display = 'none';

        // ----- Create Sidebar Header -----
        let header = sidebar.querySelector('.sidebar-header');
        if (!header) {
            header = document.createElement('div');
            header.className = 'sidebar-header';
            sidebar.insertBefore(header, sidebar.firstChild);
        }

        // Logo
        let logoLink = header.querySelector('.genesis-logo');
        if (!logoLink) {
            logoLink = document.createElement('a');
            logoLink.href = 'https://xpdevs.github.io/Genesis-AI';
            logoLink.className = 'genesis-logo';
            logoLink.innerHTML = `
                <img src="https://xpdevs.github.io/Genesis-AI/icon.png" alt="Genesis">
                <div class="expand-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/></svg>
                </div>
                <span>Genesis AI</span>
            `;
            logoLink.onclick = (e) => {
                if (sidebar.classList.contains('collapsed')) {
                    e.preventDefault();
                    toggleSidebar();
                }
            };
            header.appendChild(logoLink);
        }

        // Controls container (new chat + collapse)
        let controls = header.querySelector('.sidebar-controls');
        if (!controls) {
            controls = document.createElement('div');
            controls.className = 'sidebar-controls';
            header.appendChild(controls);
        }

        // New Chat Icon
        let newChatIcon = controls.querySelector('.new-chat-icon');
        if (!newChatIcon) {
            newChatIcon = document.createElement('button');
            newChatIcon.className = 'icon-btn new-chat-icon';
            newChatIcon.title = 'New Chat';
            newChatIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';
            newChatIcon.onclick = () => {
                if (newChatBtn) newChatBtn.click();
            };
            controls.appendChild(newChatIcon);
        }

        // Collapse Icon
        let collapseBtn = controls.querySelector('.collapse-btn');
        if (!collapseBtn) {
            collapseBtn = document.createElement('button');
            collapseBtn.className = 'icon-btn collapse-btn';
            collapseBtn.title = 'Toggle Sidebar';
            collapseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/></svg>';
            collapseBtn.onclick = toggleSidebar;
            controls.appendChild(collapseBtn);
        }

        // ----- Search Container -----
        let searchContainer = sidebar.querySelector('.search-container');
        if (!searchContainer) {
            searchContainer = document.createElement('div');
            searchContainer.className = 'search-container';
            // Insert after header
            if (header.nextSibling) {
                sidebar.insertBefore(searchContainer, header.nextSibling);
            } else {
                sidebar.appendChild(searchContainer);
            }
        }

        // Expanded Search Input
        let searchWrapper = searchContainer.querySelector('.search-input-wrapper');
        if (!searchWrapper) {
            searchWrapper = document.createElement('div');
            searchWrapper.className = 'search-input-wrapper';
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search chats...';
            searchInput.className = 'search-input';
            const searchIcon = document.createElement('div');
            searchIcon.className = 'search-icon-overlay';
            searchIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
            searchWrapper.appendChild(searchInput);
            searchWrapper.appendChild(searchIcon);
            searchContainer.appendChild(searchWrapper);
        }

        // Collapsed Stack (icons for new chat & search)
        let collapsedStack = searchContainer.querySelector('.collapsed-stack');
        if (!collapsedStack) {
            collapsedStack = document.createElement('div');
            collapsedStack.className = 'collapsed-stack';
            searchContainer.appendChild(collapsedStack);
        }

        // New chat icon in collapsed mode (clone)
        let collapsedNewChat = collapsedStack.querySelector('.collapsed-new-chat');
        if (!collapsedNewChat) {
            collapsedNewChat = document.createElement('button');
            collapsedNewChat.className = 'icon-btn collapsed-new-chat';
            collapsedNewChat.title = 'New Chat';
            collapsedNewChat.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';
            collapsedNewChat.onclick = () => {
                if (newChatBtn) newChatBtn.click();
                if (sidebar.classList.contains('collapsed')) toggleSidebar(); // optional: expand
            };
            collapsedStack.appendChild(collapsedNewChat);
        }

        // Collapsed search button
        let collapsedSearch = collapsedStack.querySelector('.collapsed-search-btn');
        if (!collapsedSearch) {
            collapsedSearch = document.createElement('button');
            collapsedSearch.className = 'icon-btn collapsed-search-btn';
            collapsedSearch.title = 'Search';
            collapsedSearch.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
            collapsedSearch.onclick = () => {
                if (sidebar.classList.contains('collapsed')) {
                    toggleSidebar();
                }
                const searchInput = searchContainer.querySelector('.search-input');
                if (searchInput) setTimeout(() => searchInput.focus(), 200);
            };
            collapsedStack.appendChild(collapsedSearch);
        }

        // ----- Sidebar Footer -----
        let footer = sidebar.querySelector('.sidebar-footer');
        if (!footer) {
            footer = document.createElement('div');
            footer.className = 'sidebar-footer';
            sidebar.appendChild(footer);
        }

        // Move existing userIcon into footer (if found elsewhere)
        const existingUserIcon = document.getElementById('userIcon');
        if (existingUserIcon && !footer.contains(existingUserIcon)) {
            footer.appendChild(existingUserIcon);
        } else if (!footer.querySelector('#userIcon') && userIcon) {
            footer.appendChild(userIcon);
        }

        // ----- Search Filter Logic -----
        const searchInputElem = searchContainer.querySelector('.search-input');
        if (searchInputElem) {
            function filterChats() {
                const query = searchInputElem.value.trim().toLowerCase();
                const chatItems = chatList.querySelectorAll('.chat-item, .conversation-item, .history-item');
                chatItems.forEach(item => {
                    const titleElem = item.querySelector('.chat-title, .conversation-name, .title');
                    const title = titleElem ? titleElem.innerText.toLowerCase() : '';
                    if (query === '' || title.includes(query)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
            searchInputElem.addEventListener('input', filterChats);

            // Observe dynamic chat list updates (e.g., new chat, rename)
            const observer = new MutationObserver(() => {
                if (searchInputElem.value.trim() !== '') filterChats();
            });
            observer.observe(chatList, { childList: true, subtree: true });
        }

        console.log('[Genesis Sidebar] Enhanced sidebar initialized');
    }
})();
