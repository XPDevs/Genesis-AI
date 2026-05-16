window.summariseConversation = function(data, maxPoints = 5) {
    if (!data || data.trim().length < 50) return data;

    const sentences = data.match(/[^.!?]+[.!?]+/g) || [data];
    if (sentences.length <= 2) return data;

    const stopWords = new Set(["the", "and", "this", "that", "with", "from", "they", "would", "could", "should", "there", "what", "which", "their", "have", "been", "were", "when", "where", "also"]);
    const words = data.toLowerCase().match(/\w+/g) || [];
    const wordStats = {};
    words.forEach(w => { if (w.length > 3 && !stopWords.has(w)) wordStats[w] = (wordStats[w] || 0) + 1; });

    const keyTerms = Object.entries(wordStats).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]);

    const importanceMarkers = ["is", "was", "are", "were", "known", "famous", "important", "created", "founded", "built", "defined", "refers", "consists", "comprises", "located", "developed", "discovered", "established", "introduced", "invented", "produced"];
    const numericalPattern = /\d+/;

    const scored = sentences.map((text, i) => {
        let score = 0;
        const c = text.toLowerCase();
        keyTerms.forEach(t => { if (c.includes(t)) score += 4; });
        importanceMarkers.forEach(m => { if (c.includes(m)) score += 3; });
        if (numericalPattern.test(text)) score += 2;
        if (text.length > 40) score += 1;
        if (text.length > 120) score -= 1;
        if (i === 0) score += 6;
        if (i === sentences.length - 1) score += 3;
        return { text: text.trim(), score, index: i };
    });

    const avg = scored.reduce((a, b) => a + b.score, 0) / scored.length;
    const candidates = scored.filter(s => s.score >= avg)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxPoints)
        .sort((a, b) => a.index - b.index);

    if (candidates.length === 0) return data;

    const lines = candidates.map(s => {
        let t = s.text;
        t = t.replace(/^[^a-zA-Z0-9]+/, '');
        return `\n- ${t}`;
    });

    return lines.join('');
};
