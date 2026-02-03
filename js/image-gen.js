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
            const originalSrc = response.src;

            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');

                    // Draw generated image
                    ctx.drawImage(img, 0, 0);

                    // Add Genesis-AI Logo
                    const logo = new Image();
                    logo.crossOrigin = "Anonymous";
                    logo.onload = () => {
                        const logoSize = 80;
                        const padding = 20;
                        ctx.drawImage(logo, canvas.width - logoSize - padding, canvas.height - logoSize - padding, logoSize, logoSize);

                        // Convert to JPEG and inject "GNIS" signature into comment segment
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                        const base64 = dataUrl.split(',')[1];
                        const binary = atob(base64);
                        
                        // Construct new binary with COM marker (FF FE) after SOI (FF D8)
                        // Marker: FF FE 00 06 'G' 'N' 'I' 'S'
                        const marker = "\xFF\xFE\x00\x06GNIS";
                        
                        // Insert after first 2 bytes (FF D8)
                        const newBinary = binary.substring(0, 2) + marker + binary.substring(2);
                        const newBase64 = btoa(newBinary);
                        
                        resolve("data:image/jpeg;base64," + newBase64);
                    };
                    logo.onerror = () => {
                        // Fallback if logo fails
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
            console.error("Cloud generation failed:", error);
            return '';
        }
    };

    // Verify connection to the cloud environment
    if (typeof puter !== 'undefined') {
        console.log("Image Generation Module loaded.");
    } else {
        console.warn("Error loading modal");
    }
})();
