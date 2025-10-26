export function violatesRules(text) {
  const bannedWords = [
    "hate", "kill", "murder", "harm", "abuse", "assault", "attack", "stab",
    "shoot", "bomb", "terrorist", "weapon", "gun", "explosive", "war", "torture",
    "blood", "gore", "violence", "massacre", "execute", "slaughter",
    "suicide", "selfharm", "self-harm", "cutting", "die", "hang", "overdose",
    "nsfw", "sex", "sexual", "porn", "pornography", "nude", "naked", "fetish",
    "explicit", "xxx", "strip", "erotic", "kink", "bdsm", "rape", "molest",
    "incest", "orgy", "masturbate", "prostitute", "prostitution",
    "drug", "drugs", "cocaine", "heroin", "meth", "weed", "marijuana", "lsd",
    "ecstasy", "crack", "opium", "inject", "snort", "high", "overdose",
    "illegal", "crime", "criminal", "theft", "steal", "scam", "hack", "exploit",
    "fraud", "blackmail", "piracy", "counterfeit", "bribe", "kidnap", "traffick",
    "terror", "smuggle", "arson", "vandalism",
    "racist", "racism", "sexist", "homophobic", "transphobic", "bigot", "slur",
    "nazi", "slavery", "genocide", "hatecrime",
    "dead", "death", "corpse", "grave", "funeral", "cemetery", "bloodbath",
    "suicidal", "homicide", "victim", "abduction", "behead", "decapitate",
    "childporn", "cp", "underage", "minors", "pedo", "pedophile", "grooming",
    "dox", "doxx", "swat", "swatting", "malware", "virus", "trojan", "ransomware"
  ];
  return bannedWords.some(word => text.toLowerCase().includes(word));
}
