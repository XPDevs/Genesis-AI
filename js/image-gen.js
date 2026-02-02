window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) return null;

        // 1. Clean and encode the prompt
        const encodedPrompt = encodeURIComponent(prompt.trim());
        const seed = Math.floor(Math.random() * 1000000000);
        
        // 2. Original Pollinations URL
        const originalUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024&model=flux`;

        // 3. Use a free CORS proxy to bypass OpaqueResponseBlocking
        // This proxy adds the 'Access-Control-Allow-Origin' header to the response
        const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`;

        console.log(`Genesis-AI: Requesting proxied image...`);

        // 4. Return the proxied URL directly. 
        // This ensures the browser treats it as a 'safe' local-domain resource.
        return proxiedUrl;

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
