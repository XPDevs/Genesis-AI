window.generateImage = async function(prompt) {
    try {
        const generatorName = 'z154dxbfko';
        const encodedPrompt = encodeURIComponent(prompt);
        // Change: Fetch output directly from the generator URL with ?output=text, which typically supports CORS.
        const url = `https://perchance.org/${generatorName}?output=text&prompt=${encodedPrompt}&t=${Date.now()}`;

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
