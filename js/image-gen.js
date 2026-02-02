window.generateImage = async function(prompt) {
    try {
        const generatorName = 'z154dxbfko';
        const encodedPrompt = encodeURIComponent(prompt);
        const timestamp = Date.now();
        
        // Construct the direct Perchance URL
        const perchanceUrl = `https://perchance.org/${generatorName}?output=text&prompt=${encodedPrompt}&t=${timestamp}`;
        
        // Using corsproxy.io as an alternative to allorigins
        const url = `https://corsproxy.io/?${encodeURIComponent(perchanceUrl)}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        let imageUrl = text.trim();
        
        // Extraction logic for the img tag
        const srcMatch = imageUrl.match(/<img[^>]+src="([^"]+)"/i);
        if (srcMatch && srcMatch[1]) {
            imageUrl = srcMatch[1];
        }

        // Validate that we actually have a link
        if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('//'))) {
            // Ensure protocol-relative URLs (//) are converted to https
            return imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
        }
        
        throw new Error("Invalid output from generator");
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
};
