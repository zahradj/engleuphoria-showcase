/**
 * SPEECH POLICY (excerpt): the one place that decides how every recorded voice
 * in the platform must sound. Used by all three hubs.
 *
 *   1. NO ACCENT. Only approved native General American voices are used.
 *      (The approved-voice list and voice IDs are private and removed here.)
 *   2. ACCURATE PRONUNCIATION. Text is cleaned before it is spoken, so numbers,
 *      abbreviations, shouted words, symbols and emoji are read the way a teacher
 *      would say them, and delivery settings stay in the range where
 *      pronunciation is stable.
 *   3. NEVER spell out a sound. Isolated phonics sounds come only from recorded
 *      files; speechRisks() flags "sss", "/h/" and similar.
 *
 * An automated test in the deploy gate fails the build if any new voice, server
 * function or game skips this policy.
 */

/** Delivery settings kept in the range where pronunciation stays accurate and consistent.
 *  Very low stability / high style ("cartoon" settings) makes ElevenLabs drift, mispronounce
 *  and sound foreign. */
export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  speed?: number;
}
export const SETTINGS_LIMITS = { minStability: 0.5, maxStyle: 0.4 } as const;

export function safeVoiceSettings<T extends VoiceSettings>(settings: T): T {
  const out = { ...settings };
  if (typeof out.stability === 'number') out.stability = Math.max(SETTINGS_LIMITS.minStability, out.stability);
  if (typeof out.style === 'number') out.style = Math.min(SETTINGS_LIMITS.maxStyle, out.style);
  return out;
}

/** Only Turbo/Flash v2.5 accept a language lock; sending it to other models is an API error. */
export function languageLock(modelId: string): { language_code?: string } {
  return /^eleven_(turbo|flash)_v2_5/.test(modelId) ? { language_code: 'en' } : {};
}

/* ------------------------------------------------------------------ pronunciation */

/** Words a TTS reads wrongly as written -> how a teacher would say them. Keys are lowercase. */
export const SPOKEN_FORMS: Record<string, string> = {
  'yo-yo': 'yo yo',
  yoyo: 'yo yo',
  ok: 'okay',
  'tv': 'T V',
  'e.g.': 'for example',
  'i.e.': 'that is',
  'etc.': 'and so on',
  vs: 'versus',
  mr: 'Mister',
  mrs: 'Missus',
  ms: 'Miss',
  dr: 'Doctor',
};

/** ALL-CAPS tokens that really are spoken as letters. Anything else in caps is a shouted word. */
const SPELLED_ACRONYMS = new Set(['ABC', 'USA', 'UK', 'TV', 'DVD', 'CEO', 'PDF', 'FAQ', 'ESL', 'CD', 'PC', 'ID', 'DJ', 'UFO']);

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORDINAL_ONES = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'];

export function numberToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) return String(n);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : '');
  const rest = n % 100;
  return `${ONES[Math.floor(n / 100)]} hundred${rest ? ` ${numberToWords(rest)}` : ''}`;
}

const capitalizeLike = (original: string, replacement: string) =>
  original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()
    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
    : replacement;

/**
 * Clean text so a TTS voice pronounces it the way a teacher would say it.
 * Text that already carries markup (SSML such as <phoneme>) is passed through untouched.
 */
