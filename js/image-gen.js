/**
 * Genesis-AI: Image Creator Module
 * Version: 2026.01
 * Architect: James Turner (XPDevs)
 * Status: Fixed for NS_BINDING_ABORTED and OpaqueResponseBlocking
 */

/**
 * Handles %tag% logic for Genesis-AI.
 * Converts tags like %bg_white% into plain text descriptors for the AI.
 */
window.processGenesisImageRequest = function(input) {
    const tagRegex = /%([^%]+)%/g;
    let tags = [];
    let match;

    // Extract all tags
    while ((match = tagRegex.exec(input)) !== null) {
        tags.push(match[1].replace(/_/g, ' '));
    }

    // Remove tags from the string to get the base prompt
    let cleanPrompt = input.replace(tagRegex, '').trim();
    
    // Re-attach tags as natural language descriptions
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
 * Core image generator. 
 * Stripped of all secondary URL parameters to prevent ORB/Binding errors.
 */
function findImageInModel(prompt, imageModel) {
    const lowerInput = prompt.toLowerCase();
    const foundMatches = [];
    
    // Process local matches from James' .bin compiled model
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
        // ENCODING: Ensures spaces and symbols don't trigger the abort error
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 1000000);
        
        // STABLE URL: Removed the &logo= parameter completely.
        // nologo=true refers to the pollinations default watermark.
        const imageUrl = `https://gen.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024`;
        
        // Returns the visual render for the Dashboard UI
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
 * Unified entry point for Genesis-AI
 */
window.generateImageResponse = function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return findImageInModel(processed.refinedPrompt, imageModelData);
};
