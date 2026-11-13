import React from 'react';
import { Sliders, Feather, Zap, BookOpen } from 'lucide-react';
import { GEMINI_TONES } from '../constants/tones';
import { ToneId } from '../types/tts';

interface ToneSelectorProps {
  selectedToneId: ToneId;
  onSelectTone: (toneId: ToneId) => void;
  disabled?: boolean;
}

const TONE_ICONS = {
  calme: Feather,
  energique: Zap,
  narrateur: BookOpen
};

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedToneId,
  onSelectTone,
  disabled = false
}) => {
  const tonesList = Object.values(GEMINI_TONES);

  return (
    <div className="bg-[#1B1B21] border border-[#2A2A36] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sliders className="w-5 h-5 text-[#C6FF5B]" />
        <h2 className="font-semibold text-base sm:text-lg text-[#F4F4F5]">
          Intention et style vocal
        </h2>
      </div>

      <p className="text-xs text-[#9CA3AF]">
        L’intention sélectionnée guide l’inflexion, le tempo et l’émotion sans être prononcée à haute voix.
      </p>

      {/* 3 Selectable Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
        {tonesList.map((tone) => {
          const isSelected = selectedToneId === tone.id;
          const Icon = TONE_ICONS[tone.id as ToneId] || BookOpen;

          return (
            <button
              key={tone.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTone(tone.id as ToneId)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#24252E] border-[#C6FF5B] ring-1 ring-[#C6FF5B]/40 shadow-[0_0_18px_rgba(198,255,91,0.12)]'
                  : 'bg-[#14151B]/80 border-[#262732] hover:border-[#383948] hover:bg-[#181922]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                      isSelected
                        ? 'bg-[#C6FF5B] text-[#101114]'
                        : 'bg-[#1F2028] text-[#A1A1AA]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-sm text-[#F4F4F5]">
                    {tone.label}
                  </span>
                </div>

                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 transition ${
                    isSelected
                      ? 'border-[#C6FF5B] bg-[#C6FF5B]'
                      : 'border-[#3E404E]'
                  }`}
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-[#C6FF5B]">
                  {tone.tagline}
                </div>
                <p className="text-[11px] sm:text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                  {tone.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
