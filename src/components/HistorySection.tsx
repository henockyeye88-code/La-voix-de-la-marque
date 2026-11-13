import React from 'react';
import { History, Trash2, ArrowUpRight, Volume2, Calendar } from 'lucide-react';
import { CreationHistoryItem } from '../types/tts';
import { GEMINI_TONES } from '../constants/tones';

interface HistorySectionProps {
  items: CreationHistoryItem[];
  onLoadScript: (
    fullText: string,
    voiceIdOrName: string,
    toneId: any,
    languageId?: any,
    originalDiction?: boolean
  ) => void;
  onClearHistory: () => void;
  disabled?: boolean;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  items,
  onLoadScript,
  onClearHistory,
  disabled = false
}) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-[#1B1B21] border border-[#2A2A36] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#C6FF5B]" />
          <h3 className="font-semibold text-base sm:text-lg text-[#F4F4F5]">
            Mes dernières créations
          </h3>
          <span className="text-xs text-[#9CA3AF] bg-[#14151B] px-2 py-0.5 rounded-full border border-[#24252E]">
            {items.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          disabled={disabled}
          className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-rose-400 transition cursor-pointer"
          title="Effacer tout l'historique"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Vider l'historique</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
        {items.map((item) => {
          const tone = GEMINI_TONES[item.toneId];
          const dateStr = new Date(item.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
          });

          return (
            <div
              key={item.id}
              className="bg-[#14151B] border border-[#262732] hover:border-[#383948] rounded-xl p-3.5 flex flex-col justify-between gap-3 transition group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1.5">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-[#C6FF5B]" /> {dateStr}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#C6FF5B] font-medium">{item.voiceName}</span>
                    <span>•</span>
                    <span className="text-[#D4D4D8]">{tone?.label || item.toneId}</span>
                  </div>
                </div>

                <p className="text-xs text-[#E4E4E7] line-clamp-2 italic leading-relaxed">
                  « {item.textSnippet} »
                </p>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-[#1F2028]">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onLoadScript(
                      item.fullText,
                      item.voiceId || item.voiceName,
                      item.toneId,
                      item.languageId,
                      item.originalDiction
                    )
                  }
                  className="flex items-center gap-1 text-xs text-[#C6FF5B] hover:text-[#b4f53c] font-medium cursor-pointer"
                >
                  <span>Recharger ce script</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
