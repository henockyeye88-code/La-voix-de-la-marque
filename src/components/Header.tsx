import React from 'react';
import { Volume2, Sparkles, AlertCircle, Mic2, Users } from 'lucide-react';

interface HeaderProps {
  apiConfigured: boolean;
  modelName: string;
  activeTab: 'studio' | 'avatars';
  onTabChange: (tab: 'studio' | 'avatars') => void;
  avatarCount: number;
  maxAvatars: number;
}

export const Header: React.FC<HeaderProps> = ({
  apiConfigured,
  modelName,
  activeTab,
  onTabChange,
  avatarCount,
  maxAvatars
}) => {
  return (
    <header className="border-b border-[#23232C] bg-[#14151B]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div
            onClick={() => onTabChange('studio')}
            className="w-11 h-11 rounded-xl bg-[#1B1B21] border border-[#2B2B36] flex items-center justify-center text-[#C6FF5B] shadow-[0_0_20px_rgba(198,255,91,0.15)] cursor-pointer"
          >
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => onTabChange('studio')}
                className="text-lg sm:text-xl font-bold tracking-tight text-[#F4F4F5] cursor-pointer hover:text-white transition"
              >
                La voix de la marque
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#C6FF5B]/10 text-[#C6FF5B] border border-[#C6FF5B]/20">
                <Sparkles className="w-2.5 h-2.5" /> Studio TTS
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] tracking-wide hidden sm:block">
              Votre texte. Votre voix. Votre identité.
            </p>
          </div>
        </div>

        {/* Center: Navigation tabs */}
        <nav className="flex items-center gap-1 bg-[#1A1A22] p-1.5 rounded-2xl border border-[#282937]">
          <button
            type="button"
            onClick={() => onTabChange('studio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-[#C6FF5B] text-[#101114] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F4F4F5] hover:bg-[#22232E]'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Studio Voix off</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('avatars')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'avatars'
                ? 'bg-[#C6FF5B] text-[#101114] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F4F4F5] hover:bg-[#22232E]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mes avatars vocaux</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'avatars'
                  ? 'bg-[#101114] text-[#C6FF5B]'
                  : 'bg-[#262734] text-[#A1A1AA]'
              }`}
            >
              {avatarCount}/{maxAvatars}
            </span>
          </button>
        </nav>

        {/* Right: API connection status badge */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1B1B21] border border-[#2B2B36] text-xs">
            {apiConfigured ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6FF5B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C6FF5B]"></span>
                </span>
                <span className="text-[#E4E4E7] font-medium hidden lg:inline">Gemini TTS actif</span>
                <span className="text-[#9CA3AF] font-mono text-[11px] hidden xl:inline">({modelName})</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium text-xs">Clé API en attente</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
