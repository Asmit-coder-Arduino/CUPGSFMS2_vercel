import { Filter } from "bad-words";

const filter = new Filter();

const hindiWords = [
  "madarchod","maderchod","mc","bkl","bhosdike","bhosdika","bhosdiwale",
  "behenchod","behen chod","bc","chutiya","chutiye","chut","loda","lund",
  "gaand","gandu","saala","sala","haramzada","haramkhor","kamina","kamine",
  "randi","rand","harami","kutiya","kutti","gajini","bhosad","lawda",
  "laudey","laude","choot","chhinal","gaandmara","gaandu","bhen",
  "bhensdi","bakrichod","bkc","mkc","mmc","suar","suvar",
  "kutta","kutte","ullu","ulluka","hijra","hijda","haram",
  "jhatu","jhattan","fudu","fuddu","gadha","gadhon","bhenchod",
  "teri maa","teri ma","teri behan","tere baap","teri behen",
  "maaderchod","saali","saale","randi rona","gandmara",
  "bsdk","tmkc","tmkb","bsdke","bsdki","lodu","tatti","haggu",
  "ghanta","bevda","bevdi","chakke","chhakka","dalla","dalli",
  "chodna","chodu","chinal","chinaal","raand","raandi",
  "gawar","bewakoof","nalayak","nikamma","nikami","haraami",
  "bhadwa","bhadwe","bhadwi","maal","item","pataka",
];

const odiaWords = [
  "bara","bara sala","maagira","maagi","magira","bhainsaa","badasala",
  "jhia magi","jia magi","puta","poutia","gand","ganda","lanja",
  "lanjasala","suar","kapali","kapala","mula","nanka","nanka pua",
  "bahana","bahani","sala","shala","dhoka","gali","bua",
  "gadha","gadhasala","pagala","ullu","kuta","kuti","kua",
  "ganthia","thia","thira","bia","biasala",
  "chodia","choda","badia","badmash","beiman","dusta",
  "ganda kata","haada","hada","maira","luchha","luchhi",
];

const bengaliWords = [
  "chodu","banchod","magi","magir","guddamara","hoga",
  "shala","shalir","bal","baal","bokachoda","nongra",
  "khanki","haramjada","haramjadi","malaun",
  "boka","gadha","gadhar","pagol","pagla","pagli",
];

const tamilWords = [
  "thevdiya","punda","oombu","sunni","thevidiya",
  "koothi","myiru","otha","baadu","lavada",
];

const teluguWords = [
  "dengey","lanja","pooku","sulli","gudda",
  "modda","erri","puka","lanjodka","nakodaka",
];

const leetspeakWords = [
  "a55","a$$","b1tch","b!tch","f**k","f*ck","sh!t","sh1t","p0rn",
  "pr0n","@ss","@$$","c**t","d!ck","d1ck","fvck","fuk","fuq",
  "stfu","gtfo","lmfao","wtf","sob","mf","mofo","mthrfkr",
  "phuck","phuk","fcuk","biatch","beyatch","azz","phuck",
  "sht","btch","dck","fck","cnt","bllsht",
];

filter.addWords(
  ...hindiWords, ...odiaWords, ...bengaliWords,
  ...tamilWords, ...teluguWords, ...leetspeakWords,
);

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.*_\-~`'"]/g, "")
    .replace(/[*@!$0-9]/g, (c) => {
      const map: Record<string, string> = {
        "@": "a", "!": "i", "$": "s", "0": "o", "1": "i", "3": "e", "5": "s", "4": "a", "7": "t",
      };
      return map[c] ?? c;
    })
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/\s+/g, " ")
    .trim();
}

function checkWordBoundaries(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  for (const word of words) {
    if (word.includes(" ")) {
      if (lower.includes(word)) return true;
    } else {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");
      if (regex.test(lower)) return true;
    }
  }
  return false;
}

const allCustomWords = [
  ...hindiWords, ...odiaWords, ...bengaliWords,
  ...tamilWords, ...teluguWords, ...leetspeakWords,
];

export function containsProfanity(text: string): boolean {
  if (!text || !text.trim()) return false;
  const norm = normalise(text);
  try {
    if (filter.isProfane(norm) || filter.isProfane(text.toLowerCase())) return true;
    if (checkWordBoundaries(norm, allCustomWords)) return true;
    const noSpaces = text.toLowerCase().replace(/\s+/g, "");
    if (checkWordBoundaries(noSpaces, allCustomWords.filter(w => w.length >= 4))) return true;
    return false;
  } catch {
    return false;
  }
}

export function cleanText(text: string): string {
  if (!text || !text.trim()) return text;
  try {
    return filter.clean(text);
  } catch {
    return text;
  }
}
