window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) {
            throw new Error("Image generation prompt cannot be empty.");
        }

        // Directly construct the URL for the image generation service (Pollinations.ai).
        // This is faster and more reliable than using a proxy to parse a Perchance generator.
        // It ensures the user's exact prompt is used to generate the image.
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

        // The function is async to maintain compatibility with main.js, which expects a Promise.
        return imageUrl;
    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
console.log("Image Generator Loaded");
