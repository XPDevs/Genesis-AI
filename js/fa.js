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

function collapseShortLines(text) {
  if (!text) return '';
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 3) return text;
  const result = [];
  let buffer = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.length <= 60) {
      const cleaned = trimmed.replace(/[.!?]+$/, '').trim();
      if (cleaned) buffer.push(cleaned);
    } else {
      if (buffer.length > 1) {
        result.push(buffer.join(' ') + '.');
      } else if (buffer.length === 1) {
        result.push(buffer[0]);
      }
      buffer = [];
      result.push(trimmed);
    }
  }
  if (buffer.length > 1) {
    const last = lines[lines.length - 1].trim();
    const ending = last.match(/[.!?]+$/);
    result.push(buffer.join(' ') + (ending ? ending[0] : '.'));
  } else if (buffer.length === 1) {
    result.push(buffer[0]);
  }
  return result.join('\n');
}

const FLAGS = {
  "greeting_standard": {
    patterns: [/\bhi\b|\bhello\b|\bhey\b|\bheyyy?\b|\bheya?\b/i, /\bhowdy\b|\bgreetings\b|\bsalutations\b/i, /\bhiya\b|\bello\b|\bhelo\b/i],
    format: "compact_flow"
  },
  "greeting_formal": {
    patterns: [/\bgood\s+morning\b|\bgood\s+afternoon\b|\bgood\s+evening\b/i, /\bmorning\b|\bafternoon\b|\bevening\b[!.]*$/im, /\bgm\b|\bgn\b|\bgday\b/i],
    format: "compact_flow"
  },
  "greeting_casual": {
    patterns: [/\bsup\b|\bwassup\b|\bwhassup\b|\bwhat's\s+up\b|\bwassup\b/i, /\byo\b|\bey\b|\bhey\s+there\b/i, /\blong\s+time\s+no\s+see\b|\bgood\s+to\s+see\b/i],
    format: "compact_flow"
  },
  "farewell_standard": {
    patterns: [/\bbye\b|\bgoodbye\b|\bgood\s+bye\b|\bbye-?bye\b|\bbuh\s+bye\b/i, /\bsee\s+(ya|you|you\s+later|later|you\s+soon|you\s+around)\b/i, /\btake\s+care\b|\bhave\s+a\s+good\s+(one|day|night|evening)\b|\bgotta\s+go\b/i],
    format: "compact_flow"
  },
  "farewell_formal": {
    patterns: [/\bfarewell\b|\badieu\b|\bso\s+long\b/i, /\buntil\s+(next\s+time|we\s+meet\s+again|then)\b|\bcheerio\b/i, /\bpeace\s+out\b|\blater\b|\blaters\b|\bcatch\s+you\s+later\b/i],
    format: "compact_flow"
  },
  "farewell_night": {
    patterns: [/\bgood\s+night\b|\bnighty?\s*night\b|\bsleep\s+well\b|\bsweet\s+dreams\b/i, /\bgonna\s+hit\s+the\s+sack\b|\bhitting\s+the\s+hay\b|\bgoing\s+to\s+bed\b/i],
    format: "compact_flow"
  },
  "introduction": {
    patterns: [/\bwho\s+(are|is)\s+(you|this|the\s+ai)\b/i, /\bintroduce\s+(yourself|the\s+ai|this\s+system)\b/i, /\btell\s+me\s+about\s+(yourself|you|this\s+system)\b/i, /\bwhat\s+are\s+you\b/i],
    format: "compact_flow"
  },
  "help_request": {
    patterns: [/\bi\s+(need|want|would\s+like)\s+(some\s+|a\s+little\s+)?(help|assistance|aid)\b/i, /\bcan\s+you\s+(help|assist|aid)\s+me\b/i, /\bhelp\s+me\b/i, /\b(need|wanna)\s+(some\s+)?help\b/i],
    format: "compact_flow"
  },
  "gratitude_thanks": {
    patterns: [/\bthanks?\b|\bthank\s+(you|u|ya|you\s+so\s+much|you\s+a\s+lot)\b/i, /\bty\b|\bthx\b|\bthnx\b|\btysm\b|\btbh\b/i],
    format: "compact_warm"
  },
  "gratitude_appreciate": {
    patterns: [/\bappreciate\s+(it|that|you|ya)\b/i, /\bgrateful\b|\bthanks\s+a\s+bunch\b|\bmuch\s+obliged\b/i, /\bi\s+owe\s+(you|ya)\s+(one|a\s+big\s+one)\b/i],
    format: "compact_warm"
  },
  "gratitude_emphatic": {
    patterns: [/\bthank\s+you\s+so\s+much\b|\bthank\s+you\s+very\s+much\b|\bthanks\s+a\s+lot\b/i, /\bcan't\s+thank\s+you\s+enough\b|\bI\s+really\s+appreciate\b/i],
    format: "compact_warm"
  },
  "apology_sorry": {
    patterns: [/\bsorry\b|\bso\s+so\s+sorry\b|\bvery\s+sorry\b|\bterribly\s+sorry\b/i, /\bmy\s+apologies\b|\bmy\s+bad\b|\bmy\s+fault\b/i, /\bapologize\b|\bapologies\b|\bdeeply\s+regret\b/i],
    format: "compact_soft"
  },
  "apology_emphatic": {
    patterns: [/\bi'm?\s+sorry\s+(for|about|if)\b/i, /\bplease\s+forgive\s+(me|my)\b|\bI\s+owe\s+you\s+an\s+apology\b/i, /\bI\s+didn't\s+mean\s+to\b|\bI\s+didnt\s+mean\s+to\b/i],
    format: "compact_soft"
  },
  "praise_smart": {
    patterns: [/\byou['']?re?\s+(so\s+)?(smart|brilliant|intelligent|genius|clever|bright|wise|knowledgeable)\b/i, /\b(you|you['']?re?)\s+(are\s+)?(very\s+)?(helpful|useful|great|amazing|fantastic)\b/i],
    format: "humble_compact"
  },
  "praise_general": {
    patterns: [/\b(nice|great|awesome|amazing|excellent|fantastic|perfect)\s+(answer|response|reply|explanation)\b/i, /\byou['']?re?\s+(the\s+)?(best|greatest|most\s+helpful)\b/i, /\bimpressive\b|\bwell\s+said\b|\bwell\s+done\b/i],
    format: "humble_compact"
  },
  "praise_thankful": {
    patterns: [/\byou\s+rock\b|\byou['']?re?\s+the\s+best\b|\byou['']?re?\s+a\s+star\b/i, /\bthanks\s+for\s+the\s+great\s+(answer|help|info|response)\b/i],
    format: "humble_compact"
  },
  "who_identity": {
    patterns: [/\bwho\s+(are|is)\s+(you|this|the\s+ai)\b/i, /\bwhat\s+(are\s+you|is\s+this\s+ai|are\s+you\s+supposed\s+to\s+be)\b/i],
    format: "friendly_intro"
  },
  "who_about": {
    patterns: [/\btell\s+me\s+about\s+(yourself|you|this\s+ai)\b/i, /\bintroduce\s+(yourself|you)\b/i, /\bdescribe\s+yourself\b/i],
    format: "friendly_intro"
  },
  "who_curious": {
    patterns: [/\b(what|who)\s+(are\s+you|is\s+this)\b[^?]*\??$/im, /\bcan\s+you\s+tell\s+me\s+about\s+(yourself|you)\b/i],
    format: "friendly_intro"
  },
  "creator_who": {
    patterns: [/\bwho\s+(made|created|built|programmed|developed|designed|invented)\s+(you|this|the\s+ai)\b/i, /\bwho['']?s?\s+your\s+(creator|maker|developer|programmer|builder|father|mother|owner)\b/i],
    format: "detailed"
  },
  "creator_how_made": {
    patterns: [/\b(how|what)\s+(was|were|did)\s+(you|this)\s+(made|created|built|programmed)\b/i, /\bwhat\s+(company|team|organization|group)\s+(made|created|built)\s+(you|this)\b/i],
    format: "detailed"
  },
  "creator_origin": {
    patterns: [/\b(which|what)\s+company\s+(do\s+you\s+belong|are\s+you\s+from|made\s+you)\b/i, /\bwho\s+(do\s+you\s+work\s+for|is\s+behind\s+you|designed\s+you)\b/i],
    format: "detailed"
  },
  "capabilities_what_can": {
    patterns: [/\bwhat\s+(can|all\s+can|exactly\s+can)\s+(you\s+)?(do|handle|help\s+(me\s+)?with)\b/i, /\bwhat\s+are\s+your\s+(capabilities|abilities|features|functions|skills)\b/i],
    format: "bulleted_list"
  },
  "capabilities_how_help": {
    patterns: [/\bhow\s+can\s+you\s+(help|assist|aid)\s+me\b/i, /\bwhat\s+(can\s+you|do\s+you)\s+(help|offer|provide|assist)\s+(with|me)\b/i],
    format: "bulleted_list"
  },
  "capabilities_scope": {
    patterns: [/\bwhat\s+(do\s+you\s+know|are\s+you\s+capable\s+of|can\s+you\s+do)\b/i, /\bwhat\s+kinds?\s+of\s+(things|questions|tasks|topics)\s+(can|do)\s+you\b/i, /\byour\s+capabilities\b/i],
    format: "bulleted_list"
  },
  "capabilities_limits": {
    patterns: [/\bwhat\s+(can'?t|cannot|aren'?t)\s+you\s+(do|handle|help\s+with)\b/i, /\bwhat\s+are\s+your\s+(limitations|limits|weaknesses|drawbacks)\b/i, /\bis\s+there\s+(anything|something)\s+you\s+(can'?t|cannot)\s+(do|handle)\b/i],
    format: "bulleted_list"
  },
  "how_work_tech": {
    patterns: [/\bhow\s+(do|does)\s+(you|this|the\s+ai)\s+work\b/i, /\bhow\s+(are|were)\s+(you|this)\s+(built|designed|programmed|developed|trained)\b/i, /\bwhat\s+(technology|tech|framework|architecture|model)\s+(do\s+you|are\s+you)\s+(use|based\s+on)\b/i],
    format: "detailed_tech"
  },
  "how_work_ai": {
    patterns: [/\bhow\s+does\s+(ai|artificial\s+intelligence|this\s+ai)\s+work\b/i, /\bwhat\s+(ai\s+)?model\s+(do\s+you\s+use|are\s+you\s+based\s+on|underlies\s+you)\b/i, /\bwhat\s+(language|programming\s+language)\s+(did|do)\s+you\s+(use|code\s+in)\b/i],
    format: "detailed_tech"
  },
  "how_work_internals": {
    patterns: [/\bhow\s+(are\s+you|do\s+you)\s+(trained|learning|learned|trained)\b/i, /\bhow\s+(do\s+you|can\s+you)\s+(understand|process|respond|generate)\b/i, /\bwhat\s+makes\s+you\s+(tick|work|run)\b/i],
    format: "detailed_tech"
  },
  "math_arithmetic": {
    patterns: [/\b\d+\s*[+\-*/%]\s*\d+\b/i, /\b(what['']?s?|calculate|compute|solve)\s+\d+\s*[+\-*/%]\s*\d+/i],
    format: "math_result"
  },
  "math_algebra": {
    patterns: [/\b(algebra|equation|solve\s+for\s+x|quadratic|linear\s+equation)\b/i, /\b\d+x\s*[+\-*/=]|\b\d+[\+\-]\d*x\b/i],
    format: "math_result"
  },
  "math_simple_ops": {
    patterns: [/\b(add|subtract|multiply|divide|sum|difference|product|quotient)\b.*\d+/i, /\b(what['']?s?|find|calculate)\s+\d+[%\s]+(of|plus|minus|times|divided\s+by)\s+\d+/i],
    format: "math_result"
  },
  "math_percentage": {
    patterns: [/\bwhat['']?s?\s+\d+%\s+of\s+\d+/i, /\b(percentage|percent|%)\s+(of|change|difference|increase|decrease)\b.*\d+/i],
    format: "math_result"
  },
  "math_calculus": {
    patterns: [/\b(calculus|derivative|integral|differentiate|integrate|limit|differential)\b/i, /\b(d[dy]\/dx|f[''']?\(x\)|\u222b|\u03b4|\u2202)\b/i],
    format: "math_detailed"
  },
  "math_trig": {
    patterns: [/\b(sin|cos|tan|sec|csc|cot|cosec|trig|trigonometry|sine|cosine|tangent)\b/i, /\b(arctan|arcsin|arccos|hyperbolic|asinh|acosh|atanh)\b/i],
    format: "math_detailed"
  },
  "math_stats": {
    patterns: [/\b(statistics|probability|mean|median|mode|standard\s+deviation|variance|correlation|regression)\b/i, /\b(binomial|poisson|normal\s+distribution|gaussian|bayes|bayesian)\b/i],
    format: "math_detailed"
  },
  "math_advanced_gen": {
    patterns: [/\b(linear\s+algebra|matrix|vector|determinant|eigen|fourier|laplace|complex\s+number)\b/i, /\b(differential\s+equation|partial\s+differential|pde|ode|logarithm|exponential)\b/i],
    format: "math_detailed"
  },
  "time_current": {
    patterns: [/\bwhat\s+(time|date|day|month|year)\s+is\s+(it|today|right\s+now)\b/i, /\b(current|today['']?s?)\s+(time|date|day|month|year)\b/i],
    format: "date_time"
  },
  "time_ask": {
    patterns: [/\b(tell\s+me|what['']?s?)\s+(the\s+)?(time|date|day|month|year)\b/i, /\bwhat['']?s?\s+(today|tomm?or?row?)\b/i],
    format: "date_time"
  },
  "time_specific": {
    patterns: [/\bwhat\s+day\s+(of\s+the\s+week|is\s+it|was\s+(it|yesterday)|will\s+(it|be))\b/i, /\b(what['']?s?|give\s+me)\s+(current|today['']?s?)\s+(date|time)\b/i],
    format: "date_time"
  },
  "weather_general": {
    patterns: [/\b(what['']?s?|how['']?s?|tell\s+me)\s+the\s+weather\b/i, /\bweather\s+(forecast|today|report|outside|like|looks?\s+like|condition)\b/i],
    format: "weather_info"
  },
  "weather_specific": {
    patterns: [/\b(is\s+it|will\s+it\s+be)\s+(rain|sunny|cloudy|snow|cold|hot|warm|cool|windy|storm|fog)\b/i, /\b(what['']?s?|how['']?s?)\s+the\s+(temperature|temp|weather)\s+(like\s+)?(in|at|for|outside)\b/i],
    format: "weather_info"
  },
  "weather_question": {
    patterns: [/\b(temp|temperature|humidity|rain|snow|wind)\s+(in|at|for|today|tomorrow|this\s+week)\b/i, /\bhow\s+(cold|hot|warm|chilly|freezing)\s+(is|will|does)\s+it\b/i],
    format: "weather_info"
  },
  "definition_what_is": {
    patterns: [/\bwhat\s+(is|are|was|were)\s+(a\s+|an\s+|the\s+)?\w{3,}\b/i, /\bdefine\s+\w{3,}\b/i, /\bwhat['']?s?\s+the\s+meaning\s+of\b/i],
    format: "definition_style"
  },
  "definition_meaning": {
    patterns: [/\bmeaning\s+of\s+\w{3,}\b/i, /\bwhat\s+does\s+\w{3,}\s+mean\b/i, /\bdefinition\s+of\b/i],
    format: "definition_style"
  },
  "definition_explain_term": {
    patterns: [/\bexplain\s+(a\s+|an\s+|the\s+)?\w{3,}\b/i, /\bwhat\s+is\s+meant\s+by\b/i, /\bwhat\s+do\s+you\s+(call|mean\s+by)\s+\w{3,}\b/i],
    format: "definition_style"
  },
  "explain_general": {
    patterns: [/\bexplain\b/i, /\belaborate\b/i, /\bcan\s+you\s+(explain|elaborate|clarify)\b/i],
    format: "detailed"
  },
  "explain_clarify": {
    patterns: [/\bclarify\b|\bclear\s+up\b|\bshed\s+light\b/i, /\bwhat\s+do\s+you\s+mean\s+by\b/i, /\bcan\s+you\s+break\s+(that\s+)?down\b/i],
    format: "detailed"
  },
  "explain_detail": {
    patterns: [/\bin\s+more\s+detail\b|\bgive\s+me\s+details?\b|\bexpand\s+on\b/i, /\btell\s+me\s+more\s+about\b|\bwalk\s+me\s+through\b/i],
    format: "detailed"
  },
  "compare_general": {
    patterns: [/\b(compare|comparison)\s+\w+\s+(and|to|with|vs?\.?)\s+\w+/i, /\bdifference\s+between\b.*\b(and|vs?\.?)\b/i],
    format: "comparison_table"
  },
  "compare_vs": {
    patterns: [/\w+\s+vs\.?\s+\w+/i, /\w+\s+versus\s+\w+/i, /\bvs\b.*\bvs\b/i],
    format: "comparison_table"
  },
  "compare_which": {
    patterns: [/\bwhich\s+(is\s+)?(better|worse|faster|slower|bigger|smaller|cheaper|more)\b.*\b(or\s+|\bvs\b)/i, /\b(pros\s+and\s+cons|advantages\s+and\s+disadvantages)\s+of\s+\w+\s+(and|vs?)\s+\w+/i],
    format: "comparison_table"
  },
  "how_to": {
    patterns: [/\bhow\s+(to|do\s+I|can\s+I|would\s+I|should\s+I)\s+\w+/i, /\bsteps?\s+(to|for|in|on)\b/i, /\bguide\s+(me|through|on)\b/i],
    format: "numbered_steps"
  },
  "tutorial": {
    patterns: [/\b(tutorial|guide|walkthrough|walk-through)\s+(for|on|how)\b/i, /\bstep\s+by\s+step\b/i, /\bwhat['']?s?\s+the\s+(process|procedure|method)\s+(for|to)\b/i],
    format: "numbered_steps"
  },
  "instructions": {
    patterns: [/\binstruct\b|\binstructions?\s+(for|on|to)\b/i, /\bhow\s+can\s+I\s+(learn|start|begin|get)\b/i, /\bwhat\s+are\s+the\s+steps?\b/i],
    format: "numbered_steps"
  },
  "list_types": {
    patterns: [/\b(list|enumerate|itemize|catalog|index)\s+(of|the|all|some|different|types|kinds)\b/i, /\btypes?\s+of\b/i, /\bwhat\s+(are|were|is)\s+(the\s+)?(types?|kinds?|categories?|examples?|varieties?)\s+of\b/i],
    format: "bulleted_list"
  },
  "list_examples": {
    patterns: [/\bgive\s+me\s+(some|a\s+list\s+of|a\s+few|several)\s+(examples?|instances?|cases?)\b/i, /\bwhat\s+(are|were|is)\s+some\s+(examples?|instances?)\s+of\b/i],
    format: "bulleted_list"
  },
  "list_enumerate": {
    patterns: [/\bname\s+(some|all|the|a\s+few)\b/i, /\blist\s+(out|down|for\s+me)\b/i, /\bcan\s+you\s+(list|name|enumerate)\b/i],
    format: "bulleted_list"
  },
  "code_write": {
    patterns: [/\b(write|create|make|build)\s+(a\s+|an\s+)?(code|program|script|function|class|app|application)\s+(in|using|with|for)\b/i, /\b(code|program|script|function|algorithm)\s+(to|for|that|which)\b/i],
    format: "code_response"
  },
  "code_language": {
    patterns: [/\b(python|javascript|java|c\+\+|typescript|ruby|go|rust|swift|kotlin|php|perl|scala|lua)\s+(code|program|script|function|example)\b/i, /\bhow\s+to\s+(code|program|write)\s+(in|with|using)\s+(python|javascript|java|typescript|ruby|go)\b/i],
    format: "code_response"
  },
  "code_help": {
    patterns: [/\b(help|assist|help\s+me)\s+(with\s+)?(code|programming|scripting|coding)\b/i, /\b(need|would\s+like)\s+(some|a\s+bit\s+of|a\s+little)\s+(code|programming)\s+(help|assistance)\b/i],
    format: "code_response"
  },
  "code_example": {
    patterns: [/\bgive\s+me\s+(a\s+|an\s+)?(code\s+)?example\s+(of|in|for|using)\b/i, /\bcan\s+you\s+(show|give|provide)\s+(me\s+)?(an\s+|a\s+)?(example\s+)?(code\s+)?(snippet|example|sample)\b/i],
    format: "code_response"
  },
  "debug_fix": {
    patterns: [/\b(debug|fix|resolve|troubleshoot|solve)\s+(this|my|a|the)\s+(issue|problem|bug|error|glitch)\b/i, /\b(why|help)\s+(is|does|isn'?t)\s+(my|this)\s+(code|program|app|script|function)\s+(not\s+working|broken|failing|crashing)\b/i],
    format: "debug_guide"
  },
  "debug_error": {
    patterns: [/\b(error|bug|issue|problem|glitch|crash|exception)\s+(in|with|at|on|during)\b/i, /\bi['']?m?\s+getting\s+(an\s+|a\s+)?error\b/i, /\b(something|it)\s+isn'?t\s+working\b/i],
    format: "debug_guide"
  },
  "debug_not_working": {
    patterns: [/\b(not\s+working|doesn'?t\s+work|won'?t\s+work|isn'?t\s+working)\b/i, /\b(fix|need\s+to\s+fix|can\s+you\s+fix)\s+(this|it|my)\b/i, /\b(what['']?s?|where['']?s?)\s+(wrong|the\s+issue|the\s+problem|the\s+bug)\b/i],
    format: "debug_guide"
  },
  "creative_story": {
    patterns: [/\b(write|tell|create|make\s+up)\s+(a\s+|an\s+|some\s+)?(story|tale|narrative|fiction)\s+(about|of|for|where)\b/i, /\b(storytelling|write\s+a\s+short\s+story|tell\s+me\s+a\s+story)\b/i],
    format: "creative_flow"
  },
  "creative_poem": {
    patterns: [/\b(write|compose|create|make)\s+(a\s+|an\s+)?(poem|poetry|verse|rhyme|sonnet|haiku|limerick)\b/i, /\bpoem\s+about\b/i],
    format: "creative_flow"
  },
  "creative_essay": {
    patterns: [/\b(write|compose|draft)\s+(a\s+|an\s+)?(essay|article|blog\s+post|paper|report)\s+(on|about|for|regarding)\b/i, /\bcreative\s+(writing|story|piece|content)\b/i],
    format: "creative_flow"
  },
  "summarize": {
    patterns: [/\b(summarize|sum\s+up|tl;?dr|in\s+short|briefly|synopsis|overview|recap)\b/i, /\bgive\s+me\s+(a\s+|the\s+)?(summary|synopsis|recap|rundown|digest)\b/i],
    format: "concise"
  },
  "summary_short": {
    patterns: [/\b(in\s+a\s+nutshell|long\s+story\s+short|bottom\s+line|gist|main\s+point|key\s+takeaway)\b/i, /\bcan\s+you\s+(summarize|sum\s+up|recap)\s+(this|that|it)\b/i],
    format: "concise"
  },
  "summary_conclude": {
    patterns: [/\bwhat['']?s?\s+the\s+(gist|main\s+idea|key\s+point|takeaway|conclusion)\b/i, /\b(conclude|conclusion|wrap\s+up|boil\s+it\s+down)\b/i],
    format: "concise"
  },
  "translate_to": {
    patterns: [/\b(translate|convert|turn|change|rendering)\s+(this|that|it|the\s+following)\s+(to|into|in)\s+(french|spanish|german|italian|portuguese|russian|japanese|chinese|korean|arabic|hindi|dutch|polish|swedish|norwegian|danish|finnish|turkish|greek|czech|romanian|hungarian|hebrew|thai|vietnamese|indonesian|malay)\b/i, /\b(how\s+do\s+you\s+say|what['']?s?|say)\s+(this|that|it|the\s+word)\s+(in|to)\s+\w+(ish|ian|ch|ese|ish)\b/i],
    format: "translation"
  },
  "translate_from": {
    patterns: [/\btranslate\s+(from|this)\s+(french|spanish|german|italian|portuguese|russian|japanese|chinese|korean|arabic|hindi|dutch|polish|swedish|norwegian|danish|finnish|turkish|greek|czech|romanian|hungarian|hebrew|thai|vietnamese|indonesian|malay)\s+(to|into)\b/i, /\bwhat\s+does\s+\w+\s+mean\s+(in\s+)?(english|french|spanish|german|italian)\b/i],
    format: "translation"
  },
  "translate_general": {
    patterns: [/\bcan\s+you\s+(translate|interpret|convert)\s+(this|that|it|the\s+following)\b/i, /\btranslation\s+(please|help|needed)\b/i, /\b(interpret|interpretation)\s+(this|that|the|for)\b/i],
    format: "translation"
  },
  "opinion_what_think": {
    patterns: [/\bwhat\s+(do|would|did)\s+you\s+(think|believe|reckon|feel)\s+(about|of|regarding|on)\b/i, /\bwhat['']?s?\s+your\s+(take|thoughts?|opinion|view|perspective|stance|position)\s+(on|about|regarding)\b/i],
    format: "opinion_balanced"
  },
  "opinion_ask": {
    patterns: [/\bdo\s+you\s+(think|believe|feel|consider|reckon)\s+(that\s+)?/i, /\bin\s+your\s+opinion\b/i, /\bwhat\s+would\s+you\s+(say|do|recommend)\s+(if|about|in)\b/i],
    format: "opinion_balanced"
  },
  "recommend_general": {
    patterns: [/\b(recommend|suggest)\s+(me\s+)?(a|an|some|the\s+best)\b/i, /\bcould\s+you\s+(recommend|suggest)\b/i, /\bwhat\s+do\s+you\s+(recommend|suggest)\b/i],
    format: "recommendation_list"
  },
  "recommend_good": {
    patterns: [/\bwhat['']?s?\s+(a\s+|an\s+|the\s+)?(good|great|nice|decent|best)\s+\w+\s+(to|for|that)\b/i, /\bany\s+(recommendations?|suggestions?)\s+(for|on|about)\b/i, /\b(are\s+there|got\s+any|have\s+any)\s+(good|nice|decent)\b/i],
    format: "recommendation_list"
  },
  "recommend_best": {
    patterns: [/\bwhat['']?s?\s+the\s+(best|top|greatest|most\s+popular)\b/i, /\b(best|top)\s+(recommendation|suggestion|pick|choice)\s+(for|is|would\s+be)\b/i],
    format: "recommendation_list"
  },
  "health_symptom": {
    patterns: [/\b(symptom|pain|ache|hurt|sore|dizzy|nausea|fever|cough|cold|flu)\b/i, /\b(i\s+(have|feel|am\s+experiencing|am\s+feeling|got)|feeling)\s+(a\s+|an\s+)?(pain|symptom|headache|migraine|backache|stomach|chest\s+pain)\b/i],
    format: "health_disclaimer"
  },
  "health_condition": {
    patterns: [/\b(medical|health|illness|disease|condition|disorder|diagnosis|treatment|therapy|medication|medicine|drug|prescription|surgery)\b/i, /\b(what['']?s?|am\s+I|do\s+I\s+have|could\s+it\s+be)\s+(wrong\s+with|the\s+diagnosis|a\s+medical)\b/i],
    format: "health_disclaimer"
  },
  "health_doctor": {
    patterns: [/\bshould\s+I\s+(see\s+a\s+doctor|go\s+to\s+the\s+hospital|take\s+medicine|visit\s+a\s+doctor)\b/i, /\b(doctor|physician|specialist|surgeon|nurse|medical)\s+(appointment|visit|consult|recommend|advise)\b/i],
    format: "health_disclaimer"
  },
  "science_physics": {
    patterns: [/\b(physics|quantum|relativity|gravity|electromagnetism|thermodynamics|mechanics|optics|nuclear|particle)\b/i, /\b(newton|einstein|planck|bohr|schrodinger|heisenberg|maxwell|feynman|hawking)\b/i],
    format: "scientific_detailed"
  },
  "science_chemistry": {
    patterns: [/\b(chemistry|chemical|reaction|element|compound|molecule|atom|bond|orbital|periodic|acid|base|pH|oxidation|reduction|organic|inorganic)\b/i, /\b(molar|mole|concentration|solution|solvent|solute|catalyst|enzyme|polymer)\b/i],
    format: "scientific_detailed"
  },
  "science_biology": {
    patterns: [/\b(biology|biological|cell|dna|rna|gene|protein|enzyme|organism|species|evolution|natural\s+selection|mutation|ecosystem|habitat)\b/i, /\b(photosynthesis|respiration|mitosis|meiosis|homeostasis|symbiosis|parasite|predator|prey|food\s+chain)\b/i],
    format: "scientific_detailed"
  },
  "science_astronomy": {
    patterns: [/\b(astronomy|astrophysics|star|planet|galaxy|nebula|supernova|black\s+hole|quasar|comet|asteroid|meteor|universe|cosmos|space)\b/i, /\b(solar\s+system|exoplanet|constellation|telescope|hubble|jwst|mars|jupiter|saturn|venus|mercury)\b/i],
    format: "scientific_detailed"
  },
  "history_ancient": {
    patterns: [/\b(ancient|medieval|renaissance|antiquity|prehistoric|classical|bronze\s+age|iron\s+age|stone\s+age|dark\s+ages)\b/i, /\b(roman|greek|egyptian|viking|celtic|byzantine|ottoman|persian|mongol|inca|aztec|mayan|sumerian)\s+(empire|civilization|culture|kingdom|period)\b/i],
    format: "historical_context"
  },
  "history_war": {
    patterns: [/\b(world\s+war\s+(i|ii|one|two|1|2)|wwi|wwii|ww1|ww2|civil\s+war|cold\s+war|revolution|battle|war)\b/i, /\b(century|19th|18th|20th|17th|16th|15th|14th|13th|12th|11th)\s+(century|centuries)\b/i],
    format: "historical_context"
  },
  "history_event": {
    patterns: [/\b(history|historical|historic)\s+(of|event|figure|period|era|timeline|significance|context)\b/i, /\bwhat\s+happened\s+(in|during|on|at)\s+\d{3,4}\b/i, /\b(who\s+was|tell\s+me\s+about)\s+\w+\s+(in\s+history|the\s+historical)\b/i],
    format: "historical_context"
  },
  "geography_country": {
    patterns: [/\b(capital|country|nation)\s+(of|is|are|the)\b/i, /\bwhere\s+is\s+\w+\s+located\b/i, /\bwhat\s+(is\s+the\s+)?capital\s+(of|for)\b/i],
    format: "geographic_detail"
  },
  "geography_city": {
    patterns: [/\b(city|town|village|municipality|metropolis|borough)\s+(in|of|located|known|famous)\b/i, /\bwhat\s+continent\s+is\b/i, /\b(population|area|size|climate|timezone)\s+(of|in|for)\s+\w+/i],
    format: "geographic_detail"
  },
  "geography_feature": {
    patterns: [/\b(river|mountain|ocean|sea|lake|desert|forest|valley|plateau|peninsula|island|volcano|glacier|canyon)\b/i, /\b(geography|geographic|geographical|map|atlas|terrain|landscape|region|zone)\b/i],
    format: "geographic_detail"
  },
  "entertainment_movie": {
    patterns: [/\b(movie|film|cinema|flick|motion\s+picture|documentary|short\s+film)\s+(about|called|recommend|suggest|review|watch)\b/i, /\b(what['']?s?|tell\s+me|know\s+any)\s+(good|great|popular|new|classic)\s+(movies?|films?|shows?)\b/i],
    format: "entertainment_detail"
  },
  "entertainment_tv": {
    patterns: [/\b(tv|television|show|series|episode|season|netflix|hulu|amazon\s+prime|disney\+|hbo|apple\s+tv|paramount)\b/i, /\b(binge|watch|streaming)\s+(worthy|recommend|suggest|good|show|shows|series)\b/i],
    format: "entertainment_detail"
  },
  "entertainment_actor": {
    patterns: [/\b(actor|actress|star|celebrity|director|producer|screenplay|writer|cast|character|role)\b/i, /\bwho\s+(played|starred|acted|directed|wrote|produced)\b/i],
    format: "entertainment_detail"
  },
  "music_song": {
    patterns: [/\b(song|track|single|album|ep|record|discography|playlist|melody|tune|lyrics)\b/i, /\b(music|musical|genre|band|artist|singer|musician|composer|songwriter|dj|producer)\b/i],
    format: "music_detail"
  },
  "music_genre": {
    patterns: [/\b(rock|pop|jazz|blues|classical|hip.?hop|rap|r&b|rnb|country|folk|electronic|edm|dubstep|techno|house|metal|punk|indie|alternative|reggae|soul|funk|gospel|latin|k.?pop|j.?pop)\b/i, /\b(recommend|suggest|listen|hear)\s+(some|a|any)\s+(music|song|artist|band)\b/i],
    format: "music_detail"
  },
  "music_artist": {
    patterns: [/\b(artist|band|singer|musician|group)\s+(called|named|known\s+as|from)\b/i, /\bwho\s+(sings|performs|recorded|wrote|produced|composed)\b/i],
    format: "music_detail"
  },
  "art_general": {
    patterns: [/\b(art|artwork|artistic|masterpiece|gallery|museum|exhibition|sculpture|painting|drawing|sketch|portrait|landscape)\b/i, /\b(artist|painter|sculptor|illustrator|photographer|designer|architect)\s+(called|named|known)\b/i],
    format: "art_detail"
  },
  "art_movement": {
    patterns: [/\b(impressionism|cubism|surrealism|expressionism|abstract|realism|baroque|rococo|renaissance|modernism|pop\s+art|minimalism|contemporary)\b/i, /\b(van\s+gogh|picasso|monet|da\s+vinci|michelangelo|rembrandt|dali|warhol|matisse|degas|renoir|cezanne|klimt|mondrian|pollock)\b/i],
    format: "art_detail"
  },
  "art_style": {
    patterns: [/\b(style|technique|medium|canvas|oil|acrylic|watercolor|charcoal|pastel|digital|mixed\s+media|installation|performance|conceptual)\b/i, /\b(how\s+to|learn|study)\s+(art|draw|paint|sketch|sculpt)\b/i],
    format: "art_detail"
  },
  "food_recipe": {
    patterns: [/\b(recipe|dish|cook|bake|prepare|make)\s+(for|of|with|using)\b/i, /\bhow\s+(to|do\s+I|can\s+I)\s+(cook|bake|make|prepare|grill|roast|saute|fry|steam|boil|chop|dice|mince|knead|whisk)\b/i],
    format: "food_detail"
  },
  "food_ingredient": {
    patterns: [/\b(ingredient|food|cuisine|meal|dinner|lunch|breakfast|brunch|snack|dessert|appetizer|entree|side\s+dish)\b/i, /\b(what['']?s?|recommend|suggest)\s+(a\s+|an\s+|some\s+)?(good|tasty|delicious|easy|simple|quick)\s+(recipe|meal|dish|food)\b/i],
    format: "food_detail"
  },
  "food_cuisine": {
    patterns: [/\b(italian|chinese|mexican|japanese|indian|french|thai|korean|greek|spanish|american|southern|mediterranean|middle\s+eastern|vietnamese|turkish|brazilian|caribbean|ethiopian|moroccan)\s+(food|cuisine|recipe|dish|cooking)\b/i, /\b(cuisine|gourmet|gastronomy|culinary|chef)\b/i],
    format: "food_detail"
  },
  "sports_general": {
    patterns: [/\b(sport|sports|athlete|athletic|championship|tournament|match|game|league|playoff|season|score|team|player|coach)\b/i, /\b(football|soccer|basketball|baseball|tennis|golf|cricket|rugby|hockey|volleyball|boxing|mma|wrestling|swimming|track|running|cycling|skiing|surfing|skateboarding|badminton|table\s+tennis|ping\s+pong|fencing|archery|weightlifting|gymnastics)\b/i],
    format: "sports_detail"
  },
  "sports_team": {
    patterns: [/\b(nfl|nba|mlb|nhl|epl|la\s+liga|serie\s+a|bundesliga|ligue\s+1|ufc|f1|formula\s+one|premier\s+league|champions\s+league|world\s+cup|olympics|super\s+bowl|world\s+series|stanley\s+cup|fifa|uefa)\b/i, /\bwho\s+(won|lost|plays|played|coaches|coached|manages|managed)\b.*\b(game|match|tournament|championship|league|cup)\b/i],
    format: "sports_detail"
  },
  "tech_general": {
    patterns: [/\b(technology|tech|digital|innovative|innovation|gadget|device|electronic|hardware|software|system|platform|application|app)\b/i, /\b(computer|laptop|desktop|tablet|phone|smartphone|iphone|android|windows|mac|linux|server|cloud|database)\b/i],
    format: "tech_detail"
  },
  "tech_programming": {
    patterns: [/\b(programming|coding|software\s+development|web\s+development|app\s+development|frontend|backend|full.?stack|devops|api|microservices|architecture|framework|library|ide|compiler|interpreter)\b/i, /\b(ai|machine\s+learning|deep\s+learning|neural\s+network|data\s+science|blockchain|cryptocurrency|cybersecurity|vr|ar|iot|robotics|automation|quantum\s+computing)\b/i],
    format: "tech_detail"
  },
  "tech_help": {
    patterns: [/\b(tech\s+support|technical\s+(support|issue|problem|help|question)|it\s+(support|help|issue))\b/i, /\b(how\s+to\s+(install|setup|configure|update|upgrade|fix|repair|troubleshoot|uninstall|reinstall))\b/i],
    format: "tech_detail"
  },
  "business_general": {
    patterns: [/\b(business|company|corporation|enterprise|firm|organization|startup|venture|entrepreneur|entrepreneurship)\b/i, /\b(market|marketing|sales|revenue|profit|loss|investment|investor|funding|capital|share|stock|equity|valuation|acquisition|merger|ipo)\b/i],
    format: "business_detail"
  },
  "business_management": {
    patterns: [/\b(management|leadership|strategy|planning|operations|logistics|supply\s+chain|hr|human\s+resources|hiring|recruitment|team\s+building|productivity|efficiency)\b/i, /\b(business\s+(plan|model|strategy|idea|development|growth|analysis|consulting|advice|tips))\b/i],
    format: "business_detail"
  },
  "education_school": {
    patterns: [/\b(school|college|university|academy|institute|seminary|polytechnic|faculty|department|program|campus|degree|major|minor|course|class|subject|lesson|curriculum|syllabus)\b/i, /\b(student|teacher|professor|instructor|educator|tutor|lecturer|academic|scholar|researcher|dean|principal|headmaster)\b/i],
    format: "educational_detail"
  },
  "education_study": {
    patterns: [/\b(study|learn|education|educate|knowledge|research|thesis|dissertation|paper|publication|journal|textbook|reference|citation|bibliography)\b/i, /\b(exam|test|quiz|assignment|homework|project|presentation|grade|score|gpa|scholarship|fellowship|internship)\b/i],
    format: "educational_detail"
  },
  "philosophy_meaning": {
    patterns: [/\b(meaning\s+of\s+life|purpose\s+of\s+existence|why\s+are\s+we\s+here|what\s+is\s+the\s+meaning)\b/i, /\b(philosophy|philosophical|philosopher|existence|consciousness|reality|perception|truth|knowledge|ethics|morality|logic|reason|metaphysics|epistemology|aesthetics)\b/i],
    format: "philosophical_reflection"
  },
  "philosophy_question": {
    patterns: [/\b(what\s+is\s+the\s+(nature|essence|purpose|meaning|value))\s+of\b/i, /\b(free\s+will|determinism|existentialism|stoicism|nihilism|absurdism|utilitarianism|deontology|virtue\s+ethics|hedonism|skepticism|pragmatism|idealism|materialism|dualism)\b/i],
    format: "philosophical_reflection"
  },
  "philosophy_thinker": {
    patterns: [/\b(socrates|plato|aristotle|kant|nietzsche|descartes|locke|hume|rousseau|hegel|marx|wittgenstein|heidegger|sartre|camus|confucius|lao\s+tzu|buddha|spinoza|hobbes)\b/i],
    format: "philosophical_reflection"
  },
  "joke_tell": {
    patterns: [/\b(tell|make|crack|share|give)\s+(me\s+)?(a\s+|an\s+|some\s+)?(joke|jokes|funny\s+story)\b/i, /\b(you\s+know\s+any|got\s+any|have\s+any|know\s+any)\s+(jokes?|funny\s+(ones?|stories?))\b/i],
    format: "joke_response"
  },
  "joke_funny": {
    patterns: [/\b(joke|jokes|funny|humor|hilarious|laugh|comedy|comedian|humorous|pun|one.?liner|wisecrack)\b/i, /\b(say\s+something|tell\s+me)\s+(funny|hilarious|humorous|a\s+joke)\b/i],
    format: "joke_response"
  },
  "riddle_ask": {
    patterns: [/\b(riddle|riddle\s+me\s+this|give\s+me\s+a\s+riddle|tell\s+me\s+a\s+riddle|brain\s+teaser|puzzle)\b/i, /\b(what['']?s?|got\s+a|have\s+a|know\s+a)\s+(good\s+)?(riddle|puzzle|brain\s+teaser)\b/i],
    format: "riddle_response"
  },
  "fact_tell": {
    patterns: [/\b(tell\s+me|share|give\s+me|know\s+any)\s+(a\s+|an\s+|some\s+|an\s+interesting\s+)?(fact|facts|trivia|fun\s+fact)\b/i, /\b(did\s+you\s+know|fun\s+fact|interesting\s+fact|random\s+fact|cool\s+fact|fascinating\s+fact)\b/i],
    format: "fact_response"
  },
  "fact_interesting": {
    patterns: [/\b(what['']?s?|tell\s+me)\s+(interesting|fascinating|cool|amazing|mind.?blowing)\s+(fact|facts|trivia)\b/i, /\b(factoid|trivia|did\s+u\s+know|didnt\s+know)\b/i],
    format: "fact_response"
  },
  "compliment_you": {
    patterns: [/\b(you['']?re?)\s+(so\s+|very\s+|really\s+|quite\s+)?(beautiful|pretty|cute|handsome|gorgeous|lovely|charming|attractive|amazing|awesome|fantastic|wonderful|incredible|phenomenal|remarkable|best|great)\b/i, /\b(i\s+(like|love|adore|appreciate)\s+(you|your\s+(help|assistance|response|answer|style|knowledge)))\b/i],
    format: "gracious_response"
  },
  "compliment_like": {
    patterns: [/\byou\s+are\s+(the\s+)?(best|greatest|most\s+amazing|most\s+helpful|most\s+intelligent)\b/i, /\bi\s+really\s+(like|love|enjoy|appreciate)\s+(you|talking\s+to\s+you|chatting\s+with\s+you|your\s+responses)\b/i],
    format: "gracious_response"
  },
  "bored_statement": {
    patterns: [/\bi['']?m?\s+(so\s+|really\s+|very\s+|kinda\s+|sorta\s+)?(bored|boring)\b/i, /\bi\s+(have\s+nothing|don'?t\s+have\s+anything)\s+to\s+do\b/i, /\b(entertain|amuse|distract)\s+me\b/i],
    format: "fun_suggestions"
  },
  "bored_entertain": {
    patterns: [/\b(what\s+(can|should)\s+I\s+(do|play|watch|try|read))\s+(to\s+)?(pass\s+the\s+time|kill\s+time|have\s+fun|be\s+entertained)\b/i, /\b(i['']?m?\s+so\s+bored|i['']?m?\s+bored\s+out\s+of\s+my\s+mind)\b/i],
    format: "fun_suggestions"
  },
  "sad_statement": {
    patterns: [/\b(i['']?m?\s+|i\s+am\s+|feeling\s+)(so\s+|very\s+|really\s+|quite\s+|a\s+bit\s+|a\s+little\s+)?(sad|depressed|unhappy|down|blue|melancholy|lonely|alone|heartbroken|broken|devastated|miserable|gloomy|hopeless|low)\b/i, /\b(i\s+had\s+a\s+(bad|rough|tough|hard|difficult|terrible|awful)\s+(day|week|time|experience))\b/i],
    format: "empathetic_comforting"
  },
  "sad_support": {
    patterns: [/\b(i\s+(feel|am|have\s+been))\s+(so\s+|very\s+|really\s+)?(lonely|alone|isolated|forgotten|ignored|neglected|unloved|worthless|hopeless)\b/i, /\b(no\s+one\s+(cares|loves|understands)|everyone\s+hates\s+me|i\s+hate\s+(my\s+)?(life|myself|everything))\b/i],
    format: "empathetic_comforting"
  },
  "sad_empathy": {
    patterns: [/\b(i['']?m?\s+(going\s+through|dealing\s+with)\s+(a\s+)?(tough|hard|difficult|rough|challenging)\s+(time|period|phase|situation))\b/i, /\b(can\s+you\s+(cheer|help)\s+me\s+(up|feel\s+better))\b/i],
    format: "empathetic_comforting"
  },
  "happy_statement": {
    patterns: [/\b(i['']?m?\s+|i\s+am\s+|feeling\s+)(so\s+|very\s+|really\s+|quite\s+)?(happy|excited|thrilled|delighted|ecstatic|elated|joyful|cheerful|content|glad|pleased|grateful|thankful|blessed|overjoyed)\b/i, /\b(great\s+news|good\s+news|wonderful\s+news|amazing\s+news|fantastic\s+news)\b/i],
    format: "energetic_cheerful"
  },
  "happy_celebrate": {
    patterns: [/\b(i\s+(got|received|had|did|achieved|accomplished|passed|won))|my\s+(day|week|life|mood)\s+(is\s+(so\s+)?(great|amazing|wonderful|fantastic|perfect))\b/i, /\b(what\s+a\s+(great|wonderful|beautiful|amazing|fantastic)\s+(day|news|feeling|experience|time))\b/i],
    format: "energetic_cheerful"
  },
  "agree_yes": {
    patterns: [/\b(i\s+agree|you['']?re?\s+right|that['']?s?\s+true|that['']?s?\s+correct|exactly|precisely|indeed|absolutely|certainly|definitely|undoubtedly|without\s+a\s+doubt|i\s+second\s+that)\b/i, /\b(you\s+are\s+(right|correct|spot\s+on|on\s+point|absolutely\s+right)|that['']?s?\s+(right|correct|true|accurate|exactly\s+right))\b/i],
    format: "affirmative_compact"
  },
  "agree_emphatic": {
    patterns: [/\b(yeah|yep|yup|sure|ok|okay|alright|fine|totally|100%|for\s+sure|no\s+doubt|you\s+bet|of\s+course|by\s+all\s+means)\b/i, /\bi\s+think\s+(so|you['']?re?\s+right|that['']?s?\s+correct|that['']?s?\s+true)\b/i],
    format: "affirmative_compact"
  },
  "disagree_no": {
    patterns: [/\b(i\s+disagree|you['']?re?\s+wrong|that['']?s?\s+(wrong|incorrect|false|not\s+true|not\s+right|mistaken|inaccurate))\b/i, /\b(i\s+don'?t\s+think\s+(so|that['']?s?\s+right|that['']?s?\s+true|you['']?re?\s+correct)|i\s+don'?t\s+(agree|concur))\b/i],
    format: "respectful_counter"
  },
  "disagree_polite": {
    patterns: [/\b(i\s+see\s+it\s+differently|i\s+have\s+a\s+different\s+(view|opinion|take|perspective)|respectfully|with\s+all\s+due\s+respect)\b/i, /\b(actually|frankly|honestly|to\s+be\s+honest|to\s+be\s+fair)\s+\w{2,10}\s+(that['']?s?\s+not|i\s+don'?t|i\s+disagree|i\s+think)\b/i],
    format: "respectful_counter"
  },
  "confused_general": {
    patterns: [/\b(i\s+don'?t\s+understand|i\s+dont\s+understand|i\s+do\s+not\s+understand|i['']?m?\s+confused|i['']?m?\s+lost|i['']?m?\s+perplexed|i['']?m?\s+bewildered|i['']?m?\s+baffled|i['']?m?\s+puzzled)\b/i, /\b(i\s+don'?t\s+get\s+(it|this|that|what\s+you\s+mean)|i\s+dont\s+get\s+(it|this|that))\b/i],
    format: "patient_explainer"
  },
  "confused_what": {
    patterns: [/\b(what\s+(does|do)\s+(that|this|it)\s+mean|what\s+do\s+you\s+mean)\b/i, /\b(this\s+is\s+(so\s+|very\s+|too\s+|quite\s+)?(confusing|complex|complicated|difficult|hard\s+to\s+understand))\b/i],
    format: "patient_explainer"
  },
  "confused_rephrase": {
    patterns: [/\b(can\s+you\s+(rephrase|explain\s+again|clarify|simplify|break\s+it\s+down))\b/i, /\b(i['']?m?\s+(struggling|having\s+trouble|having\s+difficulty)\s+(to\s+understand|understanding|grasping|following))\b/i],
    format: "patient_explainer"
  },
  "curious_wonder": {
    patterns: [/\b(i\s+wonder|i['']?m?\s+curious|i['']?m?\s+interested|i['']?m?\s+fascinated)\s+(about|by|to\s+know|what|why|how|if|whether)\b/i, /\b(what\s+would\s+happen|i\s+wonder\s+what|i\s+wonder\s+why|i\s+wonder\s+how)\b/i],
    format: "curious_detailed"
  },
  "curious_question": {
    patterns: [/\b(out\s+of\s+curiosity|just\s+curious|purely\s+curious|being\s+curious|curious\s+mind)\b/i, /\b(has\s+anyone\s+ever|is\s+it\s+possible|could\s+it\s+be\s+that)\b/i],
    format: "curious_detailed"
  },
  "urgent_emergent": {
    patterns: [/\b(urgent|urgency|asap|as\s+soon\s+as\s+possible|emergency|critical|crucial|vital|imperative|pressing|immediate|immediately|right\s+away|quickly|hurry)\b/i, /\b(i\s+need\s+(help|an\s+answer|assistance|a\s+response|info)\s+(fast|quick|urgently|immediately|now|asap))\b/i],
    format: "direct_concise"
  },
  "urgent_quick": {
    patterns: [/\b(quick\s+question|quick\s+help|fast\s+answer|need\s+this\s+fast|short\s+notice)\b/i, /\b(time\s+(is|sensitive|critical|crucial|of\s+the\s+essence)|running\s+out\s+of\s+time)\b/i],
    format: "direct_concise"
  },
  "simple_yesno": {
    patterns: [/\b^(yes|no|maybe|sure|ok|okay|alright|yep|yup|nah|nope|yeah|yah|k|kk|yep|nope|mhm|uhuh|mmhmm)$/i, /\b(just\s+(yes|no|maybe)|say\s+(yes|no|maybe)|answer\s+(yes|no))\b/i],
    format: "minimal_response"
  },
  "follow_up_and": {
    patterns: [/\b^(and|so|then|but|or|\?)$/i, /\b(tell\s+me\s+more|go\s+on|continue|proceed|carry\s+on|keep\s+going|what\s+else)\b/i],
    format: "follow_up_continuous"
  },
  "follow_up_more": {
    patterns: [/\b(and\s+then|and\s+so|but\s+then|what\s+happens?\s+next|how\s+does\s+it\s+end)\b/i, /\b(is\s+there\s+more|anything\s+else|more\s+details?|more\s+info|more\s+on\s+that)\b/i],
    format: "follow_up_continuous"
  },
  "advice_what_do": {
    patterns: [/\b(what\s+(should|can|do)\s+I\s+(do|say|tell|choose|pick|decide|think|feel))\b/i, /\b(advice|advise|guidance|counsel|recommendation|suggestion|tip)\s+(for|on|about|regarding)\b/i],
    format: "advice_balanced"
  },
  "advice_situation": {
    patterns: [/\b(i\s+don'?t\s+know\s+(what\s+to|how\s+to|whether\s+to)|i\s+can'?t\s+decide|i['']?m?\s+torn\s+between|i['']?m?\s+stuck)\b/i, /\b(what\s+would\s+you\s+(do|recommend|suggest)\s+(if|in|for|when))\b/i],
    format: "advice_balanced"
  },
  "pros_cons_analysis": {
    patterns: [/\b(pros\s+and\s+cons|advantages\s+and\s+disadvantages|benefits\s+and\s+drawbacks|strengths\s+and\s+weaknesses|positives\s+and\s+negatives|pros\s+&\s+cons)\b/i, /\b(weigh\s+(the\s+)?(pros|options|alternatives)|compare\s+(the\s+)?(pros|advantages|benefits))\b/i],
    format: "pros_cons_table"
  },
  "pros_cons_simple": {
    patterns: [/\bwhat\s+(are|were|is)\s+(the\s+)?(pros\s+and\s+cons|advantages\s+and\s+disadvantages|benefits\s+and\s+drawbacks|good\s+and\s+bad)\s+of\b/i, /\b(should\s+I|is\s+it\s+(worth|a\s+good\s+idea))\b.*\b(or\b)/i],
    format: "pros_cons_table"
  },
  "reason_why": {
    patterns: [/\b(why|how\s+come|for\s+what\s+reason|what['']?s?\s+the\s+reason|what['']?s?\s+the\s+cause|what['']?s?\s+the\s+purpose|what['']?s?\s+the\s+point)\b/i, /\b(what\s+makes|what\s+causes|what\s+leads\s+to|what\s+triggers|what\s+prompts)\b/i],
    format: "reasoned_explanation"
  },
  "reason_explain_why": {
    patterns: [/\bcould\s+you\s+(explain|tell\s+me)\s+why\b/i, /\bwhat['']?s?\s+the\s+(logic|rationale|thinking|reasoning)\s+(behind|for|of)\b/i],
    format: "reasoned_explanation"
  },
  "example_give": {
    patterns: [/\b(give\s+me|show\s+me|provide|need)\s+(a\s+|an\s+|some\s+)?(example|examples|instance|illustration|sample|case\s+study)\s+(of|for|about|on|regarding)\b/i, /\b(can\s+you\s+(give|show|provide)\s+(me\s+)?(a\s+|an\s+|some\s+)?(example|examples))\b/i],
    format: "example_rich"
  },
  "example_for_example": {
    patterns: [/\b(for\s+example|for\s+instance|e\.g\.|such\s+as|like\s+for)\b/i, /\b(could\s+you\s+give|can\s+you\s+give|would\s+you\s+give)\s+(me\s+)?(a\s+|an\s+|some\s+)?(concrete|specific|real.?world)\s+(example|examples)\b/i],
    format: "example_rich"
  },
  "predict_future": {
    patterns: [/\b(predict|prediction|forecast|future|what\s+will\s+happen|what\s+would\s+happen|what['']?s?\s+going\s+to\s+happen|what\s+lies\s+ahead|what['']?s?\s+in\s+store)\b/i, /\b(how\s+do\s+you\s+see\s+(the\s+)?future|what\s+are\s+your\s+predictions?|what\s+do\s+you\s+predict)\b/i],
    format: "prediction_balanced"
  },
  "predict_trend": {
    patterns: [/\b(trend|outlook|projection|prospect|scenario|trajectory|direction)\s+(for|of|in|over)\b/i, /\b(what['']?s?\s+next|what['']?s?\s+coming|where\s+is|where\s+are)\s+\w+\s+(headed|going|heading)\b/i],
    format: "prediction_balanced"
  },
  "challenge_test": {
    patterns: [/\b(challenge|test|quiz)\s+me\b/i, /\b(bring\s+it\s+on|game\s+on|let['']?s?\s+(go|do\s+this|see\s+what\s+you['']?ve?\s+got))\b/i],
    format: "challenge_accepted"
  },
  "challenge_brain": {
    patterns: [/\b(brain\s+teaser|mental\s+challenge|puzzle|logic\s+puzzle|math\s+problem|riddle\s+me)\b/i, /\b(impress\s+me|blow\s+my\s+mind|surprise\s+me|show\s+me\s+what\s+you['']?ve?\s+got|give\s+me\s+your\s+best\s+shot)\b/i],
    format: "challenge_accepted"
  },
  "repeat_again": {
    patterns: [/\b(repeat|say\s+(that\s+)?again|could\s+you\s+repeat|can\s+you\s+repeat|what\s+did\s+you\s+say)\b/i, /\b(i\s+(didn'?t|didnt|did\s+not)\s+(catch|hear|get|understand)\s+(that|you|what\s+you\s+said))\b/i],
    format: "repeat_response"
  },
  "repeat_once_more": {
    patterns: [/\b(once\s+more|one\s+more\s+time|again\s+please|pardon|excuse\s+me)\b/i, /\b(can\s+you\s+(say|tell)\s+(that\s+)?(again|one\s+more\s+time))\b/i],
    format: "repeat_response"
  },
  "language_teach": {
    patterns: [/\b(teach|learn|help\s+(me\s+)?(with|learn|study|practice))\s+(me\s+)?(french|spanish|german|italian|portuguese|russian|japanese|chinese|korean|arabic|hindi|dutch|polish|swedish|norwegian|danish|finnish|turkish|greek|czech|romanian|hungarian|hebrew|thai|vietnamese|indonesian|malay|latin|\w{3,}\s+language)\b/i, /\b(i\s+(want|would\s+like)\s+to\s+(learn|study|practice|improve)\s+(my\s+)?(\w+(\s+language)?))\b/i],
    format: "language_lesson"
  },
  "language_help": {
    patterns: [/\b(language|languages|linguistics|vocabulary|grammar|pronunciation|conjugation|declension|syntax|phrases|expressions)\s+(help|lesson|tutorial|guide|class|course|learning|practice)\b/i, /\b(how\s+(do\s+I|to)\s+(say|write|pronounce|spell|conjugate|decline))\s+\w+\s+(in\s+)?(\w+)\b/i],
    format: "language_lesson"
  },
  "career_advice_general": {
    patterns: [/\b(career|job|profession|occupation|vocation|work|employment)\s+(advice|recommend|suggest|guidance|tip|change|switch|advancement|growth|path|opportunity)\b/i, /\b(what\s+job|what\s+career|what\s+profession)\s+(should|would|can|do)\s+(i|you\s+recommend)\b/i],
    format: "career_advice"
  },
  "career_resume": {
    patterns: [/\b(resume|cv|curriculum\s+vitae|cover\s+letter|portfolio|application)\s+(help|tip|advice|review|format|build|create|write|improve|optimize)\b/i, /\b(interview|job\s+offer|salary|negotiation|promotion|raise|bonus|benefits)\s+(advice|tip|help|question|preparation|strategy)\b/i],
    format: "career_advice"
  },
  "career_path": {
    patterns: [/\b(what\s+field|what\s+industry|what\s+sector)\s+(should|would)\s+i\s+(go\s+into|pursue|work\s+in|consider)\b/i, /\b(career\s+path|job\s+market|industry\s+trend|professional\s+development|skill\s+development|networking)\b/i],
    format: "career_advice"
  },
  "relationship_general": {
    patterns: [/\b(relationship|boyfriend|girlfriend|partner|spouse|husband|wife|significant\s+other|soulmate|date|dating|romance|romantic|love|crush)\s+(advice|help|question|problem|issue|tip|guidance)\b/i, /\b(how\s+(do|can)\s+i\s+(tell|ask|approach|talk|communicate|express|confess|impress))\s+(my\s+)?(crush|boyfriend|girlfriend|partner|love\s+interest|date)\b/i],
    format: "relationship_advice"
  },
  "relationship_issue": {
    patterns: [/\b(relationship\s+(problem|issue|conflict|argument|fight|struggle|difficulty|challenge)|we\s+(fought|argued|disagreed|broke\s+up|drifted\s+apart))\b/i, /\b(break\s+up|divorce|separation|cheating|lying|trust\s+issue|commitment|jealousy|insecure)\s+(advice|help|deal\s+with|cope|handle)\b/i],
    format: "relationship_advice"
  },
  "finance_money": {
    patterns: [/\b(money|finance|financial|budget|saving|savings|invest|investment|stock|stocks|bond|bonds|mutual\s+fund|etf|index\s+fund|retirement|401k|ira|roth)\b/i, /\b(how\s+(do|can|to)\s+(save|invest|budget|manage|plan|grow|protect)\s+(my\s+)?(money|finances|wealth|savings|portfolio))\b/i],
    format: "financial_advice"
  },
  "finance_debt": {
    patterns: [/\b(debt|loan|mortgage|credit\s+card|interest\s+rate|apr|credit\s+score|borrow|lend|refinance|consolidate|bankrupt|foreclosure)\b/i, /\b(tax|taxes|filing|deduction|credit|refund|w4|1040|irs|write.?off)\s+(advice|help|question|tip|guide)\b/i],
    format: "financial_advice"
  },
  "legal_general": {
    patterns: [/\b(legal|law|lawsuit|attorney|lawyer|sue|suing|plaintiff|defendant|court|judge|jury|trial|appeal|verdict|settlement|litigation|legal\s+advice|legal\s+question)\b/i, /\b(contract|agreement|terms|conditions|disclaimer|waiver|liability|indemnity|arbitration|mediation|notary|affidavit|deposition|testimony)\b/i],
    format: "legal_disclaimer"
  },
  "legal_issue": {
    patterns: [/\b(tenant|landlord|rental|lease|eviction|housing|property|real\s+estate)\s+(law|legal|right|dispute|issue)\b/i, /\b(employment\s+(law|contract|agreement|dispute)|wrongful\s+termination|discrimination|harassment|wage|overtime|nlrb|eeoc)\b/i],
    format: "legal_disclaimer"
  },
  "legal_immigration": {
    patterns: [/\b(immigration|visa|green\s+card|citizen|citizenship|naturalization|deportation|asylum|refugee|work\s+permit|h1b|f1|opt|cpt)\b/i],
    format: "legal_disclaimer"
  },
  "writing_help": {
    patterns: [/\b(writing|write|edit|proofread|revise|rewrite|draft|compose|author|publish|publishing|manuscript|article|blog|essay|report|paper|thesis|book|novel|story|content|copy)\s+(help|assist|tip|guide|advice|service|support|assistance)\b/i, /\b(how\s+(do|can|to)\s+(write|improve|edit|format|structure|outline|organize|develop|polish|publish))\s+(a\s+|an\s+|my\s+)?(book|novel|essay|article|blog|story|paper|report|script|manuscript)\b/i],
    format: "writing_assistance"
  },
  "writing_style": {
    patterns: [/\b(writing\s+(style|voice|tone|technique|skill|craft)|creative\s+writing|academic\s+writing|technical\s+writing|copywriting|content\s+writing|business\s+writing)\b/i, /\b(grammar|spelling|punctuation|syntax|vocabulary|word\s+choice|sentence\s+structure|paragraph|transition|flow|readability|clarity|conciseness)\b/i],
    format: "writing_assistance"
  },
  "fitness_exercise": {
    patterns: [/\b(exercise|workout|gym|fitness|training|cardio|strength|weightlifting|bodybuilding|calisthenics|hiit|pilates|yoga|stretching|flexibility|endurance|stamina)\b/i, /\b(how\s+(do|can|to)\s+(exercise|work\s+out|train|lift|build\s+muscle|lose\s+weight|gain\s+weight|get\s+fit|get\s+in\s+shape|tone\s+up|bulk\s+up|cut|shred))\b/i],
    format: "fitness_guide"
  },
  "fitness_routine": {
    patterns: [/\b(routine|plan|program|schedule|regimen|split|circuit|session|reps|sets|volume|intensity|frequency|progression|overload|recovery|rest\s+day)\b/i, /\b(workout\s+(routine|plan|split|program|schedule)|exercise\s+(routine|plan|program)|training\s+(plan|program|routine|schedule))\b/i],
    format: "fitness_guide"
  },
  "productivity_tips": {
    patterns: [/\b(productivity|productive|efficiency|efficient|effectiveness|effective|time\s+management|focus|concentration|discipline|procrastination|motivation|habit|routine|system|workflow|optimization)\b/i, /\b(how\s+(do|can|to)\s+(be\s+more|become\s+more|improve|increase|boost|maximize|optimize)\s+(productive|productivity|efficiency|focus|efficient))\b/i],
    format: "productivity_advice"
  },
  "productivity_tech": {
    patterns: [/\b(pomodoro|time\s+blocking|deep\s+work|getting\s+things\s+done|gtd|kanban|scrum|agile|bullet\s+journal|habit\s+tracker|to.?do\s+list|task\s+list|priority|matrix|eisenhower)\b/i, /\b(how\s+(do|can|to)\s+(stop|avoid|overcome|beat|conquer|manage)\s+(procrastination|distraction|delay|slacking|wasting\s+time))\b/i],
    format: "productivity_advice"
  },
  "cooking_how": {
    patterns: [/\b(cooking|cook|recipe|bake|baking|grill|grilling|roast|roasting|saute|fry|frying|steam|steaming|boil|boiling|braise|braising|poach|poaching|broil|broiling|simmer|slow.?cook|pressure\s+cook|air\s+fry|knead|dough|pastry|sauce|gravy|marinade|seasoning|spice|herb)\b/i, /\b(how\s+(do|can|to)\s+(cook|bake|make|prepare|grill|roast|saute|fry|steam|boil|simmer|braise|poach|broil|roast|season|marinate)\s+\w+)\b/i],
    format: "cooking_guide"
  },
  "cooking_technique": {
    patterns: [/\b(cooking\s+(technique|method|style|tip|hack|skill)|kitchen\s+(tip|hack|tool|gadget|equipment|appliance)|culinary\s+(technique|skill|method))\b/i, /\b(what['']?s?\s+(a\s+|an\s+|the\s+)?(good|easy|simple|quick|healthy|delicious)\s+(recipe|meal|dish|dinner|breakfast|lunch|snack|dessert)\s+(for|to|that|with))\b/i],
    format: "cooking_guide"
  },
  "travel_advice": {
    patterns: [/\b(travel|trip|vacation|holiday|journey|tour|excursion|getaway|voyage|cruise|road\s+trip|backpack|backpacking|adventure|expedition)\b/i, /\b(where\s+(should|can|do)\s+(i|we)\s+(go|visit|travel|vacation|stay|explore))\b/i],
    format: "travel_detail"
  },
  "travel_destination": {
    patterns: [/\b(destination|place|spot|location|resort|city|country|island|beach|mountain|national\s+park|attraction|landmark|sight|sightseeing|tourist|travel\s+guide|travel\s+tip)\b/i, /\b(best\s+(time|season|place|spot|destination|hotel|hostel|restaurant|thing|activity))\s+(to\s+)?(visit|go|see|stay|eat|do)\b/i],
    format: "travel_detail"
  },
  "travel_tips": {
    patterns: [/\b(travel\s+(tip|hack|advice|guide|recommendation|suggestion|essentials|packing|budget|insurance|document))\b/i, /\b(flight|plane|airport|airline|hotel|hostel|bnb|airbnb|booking|reservation|itinerary|passport|visa)\b/i],
    format: "travel_detail"
  },
  "environment_general": {
    patterns: [/\b(environment|environmental|climate|climate\s+change|global\s+warming|greenhouse|emission|carbon|footprint|pollution|sustainability|sustainable|renewable|ecology|ecological|ecosystem|conservation|biodiversity)\b/i, /\b(recycle|recycling|reuse|reduce|compost|biodegradable|zero\s+waste|plastic|single.?use|waste|garbage|trash|landfill)\b/i],
    format: "environmental_context"
  },
  "environment_action": {
    patterns: [/\b(how\s+(do|can|to)\s+(help|protect|save|preserve|conserve|reduce|fight\s+against)\s+(the\s+)?(environment|planet|earth|nature|climate|ecosystem))\b/i, /\b(green\s+(energy|living|initiative|technology|solution)|clean\s+(energy|power|technology)|solar|wind|hydro|geothermal|biomass|nuclear)\b/i],
    format: "environmental_context"
  },
  "politics_general": {
    patterns: [/\b(politics|political|government|governance|democracy|republic|election|campaign|candidate|vote|voter|party|republican|democrat|liberal|conservative|moderate|independent|parliament|congress|senate|house\s+of\s+representatives|senator|congressman|congresswoman|representative|governor|mayor|council)\b/i, /\b(policy|legislation|bill|law|regulation|executive\s+order|constitution|amendment|cabinet|administration|president|prime\s+minister|chancellor|king|queen|monarch|dictator|regime)\b/i],
    format: "political_neutral"
  },
  "politics_issue": {
    patterns: [/\b(foreign\s+policy|domestic\s+policy|economic\s+policy|social\s+policy|healthcare|immigration|education|defense|military|tax|trade|tariff|sanction|welfare|social\s+security|medicare|medicaid)\s+(policy|reform|debate|issue|law|bill)\b/i, /\b(political\s+(party|ideology|system|view|spectrum|landscape|climate|crisis|reform|movement)|geo.?politics|political\s+science)\b/i],
    format: "political_neutral"
  },
  "mental_health_general": {
    patterns: [/\b(mental\s+health|mental\s+illness|mental\s+wellbeing|emotional\s+health|psychological|psychiatrist|psychologist|therapist|counselor|counseling|therapy|psychiatry|psychology|psycho.?therapy|cbt|dbt|mindfulness|self.?care)\b/i, /\b(anxiety|anxious|depression|depressed|stress|stressed|ptsd|trauma|ocd|adhd|bipolar|borderline|schizophrenia|eating\s+disorder|addiction|substance\s+abuse|self.?harm|suicide)\b/i],
    format: "mental_health_care"
  },
  "mental_health_support": {
    patterns: [/\b(how\s+(do|can|to)\s+(cope|deal|manage|handle|overcome|reduce|alleviate)\s+(with\s+)?(anxiety|depression|stress|panic|trauma|grief|emotion|feeling|thought))\b/i, /\b(i\s+(feel|have\s+been|am)\s+(anxious|depressed|stressed|overwhelmed|burned\s+out|exhausted|panicking|worried|nervous|scared|fearful))\b/i],
    format: "mental_health_care"
  },
  "spirituality_general": {
    patterns: [/\b(spiritual|spirituality|spirit|soul|meditation|meditate|mindfulness|yoga|chakra|aura|energy|vibration|consciousness|awakening|enlightenment|transcendence|karma|dharma|nirvana|reincarnation|afterlife|heaven|hell)\b/i, /\b(astrology|horoscope|zodiac|tarot|psychic|intuition|divination|medium|channeling|past\s+life|soulmate|twin\s+flame)\b/i],
    format: "spiritual_reflective"
  },
  "spirituality_practice": {
    patterns: [/\b(how\s+(do|can|to)\s+(meditate|practice\s+mindfulness|find\s+inner\s+peace|connect\s+spiritually|awaken|enlighten|grow\s+spiritually|balance\s+chakras))\b/i, /\b(prayer|pray|faith|belief|believer|worship|religious|religion|buddhist|hindu|muslim|christian|jewish|jain|sikh|taoist|shinto|pagan|wiccan|atheist|agnostic)\b/i],
    format: "spiritual_reflective"
  },
  "parenting_general": {
    patterns: [/\b(parenting|parenthood|parent|mother|father|mom|dad|mama|papa|mommy|daddy|guardian|caregiver)\b/i, /\b(baby|infant|toddler|newborn|child|kid|teen|teenager|adolescent|son|daughter|child|children|offspring|sibling|brother|sister)\b/i],
    format: "parenting_advice"
  },
  "parenting_issue": {
    patterns: [/\b(how\s+(do|can|to)\s+(raise|discipline|teach|guide|support|encourage|understand|communicate\s+with|connect\s+with)\s+(a\s+|an\s+|my\s+|your\s+)?(child|baby|toddler|kid|teen|teenager|adolescent|son|daughter))\b/i, /\b(parenting\s+(tip|advice|strategy|challenge|struggle|issue|problem|win|hack|skill)|child.?rearing|childhood\s+(development|psychology|education))\b/i],
    format: "parenting_advice"
  },
  "pets_general": {
    patterns: [/\b(pet|pets|dog|cat|puppy|kitten|bird|fish|hamster|guinea\s+pig|rabbit|ferret|lizard|snake|turtle|parrot|horse|pony|farm\s+animal|livestock)\b/i, /\b(pet\s+(care|health|food|supply|toy|training|behavior|grooming|adoption|rescue|sitter|walker|insurance))\b/i],
    format: "pet_care"
  },
  "pets_care": {
    patterns: [/\b(how\s+(do|can|to)\s+(take\s+care\s+of|train|feed|groom|bathe|walk|exercise|play\s+with|care\s+for)\s+(a\s+|an\s+|my\s+|your\s+)?(dog|cat|puppy|kitten|pet|bird|fish|hamster))\b/i, /\b(vet|veterinary|vaccinate|vaccination|spay|neuter|microchip|adopt|adoption|foster|rescue|shelter|breeder|pet\s+shop)\b/i],
    format: "pet_care"
  },
  "gaming_general": {
    patterns: [/\b(gaming|game|games|gamer|gaming\s+community|video\s+game|pc\s+game|console\s+game|mobile\s+game|rpg|fps|mmo|mmorpg|battle\s+royale|open\s+world|sandbox|strategy|simulation|puzzle|racing|sports\s+game|fighting|shooter|horror|adventure|action|platformer|indie|triple.?a)\b/i, /\b(playstation|ps4|ps5|xbox|nintendo|switch|wii|ds|3ds|steam|epic|origin|battle\.net|ubisoft|ea|activision|blizzard|rockstar|bethesda|square\s+enix|capcom|namco|sega|valve|riot|epic\s+games|unity|unreal)\b/i],
    format: "gaming_detail"
  },
  "gaming_help": {
    patterns: [/\b(game\s+(tip|guide|walkthrough|tutorial|strategy|cheat|mod|save)|how\s+(do|can|to)\s+(beat|win|complete|unlock|find|defeat|pass)\s+\w+\s+(in|on|for)\b)/i, /\b(what\s+(game|games)\s+(should|do|can)\s+(i|you\s+recommend|you\s+suggest))\b/i],
    format: "gaming_detail"
  },
  "roast_me": {
    patterns: [/\b(roast|roast\s+me|insult|insult\s+me|burn|say\s+something\s+mean|be\s+mean\s+to\s+me|talk\s+smack|dish\s+it\s+out|hit\s+me\s+with)\b/i, /\b(who\s+do\s+you\s+think\s+you\s+are|you['']?re?\s+(not\s+(that\s+)?(smart|good|great|funny|helpful))|is\s+that\s+the\s+best\s+you\s+(can\s+do|got))\b/i],
    format: "playful_roast"
  },
  "quote_inspire": {
    patterns: [/\b(quote|quotes|famous\s+quote|inspirational\s+quote|motivational\s+quote|wise\s+words|words\s+of\s+wisdom|saying|proverb|maxim|aphorism|adage|motto|mantra)\b/i, /\b(give\s+me|tell\s+me|share|know)\s+(a\s+|an\s+|some\s+)?(quote|quotes|saying|words\s+of\s+wisdom)\b/i],
    format: "quote_response"
  },
  "news_latest": {
    patterns: [/\b(what['']?s?\s+(new|happening|going\s+on|the\s+latest|up\s+with\s+the\s+world)|what['']?s?\s+the\s+news|latest\s+news|breaking\s+news|current\s+events|headlines|top\s+stories)\b/i, /\b(news|headline|headlines|breaking|report|update|announcement)\s+(today|this\s+(morning|afternoon|evening|hour|week)|right\s+now|lately|recent)\b/i],
    format: "news_update"
  },
  "news_topic": {
    patterns: [/\b(what['']?s?\s+happening\s+(in|with)\s+\w+|any\s+(news|updates?)\s+(on|about|regarding)\s+\w+)\b/i, /\b(tell\s+me|give\s+me|share)\s+(the\s+|some\s+|today['']?s?\s+)?(news|headlines|current\s+events|updates?)\b/i],
    format: "news_update"
  },
  "dream_interpret": {
    patterns: [/\b(dream|dreams|nightmare|nightmares|dreaming|dreamt|dreamed|sleep\s+paralysis|lucid\s+dream|recurring\s+dream|dream\s+interpretation|dream\s+meaning|dream\s+analysis|dream\s+symbol)\b/i, /\b(i\s+dreamt|i\s+dreamed|i\s+had\s+a\s+(dream|nightmare)|i\s+keep\s+dreaming|in\s+my\s+dream)\b/i],
    format: "dream_analysis"
  },
  "dream_meaning": {
    patterns: [/\b(what\s+does\s+(my\s+)?(dream|nightmare)\s+mean|what\s+is\s+the\s+meaning\s+of\s+(my\s+)?(dream|nightmare)|what['']?s?\s+(my\s+)?(dream|nightmare)\s+(mean|trying\s+to\s+tell\s+me|about))\b/i, /\b(had\s+a\s+(weird|strange|scary|vivid|crazy|intense|recurring)\s+(dream|nightmare))\b/i],
    format: "dream_analysis"
  },
  "poetry_write": {
    patterns: [/\b(write|compose|create|make)\s+(a\s+|an\s+|me\s+a\s+)?(poem|poetry|verse|rhyme|sonnet|haiku|limerick|ode|elegy|ballad|epic|lyric|free\s+verse|prose\s+poem)\b/i, /\b(poem|poetry|poetic)\s+(about|for|on|of|to|dedicated)\s+\w+/i],
    format: "poetry_compose"
  },
  "song_write": {
    patterns: [/\b(write|compose|create|make)\s+(a\s+|an\s+|me\s+a\s+)?(song|lyrics|rap|rap\s+song|love\s+song|ballad|anthem|jingle|hymn|chorus|verse|hook|beat|track|music)\b/i, /\b(song\s+(lyrics|lyrics\s+about|about|for|dedicated\s+to)|lyrics\s+(for|about|to)\b)/i],
    format: "song_compose"
  },
  "affirmation_general": {
    patterns: [/\b(affirmation|affirmations|positive\s+affirmation|daily\s+affirmation|affirm|self.?love|self.?worth|self.?care|self.?compassion|self.?acceptance)\b/i, /\b(i\s+am|i['']?m?)\s+\w{3,}\s+(and\s+\w{3,}\s+)*\w{3,}\b/i],
    format: "affirmation_response"
  },
  "affirmation_need": {
    patterns: [/\b(give\s+me|share|need|tell\s+me)\s+(some\s+|an\s+|a\s+|positive\s+)?(affirmation|affirmations|self.?love|encouragement|positivity)\b/i, /\b(i\s+(need|want)\s+(some\s+|more\s+)?(self.?love|positivity|encouragement|affirmation))\b/i],
    format: "affirmation_response"
  },
  "motivation_general": {
    patterns: [/\b(motivate|motivation|motivational|inspire|inspiration|inspirational|pep\s+talk|encourage|encouragement|uplift|uplifting|empower|empowerment|hype\s+me\s+up|pump\s+me\s+up)\b/i, /\b(give\s+me|need|i\s+need)\s+(a\s+|an\s+|some\s+)?(pep\s+talk|motivation|inspiration|boost|push|kick|fire)\b/i],
    format: "motivational_speech"
  },
  "motivation_keep_going": {
    patterns: [/\b(i['']?m?\s+(giving\s+up|feeling\s+down|losing\s+hope|struggling|quitting)|i\s+can'?t\s+(do\s+this|keep\s+going|continue|go\s+on))\b/i, /\b(motivate\s+me|inspire\s+me|hype\s+me|pump\s+me\s+up|fire\s+me\s+up|get\s+me\s+pumped|get\s+me\s+hyped)\b/i],
    format: "motivational_speech"
  },
  "meditation_guide": {
    patterns: [/\b(meditation|meditate|guided\s+meditation|meditation\s+guide|meditation\s+session|meditation\s+practice|mindfulness|mindful|breathing\s+exercise|breathwork)\b/i, /\b(guide\s+me\s+(through|in|with)\s+(a\s+)?(meditation|mindfulness|breathing\s+exercise|relaxation))\b/i],
    format: "meditation_guide"
  },
  "meditation_relax": {
    patterns: [/\b(relax|relaxation|calm|calm\s+down|de.?stress|wind\s+down|unwind|destress|decompress|soothe|soothing|peaceful|tranquil|serene)\b/i, /\b(help\s+me\s+(relax|calm\s+down|unwind|de.?stress|destress|wind\s+down))\b/i],
    format: "meditation_guide"
  },
  "intro_name": {
    patterns: [/\b(my\s+name\s+is|i['']?m?\s+called|i['']?m?\s+|i\s+am\s+|call\s+me\s+|you\s+can\s+call\s+me\s+|they\s+call\s+me\s+|friends\s+call\s+me\s+)\w+/i, /\b(i\s+go\s+by|i\s+answer\s+to|i\s+respond\s+to|i\s+use\s+the\s+name)\b/i],
    format: "personal_greeting"
  },
  "rant_vent": {
    patterns: [/\b(need\s+to\s+(vent|rant|get\s+this\s+off\s+my\s+chest|let\s+it\s+out|talk\s+about\s+something)|i['']?m?\s+(so\s+|really\s+|very\s+)?(frustrated|angry|mad|irritated|annoyed|pissed|upset))\b/i, /\b(can\s+i\s+(vent|rant|talk\s+about\s+something|get\s+something\s+off\s+my\s+chest))\b/i],
    format: "listening_ear"
  },
  "rant_listen": {
    patterns: [/\b(just\s+need\s+someone\s+to\s+listen|need\s+(to\s+)?(vent|rant)\s+(for\s+a\s+bit|for\s+a\s+moment|real\s+quick|quickly))\b/i, /\b(i\s+have\s+(so\s+much|a\s+lot|something)\s+(to\s+)?(vent|rant|get\s+off\s+my\s+chest|say))\b/i],
    format: "listening_ear"
  },
  "nostalgia_general": {
    patterns: [/\b(remember\s+(when|that|the\s+good\s+old\s+days)|the\s+good\s+old\s+days|back\s+in\s+(the\s+day|high\s+school|college|the\s+90s|the\s+80s|the\s+70s)|nostalgia|nostalgic|childhood\s+(memory|memories|days))\b/i, /\b(i\s+(remember|miss|used\s+to)\s+(play|watch|love|enjoy|do|go|have)\b.*\b(when\s+I|as\s+a\s+child|as\s+a\s+kid|growing\s+up|back\s+then))\b/i],
    format: "nostalgic_engaging"
  },
  "decision_help": {
    patterns: [/\b(should\s+I|i\s+can'?t\s+decide|help\s+me\s+(decide|choose|pick)|i['']?m?\s+(torn|split|undecided|uncertain|on\s+the\s+fence|up\s+in\s+the\s+air))\b/i, /\b(what\s+(should|would|do)\s+you\s+(recommend|suggest|advise|think)\s+(i\s+)?(do|choose|pick|decide|say|go\s+with))\b/i],
    format: "decision_helper"
  },
  "decision_options": {
    patterns: [/\b(between\s+\w+\s+(and|or)\s+\w+|choose\s+(between|among)\s+\w+\s+(and|or)\s+\w+|pick\s+(between|among))\b/i, /\b(option\s+(a|1|one|b|2|two|c|3|three)|either|neither|whether\s+to)\b/i],
    format: "decision_helper"
  },
  "knock_knock": {
    patterns: [/\bknock\s+knock\b/i, /\bknock\s+knock\s+joke\b/i],
    format: "knock_knock"
  },
  "homework_help": {
    patterns: [/\b(homework|assignment|homework\s+help|assignment\s+help|study\s+help|homework\s+question|assignment\s+question)\b/i, /\b(can\s+you\s+(help\s+(me\s+)?with|do|solve|answer)\s+(my\s+)?(homework|assignment|worksheet|problem\s+set))\b/i],
    format: "homework_help"
  },
  "fun_facts_multi": {
    patterns: [/\b(tell\s+me|give\s+me|share)\s+(some\s+|a\s+couple\s+of\s+|a\s+few\s+|multiple\s+|several\s+|three\s+|five\s+|ten\s+)?(fun\s+facts|interesting\s+facts|facts|factoids|trivia)\b/i, /\b(list|enumerate|name)\s+(some\s+|a\s+couple\s+of\s+|a\s+few\s+|multiple\s+|several\s+)?(fun\s+facts|interesting\s+facts|facts|trivia)\b/i],
    format: "multi_facts"
  },
  "would_you_rather": {
    patterns: [/\b(would\s+you\s+rather|wyr)\b/i],
    format: "would_you_rather_game"
  },
  "never_have_i_ever": {
    patterns: [/\b(never\s+have\s+i\s+ever|nhie)\b/i],
    format: "never_have_i_ever_game"
  },
  "trivia_quiz_me": {
    patterns: [/\b(quiz\s+me|trivia|test\s+my\s+knowledge|ask\s+me\s+(a\s+)?(trivia|quiz|question)|give\s+me\s+(a\s+)?(trivia|quiz))\b/i, /\b(how\s+much\s+do\s+you\s+know\s+about|what\s+do\s+you\s+know\s+about)\b/i],
    format: "trivia_quiz_question"
  },
  "congrats_general": {
    patterns: [/\b(congratulations|congrats|congratulate|well\s+done|great\s+job|good\s+job|nice\s+work|way\s+to\s+go|bravo|kudos|props|hats?\s+off|cheers)\b/i, /\b(i\s+(did\s+it|made\s+it|passed|won|achieved|accomplished|succeeded|graduated|got\s+the\s+job|got\s+promoted))\b/i],
    format: "celebratory"
  },
  "analysis_general": {
    patterns: [/\b(analyze|analyse|analysis|evaluate|evaluation|examine|examination|assess|assessment|appraise|appraisal|critique|review|break\s+down|deconstruct|dissect|study)\s+(this|the|my|a|an)\b/i, /\b(can\s+you\s+(analyze|evaluate|assess|critique|review|examine)\s+(this|the|my|a|an))\b/i],
    format: "analysis_detailed"
  },
  "analysis_data": {
    patterns: [/\b(analysis|analyze|evaluate|interpret)\s+(the\s+)?(data|results|findings|information|statistics|numbers|figures|trends|pattern|outcome)\b/i, /\b(what\s+(does\s+this|do\s+these)\s+(mean|suggest|indicate|imply|show|reveal))\b/i],
    format: "analysis_detailed"
  },
  "code_review_general": {
    patterns: [/\b(review|check|look\s+(at|over)|inspect|audit)\s+(my\s+|the\s+|this\s+)?(code|script|program|function|class|app|application)\b/i, /\b(code\s+review|code\s+audit|code\s+check|code\s+inspection)\b/i],
    format: "code_review_detailed"
  },
  "code_review_feedback": {
    patterns: [/\b(can\s+you\s+(review|check|look\s+(at|over)|inspect|audit))\s+(my\s+|the\s+|this\s+)?(code|script|program|function|class)\b/i, /\b(how\s+(is|do\s+you\s+find|does\s+my)\s+(my\s+)?(code|script|program|implementation)\s+(look|seem|appear))\b/i],
    format: "code_review_detailed"
  },
  "design_general": {
    patterns: [/\b(design|ui|ux|user\s+interface|user\s+experience|layout|prototype|wireframe|mockup|figma|sketch|adobe\s+xd|photoshop|illustrator|canva|web\s+design|graphic\s+design|product\s+design|interaction\s+design|visual\s+design|responsive\s+design)\b/i, /\b(how\s+(does|can|should)\s+(this|my|the)\s+(design|ui|ux|layout|interface|prototype|app|website)\s+(look|work|function|feel|improve))\b/i],
    format: "design_feedback"
  },
  "design_feedback_specific": {
    patterns: [/\b(what\s+do\s+you\s+(think|recommend|suggest)\s+(about|of|for)\s+(this|my|the)\s+(design|ui|ux|layout|interface|prototype|app|website))\b/i, /\b(can\s+you\s+(review|critique|evaluate|assess|give\s+feedback\s+on))\s+(my\s+|the\s+|this\s+)?(design|ui|ux|layout|interface|prototype|wireframe)\b/i],
    format: "design_feedback"
  }
};

function detectFlags(input) {
  if (!input) return [];
  const matched = [];
  for (const [flagId, flag] of Object.entries(FLAGS)) {
    for (const pattern of flag.patterns) {
      if (pattern.test(input)) {
        matched.push({ id: flagId, format: flag.format });
        break;
      }
    }
    if (matched.length > 3) break;
  }
  return matched;
}

function formatByFlags(text, flags) {
  if (!text || !flags || flags.length === 0) return text;
  for (const flag of flags) {
    switch (flag.format) {
      case 'compact_flow':
        text = collapseShortLines(text);
        break;
      case 'compact':
        text = text.length > 200 ? text.split('\n')[0] : text;
        break;
      case 'compact_warm':
        text = "You're very welcome! \ud83d\ude0a";
        break;
      case 'compact_soft':
        text = "No worries at all! \ud83d\ude0a";
        break;
      case 'bulleted_list':
        if (!text.includes('\n- ') && !text.includes('\n* ')) {
          const parts = text.split(/[,;]/).filter(s => s.trim().length > 3);
          if (parts.length >= 2) {
            text = parts.map(p => '- ' + p.trim()).join('\n');
          }
        }
        break;
      case 'numbered_steps':
        if (!text.match(/^\d+\.\s/m)) {
          const sentences = text.match(/[^.!?\n]+[.!?]*/g);
          if (sentences && sentences.length >= 3) {
            text = sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
          }
        }
        break;
      case 'code_response':
        if (text.length > 100 && !text.includes('``````')) {
          text = '```\n' + text + '\n```';
        }
        break;
      case 'concise':
        text = text.split('\n')[0];
        if (text.length > 200) text = text.substring(0, 200).replace(/\s+\S*$/, '') + '.';
        break;
      case 'translation':
        text = '**Translation:**\n\n' + text;
        break;
      case 'opinion_balanced':
        text = "That's a great question! Here's my perspective:\n\n" + text;
        break;
      case 'recommendation_list':
        if (!text.includes('\n- ')) {
          const recs = text.match(/\d+\.\s+[^\n]+/g);
          if (recs && recs.length >= 2) {
            text = recs.map(r => '- ' + r.replace(/^\d+\.\s+/, '').trim()).join('\n');
          }
        }
        break;
      case 'comparison_table':
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length >= 4) {
          text = lines.map(l => '| ' + l.replace(/\s{2,}/g, ' | ') + ' |').join('\n');
          text = '| Feature | Comparison |\n|---------|------------|\n' + text;
        }
        break;
      case 'pros_cons_table':
        const pros = [], cons = [];
        let inPros = false, inCons = false;
        text.split('\n').forEach(l => {
          if (/pros?|advantages?|benefits/i.test(l)) inPros = true, inCons = false;
          else if (/cons?|disadvantages?|drawbacks?/i.test(l)) inCons = true, inPros = false;
          else if (inPros && l.trim()) pros.push(l.trim());
          else if (inCons && l.trim()) cons.push(l.trim());
        });
        if (pros.length || cons.length) {
          let table = '| Pros | Cons |\n|------|------|\n';
          const max = Math.max(pros.length, cons.length);
          for (let i = 0; i < max; i++) {
            table += '| ' + (pros[i] || '') + ' | ' + (cons[i] || '') + ' |\n';
          }
          text = table;
        }
        break;
      case 'health_disclaimer':
        text += '\n\n*Disclaimer: I am an AI and not a medical professional. Please consult a qualified healthcare provider for medical advice.*';
        break;
      case 'legal_disclaimer':
        text += '\n\n*Disclaimer: This information is for general informational purposes only and does not constitute legal advice. Consult a qualified attorney for legal matters.*';
        break;
      case 'financial_advice':
        text += '\n\n*Disclaimer: This is for informational purposes only and is not financial advice. Consult a qualified financial advisor before making investment decisions.*';
        break;
      case 'warm_grateful':
        text = "That means a lot, thank you! \ud83d\ude0a";
        break;
      case 'empathetic_comforting':
        text = "I hear you, and I'm here for you. \ud83e\udd17 " + text;
        break;
      case 'energetic_cheerful':
        text = "That's amazing! \ud83c\udf89 " + text;
        break;
      case 'gracious_response':
        text = "That's very kind of you to say! \ud83d\ude0a";
        break;
      case 'fun_suggestions':
        text = "Let's do something fun! \ud83c\udfae " + text;
        break;
      case 'joke_response':
        if (!text.startsWith('Why') && !text.startsWith('What')) {
          text = "Here's one for you:\n\n" + text;
        }
        break;
      case 'riddle_response':
        text = "Here's a riddle for you:\n\n" + text;
        break;
      case 'fact_response':
        text = "Did you know?\n\n" + text;
        break;
      case 'motivational_speech':
        text = "You've got this! \ud83d\udcaa\n\n" + text;
        break;
      case 'affirmation_response':
        text = "You are worthy, capable, and strong.\n\n" + text;
        break;
      case 'celebratory':
        text = "\ud83c\udf89 Congratulations! " + text;
        break;
      case 'congratulatory':
        text = "Amazing work! \ud83c\udf89 " + text;
        break;
      case 'patient_explainer':
        text = "Let me explain that more clearly:\n\n" + text;
        break;
      case 'curious_detailed':
        text = "That's a fascinating question!\n\n" + text;
        break;
      case 'direct_concise':
        text = text.split('\n')[0];
        if (text.length > 150) text = text.substring(0, 150).replace(/\s+\S*$/, '') + '.';
        break;
      case 'minimal_response':
        text = text.length > 50 ? text.split(/[.!?]/)[0] + '.' : text;
        break;
      case 'friendly_intro':
        text = "I'm Genesis AI, your helpful assistant! " + text.replace(/^(i am|i'm)\s+.{0,20}/i, '').trim();
        break;
      case 'advice_balanced':
        text = "Here's my advice on that:\n\n" + text;
        break;
      case 'reasoned_explanation':
        text = "Great question! Here's why:\n\n" + text;
        break;
      case 'example_rich':
        text = "Here are some examples:\n\n" + text;
        break;
      case 'philosophical_reflection':
        text = "That's a profound question. Here are my thoughts:\n\n" + text;
        break;
      case 'respectful_counter':
        text = "I see things a bit differently. " + text;
        break;
      case 'affirmative_compact':
        text = "Absolutely! " + text;
        break;
      case 'quote_response':
        text = '"' + text.replace(/^["']|["']$/g, '') + '"';
        break;
      case 'news_update':
        text = "Here's what I know:\n\n" + text;
        break;
      case 'dream_analysis':
        text = "Dreams can be fascinating! Here's some perspective:\n\n" + text;
        break;
      case 'meditation_guide':
        text = "Let's begin. Find a comfortable position...\n\n" + text;
        break;
      case 'listening_ear':
        text = "I'm here to listen. Take your time. \ud83e\udd17";
        break;
      case 'nostalgic_engaging':
        text = "Those were the days! \ud83d\ude0a " + text;
        break;
      case 'decision_helper':
        text = "Let me help you work through this:\n\n" + text;
        break;
      case 'knock_knock':
        text = "Knock knock!\nWho's there?\n" + text;
        break;
      case 'homework_help':
        text = "Let me help you with that!\n\n" + text;
        break;
      case 'personal_greeting':
        text = "Nice to meet you! " + text;
        break;
      case 'playful_roast':
        text = "Alright, you asked for it! \ud83d\ude0f\n\n" + text;
        break;
      case 'humble_compact':
        text = "Thank you! \ud83d\ude0a " + text;
        break;
      case 'poetry_compose':
        text = "Here's a poem for you:\n\n" + text;
        break;
      case 'song_compose':
        text = "Here are some lyrics:\n\n" + text;
        break;
      case 'would_you_rather_game':
        text = "Here's a 'Would You Rather' for you:\n\n" + text;
        break;
      case 'never_have_i_ever_game':
        text = "Here's a 'Never Have I Ever' for you:\n\n" + text;
        break;
      case 'trivia_quiz_question':
        text = "Here's a trivia question for you:\n\n" + text;
        break;
      case 'debug_guide':
        text = "Let's debug this step by step:\n\n" + text;
        break;
      case 'creative_flow':
        text = "Here you go!\n\n" + text;
        break;
      case 'date_time':
        break;
      case 'weather_info':
        break;
      case 'definition_style':
        text = "Here's the definition:\n\n" + text;
        break;
      case 'math_result':
        break;
      case 'math_detailed':
        break;
      case 'prediction_balanced':
        text = "That's an interesting question about the future!\n\n" + text;
        break;
      case 'challenge_accepted':
        text = "Challenge accepted! \ud83d\ude0e\n\n" + text;
        break;
      case 'repeat_response':
        text = "Of course! Here you go again:\n\n" + text;
        break;
      case 'language_lesson':
        text = "Let's learn! \ud83d\udcda\n\n" + text;
        break;
      case 'career_advice':
        text = "Here's some career advice:\n\n" + text;
        break;
      case 'relationship_advice':
        text = "Relationships can be complex. Here's my perspective:\n\n" + text;
        break;
      case 'writing_assistance':
        text = "Let me help with your writing!\n\n" + text;
        break;
      case 'fitness_guide':
        text = "Here's some fitness advice:\n\n" + text;
        break;
      case 'productivity_advice':
        text = "Here are some productivity tips:\n\n" + text;
        break;
      case 'cooking_guide':
        text = "Here's a guide for that:\n\n" + text;
        break;
      case 'travel_detail':
        text = "Here's some travel info:\n\n" + text;
        break;
      case 'environmental_context':
        break;
      case 'political_neutral':
        text = "That's a complex topic with many perspectives. " + text;
        break;
      case 'mental_health_care':
        text = "Your mental health matters. " + text;
        break;
      case 'spiritual_reflective':
        text = "That's a thoughtful question. " + text;
        break;
      case 'parenting_advice':
        text = "Parenting is a journey. Here's some perspective:\n\n" + text;
        break;
      case 'pet_care':
        text = "Here's some pet care info:\n\n" + text;
        break;
      case 'gaming_detail':
        break;
      case 'analysis_detailed':
        text = "Here's my analysis:\n\n" + text;
        break;
      case 'code_review_detailed':
        text = "Here's my code review:\n\n" + text;
        break;
      case 'design_feedback':
        text = "Here's some design feedback:\n\n" + text;
        break;
      case 'follow_up_continuous':
        break;
      case 'historical_context':
        break;
      case 'scientific_detailed':
        break;
      case 'geographic_detail':
        break;
      case 'entertainment_detail':
        break;
      case 'music_detail':
        break;
      case 'art_detail':
        break;
      case 'detailed_tech':
        break;
      case 'food_detail':
        text = "Here's some information about that:\n\n" + text;
        break;
      case 'sports_detail':
        break;
      case 'tech_detail':
        break;
      case 'business_detail':
        break;
      case 'educational_detail':
        break;
      case 'multi_facts':
        text = "Here are some facts for you:\n\n" + text;
        break;
      case 'open_thoughtful':
        text = "That's a great question to explore!\n\n" + text;
        break;
      case 'suggestion_response':
        break;
      case 'memory_acknowledge':
        break;
      case 'policy_info':
        break;
      case 'future_reflection':
        text = "That's an interesting question about your future!\n\n" + text;
        break;
      case 'emotional_check_in':
        text = "I'm doing well, thank you for asking! \ud83d\ude0a";
        break;
      case 'opinion_poll':
        break;
      default:
        break;
    }
  }
  return text;
}

// --- MISSPELLING CORRECTION ---
function normalizeInput(input) {
  if (!input) return '';
  let normalized = input.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  normalized = expandTextSpeak(normalized);
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
    const content = listMatch[2].replace(/^[,.\s]+|[,.\s]+$/g, '');
    const rawItems = content.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
    if (rawItems.length >= 3) {
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

// --- RESPONSE MERGING ---
function mergeMatches(texts) {
  if (!texts || texts.length === 0) return '';
  if (texts.length === 1) return maybeAddFollowUp(removeRepetitions(formatListResponse(texts[0])));

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

  if (allSentences.length <= 1) return maybeAddFollowUp(removeRepetitions(formatListResponse(allSentences[0] || texts[0])));

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

  if (unique.length <= 1) return maybeAddFollowUp(removeRepetitions(formatListResponse(unique[0] || texts[0])));

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

  return maybeAddFollowUp(removeRepetitions(result.join('\n')));
}
