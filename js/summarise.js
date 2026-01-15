/**
 * summarise.js
 * Developed by James Turner (XPDevs)
 * A logic-based summarisation engine for Genesis-AI.
 */

window.summariseConversation = function(data) {
    if (!data || data.length < 10) {
        return "The data provided is too short to generate a meaningful summary. Please provide more context.";
    }

    // 1. Clean and split into sentences
    const sentences = data.match(/[^.!?]+[.!?]+/g) || [data];
    if (sentences.length <= 2) return `Summary: ${data}`;

    // 2. Build a frequency map of "Smart Words" (ignoring common stop words)
    const stopWords = new Set(["the", "and", "a", "of", "to", "is", "in", "it", "that", "was", "for", "on", "are", "with", "as", "be", "at", "this", "by"]);
    const wordFreq = {};
    const words = data.toLowerCase().match(/\w+/g);

    words.forEach(word => {
        if (!stopWords.has(word) && word.length > 3) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    // 3. Score sentences based on word importance
    const sentenceScores = sentences.map(sentence => {
        let score = 0;
        const sentenceWords = sentence.toLowerCase().match(/\w+/g) || [];
        
        sentenceWords.forEach(word => {
            if (wordFreq[word]) {
                score += wordFreq[word];
            }
        });

        // Boost the first sentence (usually contains the main topic)
        return { text: sentence.trim(), score: score };
    });

    // Boost the first sentence slightly as it often contains the thesis
    sentenceScores[0].score *= 1.5;

    // 4. Sort and pick the top performers
    // We aim for approximately 30% of the original length
    const summaryCount = Math.max(1, Math.ceil(sentences.length * 0.3));
    const topSentences = [...sentenceScores]
        .sort((a, b) => b.score - a.score)
        .slice(0, summaryCount);

    // 5. Re-order the top sentences to maintain chronological flow
    const finalSummary = sentenceScores
        .filter(s => topSentences.includes(s))
        .map(s => s.text)
        .join(" ");

    return `(Genesis-AI Intelligence Summary): ${finalSummary}`;
};

console.log("Genesis-AI: Smart Summary Module Loaded.");
