(function() {
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                resolve('');
                return;
            }

            const seed = Math.floor(Math.random() * 999999);
            const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&seed=${seed}&nologo=true`;

            fetch(imageUrl, {
                mode: 'no-cors'
            }).then(() => {
                resolve(imageUrl);
            }).catch(() => {
                resolve(imageUrl);
            });
        });
    };

    console.log("Image Generation Module loaded.");
})();
