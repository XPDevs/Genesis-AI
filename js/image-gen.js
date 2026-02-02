window.generateImage = async function(prompt) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1500; // ms

    try {
        if (!prompt || !prompt.trim()) {
            throw new Error("Image generation prompt cannot be empty.");
        }

        const encodedPrompt = encodeURIComponent(prompt);

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const seed = Math.floor(Math.random() * 1000000);
            const targetImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}`;
            
            // As requested, use the proxy to help bypass potential network/caching issues.
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetImageUrl)}`;

            try {
                // We fetch via the proxy to validate the image can be accessed.
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    // The proxy responded, now check the actual image status from the proxy's response.
                    const data = await response.json();
                    if (data && data.status && data.status.http_code === 200) {
                        // If the proxy got the image, return the ORIGINAL URL for the <img> tag.
                        return targetImageUrl; // Success!
                    }
                    
                    const remoteStatus = (data && data.status) ? data.status.http_code : 'unknown';
                    if (remoteStatus >= 500) {
                        console.warn(`Genesis-AI Image: Attempt ${attempt} failed. Target returned status ${remoteStatus} via proxy.`);
                        if (attempt < MAX_RETRIES) {
                            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                            continue; // try again
                        }
                    }
                    throw new Error(`Pollinations API (via proxy) returned status: ${remoteStatus}`);
                }
                
                throw new Error(`Proxy error: 'api.allorigins.win' returned status ${response.status}`);

            } catch (error) {
                console.warn(`Genesis-AI Image: Attempt ${attempt} failed with a network error.`);
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                } else {
                    throw error; // Re-throw the last error
                }
            }
        }
        throw new Error("Image generation failed after all retries.");

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
console.log("Image Generator Loaded");
