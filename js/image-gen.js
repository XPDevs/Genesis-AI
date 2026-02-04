(function() {
    // Genesis-AI Image Generation Module
    // Optimized for high-detail 1024x1024 output
    window.generateImage = async function(prompt) {
        try {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                return '';
            }

            // Enhanced prompt for maximum detail and clarity
            const detailedPrompt = `${prompt}, high resolution, 4k, highly detailed, professional lighting`;

            // Requesting the visual from the cloud service with 1024x1024 dimensions
            const response = await puter.ai.txt2img(detailedPrompt, {
                width: 1024,
                height: 1024
            });
            
            const originalSrc = response.src;

            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Force canvas to 1024x1024 for consistency
                    canvas.width = 1024;
                    canvas.height = 1024;
                    const ctx = canvas.getContext('2d');

                    // Draw the high-detail generated image
                    ctx.drawImage(img, 0, 0, 1024, 1024);

                    // Add Genesis-AI Logo overlay
                    const logo = new Image();
                    logo.crossOrigin = "Anonymous";
                    logo.onload = () => {
                        const logoSize = 40; // Slightly larger for 1024px scale
                        const padding = 15;
                        ctx.drawImage(logo, canvas.width - logoSize - padding, canvas.height - logoSize - padding, logoSize, logoSize);

                        // Export to JPEG with high quality
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                        const base64 = dataUrl.split(',')[1];
                        const binary = atob(base64);

                        // Inject "GNIS" signature into the comment segment (FF FE)
                        const marker = "\xFF\xFE\x00\x06GNIS";

                        // Reconstruct binary with the signature after the start-of-image marker
                        const newBinary = binary.substring(0, 2) + marker + binary.substring(2);
                        const newBase64 = btoa(newBinary);

                        resolve("data:image/jpeg;base64," + newBase64);
                    };
                    logo.onerror = () => {
                        // Return high-res image even if logo fails
                        resolve(originalSrc);
                    };
                    logo.src = 'https://xpdevs.github.io/Genesis-AI/icon.png';
                };
                img.onerror = () => {
                    resolve(originalSrc);
                };
                img.src = originalSrc;
            });

        } catch (error) {
            console.error("Generation failed:", error);
            return '';
        }
    };

    if (typeof puter !== 'undefined') {
        console.log("Genesis-AI High-Res Module Active.");
    } else {
        console.warn("Cloud connection unavailable.");
    }
})();
