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

            // Use a different proxy that forwards headers correctly to avoid CORS issues.
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetImageUrl)}`;

            try {
                // This proxy forwards the response directly. A successful fetch means the image is available.
                const response = await fetch(proxyUrl);

                if (response.ok) {
                    return targetImageUrl; // Success!
                }

                // If not ok, it's a server error (e.g., 502) from Pollinations.
                console.warn(`Genesis-AI Image: Attempt ${attempt} failed with status ${response.status}.`);
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                    continue; // Go to the next attempt
                }
                throw new Error(`Image generation failed with status: ${response.status}`);

            } catch (error) {
                console.warn(`Genesis-AI Image: Attempt ${attempt} failed with a network error: ${error.message}`);
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
