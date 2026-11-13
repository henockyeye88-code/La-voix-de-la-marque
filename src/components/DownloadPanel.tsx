import React, { useState } from 'react';
import { Download, CheckCircle2, Music, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { wavToMp3, generateAudioFilename, triggerFileDownload } from '../utils/audioConversion';

interface DownloadPanelProps {
  wavBuffer: Uint8Array | null;
  voiceName: string;
}

export const DownloadPanel: React.FC<DownloadPanelProps> = ({ wavBuffer, voiceName }) => {
  const [isConvertingMp3, setIsConvertingMp3] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!wavBuffer || wavBuffer.length === 0) return null;

  const handleDownloadMp3 = async () => {
    try {
      setIsConvertingMp3(true);
      setDownloadError(null);

      // Allow UI tick so loading spinner renders
      await new Promise((r) => setTimeout(r, 40));

      const mp3Bytes = wavToMp3(wavBuffer, 192);
      const mp3Blob = new Blob([mp3Bytes as unknown as BlobPart], { type: 'audio/mp3' });
      const filename = generateAudioFilename('mp3', voiceName);

      triggerFileDownload(mp3Blob, filename);
      setDownloadSuccess('Fichier MP3 téléchargé !');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err: any) {
      console.error('MP3 conversion error:', err);
      setDownloadError('Erreur lors de la conversion MP3 : ' + (err.message || 'Format non reconnu'));
    } finally {
      setIsConvertingMp3(false);
    }
  };

  const handleDownloadWav = () => {
    try {
      setDownloadError(null);
      const wavBlob = new Blob([wavBuffer as unknown as BlobPart], { type: 'audio/wav' });
      const filename = generateAudioFilename('wav', voiceName);

      triggerFileDownload(wavBlob, filename);
      setDownloadSuccess('Fichier WAV original téléchargé !');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err: any) {
      console.error('WAV download error:', err);
      setDownloadError('Erreur lors du téléchargement WAV : ' + (err.message || ''));
    }
  };

  return (
    <div className="bg-[#1B1B21] border border-[#2A2A36] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-[#C6FF5B]" />
          <h3 className="font-semibold text-base sm:text-lg text-[#F4F4F5]">
            Téléchargement audio gratuit & haute fidélité
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#C6FF5B] font-medium bg-[#C6FF5B]/10 px-2.5 py-1 rounded-full border border-[#C6FF5B]/20">
          <ShieldCheck className="w-3.5 h-3.5" /> Sans filigrane • Libre de droits
        </div>
      </div>

      <p className="text-xs text-[#9CA3AF]">
        Exportez immédiatement votre voix off prête pour vos montages vidéo, spots publicitaires ou podcasts.
      </p>

      {downloadError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-[#C6FF5B]/10 border border-[#C6FF5B]/30 text-[#C6FF5B] text-xs flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Download Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Primary MP3 Download */}
        <button
          type="button"
          onClick={handleDownloadMp3}
          disabled={isConvertingMp3}
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#C6FF5B] hover:bg-[#bbf54e] text-[#101114] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,255,91,0.2)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60"
        >
          {isConvertingMp3 ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#101114]" />
              <span>Encodage MP3 en cours…</span>
            </>
          ) : (
            <>
              <Music className="w-4 h-4" />
              <span>Télécharger en MP3 (192 kbps)</span>
            </>
          )}
        </button>

        {/* Secondary WAV Download */}
        <button
          type="button"
          onClick={handleDownloadWav}
          disabled={isConvertingMp3}
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#23232C] hover:bg-[#2C2C38] text-[#E4E4E7] font-semibold text-sm border border-[#32323E] hover:border-[#424252] transition cursor-pointer disabled:opacity-60"
        >
          <Download className="w-4 h-4 text-[#C6FF5B]" />
          <span>Télécharger en WAV (Master 24 kHz)</span>
        </button>
      </div>
    </div>
  );
};
