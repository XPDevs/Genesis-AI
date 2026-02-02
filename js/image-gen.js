window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        // 1. Use the new unified stable endpoint
        const baseUrl = "https://gen.pollinations.ai/image/";
        
        // 2. Clean and encode the prompt
        const encodedPrompt = encodeURIComponent(prompt.trim());
        
        // 3. Generate a unique seed for this specific request
        const seed = Math.floor(Math.random() * 1000000000);
        
        // 4. Construct the URL using the robust 'flux' model
        // We remove the manual validation loop to stop the OpaqueResponseBlocking error.
        const imageUrl = `${baseUrl}${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024&model=flux`;

        console.log(`Genesis-AI: Generating image via stable unified endpoint...`);
        
        // Return the URL directly. The browser's native <img> tag will handle 
        // the loading securely without triggering security blocks.
        return imageUrl;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
