/**
 * Genesis-AI: Image Creator Module
 * Reverted to legacy 'image' subdomain for maximum compatibility.
 * James Turner (XPDevs) - Version 2026.1.10
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
    return { original: input, refinedPrompt: refined };
};

function findImageInModel(prompt, imageModel) {
    const lowerInput = prompt.toLowerCase();
    const foundMatches = [];
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
         * REVERTED: Using 'image.pollinations.ai' instead of 'gen'.
         * STAMP: Removed all logo parameters.
         */
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}&width=1024&height=1024`;
        
        return { 
            role: "ai", 
            text: `![${prompt}](${imageUrl})` 
        };
    } else {
        const ordered = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
        const responseText = ordered.length === 1 ? ordered[0] : ordered.join(", ") + " and " + ordered.pop();
        return { role: "ai", text: responseText };
    }
}

window.generateImageResponse = function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return findImageInModel(processed.refinedPrompt, imageModelData);
};
