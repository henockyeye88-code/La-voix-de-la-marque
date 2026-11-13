import { VoiceOption } from '../types/tts';

export const GEMINI_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Féminin',
    characteristic: 'Chaleureuse & posée',
    description: 'Timbre doux, rond et rassurant. Idéal pour les vidéos de marque et le bien-être.'
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Masculin',
    characteristic: 'Dynamique & expressive',
    description: 'Voix vive, rythmée et engageante. Parfait pour les spots publicitaires et lancements produit.'
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Masculin',
    characteristic: 'Grave & profonde',
    description: 'Timbre bas, solennel et captivant. Recommandé pour le luxe, l’horlogerie et les récits immersifs.'
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Masculin',
    characteristic: 'Claire & affirmée',
    description: 'Diction percutante, autorité naturelle et clarté. Adapté aux tutoriels et contenus d’expertise.'
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    gender: 'Féminin',
    characteristic: 'Douce & mélodieuse',
    description: 'Voix aérienne, soyeuse et bienveillante. Excellente pour l’accueil, la relaxation et la narration poétique.'
  },
  {
    id: 'Leda',
    name: 'Leda',
    gender: 'Féminin',
    characteristic: 'Moderne & élégante',
    description: 'Tonalité contemporaine, fraîche et assurée. Idéale pour les podcasts et startups innovantes.'
  },
  {
    id: 'Orus',
    name: 'Orus',
    gender: 'Masculin',
    characteristic: 'Informative & assurée',
    description: 'Voix journalistique, équilibrée et neutre. Parfaite pour les documentaires et présentations corporate.'
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Neutre',
    characteristic: 'Calme & équilibrée',
    description: 'Timbre universel et harmonieux. Idéal pour les expériences interactives et guides narratifs.'
  },
  {
    id: 'Sulafat',
    name: 'Sulafat',
    gender: 'Féminin',
    characteristic: 'Posée & soignée',
    description: 'Diction impeccable, sophistication feutrée. Conçue pour les manifestes de marque haut de gamme.'
  },
  {
    id: 'Achird',
    name: 'Achird',
    gender: 'Masculin',
    characteristic: 'Chaleureuse & narrative',
    description: 'Conteur naturel avec une résonance humaine et accessible. Idéal pour les contes et success stories.'
  }
];

export const DEFAULT_VOICE_ID = 'Kore';
