window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        // Clean and encode the prompt for a safe URL
        const encodedPrompt = encodeURIComponent(prompt.trim());
        
        // Use a unique seed to ensure fresh results
        const seed = Math.floor(Math.random() * 1000000000);
        
        // Use the updated stable unified endpoint
        const baseUrl = "https://gen.pollinations.ai/image/";
        
        // Removing manual validation stops 'OpaqueResponseBlocking'
        // Removing the retry loop stops 'NS_BINDING_ABORTED'
        const imageUrl = `${baseUrl}${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024&model=flux`;

        console.log(`Genesis-AI: Generating image URL...`);
        
        // Return the URL immediately; your dashboard will show it naturally
        return imageUrl;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
