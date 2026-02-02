window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        console.log(`Genesis-AI: Requesting image generation via Puter.js...`);

        // Puter.js txt2img returns an HTMLImageElement directly.
        // We use 'flux.1-schnell' for high speed and quality.
        const imageElement = await puter.ai.txt2img(prompt, { 
            model: 'black-forest-labs/FLUX.1-schnell' 
        });

        // Since your dashboard likely expects a URL string, 
        // we return the 'src' from the generated image element.
        if (imageElement && imageElement.src) {
            console.log("Genesis-AI: Image generated successfully.");
            return imageElement.src;
        }

        return null;

    } catch (error) {
        // If the user isn't signed into Puter, it may prompt them or fail.
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
