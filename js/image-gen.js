window.generateImage = async function(prompt) {
    try {
        const generatorName = 'z154dxbfko';
        const encodedPrompt = encodeURIComponent(prompt);
        // The Perchance endpoint is unreliable with CORS headers.
        // We will use a public CORS proxy to ensure the request is not blocked by the browser's Same-Origin Policy.
        const perchanceUrl = `https://perchance.org/${generatorName}?output=text&prompt=${encodedPrompt}&t=${Date.now()}`;
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const url = proxyUrl + encodeURIComponent(perchanceUrl);

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const text = await response.text();
        let imageUrl = text.trim();
        
        // Change: Fix regex to correctly extract the URL from an HTML img tag (e.g., <img src="URL">)
        const srcMatch = imageUrl.match(/<img[^>]+src="([^"]+)"/i);
        // If an <img> tag is found, use its src attribute; otherwise, assume imageUrl is already the direct URL.
        if (srcMatch && srcMatch[1]) imageUrl = srcMatch[1];

        if (imageUrl && imageUrl.startsWith('http')) return imageUrl;
        
        throw new Error("Invalid output from generator");
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
};
