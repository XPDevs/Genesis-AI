window.generateImage = async function(prompt) {
    // 1. Identify where to put the image (Update 'image-display' to your div ID)
    const displayContainer = document.getElementById('image-display');
    
    try {
        if(displayContainer) displayContainer.innerHTML = "Generating...";

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
            
            // 2. Display the image as a normal <img> tag
            if (displayContainer) {
                displayContainer.innerHTML = `<img src="${imageUrl}" style="max-width:100%; border-radius:8px; border: 1px solid #444;" alt="Generated Image">`;
            }

            return imageUrl;
        }

        throw new Error("Link not found in response");
    } catch (error) {
        console.error("Genesis-AI Image Error:", error);
        if(displayContainer) displayContainer.innerHTML = "Failed to load image.";
        return null;
    }
};
console.log("Image Generator Loaded");
