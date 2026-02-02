window.generateImage = async function(prompt) {
    const MAX_RETRIES = 4;
    const BASE_DELAY = 1500; // Faster initial retry for smooth UI

    const validateImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => resolve(true);
            img.onerror = () => reject(new Error("Image failed to load"));
            
            const timeoutId = setTimeout(() => {
                img.src = ""; 
                reject(new Error("Image load timed out"));
            }, 12000); // 12s timeout per attempt

            img.src = url;
        });
    };

    try {
        if (!prompt || !prompt.trim()) return null;

        const encodedPrompt = encodeURIComponent(prompt);
        
        // Using 'flux' as primary, 'turbo' and 'search' as high-availability fallbacks
        const models = ['flux', 'turbo', 'search']; 

        for (let i = 0; i < MAX_RETRIES; i++) {
            const seed = Math.floor(Math.random() * 1000000000);
            
            // For retries, we rotate models and seeds to bypass cached 502 errors
            const currentModel = models[i % models.length];
            
            // NEW 2026 STABLE ENDPOINT: gen.pollinations.ai
            const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?nologo=true&seed=${seed}&model=${currentModel}&width=1024&height=1024&enhance=true`;

            try {
                console.log(`Genesis-AI: Generating image (Attempt ${i+1}/${MAX_RETRIES}) using [${currentModel}]...`);
                await validateImage(imageUrl);
                return imageUrl; 
            } catch (err) {
                console.warn(`Genesis-AI: Attempt ${i+1} failed: ${err.message}`);
                if (i < MAX_RETRIES - 1) {
                    // Jittered delay to prevent "retry storms"
                    const jitter = Math.random() * 1000;
                    await new Promise(r => setTimeout(r, BASE_DELAY + jitter));
                }
            }
        }
        
        // Final "Safe" Fallback: Return the URL without validation
        // This lets the browser attempt a last-minute load in the background
        return `https://gen.pollinations.ai/image/${encodedPrompt}?nologo=true&seed=${Math.floor(Math.random() * 1000000)}&enhance=true`;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
console.log("Image Generation Module loaded");
