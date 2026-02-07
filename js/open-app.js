// Function to pull from local storage and build the menu
function loadAppsFromStorage() {
    // Get the data from local storage
    const storedData = localStorage.getItem('APPLIST');
    
    if (!storedData) {
        console.log("No APPLIST found in storage.");
        return;
    }

    // Convert the stored text back into a list
    const appData = JSON.parse(storedData);
    
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(8px);
    `;

    // Modern rounded container
    const modal = document.createElement('div');
    modal.style = `
        background: #121212;
        color: #e0e0e0;
        padding: 30px;
        border-radius: 24px;
        width: 350px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.6);
        border: 1px solid #252525;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    const title = document.createElement('h3');
    title.innerText = "Available Apps";
    title.style.margin = "0 0 15px 5px";
    title.style.fontWeight = "400";
    modal.appendChild(title);

    // Create a scrollable area for the list
    const listContainer = document.createElement('div');
    listContainer.style.maxHeight = "400px";
    listContainer.style.overflowY = "auto";
    modal.appendChild(listContainer);

    // Generate buttons for each app in the list
    appData.forEach(appName => {
        const btn = document.createElement('button');
        btn.innerText = appName;
        btn.style = `
            width: 100%;
            padding: 14px;
            margin-bottom: 8px;
            background: #1e1e1e;
            border: 1px solid #2a2a2a;
            border-radius: 15px;
            color: #ffffff;
            text-align: left;
            font-size: 1rem;
            cursor: pointer;
            transition: 0.2s;
        `;
        
        btn.onmouseover = () => {
            btn.style.background = "#252525";
            btn.style.borderColor = "#333";
        };
        btn.onmouseout = () => {
            btn.style.background = "#1e1e1e";
            btn.style.borderColor = "#2a2a2a";
        };
        
        btn.onclick = () => {
            // Logic to stay inside the app goes here
            console.log("Opening: " + appName);
            document.body.removeChild(overlay);
        };

        listContainer.appendChild(btn);
    });

    // Close action
    const closeBtn = document.createElement('button');
    closeBtn.innerText = "Return";
    closeBtn.style = `
        width: 100%;
        margin-top: 15px;
        background: transparent;
        border: none;
        color: #666;
        padding: 10px;
        cursor: pointer;
        font-size: 0.9rem;
    `;
    closeBtn.onclick = () => document.body.removeChild(overlay);
    
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Start the process
loadAppsFromStorage();
