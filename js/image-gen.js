/**
 * Genesis-AI: Image Creator Module
 * Handles %tag% parsing and robust image delivery via gen.pollinations.ai.
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
};

/**
 * Searches the image model or generates a unique image via stable API.
 */
function findImageInModel(prompt, imageModel) {
    const lowerInput = prompt.toLowerCase();
    const foundMatches = [];
    
    // Filter out metadata from the model (standard for Genesis .bin data logic)
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
        // Use the most stable Pollinations endpoint
        const encodedPrompt = encodeURIComponent(prompt);
        
        // Random seed helps bypass browser caching and gateway errors
        const seed = Math.floor(Math.random() * 1000000);
        
        // Simplified URL to prevent OpaqueResponseBlocking
        // Note: The logo is added as a parameter but kept simple to avoid trigger-blocking
        const baseUrl = "https://gen.pollinations.ai/prompt/";
        const params = `?nologo=true&seed=${seed}&width=1024&height=1024`;
        
        // Construct standard Markdown image syntax
        responseText = `![${prompt}](${baseUrl}${encodedPrompt}${params})`;
    } else {
        // Use matches found in the local imageModel
        const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
        if (orderedMessages.length === 1) {
            responseText = orderedMessages[0];
        } else {
            const last = orderedMessages.pop();
            responseText = orderedMessages.join(", ") + " and " + last;
        }
    }

    return { role: "ai", text: responseText };
}

/**
 * Main Genesis-AI Entry Point
 * Used to call the module from the main UI controller.
 */
window.generateImageResponse = function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return findImageInModel(processed.refinedPrompt, imageModelData);
};
