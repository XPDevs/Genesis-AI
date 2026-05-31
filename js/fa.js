const TEXT_SPEAK_MAP = {
  "u": "you", "ur": "you are", "ya": "you", "yall": "you all",
  "r": "are", "re": "are",
  "2": "to", "2day": "today", "2morrow": "tomorrow", "2nite": "tonight",
  "4": "for", "4ever": "forever",
  "b": "be", "bc": "because", "cuz": "because", "coz": "because", "bcos": "because",
  "pls": "please", "plz": "please",
  "thx": "thanks", "ty": "thank you", "thnx": "thanks",
  "dunno": "do not know", "dont": "do not", "don't": "do not",
  "cant": "can not", "can't": "can not", "cannot": "can not",
  "wont": "will not", "won't": "will not",
  "didnt": "did not", "didn't": "did not",
  "wasnt": "was not", "wasn't": "was not",
  "wanna": "want to", "gonna": "going to", "gotta": "got to",
  "idk": "i do not know", "idc": "i do not care",
  "imo": "in my opinion", "imho": "in my humble opinion", "tbh": "to be honest",
  "btw": "by the way", "fyi": "for your information", "afaik": "as far as i know",
  "lmk": "let me know", "brb": "be right back", "bbl": "be back later",
  "omw": "on my way", "ttyl": "talk to you later", "cya": "see you",
  "smh": "shaking my head", "lol": "", "lmao": "", "lolz": "",
  "rofl": "", "wtf": "what the", "wth": "what the",
  "dm": "direct message", "pm": "private message",
  "fav": "favorite", "fave": "favorite",
  "tho": "though", "nvm": "never mind",
  "ppl": "people", "pplz": "people",
  "srsly": "seriously", "prolly": "probably", "def": "definitely",
  "rn": "right now", "atm": "at the moment",
  "k": "okay", "kk": "okay", "ok": "okay", "oke": "okay", "okie": "okay",
  "np": "no problem", "yw": "you are welcome",
  "cool": "great", "nice": "good",
  "sup": "what is up", "wassup": "what is up",
  "msg": "message",
  "tia": "thanks in advance",
  "hmu": "hit me up",
  "ik": "i know", "ikr": "i know right"
};

function expandTextSpeak(text) {
  if (!text) return '';
  const words = text.split(/\s+/);
  const expanded = words.map(word => {
    const clean = word.replace(/[^\w]/g, '').toLowerCase();
    if (TEXT_SPEAK_MAP[clean] !== undefined) {
      return TEXT_SPEAK_MAP[clean];
    }
    return word;
  });
  return expanded.join(' ');
}

const UNWANTED_LINES = [
  /^Nice to meet you! You are worthy, capable, and strong\.?$/i,
];

function removeUnwantedLines(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (UNWANTED_LINES.some(pattern => pattern.test(trimmed))) return false;
    return true;
  });
  return filtered.join('\n');
}

// --- WORD CONFIDENCE CHECK ---
function countWordMatches(input) {
  if (!input || typeof responses === 'undefined') return 0;
  const words = input.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
  const keys = Object.keys(responses).filter(k => !k.startsWith('ver'));
  let matched = 0;
  for (const word of words) {
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes(word) || word.includes(lowerKey) || levenshteinDistance(word, lowerKey) <= 2) {
        matched++;
        break;
      }
    }
  }
  return matched;
}

