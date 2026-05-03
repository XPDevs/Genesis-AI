/**
 * summarise.js
 * Developed by James Turner (XPDevs)
 * Elite Intelligence Engine for Genesis-AI.
 */

window.summariseConversation = function(data, maxSentences = 5) {
    if (!data || data.trim().length < 50) return "Insufficient data density for intelligence extraction.";

    // 1. Structural Analysis
    const sentences = data.match(/[^.!?]+[.!?]+/g) || [data];
    if (sentences.length <= 2) return `${data}`;

    // 2. Advanced Keyword Extraction (TF-Lite Logic)
    const stopWords = new Set(["the", "and", "this", "that", "with", "from", "they", "would", "could", "should", "there"]);
    const wordStats = {};
    const words = data.toLowerCase().match(/\w+/g) || [];

    words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
            wordStats[word] = (wordStats[word] || 0) + 1;
        }
    });

    const themes = Object.entries(wordStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

    // 3. Multi-Dimensional Scoring Engine
    const scoredSentences = sentences.map((text, i) => {
        let score = 0;
        const cleanText = text.toLowerCase();
        
        themes.forEach(theme => {
            if (cleanText.includes(theme)) score += 5;
        });

        const markers = ["decided", "founded", "created", "built", "launch", "important", "focus", "result"];
        markers.forEach(m => {
            if (cleanText.includes(m)) score += 3;
        });

        if (/\d+/.test(text)) score += 2; 
        if (/[A-Z]{2,}/.test(text)) score += 2; 

        if (i === 0) score += 10; 
        if (i === sentences.length - 1) score += 7; 

        return { text: text.trim(), score, index: i };
    });

    // 4. Intelligence Filtering
    const avgScore = scoredSentences.reduce((a, b) => a + b.score, 0) / scoredSentences.length;
    let candidates = scoredSentences.filter(s => s.score >= avgScore);

    // 5. Narrative Reconstruction
    const finalSummary = candidates
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSentences)
        .sort((a, b) => a.index - b.index)
        .map(s => s.text)
        .join(" ");

    // Modified to return a direct string instead of an object
    return `${finalSummary}`;
};

console.log("Summary Module Loaded");
