/**
 * Genesis-AI: Image Creator Module
 * Handles %tag% parsing for image generation logic.
 */

const genesisColorPalette = {
    // Standard Colors
    "%bg_white%": "on a pure white background",
    "%bg_black%": "on a deep black background",
    "%bg_red%": "on a vibrant red background",
    "%bg_blue%": "on a professional blue background",
    "%bg_green%": "on a forest green background",
    "%bg_yellow%": "on a bright yellow background",
    "%bg_orange%": "on a sunset orange background",
    "%bg_purple%": "on a royal purple background",
    "%bg_pink%": "on a hot pink background",
    "%bg_grey%": "on a neutral grey background",
    
    // Modern/System Colors
    "%bg_dark%": "on a sleek dark-mode charcoal background",
    "%bg_light%": "on a soft off-white modern background",
    "%bg_glass%": "on a semi-transparent frosted glass background",
    
    // Metallic & Specialized
    "%bg_gold%": "on a polished gold metallic background",
    "%bg_silver%": "on a brushed silver background",
    "%bg_neon%": "on a glowing neon-lit background",
    "%bg_transparent%": "on a transparent alpha-channel background"
};

/**
 * Parses user input to extract Genesis color tags and clean the prompt.
 * @param {string} input - The raw user input (e.g., "smiley face %bg_white%")
 * @returns {object} - The processed prompt and the detected style.
 */
function processGenesisImageRequest(input) {
    let activeStyle = "";
    let cleanedPrompt = input;

    // Iterate through the palette to find matches
    for (const [tag, description] of Object.entries(genesisColorPalette)) {
        if (cleanedPrompt.includes(tag)) {
            activeStyle = description;
            // Remove the tag from the prompt (global replace)
            cleanedPrompt = cleanedPrompt.split(tag).join("").trim();
        }
    }

    // Construct the final string for the image generator
    // Example: "A smiley face, on a pure white background"
    const finalAiPrompt = activeStyle 
        ? `${cleanedPrompt}, ${activeStyle}` 
        : cleanedPrompt;

    return {
        original: input,
        refinedPrompt: finalAiPrompt,
        timestamp: new Date().toISOString()
    };
}

// Example Usage:
// const request = processGenesisImageRequest("make me an image of a smiley face %bg_white%");
// console.log(request.refinedPrompt); 
// Output: "make me an image of a smiley face, on a pure white background"
