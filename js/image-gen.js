(function() {
    window.generateImage = function(prompt) {
        return new Promise((resolve) => {
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                resolve(''); 
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');

            let hash = 0;
            for (let i = 0; i < prompt.length; i++) {
                hash = prompt.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash % 360);

            const grad = ctx.createRadialGradient(512, 512, 100, 512, 512, 800);
            grad.addColorStop(0, `hsl(${hue}, 80%, 30%)`);
            grad.addColorStop(1, '#050505');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1024, 1024);

            ctx.globalAlpha = 0.4;
            for(let i = 0; i < 15; i++) {
                ctx.fillStyle = `hsl(${(hue + i * 15) % 360}, 70%, 50%)`;
                ctx.beginPath();
                ctx.roundRect(Math.random() * 1024, Math.random() * 1024, 300, 300, 50);
                ctx.fill();
            }

            ctx.globalAlpha = 1.0;
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 42px 'Inter', sans-serif";
            ctx.textAlign = "center";
            ctx.shadowBlur = 20;
            ctx.shadowColor = "black";
            ctx.fillText(prompt.toUpperCase(), 512, 512);

            resolve(canvas.toDataURL("image/png"));
        });
    };

    console.log("Image Generation Module loaded.");
})();