export function normalizeForSpeech(input: string): string {
  if (!input) return '';
  if (/<[a-z][^>]*>/i.test(input)) return input; // SSML: the author controls it
  let s = input.normalize('NFC');
  s = s.replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"');
  s = s.replace(/[\p{Extended_Pictographic}️‍]/gu, ' '); // emoji are never spoken
  s = s.replace(/[*_`#~]+/g, ' ').replace(/\s+/g, ' ');

  // lexicon of known tricky words / abbreviations (whole word, case-insensitive)
  const keys = Object.keys(SPOKEN_FORMS).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  s = s.replace(new RegExp(`(?<![\\p{L}\\p{N}])(${keys.join('|')})\\.?(?![\\p{L}\\p{N}])`, 'giu'), (m, word: string) => {
    const spoken = SPOKEN_FORMS[word.toLowerCase()];
    return spoken ? capitalizeLike(word, spoken) : m;
  });

  s = s.replace(/&/g, ' and ').replace(/%/g, ' percent ');
  s = s.replace(/(\p{L}{2,})\/(\p{L}{2,})/gu, '$1 or $2'); // he/she -> he or she (not /h/ sound notation)
  s = s.replace(/(\p{L})-(?=\p{L})/gu, '$1 '); // yo-yo, T-shirt -> separate words
  s = s.replace(/[–—]/g, ', '); // dashes -> a natural pause

  s = s.replace(/\b(\d{1,3})(?:st|nd|rd|th)\b/gi, (m, d: string) => {
    const n = Number(d);
    if (n <= 20) return ORDINAL_ONES[n];
    const w = numberToWords(n);
    return w.replace(/y$/, 'ie') + 'th';
  });
  s = s.replace(/(?<![\d.,])\b\d{1,3}\b(?![\d,.]*\d)/g, (m) => numberToWords(Number(m)));

  // SHOUTED words are words, not spelled letters ("SAT" -> "sat"); real acronyms stay.
  // Capitalised only where a sentence begins.
  s = s.replace(/\b[A-Z]{3,}\b/g, (w, offset: number, whole: string) => {
    if (SPELLED_ACRONYMS.has(w)) return w;
    const lower = w.toLowerCase();
    const before = whole.slice(0, offset).trimEnd();
    const startsSentence = before === '' || /[.!?"'(]$/.test(before);
    return startsSentence ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
  });

  s = s.replace(/\.{2,}|…/g, ', ').replace(/,\s*,/g, ',').replace(/,\s*([.!?])/g, '$1').replace(/,\s*$/g, '.');
  return s.replace(/\s+([,.!?;:])/g, '$1').replace(/\s+/g, ' ').trim();
}

export type SpeechRiskCode =
  | 'spelled-sound'      // "sss", "mmm" — a TTS cannot say an isolated sound; use the recorded file
  | 'phoneme-notation'   // "/h/", "/sh/" — would be read as "slash h slash"
  | 'digits'
  | 'emoji'
  | 'all-caps-word'
  | 'abbreviation'
  | 'symbol'
  | 'non-latin-script'   // a TTS may switch language/accent
  | 'url-or-email';

export interface SpeechRisk { code: SpeechRiskCode; match: string }

/** Everything in `text` a TTS would mispronounce. Run on the RAW text to see what normalization fixes,
 *  or on the normalized text to find what still needs a human (spelled-sound, phoneme-notation, ...). */
export function speechRisks(text: string): SpeechRisk[] {
  const risks: SpeechRisk[] = [];
  const add = (code: SpeechRiskCode, re: RegExp) => {
    for (const m of text.matchAll(re)) risks.push({ code, match: m[0] });
  };
  add('spelled-sound', /\b([a-z])\1{2,}\b/gi);
  add('phoneme-notation', /\/[a-z]{1,3}\//gi);
  add('digits', /\d+/g);
  add('emoji', /[\p{Extended_Pictographic}]/gu);
  add('all-caps-word', /\b[A-Z]{3,}\b/g);
  add('abbreviation', /\b(?:Mr|Mrs|Ms|Dr|vs|etc|e\.g|i\.e)\b\.?/g);
  add('symbol', /[&%@#=+<>|\\]/g);
  add('non-latin-script', /[\p{Script=Cyrillic}\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu);
  add('url-or-email', /\bhttps?:\/\/\S+|\b\S+@\S+\.\S+/g);
  return risks;
}

/** Risks that survive normalization — these are real problems, not just formatting. */
export const unresolvedSpeechRisks = (text: string): SpeechRisk[] => speechRisks(normalizeForSpeech(text));
