window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) {
            throw new Error("Image generation prompt cannot be empty.");
        }

        // Directly construct the URL for the Pollinations.ai image generation service.
        // This is much faster and more reliable than using a proxy to parse a Perchance generator.
        const encodedPrompt = encodeURIComponent(prompt);
        // Add a random seed to ensure uniqueness and prevent caching collisions
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}`;

        // Pre-fetch the image to ensure the service is responding correctly (avoids 502 errors in the UI)
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`Pollinations API returned status: ${response.status}`);
        }

        // Return the URL only if the fetch was successful
        return imageUrl;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
console.log("Image Generator Loaded");
