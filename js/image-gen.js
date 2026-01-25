/**
 * Genesis-AI: Image Creator Module
 * Optimized for James Turner (XPDevs)
 * FIX: Uses Data-URI Iframe to bypass ORB and 404/Binding Abortions.
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
        const directImageUrl = `https://image.pollinations.ai/p/${encodedPrompt}?seed=${seed}&nologo=true`;
        
        /**
         * REPAIR: Wrap the image in a static HTML document inside the iframe.
         * This prevents the browser from trying to "fetch" the image as a script resource.
         */
        const iframeContent = `
            <html>
            <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:transparent;overflow:hidden;">
                <img src="${directImageUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;" />
            </body>
            </html>
        `;
        
        // Encode the HTML to Base64 to bypass security filters
        const base64Content = btoa(iframeContent);
        const iframeHtml = `<iframe src="data:text/html;base64,${base64Content}" style="width:100%; aspect-ratio:1/1; border:none; border-radius:12px; overflow:hidden;" scrolling="no"></iframe>`;
        
        return { 
            role: "ai", 
            text: iframeHtml 
        };
    } else {
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
