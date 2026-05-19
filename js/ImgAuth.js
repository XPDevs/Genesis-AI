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
        { name: "Latent Consistency Model", codes: ["Latent Consistency Model"] },
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
        { name: "3D Gaussian Splatting", codes: ["Gaussian Splatting", "3DGS"] },
        { name: "SuGaR", codes: ["SuGaR"] },
        { name: "DIGITALFASHION", codes: ["DIGITALFASHION"] },
        { name: "CLO 3D", codes: ["CLO 3D"] },
        { name: "Browzwear", codes: ["Browzwear"] },
        { name: "Style3D", codes: ["Style3D"] },
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
    ];

    const exifSoftwareMarkers = ["Software", "EXIF", "sK1", "Adobe Photoshop", "Adobe_", "photoshop_"];

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

                        const cSize = Math.max(20, Math.min(120, Math.floor(Math.min(img.width, img.height) * 0.08)));
                        const corners = {
                            'top-left': [0, 0],
                            'top-right': [img.width - cSize, 0],
                            'bottom-left': [0, img.height - cSize],
                            'bottom-right': [img.width - cSize, img.height - cSize]
                        };

                        let results = [];

                        for (const [name, [cx, cy]] of Object.entries(corners)) {
                            const data = ctx.getImageData(cx, cy, cSize, cSize);
                            const pixels = data.data;
                            let totalR = 0, totalG = 0, totalB = 0;
                            let varR = 0, varG = 0, varB = 0;
                            const count = pixels.length / 4;

                            for (let i = 0; i < pixels.length; i += 4) {
                                totalR += pixels[i];
                                totalG += pixels[i + 1];
                                totalB += pixels[i + 2];
                            }
                            const avgR = totalR / count;
                            const avgG = totalG / count;
                            const avgB = totalB / count;

                            for (let i = 0; i < pixels.length; i += 4) {
                                varR += (pixels[i] - avgR) ** 2;
                                varG += (pixels[i + 1] - avgG) ** 2;
                                varB += (pixels[i + 2] - avgB) ** 2;
                            }
                            const variance = (varR + varG + varB) / (count * 3);

                            let edgeCount = 0;
                            for (let y = 1; y < cSize - 1; y++) {
                                for (let x = 1; x < cSize - 1; x++) {
                                    const idx = (y * cSize + x) * 4;
                                    const gx = Math.abs(pixels[idx] - pixels[idx + 4]) +
                                               Math.abs(pixels[idx + 1] - pixels[idx + 5]) +
                                               Math.abs(pixels[idx + 2] - pixels[idx + 6]);
                                    const gy = Math.abs(pixels[idx] - pixels[idx + cSize * 4]) +
                                               Math.abs(pixels[idx + 1] - pixels[idx + cSize * 4 + 1]) +
                                               Math.abs(pixels[idx + 2] - pixels[idx + cSize * 4 + 2]);
                                    if ((gx + gy) / 3 > 30) edgeCount++;
                                }
                            }
                            const edgeRatio = edgeCount / (cSize * cSize);

                            const hasColor = variance > 800;
                            const hasEdges = edgeRatio > 0.08;
                            const isDarkCorner = avgR < 50 && avgG < 50 && avgB < 50;
                            const isWhiteCorner = avgR > 200 && avgG > 200 && avgB > 200;

                            let watermarkConfidence = 0;
                            let matchHints = [];

                            if (hasColor && hasEdges) {
                                watermarkConfidence += 40;
                                matchHints.push("colored+textured");
                            } else if (hasColor) {
                                watermarkConfidence += 20;
                                matchHints.push("colored");
                            } else if (hasEdges && !isDarkCorner && !isWhiteCorner) {
                                watermarkConfidence += 15;
                                matchHints.push("textured");
                            }

                            if (name === 'bottom-right' && hasColor && avgR > 150 && avgB > 150 && avgG < 100) {
                                watermarkConfidence += 30;
                                matchHints.push("dalle-style");
                            }
                            if (name === 'bottom-left' && hasEdges && avgR > 100) {
                                watermarkConfidence += 10;
                                matchHints.push("possible-watermark");
                            }
                            if (name === 'top-right' && hasColor) {
                                watermarkConfidence += 5;
                            }
                            if (name === 'top-left' && hasColor) {
                                watermarkConfidence += 5;
                            }

                            if (watermarkConfidence > 0) {
                                results.push({
                                    corner: name,
                                    confidence: Math.min(watermarkConfidence, 85),
                                    hints: matchHints,
                                    avgColor: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) },
                                    variance: Math.round(variance),
                                    edgeRatio: Math.round(edgeRatio * 100) / 100
                                });
                            }
                        }
                        resolve(results);
                    } catch (e) {
                        resolve([]);
                    }
                };
                img.onerror = function() {
                    resolve([]);
                };
                const url = URL.createObjectURL(file);
                img.src = url;
            } catch (e) {
                resolve([]);
            }
        });
    }

    window.authenticateImage = async function(file) {
        console.log("ImgAuth is running");
        if (!file) {
            return "Error: No image file provided for authentication.";
        }

        const cornerResults = await detectCornerWatermarks(file);

        return new Promise((resolve) => {
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

                if (cornerResults.length > 0) {
                    const topCorner = cornerResults.reduce((a, b) => a.confidence > b.confidence ? a : b, cornerResults[0]);
                    detected.push({
                        name: `Watermark in ${topCorner.corner}`,
                        codes: [`corner:${topCorner.corner}`],
                        count: 1
                    });
                    confidence += topCorner.confidence;

                    const avg = topCorner.avgColor;
                    if (avg.r > 150 && avg.g > 100 && avg.b < 100 && topCorner.corner === 'bottom-right') {
                        detected.push({ name: "DALL-E 3 / C2PA (via corner watermark)", codes: ["corner:dalle"], count: 1 });
                        confidence += 15;
                    }
                    if (avg.r < 80 && avg.g < 80 && avg.b < 80 && topCorner.edges > 0.12) {
                        detected.push({ name: "Stable Diffusion (via corner artifact)", codes: ["corner:sd"], count: 1 });
                        confidence += 10;
                    }
                    if (avg.b > 180 && avg.r < 100 && avg.g < 100) {
                        detected.push({ name: "Adobe Firefly (via corner logo)", codes: ["corner:firefly"], count: 1 });
                        confidence += 10;
                    }
                }

                if (confidence < 20) {
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
                }

                if (confidence < 10) {
                    for (const marker of exifSoftwareMarkers) {
                        if (binaryString.includes(marker)) {
                            confidence += 5;
                            detected.push({ name: "EXIF: " + marker, codes: [marker], count: 1 });
                        }
                    }
                }

                if (totalSize < 5000) confidence -= 5;

                if (detected.length > 0) {
                    const primary = detected.reduce((a, b) => a.count > b.count ? a : b, detected[0]);
                    const allNames = detected.map(d => d.name).join(", ");
                    let resultText = "Image detected as AI-generated.\n";
                    if (detected.length === 1) {
                        resultText += "Detected Signature: Matching known AI generation software \"" + primary.name + "\".\n";
                    } else {
                        resultText += "Detected Signatures: " + allNames + ".\n";
                        resultText += "Primary Match: " + primary.name + ".\n";
                    }
                    if (cornerResults.length > 0) {
                        resultText += "Watermark Analysis: Visual watermark/logo detected in image corners.\n";
                    }
                    resultText += "Confidence: " + Math.min(Math.round(confidence + 50), 99) + "%";
                    resolve(resultText);
                } else {
                    let note = "";
                    if (totalSize < 10000) note = " (small file size)";
                    resolve("Image not detected as AI-generated.\nAnalysis: No AI generator signatures found in database of " + aiSignatures.length + " generators" + note + ".\nResult: Likely captured/photographed or generated by an unknown/untracked AI model.");
                }
            };
            reader.onerror = function() {
                resolve("Error: Failed to read image file.");
            };
            reader.readAsArrayBuffer(file);
        });
    };
})();
