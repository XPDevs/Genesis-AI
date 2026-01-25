/**
 * Genesis-AI: Image Creator Module
 * Optimized for James Turner (XPDevs)
 * FIX: Direct URL Injection to bypass CORS and OpaqueResponseBlocking.
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

    return {
        original: input,
        refinedPrompt: refined
    };
};

async function findImageInModel(prompt, imageModel) {
    const lowerInput = prompt.toLowerCase();
    const foundMatches = [];
    
    // Sort keys by length for Genesis logic
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

    if (foundMatches.length === 0) {
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 999999);
        
        /**
         * REPAIR:
         * We no longer use fetch() or allorigins. fetch() requires CORS headers.
         * Browsers allow images to load cross-origin via <img> tags automatically.
         * We return the direct URL formatted for your dashboard to display.
         */
        const directImageUrl = `https://pollinations.ai/p/${encodedPrompt}?seed=${seed}&nologo=true`;
        
        return { 
            role: "ai", 
            text: `!${prompt}` 
        };
    } else {
        const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
        const responseText = orderedMessages.length === 1 
            ? orderedMessages[0] 
            : orderedMessages.slice(0, -1).join(", ") + " and " + orderedMessages.slice(-1);
        
        return { role: "ai", text: responseText };
    }
}

window.generateImageResponse = async function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return await findImageInModel(processed.refinedPrompt, imageModelData);
};
