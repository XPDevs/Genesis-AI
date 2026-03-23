function setupSidebarUI() {
    // Inject Sidebar CSS
    const style = document.createElement('style');
    style.textContent = `
        .sidebar-footer {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            padding: 12px 16px;
            margin-top: auto;
            width: 100%;
            box-sizing: border-box;
        }
        .genesis-sidebar.collapsed .sidebar-footer {
            flex-direction: column;
            justify-content: center;
            gap: 16px;
            padding: 16px 0;
        }
        .genesis-sidebar.collapsed #userIcon {
            width: 40px;
            height: 40px;
        }
    `;
    document.head.appendChild(style);

    const chatList = document.getElementById("chatList");
    const sidebar = chatList ? chatList.parentElement : null;
    if (!sidebar) return;
    
    sidebar.classList.add('genesis-sidebar');
    
    const toggleSidebar = () => {
        sidebar.classList.toggle('collapsed');
    };

    // Hide original new chat button if it exists
    const newChatBtn = document.getElementById("newChatBtn");
    if (newChatBtn) newChatBtn.style.display = 'none';

    // Create Header
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    
    // Logo
    const logoLink = document.createElement('a');
    logoLink.href = 'https://xpdevs.github.io/Genesis-AI';
    logoLink.className = 'genesis-logo';
    logoLink.innerHTML = `
        <img src="https://xpdevs.github.io/Genesis-AI/icon.png" alt="Genesis">
        <div class="expand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/></svg>
        </div>
        <span>Genesis AI</span>`;
    
    logoLink.onclick = (e) => {
        if (sidebar.classList.contains('collapsed')) {
            e.preventDefault();
            toggleSidebar();
        }
    };
    
    // Controls Container (New Chat + Collapse)
    const controls = document.createElement('div');
    controls.className = 'sidebar-controls';
    
    // New Chat Icon
    const newChatIcon = document.createElement('button');
    newChatIcon.className = 'icon-btn new-chat-icon';
    newChatIcon.title = 'New Chat';
    newChatIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';
    newChatIcon.onclick = () => {
        if (newChatBtn) newChatBtn.click();
    };
    
    // Collapse Icon
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'icon-btn collapse-btn';
    collapseBtn.title = 'Toggle Sidebar';
    collapseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/></svg>';
    
    collapseBtn.onclick = toggleSidebar;
    
    controls.appendChild(newChatIcon);
    controls.appendChild(collapseBtn);
    
    header.appendChild(logoLink);
    header.appendChild(controls);
    
    // Search Container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    // Expanded Search Input
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-input-wrapper';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search chats...';
    searchInput.className = 'search-input';
    searchInput.addEventListener('input', (e) => {
        if (typeof searchQuery !== 'undefined') searchQuery = e.target.value;
        else window.searchQuery = e.target.value;
        
        if (typeof renderChatList === 'function') renderChatList();
    });
    
    const searchIcon = document.createElement('div');
    searchIcon.className = 'search-icon-overlay';
    searchIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
    
    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(searchIcon);
    
    // Collapsed Stack (New Chat + Search)
    const collapsedStack = document.createElement('div');
    collapsedStack.className = 'collapsed-stack';

    const collapsedNewChatBtn = newChatIcon.cloneNode(true);
    collapsedNewChatBtn.onclick = () => {
        if (newChatBtn) newChatBtn.click();
        if (sidebar.classList.contains('collapsed')) toggleSidebar();
    };

    const collapsedSearchBtn = document.createElement('button');
    collapsedSearchBtn.className = 'icon-btn collapsed-search-btn';
    collapsedSearchBtn.title = 'Search';
    collapsedSearchBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
    collapsedSearchBtn.onclick = () => {
        if (sidebar.classList.contains('collapsed')) toggleSidebar();
        setTimeout(() => searchInput.focus(), 300);
    };

    collapsedStack.appendChild(collapsedNewChatBtn);
    collapsedStack.appendChild(collapsedSearchBtn);

    searchContainer.appendChild(searchWrapper);
    searchContainer.appendChild(collapsedStack);
    
    // Insert at top of sidebar
    sidebar.insertBefore(searchContainer, sidebar.firstChild);
    sidebar.insertBefore(header, sidebar.firstChild);

    // Create Footer
    const footer = document.createElement('div');
    footer.className = 'sidebar-footer';
    const userIcon = document.getElementById("userIcon");
    if (userIcon) footer.appendChild(userIcon);
    sidebar.appendChild(footer);
}