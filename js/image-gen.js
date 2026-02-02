window.generateImage = async function(prompt) {
    try {
        const generatorName = 'z154dxbfko';
        const encodedPrompt = encodeURIComponent(prompt);
        const perchanceUrl = `https://perchance.org/${generatorName}?output=text&prompt=${encodedPrompt}&t=${Date.now()}`;
        
        // Use a more reliable CORS proxy that returns the raw response
        const proxyUrl = `https://corsproxy.io/?${perchanceUrl}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Proxy error');

        const text = await response.text();

        // Extract the URL from the response
        const srcMatch = text.match(/src=["'](https:\/\/image\.pollinations\.ai\/[^"']+)["']/i);
        
        if (srcMatch) {
            let imageUrl = srcMatch[1] || srcMatch[0];
            if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

            return imageUrl;
        }

        throw new Error("Link not found in response");
    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        return null;
    }
};
console.log("Image Generator Loaded");
