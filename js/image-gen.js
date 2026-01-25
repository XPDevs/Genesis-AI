/**
 * Genesis-AI: Image Creator Module (Version 2026.1.5)
 * Architect: James Turner (XPDevs)
 * Feature: Client-side Canvas Watermarking to bypass ORB/Binding errors.
 */

window.processGenesisImageRequest = function(input) {
    const tagRegex = /%([^%]+)%/g;
    let tags = [];
    let match;
    while ((match = tagRegex.exec(input)) !== null) {
        tags.push(match[1].replace(/_/g, ' '));
    }
    let cleanPrompt = input.replace(tagRegex, '').trim();
    let refined = cleanPrompt;
    if (tags.length > 0) {
        refined += ", " + tags.join(", ");
    }
    return { original: input, refinedPrompt: refined, timestamp: new Date().toISOString() };
};

/**
 * Bakes the XPDevs logo onto the AI image using a hidden canvas.
 * This returns a safe DataURL that won't be blocked by the browser.
 */
async function brandImage(imageUrl) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const mainImg = new Image();
        const logoImg = new Image();

        mainImg.crossOrigin = "anonymous";
        logoImg.crossOrigin = "anonymous";

        mainImg.onload = () => {
            canvas.width = mainImg.width;
            canvas.height = mainImg.height;
            
            // Draw the generated AI image
            ctx.drawImage(mainImg, 0, 0);
            
            // Load and draw the XPDevs logo once the main image is ready
            logoImg.onload = () => {
                const logoSize = canvas.width * 0.15; // 15% of image width
                const padding = 20;
                ctx.globalAlpha = 0.8; // Subtle transparency
                ctx.drawImage(
                    logoImg, 
                    canvas.width - logoSize - padding, 
                    canvas.height - logoSize - padding, 
                    logoSize, 
                    logoSize
                );
                resolve(canvas.toDataURL("image/png"));
            };
            logoImg.src = "https://xpdevs.github.io/Genesis-AI/icon.png";
        };
        
        mainImg.onerror = () => resolve(imageUrl); // Fallback if canvas fails
        mainImg.src = imageUrl;
    });
}

async function findImageInModel(prompt, imageModel) {
    const lowerInput = prompt.toLowerCase();
    const foundMatches = [];
    const responseKeys = Object.keys(imageModel).filter(k => !['ver', 'description'].includes(k));
    const sortedKeys = responseKeys.sort((a, b) => b.length - a.length);
    
    let tempInput = lowerInput;
    sortedKeys.forEach(key => {
        const lowerKey = key.toLowerCase();
        let index = tempInput.indexOf(lowerKey);
        while (index !== -1) {
            foundMatches.push({ text: imageModel[key], index: index });
            tempInput = tempInput.substring(0, index) + ' '.repeat(lowerKey.length) + tempInput.substring(index + lowerKey.length);
            index = tempInput.indexOf(lowerKey);
        }
    });

    if (foundMatches.length === 0) {
        const seed = Math.floor(Math.random() * 1000000);
        const rawUrl = `https://gen.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}&width=1024&height=1024`;
        
        // This is the magic part: it processes the image before displaying it
        const brandedUrl = await brandImage(rawUrl);
        return { role: "ai", text: `![${prompt}](${brandedUrl})` };
    } else {
        const ordered = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
        const text = ordered.length === 1 ? ordered[0] : ordered.join(", ") + " and " + ordered.pop();
        return { role: "ai", text: text };
    }
}

// Updated main function to be async to handle the canvas processing
window.generateImageResponse = async function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return await findImageInModel(processed.refinedPrompt, imageModelData);
};
