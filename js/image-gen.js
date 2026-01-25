/**
 * Genesis-AI: Image Creator Module
 * Optimized for James Turner (XPDevs)
 * FIX: Minimal URL structure to bypass OpaqueResponseBlocking.
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

function findImageInModel(prompt, imageModel) {
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
         * PUREST URL: 
         * No gen. subdomain, no logo params, no width/height logic.
         * This prevents the browser from flagging the URL as "data-heavy".
         * We proxy it through allorigins.win to add the required CORS headers
         * for cross-origin use, which fixes the browser blocking issue.
         */
        const rawImageUrl = `https://pollinations.ai/p/${encodedPrompt}?seed=${seed}`;
        const proxiedImageUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawImageUrl)}`;
        
        return { 
            role: "ai", 
            text: `!${prompt}` 
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
