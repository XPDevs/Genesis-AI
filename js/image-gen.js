/**
 * Genesis-AI: Image Creator Module
 * Optimized for James Turner (XPDevs)
 * FIX: Removed all logo logic to bypass OpaqueResponseBlocking and Binding Aborts.
 */

window.processGenesisImageRequest = function(input) {
    const tagRegex = /%([^%]+)%/g;
    let tags = [];
    let match;

    // Extract tags like %bg_white% and turn them into plain text
    while ((match = tagRegex.exec(input)) !== null) {
        tags.push(match[1].replace(/_/g, ' '));
    }

    // Clean the prompt and re-attach tags as plain keywords
    let cleanPrompt = input.replace(tagRegex, '').trim();
    let refined = cleanPrompt;
    if (tags.length > 0) {
        refined += ", " + tags.join(", ");
    }

    return {
        original: input,
        refinedPrompt: refined,
        timestamp: new Date().toISOString()
    };
};

function findImageInModel(prompt, imageModel) {
    const lowerInput = prompt.toLowerCase();
    const foundMatches = [];
    
    // Process local model matches (XPDevs standard .bin logic)
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
        // ENCODING: Crucial to prevent special characters from aborting the request
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 999999);
        
        /**
         * PURE URL: No logo parameters, no complex redirects.
         * The nologo=true refers to the Pollinations site itself.
         */
        const imageUrl = `https://gen.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024`;
        
        // Return standard Markdown for your dashboard to render
        return { 
            role: "ai", 
            text: `![${prompt}](${imageUrl})` 
        };
    } else {
        const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
        const responseText = orderedMessages.length === 1 ? orderedMessages[0] : orderedMessages.join(", ") + " and " + orderedMessages.pop();
        return { role: "ai", text: responseText };
    }
}

window.generateImageResponse = function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return findImageInModel(processed.refinedPrompt, imageModelData);
};
