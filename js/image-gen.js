window.generateImage = async function(prompt) {
    const MAX_RETRIES = 4;
    const BASE_DELAY = 2500; // ms

    // Helper function to validate if an image loads correctly
    const validateImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            // Success handler
            img.onload = () => resolve(true);
            
            // Error handler
            img.onerror = () => reject(new Error("Image failed to load"));
            
            // Timeout handler (15 seconds max)
            const timeoutId = setTimeout(() => {
                img.src = ""; // Attempt to cancel
                reject(new Error("Image load timed out"));
            }, 15000);

            img.src = url;
        });
    };

    try {
        if (!prompt || !prompt.trim()) return null;

        const encodedPrompt = encodeURIComponent(prompt);
        
        // Cycle through models to avoid 502s on a specific backend
        // 'turbo' is often faster/more stable than 'flux'
        const models = ['turbo', 'flux', 'unity', 'midjourney']; 

        for (let i = 0; i < MAX_RETRIES; i++) {
            const seed = Math.floor(Math.random() * 1000000000);
            const model = models[i % models.length];
            
            // Construct URL with explicit dimensions and model
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}&model=${model}&width=1024&height=1024`;

            try {
                console.log(`Genesis-AI: Generating image (Attempt ${i+1}/${MAX_RETRIES}) using model '${model}'...`);
                await validateImage(imageUrl);
                return imageUrl; // Success
            } catch (err) {
                console.warn(`Genesis-AI: Attempt ${i+1} failed: ${err.message}`);
                if (i < MAX_RETRIES - 1) {
                    // Exponential backoff delay
                    await new Promise(r => setTimeout(r, BASE_DELAY * (i + 1)));
                }
            }
        }
        
        throw new Error("All image generation attempts failed.");

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
