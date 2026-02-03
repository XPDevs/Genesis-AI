(function() {
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            const generationTime = 1000 + (Math.random() * 1000);

            setTimeout(() => {
                if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                    resolve(''); 
                    return;
                }

                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 1024;
                const ctx = canvas.getContext('2d');

                const input = prompt.toLowerCase();
                const isRealistic = input.includes("realistic") || input.includes("realism") || input.includes("real");

                // Background: Modern Dark Mode
                const grad = ctx.createRadialGradient(512, 512, 100, 512, 512, 800);
                grad.addColorStop(0, isRealistic ? '#1a1a1a' : '#1c1c1c');
                grad.addColorStop(1, '#050505');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 1024, 1024);

                // Tree Drawing Logic
                const drawTree = (x, y, len, angle, branchWidth, color) => {
                    ctx.beginPath();
                    ctx.save();
                    ctx.strokeStyle = isRealistic ? '#3d2b1f' : '#8B4513';
                    ctx.lineWidth = branchWidth;
                    ctx.translate(x, y);
                    ctx.rotate(angle * Math.PI / 180);
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, -len);
                    ctx.stroke();

                    if (len < 10) {
                        // Leaves
                        ctx.beginPath();
                        ctx.fillStyle = color;
                        if (isRealistic) {
                            ctx.ellipse(0, -len, 10, 15, Math.random(), 0, Math.PI * 2);
                        } else {
                            ctx.arc(0, -len, 20, 0, Math.PI * 2);
                        }
                        ctx.fill();
                        ctx.restore();
                        return;
                    }

                    drawTree(0, -len, len * 0.75, angle - 15, branchWidth * 0.8, color);
                    drawTree(0, -len, len * 0.75, angle + 15, branchWidth * 0.8, color);
                    ctx.restore();
                };

                // Styles
                const leafColor = isRealistic ? '#2d5a27' : '#32CD32';
                const trunkWidth = isRealistic ? 15 : 25;
                
                // Draw the actual tree
                drawTree(512, 900, 200, 0, trunkWidth, leafColor);

                // Add Glow / UI Elements consistent with XPDevs
                ctx.globalAlpha = 0.3;
                ctx.shadowBlur = 30;
                ctx.shadowColor = leafColor;
                ctx.fillText(isRealistic ? "REALISM MODE" : "CARTOON MODE", 512, 980);

                // Convert to local bin string
                const finalImage = canvas.toDataURL("image/png");
                resolve(finalImage);
            }, generationTime);
        });
    };

    console.log("Image Generation Module loaded.");
})();
