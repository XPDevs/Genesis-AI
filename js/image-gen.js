/**
 * Genesis-AI: Image Creator Module
 * Handles %tag% parsing and model lookups for image generation.
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
window.processGenesisImageRequest = function(input) {
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

/**
 * Searches the image model for keywords from the prompt and constructs a response.
 * @param {string} prompt - The user's prompt, cleaned of tags.
 * @param {object} imageModel - The loaded image model data.
 * @returns {object} - A message object for the chat.
 */
function findImageInModel(prompt, imageModel) {
  const lowerInput = prompt.toLowerCase();

  const foundMatches = [];
  // Filter out metadata keys from the model before sorting
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
      const encodedPrompt = encodeURIComponent(prompt);
      // Construct a valid markdown image link to an external generation service.
      responseText = `!${prompt}`;
  } else {
      const orderedMessages = foundMatches.sort((a, b) => a.index - b.index).map(m => m.text);
      if (orderedMessages.length === 1) responseText = orderedMessages[0];
      else {
          const last = orderedMessages.pop();
          responseText = orderedMessages.join(", ") + " and " + last;
      }
  }

  const logoUrl = "https://xpdevs.github.io/Genesis-AI/icon.png";
  responseText = responseText.replace(/\]\((https:\/\/image\.pollinations\.ai\/prompt\/[^)]+)\)/g, (match, url) => {
      const separator = url.includes('?') ? '&' : '?';
      return `](${url}${separator}nologo=true&logo=${encodeURIComponent(logoUrl)})`;
  });

  return { role: "ai", text: responseText };
}

window.generateImageResponse = function(text, imageModelData) {
    const processed = window.processGenesisImageRequest(text);
    return findImageInModel(processed.refinedPrompt, imageModelData);
}
