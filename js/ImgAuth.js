(function() {
    const aiSignatures = [
        { name: "Midjourney", codes: ["Midjourney", "mj_"] },
        { name: "DALL-E 3 / C2PA", codes: ["c2pa", "C2PA", "dalle", "DALL-E", "openai"] },
        { name: "Stable Diffusion", codes: ["Stable Diffusion", "parameters", "sampler", "cfg_scale", "seed_", "Denoising strength", "positive_prompt", "negative_prompt"] },
        { name: "Stable Diffusion XL", codes: ["SDXL", "sdxl"] },
        { name: "Adobe Firefly", codes: ["Firefly", "Adobe_", "adobe:"] },
        { name: "Adobe Generative", codes: ["Adobe Generative"] },
        { name: "Bing Image Creator", codes: ["Bing", "bing_"] },
        { name: "Leonardo.ai", codes: ["Leonardo", "leonardo"] },
        { name: "Playground AI", codes: ["Playground"] },
        { name: "BlueWillow", codes: ["BlueWillow"] },
        { name: "StarryAI", codes: ["StarryAI"] },
        { name: "NightCafe", codes: ["NightCafe"] },
        { name: "Craiyon", codes: ["Craiyon", "craiyon"] },
        { name: "DeepAI", codes: ["DeepAI"] },
        { name: "Runway", codes: ["Runway", "runway"] },
        { name: "Pika Labs", codes: ["Pika"] },
        { name: "Kaiber", codes: ["Kaiber"] },
        { name: "Artbreeder", codes: ["Artbreeder"] },
        { name: "Wombo Dream", codes: ["Wombo"] },
        { name: "GetIMG.ai", codes: ["GetIMG"] },
        { name: "CivitAI", codes: ["CivitAI"] },
        { name: "Tensor.art", codes: ["Tensor"] },
        { name: "SeaArt", codes: ["SeaArt"] },
        { name: "Mage.space", codes: ["Mage.space"] },
        { name: "Imagine.art", codes: ["Imagine"] },
        { name: "Fotor", codes: ["Fotor"] },
        { name: "Canva", codes: ["Canva"] },
        { name: "Picsart", codes: ["Picsart"] },
        { name: "Pixray", codes: ["Pixray"] },
        { name: "VQGAN", codes: ["VQGAN"] },
        { name: "Disco Diffusion", codes: ["Disco"] },
        { name: "Kandinsky", codes: ["Kandinsky"] },
        { name: "DeepFloyd", codes: ["DeepFloyd"] },
        { name: "Shutterstock AI", codes: ["Shutterstock"] },
        { name: "Getty Images AI", codes: ["Getty"] },
        { name: "NVIDIA Canvas", codes: ["Canvas", "NVIDIA"] },
        { name: "NVIDIA Picasso", codes: ["Picasso"] },
        { name: "Dream Machine", codes: ["Luma"] },
        { name: "Sora", codes: ["Sora"] },
        { name: "Haiper", codes: ["Haiper"] },
        { name: "Kling", codes: ["Kling"] },
        { name: "Vidu", codes: ["Vidu"] },
        { name: "CogView", codes: ["CogView"] },
        { name: "Hunyuan", codes: ["Hunyuan"] },
        { name: "Kolors", codes: ["Kolors"] },
        { name: "Flux", codes: ["Flux"] },
        { name: "Ideogram", codes: ["Ideogram"] },
        { name: "Recraft", codes: ["Recraft"] },
        { name: "Aurora", codes: ["Aurora"] },
        { name: "Mystic", codes: ["Mystic"] },
        { name: "Phonon", codes: ["Phonon"] },
        { name: "Grok", codes: ["Grok"] },
        { name: "Imagen", codes: ["Imagen", "Google AI"] },
        { name: "Janus", codes: ["Janus"] },
        { name: "OmniGen", codes: ["OmniGen"] },
        { name: "RedPajama", codes: ["RedPajama"] },
        { name: "OpenJourney", codes: ["OpenJourney"] },
        { name: "Waifu Diffusion", codes: ["Waifu"] },
        { name: "NovelAI", codes: ["NovelAI"] },
        { name: "TrinArt", codes: ["TrinArt"] },
        { name: "Anything V3", codes: ["Anything V3"] },
        { name: "Anything V5", codes: ["Anything V5"] },
        { name: "AbyssOrangeMix", codes: ["AbyssOrange"] },
        { name: "Counterfeit", codes: ["Counterfeit"] },
        { name: "MeinaMix", codes: ["Meina"] },
        { name: "DreamShaper", codes: ["DreamShaper"] },
        { name: "Realistic Vision", codes: ["Realistic Vision"] },
        { name: "Deliberate", codes: ["Deliberate"] },
        { name: "Rev Animated", codes: ["Rev Animated"] },
        { name: "EpicRealism", codes: ["EpicRealism"] },
        { name: "AbsoluteReality", codes: ["AbsoluteReality"] },
        { name: "CyberRealistic", codes: ["CyberRealistic"] },
        { name: "Juggernaut", codes: ["Juggernaut"] },
        { name: "Pony Diffusion", codes: ["Pony"] },
        { name: "Animagine", codes: ["Animagine"] },
        { name: "Copax", codes: ["Copax"] },
        { name: "RealVis", codes: ["RealVis"] },
        { name: "ZavyChroma", codes: ["Zavy"] },
        { name: "ProtoVision", codes: ["ProtoVision"] },
        { name: "DynaVision", codes: ["DynaVision"] },
        { name: "NightVision", codes: ["NightVision"] },
        { name: "SDXL Lightning", codes: ["Lightning"] },
        { name: "Hyper-SD", codes: ["Hyper-SD"] },
        { name: "LCM", codes: ["LCM"] },
        { name: "ControlNet", codes: ["ControlNet"] },
        { name: "IP-Adapter", codes: ["IP-Adapter"] },
        { name: "T2I-Adapter", codes: ["T2I-Adapter"] },
        { name: "AnimateDiff", codes: ["AnimateDiff"] },
        { name: "ModelScope", codes: ["ModelScope"] },
        { name: "ZeroScope", codes: ["ZeroScope"] },
        { name: "Automatic1111", codes: ["Automatic1111", "A1111"] },
        { name: "ComfyUI", codes: ["ComfyUI", "Comfy"] },
        { name: "InvokeAI", codes: ["InvokeAI"] },
        { name: "Fooocus", codes: ["Fooocus"] },
        { name: "EasyDiffusion", codes: ["EasyDiffusion"] },
        { name: "HuggingFace", codes: ["HuggingFace"] },
        { name: "Diffusers", codes: ["Diffusers"] },
        { name: "Procreate", codes: ["Procreate"] },
        { name: "Clip Studio Paint", codes: ["Clip Studio"] },
        { name: "Krita", codes: ["Krita"] },
        { name: "Photoshop (Generative Fill)", codes: ["Adobe_Photoshop", "photoshop_generative"] },
        { name: "GIMP", codes: ["GIMP"] },
    ];

    const exifSoftwareMarkers = ["Software", "EXIF", "sK1", "Adobe Photoshop"];

    window.authenticateImage = async function(file) {
        console.log("ImgAuth is running");
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve("Error: No image file provided for authentication.");
                return;
            }

            const reader = new FileReader();
            
            reader.onload = function(e) {
                const buffer = e.target.result;
                const u8 = new Uint8Array(buffer);
                const totalSize = u8.length;
                const scanLimit = Math.min(u8.length, 100000);
                
                let binaryString = "";
                for (let i = 0; i < scanLimit; i++) {
                    binaryString += String.fromCharCode(u8[i]);
                }

                let detected = [];
                let confidence = 0;
                let signatureCount = 0;

                for (const sig of aiSignatures) {
                    let foundCodes = [];
                    for (const code of sig.codes) {
                        if (binaryString.includes(code)) {
                            foundCodes.push(code);
                        }
                    }
                    if (foundCodes.length > 0) {
                        if (!detected.find(d => d.name === sig.name)) {
                            detected.push({ name: sig.name, codes: foundCodes, count: foundCodes.length });
                        }
                        signatureCount++;
                        confidence += 10 + (foundCodes.length - 1) * 5;
                    }
                }

                if (confidence < 10) {
                    for (const marker of exifSoftwareMarkers) {
                        if (binaryString.includes(marker)) {
                            confidence += 5;
                            detected.push({ name: `EXIF: ${marker}`, codes: [marker], count: 1 });
                        }
                    }
                }

                if (totalSize < 5000) confidence -= 5;

                if (detected.length > 0) {
                    const primary = detected.reduce((a, b) => a.count > b.count ? a : b, detected[0]);
                    const allNames = detected.map(d => d.name).join(", ");
                    let resultText = `Image detected as AI-generated.\n`;
                    if (detected.length === 1) {
                        resultText += `Detected Signature: Matching known AI generation software "${primary.name}".\n`;
                    } else {
                        resultText += `Detected Signatures: ${allNames}.\n`;
                        resultText += `Primary Match: ${primary.name}.\n`;
                    }
                    resultText += `Confidence: ${Math.min(Math.round(confidence + 50), 99)}%`;
                    resolve(resultText);
                } else {
                    let note = "";
                    if (totalSize < 10000) note = " (small file size)";
                    resolve(`Image not detected as AI-generated.\nAnalysis: No AI generator signatures found in database of ${aiSignatures.length} generators${note}.\nResult: Likely captured/photographed or generated by an unknown/untracked AI model.`);
                }
            };
            reader.onerror = () => resolve("Error: Failed to read image file.");
            reader.readAsArrayBuffer(file);
        });
    };
})();
