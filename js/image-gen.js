(function() {
    /**
     * Genesis-AI: Genuine Image Generation Module
     * Bypasses origin blocks by using native browser image loading.
     */
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                resolve('');
                return;
            }

            // Direct link to the genuine AI engine
            const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&nologo=true`;

            // We use a temporary image object to "pre-load" the AI result
            // This avoids the CORS block because we aren't "reading" the code, just displaying the picture
            const img = new Image();
            img.onload = () => resolve(imageUrl);
            img.onerror = () => resolve('');
            img.src = imageUrl;
        });
    };

    console.log("Image Generation Module loaded.");
})();
