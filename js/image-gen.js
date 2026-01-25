/**
 * Genesis-AI: Image Creator Module
 * Simplified Version: Removed logo branding to bypass OpaqueResponseBlocking.
 */

/**
 * Parses user input to extract Genesis tags and clean the prompt.
 * Converts %tag% into plain text for the generator.
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
        refinedPrompt: refined,
        timestamp: new Date().toISOString()
    };
};

/**
 * Generates a clean image URL without any external logo parameters.
 */
function findImageInModel(prompt, imageModel) {
    const lowerInput = prompt.toLowerCase();
    const foundMatches = [];
    
    // Filter out metadata from the Genesis model
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
        // Random seed helps prevent the browser from getting "stuck" on a failed request
        const seed = Math.floor(Math.random() * 1000000);
        
        // CLEAN URL: No logo, no complex parameters. 
        // nologo=true refers to the service's own logo, not yours.
        const imageUrl = `https://gen.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024`;
        
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

/**
 * Main module entry point.
 */
window.generateImageResponse = function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return findImageInModel(processed.refinedPrompt, imageModelData);
};
