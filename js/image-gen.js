window.generateImage = async function(prompt) {
    const MAX_RETRIES = 4;
    const BASE_DELAY = 2000; 

    const validateImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => resolve(true);
            img.onerror = () => reject(new Error("Image failed to load"));
            
            const timeoutId = setTimeout(() => {
                img.src = ""; 
                reject(new Error("Image load timed out"));
            }, 15000);

            img.src = url;
        });
    };

    try {
        if (!prompt || !prompt.trim()) return null;

        const encodedPrompt = encodeURIComponent(prompt);
        
        // Removed 'midjourney' and 'unity' as they are frequently unstable
        // Added 'search' as a reliable fallback
        const models = ['flux', 'turbo', 'search']; 

        for (let i = 0; i < MAX_RETRIES; i++) {
            const seed = Math.floor(Math.random() * 1000000000);
            
            // If the first attempt fails, we stop forcing a specific model 
            // and let the system pick the healthiest one.
            const modelParam = i === 0 ? `&model=${models[0]}` : `&model=${models[i % models.length]}`;
            
            // Constructing a more robust URL
            const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?nologo=true&seed=${seed}${modelParam}&width=1024&height=1024`;

            try {
                console.log(`Genesis-AI: Generating image (Attempt ${i+1}/${MAX_RETRIES})...`);
                await validateImage(imageUrl);
                return imageUrl; 
            } catch (err) {
                console.warn(`Genesis-AI: Attempt ${i+1} failed: ${err.message}`);
                if (i < MAX_RETRIES - 1) {
                    await new Promise(r => setTimeout(r, BASE_DELAY));
                }
            }
        }
        
        // Final fallback: Return the URL without validation to try and let the browser handle it
        return `https://pollinations.ai/p/${encodedPrompt}?nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
