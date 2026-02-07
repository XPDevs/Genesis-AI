// Function to create and show the app list modal
function launchAppMenu(appData) {
    // Create the overlay/background
    const overlay = document.createElement('div');
    overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
    `;

    // Create the modern, rounded modal container
    const modal = document.createElement('div');
    modal.style = `
        background: #1a1a1a;
        color: #ffffff;
        padding: 25px;
        border-radius: 20px;
        width: 320px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border: 1px solid #333;
        font-family: sans-serif;
    `;

    const title = document.createElement('h2');
    title.innerText = "System Applications";
    title.style.margin = "0 0 20px 0";
    title.style.fontSize = "1.2rem";
    modal.appendChild(title);

    // Generate the list from the data
    appData.forEach(appName => {
        const btn = document.createElement('button');
        btn.innerText = appName;
        btn.style = `
            width: 100%;
            padding: 12px;
            margin-bottom: 10px;
            background: #2d2d2d;
            border: none;
            border-radius: 12px;
            color: white;
            text-align: left;
            cursor: pointer;
            transition: background 0.2s;
        `;
        
        btn.onmouseover = () => btn.style.background = "#3d3d3d";
        btn.onmouseout = () => btn.style.background = "#2d2d2d";
        
        // Action when an app is selected
        btn.onclick = () => {
            console.log("Launching: " + appName);
            document.body.removeChild(overlay);
        };

        modal.appendChild(btn);
    });

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerText = "Close";
    closeBtn.style = `
        width: 100%;
        margin-top: 10px;
        background: transparent;
        border: 1px solid #444;
        color: #888;
        padding: 8px;
        border-radius: 10px;
        cursor: pointer;
    `;
    closeBtn.onclick = () => document.body.removeChild(overlay);
    
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Example of triggering it with your specific list format
const APPLIST = ["App1", "App2", "App3"];
launchAppMenu(APPLIST);
