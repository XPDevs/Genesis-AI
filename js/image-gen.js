(function() {
    /**
     * Genesis-AI: Real Image Generation Module
     * Bypasses ORB/CORS by using direct URL mapping.
     */
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                resolve(''); 
                return;
            }

            // This creates a direct link to a genuine AI generation engine.
            // By using a direct URL, we avoid the browser's "Opaque Response" security block.
            const seed = Math.floor(Math.random() * 1000000);
            const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&seed=${seed}&nologo=true`;

            // We simulate the "generation" time to ensure the UI feels responsive.
            // Then we resolve the URL so your main.js can set it as an <img> src.
            setTimeout(() => {
                resolve(imageUrl);
            }, 500);
        });
    };

    console.log("Image Generation Module loaded.");
})();
