(function() {
    // This module now offloads all drawing logic to the cloud environment
    window.generateImage = async function(prompt) {
        try {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                return '';
            }

            // Using the cloud intelligence service to generate the visual
            // This replaces the manual canvas and tree-drawing logic
            const response = await puter.ai.txt2img(prompt);
            
            // The cloud service returns a visual object which we can then use
            // in your modern, dark-mode dashboards or ecosystems
            return response.src; 

        } catch (error) {
            console.error("Cloud generation failed:", error);
            return '';
        }
    };

    // Verify connection to the cloud environment
    if (typeof puter !== 'undefined') {
        console.log("Image Generation Module: Now powered by Puter cloud services.");
    } else {
        console.warn("Puter.js not detected. Please ensure the cloud library is loaded.");
    }
})();
