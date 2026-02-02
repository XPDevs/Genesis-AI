window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        if (typeof puter === 'undefined') {
            console.error("Genesis-AI: Puter.js is missing.");
            return null;
        }

        // 1. Silent Authentication: Create a temporary user session.
        // This stops the "Login" popup from appearing for the user.
        if (!puter.auth.isSignedIn()) {
            console.log("Genesis-AI: Establishing secure temporary session...");
            await puter.auth.signIn({ attempt_temp_user_creation: true });
        }

        console.log(`Genesis-AI: Generating real image...`);

        // 2. Generate the real image.
        // We set test_mode to false to get a unique, real image.
        // Specifying the provider directly prevents the 'reading 0' error.
        const image = await puter.ai.txt2img(prompt, { 
            provider: 'openai-image-generation',
            model: 'dall-e-3',
            test_mode: false 
        });

        if (image && image.src) {
            console.log("Genesis-AI: Real image successfully generated.");
            return image.src;
        }

        return null;

    } catch (error) {
        // Fallback to a stable public route if Puter session fails
        console.warn("Genesis-AI: Puter session restricted, using fallback engine.");
        const seed = Math.floor(Math.random() * 1000000);
        return `https://pollinations.ai/p/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}&model=flux`;
    }
};
