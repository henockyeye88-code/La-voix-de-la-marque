import { VoiceLanguageId, VoiceLanguageOption } from '../types/tts';

export const DEFAULT_LANGUAGE_ID: VoiceLanguageId = 'fr-standard';

export const VOICE_LANGUAGES: VoiceLanguageOption[] = [
  {
    id: 'fr-standard',
    label: 'Français (Standard)',
    shortLabel: 'Français',
    regionLabel: 'Francophonie',
    description: 'Diction française classique, claire et neutre.',
    dictionDetail: 'Articulation fluide et intonation naturelle en français.',
    originalDictionInstruction:
      'Locuteur natif francophone. Diction française classique, naturelle et parfaitement articulée.',
    auditionSampleText:
      'Bonjour, je suis votre voix studio, prête à porter le message de votre marque avec clarté.',
    supportsToneControl: true
  },
  {
    id: 'ln-cd',
    label: 'Lingala (RDC)',
    shortLabel: 'Lingala (RDC)',
    regionLabel: 'Congo-Kinshasa',
    description: 'Lingala authentique de RDC avec respect strict des tons et voyelles.',
    dictionDetail: 'Tons hauts/bas naturels, chaleur kinois et rythme bantou original.',
    originalDictionInstruction:
      'Native Congolese Lingala speaker from Kinshasa, Democratic Republic of the Congo (RDC). Purely original authentic Lingala diction: exact high and low lexical tones, open-mid vowels (ɛ, ɔ), natural prenasalized consonants (mb, nd, ng, nz, nk), warm Kinshasa cadence. Zero European, French, or American English accent.',
    auditionSampleText:
      'Mbote na yo ! Toyambi yo na esengo na biso. Lelo, tozali kokumisa mongongo ya solo mpe ya kitoko.',
    supportsToneControl: true
  },
  {
    id: 'yo-ng',
    label: 'Yoruba',
    shortLabel: 'Yoruba',
    regionLabel: 'Nigéria / Bénin',
    description: 'Yoruba tonal original : tons haut, moyen et bas respectés.',
    dictionDetail: 'Précision des trois tons, voyelles nasales et consonnes gb/kp.',
    originalDictionInstruction:
      'Native Yoruba speaker (Nigeria / Benin). Purely original authentic Yoruba diction: strict accuracy on the three lexical tones (high, mid, low), accurate nasalized vowels (ọn, ẹn, ín, ún), authentic labial-velar stops (gb, kp), and natural Yorubaland prosody. Never flatten tones or apply a Western accent.',
    auditionSampleText:
      'Ẹ kú àárọ̀ o ! Ẹ káàbọ̀ sí ilé iṣẹ́ wa. Ọ̀rọ̀ rere àti ohùn tó mọ́ gaara ni a fi ń sọ ìtàn wa.',
    supportsToneControl: true
  },
  {
    id: 'sw-ea',
    label: 'Swahili',
    shortLabel: 'Swahili',
    regionLabel: 'Afrique de l’Est & RDC',
    description: 'Kiswahili pur avec accentuation régulière et voyelles claires.',
    dictionDetail: 'Accent tonique sur l’avant-dernière syllabe, voyelles pures et cadence posée.',
    originalDictionInstruction:
      'Native Kiswahili speaker (East Africa & Eastern DRC). Purely original authentic Swahili diction: clean five-vowel purity (a, e, i, o, u), consistent penultimate syllable stress, crisp consonant clusters (ng, ny, dh, th, gh, kh), and warm, poised native cadence without foreign accent.',
    auditionSampleText:
      'Habari zenu ! Karibuni sana. Leo tunazungumza kwa sauti halisi ya Kiswahili yenye uwazi na heshima.',
    supportsToneControl: true
  },
  {
    id: 'wo-sn',
    label: 'Wolof',
    shortLabel: 'Wolof',
    regionLabel: 'Sénégal',
    description: 'Wolof authentique : prosodie expressive et consonnes nettes.',
    dictionDetail: 'Consonnes géminées, pré-nasales et musicalité ouest-africaine.',
    originalDictionInstruction:
      'Native Senegalese Wolof speaker from Dakar. Purely original authentic Wolof diction: crisp geminate consonants, accurate prenasalized stops (mb, nd, nj, ng), authentic vowel length contrasts, and warm expressive West African cadence.',
    auditionSampleText:
      'Nanga def ! Dalal ak jàmm. Tey dañuy wax ak baat bu leer te rafet ci sunu làmmiñ.',
    supportsToneControl: true
  },
  {
    id: 'kg-cd',
    label: 'Kikongo / Tshiluba (RDC)',
    shortLabel: 'Kikongo / Tshiluba',
    regionLabel: 'RDC',
    description: 'Langues nationales de RDC avec diction bantoue pure et tonale.',
    dictionDetail: 'Musicalité tonale congolaise et articulation fidèle des préfixes.',
    originalDictionInstruction:
      'Native speaker of Congolese Bantu languages (Kikongo and Tshiluba from DRC). Purely original authentic DRC diction: precise tonal contour, natural Bantu noun-class prefixes, clear open vowels, and genuine Congolese warmth without foreign accent.',
    auditionSampleText:
      'Mbote mingi, moyo wetu ! Tubikila ne moyo mulenga mu bujitu bua mboka yetu.',
    supportsToneControl: true
  },
  {
    id: 'fr-af',
    label: 'Français d’Afrique',
    shortLabel: 'Français Africain',
    regionLabel: 'RDC, Sénégal, Côte d’Ivoire',
    description: 'Français porté par une voix africaine chaleureuse et naturelle.',
    dictionDetail: 'Timbre, phrasé et rythme authentiques d’Afrique francophone.',
    originalDictionInstruction:
      'Native Sub-Saharan African Francophone speaker (natural authentic cadence of Kinshasa, Dakar, and Abidjan). Purely natural, dignified, warm African French diction with crisp consonants and authentic rhythmic phrasing, never exaggerated or caricatured.',
    auditionSampleText:
      'Bienvenue chez nous. Chaque mot porte la chaleur, l’énergie et l’authenticité de nos voix africaines.',
    supportsToneControl: true
  }
];

export const VOICE_LANGUAGES_MAP: Record<VoiceLanguageId, VoiceLanguageOption> =
  VOICE_LANGUAGES.reduce((acc, lang) => {
    acc[lang.id] = lang;
    return acc;
  }, {} as Record<VoiceLanguageId, VoiceLanguageOption>);
