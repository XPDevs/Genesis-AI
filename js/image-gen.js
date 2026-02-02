window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        // Ensure Puter.js is loaded
        if (typeof puter === 'undefined') {
            console.error("Genesis-AI: Puter.js is not loaded. Ensure <script src='https://js.puter.com/v2/'></script> is in your HTML.");
            return null;
        }

        console.log(`Genesis-AI: Generating image via Puter.js...`);

        // Use Puter's built-in text-to-image generation
        // Setting testMode to true allows for free testing without consuming credits
        const imageElement = await puter.ai.txt2img(prompt, { 
            model: 'black-forest-labs/FLUX.1-schnell',
            test_mode: false 
        });

        // Puter returns an HTMLImageElement; we extract the 'src' for your dashboard
        if (imageElement && imageElement.src) {
            console.log("Genesis-AI: Image generation successful.");
            return imageElement.src;
        }

        return null;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
