window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        // Check if the library is loaded to prevent ReferenceErrors
        if (typeof puter === 'undefined') {
            console.error("Genesis-AI: Puter.js library missing. Ensure <script src='https://js.puter.com/v2/'></script> is in your HTML.");
            return null;
        }

        console.log(`Genesis-AI: Generating image...`);

        // Generate the image using Puter.js
        // Setting testMode to false for actual generation. Set to true for free testing.
        const image = await puter.ai.txt2img(prompt, false);

        // Puter.js returns an HTMLImageElement directly
        // We return the .src so your dashboard can use the URL
        if (image && image.src) {
            console.log("Genesis-AI: Image generation successful.");
            return image.src;
        }

        return null;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
