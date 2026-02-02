window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        // Ensure library is ready
        if (typeof puter === 'undefined') {
            console.error("Genesis-AI: Puter.js missing from HTML.");
            return null;
        }

        // Silent Auth: Creates a temporary guest session to avoid the login popup
        if (!puter.auth.isSignedIn()) {
            await puter.auth.signIn({ attempt_temp_user_creation: true });
        }

        console.log(`Genesis-AI: Generating image...`);

        // Generate a real image using the high-speed Flux model
        // We extract the .src directly to avoid browser security blocks
        const imageElement = await puter.ai.txt2img(prompt.trim(), { 
            model: 'black-forest-labs/FLUX.1-schnell' 
        });

        if (imageElement && imageElement.src) {
            console.log("Genesis-AI: Image generated.");
            return imageElement.src;
        }

        return null;

    } catch (error) {
        // Fallback to a direct link if the session is restricted
        console.warn("Genesis-AI: Session restricted, using direct fallback.");
        const seed = Math.floor(Math.random() * 1000000);
        return `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}&model=flux`;
    }
};
