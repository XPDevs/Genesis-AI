/**
 * Genesis-AI: Image Creator Module
 * Optimized for James Turner (XPDevs)
 * FIX: Uses srcdoc Iframe to bypass ORB/NS_BINDING_ABORTED.
 * FIX: Direct URL rendering to hide prompt text.
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
    
    // Genesis logic: Sort keys by length for precise matching
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
        
        // Use the new Pollinations Flux endpoint for high-quality generation
        const directImageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;
        
        /**
         * THE FIX: Using srcdoc avoids the NS_BINDING_ABORTED error.
         * The browser treats the <img> within the srcdoc as a standard media load.
         * It also hides your prompt from the dashboard display.
         */
        const iframeHtml = `
            <iframe 
                srcdoc="<html><body style='margin:0;padding:0;background:#111;display:flex;justify-content:center;align-items:center;overflow:hidden;'>
                        <img src='${directImageUrl}' style='width:100%;height:100%;object-fit:cover;border-radius:12px;' 
                        onload='this.style.opacity=1' style='opacity:0;transition:opacity 0.5s;' />
                        </body></html>"
                style="width:100%; aspect-ratio:1/1; border:none; border-radius:16px; background:#111; box-shadow: 0 8px 32px rgba(0,0,0,0.3);" 
                scrolling="no">
            </iframe>`;
        
        return { 
            role: "ai", 
            text: iframeHtml 
        };
    } else {
        // Handle model-specific text responses
        const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
        const responseText = orderedMessages.length === 1 
            ? orderedMessages[0] 
            : orderedMessages.slice(0, -1).join(", ") + " and " + orderedMessages.slice(-1);
        
        return { role: "ai", text: responseText };
    }
}

// 3. Main execution function called by main.js
window.generateImageResponse = async function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return await findImageInModel(processed.refinedPrompt, imageModelData);
};
