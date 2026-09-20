export type MorphemeType = 'PREFIX' | 'ROOT' | 'SUFFIX';

export interface Morpheme {
  id: string;
  type: MorphemeType;
  text: string;
  meaning: string;
}

export type ResultType = 'VALID' | 'PLAYFUL' | 'FAILED' | 'PLAUSIBLE';

export interface MergeResult {
  word: string;
  type: ResultType;
  label: string;
  subtitle: string;
  pronunciation?: string;
  definition?: string;
  etymologyNote?: string;
  relatedWords?: string[];
  aiComment?: string;
  prefixNote?: string;
  emoji?: string;
}

export const MORPHEMES: Morpheme[] = [
  { id: 're', type: 'PREFIX', text: 'RE-', meaning: 'again' },
  { id: 'de', type: 'PREFIX', text: 'DE-', meaning: 'down' },
  { id: 'un', type: 'PREFIX', text: 'UN-', meaning: 'not' },
  { id: 'in', type: 'PREFIX', text: 'IN-', meaning: 'into' },
  { id: 'act', type: 'ROOT', text: 'ACT', meaning: 'do' },
  { id: 'tract', type: 'ROOT', text: 'TRACT', meaning: 'pull' },
  { id: 'spect', type: 'ROOT', text: 'SPECT', meaning: 'look' },
  { id: 'form', type: 'ROOT', text: 'FORM', meaning: 'shape' },
  { id: 'ion', type: 'SUFFIX', text: '-ION', meaning: 'state' },
  { id: 'ive', type: 'SUFFIX', text: '-IVE', meaning: 'tending to' },
  { id: 'tion', type: 'SUFFIX', text: '-TION', meaning: 'action' },
  { id: 'ator', type: 'SUFFIX', text: '-ATOR', meaning: 'one who' },
];

export type MorphemeColor = { dot: string; text: string; border: string; divider: string };

export const MORPHEME_COLORS: Record<MorphemeType, MorphemeColor> = {
  PREFIX: { dot: '#e0b6ff', text: '#e0b6ff', border: 'rgba(224,182,255,0.45)', divider: 'rgba(224,182,255,0.3)' },
  ROOT:   { dot: '#f59e0b', text: '#ffc174', border: 'rgba(245,158,11,0.45)',  divider: 'rgba(245,158,11,0.3)' },
  SUFFIX: { dot: '#54ddfc', text: '#54ddfc', border: 'rgba(84,221,252,0.45)',  divider: 'rgba(84,221,252,0.3)' },
};

const MERGE_RESULTS: Record<string, MergeResult> = {
  're+act+ion': {
    word: 'REACTION', type: 'VALID', label: 'NEW DISCOVERY',
    subtitle: 'noun • /riːˈækʃ(ə)n/',
    definition: 'A reaction is a response to something.',
    etymologyNote: "Etymology note: 'act' traces back to a Latin root related to doing or driving.",
    relatedWords: ['active', 'actor', 'transact'],
  },
  'de+act+ive': {
    word: 'DEACTIVE', type: 'PLAUSIBLE', label: 'PLAUSIBLE FORMATION',
    subtitle: '/diˈæktɪv/',
    definition: 'A mathematically sound formation. Modern English settled on "inactive" or the participle "deactivated".',
    etymologyNote: 'Discovered: DEACTIVE → STANDARD: INACTIVE',
    relatedWords: ['inactive', 'deactivated'],
  },
  'un+act': {
    word: 'UNACT', type: 'PLAYFUL', label: 'PLAYFUL COMBO', emoji: '🎭',
    subtitle: 'Not a standard English word...',
    aiComment: '"To unact" — philosophically intriguing. The conceptual undoing of an action, like moral time-travel.',
    prefixNote: "'un-' is an Old English morpheme denoting reversal or absence. Grammatically clever, delightfully unconventional!",
  },
  'ion+ive': {
    word: '-ION + -IVE', type: 'FAILED', label: 'ELEMENTS DRIFT APART',
    subtitle: 'No root anchor detected — suffixes yearn for a root to bind with.',
    definition: "That combination doesn't form a standard construction here. Suffixes usually need a root to anchor them.",
  },
  'de+tract+ion': {
    word: 'DETRACTION', type: 'VALID', label: 'NEW DISCOVERY',
    subtitle: 'noun • /dɪˈtrækʃ(ə)n/',
    definition: 'The action of disparaging or belittling the reputation of someone.',
    etymologyNote: "Etymology: 'tract' from Latin 'trahere' — to draw or pull.",
    relatedWords: ['detract', 'distract', 'traction'],
  },
  're+tract+ion': {
    word: 'RETRACTION', type: 'VALID', label: 'NEW DISCOVERY',
    subtitle: 'noun • /rɪˈtrækʃ(ə)n/',
    definition: 'The action of drawing something back or of being drawn back.',
    etymologyNote: "Etymology: Latin 'retrahere' — to draw back.",
    relatedWords: ['retract', 'contract', 'extract'],
  },
};

export function getMergeResult(morphemes: Morpheme[]): MergeResult {
  const key = morphemes.map(m => m.id).join('+');
  if (MERGE_RESULTS[key]) return MERGE_RESULTS[key];
  // fallback generic results
  const hasRoot = morphemes.some(m => m.type === 'ROOT');
  const hasPrefixOrSuffix = morphemes.some(m => m.type === 'PREFIX' || m.type === 'SUFFIX');
  const word = morphemes.map(m => m.text.replace('-', '')).join('').toUpperCase();
  if (!hasRoot && hasPrefixOrSuffix) {
    return {
      word: morphemes.map(m => m.text).join(' + '),
      type: 'FAILED',
      label: 'ELEMENTS DRIFT APART',
      subtitle: 'No root anchor detected — suffixes yearn for a root to bind with.',
      definition: "That combination doesn't form a standard construction here.",
    };
  }
  if (hasRoot) {
    return {
      word, type: 'PLAUSIBLE', label: 'PLAUSIBLE FORMATION',
      subtitle: 'A structurally sound formation...',
      definition: 'An intriguing, mathematically sound formation.',
    };
  }
  return {
    word, type: 'PLAYFUL', label: 'PLAYFUL COMBO', emoji: '✨',
    subtitle: 'Not a standard English word...',
    aiComment: `"${word}" — a curious creation! Language is an alchemical experiment.`,
  };
}
