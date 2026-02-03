(function() {
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                resolve(''); 
                return;
            }

            // We use a unique seed so every image is a brand new creation
            const seed = Math.floor(Math.random() * 999999);
            
            // By using the direct image endpoint, we avoid the security errors
            // This URL can be dropped directly into any <img> tag's src
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&seed=${seed}&nologo=true`;

            // We resolve immediately. Your main.js should set this as the src of an image element.
            resolve(imageUrl);
        });
    };

    console.log("Image Generation Module loaded.");
})();
