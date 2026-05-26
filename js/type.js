// Auto-generated from words.json - maps every word to all common misspellings
window.TYPE_MAP = (() => {
  const words = ["hate","hater","kill","murder","murderer","assault","attack","stab","shoot","bomb","terrorist","weapon","gun","rifle","pistol","explosive","war","torture","blood","gore","violence","massacre","execute","slaughter","suicide","selfharm","self-harm","cutting","die","hang","overdose","behead","decapitate","victim","corpse","dead","death","grave","funeral","cemetery","bloodbath","homicide","abduction","taser","lynch","shooting","bomber","bombing","knife","gunshot","sniper","grenade","hostage","execution","manslaughter","assassinate","terror","genocide","slaughterhouse","poisoning","mutilate","arsonist","molotov","firebomb","chemicalweapon","acidattack","assaultweapon","lynching","homicidal","nsfw","sex","sexual","porn","pornography","nude","naked","fetish","explicit","xxx","strip","erotic","kink","bdsm","rape","molest","incest","orgy","masturbate","masturbation","prostitute","prostitution","adult","onlyfans","lewd","lust","horny","threesome","blowjob","handjob","anal","cum","ejaculate","intercourse","hooker","escort","sperm","vibrator","condom","nipple","breast","boob","penis","vagina","genital","cock","dildo","pussy","clit","clitoris","moan","deepthroat","kamasutra","sexchat","camgirl","camshow","striptease","erotica","bondage","orgasm","fetishism","bareback","hardcore","pornstar","pornhub","xvideos","xhamster","milf","teen","bukkake","gangbang","analplay","sextoy","fetishporn","incestporn","fap","naught","playboy","playgirl","escortservice","drug","drugs","cocaine","heroin","meth","weed","marijuana","lsd","ecstasy","crack","opium","inject","snort","high","illegal","crime","criminal","theft","steal","scam","hack","exploit","fraud","blackmail","piracy","counterfeit","bribe","kidnap","traffick","smuggle","arson","vandalism","cartel","deal","dealer","gang","gangster","rob","robbery","stolen","hijack","loot","burglar","burglary","methlab","overdose","swat","swatting","malware","virus","trojan","ransomware","spyware","dox","doxx","phish","phishing","extortion","moneylaundering","smuggling","embezzle","fraudulent","conspiracy","terrorism","illicit","bootleg","opiumpipe","weedpipe","joint","blunt","shabu","coke","crystal","pcp","ketamine","acid","mdma","lsdtab","methamphetamine","heroinpipe","crackpipe","weedjoint","bluntjoint","hash","cannabis","marijuanas","opiumsmoke","narcotics","hallucinogen","stimulant","depressant","drugabuse","racist","racism","sexist","homophobic","transphobic","bigot","slur","nazi","slavery","hatecrime","antisemitic","islamophobic","xenophobic","prejudice","discriminate","discrimination","supremacist","whitepower","kkk","neo-nazi","apartheid","segregation","oppression","nigger","clanker","chink","kike","spic","gypsy","fag","dyke","tranny","retard","slut","whore","bitch","cunt","twat","faggot","cracker","beaner","gook","bigotry","supremacy","childporn","underage","minors","pedo","pedophile","pedophilia","grooming","childabuse","molestation","loli","shota","exploitation","abduct","incestuous","fuck","fucking","fucker","shit","bullshit","bastard","asshole","ass","dick","prick","piss","pissed","damn","bloody","wanker","bugger","bollocks","arse","crap","motherfucker","tosser","moron","idiot","dumbass","jackass","shithead","jerk","loser","nonce","slag","scumbag","skank","tramp","hoe","fuckwit","douche","douchebag","screw","screwed","hell","balls","nuts","tits","wank","wanking","arsehole","dipshit","dickhead","shite","arsewipe","titty","numbnuts","asswipe","cumdump","cocksucker","shitbag","troll","flame","harass","harassment","threat","threaten","abuse","insult","offend","offensive","bully","bullying","toxic","cancel","doxxing","stalker","ransom","extortion","blackmail","suicidal","poison","graveyard","selfdestruct"];
  const map = {};

  function addVariants(word) {
    const variants = new Set();
    const w = word.toLowerCase();
    variants.add(w);

    // Leet speak variants
    const leetMap = { a: ['4','@'], e: ['3'], i: ['1','l','!'], o: ['0'], s: ['5','z'], t: ['7'], g: ['9'], b: ['8'], l: ['1'] };
    for (const [char, subs] of Object.entries(leetMap)) {
      if (w.includes(char)) {
        for (const sub of subs) {
          variants.add(w.replaceAll(char, sub));
        }
      }
    }

    // Double letter variants (add/remove)
    for (let i = 0; i < w.length - 1; i++) {
      if (w[i] === w[i + 1]) variants.add(w.slice(0, i) + w.slice(i + 1));
      if ('bcdfghjklmnpqrstvwxyz'.includes(w[i])) variants.add(w.slice(0, i + 1) + w[i] + w.slice(i + 1));
    }

    // Common swaps
    if (w.includes('ph')) variants.add(w.replace('ph', 'f'));
    if (w.includes('f')) variants.add(w.replace('f', 'ph'));
    if (w.endsWith('y')) variants.add(w.slice(0, -1) + 'ie') && variants.add(w.slice(0, -1) + 'ies');
    if (w.endsWith('ie')) variants.add(w.slice(0, -2) + 'y');
    if (w.includes('ie')) variants.add(w.replace('ie', 'ei'));
    if (w.includes('ei')) variants.add(w.replace('ei', 'ie'));
    if (w.includes('c') && w.includes('k')) variants.add(w.replace('ck', 'k').replace('c', 'k'));
    if (w.endsWith('e')) variants.add(w.slice(0, -1));
    if (!w.endsWith('e') && w.length > 3 && 'bcdfghjklmnpqrstvwxyz'.includes(w[w.length - 1])) variants.add(w + 'e');
    if (w.includes('tion')) variants.add(w.replace('tion', 'shun'));
    if (w.includes('ss')) variants.add(w.replace('ss', 's'));
    if (w.includes('tt')) variants.add(w.replace('tt', 't'));
    if (w.includes('ll')) variants.add(w.replace('ll', 'l'));

    // Vowel swapping
    const vowels = ['a','e','i','o','u'];
    for (let i = 0; i < w.length; i++) {
      if (vowels.includes(w[i])) {
        for (const v of vowels) {
          if (v !== w[i]) variants.add(w.slice(0, i) + v + w.slice(i + 1));
        }
      }
    }

    // Silent h and reversal
    if (w.includes('sh')) variants.add(w.replace('sh', 'sch'));
    if (w.includes('sch')) variants.add(w.replace('sch', 'sh'));
    if (w.includes('th')) variants.add(w.replace('th', 't'));
    if (w.includes('ght')) variants.add(w.replace('ght', 't'));

    // Keyboard adjacency common errors
    for (let i = 0; i < w.length - 1; i++) {
      const swapped = w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2);
      variants.add(swapped);
    }

    // Dropping last letter
    if (w.length > 3) {
      variants.add(w.slice(0, -1));
      if (w.endsWith('ed')) variants.add(w.slice(0, -2));
      if (w.endsWith('ing')) variants.add(w.slice(0, -3));
      if (w.endsWith('er')) variants.add(w.slice(0, -2));
      if (w.endsWith('ly')) variants.add(w.slice(0, -2));
    }

    // 'x' <-> 'ks' / 'cs'
    if (w.includes('x')) {
      variants.add(w.replace('x', 'ks'));
      variants.add(w.replace('x', 'cs'));
    }

    // 'y' -> 'i' (plural-like)
    if (w.endsWith('y')) {
      variants.add(w.slice(0, -1) + 'ies');
      variants.add(w.slice(0, -1) + 'ied');
    }

    // 'le' <-> 'el'
    if (w.endsWith('le')) variants.add(w.slice(0, -2) + 'el');
    if (w.endsWith('el')) variants.add(w.slice(0, -2) + 'le');

    // 're' <-> 'er'
    if (w.endsWith('re')) variants.add(w.slice(0, -2) + 'er');
    if (w.endsWith('er')) variants.add(w.slice(0, -2) + 're');

    // Split compound words
    if (w.includes('-')) variants.add(w.replace('-', ''));
    if (w.includes('-')) variants.add(w.replace('-', ' '));

    return [...variants].filter(v => v.length >= 2);
  }

  for (const word of words) {
    const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized) {
      const variants = addVariants(normalized);
      map[normalized] = [...new Set(variants)];
    }
  }

  // Handle hyphenated variants
  for (const word of words) {
    if (word.includes('-')) {
      const noHyphen = word.replace('-', '');
      const normalized = noHyphen.toLowerCase();
      if (map[normalized]) {
        map[normalized] = [...new Set([...map[normalized], word.toLowerCase()])];
      }
    }
  }

  return map;
})();
