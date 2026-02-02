window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) {
            throw new Error("Image generation prompt cannot be empty.");
        }

        // Directly construct the URL for the Pollinations.ai image generation service.
        // This is much faster and more reliable than using a proxy to parse a Perchance generator.
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

        // The function is async to maintain compatibility with main.js, which expects a Promise.
        // We can directly return the URL.
        return imageUrl;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
console.log("Image Generator Loaded");
