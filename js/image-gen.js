window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        if (typeof puter === 'undefined') {
            console.error("Genesis-AI: Puter.js is missing.");
            return null;
        }

        console.log(`Genesis-AI: Generating image via Puter.js...`);

        // Using a more robust configuration to avoid the 'undefined reading 0' error
        // Providing the explicit provider 'openai-image-generation' acts as a stable fallback
        const image = await puter.ai.txt2img(prompt, { 
            provider: 'openai-image-generation', 
            model: 'dall-e-3' 
        });

        // Ensure we have an image and a source URL
        if (image && image.src) {
            console.log("Genesis-AI: Image successfully generated.");
            return image.src;
        }

        return null;

    } catch (error) {
        // Detailed error log to help you debug in the dashboard console
        console.error("Genesis-AI Image Error:", error.error || error);
        return null;
    }
};
