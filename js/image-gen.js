(function() {
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                resolve('');
                return;
            }

            const seed = Math.floor(Math.random() * 999999);
            const rawUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&seed=${seed}&nologo=true`;

            // We use a public CORS proxy to bypass the browser's security blocks
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`;

            const img = new Image();
            img.crossOrigin = "anonymous";
            
            img.onload = function() {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                
                // Convert to a local data string to bypass ORB entirely
                resolve(canvas.toDataURL("image/png"));
            };

            img.onerror = function() {
                // If proxy fails, fallback to the direct URL
                resolve(rawUrl); 
            };

            img.src = proxyUrl;
        });
    };

    console.log("Image Generation Module loaded.");
})();
