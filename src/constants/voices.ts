import { VoiceOption } from '../types/tts';

export const GEMINI_VOICES: VoiceOption[] = [
  // ==========================================================
  // VOIX AFRICAINES — DICTION PURE & ORIGINALE
  // ==========================================================
  {
    id: 'af-kinshasa',
    geminiVoiceName: 'Charon',
    name: 'Koffi — Kinshasa',
    gender: 'Masculin',
    region: 'africaine',
    originTag: 'Lingala (RDC)',
    recommendedLanguageId: 'ln-cd',
    characteristic: 'Grave, posée & kinois authentique',
    description:
      'Voix congolaise profonde de Kinshasa. Idéale pour la narration de marque, documentaires et annonces en Lingala (RDC).',
    dictionPrompt:
      'Congolese male narrator from Kinshasa (DRC). Deep, resonant, dignified voice with purely original Kinshasa Lingala and Central African diction.',
    auditionText:
      'Mbote na bino ! Ngai nazali Koffi, mongongo ya solo mpe ya kilo mpo na mosala na bino.'
  },
  {
    id: 'af-malebo',
    geminiVoiceName: 'Kore',
    name: 'Mireille — Malebo',
    gender: 'Féminin',
    region: 'africaine',
    originTag: 'Lingala (RDC)',
    recommendedLanguageId: 'ln-cd',
    characteristic: 'Chaleureuse, douce & expressive',
    description:
      'Timbre congolais lumineux et accueillant. Parfaite pour les campagnes en Lingala (RDC), accueil client et storytelling.',
    dictionPrompt:
      'Congolese female voice from Kinshasa (DRC). Warm, smooth, expressive timbre with purely original Lingala tonal accuracy and natural flow.',
    auditionText:
      'Mbote mingi ! Ngai nazali Mireille. Toyambi bino na boboto mpe na esengo na biso.'
  },
  {
    id: 'af-ade',
    geminiVoiceName: 'Orus',
    name: 'Adé — Lagos & Porto-Novo',
    gender: 'Masculin',
    region: 'africaine',
    originTag: 'Yoruba',
    recommendedLanguageId: 'yo-ng',
    characteristic: 'Tonale, assurée & rythmée',
    description:
      'Voix masculine yoruba au phrasé noble et précis. Respect intégral des trois tons yorubas et de l’articulation originale.',
    dictionPrompt:
      'Native Yoruba male voice (Nigeria / Benin). Clear, dignified, authoritative cadence with strict original three-tone Yoruba accuracy and crisp gb/kp articulation.',
    auditionText:
      'Ẹ kú àárọ̀ o ! Orúkọ mi ni Adé. Ohùn gidi fún ìtàn àti iṣẹ́ ọ̀wọ̀ yín.'
  },
  {
    id: 'af-yemi',
    geminiVoiceName: 'Sulafat',
    name: 'Yémi — Ibadan',
    gender: 'Féminin',
    region: 'africaine',
    originTag: 'Yoruba',
    recommendedLanguageId: 'yo-ng',
    characteristic: 'Mélodieuse, claire & raffinée',
    description:
      'Voix féminine yoruba élégante et chantante, respectant les voyelles nasales et les modulations tonales originelles.',
    dictionPrompt:
      'Native Yoruba female voice. Melodic, refined, poised delivery with purely original Yoruba tonal contours and nasalized vowel precision.',
    auditionText:
      'Ẹ káàbọ̀ o ! Èmi ni Yémi. Ọ̀rọ̀ wa máa ń dún létí pẹ̀lú òtítọ́ àti ẹwà.'
  },
  {
    id: 'af-amani',
    geminiVoiceName: 'Achird',
    name: 'Amani — Grands Lacs',
    gender: 'Masculin',
    region: 'africaine',
    originTag: 'Swahili',
    recommendedLanguageId: 'sw-ea',
    characteristic: 'Calme, narrative & profonde',
    description:
      'Conteur swahiliphone authentique (Afrique de l’Est et Est de la RDC). Cadence posée et voyelles pures.',
    dictionPrompt:
      'Native East African / Eastern DRC Swahili male storyteller. Warm, calm, grounded timbre with purely original Kiswahili penultimate stress and vowel clarity.',
    auditionText:
      'Habari zenu ! Mimi ni Amani. Karibuni kusikia sauti halisi ya Kiswahili chenye heshima.'
  },
  {
    id: 'af-zuri',
    geminiVoiceName: 'Aoede',
    name: 'Zuri — Zanzibar & Kivu',
    gender: 'Féminin',
    region: 'africaine',
    originTag: 'Swahili',
    recommendedLanguageId: 'sw-ea',
    characteristic: 'Fluide, soyeuse & moderne',
    description:
      'Voix féminine kiswahili claire et dynamique, idéale pour les marques modernes, podcasts et contenus panafricains.',
    dictionPrompt:
      'Native Swahili female voice. Silky, clear, modern East African delivery with purely original Kiswahili rhythm and crisp articulation.',
    auditionText:
      'Jambo rafiki ! Mimi ni Zuri. Sauti safi na ya kisasa kwa ujumbe wa chapa yako.'
  },
  {
    id: 'af-diouf',
    geminiVoiceName: 'Puck',
    name: 'Moussa — Dakar',
    gender: 'Masculin',
    region: 'africaine',
    originTag: 'Wolof & Français d’Afrique',
    recommendedLanguageId: 'wo-sn',
    characteristic: 'Dynamique, solaire & charismatique',
    description:
      'Voix ouest-africaine pleine d’élan pour spots publicitaires, lancements produits et prises de parole en Wolof ou Français.',
    dictionPrompt:
      'Native Senegalese male voice from Dakar. Energetic, charismatic West African timbre with purely original Wolof and African Francophone diction.',
    auditionText:
      'Nanga def ! Man Moussa laa. Dalal ak jàmm ci sunu studio bu bees bi.'
  },
  {
    id: 'af-awa',
    geminiVoiceName: 'Leda',
    name: 'Awa — Abidjan & Kin',
    gender: 'Féminin',
    region: 'africaine',
    originTag: 'Français Africain & Bantou',
    recommendedLanguageId: 'fr-af',
    characteristic: 'Élégante, posée & panafricaine',
    description:
      'Voix féminine africaine francophone authentique, chaleureuse et assurée, adaptée aux marques panafricaines et récits corporate.',
    dictionPrompt:
      'Native Sub-Saharan African Francophone female speaker. Elegant, warm, assured natural African French diction without exaggeration.',
    auditionText:
      'Bienvenue chez vous. Je suis Awa, la voix africaine authentique qui donne vie à votre marque.'
  },

  // ==========================================================
  // VOIX GEMINI INTERNATIONALES (CLASSIQUES)
  // ==========================================================
  {
    id: 'Kore',
    geminiVoiceName: 'Kore',
    name: 'Kore',
    gender: 'Féminin',
    region: 'internationale',
    characteristic: 'Chaleureuse & posée',
    description: 'Timbre doux, rond et rassurant. Idéal pour les vidéos de marque et le bien-être.'
  },
  {
    id: 'Puck',
    geminiVoiceName: 'Puck',
    name: 'Puck',
    gender: 'Masculin',
    region: 'internationale',
    characteristic: 'Dynamique & expressive',
    description: 'Voix vive, rythmée et engageante. Parfait pour les spots publicitaires et lancements produit.'
  },
  {
    id: 'Charon',
    geminiVoiceName: 'Charon',
    name: 'Charon',
    gender: 'Masculin',
    region: 'internationale',
    characteristic: 'Grave & profonde',
    description: 'Timbre bas, solennel et captivant. Recommandé pour le luxe, l’horlogerie et les récits immersifs.'
  },
  {
    id: 'Fenrir',
    geminiVoiceName: 'Fenrir',
    name: 'Fenrir',
    gender: 'Masculin',
    region: 'internationale',
    characteristic: 'Claire & affirmée',
    description: 'Diction percutante, autorité naturelle et clarté. Adapté aux tutoriels et contenus d’expertise.'
  },
  {
    id: 'Aoede',
    geminiVoiceName: 'Aoede',
    name: 'Aoede',
    gender: 'Féminin',
    region: 'internationale',
    characteristic: 'Douce & mélodieuse',
    description: 'Voix aérienne, soyeuse et bienveillante. Excellente pour l’accueil, la relaxation et la narration poétique.'
  },
  {
    id: 'Leda',
    geminiVoiceName: 'Leda',
    name: 'Leda',
    gender: 'Féminin',
    region: 'internationale',
    characteristic: 'Moderne & élégante',
    description: 'Tonalité contemporaine, fraîche et assurée. Idéale pour les podcasts et startups innovantes.'
  },
  {
    id: 'Orus',
    geminiVoiceName: 'Orus',
    name: 'Orus',
    gender: 'Masculin',
    region: 'internationale',
    characteristic: 'Informative & assurée',
    description: 'Voix journalistique, équilibrée et neutre. Parfaite pour les documentaires et présentations corporate.'
  },
  {
    id: 'Zephyr',
    geminiVoiceName: 'Zephyr',
    name: 'Zephyr',
    gender: 'Neutre',
    region: 'internationale',
    characteristic: 'Calme & équilibrée',
    description: 'Timbre universel et harmonieux. Idéal pour les expériences interactives et guides narratifs.'
  },
  {
    id: 'Sulafat',
    geminiVoiceName: 'Sulafat',
    name: 'Sulafat',
    gender: 'Féminin',
    region: 'internationale',
    characteristic: 'Posée & soignée',
    description: 'Diction impeccable, sophistication feutrée. Conçue pour les manifestes de marque haut de gamme.'
  },
  {
    id: 'Achird',
    geminiVoiceName: 'Achird',
    name: 'Achird',
    gender: 'Masculin',
    region: 'internationale',
    characteristic: 'Chaleureuse & narrative',
    description: 'Conteur naturel avec une résonance humaine et accessible. Idéal pour les contes et success stories.'
  }
];

export const DEFAULT_VOICE_ID = 'Kore';
