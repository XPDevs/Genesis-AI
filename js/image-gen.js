window.generateImage = async function(prompt) {
    try {
        const generatorName = 'z154dxbfko';
        const encodedPrompt = encodeURIComponent(prompt);
        const timestamp = Date.now();
        
        // Construct the target URL
        const perchanceUrl = `https://perchance.org/${generatorName}?output=text&prompt=${encodedPrompt}&t=${timestamp}`;
        
        // Using ThingProxy - it often bypasses the 403/522 issues seen with AllOrigins
        const proxyUrl = 'https://thingproxy.freeboard.io/fetch/';
        const url = proxyUrl + perchanceUrl;

        const response = await fetch(url);
        
        if (!response.ok) {
            // Fallback: If ThingProxy fails, try a direct AllOrigins hex/base64 request
            const backupUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(perchanceUrl)}`;
            const backupRes = await fetch(backupUrl);
            const backupData = await backupRes.json();
            return parsePerchanceResponse(backupData.contents);
        }
        
        const text = await response.text();
        return parsePerchanceResponse(text);

    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
};

// Helper function to keep the main logic clean
function parsePerchanceResponse(html) {
    if (!html) return null;
    
    // Look for the src inside an img tag, or a standalone URL
    const srcMatch = html.match(/<img[^>]+src="([^"]+)"/i) || html.match(/(https?:\/\/perchance\.org\/api\/get-image[^"\s>]+)/i);
    
    if (srcMatch && srcMatch[1]) {
        let imageUrl = srcMatch[1];
        // Ensure protocol is present
        if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
        return imageUrl;
    }
    
    // If it's just a raw URL in the text
    if (html.trim().startsWith('http')) return html.trim();
    
    return null;
}
