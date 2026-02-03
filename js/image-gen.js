(function() {
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                resolve(''); 
                return;
            }

            const seed = Math.floor(Math.random() * 9999999);
            const encodedPrompt = encodeURIComponent(prompt.trim());
            
            // This connects Genesis-AI directly to the Perchance generation engine
            const imageUrl = `https://image-generation.perchance.org/api/generate?prompt=${encodedPrompt}&seed=${seed}&resolution=1024x1024&nologo=true`;

            // We resolve the URL so your dashboard can display the result in an image tag
            resolve(imageUrl);
        });
    };

    console.log("Image Generation Module loaded.");
})();
