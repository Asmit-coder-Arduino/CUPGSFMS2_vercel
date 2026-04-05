import { Filter } from "bad-words";

const filter = new Filter();

// ─── Hindi / Hinglish abusive words ─────────────────────────────────────────
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
];

// ─── Odia abusive words ──────────────────────────────────────────────────────
const odiaWords = [
  "bara","bara sala","maagira","maagi","magira","bhainsaa","badasala",
  "jhia magi","jia magi","puta","poutia","gand","ganda","lanja",
  "lanjasala","suar","kapali","kapala","mula","nanka","nanka pua",
  "bahana","bahani","sala","shala","dhoka","gali","bua",
  "gadha","gadhasala","pagala","ullu","kuta","kuti","kua",
  "ganthia","thia","thira","bia","biasala",
];

// ─── Common leetspeak / bypass attempts ─────────────────────────────────────
const leetspeakWords = [
  "a55","a$$","b1tch","b!tch","f**k","f*ck","sh!t","sh1t","p0rn",
  "pr0n","@ss","@$$","c**t","d!ck","d1ck","fvck","fuk","fuq",
];

// ─── Add all custom words to the filter ─────────────────────────────────────
filter.addWords(...hindiWords, ...odiaWords, ...leetspeakWords);

// ─── Normalise text before checking ─────────────────────────────────────────
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*@!$0-9]/g, (c) => {
      const map: Record<string, string> = {
        "@": "a", "!": "i", "$": "s", "0": "o", "1": "i", "3": "e", "5": "s",
      };
      return map[c] ?? c;
    })
    .replace(/(.)\1{2,}/g, "$1$1") // reduce repeated chars: "fuuuuck" → "fuuck"
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function containsProfanity(text: string): boolean {
  if (!text || !text.trim()) return false;
  const norm = normalise(text);
  try {
    return filter.isProfane(norm) || filter.isProfane(text.toLowerCase());
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
