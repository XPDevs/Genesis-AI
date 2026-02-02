window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        // Clean and encode the prompt
        const encodedPrompt = encodeURIComponent(prompt.trim());
        
        // Generate a unique seed for this specific request
        const seed = Math.floor(Math.random() * 1000000000);
        
        // Use the most stable Pollinations endpoint
        // Removing validation avoids OpaqueResponseBlocking and NS_BINDING_ABORTED errors
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024&model=flux`;

        console.log(`Genesis-AI: Generating image...`);
        
        // We return the URL immediately. 
        // The browser <img> tag will handle the loading naturally.
        return imageUrl;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
