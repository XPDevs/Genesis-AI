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

// --- LIST FORMATTING ---
function formatListResponse(text) {
  if (!text || text.length < 20) return text;

  const listMatch = text.match(/^(I can|I'll|I will|I offer|you can)[:\s]+(.+)/i);
  if (listMatch) {
    const content = listMatch[2].replace(/^[,.\s]+|[,.\s]+$/g, '');
    const rawItems = content.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
    if (rawItems.length >= 3) {
      const items = rawItems.map(s => s.replace(/^and\s+/i, '').trim()).filter(Boolean);
      return listMatch[1] + ':\n' + items.map(item => '- ' + item).join('\n');
    }
  }

  return text;
}

// --- REPETITION REMOVAL ---
function removeRepetitions(text) {
  if (!text || text.length < 20) return text;

  let result = text;

  // 1. Deduplicate AI name mentions (keep first mention only)
  const namePattern = /\bgenesis(?:[-\s]?ai)?\b/gi;
  let nameCount = 0;
  result = result.replace(namePattern, (m) => nameCount++ === 0 ? m : '');

  // 2. Deduplicate exact/near-duplicate sentences
  const parts = result.match(/[^.!?\n]+[.!?]*/g) || [result];
  if (parts.length > 1) {
    const seen = new Set();
    const deduped = [];
    for (const part of parts) {
      const t = part.trim();
      const key = t.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (key.length >= 4) {
        let dup = false;
        for (const existing of seen) {
          if (key === existing ||
              (key.length > 6 && existing.length > 6 &&
               (key.includes(existing) || existing.includes(key)))) {
            dup = true;
            break;
          }
        }
        if (!dup) { seen.add(key); deduped.push(t); }
      } else {
        deduped.push(t);
      }
    }
    if (deduped.length < parts.length) {
      result = deduped.join(' ');
    }
  }

  // 3. Clean up orphaned "I'm" / "I am" artifacts from name removal
  result = result.replace(/\b(I'm|I am)\s*[.!?]+\s*/gi, '');

  // 4. Clean up whitespace artifacts from removals
  result = result.replace(/\s{2,}/g, ' ')
                 .replace(/\s+([.,!?;:])/g, '$1')
                 .trim();

  return result || text;
}

// --- RESPONSE MERGING ---
function mergeMatches(texts) {
  if (!texts || texts.length === 0) return '';
  if (texts.length === 1) return removeRepetitions(formatListResponse(texts[0]));

  const allSentences = [];
  for (const text of texts) {
    if (!text || text.length < 2) continue;
    if (text.length < 30) {
      allSentences.push(text.trim());
      continue;
    }
    const parts = text.match(/[^.!?\n]+[.!?]*/g);
    if (parts) {
      for (const p of parts) {
        const t = p.trim();
        if (t && t.length > 1) allSentences.push(t);
      }
    } else {
      allSentences.push(text.trim());
    }
  }

  if (allSentences.length <= 1) return removeRepetitions(formatListResponse(allSentences[0] || texts[0]));

  const unique = [];
  for (const sentence of allSentences) {
    let dup = false;
    for (const existing of unique) {
      const a = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      const b = existing.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (a.length < 4 || b.length < 4) continue;
      if (a === b) { dup = true; break; }
      if (a.length > 6 && b.length > 6 && (a.includes(b) || b.includes(a))) { dup = true; break; }
      if (a.length > 8 && b.length > 8 && levenshteinDistance(a, b) <= 2) { dup = true; break; }
    }
    if (!dup) unique.push(sentence);
  }

  if (unique.length <= 1) return removeRepetitions(formatListResponse(unique[0] || texts[0]));

  const helpOffers = unique.filter(s => /\b(how can I help|what can I do for|is there anything|can I help you|let me know if)\b/i.test(s));
  const hasCapabilities = unique.some(s => /\b(I can|I'll|I will|capabilities|I offer|I help you)\b/i.test(s) && s.length > 15);

  let filtered = unique;
  if (helpOffers.length > 1) {
    const kept = new Set();
    let seen = false;
    for (const s of unique) {
      if (helpOffers.includes(s)) {
        if (!seen) { kept.add(s); seen = true; }
      } else {
        kept.add(s);
      }
    }
    filtered = Array.from(kept);
  } else if (helpOffers.length === 1 && hasCapabilities) {
    const offer = helpOffers[0];
    filtered = unique.filter(s => s !== offer);
  }

  const result = [];
  for (const sentence of filtered) {
    result.push(formatListResponse(sentence));
  }

  return removeRepetitions(result.join(' '));
}
