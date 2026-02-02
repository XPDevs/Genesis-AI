window.generateImage = async function(prompt) {
    try {
        const generatorName = 'z154dxbfko';
        const encodedPrompt = encodeURIComponent(prompt);
        // Fetch output from the Perchance generator using the download API
        const url = `https://perchance.org/api/download?generatorName=${generatorName}&prop=output&prompt=${encodedPrompt}&t=${Date.now()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const text = await response.text();
        let imageUrl = text.trim();
        
        // Extract URL if returned as an HTML img tag
        const srcMatch = imageUrl.match(/src="'["']/);
        if (srcMatch) imageUrl = srcMatch[1];

        if (imageUrl && imageUrl.startsWith('http')) return imageUrl;
        
        throw new Error("Invalid output from generator");
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
};
console.log("Image Generation Module loaded");
