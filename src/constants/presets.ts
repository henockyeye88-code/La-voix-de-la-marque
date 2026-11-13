import { ScriptPreset } from '../types/tts';

export const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: 'publicite-luxe',
    title: 'Spot Publicitaire',
    category: 'Publicité',
    recommendedVoice: 'Puck',
    recommendedTone: 'energique',
    recommendedLanguageId: 'fr-standard',
    text: "Découvrez l'audace d'un design sans compromis. Une précision chirurgicale, un silence absolu, une allure qui redéfinit l'excellence. N'attendez plus l'avenir : vivez-le dès aujourd'hui."
  },
  {
    id: 'manifeste-marque',
    title: 'Manifeste de marque',
    category: 'Vidéo de marque',
    recommendedVoice: 'Kore',
    recommendedTone: 'calme',
    recommendedLanguageId: 'fr-standard',
    text: "Chez nous, chaque détail compte. Nous croyons que la beauté véritable naît de la simplicité et du respect du temps. Ensemble, cultivons ce qui a du sens pour les générations futures."
  },
  {
    id: 'narration-savoir-faire',
    title: 'Récit d’Atelier',
    category: 'Narration',
    recommendedVoice: 'Charon',
    recommendedTone: 'narrateur',
    recommendedLanguageId: 'fr-standard',
    text: "Au cœur de nos ateliers, la matière brute prend vie sous le geste patient de nos artisans. Depuis plus d'un siècle, nous forgeons une histoire faite d'exigence, de passion et de transmission."
  },
  {
    id: 'lingala-rdc',
    title: 'Lingala (RDC)',
    category: 'Voix Africaines',
    recommendedVoice: 'af-kinshasa',
    recommendedTone: 'narrateur',
    recommendedLanguageId: 'ln-cd',
    text: "Mbote na bino nyonso ! Lelo, tozali kokumisa makasi mpe kitoko ya misala na biso. Elongo, totonga lobi ya malamu mpo na libota mpe mboka na biso."
  },
  {
    id: 'yoruba-marque',
    title: 'Yoruba',
    category: 'Voix Africaines',
    recommendedVoice: 'af-ade',
    recommendedTone: 'narrateur',
    recommendedLanguageId: 'yo-ng',
    text: "Ẹ kú àárọ̀ o ! Orúkọ wa dúró fún ìgbẹ́kẹ̀lé, ìmọ̀lẹ̀ àti ìṣọ̀kan. Ẹ jẹ́ ká jọ ṣe ohun tó dára jù lọ fún ọ̀la wa."
  },
  {
    id: 'swahili-marque',
    title: 'Swahili',
    category: 'Voix Africaines',
    recommendedVoice: 'af-zuri',
    recommendedTone: 'energique',
    recommendedLanguageId: 'sw-ea',
    text: "Habari zenu ! Leo tunasherehekea ubora, uhalisi na ubunifu wa Afrika. Pamoja, tunajenga kesho yenye mwanga na mafanikio."
  }
];
