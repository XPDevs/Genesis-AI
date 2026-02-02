window.generateImage = async function(prompt) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1500; // ms

    try {
        if (!prompt || !prompt.trim()) {
            throw new Error("Image generation prompt cannot be empty.");
        }

        const encodedPrompt = encodeURIComponent(prompt);

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const seed = Math.floor(Math.random() * 1000000);
            const targetImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}`;

            try {
                // Validate using the Image object to avoid CORS/Proxy issues with fetch
                await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error("Image failed to load"));
                    img.src = targetImageUrl;
                });

                return targetImageUrl; // Success!

            } catch (error) {
                console.warn(`Genesis-AI Image: Attempt ${attempt} failed: ${error.message}`);
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                } else {
                    throw error; // Re-throw the last error
                }
            }
        }
        throw new Error("Image generation failed after all retries.");

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
