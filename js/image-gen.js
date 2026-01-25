/**
 * Genesis-AI: Image Creator Module
 * Optimized for James Turner (XPDevs)
 * FIX: Direct URL Injection to bypass CORS and OpaqueResponseBlocking.
 * UPDATE: Prompt suppression - Only returns the image asset.
 */

// 1. Process tags and clean input
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

    return {
        original: input,
        refinedPrompt: refined
    };
};

// 2. Handle image generation and model matching
async function findImageInModel(prompt, imageModel) {
    const lowerInput = prompt.toLowerCase();
    const foundMatches = [];
    
    // Genesis logic: Sort keys by length
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

    // If no local model match is found, use the external generator
    if (foundMatches.length === 0) {
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 999999);
        
        // Construct the direct URL
        const directImageUrl = `https://image.pollinations.ai/p/${encodedPrompt}?seed=${seed}&nologo=true`;
        
        // FIX: Return only the Markdown image to hide the prompt text
        return { 
            role: "ai", 
            text: `![Genesis-AI Generated Image](${directImageUrl})` 
        };
    } else {
        // Handle model-specific text responses if matches are found
        const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
        const responseText = orderedMessages.length === 1 
            ? orderedMessages[0] 
            : orderedMessages.slice(0, -1).join(", ") + " and " + orderedMessages.slice(-1);
        
        return { role: "ai", text: responseText };
    }
}

// 3. Main execution function
window.generateImageResponse = async function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return await findImageInModel(processed.refinedPrompt, imageModelData);
};
