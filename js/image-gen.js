/**
 * Genesis-AI: Image Creator Module
 * Optimized for James Turner (XPDevs)
 * Handles %tag% parsing, modern endpoint lookups, and visual rendering.
 */

/**
 * Parses user input to extract Genesis tags and clean the prompt.
 * Converts tags like %bg_white% into descriptive words for the AI.
 */
window.processGenesisImageRequest = function(input) {
    const tagRegex = /%([^%]+)%/g;
    let tags = [];
    let match;

    // Extract all %tags%
    while ((match = tagRegex.exec(input)) !== null) {
        // Replace underscores with spaces for the generator (e.g., bg_white -> bg white)
        tags.push(match[1].replace(/_/g, ' '));
    }

    // Clean the prompt by removing the raw tags
    let cleanPrompt = input.replace(tagRegex, '').trim();
    
    // Append tags as descriptive keywords for better image results
    let refined = cleanPrompt;
    if (tags.length > 0) {
        refined += ", " + tags.join(", ");
    }

    return {
        original: input,
        refinedPrompt: refined,
        timestamp: new Date().toISOString()
    };
}

/**
 * Searches the image model or generates a unique image via stable API.
 */
function findImageInModel(prompt, imageModel) {
    const lowerInput = prompt.toLowerCase();
    const foundMatches = [];
    
    // Filter out version/description metadata from the model
    const responseKeys = Object.keys(imageModel).filter(k => k !== 'ver' && k !== 'description');
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

    let responseText = "";

    if (foundMatches.length === 0) {
        // Use the NEW stable endpoint to avoid 502 errors
        const encodedPrompt = encodeURIComponent(prompt);
        const logoUrl = encodeURIComponent("https://xpdevs.github.io/Genesis-AI/icon.png");
        
        // Seed ensures a fresh image and helps bypass gateway timeouts
        const seed = Math.floor(Math.random() * 999999);
        
        // Format as Markdown image for automatic rendering in the UI
        responseText = `![${prompt}](https://gen.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}&logo=${logoUrl})`;
    } else {
        // Use matches found in the local model
        const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
        if (orderedMessages.length === 1) {
            responseText = orderedMessages[0];
        } else {
            const last = orderedMessages.pop();
            responseText = orderedMessages.join(", ") + " and " + last;
        }
        
        // Ensure any model-based links also get the XPDevs branding
        const logoUrl = "https://xpdevs.github.io/Genesis-AI/icon.png";
        responseText = responseText.replace(/\]\((https:\/\/gen\.pollinations\.ai\/prompt\/[^)]+)\)/g, (match, url) => {
            const separator = url.includes('?') ? '&' : '?';
            return `](${url}${separator}nologo=true&logo=${encodeURIComponent(logoUrl)})`;
        });
    }

    return { role: "ai", text: responseText };
}

/**
 * Main Genesis-AI Entry Point
 */
window.generateImageResponse = function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return findImageInModel(processed.refinedPrompt, imageModelData);
}
