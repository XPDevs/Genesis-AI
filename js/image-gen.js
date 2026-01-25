/**
 * Genesis-AI: Image Creator Module
 * Optimized for James Turner (XPDevs)
 * FIX: Updated for new Pollinations.ai API standards.
 * Bypasses ORB/CORS using a sandboxed Data-URI Iframe.
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
        // Updated for the latest Pollinations.ai URL structure
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 999999);
        const width = 1024;
        const height = 1024;
        
        // New Pollinations URL format with dimension and model parameters
        const directImageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
        
        /**
         * REPAIR: Constructing the Iframe content as a standalone HTML document.
         * This forces the browser to interpret the request as a simple image load
         * within a sub-frame, bypassing the GitHub Pages cross-origin restrictions.
         */
        const iframeContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; background: transparent; overflow: hidden; display: flex; justify-content: center; align-items: center; }
                    img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; font-family: sans-serif; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <img src="${directImageUrl}" alt="Generating ${prompt}..." />
            </body>
            </html>
        `;
        
        // Safe Base64 encoding for modern browsers
        const base64Content = btoa(unescape(encodeURIComponent(iframeContent)));
        const iframeHtml = `<iframe src="data:text/html;base64,${base64Content}" style="width:100%; aspect-ratio:1/1; border:none; border-radius:12px; background: #1a1a1a;" scrolling="no"></iframe>`;
        
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
