import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Activity } from 'lucide-react';
import { formatDurationMMSS } from '../utils/textStats';
import { GEMINI_TONES } from '../constants/tones';
import { ToneId } from '../types/tts';

interface AudioStudioPlayerProps {
  audioBlob: Blob | null;
  audioUrl: string | null;
  voiceName: string;
  toneId: ToneId;
  scriptText?: string;
}

export const AudioStudioPlayer: React.FC<AudioStudioPlayerProps> = ({
  audioUrl,
  voiceName,
  toneId,
  scriptText
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Sync audio element when url changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setIsReady(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio playback error:', e);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsReady(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.8);
      audioRef.current.volume = 0.8;
    }
  };

  const tone = GEMINI_TONES[toneId];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl) return null;

  return (
    <div className="bg-[#1B1B21] border border-[#2A2A36] rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Top Header with active metadata */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#23232C] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#C6FF5B]" />
          <h3 className="font-bold text-base sm:text-lg text-[#F4F4F5]">
            Lecteur Studio Haute Définition
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-[#24252E] text-[#C6FF5B] border border-[#C6FF5B]/30 font-medium">
            Voix : {voiceName}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#24252E] text-[#D4D4D8] border border-[#32323E] font-medium">
            Style : {tone?.label || toneId}
          </span>
          <span className="px-2 py-1 rounded-md bg-[#14151B] text-[#9CA3AF] border border-[#23232C] font-mono text-[11px] hidden sm:inline">
            24 kHz • WAV Mono
          </span>
        </div>
      </div>

      {/* Waveform / Visualizer Animation */}
      <div className="h-16 bg-[#14151B] rounded-xl px-4 flex items-center justify-center gap-1.5 overflow-hidden border border-[#23232C]">
        {[40, 65, 85, 30, 95, 70, 50, 100, 75, 45, 90, 60, 35, 80, 55, 90, 65, 40, 85, 50, 75, 95, 45, 70, 60].map(
          (heightPercent, idx) => {
            const barProgress = (idx / 25) * 100;
            const isPassed = barProgress <= progressPercent;
            return (
              <div
                key={idx}
                className="w-1.5 rounded-full transition-all duration-150"
                style={{
                  height: isPlaying ? `${Math.max(12, (heightPercent * (0.4 + Math.random() * 0.6)))}%` : `${Math.max(10, heightPercent * 0.4)}%`,
                  backgroundColor: isPassed ? '#C6FF5B' : '#2D2D3A',
                  boxShadow: isPlaying && isPassed ? '0 0 8px rgba(198,255,91,0.5)' : 'none'
                }}
              />
            );
          }
        )}
      </div>

      {/* Scrubber Timeline */}
      <div className="flex flex-col gap-1.5">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-[#23232C] rounded-lg appearance-none cursor-pointer accent-[#C6FF5B]"
          />
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-[#9CA3AF]">
          <span className="text-[#C6FF5B]">{formatDurationMMSS(currentTime)}</span>
          <span>{formatDurationMMSS(duration)}</span>
        </div>
      </div>

      {/* Controls Bar: Play/Pause, Replay, Volume */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
        <div className="flex items-center gap-3">
          {/* Main Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-xl bg-[#C6FF5B] hover:bg-[#b8f547] text-[#101114] flex items-center justify-center transition shadow-[0_0_20px_rgba(198,255,91,0.25)] hover:scale-105 cursor-pointer"
            title={isPlaying ? 'Mettre en pause' : 'Écouter'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Replay */}
          <button
            type="button"
            onClick={handleRestart}
            className="w-10 h-10 rounded-xl bg-[#23232C] hover:bg-[#2C2C38] text-[#E4E4E7] border border-[#32323E] flex items-center justify-center transition cursor-pointer"
            title="Reprendre au début"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleMute}
            className="text-[#9CA3AF] hover:text-[#F4F4F5] transition cursor-pointer"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 sm:w-24 h-1.5 bg-[#23232C] rounded-lg appearance-none cursor-pointer accent-[#C6FF5B]"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
};
