window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        // Clean and encode the prompt for the URL
        const encodedPrompt = encodeURIComponent(prompt.trim());
        
        // Generate a single unique seed
        const seed = Math.floor(Math.random() * 1000000000);
        
        // Use the stable pollinations path
        // Removing the 'validateImage' helper stops the OpaqueResponseBlocking error
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024&model=flux`;

        console.log(`Genesis-AI: Generating image...`);
        
        // Return the URL immediately so the UI can display it
        return imageUrl;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