// --- MISSPELLING CORRECTION ---
function normalizeInput(input) {
  if (!input) return '';
  let normalized = input.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  normalized = expandTextSpeak(normalized).replace(/\s+/g, ' ').trim();
  if (typeof TYPE_MAP === 'undefined') return normalized;
  const words = normalized.split(/\s+/);
  const corrected = words.map(word => {
    if (TYPE_MAP[word]) return word;
    for (const [correct, variants] of Object.entries(TYPE_MAP)) {
      if (variants.includes(word)) return correct;
    }
    return word;
  });
  return corrected.join(' ');
}

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
    const lowerInput = normalizeInput(input);

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
  const lowerInput = normalizeInput(input);
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
    const content = listMatch[2].replace(/^[,.\s-]+|[,.\s-]+$/g, '');

    // Split by dash or comma
    let rawItems = content.split(/\s+-\s+/).map(s => s.trim().replace(/^-\s*/, '')).filter(Boolean);
    if (rawItems.length < 2) {
      rawItems = content.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
    }

    if (rawItems.length >= 1) {
      const items = rawItems.map(s => s.replace(/^and\s+/i, '').trim()).filter(Boolean);
      return listMatch[1] + ':\n' + items.map(item => '- ' + item.charAt(0).toUpperCase() + item.slice(1)).join('\n') + '\n';
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

// --- FOLLOW-UP QUESTION ---
function hasEmojiAfterQuestion(text) {
  const questionIndex = text.lastIndexOf('?');
  if (questionIndex === -1) return false;
  const after = text.slice(questionIndex + 1).trim();
  return after.length > 0 && /^\p{Emoji}/u.test(after);
}

function maybeAddFollowUp(text) {
  if (!text || text.length < 20) return text;

  const trimmed = text.trim();

  // Don't add if already ends with a question
  if (trimmed.endsWith('?')) return trimmed;

  // If the text has a ? followed by an emoji, it's already engaging — skip
  if (hasEmojiAfterQuestion(trimmed)) return trimmed;

  // Don't add if already contains a help offer
  if (/\b(how can I help|what can I do for|can I help you|let me know if|anything else|is there anything)\b/i.test(trimmed)) {
    return trimmed;
  }

  // If text contains a bulleted capability list, use list-specific questions
  const hasBulletList = trimmed.includes('\n- ') && /^(I can|I'll|I will|I offer|you can)/i.test(trimmed);

  const questions = hasBulletList ? [
    'Which one can I help with?',
    'What would you like to start with?',
    'Which of these interests you?',
    'Anything in particular you would like to try?',
    'What sounds good to you?',
    'Which would you like me to help with?',
    'Take your pick!',
    'What are you in the mood for?',
  ] : [
    'Is there anything else I can help you with?',
    'What else would you like to know?',
    'Can I help you with anything else?',
    'Would you like me to explain anything further?',
    'Do you have any other questions?',
    'Let me know if you need anything else!',
    'Is there anything more I can assist you with?',
    'Anything else I can do for you?',
  ];

  return trimmed + '\n' + questions[Math.floor(Math.random() * questions.length)];
}

// --- THINK BLOCK HANDLING ---
function stripThinkBlocks(text) {
  return text;
}

function getPrimaryThinkBlock(text) {
  return '';
}

// --- RESPONSE MERGING ---
function mergeMatches(texts) {
  if (!texts || texts.length === 0) return '';

  const strippedTexts = texts.map(t => t.trim()).filter(Boolean);
  if (strippedTexts.length === 0) return '';
  if (strippedTexts.length === 1) {
    return maybeAddFollowUp(removeRepetitions(formatListResponse(strippedTexts[0])));
  }

  // Process each text and track which are formatted lists
  const entries = strippedTexts.map(t => {
    const formatted = formatListResponse(t).trim();
    return { text: formatted, isList: formatted.includes('\n- ') };
  }).filter(e => e.text.length > 1);

  if (entries.length <= 1) {
    const t = entries[0] ? entries[0].text : strippedTexts[0];
    const result = maybeAddFollowUp(removeRepetitions(t));
    return primaryThink ? primaryThink + result : result;
  }

  // Deduplicate
  const unique = [];
  for (const entry of entries) {
    let dup = false;
    for (const existing of unique) {
      const a = entry.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      const b = existing.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (a.length < 4 || b.length < 4) continue;
      if (a === b || (a.length > 6 && b.length > 6 && (a.includes(b) || b.includes(a))) ||
          (a.length > 8 && b.length > 8 && levenshteinDistance(a, b) <= 2)) {
        dup = true; break;
      }
    }
    if (!dup) unique.push(entry);
  }

  if (unique.length <= 1) {
    const result = maybeAddFollowUp(removeRepetitions(unique[0] ? unique[0].text : strippedTexts[0]));
    return primaryThink ? primaryThink + result : result;
  }

  const helpOffers = unique.filter(e => !e.isList && /\b(how can I help|what can I do for|is there anything|can I help you|let me know if)\b/i.test(e.text));
  const hasCapabilities = unique.some(e => e.isList || (/\b(I can|I'll|I will|capabilities|I offer|I help you)\b/i.test(e.text) && e.text.length > 15));

  let filtered = unique;
  if (helpOffers.length > 1) {
    const kept = [];
    let seenOffer = false;
    for (const e of unique) {
      if (helpOffers.includes(e)) {
        if (!seenOffer) { kept.push(e); seenOffer = true; }
      } else {
        kept.push(e);
      }
    }
    filtered = kept;
  } else if (helpOffers.length === 1 && hasCapabilities) {
    filtered = unique.filter(e => e !== helpOffers[0]);
  }

  // Join: lists keep their newlines, separate texts get '\n', but run-on
  // sentences from non-list texts flow naturally
  const result = filtered.map(e => e.text).join('\n');
  const merged = maybeAddFollowUp(removeRepetitions(result));
  return primaryThink ? primaryThink + merged : merged;
}

// --- MARKDOWN RENDERER ---
function hasMarkdownSyntax(text) {
  if (!text) return false;
  return /(\*\*|__|`|^#{1,4}\s|^-\s|^\d+\.\s|^>\s|\[.+\]\(|!\[|~~)/m.test(text);
}

function renderMarkdown(text) {
  if (!text) return '';

  const hasMd = hasMarkdownSyntax(text);
  if (!hasMd) return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Preserve code blocks (must be first)
  const codeBlocks = [];
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const i = codeBlocks.push({ lang, code }) - 1;
    return `\x00CB${i}\x00`;
  });

  // Escape HTML
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Inline code (before other formatting)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold & italic (strong first to avoid overlap)
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<b><i>$1</i></b>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  text = text.replace(/\*(.+?)\*/g, '<i>$1</i>');
  text = text.replace(/___(.+?)___/g, '<b><i>$1</i></b>');
  text = text.replace(/__(.+?)__/g, '<b>$1</b>');
  text = text.replace(/_(.+?)_/g, '<i>$1</i>');

  // Strikethrough
  text = text.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Images (before links, same syntax structure)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">');

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Block-level: process line by line
  const lines = text.split('\n');
  const out = [];
  let inList = false;
  let listType = null;

  function closeList() {
    if (inList) {
      out.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
      listType = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block placeholder
    const cbMatch = trimmed.match(/^\x00CB(\d+)\x00$/);
    if (cbMatch) {
      closeList();
      const block = codeBlocks[parseInt(cbMatch[1])];
      const langClass = block.lang ? ` class="language-${block.lang}"` : '';
      out.push(`<pre><code${langClass}>${block.code}</code></pre>`);
      continue;
    }

    // Headers
    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (hMatch) {
      closeList();
      out.push(`<h${hMatch[1].length}>${hMatch[2]}</h${hMatch[1].length}>`);
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      closeList();
      out.push('<hr>');
      continue;
    }

    // Blockquote
    if (/^&gt;\s/.test(trimmed)) {
      closeList();
      out.push(`<blockquote>${trimmed.replace(/^&gt;\s*/, '')}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[-*]\s*/, '');
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
        out.push('<ul>');
      }
      out.push(`<li>${content}</li>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*/, '');
      if (!inList || listType !== 'ol') {
        closeList();
        inList = true;
        listType = 'ol';
        out.push('<ol>');
      }
      out.push(`<li>${content}</li>`);
      continue;
    }

    // Empty line = skip (no extra spacing)
    if (!trimmed) {
      closeList();
      continue;
    }

    // Regular text
    closeList();
    out.push(trimmed);
  }
  closeList();

  // Join: text lines separated by <br>, block HTML directly adjacent (no whitespace)
  let html = out.map((line, i) => {
    if (i === out.length - 1) return line;
    const isBlock = /^</.test(line) || /^$/.test(line);
    return line + (isBlock ? '' : '<br>');
  }).join('');

  return html;
}

function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,4}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .trim();
}
