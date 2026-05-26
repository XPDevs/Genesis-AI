// --- CONTEXT UNDERSTANDING ---
function getChatContext(history) {
    const context = {
        topics: [],
        lastUserMessage: null,
        lastAiMessage: null,
        keyPhrases: [],
        mentionedEntities: []
    };

    if (!history || history.length === 0) return context;

    const recent = history.slice(-6);

    const userMsgs = recent.filter(m => m.role === 'user');
    if (userMsgs.length > 0) {
        context.lastUserMessage = userMsgs[userMsgs.length - 1].text;
    }

    const aiMsgs = recent.filter(m => m.role === 'ai');
    if (aiMsgs.length > 0) {
        context.lastAiMessage = aiMsgs[aiMsgs.length - 1].text;
    }

    const allText = recent.map(m => m.text).join(' ');
    const words = allText.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordFreq = {};
    words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });

    context.topics = Object.entries(wordFreq)
        .filter(([, count]) => count > 1)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);

    const entityPattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g;
    const entities = allText.match(entityPattern) || [];
    context.mentionedEntities = [...new Set(entities)].slice(0, 5);

    if (context.lastAiMessage) {
        const sentences = context.lastAiMessage.match(/[^.!?]+[.!?]+/g) || [context.lastAiMessage];
        context.keyPhrases = sentences.slice(0, 2).map(s => s.trim().toLowerCase());
    }

    return context;
}

function findContextualMatch(input, context, keys) {
    const lowerInput = input.toLowerCase();

    const followUpPatterns = [
        /tell me more/i, /explain further/i, /go on/i, /continue/i,
        /what about/i, /how about/i, /more about/i, /elaborate/i,
        /can you elaborate/i, /can you tell/i, /what else/i, /and/i,
        /what do you mean/i, /why is that/i, /how so/i, /explain/i,
        /tell me about that/i, /i don't understand/i, /i dont understand/i,
        /can you explain/i
    ];

    const pronounPatterns = [
        /\b(it|they|them|this|that|these|those|he|she|him|her)\b/i,
        /\b(there|its|their)\b/i
    ];

    const isFollowUp = followUpPatterns.some(p => p.test(lowerInput));
    const hasPronouns = pronounPatterns.some(p => p.test(lowerInput));

    if (isFollowUp && context.topics.length > 0) {
        for (const topic of context.topics) {
            const enrichedInput = `${lowerInput} ${topic}`;
            const match = findFuzzyMatch(enrichedInput, keys, 4);
            if (match) {
                match.contextUsed = `follow-up on "${topic}"`;
                return match;
            }
        }
    }

    if (isFollowUp && context.keyPhrases.length > 0) {
        for (const phrase of context.keyPhrases) {
            const phraseWords = phrase.split(/\s+/).filter(w => w.length > 3);
            for (const word of phraseWords) {
                const enrichedInput = `${lowerInput} ${word}`;
                const match = findFuzzyMatch(enrichedInput, keys, 4);
                if (match) {
                    match.contextUsed = `follow-up phrase match`;
                    return match;
                }
            }
        }
    }

    if (hasPronouns && context.lastAiMessage) {
        const aiWords = context.lastAiMessage.split(/\s+/);
        const keyNouns = aiWords.filter(w => w.length > 4 && /^[A-Z]/.test(w));
        if (keyNouns.length > 0) {
            const enrichedInput = `${lowerInput} ${keyNouns[0]}`;
            const match = findFuzzyMatch(enrichedInput, keys, 4);
            if (match) {
                match.contextUsed = `pronoun reference to "${keyNouns[0]}"`;
                return match;
            }
        }

        const aiBigrams = [];
        for (let i = 0; i < aiWords.length - 1; i++) {
            if (aiWords[i].length > 3) aiBigrams.push(aiWords[i]);
        }
        const commonNouns = aiBigrams.filter(w => w.length > 3 && !/^[A-Z]/.test(w));
        const uniqueNouns = [...new Set(commonNouns)];
        if (uniqueNouns.length > 0) {
            for (const noun of uniqueNouns.slice(0, 3)) {
                const enrichedInput = `${lowerInput} ${noun}`;
                const match = findFuzzyMatch(enrichedInput, keys, 4);
                if (match) {
                    match.contextUsed = `pronoun reference to "${noun}"`;
                    return match;
                }
            }
        }
    }

    if (context.topics.length > 0) {
        const topicContext = context.topics.slice(0, 3).join(' ');
        const enrichedInput = `${lowerInput} ${topicContext}`;
        const match = findFuzzyMatch(enrichedInput, keys, 5);
        if (match) {
            match.contextUsed = `topic context: "${context.topics[0]}"`;
            return match;
        }
    }

    return null;
}

// --- FUZZY MATCHING (Levenshtein Distance) ---
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function findFuzzyMatch(input, keys, maxDistance = 3) {
  const lowerInput = input.toLowerCase();
  let bestMatch = null;
  let bestDistance = Infinity;
  
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.length < 3 || lowerInput.length < 3) continue;
    
    if (lowerKey.includes(lowerInput) || lowerInput.includes(lowerKey)) {
      const dist = Math.abs(lowerKey.length - lowerInput.length);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = { key, text: responses[key], distance: dist };
      }
    } else {
      const dist = levenshteinDistance(lowerInput, lowerKey);
      if (dist <= maxDistance && dist < bestDistance) {
        bestDistance = dist;
        bestMatch = { key, text: responses[key], distance: dist };
      }
    }
  }
  
  return bestMatch;
}
