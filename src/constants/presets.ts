import { ScriptPreset } from '../types/tts';

export const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: 'publicite-luxe',
    title: 'Spot Publicitaire',
    category: 'Publicité',
    recommendedVoice: 'Puck',
    recommendedTone: 'energique',
    text: "Découvrez l'audace d'un design sans compromis. Une précision chirurgicale, un silence absolu, une allure qui redéfinit l'excellence. N'attendez plus l'avenir : vivez-le dès aujourd'hui."
  },
  {
    id: 'manifeste-marque',
    title: 'Manifeste de marque',
    category: 'Vidéo de marque',
    recommendedVoice: 'Kore',
    recommendedTone: 'calme',
    text: "Chez nous, chaque détail compte. Nous croyons que la beauté véritable naît de la simplicité et du respect du temps. Ensemble, cultivons ce qui a du sens pour les générations futures."
  },
  {
    id: 'narration-savoir-faire',
    title: 'Récit d’Atelier',
    category: 'Narration',
    recommendedVoice: 'Charon',
    recommendedTone: 'narrateur',
    text: "Au cœur de nos ateliers, la matière brute prend vie sous le geste patient de nos artisans. Depuis plus d'un siècle, nous forgeons une histoire faite d'exigence, de passion et de transmission."
  }
];
