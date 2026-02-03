(function() {
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                resolve('');
                return;
            }

            const seed = Math.floor(Math.random() * 999999);
            const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&seed=${seed}&nologo=true`;

            const img = new Image();
            img.crossOrigin = "anonymous";
            
            img.onload = function() {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };

            img.onerror = function() {
                resolve(imageUrl); 
            };

            img.src = imageUrl;
        });
    };

    console.log("Image Generation Module loaded.");
})();
