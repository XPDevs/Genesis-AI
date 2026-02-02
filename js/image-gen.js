window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        // 1. Clean and encode the prompt to prevent URL errors
        const encodedPrompt = encodeURIComponent(prompt.trim());
        
        // 2. Generate a random seed for unique results every time
        const seed = Math.floor(Math.random() * 1000000000);
        
        // 3. Use the high-performance 'flux' model for the best quality
        // Adding 'nologo=true' ensures a clean professional look for Genesis-AI
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024&model=flux`;

        console.log(`Genesis-AI: Generating image...`);
        
        // 4. Return the URL directly. 
        // This avoids OpaqueResponseBlocking and NS_BINDING_ABORTED errors.
        return imageUrl;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
