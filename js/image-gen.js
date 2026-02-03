(function() {
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                resolve(''); 
                return;
            }

            const seed = Math.floor(Math.random() * 999999);
            
            // This specific URL format tells the server to send ONLY the image file.
            // This prevents the "OpaqueResponseBlocking" and "invalid_key" errors.
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&seed=${seed}&nologo=true`;

            // We resolve immediately. Genesis-AI will set this as the 'src' for the image element.
            resolve(imageUrl);
        });
    };

    console.log("Image Generation Module loaded.");
})();
