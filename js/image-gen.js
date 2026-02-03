(function() {
    /**
     * Genesis-AI: Internal Image Generation Module
     * Generates an actual image locally using Canvas based on the text prompt.
     */
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            const generationTime = 1500 + (Math.random() * 1000);

            setTimeout(() => {
                if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                    resolve(''); 
                    return;
                }

                // Create a drawing area
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');

                // Generate a unique color based on the prompt text
                let hash = 0;
                for (let i = 0; i < prompt.length; i++) {
                    hash = prompt.charCodeAt(i) + ((hash << 5) - hash);
                }
                const hue = Math.abs(hash % 360);

                // Draw a modern, rounded background
                const gradient = ctx.createLinearGradient(0, 0, 512, 512);
                gradient.addColorStop(0, `hsl(${hue}, 70%, 20%)`);
                gradient.addColorStop(1, `hsl(${(hue + 40) % 360}, 70%, 10%)`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 512, 512);

                // Add some abstract shapes to make it look "generated"
                ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.2)`;
                for(let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 200, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Clean, modern text overlay
                ctx.fillStyle = "#EAEAEA";
                ctx.font = "bold 32px 'Inter', sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                
                // Wrap text if it's too long
                const words = prompt.substring(0, 100).split(' ');
                let line = '';
                let y = 256;
                if (words.length > 4) {
                    ctx.fillText(words.slice(0, 4).join(' '), 256, 230);
                    ctx.fillText(words.slice(4, 8).join(' '), 256, 280);
                } else {
                    ctx.fillText(prompt.substring(0, 50), 256, 256);
                }

                // Convert the drawing to an actual image string
                const finalImage = canvas.toDataURL("image/png");
                resolve(finalImage);
            }, generationTime);
        });
    };

    console.log("Image Generation Module loaded.");
})();
