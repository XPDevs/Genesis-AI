(function() {
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                resolve(''); 
                return;
            }

            const seed = Math.floor(Math.random() * 1000000000);
            const encodedPrompt = encodeURIComponent(prompt.trim());
            
            // This is the correct, public-facing URL for the Perchance engine
            // It allows the browser to load the image without needing a manual session key
            const imageUrl = `https://perchance.org/api/getAiImage?prompt=${encodedPrompt}&seed=${seed}&resolution=1024x1024`;

            // We resolve the URL directly so your dashboard can display it
            // This avoids OpaqueResponseBlocking because the <img> tag handles the load
            resolve(imageUrl);
        });
    };

    console.log("Image Generation Module loaded.");
})();
