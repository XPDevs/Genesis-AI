window.generateImage = async function(prompt) {
    try {
        const generatorName = 'z154dxbfko';
        const encodedPrompt = encodeURIComponent(prompt);
        const perchanceUrl = `https://perchance.org/${generatorName}?output=text&prompt=${encodedPrompt}&t=${Date.now()}`;
        
        // Use the JSON wrapper to bypass CORS blocks
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(perchanceUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Proxy error');

        const data = await response.json();
        const text = data.contents;

        // Extract the URL from the response
        const srcMatch = text.match(/src=["']([^"']+)["']/i) || text.match(/(https?:\/\/[^\s"'<>]+)/i);
        
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
