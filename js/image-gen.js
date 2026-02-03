(function() {
    /**
     * Genesis-AI: Genuine Image Generation Module
     * Fetches real AI-generated visuals based on the text prompt.
     */
    window.generateImage = async function(prompt) {
        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            // Returns an empty string if no prompt is provided
            return ''; 
        }

        try {
            // Connects to a live AI engine to process the prompt
            // The 'nologo' parameter ensures a clean, professional look for Genesis-AI
            const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&nologo=true`;
            
            // We fetch the image to ensure it is fully generated before returning
            const response = await fetch(imageUrl);
            
            if (response.ok) {
                // Return the direct link to the genuine AI image
                return imageUrl;
            } else {
                return '';
            }
        } catch (error) {
            // Silently fail to keep the console clean for the user
            return '';
        }
    };

    console.log("Image Generation Module loaded.");
})();
