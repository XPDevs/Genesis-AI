/**
 * Genesis-AI: Image Creator Module
 * Handles %tag% parsing and model lookups for image generation.
 */

/**
 * Parses user input to extract Genesis tags and clean the prompt.
 * Moves tags like %bg_white% to the end of the prompt for better generation.
 */
window.processGenesisImageRequest = function(input) {
    const tagRegex = /%([^%]+)%/g;
    let tags = [];
    let match;

    // Extract all %tags%
    while ((match = tagRegex.exec(input)) !== null) {
        tags.push(match[1].replace('_', ' '));
    }

    // Clean the prompt by removing the tags
    let cleanPrompt = input.replace(tagRegex, '').trim();
    
    // Append tags as descriptive keywords if they exist
    let refined = cleanPrompt;
    if (tags.length > 0) {
        refined += " " + tags.join(" ");
    }

    return {
        original: input,
        refinedPrompt: refined,
        timestamp: new Date().toISOString()
    };
}

/**
 * Searches the image model for keywords or generates a new image via external service.
 */
function findImageInModel(prompt, imageModel) {
    const lowerInput = prompt.toLowerCase();
    const foundMatches = [];
    
    // Filter out metadata
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
        // FIX: Wrap in Markdown image syntax so the dashboard renders the image
        const encodedPrompt = encodeURIComponent(prompt);
        responseText = `![${prompt}](https://image.pollinations.ai/prompt/${encodedPrompt})`;
    } else {
        const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
        if (orderedMessages.length === 1) {
            responseText = orderedMessages[0];
        } else {
            const last = orderedMessages.pop();
            responseText = orderedMessages.join(", ") + " and " + last;
        }
    }

    // Apply XPDevs branding and remove external logos
    const logoUrl = "https://xpdevs.github.io/Genesis-AI/icon.png";
    responseText = responseText.replace(/\]\((https:\/\/image\.pollinations\.ai\/prompt\/[^)]+)\)/g, (match, url) => {
        const separator = url.includes('?') ? '&' : '?';
        return `](${url}${separator}nologo=true&logo=${encodeURIComponent(logoUrl)})`;
    });

    return { role: "ai", text: responseText };
}

/**
 * Main entry point for the module
 */
window.generateImageResponse = function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return findImageInModel(processed.refinedPrompt, imageModelData);
}
