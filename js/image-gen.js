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

        // Broad search strategy for the image URL to ensure we catch it
        // 1. Look for the specific Pollinations URL pattern (most common for this generator)
        let srcMatch = text.match(/(https?:\/\/image\.pollinations\.ai\/[^\s"'<>]+)/i);

        // 2. If not found, look for any standard image tag src attribute
        if (!srcMatch) {
            srcMatch = text.match(/src=["'](https?:\/\/[^"']+)["']/i);
        }

        // 3. Fallback: Look for any URL that looks like an image file
        if (!srcMatch) {
            srcMatch = text.match(/(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp))/i);
        }
        
        if (srcMatch && srcMatch[1]) {
            return srcMatch[1].replace(/&amp;/g, '&');
        }

        throw new Error("Image URL not found in generator response.");

    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
console.log("Image Generator Loaded");
