(function() {
    const aiSignatures = [
        { name: "Midjourney", codes: ["Midjourney", "mj_"] },
        { name: "Midjourney Niji", codes: ["Niji", "niji"] },
        { name: "Midjourney V6", codes: ["V6", "--v 6"] },
        { name: "DALL-E 3 / C2PA", codes: ["c2pa", "C2PA", "dalle", "DALL-E", "openai"] },
        { name: "DALL-E 2", codes: ["DALL-E 2", "dall-e-2"] },
        { name: "DALL-E 1", codes: ["DALL-E 1", "dall-e-1"] },
        { name: "Stable Diffusion", codes: ["Stable Diffusion", "parameters", "sampler", "cfg_scale", "seed_", "Denoising strength", "positive_prompt", "negative_prompt"] },
        { name: "Stable Diffusion 1.4", codes: ["sd-v1-4", "v1-4"] },
        { name: "Stable Diffusion 1.5", codes: ["sd-v1-5", "v1-5"] },
        { name: "Stable Diffusion 2.0", codes: ["sd-v2-0", "v2-0"] },
        { name: "Stable Diffusion 2.1", codes: ["sd-v2-1", "v2-1"] },
        { name: "Stable Diffusion XL", codes: ["SDXL", "sdxl", "sd_xl"] },
        { name: "Stable Diffusion 3.0", codes: ["sd3", "sd_3", "stable-diffusion-3"] },
        { name: "Stable Diffusion 3.5", codes: ["sd3.5", "sd_3.5", "stable-diffusion-3.5"] },
        { name: "Adobe Firefly", codes: ["Firefly", "Adobe_", "adobe:"] },
        { name: "Adobe Firefly 2", codes: ["Firefly 2", "firefly_v2"] },
        { name: "Adobe Generative", codes: ["Adobe Generative"] },
        { name: "Adobe Photoshop AI", codes: ["Adobe_Photoshop", "photoshop_generative", "Adobe Photoshop"] },
        { name: "Adobe Lightroom AI", codes: ["Lightroom AI", "Adobe_Lightroom"] },
        { name: "Adobe Illustrator AI", codes: ["Adobe_Illustrator", "illustrator_ai"] },
        { name: "Bing Image Creator", codes: ["Bing", "bing_"] },
        { name: "Bing Image Creator DALL-E", codes: ["Bing DALL-E", "bing_dalle"] },
        { name: "Leonardo.ai", codes: ["Leonardo", "leonardo"] },
        { name: "Leonardo Phoenix", codes: ["Phoenix", "leonardo_phoenix"] },
        { name: "Leonardo Canvas", codes: ["Leonardo Canvas", "leonardo_canvas"] },
        { name: "Playground AI", codes: ["Playground"] },
        { name: "Playground 2.5", codes: ["Playground 2.5"] },
        { name: "BlueWillow", codes: ["BlueWillow"] },
        { name: "StarryAI", codes: ["StarryAI"] },
        { name: "NightCafe", codes: ["NightCafe"] },
        { name: "Craiyon", codes: ["Craiyon", "craiyon"] },
        { name: "Craiyon V3", codes: ["Craiyon V3"] },
        { name: "DeepAI", codes: ["DeepAI"] },
        { name: "Runway Gen-1", codes: ["Runway Gen-1"] },
        { name: "Runway Gen-2", codes: ["Runway Gen-2", "runway"] },
        { name: "Runway Gen-3", codes: ["Runway Gen-3", "Runway"] },
        { name: "Pika Labs", codes: ["Pika"] },
        { name: "Pika 1.0", codes: ["Pika 1.0"] },
        { name: "Pika 2.0", codes: ["Pika 2.0"] },
        { name: "Kaiber", codes: ["Kaiber"] },
        { name: "Artbreeder", codes: ["Artbreeder"] },
        { name: "Wombo Dream", codes: ["Wombo"] },
        { name: "Wombo Dream v2", codes: ["Wombo v2"] },
        { name: "GetIMG.ai", codes: ["GetIMG"] },
        { name: "CivitAI", codes: ["CivitAI"] },
        { name: "Tensor.art", codes: ["Tensor"] },
        { name: "SeaArt", codes: ["SeaArt"] },
        { name: "Mage.space", codes: ["Mage.space"] },
        { name: "Imagine.art", codes: ["Imagine"] },
        { name: "Fotor", codes: ["Fotor"] },
        { name: "Fotor AI", codes: ["Fotor AI"] },
        { name: "Canva", codes: ["Canva"] },
        { name: "Canva AI", codes: ["Canva AI", "canva_ai"] },
        { name: "Picsart", codes: ["Picsart"] },
        { name: "Picsart AI", codes: ["Picsart AI"] },
        { name: "Pixray", codes: ["Pixray"] },
        { name: "VQGAN", codes: ["VQGAN"] },
        { name: "VQGAN+CLIP", codes: ["VQGAN+CLIP"] },
        { name: "Disco Diffusion", codes: ["Disco"] },
        { name: "Kandinsky 2.0", codes: ["Kandinsky 2.0"] },
        { name: "Kandinsky 2.1", codes: ["Kandinsky 2.1"] },
        { name: "Kandinsky 2.2", codes: ["Kandinsky 2.2"] },
        { name: "Kandinsky 3.0", codes: ["Kandinsky", "Kandinsky 3.0"] },
        { name: "DeepFloyd IF", codes: ["DeepFloyd"] },
        { name: "DeepFloyd IF XL", codes: ["DeepFloyd XL"] },
        { name: "Shutterstock AI", codes: ["Shutterstock"] },
        { name: "Getty Images AI", codes: ["Getty"] },
        { name: "NVIDIA Canvas", codes: ["Canvas", "NVIDIA"] },
        { name: "NVIDIA Picasso", codes: ["Picasso"] },
        { name: "NVIDIA GauGAN", codes: ["GauGAN"] },
        { name: "NVIDIA GauGAN2", codes: ["GauGAN2"] },
        { name: "NVIDIA eDiff-I", codes: ["eDiff-I"] },
        { name: "Dream Machine", codes: ["Luma"] },
        { name: "Luma Ray", codes: ["Luma Ray"] },
        { name: "Sora", codes: ["Sora"] },
        { name: "Haiper", codes: ["Haiper"] },
        { name: "Haiper 1.5", codes: ["Haiper 1.5"] },
        { name: "Kling 1.0", codes: ["Kling 1.0"] },
        { name: "Kling 1.5", codes: ["Kling", "Kling 1.5"] },
        { name: "Kling 2.0", codes: ["Kling 2.0"] },
        { name: "Vidu", codes: ["Vidu"] },
        { name: "Vidu 2.0", codes: ["Vidu 2.0"] },
        { name: "CogView 2", codes: ["CogView 2"] },
        { name: "CogView 3", codes: ["CogView", "CogView 3"] },
        { name: "Hunyuan", codes: ["Hunyuan"] },
        { name: "Hunyuan Video", codes: ["Hunyuan Video"] },
        { name: "Kolors", codes: ["Kolors"] },
        { name: "Flux", codes: ["Flux"] },
        { name: "Flux Pro", codes: ["Flux Pro"] },
        { name: "Flux Dev", codes: ["Flux Dev"] },
        { name: "Flux Schnell", codes: ["Flux Schnell"] },
        { name: "Ideogram", codes: ["Ideogram"] },
        { name: "Ideogram 2.0", codes: ["Ideogram 2.0"] },
        { name: "Recraft", codes: ["Recraft"] },
        { name: "Recraft V2", codes: ["Recraft V2"] },
        { name: "Aurora", codes: ["Aurora"] },
        { name: "Mystic", codes: ["Mystic"] },
        { name: "Phonon", codes: ["Phonon"] },
        { name: "Grok", codes: ["Grok"] },
        { name: "Grok 2", codes: ["Grok 2"] },
        { name: "Grok 3", codes: ["Grok 3"] },
        { name: "Imagen", codes: ["Imagen", "Google AI"] },
        { name: "Imagen 2", codes: ["Imagen 2"] },
        { name: "Imagen 3", codes: ["Imagen 3"] },
        { name: "Google Gemini / Gemini Nano", codes: ["Gemini", "gemini", "Google Gemini", "Gemini Nano"] },
        { name: "Janus", codes: ["Janus"] },
        { name: "Janus Pro", codes: ["Janus Pro"] },
        { name: "OmniGen", codes: ["OmniGen"] },
        { name: "RedPajama", codes: ["RedPajama"] },
        { name: "OpenJourney", codes: ["OpenJourney"] },
        { name: "Waifu Diffusion", codes: ["Waifu"] },
        { name: "Waifu Diffusion 1.5", codes: ["Waifu 1.5"] },
        { name: "NovelAI", codes: ["NovelAI"] },
        { name: "NovelAI Diffusion", codes: ["NovelAI Diffusion"] },
        { name: "NovelAI V3", codes: ["NovelAI V3"] },
        { name: "TrinArt", codes: ["TrinArt"] },
        { name: "TrinArt V2", codes: ["TrinArt V2"] },
        { name: "Anything V3", codes: ["Anything V3"] },
        { name: "Anything V4", codes: ["Anything V4"] },
        { name: "Anything V5", codes: ["Anything V5"] },
        { name: "AbyssOrangeMix", codes: ["AbyssOrange"] },
        { name: "AbyssOrangeMix 2", codes: ["AbyssOrange 2"] },
        { name: "Counterfeit", codes: ["Counterfeit"] },
        { name: "Counterfeit V3", codes: ["Counterfeit V3"] },
        { name: "MeinaMix", codes: ["Meina"] },
        { name: "MeinaMix V11", codes: ["Meina V11"] },
        { name: "DreamShaper", codes: ["DreamShaper"] },
        { name: "DreamShaper 8", codes: ["DreamShaper 8"] },
        { name: "Realistic Vision", codes: ["Realistic Vision"] },
        { name: "Realistic Vision V5", codes: ["Realistic V5"] },
        { name: "Deliberate", codes: ["Deliberate"] },
        { name: "Deliberate V2", codes: ["Deliberate V2"] },
        { name: "Deliberate V3", codes: ["Deliberate V3"] },
        { name: "Rev Animated", codes: ["Rev Animated"] },
        { name: "EpicRealism", codes: ["EpicRealism"] },
        { name: "EpicRealism V7", codes: ["EpicRealism V7"] },
        { name: "AbsoluteReality", codes: ["AbsoluteReality"] },
        { name: "AbsoluteReality V2", codes: ["AbsoluteReality V2"] },
        { name: "CyberRealistic", codes: ["CyberRealistic"] },
        { name: "CyberRealistic V4", codes: ["CyberRealistic V4"] },
        { name: "Juggernaut", codes: ["Juggernaut"] },
        { name: "Juggernaut XL", codes: ["Juggernaut XL"] },
        { name: "Pony Diffusion", codes: ["Pony"] },
        { name: "Pony Diffusion V6", codes: ["Pony V6"] },
        { name: "Animagine", codes: ["Animagine"] },
        { name: "Animagine XL", codes: ["Animagine XL"] },
        { name: "Copax", codes: ["Copax"] },
        { name: "Copax Timeline", codes: ["Copax Timeline"] },
        { name: "Copax Valor", codes: ["Copax Valor"] },
        { name: "RealVis", codes: ["RealVis"] },
        { name: "RealVis XL", codes: ["RealVis XL"] },
        { name: "RealVis V5", codes: ["RealVis V5"] },
        { name: "ZavyChroma", codes: ["Zavy"] },
        { name: "ProtoVision", codes: ["ProtoVision"] },
        { name: "DynaVision", codes: ["DynaVision"] },
        { name: "NightVision", codes: ["NightVision"] },
        { name: "SDXL Lightning", codes: ["Lightning"] },
        { name: "Hyper-SD", codes: ["Hyper-SD"] },
        { name: "Hyper-SD XL", codes: ["Hyper-SD XL"] },
        { name: "LCM", codes: ["LCM"] },
        { name: "LCM XL", codes: ["LCM XL"] },
        { name: "LCM LoRA", codes: ["LCM LoRA"] },
        { name: "SD Turbo", codes: ["SD Turbo", "sd_turbo"] },
        { name: "SDXL Turbo", codes: ["SDXL Turbo", "sdxl_turbo"] },
        { name: "ControlNet", codes: ["ControlNet"] },
        { name: "ControlNet Canny", codes: ["ControlNet Canny"] },
        { name: "ControlNet Depth", codes: ["ControlNet Depth"] },
        { name: "ControlNet Pose", codes: ["ControlNet Pose"] },
        { name: "ControlNet Scribble", codes: ["ControlNet Scribble"] },
        { name: "ControlNet MLSD", codes: ["ControlNet MLSD"] },
        { name: "ControlNet Normal", codes: ["ControlNet Normal"] },
        { name: "ControlNet Inpaint", codes: ["ControlNet Inpaint"] },
        { name: "ControlNet Tile", codes: ["ControlNet Tile"] },
        { name: "ControlNet IP2P", codes: ["ControlNet IP2P"] },
        { name: "ControlNet Shuffle", codes: ["ControlNet Shuffle"] },
        { name: "ControlNet SoftEdge", codes: ["ControlNet SoftEdge"] },
        { name: "ControlNet Lineart", codes: ["ControlNet Lineart"] },
        { name: "ControlNet OpenPose", codes: ["ControlNet OpenPose"] },
        { name: "ControlNet Seg", codes: ["ControlNet Seg"] },
        { name: "IP-Adapter", codes: ["IP-Adapter"] },
        { name: "IP-Adapter Plus", codes: ["IP-Adapter Plus"] },
        { name: "IP-Adapter Face", codes: ["IP-Adapter Face"] },
        { name: "T2I-Adapter", codes: ["T2I-Adapter"] },
        { name: "AnimateDiff", codes: ["AnimateDiff"] },
        { name: "AnimateDiff V3", codes: ["AnimateDiff V3"] },
        { name: "ModelScope", codes: ["ModelScope"] },
        { name: "ZeroScope", codes: ["ZeroScope"] },
        { name: "ZeroScope V2", codes: ["ZeroScope V2"] },
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
        { name: "Krita AI", codes: ["Krita AI"] },
        { name: "GIMP", codes: ["GIMP"] },
        { name: "Affinity Photo", codes: ["Affinity"] },
        { name: "Corel Painter", codes: ["Corel"] },
        { name: "Paint Tool SAI", codes: ["PaintTool"] },
        { name: "RealCartoon", codes: ["RealCartoon"] },
        { name: "RealCartoon XL", codes: ["RealCartoon XL"] },
        { name: "ToonYou", codes: ["ToonYou"] },
        { name: "MajicMix Realistic", codes: ["MajicMix"] },
        { name: "MajicMix Fantasy", codes: ["MajicMix Fantasy"] },
        { name: "ChilloutMix", codes: ["ChilloutMix"] },
        { name: "Ghibli Diffusion", codes: ["Ghibli"] },
        { name: "SamDoesArt", codes: ["SamDoesArt"] },
        { name: "Lyriel", codes: ["Lyriel"] },
        { name: "AOM3", codes: ["AOM3"] },
        { name: "PastelMix", codes: ["PastelMix"] },
        { name: "PastelMix XL", codes: ["PastelMix XL"] },
        { name: "Dreamlike", codes: ["Dreamlike"] },
        { name: "Dreamlike PhotoReal", codes: ["Dreamlike PhotoReal"] },
        { name: "Dreamlike Anime", codes: ["Dreamlike Anime"] },
        { name: "Dreamlike Fantasy", codes: ["Dreamlike Fantasy"] },
        { name: "GhostMix", codes: ["GhostMix"] },
        { name: "GhostXL", codes: ["GhostXL"] },
        { name: "CetusMix", codes: ["CetusMix"] },
        { name: "CetusMix XL", codes: ["CetusMix XL"] },
        { name: "Colorful", codes: ["Colorful"] },
        { name: "XXMix", codes: ["XXMix"] },
        { name: "XXMix 9", codes: ["XXMix 9"] },
        { name: "PureVision", codes: ["PureVision"] },
        { name: "PureVision XL", codes: ["PureVision XL"] },
        { name: "CrystalClear", codes: ["CrystalClear"] },
        { name: "CrystalClear XL", codes: ["CrystalClear XL"] },
        { name: "BlueMix", codes: ["BlueMix"] },
        { name: "OrangeMix", codes: ["OrangeMix"] },
        { name: "OrangeMix V3", codes: ["OrangeMix V3"] },
        { name: "PeachMix", codes: ["PeachMix"] },
        { name: "BerryMix", codes: ["BerryMix"] },
        { name: "AppleMix", codes: ["AppleMix"] },
        { name: "BananaMix", codes: ["BananaMix"] },
        { name: "GrapeMix", codes: ["GrapeMix"] },
        { name: "CherryMix", codes: ["CherryMix"] },
        { name: "LemonMix", codes: ["LemonMix"] },
        { name: "LimeMix", codes: ["LimeMix"] },
        { name: "MangoMix", codes: ["MangoMix"] },
        { name: "MelonMix", codes: ["MelonMix"] },
        { name: "KiwiMix", codes: ["KiwiMix"] },
        { name: "PlumMix", codes: ["PlumMix"] },
        { name: "PearMix", codes: ["PearMix"] },
        { name: "FigMix", codes: ["FigMix"] },
        { name: "DateMix", codes: ["DateMix"] },
        { name: "RaisinMix", codes: ["RaisinMix"] },
        { name: "CurrantMix", codes: ["CurrantMix"] },
        { name: "GooseberryMix", codes: ["GooseberryMix"] },
        { name: "ElderberryMix", codes: ["ElderberryMix"] },
        { name: "CranberryMix", codes: ["CranberryMix"] },
        { name: "BlueberryMix", codes: ["BlueberryMix"] },
        { name: "StrawberryMix", codes: ["StrawberryMix"] },
        { name: "RaspberryMix", codes: ["RaspberryMix"] },
        { name: "BlackberryMix", codes: ["BlackberryMix"] },
        { name: "BoysenberryMix", codes: ["BoysenberryMix"] },
        { name: "CloudberryMix", codes: ["CloudberryMix"] },
        { name: "SalmonberryMix", codes: ["SalmonberryMix"] },
        { name: "ThimbleberryMix", codes: ["ThimbleberryMix"] },
        { name: "WineberryMix", codes: ["WineberryMix"] },
        { name: "BarberryMix", codes: ["BarberryMix"] },
        { name: "BayberryMix", codes: ["BayberryMix"] },
        { name: "BilberryMix", codes: ["BilberryMix"] },
        { name: "ChokeberryMix", codes: ["ChokeberryMix"] },
        { name: "HuckleberryMix", codes: ["HuckleberryMix"] },
        { name: "GojiBerryMix", codes: ["GojiBerryMix"] },
        { name: "AcaiBerryMix", codes: ["AcaiBerryMix"] },
        { name: "JabuticabaMix", codes: ["JabuticabaMix"] },
        { name: "LangsatMix", codes: ["LangsatMix"] },
        { name: "MangosteenMix", codes: ["MangosteenMix"] },
        { name: "RambutanMix", codes: ["RambutanMix"] },
        { name: "SalakMix", codes: ["SalakMix"] },
        { name: "SapodillaMix", codes: ["SapodillaMix"] },
        { name: "SoursopMix", codes: ["SoursopMix"] },
        { name: "SugarAppleMix", codes: ["SugarAppleMix"] },
        { name: "TamarindMix", codes: ["TamarindMix"] },
        { name: "SeaBuckthornMix", codes: ["SeaBuckthornMix"] },
        { name: "SnowberryMix", codes: ["SnowberryMix"] },
        { name: "PartridgeberryMix", codes: ["PartridgeberryMix"] },
        { name: "TwinberryMix", codes: ["TwinberryMix"] },
        { name: "WintergreenMix", codes: ["WintergreenMix"] },
        { name: "BearberryMix", codes: ["BearberryMix"] },
        { name: "BunchberryMix", codes: ["BunchberryMix"] },
        { name: "CrowberryMix", codes: ["CrowberryMix"] },
        { name: "FoxberryMix", codes: ["FoxberryMix"] },
        { name: "LingonberryMix", codes: ["LingonberryMix"] },
        { name: "TeaberryMix", codes: ["TeaberryMix"] },
        { name: "WhortleberryMix", codes: ["WhortleberryMix"] },
        { name: "YumberryMix", codes: ["YumberryMix"] },
        { name: "BacuriMix", codes: ["BacuriMix"] },
        { name: "BiribaMix", codes: ["BiribaMix"] },
        { name: "CabeludaMix", codes: ["CabeludaMix"] },
        { name: "CajaMix", codes: ["CajaMix"] },
        { name: "CamuCamuMix", codes: ["CamuCamuMix"] },
        { name: "CashewMix", codes: ["CashewMix"] },
        { name: "CherimoyaMix", codes: ["CherimoyaMix"] },
        { name: "GraviolaMix", codes: ["GraviolaMix"] },
        { name: "JenipapoMix", codes: ["JenipapoMix"] },
        { name: "JocoteMix", codes: ["JocoteMix"] },
        { name: "LucumaMix", codes: ["LucumaMix"] },
        { name: "MaboloMix", codes: ["MaboloMix"] },
        { name: "MammeeMix", codes: ["MammeeMix"] },
        { name: "MameyMix", codes: ["MameyMix"] },
        { name: "MarangMix", codes: ["MarangMix"] },
        { name: "NanceMix", codes: ["NanceMix"] },
        { name: "NoniMix", codes: ["NoniMix"] },
        { name: "PequiMix", codes: ["PequiMix"] },
        { name: "PitaMix", codes: ["PitaMix"] },
        { name: "PitangaMix", codes: ["PitangaMix"] },
        { name: "PitombaMix", codes: ["PitombaMix"] },
        { name: "PulasanMix", codes: ["PulasanMix"] },
        { name: "SaguaroMix", codes: ["SaguaroMix"] },
        { name: "SapoteMix", codes: ["SapoteMix"] },
        { name: "SeriguelaMix", codes: ["SeriguelaMix"] },
        { name: "SweetsopMix", codes: ["SweetsopMix"] },
        { name: "UmbuMix", codes: ["UmbuMix"] },
        { name: "UvaiaMix", codes: ["UvaiaMix"] },
        { name: "AthertonMix", codes: ["AthertonMix"] },
        { name: "BabacoMix", codes: ["BabacoMix"] },
        { name: "BaelMix", codes: ["BaelMix"] },
        { name: "BignayMix", codes: ["BignayMix"] },
        { name: "BilimbiMix", codes: ["BilimbiMix"] },
        { name: "BreadfruitMix", codes: ["BreadfruitMix"] },
        { name: "BurmeseGrapeMix", codes: ["BurmeseGrapeMix"] },
        { name: "CalabashMix", codes: ["CalabashMix"] },
        { name: "CamachileMix", codes: ["CamachileMix"] },
        { name: "CanistelMix", codes: ["CanistelMix"] },
        { name: "CatmonMix", codes: ["CatmonMix"] },
        { name: "CempedakMix", codes: ["CempedakMix"] },
        { name: "ChayoteMix", codes: ["ChayoteMix"] },
        { name: "ChempedakMix", codes: ["ChempedakMix"] },
        { name: "ChicoMix", codes: ["ChicoMix"] },
        { name: "ChironjaMix", codes: ["ChironjaMix"] },
        { name: "ChokecherryMix", codes: ["ChokecherryMix"] },
        { name: "CitronMix", codes: ["CitronMix"] },
        { name: "CocoplumMix", codes: ["CocoplumMix"] },
        { name: "DabaiMix", codes: ["DabaiMix"] },
        { name: "DamsonMix", codes: ["DamsonMix"] },
        { name: "DangleberryMix", codes: ["DangleberryMix"] },
        { name: "DatePlumMix", codes: ["DatePlumMix"] },
        { name: "DesertBananaMix", codes: ["DesertBananaMix"] },
        { name: "DillyMix", codes: ["DillyMix"] },
        { name: "DurianMix", codes: ["DurianMix"] },
        { name: "EggFruitMix", codes: ["EggFruitMix"] },
        { name: "EmblicMix", codes: ["EmblicMix"] },
        { name: "FeijoaMix", codes: ["FeijoaMix"] },
        { name: "GacMix", codes: ["GacMix"] },
        { name: "GandariaMix", codes: ["GandariaMix"] },
        { name: "GenipMix", codes: ["GenipMix"] },
        { name: "GreengageMix", codes: ["GreengageMix"] },
        { name: "GuavaMix", codes: ["GuavaMix"] },
        { name: "HogPlumMix", codes: ["HogPlumMix"] },
        { name: "HoneysuckleMix", codes: ["HoneysuckleMix"] },
        { name: "IllawarraMix", codes: ["IllawarraMix"] },
        { name: "ImbuMix", codes: ["ImbuMix"] },
        { name: "IndianFigMix", codes: ["IndianFigMix"] },
        { name: "JackfruitMix", codes: ["JackfruitMix"] },
        { name: "JakMix", codes: ["JakMix"] },
        { name: "JaltomataMix", codes: ["JaltomataMix"] },
        { name: "JapanesePlumMix", codes: ["JapanesePlumMix"] },
        { name: "JavaPlumMix", codes: ["JavaPlumMix"] },
        { name: "JellyPalmMix", codes: ["JellyPalmMix"] },
        { name: "JujubeMix", codes: ["JujubeMix"] },
        { name: "KaffirLimeMix", codes: ["KaffirLimeMix"] },
        { name: "KapokMix", codes: ["KapokMix"] },
        { name: "KarkallaMix", codes: ["KarkallaMix"] },
        { name: "KeiAppleMix", codes: ["KeiAppleMix"] },
        { name: "KepelMix", codes: ["KepelMix"] },
        { name: "KorlanMix", codes: ["KorlanMix"] },
        { name: "KudamMix", codes: ["KudamMix"] },
        { name: "KumquatMix", codes: ["KumquatMix"] },
        { name: "LablabMix", codes: ["LablabMix"] },
        { name: "LakoochaMix", codes: ["LakoochaMix"] },
        { name: "LamutMix", codes: ["LamutMix"] },
        { name: "LanzoneMix", codes: ["LanzoneMix"] },
        { name: "LapsiMix", codes: ["LapsiMix"] },
        { name: "LemonDropMix", codes: ["LemonDropMix"] },
        { name: "LengkengMix", codes: ["LengkengMix"] },
        { name: "LeucaenaMix", codes: ["LeucaenaMix"] },
        { name: "LonganMix", codes: ["LonganMix"] },
        { name: "LoquatMix", codes: ["LoquatMix"] },
        { name: "LoviLoviMix", codes: ["LoviLoviMix"] },
        { name: "LuckyNutMix", codes: ["LuckyNutMix"] },
        { name: "MacadamiaMix", codes: ["MacadamiaMix"] },
        { name: "MahuaMix", codes: ["MahuaMix"] },
        { name: "MalayAppleMix", codes: ["MalayAppleMix"] },
        { name: "MalpighiaMix", codes: ["MalpighiaMix"] },
        { name: "MamoncilloMix", codes: ["MamoncilloMix"] },
        { name: "MandarinMix", codes: ["MandarinMix"] },
        { name: "MandelonMix", codes: ["MandelonMix"] },
        { name: "MangabaMix", codes: ["MangabaMix"] },
        { name: "MangoPlumMix", codes: ["MangoPlumMix"] },
        { name: "ManiMix", codes: ["ManiMix"] },
        { name: "MaprangMix", codes: ["MaprangMix"] },
        { name: "MaracujaMix", codes: ["MaracujaMix"] },
        { name: "MaroloMix", codes: ["MaroloMix"] },
        { name: "MaypopMix", codes: ["MaypopMix"] },
        { name: "MedlarMix", codes: ["MedlarMix"] },
        { name: "MelonPearMix", codes: ["MelonPearMix"] },
        { name: "MidyimMix", codes: ["MidyimMix"] },
        { name: "MiracleFruitMix", codes: ["MiracleFruitMix"] },
        { name: "MombinMix", codes: ["MombinMix"] },
        { name: "MonsteraMix", codes: ["MonsteraMix"] },
        { name: "MorindaMix", codes: ["MorindaMix"] },
        { name: "MountainAppleMix", codes: ["MountainAppleMix"] },
        { name: "MunduMix", codes: ["MunduMix"] },
        { name: "NaioMix", codes: ["NaioMix"] },
        { name: "NannyberryMix", codes: ["NannyberryMix"] },
        { name: "NaranjillaMix", codes: ["NaranjillaMix"] },
        { name: "NereMix", codes: ["NereMix"] },
        { name: "NunguMix", codes: ["NunguMix"] },
        { name: "OchraMix", codes: ["OchraMix"] },
        { name: "OllalacoMix", codes: ["OllalacoMix"] },
        { name: "OtaheiteMix", codes: ["OtaheiteMix"] },
        { name: "OwalaMix", codes: ["OwalaMix"] },
        { name: "PahoMix", codes: ["PahoMix"] },
        { name: "PandanusMix", codes: ["PandanusMix"] },
        { name: "PapawMix", codes: ["PapawMix"] },
        { name: "PassionfruitMix", codes: ["PassionfruitMix"] },
        { name: "PataxteMix", codes: ["PataxteMix"] },
        { name: "PawpawMix", codes: ["PawpawMix"] },
        { name: "PeanutMix", codes: ["PeanutMix"] },
        { name: "PepinoMix", codes: ["PepinoMix"] },
        { name: "PersimmonMix", codes: ["PersimmonMix"] },
        { name: "PigeonPeaMix", codes: ["PigeonPeaMix"] },
        { name: "PiliNutMix", codes: ["PiliNutMix"] },
        { name: "PineberryMix", codes: ["PineberryMix"] },
        { name: "PitayaMix", codes: ["PitayaMix"] },
        { name: "PohaMix", codes: ["PohaMix"] },
        { name: "PondAppleMix", codes: ["PondAppleMix"] },
        { name: "PricklyPearMix", codes: ["PricklyPearMix"] },
        { name: "PummeloMix", codes: ["PummeloMix"] },
        { name: "QuandongMix", codes: ["QuandongMix"] },
        { name: "QuinceMix", codes: ["QuinceMix"] },
        { name: "RambaiMix", codes: ["RambaiMix"] },
        { name: "RiberryMix", codes: ["RiberryMix"] },
        { name: "RoseAppleMix", codes: ["RoseAppleMix"] },
        { name: "RosehipMix", codes: ["RosehipMix"] },
        { name: "SafouMix", codes: ["SafouMix"] },
        { name: "SageretiaMix", codes: ["SageretiaMix"] },
        { name: "SalsifyMix", codes: ["SalsifyMix"] },
        { name: "SantolMix", codes: ["SantolMix"] },
        { name: "SapucaiaMix", codes: ["SapucaiaMix"] },
        { name: "SaskatoonMix", codes: ["SaskatoonMix"] },
        { name: "SeagrapeMix", codes: ["SeagrapeMix"] },
        { name: "ServiceberryMix", codes: ["ServiceberryMix"] },
        { name: "ShaddockMix", codes: ["ShaddockMix"] },
        { name: "SloeMix", codes: ["SloeMix"] },
        { name: "SorrelMix", codes: ["SorrelMix"] },
        { name: "SowarMix", codes: ["SowarMix"] },
        { name: "SpanishLimeMix", codes: ["SpanishLimeMix"] },
        { name: "StarAppleMix", codes: ["StarAppleMix"] },
        { name: "SugarPalmMix", codes: ["SugarPalmMix"] },
        { name: "SurinamCherryMix", codes: ["SurinamCherryMix"] },
        { name: "TahitiAppleMix", codes: ["TahitiAppleMix"] },
        { name: "TamarilloMix", codes: ["TamarilloMix"] },
        { name: "TangerineMix", codes: ["TangerineMix"] },
        { name: "TempleOrangeMix", codes: ["TempleOrangeMix"] },
        { name: "TimorMix", codes: ["TimorMix"] },
        { name: "TomatilloMix", codes: ["TomatilloMix"] },
        { name: "TopeeTamboMix", codes: ["TopeeTamboMix"] },
        { name: "TorpedoMix", codes: ["TorpedoMix"] },
        { name: "TreeTomatoMix", codes: ["TreeTomatoMix"] },
        { name: "UgliFruitMix", codes: ["UgliFruitMix"] },
        { name: "VanillaMix", codes: ["VanillaMix"] },
        { name: "VelvetAppleMix", codes: ["VelvetAppleMix"] },
        { name: "VelvetTamarindMix", codes: ["VelvetTamarindMix"] },
        { name: "VoavangaMix", codes: ["VoavangaMix"] },
        { name: "WaterAppleMix", codes: ["WaterAppleMix"] },
        { name: "WaxJambuMix", codes: ["WaxJambuMix"] },
        { name: "WildMangoMix", codes: ["WildMangoMix"] },
        { name: "WinePalmMix", codes: ["WinePalmMix"] },
        { name: "WitchettyMix", codes: ["WitchettyMix"] },
        { name: "XimeniaMix", codes: ["XimeniaMix"] },
        { name: "YamamomoMix", codes: ["YamamomoMix"] },
        { name: "YangmeiMix", codes: ["YangmeiMix"] },
        { name: "YellowMombinMix", codes: ["YellowMombinMix"] },
        { name: "YuzuMix", codes: ["YuzuMix"] },
        { name: "ZalaccaMix", codes: ["ZalaccaMix"] },
        { name: "ZigzagMix", codes: ["ZigzagMix"] },
        { name: "ZiziphusMix", codes: ["ZiziphusMix"] },
        { name: "ZucchiniMix", codes: ["ZucchiniMix"] },
        { name: "StyleGAN", codes: ["StyleGAN"] },
        { name: "StyleGAN2", codes: ["StyleGAN2"] },
        { name: "StyleGAN3", codes: ["StyleGAN3"] },
        { name: "BigGAN", codes: ["BigGAN"] },
        { name: "Taming Transformer", codes: ["Taming Transformer"] },
        { name: "GLIDE", codes: ["GLIDE"] },
        { name: "Make-A-Scene", codes: ["Make-A-Scene"] },
        { name: "Parti", codes: ["Parti"] },
        { name: "MUSE", codes: ["MUSE"] },
        { name: "RIN", codes: ["RIN"] },
        { name: "DINO", codes: ["DINO"] },
        { name: "DINOv2", codes: ["DINOv2"] },
        { name: "CLIP", codes: ["CLIP"] },
        { name: "OpenCLIP", codes: ["OpenCLIP"] },
        { name: "BLIP", codes: ["BLIP"] },
        { name: "BLIP-2", codes: ["BLIP-2"] },
        { name: "SAM", codes: ["SAM"] },
        { name: "Segment Anything", codes: ["Segment Anything"] },
        { name: "Grounding DINO", codes: ["Grounding DINO"] },
        { name: "GLIGEN", codes: ["GLIGEN"] },
        { name: "Stable Cascade", codes: ["Stable Cascade"] },
        { name: "Wuerstchen", codes: ["Wuerstchen"] },
        { name: "PixArt-alpha", codes: ["PixArt-alpha"] },
        { name: "PixArt-Sigma", codes: ["PixArt-Sigma"] },
        { name: "Playground v2", codes: ["Playground v2"] },
        { name: "Playground v2.5", codes: ["Playground v2.5"] },
        { name: "DeepCache", codes: ["DeepCache"] },
        { name: "TensorRT", codes: ["TensorRT"] },
        { name: "ONNX", codes: ["ONNX"] },
        { name: "OpenVINO", codes: ["OpenVINO"] },
        { name: "Core ML", codes: ["Core ML"] },
        { name: "DirectML", codes: ["DirectML"] },
        { name: "Apple MLX", codes: ["MLX"] },
        { name: "ChatGPT Vision", codes: ["ChatGPT Vision"] },
        { name: "Claude Vision", codes: ["Claude Vision"] },
        { name: "Gemini Vision", codes: ["Gemini Vision"] },
        { name: "Meta AI Imagine", codes: ["Meta AI"] },
        { name: "Emu", codes: ["Emu"] },
        { name: "Emu Video", codes: ["Emu Video"] },
        { name: "Movie Gen", codes: ["Movie Gen"] },
        { name: "Animate Anyone", codes: ["Animate Anyone"] },
        { name: "MagicAnimate", codes: ["MagicAnimate"] },
        { name: "DynamiCrafter", codes: ["DynamiCrafter"] },
        { name: "VideoCrafter", codes: ["VideoCrafter"] },
        { name: "VideoFusion", codes: ["VideoFusion"] },
        { name: "I2VGen-XL", codes: ["I2VGen-XL"] },
        { name: "CogVideo", codes: ["CogVideo"] },
        { name: "CogVideoX", codes: ["CogVideoX"] },
        { name: "T2V-Turbo", codes: ["T2V-Turbo"] },
        { name: "LaVie", codes: ["LaVie"] },
        { name: "PixelDance", codes: ["PixelDance"] },
        { name: "Mochi 1", codes: ["Mochi", "Mochi 1"] },
        { name: "Stable Video Diffusion", codes: ["Stable Video Diffusion"] },
        { name: "Stable Video 3D", codes: ["Stable Video 3D"] },
        { name: "Stable Zero123", codes: ["Stable Zero123"] },
        { name: "Zero123", codes: ["Zero123"] },
        { name: "Zero123++", codes: ["Zero123++"] },
        { name: "SyncDreamer", codes: ["SyncDreamer"] },
        { name: "DreamFusion", codes: ["DreamFusion"] },
        { name: "Magic3D", codes: ["Magic3D"] },
        { name: "Point-E", codes: ["Point-E"] },
        { name: "Shape-E", codes: ["Shape-E"] },
        { name: "GET3D", codes: ["GET3D"] },
        { name: "DreamGaussian", codes: ["DreamGaussian"] },
        { name: "TripoSR", codes: ["TripoSR"] },
        { name: "Tripo", codes: ["Tripo"] },
        { name: "Meshy", codes: ["Meshy"] },
        { name: "Luma Genie", codes: ["Genie"] },
        { name: "CSM AI", codes: ["CSM"] },
        { name: "Kaedim", codes: ["Kaedim"] },
        { name: "Masterpiece Studio", codes: ["Masterpiece"] },
        { name: "Scenario", codes: ["Scenario"] },
        { name: "Promethean AI", codes: ["Promethean"] },
        { name: "Gaia", codes: ["Gaia"] },
        { name: "SLAM", codes: ["SLAM"] },
        { name: "NeRF", codes: ["NeRF"] },
        { name: "Instant NGP", codes: ["Instant NGP"] },
        { name: "SuGaR", codes: ["SuGaR"] },
        { name: "Midjourney Alpha", codes: ["Midjourney Alpha"] },
        { name: "Magnific AI", codes: ["Magnific"] },
        { name: "Krea AI", codes: ["Krea"] },
        { name: "Vizcom", codes: ["Vizcom"] },
        { name: "Arcads", codes: ["Arcads"] },
        { name: "Typeface", codes: ["Typeface"] },
        { name: "Photoroom", codes: ["Photoroom"] },
        { name: "Remove.bg", codes: ["Remove.bg"] },
        { name: "Clipdrop", codes: ["Clipdrop"] },
        { name: "Cleanup.pictures", codes: ["Cleanup"] },
        { name: "Upscale.media", codes: ["Upscale.media"] },
        { name: "HitPaw", codes: ["HitPaw"] },
        { name: "Topaz Photo AI", codes: ["Topaz"] },
        { name: "Topaz Gigapixel", codes: ["Topaz Gigapixel"] },
        { name: "Topaz Denoise", codes: ["Topaz Denoise"] },
        { name: "Topaz Sharpen", codes: ["Topaz Sharpen"] },
        { name: "ON1 Photo RAW", codes: ["ON1"] },
        { name: "Luminar Neo", codes: ["Luminar"] },
        { name: "Remini", codes: ["Remini"] },
        { name: "GFPGAN", codes: ["GFPGAN"] },
        { name: "CodeFormer", codes: ["CodeFormer"] },
        { name: "RestoreFormer", codes: ["RestoreFormer"] },
        { name: "FaceFusion", codes: ["FaceFusion"] },
        { name: "InsightFace", codes: ["InsightFace"] },
        { name: "Roop", codes: ["Roop"] },
        { name: "Roop-unleashed", codes: ["Roop-unleashed"] },
        { name: "FaceSwap", codes: ["FaceSwap"] },
        { name: "DeepFaceLab", codes: ["DeepFaceLab"] },
        { name: "Reface", codes: ["Reface"] },
        { name: "Avatarify", codes: ["Avatarify"] },
        { name: "Synthesia", codes: ["Synthesia"] },
        { name: "HeyGen", codes: ["HeyGen"] },
        { name: "D-ID", codes: ["D-ID"] },
        { name: "Vyond", codes: ["Vyond"] },
        { name: "Elai", codes: ["Elai"] },
        { name: "Colossyan", codes: ["Colossyan"] },
        { name: "Pictory", codes: ["Pictory"] },
        { name: "InVideo", codes: ["InVideo"] },
        { name: "Fliki", codes: ["Fliki"] },
        { name: "Descript", codes: ["Descript"] },
        { name: "Kapwing", codes: ["Kapwing"] },
        { name: "VEED", codes: ["VEED"] },
        { name: "Opus Clip", codes: ["Opus Clip"] },
        { name: "Wisecut", codes: ["Wisecut"] },
        { name: "Munch", codes: ["Munch"] },
        { name: "Gling", codes: ["Gling"] },
        { name: "QuickVid", codes: ["QuickVid"] },
        { name: "Shuffll", codes: ["Shuffll"] },
        { name: "Waymark", codes: ["Waymark"] },
        { name: "Designs.ai", codes: ["Designs.ai"] },
        { name: "AdCreative", codes: ["AdCreative"] },
        { name: "LALAL.AI", codes: ["LALAL"] },
        { name: "AIVA", codes: ["AIVA"] },
        { name: "Soundraw", codes: ["Soundraw"] },
        { name: "Boomy", codes: ["Boomy"] },
        { name: "Mubert", codes: ["Mubert"] },
        { name: "Beatoven", codes: ["Beatoven"] },
        { name: "Stability Audio", codes: ["Stability Audio"] },
        { name: "Google MusicLM", codes: ["MusicLM"] },
        { name: "Meta MusicGen", codes: ["MusicGen"] },
        { name: "MAGE", codes: ["MAGE"] },
        { name: "DeepBach", codes: ["DeepBach"] },
        { name: "Jukebox", codes: ["Jukebox"] },
        { name: "Riffusion", codes: ["Riffusion"] },
        { name: "Suno", codes: ["Suno"] },
        { name: "Udio", codes: ["Udio"] },
        { name: "ElevenLabs", codes: ["ElevenLabs"] },
        { name: "Respeecher", codes: ["Respeecher"] },
        { name: "Voicemod", codes: ["Voicemod"] },
        { name: "Murf", codes: ["Murf"] },
        { name: "PlayHT", codes: ["PlayHT"] },
        { name: "WellSaid", codes: ["WellSaid"] },
        { name: "Speechify", codes: ["Speechify"] },
        { name: "NaturalReader", codes: ["NaturalReader"] },
        { name: "Listnr", codes: ["Listnr"] },
        { name: "LOVO", codes: ["LOVO"] },
        { name: "iMyFone", codes: ["iMyFone"] },
        { name: "Wondershare", codes: ["Wondershare"] },
        { name: "Filmora", codes: ["Filmora"] },
        { name: "DaVinci Resolve", codes: ["DaVinci Resolve"] },
        { name: "Premiere Pro", codes: ["Premiere Pro"] },
        { name: "After Effects", codes: ["After Effects"] },
        { name: "Final Cut Pro", codes: ["Final Cut Pro"] },
        { name: "Motion Array", codes: ["Motion Array"] },
        { name: "Runway ML", codes: ["Runway ML"] },
        { name: "VLLO", codes: ["VLLO"] },
        { name: "Spline AI", codes: ["Spline AI"] },
        { name: "Shap-E", codes: ["Shap-E"] },
        { name: "PhysDreamer", codes: ["PhysDreamer"] },
        { name: "DreamFusion 3D", codes: ["DreamFusion 3D"] },
        { name: "MVDream", codes: ["MVDream"] },
        { name: "ConsistentDream", codes: ["ConsistentDream"] },
        { name: "ViewCrafter", codes: ["ViewCrafter"] },
        { name: "WonderJourney", codes: ["WonderJourney"] },
        { name: "WorldDreamer", codes: ["WorldDreamer"] },
        { name: "UniScene", codes: ["UniScene"] },
        { name: "SceneDreamer", codes: ["SceneDreamer"] },
        { name: "Blockade Labs", codes: ["Blockade"] },
        { name: "SkyBox AI", codes: ["SkyBox"] },
        { name: "Leonardo World", codes: ["Leonardo World"] },
        { name: "Meshy AI", codes: ["Meshy AI"] },
        { name: "Alpha3D", codes: ["Alpha3D"] },
        { name: "G3D AI", codes: ["G3D"] },
        { name: "Poly", codes: ["Poly"] },
        { name: "Kinetix", codes: ["Kinetix"] },
        { name: "DeepMotion", codes: ["DeepMotion"] },
        { name: "Rokoko", codes: ["Rokoko"] },
        { name: "Move AI", codes: ["Move AI"] },
        { name: "Kavra", codes: ["Kavra"] },
        { name: "Plask", codes: ["Plask"] },
        { name: "Radical Motion", codes: ["Radical"] },
        { name: "Animate 3D", codes: ["Animate 3D"] },
        { name: "Mixamo", codes: ["Mixamo"] },
        { name: "Cascadeur", codes: ["Cascadeur"] },
        { name: "DeepAIMotion", codes: ["DeepAIMotion"] },
        { name: "SMPLer-X", codes: ["SMPLer-X"] },
        { name: "MotionGPT", codes: ["MotionGPT"] },
        { name: "MDM", codes: ["MDM"] },
        { name: "AvatarCLIP", codes: ["AvatarCLIP"] },
        { name: "TEACH", codes: ["TEACH"] },
        { name: "A2F", codes: ["A2F"] },
        { name: "Audio2Face", codes: ["Audio2Face"] },
        { name: "MetaHuman", codes: ["MetaHuman"] },
        { name: "Charisma", codes: ["Charisma"] },
        { name: "Inworld", codes: ["Inworld"] },
        { name: "Convai", codes: ["Convai"] },
        { name: "nVIDIA Omniverse", codes: ["Omniverse"] },
        { name: "Unity ML-Agents", codes: ["ML-Agents"] },
        { name: "Unreal Engine ML", codes: ["Unreal ML"] },
        { name: "Blender AI", codes: ["Blender AI"] },
        { name: "DreamTextures", codes: ["DreamTextures"] },
        { name: "Stable Diffusion WebUI", codes: ["sd_webui", "stable-diffusion-webui"] },
        { name: "Stability Matrix", codes: ["Stability Matrix"] },
        { name: "NMKD", codes: ["NMKD"] },
        { name: "Draw Things", codes: ["Draw Things"] },
        { name: "Mochi Diffusion", codes: ["Mochi Diffusion"] },
        { name: "Diffusion Bee", codes: ["Diffusion Bee"] },
        { name: "AI Paint", codes: ["AI Paint"] },
        { name: "Imagine", codes: ["Imagine"] },
        { name: "Dream by Wombo", codes: ["Dream by Wombo"] },
        { name: "DreamStudio", codes: ["DreamStudio"] },
        { name: "Clipdrop by Stability", codes: ["Clipdrop by Stability"] },
        { name: "Replicate", codes: ["Replicate"] },
        { name: "Segmind", codes: ["Segmind"] },
        { name: "Fal AI", codes: ["Fal AI"] },
        { name: "Together AI", codes: ["Together AI"] },
        { name: "Fireworks AI", codes: ["Fireworks AI"] },
        { name: "Anthropic", codes: ["Anthropic"] },
        { name: "OpenAI", codes: ["OpenAI"] },
        { name: "Google DeepMind", codes: ["DeepMind"] },
        { name: "Meta", codes: ["Meta"] },
        { name: "Microsoft Designer", codes: ["Microsoft Designer"] },
        { name: "Microsoft Copilot", codes: ["Copilot"] },
        { name: "Apple Intelligence", codes: ["Apple Intelligence"] },
        { name: "Samsung AI", codes: ["Samsung AI"] },
        { name: "Google Photos AI", codes: ["Google Photos AI"] },
        { name: "Magic Eraser", codes: ["Magic Eraser"] },
        { name: "Snapseed", codes: ["Snapseed"] },
        { name: "Lightroom", codes: ["Lightroom"] },
        { name: "VSCO", codes: ["VSCO"] },
        { name: "FaceApp", codes: ["FaceApp"] },
        { name: "Meitu", codes: ["Meitu"] },
        { name: "B612", codes: ["B612"] },
        { name: "SNOW", codes: ["SNOW"] },
        { name: "Zepeto", codes: ["Zepeto"] },
        { name: "Ready Player Me", codes: ["Ready Player Me"] },
        { name: "Avatar SDK", codes: ["Avatar SDK"] },
        { name: "Fotor GoFun", codes: ["Fotor GoFun"] },
        { name: "Prisma", codes: ["Prisma"] },
        { name: "DeepArt", codes: ["DeepArt"] },
        { name: "Ostagram", codes: ["Ostagram"] },
        { name: "DeepDream", codes: ["DeepDream"] },
        { name: "NeuralStyle", codes: ["NeuralStyle"] },
        { name: "Fast Neural Style", codes: ["Fast Neural Style"] },
        { name: "AdaIN", codes: ["AdaIN"] },
        { name: "CycleGAN", codes: ["CycleGAN"] },
        { name: "pix2pix", codes: ["pix2pix"] },
        { name: "pix2pixHD", codes: ["pix2pixHD"] },
        { name: "SPADE", codes: ["SPADE"] },
        { name: "GauGAN", codes: ["GauGAN"] },
        { name: "U-GAT-IT", codes: ["U-GAT-IT"] },
        { name: "MUNIT", codes: ["MUNIT"] },
        { name: "FUNIT", codes: ["FUNIT"] },
        { name: "StarGAN", codes: ["StarGAN"] },
        { name: "StarGAN v2", codes: ["StarGAN v2"] },
        { name: "CUT", codes: ["CUT"] },
        { name: "SinGAN", codes: ["SinGAN"] },
        { name: "InGAN", codes: ["InGAN"] },
        { name: "DeepFill", codes: ["DeepFill"] },
        { name: "LaMa", codes: ["LaMa"] },
        { name: "MAT", codes: ["MAT"] },
        { name: "Paint-by-Example", codes: ["Paint-by-Example"] },
        { name: "SmartBrush", codes: ["SmartBrush"] },
        { name: "BrushNet", codes: ["BrushNet"] },
        { name: "PowerPaint", codes: ["PowerPaint"] },
        { name: "Lama Cleaner", codes: ["Lama Cleaner"] },
        { name: "Remover.app", codes: ["Remover.app"] },
        { name: "Watermark Remover", codes: ["Watermark Remover"] },
        { name: "Stable Diffusion Inpainting", codes: ["sd-inpainting"] },
        { name: "Segment Anything Inpainting", codes: ["SAM Inpainting"] },
        { name: "M2M", codes: ["M2M"] },
        { name: "RePaint", codes: ["RePaint"] },
        { name: "Blended Diffusion", codes: ["Blended Diffusion"] },
        { name: "DiffEdit", codes: ["DiffEdit"] },
        { name: "SDEdit", codes: ["SDEdit"] },
        { name: "ILVR", codes: ["ILVR"] },
        { name: "SR3", codes: ["SR3"] },
        { name: "SRDiff", codes: ["SRDiff"] },
        { name: "LDM-SR", codes: ["LDM-SR"] },
        { name: "Stable Diffusion Upscale", codes: ["sd-upscale"] },
        { name: "SwinIR", codes: ["SwinIR"] },
        { name: "Real-ESRGAN", codes: ["Real-ESRGAN"] },
        { name: "BSRGAN", codes: ["BSRGAN"] },
        { name: "ESRGAN", codes: ["ESRGAN"] },
        { name: "SRGAN", codes: ["SRGAN"] },
        { name: "EDSR", codes: ["EDSR"] },
        { name: "RCAN", codes: ["RCAN"] },
        { name: "SAN", codes: ["SAN"] },
        { name: "HAT", codes: ["HAT"] },
        { name: "DAT", codes: ["DAT"] },
        { name: "DASR", codes: ["DASR"] },
        { name: "Omni-SR", codes: ["Omni-SR"] },
        { name: "DiffBIR", codes: ["DiffBIR"] },
        { name: "ResShift", codes: ["ResShift"] },
        { name: "LDM", codes: ["LDM"] },
        { name: "DDIM", codes: ["DDIM"] },
        { name: "DDPM", codes: ["DDPM"] },
        { name: "ADM", codes: ["ADM"] },
        { name: "IDDPM", codes: ["IDDPM"] },
        { name: "Improved DDPM", codes: ["Improved DDPM"] },
        { name: "Score SDE", codes: ["Score SDE"] },
        { name: "VE-SDE", codes: ["VE-SDE"] },
        { name: "VP-SDE", codes: ["VP-SDE"] },
        { name: "Subspace Diffusion", codes: ["Subspace Diffusion"] },
        { name: "Cold Diffusion", codes: ["Cold Diffusion"] },
        { name: "Soft Diffusion", codes: ["Soft Diffusion"] },
        { name: "Elucidated Diffusion", codes: ["Elucidated Diffusion"] },
        { name: "EDM", codes: ["EDM"] },
        { name: "Flow Matching", codes: ["Flow Matching"] },
        { name: "Rectified Flow", codes: ["Rectified Flow"] },
        { name: "Consistency Models", codes: ["Consistency Models"] },
        { name: "Consistency Trajectory", codes: ["Consistency Trajectory"] },
        { name: "Progressive Distillation", codes: ["Progressive Distillation"] },
        { name: "Guided Diffusion", codes: ["Guided Diffusion"] },
        { name: "Classifier Guidance", codes: ["Classifier Guidance"] },
        { name: "Classifier-Free Guidance", codes: ["Classifier-Free Guidance"] },
        { name: "DPM Solver", codes: ["DPM Solver"] },
        { name: "DPM++", codes: ["DPM++"] },
        { name: "UniPC", codes: ["UniPC"] },
        { name: "DEIS", codes: ["DEIS"] },
        { name: "PNDM", codes: ["PNDM"] },
        { name: "Heun", codes: ["Heun"] },
        { name: "Euler", codes: ["Euler"] },
        { name: "Euler a", codes: ["Euler a"] },
        { name: "LMS", codes: ["LMS"] },
        { name: "LMS Karras", codes: ["LMS Karras"] },
        { name: "DDIM Scheduler", codes: ["DDIM Scheduler"] },
        { name: "Karras", codes: ["Karras"] },
        { name: "SDCFG", codes: ["SDCFG"] },
        { name: "SAG", codes: ["SAG"] },
        { name: "DAAM", codes: ["DAAM"] },
        { name: "Cross Attention Control", codes: ["Cross Attention Control"] },
        { name: "Prompt-to-Prompt", codes: ["Prompt-to-Prompt"] },
        { name: "Null Text Inversion", codes: ["Null Text Inversion"] },
        { name: "Negative Prompt", codes: ["Negative Prompt"] },
        { name: "Txt2Lr", codes: ["Txt2Lr"] },
        { name: "DreamArtist", codes: ["DreamArtist"] },
        { name: "Custom Diffusion", codes: ["Custom Diffusion"] },
        { name: "Cones", codes: ["Cones"] },
        { name: "Cones 2", codes: ["Cones 2"] },
        { name: "SVDiff", codes: ["SVDiff"] },
        { name: "NeTI", codes: ["NeTI"] },
        { name: "Textual Inversion", codes: ["Textual Inversion"] },
        { name: "DreamBooth", codes: ["DreamBooth"] },
        { name: "DreamBooth LoRA", codes: ["DreamBooth LoRA"] },
        { name: "LoRA", codes: ["LoRA"] },
        { name: "LoHA", codes: ["LoHA"] },
        { name: "LoCon", codes: ["LoCon"] },
        { name: "DyLoRA", codes: ["DyLoRA"] },
        { name: "DoRA", codes: ["DoRA"] },
        { name: "PiSSA", codes: ["PiSSA"] },
        { name: "OpenAI DALL-E 3.5", codes: ["dall-e-3.5", "dalle3.5"] },
        { name: "Google Veo", codes: ["Veo", "veo"] },
        { name: "Google Veo 2", codes: ["Veo 2", "veo_2"] },
        { name: "Meta Imagine", codes: ["Meta Imagine", "meta_imagine"] },
        { name: "OpenAI o1", codes: ["o1", "openai_o1"] },
        { name: "xAI Aurora", codes: ["xAI Aurora", "xai_aurora"] },
        { name: "Perplexity AI", codes: ["Perplexity", "perplexity"] },
        { name: "DeepSeek", codes: ["DeepSeek", "deepseek"] },
        { name: "ByteDance Doubao", codes: ["Doubao", "doubao"] },
        { name: "Tencent Hunyuan", codes: ["Tencent Hunyuan"] },
        { name: "Alibaba Tongyi", codes: ["Tongyi", "tongyi"] },
        { name: "Baidu ERNIE", codes: ["ERNIE", "ernie"] },
        { name: "MiniMax", codes: ["MiniMax", "minimax"] },
        { name: "StepFun", codes: ["StepFun", "stepfun"] },
    ];

    const exifSoftwareMarkers = ["Software", "EXIF", "sK1", "Adobe Photoshop", "Adobe_", "photoshop_"];

    function computeEntropy(values, bins) {
        const hist = new Array(bins).fill(0);
        for (const v of values) {
            const b = Math.min(bins - 1, Math.floor(v * bins / 256));
            hist[b]++;
        }
        let ent = 0;
        for (const h of hist) {
            if (h > 0) { const p = h / values.length; ent -= p * Math.log2(p); }
        }
        return ent;
    }

    function variance(vals) {
        const m = vals.reduce((a,b)=>a+b,0) / vals.length;
        return vals.reduce((a,b)=>a+(b-m)**2,0) / vals.length;
    }

    function hist(values, bins) {
        const h = new Array(bins).fill(0);
        for (const v of values) {
            h[Math.min(bins - 1, Math.floor(v * bins / 256))]++;
        }
        return h;
    }

    function regionPixelData(data, w, x1, y1, x2, y2) {
        const out = [];
        for (let y = y1; y < y2; y++) {
            for (let x = x1; x < x2; x++) {
                const i = (y * w + x) * 4;
                out.push({ r: data[i], g: data[i+1], b: data[i+2] });
            }
        }
        return out;
    }

    function makeEval(name, score) {
        return { name: name, score: Math.max(0, Math.min(100, score)), weight: 1 };
    }

    function evalNoise(data, w, h) {
        const pts = [];
        const midX = Math.floor(w/2), midY = Math.floor(h/2);
        const quads = [
            ['tl', 0, 0, midX, midY], ['tr', midX, 0, w, midY],
            ['bl', 0, midY, midX, h], ['br', midX, midY, w, h]
        ];
        for (const [qn, x1, y1, x2, y2] of quads) {
            const px = regionPixelData(data, w, x1, y1, x2, y2);
            for (const ch of ['r','g','b']) {
                const vals = px.map(p => p[ch]);
                const v = variance(vals);
                const std = Math.sqrt(v);
                let s = 35;
                if (std < 8) s = 85;
                else if (std < 14) s = 65;
                else if (std < 20) s = 50;
                else if (std > 55) s = 70;
                else if (std > 45) s = 55;
                pts.push(makeEval('noise_std_' + ch + '_' + qn, s));
            }
            const rv = variance(px.map(p => p.r));
            const gv = variance(px.map(p => p.g));
            const bv = variance(px.map(p => p.b));
            const corr = Math.abs(rv - gv) + Math.abs(gv - bv) + Math.abs(rv - bv);
            pts.push(makeEval('noise_ch_corr_' + qn, corr < 500 ? 60 : 30));
        }
        const allVals = [];
        for (let i = 0; i < data.length; i += 4) {
            allVals.push((data[i] + data[i+1] + data[i+2]) / 3);
        }
        const ent = computeEntropy(allVals, 64);
        pts.push(makeEval('noise_lum_entropy', ent < 4.5 ? 70 : ent > 6.2 ? 40 : 50));
        const locVar = [];
        for (let y = 2; y < h-2; y += 4) {
            for (let x = 2; x < w-2; x += 4) {
                const i = (y*w+x)*4;
                const lum = (data[i]+data[i+1]+data[i+2])/3;
                locVar.push(lum);
            }
        }
        const lv = variance(locVar);
        pts.push(makeEval('noise_uniformity', lv < 2000 ? 65 : lv > 8000 ? 55 : 45));
        const ec = [];
        for (let y = 0; y < h-1; y += 2) {
            for (let x = 0; x < w-1; x += 2) {
                const i = (y*w+x)*4;
                const j = ((y+1)*w+x)*4;
                const diff = Math.abs(data[i]-data[j]) + Math.abs(data[i+1]-data[j+1]) + Math.abs(data[i+2]-data[j+2]);
                ec.push(diff);
            }
        }
        const meanNeighborDiff = ec.reduce((a,b)=>a+b,0) / ec.length;
        pts.push(makeEval('noise_neighbor_diff', meanNeighborDiff < 5 ? 75 : meanNeighborDiff > 25 ? 45 : 50));
        return pts;
    }

    function evalColor(data, w, h) {
        const pts = [];
        const midX = Math.floor(w/2), midY = Math.floor(h/2);
        const quads = [
            ['tl', 0, 0, midX, midY], ['tr', midX, 0, w, midY],
            ['bl', 0, midY, midX, h], ['br', midX, midY, w, h]
        ];
        const allR = [], allG = [], allB = [];
        for (let i = 0; i < data.length; i += 4) {
            allR.push(data[i]); allG.push(data[i+1]); allB.push(data[i+2]);
        }
        const entR = computeEntropy(allR, 64);
        const entG = computeEntropy(allG, 64);
        const entB = computeEntropy(allB, 64);
        pts.push(makeEval('color_entropy_r', entR < 4.5 ? 65 : 45));
        pts.push(makeEval('color_entropy_g', entG < 4.5 ? 65 : 45));
        pts.push(makeEval('color_entropy_b', entB < 4.5 ? 65 : 45));
        const corrRG = allR.reduce((a,_,i)=>a+Math.abs(allR[i]-allG[i]),0)/allR.length;
        const corrRB = allR.reduce((a,_,i)=>a+Math.abs(allR[i]-allB[i]),0)/allR.length;
        const corrGB = allG.reduce((a,_,i)=>a+Math.abs(allG[i]-allB[i]),0)/allG.length;
        pts.push(makeEval('color_corr_rg', corrRG < 15 ? 70 : 40));
        pts.push(makeEval('color_corr_rb', corrRB < 15 ? 70 : 40));
        pts.push(makeEval('color_corr_gb', corrGB < 15 ? 70 : 40));
        for (const [qn, x1, y1, x2, y2] of quads) {
            const px = regionPixelData(data, w, x1, y1, x2, y2);
            const sats = px.map(p => {
                const max = Math.max(p.r,p.g,p.b)/255, min = Math.min(p.r,p.g,p.b)/255;
                return max === 0 ? 0 : (max-min)/max;
            });
            const sm = sats.reduce((a,b)=>a+b,0)/sats.length;
            pts.push(makeEval('color_sat_mean_' + qn, sm > 0.45 ? 65 : sm > 0.3 ? 50 : 35));
            const sv = variance(sats);
            pts.push(makeEval('color_sat_var_' + qn, sv < 0.02 ? 60 : sv > 0.1 ? 45 : 50));
            const hues = px.map(p => {
                const r=p.r/255,g=p.g/255,b=p.b/255;
                const max=Math.max(r,g,b), min=Math.min(r,g,b);
                if (max===min) return 0;
                let h2;
                if (max===r) h2=(60*((g-b)/(max-min))+360)%360;
                else if (max===g) h2=60*((b-r)/(max-min))+120;
                else h2=60*((r-g)/(max-min))+240;
                return h2;
            });
            const hueVar = variance(hues);
            pts.push(makeEval('color_hue_var_' + qn, hueVar > 5000 ? 60 : hueVar < 1000 ? 65 : 50));
        }
        const meanR = allR.reduce((a,b)=>a+b,0)/allR.length;
        const meanG = allG.reduce((a,b)=>a+b,0)/allG.length;
        const meanB = allB.reduce((a,b)=>a+b,0)/allB.length;
        const castRG = Math.abs(meanR - meanG);
        const castRB = Math.abs(meanR - meanB);
        const castGB = Math.abs(meanG - meanB);
        pts.push(makeEval('color_cast_rg', castRG > 30 ? 60 : 40));
        pts.push(makeEval('color_cast_rb', castRB > 30 ? 60 : 40));
        pts.push(makeEval('color_cast_gb', castGB > 30 ? 60 : 40));
        let bandingR = 0, bandingG = 0, bandingB = 0;
        for (let i = 0; i < data.length-4; i += 4) {
            if (Math.abs(data[i]-data[i+4]) < 2) bandingR++;
            if (Math.abs(data[i+1]-data[i+5]) < 2) bandingG++;
            if (Math.abs(data[i+2]-data[i+6]) < 2) bandingB++;
        }
        const total = data.length/4;
        pts.push(makeEval('color_banding_r', (bandingR/total)*100 > 40 ? 70 : 40));
        pts.push(makeEval('color_banding_g', (bandingG/total)*100 > 40 ? 70 : 40));
        pts.push(makeEval('color_banding_b', (bandingB/total)*100 > 40 ? 70 : 40));
        const colorTemp = (meanR + meanG + meanB) / 3;
        pts.push(makeEval('color_temp_deviation', Math.abs(colorTemp - 128) > 40 ? 55 : 40));
        const warm = meanR / Math.max(1, meanB);
        pts.push(makeEval('color_warmth', warm > 1.5 ? 60 : warm < 0.7 ? 60 : 40));
        return pts;
    }

    function evalEdges(data, w, h) {
        const pts = [];
        const midX = Math.floor(w/2), midY = Math.floor(h/2);
        const quads = [
            ['tl', 0, 0, midX, midY], ['tr', midX, 0, w, midY],
            ['bl', 0, midY, midX, h], ['br', midX, midY, w, h]
        ];
        for (const [qn, x1, y1, x2, y2] of quads) {
            const px = regionPixelData(data, w, x1, y1, x2, y2);
            let edgeSum = 0, edgeCount = 0;
            for (let y = y1+1; y < y2-1; y++) {
                for (let x = x1+1; x < x2-1; x++) {
                    const i = (y*w+x)*4;
                    const ix = ((y)*w+x+1)*4;
                    const iy = ((y+1)*w+x)*4;
                    const gx = Math.abs(data[i]-data[ix])+Math.abs(data[i+1]-data[ix+1])+Math.abs(data[i+2]-data[ix+2]);
                    const gy = Math.abs(data[i]-data[iy])+Math.abs(data[i+1]-data[iy+1])+Math.abs(data[i+2]-data[iy+2]);
                    const mag = (gx + gy) / 3;
                    if (mag > 25) { edgeSum += mag; edgeCount++; }
                }
            }
            const edgeDensity = edgeCount / ((x2-x1)*(y2-y1));
            pts.push(makeEval('edge_density_' + qn, edgeDensity > 0.25 ? 60 : edgeDensity > 0.1 ? 50 : 40));
            const avgEdge = edgeCount > 0 ? edgeSum / edgeCount : 0;
            pts.push(makeEval('edge_strength_' + qn, avgEdge > 80 ? 65 : avgEdge > 40 ? 50 : 45));
        }
        let totalEdgeMag = 0, totalEdgePx = 0;
        for (let y = 1; y < h-1; y++) {
            for (let x = 1; x < w-1; x++) {
                const i = (y*w+x)*4;
                const gx = Math.abs(data[i]-data[i+4])+Math.abs(data[i+1]-data[i+5])+Math.abs(data[i+2]-data[i+6]);
                const gy = Math.abs(data[i]-data[i+w*4])+Math.abs(data[i+1]-data[i+w*4+1])+Math.abs(data[i+2]-data[i+w*4+2]);
                totalEdgeMag += (gx+gy)/3;
                totalEdgePx++;
            }
        }
        const globalEdge = totalEdgeMag / totalEdgePx;
        pts.push(makeEval('edge_global_strength', globalEdge > 60 ? 60 : globalEdge > 30 ? 50 : 45));
        const edgeHist = new Array(10).fill(0);
        let totalE = 0;
        for (let y = 1; y < h-1; y+=2) {
            for (let x = 1; x < w-1; x+=2) {
                const i = (y*w+x)*4;
                const gx = Math.abs(data[i]-data[i+4])+Math.abs(data[i+1]-data[i+5])+Math.abs(data[i+2]-data[i+6]);
                const gy = Math.abs(data[i]-data[i+w*4])+Math.abs(data[i+1]-data[i+w*4+1])+Math.abs(data[i+2]-data[i+w*4+2]);
                const m = (gx+gy)/3;
                if (m > 15) { edgeHist[Math.min(9, Math.floor(m/20))]++; totalE++; }
            }
        }
        if (totalE > 0) {
            const skew = edgeHist.slice(5).reduce((a,b)=>a+b,0) / totalE;
            pts.push(makeEval('edge_high_freq_ratio', skew > 0.3 ? 60 : skew > 0.15 ? 50 : 40));
        }
        return pts;
    }

    function evalLuminance(data, w, h) {
        const pts = [];
        const lums = [];
        for (let i = 0; i < data.length; i += 4) {
            lums.push((data[i]+data[i+1]+data[i+2])/3);
        }
        const lm = lums.reduce((a,b)=>a+b,0)/lums.length;
        const lv = variance(lums);
        const lstd = Math.sqrt(lv);
        pts.push(makeEval('lum_mean', lm > 180 ? 60 : lm < 50 ? 60 : 45));
        pts.push(makeEval('lum_contrast', lstd > 70 ? 60 : lstd > 40 ? 50 : 40));
        const ent = computeEntropy(lums, 64);
        pts.push(makeEval('lum_entropy', ent < 4 ? 65 : ent > 6 ? 45 : 50));
        const tenth = Math.floor(lums.length/10);
        const sorted = lums.slice().sort((a,b)=>a-b);
        const dynRange = sorted[sorted.length-1] - sorted[0];
        pts.push(makeEval('lum_dynamic_range', dynRange > 230 ? 55 : dynRange > 180 ? 50 : 45));
        const lowLight = lums.filter(v => v < 30).length / lums.length;
        const highLight = lums.filter(v => v > 225).length / lums.length;
        pts.push(makeEval('lum_shadow_detail', lowLight > 0.15 ? 55 : 45));
        pts.push(makeEval('lum_highlight_detail', highLight > 0.1 ? 55 : 45));
        const midX = Math.floor(w/2), midY = Math.floor(h/2);
        const quads = [
            ['tl', 0, 0, midX, midY], ['tr', midX, 0, w, midY],
            ['bl', 0, midY, midX, h], ['br', midX, midY, w, h]
        ];
        for (const [qn, x1, y1, x2, y2] of quads) {
            const px = regionPixelData(data, w, x1, y1, x2, y2);
            const vals = px.map(p => (p.r+p.g+p.b)/3);
            const m = vals.reduce((a,b)=>a+b,0)/vals.length;
            const v = variance(vals);
            pts.push(makeEval('lum_region_mean_' + qn, Math.abs(m - lm) > 50 ? 55 : 40));
            pts.push(makeEval('lum_region_contrast_' + qn, Math.sqrt(v) > 50 ? 55 : 45));
        }
        let gradSum = 0, gradCount = 0;
        for (let y = 3; y < h-3; y += 2) {
            for (let x = 3; x < w-3; x += 2) {
                const i = (y*w+x)*4;
                const l = (data[i]+data[i+1]+data[i+2])/3;
                const il = ((y-1)*w+x)*4;
                const dl = (data[il]+data[il+1]+data[il+2])/3;
                gradSum += Math.abs(l - dl);
                gradCount++;
            }
        }
        const avgGrad = gradSum / gradCount;
        pts.push(makeEval('lum_gradient', avgGrad > 15 ? 60 : avgGrad > 8 ? 50 : 40));
        return pts;
    }

    function evalTexture(data, w, h) {
        const pts = [];
        const midX = Math.floor(w/2), midY = Math.floor(h/2);
        const quads = [
            ['tl', 0, 0, midX, midY], ['tr', midX, 0, w, midY],
            ['bl', 0, midY, midX, h], ['br', midX, midY, w, h]
        ];
        for (const [qn, x1, y1, x2, y2] of quads) {
            let lbpSum = 0, lbpCount = 0;
            for (let y = y1+1; y < y2-1; y += 2) {
                for (let x = x1+1; x < x2-1; x += 2) {
                    const i = (y*w+x)*4;
                    const c = (data[i]+data[i+1]+data[i+2])/3;
                    let lbp = 0;
                    const offsets = [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
                    for (let k = 0; k < 8; k++) {
                        const ny = y + offsets[k][1], nx = x + offsets[k][0];
                        const ni = (ny*w+nx)*4;
                        const nv = (data[ni]+data[ni+1]+data[ni+2])/3;
                        if (nv >= c) lbp |= (1 << k);
                    }
                    lbpSum += lbp;
                    lbpCount++;
                }
            }
            const avgLBP = lbpCount > 0 ? lbpSum / lbpCount : 128;
            pts.push(makeEval('texture_lbp_mean_' + qn, Math.abs(avgLBP - 128) > 40 ? 60 : 45));
            let localVarSum = 0, lvCount = 0;
            for (let y = y1+2; y < y2-2; y += 3) {
                for (let x = x1+2; x < x2-2; x += 3) {
                    const block = [];
                    for (let dy = -2; dy <= 2; dy++) {
                        for (let dx = -2; dx <= 2; dx++) {
                            const bi = ((y+dy)*w+x+dx)*4;
                            block.push((data[bi]+data[bi+1]+data[bi+2])/3);
                        }
                    }
                    localVarSum += variance(block);
                    lvCount++;
                }
            }
            const avgLV = lvCount > 0 ? localVarSum / lvCount : 0;
            pts.push(makeEval('texture_local_var_' + qn, avgLV < 100 ? 65 : avgLV > 500 ? 50 : 45));
        }
        return pts;
    }

    function evalSymmetry(data, w, h) {
        const pts = [];
        let hSym = 0, hCount = 0;
        for (let y = 0; y < h; y += 2) {
            for (let x = 0; x < Math.floor(w/2); x += 2) {
                const i = (y*w+x)*4;
                const mx = w - 1 - x;
                const j = (y*w+mx)*4;
                const diff = Math.abs(data[i]-data[j])+Math.abs(data[i+1]-data[j+1])+Math.abs(data[i+2]-data[j+2]);
                hSym += diff;
                hCount++;
            }
        }
        const avgHSym = hCount > 0 ? hSym / hCount : 0;
        pts.push(makeEval('symmetry_horizontal', avgHSym < 10 ? 65 : avgHSym > 40 ? 45 : 50));
        let vSym = 0, vCount = 0;
        for (let x = 0; x < w; x += 2) {
            for (let y = 0; y < Math.floor(h/2); y += 2) {
                const i = (y*w+x)*4;
                const my = h - 1 - y;
                const j = (my*w+x)*4;
                const diff = Math.abs(data[i]-data[j])+Math.abs(data[i+1]-data[j+1])+Math.abs(data[i+2]-data[j+2]);
                vSym += diff;
                vCount++;
            }
        }
        const avgVSym = vCount > 0 ? vSym / vCount : 0;
        pts.push(makeEval('symmetry_vertical', avgVSym < 12 ? 60 : avgVSym > 45 ? 45 : 50));
        let diagSym = 0, diagCount = 0;
        for (let y = 0; y < Math.min(h,w); y += 2) {
            for (let x = 0; x < y; x += 2) {
                const i = (y*w+x)*4;
                const j = (x*w+y)*4;
                const diff = Math.abs(data[i]-data[j])+Math.abs(data[i+1]-data[j+1])+Math.abs(data[i+2]-data[j+2]);
                diagSym += diff;
                diagCount++;
            }
        }
        const avgDiagSym = diagCount > 0 ? diagSym / diagCount : 0;
        pts.push(makeEval('symmetry_diagonal', avgDiagSym < 15 ? 60 : avgDiagSym > 50 ? 45 : 50));
        return pts;
    }

    function evalFrequency(data, w, h) {
        const pts = [];
        const midX = Math.floor(w/2), midY = Math.floor(h/2);
        const quads = [
            ['tl', 0, 0, midX, midY], ['tr', midX, 0, w, midY],
            ['bl', 0, midY, midX, h], ['br', midX, midY, w, h]
        ];
        for (const [qn, x1, y1, x2, y2] of quads) {
            let highFreq = 0, totalPix = 0;
            for (let y = y1+1; y < y2-1; y += 2) {
                for (let x = x1+1; x < x2-1; x += 2) {
                    const i = (y*w+x)*4;
                    const lum = (data[i]+data[i+1]+data[i+2])/3;
                    const il = ((y-1)*w+x)*4;
                    const ir = ((y)*w+x+1)*4;
                    const iu = ((y)*w+x-1)*4;
                    const id = ((y+1)*w+x)*4;
                    const l = (data[il]+data[il+1]+data[il+2])/3;
                    const r = (data[ir]+data[ir+1]+data[ir+2])/3;
                    const u = (data[iu]+data[iu+1]+data[iu+2])/3;
                    const d = (data[id]+data[id+1]+data[id+2])/3;
                    const hf = Math.abs(l - r) + Math.abs(u - d);
                    if (hf > 40) highFreq++;
                    totalPix++;
                }
            }
            const hfRatio = totalPix > 0 ? highFreq / totalPix : 0;
            pts.push(makeEval('freq_high_' + qn, hfRatio > 0.2 ? 65 : hfRatio > 0.1 ? 55 : 45));
        }
        let blurScore = 0, blurCount = 0;
        for (let y = 2; y < h-2; y += 3) {
            for (let x = 2; x < w-2; x += 3) {
                const i = (y*w+x)*4;
                const lum = (data[i]+data[i+1]+data[i+2])/3;
                const ni = ((y+1)*w+x)*4;
                const pi = ((y-1)*w+x)*4;
                const nl = (data[ni]+data[ni+1]+data[ni+2])/3;
                const pl = (data[pi]+data[pi+1]+data[pi+2])/3;
                blurScore += Math.abs(nl - pl);
                blurCount++;
            }
        }
        const avgBlur = blurCount > 0 ? blurScore / blurCount : 0;
        pts.push(makeEval('freq_blur', avgBlur < 3 ? 70 : avgBlur < 6 ? 55 : 40));
        let freqShift = 0, fsCount = 0;
        for (let i = 0; i < data.length-8; i += 8) {
            const d1 = Math.abs(data[i]-data[i+4]);
            const d2 = Math.abs(data[i+4]-data[i+8]);
            if (Math.abs(d1 - d2) > 20) freqShift++;
            fsCount++;
        }
        pts.push(makeEval('freq_variation', (freqShift/fsCount)*100 > 30 ? 60 : 40));
        return pts;
    }

    function evalMetadata(binaryString) {
        const pts = [];
        const exifChecks = [
            ['exif_make', 'Make'], ['exif_model', 'Model'],
            ['exif_dto', 'DateTimeOriginal'], ['exif_gps', 'GPS'],
            ['exif_software', 'Software'], ['exif_creator', 'Creator'],
            ['exif_copyright', 'Copyright'], ['exif_desc', 'ImageDescription'],
            ['exif_artist', 'Artist'], ['exif_host', 'HostComputer'],
            ['exif_xmp', 'XMP'], ['exif_iptc', 'IPTC'],
            ['exif_icc', 'ICC'], ['exif_gama', 'gAMA'],
        ];
        for (const [name, marker] of exifChecks) {
            pts.push(makeEval('meta_' + name, binaryString.includes(marker) ? 55 : 40));
        }
        const pngChunks = ['tEXt', 'zTXt', 'iTXt', 'IHDR', 'PLTE', 'IDAT', 'IEND', 'pHYs', 'sRGB', 'iCCP'];
        for (const ch of pngChunks) {
            pts.push(makeEval('meta_png_' + ch, binaryString.includes(ch) ? 50 : 40));
        }
        const jpegMarkers = ['JFIF', 'Exif', 'Adobe', 'DCT'];
        for (const m of jpegMarkers) {
            pts.push(makeEval('meta_jpeg_' + m, binaryString.includes(m) ? 50 : 40));
        }
        const aiHints = ['c2pa', 'C2PA', 'payload:', 'manifest', 'credentials'];
        for (const h of aiHints) {
            pts.push(makeEval('meta_c2pa_' + h.replace(/[^a-z0-9]/g,'_'), binaryString.includes(h) ? 90 : 40));
        }
        pts.push(makeEval('meta_exif_count', exifChecks.filter(([_,m])=>binaryString.includes(m)).length * 10));
        pts.push(makeEval('meta_total_size', binaryString.length < 10000 ? 50 : 40));
        return pts;
    }

    function evalStructure(u8array) {
        const pts = [];
        const size = u8array.length;
        if (size > 4) {
            const isPNG = u8array[0]===137 && u8array[1]===80 && u8array[2]===78 && u8array[3]===71;
            const isJPEG = u8array[0]===255 && u8array[1]===216;
            const isWebP = u8array[0]===82 && u8array[1]===73 && u8array[2]===70 && u8array[3]===70;
            const isGIF = u8array[0]===71 && u8array[1]===73 && u8array[2]===70;
            const isBMP = u8array[0]===66 && u8array[1]===77;
            const isTIFF = (u8array[0]===73 && u8array[1]===73) || (u8array[0]===77 && u8array[1]===77);
            pts.push(makeEval('struct_type_png', isPNG ? 45 : 40));
            pts.push(makeEval('struct_type_jpeg', isJPEG ? 45 : 40));
            pts.push(makeEval('struct_type_webp', isWebP ? 45 : 40));
            pts.push(makeEval('struct_type_gif', isGIF ? 50 : 40));
            pts.push(makeEval('struct_type_bmp', isBMP ? 50 : 40));
            pts.push(makeEval('struct_type_tiff', isTIFF ? 55 : 40));
            const hasAlpha = isPNG && (u8array[24] === 6 || u8array[24] === 4);
            pts.push(makeEval('struct_alpha', hasAlpha ? 50 : 40));
            const colorType = isPNG ? u8array[24] : -1;
            pts.push(makeEval('struct_color_type', colorType === 2 ? 45 : colorType === 6 ? 50 : 40));
            const bitDepth = isPNG ? u8array[23] : 8;
            pts.push(makeEval('struct_bit_depth', bitDepth > 8 ? 55 : 40));
        }
        const fileRatio = size / 1000000;
        pts.push(makeEval('struct_size_mb', fileRatio > 10 ? 55 : fileRatio > 3 ? 50 : 45));
        let entropySum = 0;
        const byteHist = new Array(256).fill(0);
        for (let i = 0; i < Math.min(u8array.length, 50000); i++) byteHist[u8array[i]]++;
        for (const h of byteHist) {
            if (h > 0) { const p = h / Math.min(u8array.length, 50000); entropySum -= p * Math.log2(p); }
        }
        pts.push(makeEval('struct_byte_entropy', entropySum > 7.5 ? 55 : entropySum > 6 ? 50 : 45));
        let consecutive = 0;
        for (let i = 0; i < Math.min(u8array.length, 10000)-1; i++) {
            if (u8array[i] === u8array[i+1]) consecutive++;
        }
        pts.push(makeEval('struct_repeat_bytes', (consecutive/10000)*100 > 5 ? 55 : 40));
        return pts;
    }

        const knownWatermarks = [
        { name: 'Google Gemini / Gemini Nano', corner: 'bottom-right', colors: [[66,133,244],[234,67,53],[251,188,4],[52,168,83]], desc: 'Google colors watermark' },
        { name: 'DALL-E 3', corner: 'bottom-right', colors: [[0,255,255],[255,0,255],[255,255,0],[0,128,255]], desc: 'DALL-E rainbow bar' },
        { name: 'Adobe Firefly', corner: 'bottom-right', colors: [[0,20,255],[255,255,255]], desc: 'Adobe Firefly logo' },
        { name: 'Craiyon', corner: 'bottom-right', colors: [[255,100,100],[200,50,200]], desc: 'Craiyon watermark' },
        { name: 'Stability AI', corner: 'bottom-right', colors: [[0,0,0],[0,0,0]], desc: 'Stability AI logo' },
        { name: 'Midjourney', corner: 'bottom-left', colors: [[128,128,128],[200,200,200]], desc: 'Midjourney subtle watermark' },
        { name: 'Leonardo.ai', corner: 'bottom-right', colors: [[30,144,255],[0,100,200]], desc: 'Leonardo logo' },
        { name: 'Meta AI', corner: 'bottom-right', colors: [[0,0,0],[200,200,255]], desc: 'Meta AI watermark' },
        { name: 'Canva', corner: 'bottom-right', colors: [[0,200,255],[0,100,200]], desc: 'Canva watermark' },
        { name: 'Picsart', corner: 'bottom-right', colors: [[255,100,200],[200,50,150]], desc: 'Picsart logo' },
        { name: 'Clipdrop', corner: 'bottom-right', colors: [[100,100,255],[50,50,200]], desc: 'Clipdrop by Stability' },
        { name: 'Bing / Microsoft Designer', corner: 'bottom-right', colors: [[0,120,215],[255,185,0]], desc: 'Microsoft corner watermark' },
    ];

    async function detectCornerWatermarks(file) {
        return new Promise((resolve) => {
            try {
                const img = new Image();
                img.onload = function() {
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        const cSize = Math.max(30, Math.min(150, Math.floor(Math.min(img.width, img.height) * 0.1)));
                        const corners = {
                            'top-left': [0, 0],
                            'top-right': [img.width - cSize, 0],
                            'bottom-left': [0, img.height - cSize],
                            'bottom-right': [img.width - cSize, img.height - cSize]
                        };
                        let results = [];
                        for (const [cName, [cx, cy]] of Object.entries(corners)) {
                            const imageData = ctx.getImageData(cx, cy, cSize, cSize);
                            const pixels = imageData.data;
                            const count = pixels.length / 4;
                            let totalR = 0, totalG = 0, totalB = 0;
                            let varR = 0, varG = 0, varB = 0;
                            for (let i = 0; i < pixels.length; i += 4) {
                                totalR += pixels[i]; totalG += pixels[i+1]; totalB += pixels[i+2];
                            }
                            const avgR = totalR/count, avgG = totalG/count, avgB = totalB/count;
                            for (let i = 0; i < pixels.length; i += 4) {
                                varR += (pixels[i]-avgR)**2; varG += (pixels[i+1]-avgG)**2; varB += (pixels[i+2]-avgB)**2;
                            }
                            const variance = (varR+varG+varB)/(count*3);
                            let edgeCount = 0, highSatCount = 0, brightEdgeCount = 0;
                            for (let y = 1; y < cSize - 1; y++) {
                                for (let x = 1; x < cSize - 1; x++) {
                                    const idx = (y*cSize+x)*4;
                                    const r=pixels[idx],g=pixels[idx+1],b=pixels[idx+2];
                                    const gx = Math.abs(pixels[idx]-pixels[idx+4])+Math.abs(pixels[idx+1]-pixels[idx+5])+Math.abs(pixels[idx+2]-pixels[idx+6]);
                                    const gy = Math.abs(pixels[idx]-pixels[idx+cSize*4])+Math.abs(pixels[idx+1]-pixels[idx+cSize*4+1])+Math.abs(pixels[idx+2]-pixels[idx+cSize*4+2]);
                                    const mag = (gx+gy)/3;
                                    if (mag > 30) edgeCount++;
                                    const max=Math.max(r,g,b)/255,min=Math.min(r,g,b)/255;
                                    const sat = max===0?0:(max-min)/max;
                                    if (sat > 0.5 && mag > 20) { highSatCount++; brightEdgeCount += mag; }
                                }
                            }
                            const edgeRatio = edgeCount/(cSize*cSize);
                            const satEdgeRatio = highSatCount/(cSize*cSize);
                            if (edgeRatio < 0.02 && variance < 200) continue;
                            let bestMatch = null, bestScore = 0;
                            for (const wm of knownWatermarks) {
                                if (wm.corner !== cName) continue;
                                let colorScore = 0, colorMatches = 0;
                                for (const [cr,cg,cb] of wm.colors) {
                                    for (let i = 0; i < pixels.length; i += 8) {
                                        const dr = Math.abs(pixels[i]-cr);
                                        const dg = Math.abs(pixels[i+1]-cg);
                                        const db = Math.abs(pixels[i+2]-cb);
                                        if (dr < 40 && dg < 40 && db < 40) { colorMatches++; break; }
                                    }
                                }
                                if (colorMatches > 0) {
                                    colorScore = Math.min(60, colorMatches * 15);
                                    if (edgeRatio > 0.05) colorScore += 15;
                                    if (satEdgeRatio > 0.02) colorScore += 15;
                                }
                                if (colorScore > bestScore) { bestScore = colorScore; bestMatch = wm.name; }
                            }
                            if (bestMatch && bestScore > 20) {
                                results.push({ corner: cName, name: bestMatch, confidence: Math.min(bestScore+20, 85) });
                            }
                            if (variance > 3000 && edgeRatio > 0.12 && satEdgeRatio > 0.03) {
                                results.push({ corner: cName, name: 'Unknown AI watermark', confidence: Math.min(60 + Math.round(variance/200), 80) });
                            }
                        }
                        resolve(results);
                    } catch (e) { resolve([]); }
                };
                img.onerror = function() { resolve([]); };
                img.src = URL.createObjectURL(file);
            } catch (e) { resolve([]); }
        });
    }
    
    function evalFullGrid(data, w, h) {
        const pts = [];
        const rows = 5, cols = 4;
        const cellW = Math.floor(w/cols), cellH = Math.floor(h/rows);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x1 = c*cellW, y1 = r*cellH, x2 = Math.min(w, (c+1)*cellW), y2 = Math.min(h, (r+1)*cellH);
                const tag = r + '_' + c;
                const px = regionPixelData(data, w, x1, y1, x2, y2);
                if (px.length === 0) continue;
                const rs = px.map(p => p.r), gs = px.map(p => p.g), bs = px.map(p => p.b);
                const lums = px.map(p => (p.r+p.g+p.b)/3);
                const rm = rs.reduce((a,b)=>a+b,0)/rs.length;
                const gm = gs.reduce((a,b)=>a+b,0)/gs.length;
                const bm = bs.reduce((a,b)=>a+b,0)/bs.length;
                const lm = lums.reduce((a,b)=>a+b,0)/lums.length;
                const rv = variance(rs), gv = variance(gs), bv = variance(bs);
                const lv = variance(lums);
                pts.push(makeEval('grid_noise_r_' + tag, Math.sqrt(rv) < 10 ? 70 : Math.sqrt(rv) > 40 ? 55 : 45));
                pts.push(makeEval('grid_noise_g_' + tag, Math.sqrt(gv) < 10 ? 70 : Math.sqrt(gv) > 40 ? 55 : 45));
                pts.push(makeEval('grid_noise_b_' + tag, Math.sqrt(bv) < 10 ? 70 : Math.sqrt(bv) > 40 ? 55 : 45));
                pts.push(makeEval('grid_lum_' + tag, lm > 200 ? 60 : lm < 40 ? 60 : 45));
                pts.push(makeEval('grid_contrast_' + tag, Math.sqrt(lv) > 60 ? 60 : Math.sqrt(lv) > 30 ? 50 : 40));
                const sats = px.map(p => { const mx=Math.max(p.r,p.g,p.b)/255, mn=Math.min(p.r,p.g,p.b)/255; return mx===0?0:(mx-mn)/mx; });
                const sm = sats.reduce((a,b)=>a+b,0)/sats.length;
                pts.push(makeEval('grid_sat_' + tag, sm > 0.5 ? 65 : sm > 0.3 ? 50 : 40));
                const satVar = variance(sats);
                pts.push(makeEval('grid_sat_var_' + tag, satVar < 0.015 ? 60 : 45));
                pts.push(makeEval('grid_brightness_var_' + tag, Math.sqrt(lv) < 15 ? 60 : 45));
                const corrRG = Math.abs(rm-gm); const corrRB = Math.abs(rm-bm); const corrGB = Math.abs(gm-bm);
                pts.push(makeEval('grid_chan_corr_rg_' + tag, corrRG < 8 ? 65 : 45));
                pts.push(makeEval('grid_chan_corr_rb_' + tag, corrRB < 8 ? 65 : 45));
                pts.push(makeEval('grid_chan_corr_gb_' + tag, corrGB < 8 ? 65 : 45));
                let edges = 0;
                for (let y = y1+1; y < y2-1; y+=2) {
                    for (let x = x1+1; x < x2-1; x+=2) {
                        const i = (y*w+x)*4;
                        const gx = Math.abs(data[i]-data[i+4])+Math.abs(data[i+1]-data[i+5])+Math.abs(data[i+2]-data[i+6]);
                        const gy = Math.abs(data[i]-data[i+w*4])+Math.abs(data[i+1]-data[i+w*4+1])+Math.abs(data[i+2]-data[i+w*4+2]);
                        if((gx+gy)/3>25) edges++;
                    }
                }
                const ed = edges / ((x2-x1)*(y2-y1)/4);
                pts.push(makeEval('grid_edge_density_' + tag, ed > 0.3 ? 65 : ed > 0.12 ? 55 : 40));
                let lbpSum = 0, lbpN = 0;
                for (let y = y1+1; y < y2-1; y+=3) {
                    for (let x = x1+1; x < x2-1; x+=3) {
                        const i = (y*w+x)*4; const c = (data[i]+data[i+1]+data[i+2])/3;
                        let lbp = 0; const offs = [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
                        for (let k=0;k<8;k++) {
                            const ni = ((y+offs[k][1])*w+x+offs[k][0])*4;
                            if ((data[ni]+data[ni+1]+data[ni+2])/3 >= c) lbp |= (1<<k);
                        }
                        lbpSum += lbp; lbpN++;
                    }
                }
                const avgLBP = lbpN>0 ? lbpSum/lbpN : 128;
                pts.push(makeEval('grid_texture_lbp_' + tag, Math.abs(avgLBP-128)>45 ? 60 : 45));
                let hueVar = 0;
                if (px.length > 0) {
                    const hues = px.map(p => {
                        const r=p.r/255,g=p.g/255,b=p.b/255;
                        const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
                        if (mx===mn) return 0;
                        let h; if (mx===r) h=60*((g-b)/(mx-mn))+360; else if (mx===g) h=60*((b-r)/(mx-mn))+120; else h=60*((r-g)/(mx-mn))+240;
                        return h%360;
                    });
                    hueVar = variance(hues);
                }
                pts.push(makeEval('grid_hue_var_' + tag, hueVar > 6000 ? 60 : hueVar < 800 ? 65 : 50));
            }
        }
        // Global additional checks
        const allLums = [];
        for (let i=0;i<data.length;i+=4) allLums.push((data[i]+data[i+1]+data[i+2])/3);
        const fullEnt = computeEntropy(allLums, 128);
        pts.push(makeEval('full_entropy', fullEnt < 3.5 ? 75 : fullEnt < 4.5 ? 65 : fullEnt > 6.5 ? 40 : 50));
        pts.push(makeEval('full_lum_range', (Math.max(...allLums)-Math.min(...allLums)) > 240 ? 55 : 45));
        const darkPct = allLums.filter(l=>l<20).length/allLums.length;
        const brightPct = allLums.filter(l=>l>235).length/allLums.length;
        pts.push(makeEval('full_clip_shadows', darkPct > 0.2 ? 60 : 40));
        pts.push(makeEval('full_clip_highlights', brightPct > 0.15 ? 60 : 40));
        const allR2=[],allG2=[],allB2=[];
        for (let i=0;i<data.length;i+=4){allR2.push(data[i]);allG2.push(data[i+1]);allB2.push(data[i+2]);}
        pts.push(makeEval('full_channel_entropy_r', computeEntropy(allR2,64)<4?65:45));
        pts.push(makeEval('full_channel_entropy_g', computeEntropy(allG2,64)<4?65:45));
        pts.push(makeEval('full_channel_entropy_b', computeEntropy(allB2,64)<4?65:45));
        const meanAll = allLums.reduce((a,b)=>a+b,0)/allLums.length;
        pts.push(makeEval('full_mean_brightness', Math.abs(meanAll-128)>50?55:45));
        pts.push(makeEval('full_gamma_estimate', meanAll<60||meanAll>200?60:45));
        let edgePixels = 0;
        for (let y=1;y<h-1;y+=2) for (let x=1;x<w-1;x+=2) {
            const i=(y*w+x)*4;
            if(Math.abs(data[i]-data[i+4])+Math.abs(data[i+1]-data[i+5])+Math.abs(data[i+2]-data[i+6])>50) edgePixels++;
        }
        pts.push(makeEval('full_edge_count', (edgePixels/((w*h)/4))*100>30?60:40));
        let flatCount=0;
        for (let y=0;y<h-1;y+=2) for (let x=0;x<w-1;x+=2) {
            const i=(y*w+x)*4; const j=((y+1)*w+x)*4;
            if(Math.abs(data[i]-data[j])<3&&Math.abs(data[i+1]-data[j+1])<3&&Math.abs(data[i+2]-data[j+2])<3) flatCount++;
        }
        pts.push(makeEval('full_flat_areas', (flatCount/((w*h)/4))*100>40?65:40));
        pts.push(makeEval('full_total_points', Math.min(100, data.length/100000)));
        return pts;
    }
window.authenticateImage = async function(file) {
        console.log("ImgAuth is running");
        if (!file) {
            return "Error: No image file provided for authentication.";
        }

        const u8 = await new Promise((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(new Uint8Array(r.result));
            r.onerror = () => resolve(null);
            r.readAsArrayBuffer(file);
        });
        if (!u8) return "Error: Failed to read image file.";

        let binaryString = "";
        const scanLimit = Math.min(u8.length, 100000);
        for (let i = 0; i < scanLimit; i++) binaryString += String.fromCharCode(u8[i]);

        const allEvalPoints = [];

        // Run metadata & structure eval (no image needed)
        const metaPts = evalMetadata(binaryString);
        const structPts = evalStructure(u8);
        allEvalPoints.push(...metaPts, ...structPts);

        // Run signature database scan
        let sigDetected = [];
        for (const sig of aiSignatures) {
            let foundCodes = [];
            for (const code of sig.codes) {
                if (binaryString.includes(code)) foundCodes.push(code);
            }
            if (foundCodes.length > 0) {
                if (!sigDetected.find(d => d.name === sig.name)) {
                    sigDetected.push({ name: sig.name, codes: foundCodes, count: foundCodes.length });
                }
                for (let i = 0; i < foundCodes.length; i++) {
                    allEvalPoints.push(makeEval('sig_match_' + sig.name.replace(/[^a-z0-9]/gi,'_') + '_' + i, 85));
                }
            }
        }

        // EXIF fallback
        if (sigDetected.length === 0) {
            for (const marker of exifSoftwareMarkers) {
                if (binaryString.includes(marker)) {
                    allEvalPoints.push(makeEval('exif_fallback_' + marker.replace(/[^a-z0-9]/gi,'_'), 60));
                }
            }
        }

        // Corner watermarks
        const cornerResults = await detectCornerWatermarks(file);
        for (const cr of cornerResults) {
            allEvalPoints.push(makeEval('corner_watermark_' + cr.corner, cr.confidence));
        }

        // Pixel-based eval (load image to canvas)
        await new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    let dw = img.width, dh = img.height;
                    const maxDim = 400;
                    if (dw > maxDim || dh > maxDim) {
                        const r = Math.min(maxDim/dw, maxDim/dh);
                        dw = Math.floor(dw*r); dh = Math.floor(dh*r);
                    }
                    canvas.width = dw; canvas.height = dh;
                    ctx.drawImage(img, 0, 0, dw, dh);
                    const imageData = ctx.getImageData(0, 0, dw, dh).data;
                    allEvalPoints.push(...evalNoise(imageData, dw, dh));
                    allEvalPoints.push(...evalColor(imageData, dw, dh));
                    allEvalPoints.push(...evalEdges(imageData, dw, dh));
                    allEvalPoints.push(...evalLuminance(imageData, dw, dh));
                    allEvalPoints.push(...evalTexture(imageData, dw, dh));
                    allEvalPoints.push(...evalSymmetry(imageData, dw, dh));
                    allEvalPoints.push(...evalFrequency(imageData, dw, dh));
                    allEvalPoints.push(...evalFullGrid(imageData, dw, dh));
                } catch (e) { console.warn("Pixel eval error:", e); }
                resolve();
            };
            img.onerror = function() { resolve(); };
            img.src = URL.createObjectURL(file);
        });

        // Calculate final score
        const weights = allEvalPoints.map(p => p.weight);
        const totalWeight = weights.reduce((a,b) => a+b, 0);
        let weightedScore = 0;
        for (const p of allEvalPoints) weightedScore += p.score * p.weight;
        const avgScore = totalWeight > 0 ? weightedScore / totalWeight : 40;
        const totalPoints = allEvalPoints.length;

        // Determine primary generator
        let primaryGen = "";
        for (const sig of aiSignatures) {
            let foundCodes = [];
            for (const code of sig.codes) {
                if (binaryString.includes(code)) foundCodes.push(code);
            }
            if (foundCodes.length > 0) {
                primaryGen = sig.name;
                break;
            }
        }
        if (!primaryGen && cornerResults.length > 0) {
            primaryGen = "Unknown AI (watermark detected)";
        }
        if (!primaryGen) {
            // Check if any eval points strongly suggest AI
            const strongAIPts = allEvalPoints.filter(p => p.score > 70);
            if (strongAIPts.length > 50) {
                primaryGen = "Likely AI-generated";
            }
        }

        const finalConfidence = Math.round(avgScore);
                const hasSigMatch = sigDetected.length > 0;
        const hasCornerMatch = cornerResults.length > 0 && cornerResults.some(c => c.confidence > 50);
        const strongScore = finalConfidence >= 75;
        const moderateScore = finalConfidence >= 60;
        const isAI = hasSigMatch || (hasCornerMatch && moderateScore) || (strongScore && hasCornerMatch) || (strongScore && hasSigMatch);
        const finalGen = primaryGen || (hasCornerMatch ? cornerResults[0].name : '');
// Build result
        let resultText = "";
        if (isAI) {
            resultText = "Image detected as AI-generated.\n";
            if (finalGen) {
                resultText += "Detected Signature: " + finalGen + ".\n";
            }
            resultText += "Confidence: " + Math.min(finalConfidence + 5, 95) + "%\n";
            resultText += "Evaluation points: " + totalPoints;
        } else {
            let note = "";
            if (u8.length < 10000) note = " (small file size)";
            resultText = "Image not detected as AI-generated.\n";
            resultText += "Analysis: No AI generator signatures found in database of " + aiSignatures.length + " generators" + note + ".\n";
            resultText += "Evaluation points analyzed: " + totalPoints + ".\n";
            resultText += "Confidence: " + Math.min(finalConfidence, 30) + "%";
        }
        return resultText;
    };
})();
