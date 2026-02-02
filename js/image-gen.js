window.generateImage = async function(prompt) {
    try {
        if (!prompt || !prompt.trim()) {
            throw new Error("Image generation prompt cannot be empty.");
        }

        const generatorName = 'z154dxbfko';
        const encodedPrompt = encodeURIComponent(prompt);
        const perchanceUrl = `https://perchance.org/${generatorName}?output=text&prompt=${encodedPrompt}&t=${Date.now()}`;

        // Use a CORS proxy to access the Perchance generator.
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(perchanceUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Proxy error');

        const data = await response.json();
        const text = data.contents;

        if (!text) throw new Error("Proxy returned empty content.");

        // The perchance generator might return HTML or plain text.
        // We look for the Pollinations.ai URL specifically, handling both src attributes and raw text.
        const srcMatch = text.match(/(https:\/\/image\.pollinations\.ai\/[^\s"'<>]+)/);
        
        if (srcMatch && srcMatch[1]) {
            return srcMatch[1];
        }

        throw new Error("Image URL not found in generator response.");

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
console.log("Image Generator Loaded");
