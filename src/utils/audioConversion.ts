import { Mp3Encoder } from '@breezystack/lamejs';

export interface WavMetadata {
  isValid: boolean;
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
  dataOffset: number;
  dataLength: number;
  error?: string;
}

/**
 * Parses and validates a standard RIFF/WAVE header.
 */
export function parseWavHeader(buffer: ArrayBuffer | Uint8Array): WavMetadata {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  if (bytes.length < 44) {
    return {
      isValid: false,
      numChannels: 0,
      sampleRate: 0,
      bitsPerSample: 0,
      dataOffset: 0,
      dataLength: 0,
      error: 'Taille du fichier audio insuffisante (< 44 octets)'
    };
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // Check 'RIFF'
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (riff !== 'RIFF') {
    return {
      isValid: false,
      numChannels: 0,
      sampleRate: 0,
      bitsPerSample: 0,
      dataOffset: 0,
      dataLength: 0,
      error: 'Format non reconnu : signature RIFF manquante'
    };
  }

  // Check 'WAVE'
  const wave = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (wave !== 'WAVE') {
    return {
      isValid: false,
      numChannels: 0,
      sampleRate: 0,
      bitsPerSample: 0,
      dataOffset: 0,
      dataLength: 0,
      error: 'Format non reconnu : signature WAVE manquante'
    };
  }

  let numChannels = 1;
  let sampleRate = 24000;
  let bitsPerSample = 16;
  let dataOffset = 0;
  let dataLength = 0;
  let offset = 12;

  // Walk through chunks to find 'fmt ' and 'data'
  while (offset + 8 <= bytes.length) {
    const chunkId = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3]
    );
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'fmt ') {
      // Audio format at offset + 8 (1 = PCM)
      numChannels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataLength = Math.min(chunkSize, bytes.length - dataOffset);
      break;
    }

    offset += 8 + chunkSize;
  }

  // Fallback to standard 44-byte WAV layout if chunk walking missed 'data'
  if (dataOffset === 0 && bytes.length > 44) {
    dataOffset = 44;
    dataLength = bytes.length - 44;
  }

  return {
    isValid: dataOffset > 0 && dataLength > 0,
    numChannels: numChannels || 1,
    sampleRate: sampleRate || 24000,
    bitsPerSample: bitsPerSample || 16,
    dataOffset,
    dataLength
  };
}

/**
 * Converts a WAV audio buffer into true MP3 bytes using lamejs.
 */
export function wavToMp3(
  wavBuffer: ArrayBuffer | Uint8Array,
  kbps: number = 192
): Uint8Array {
  const bytes = wavBuffer instanceof Uint8Array ? wavBuffer : new Uint8Array(wavBuffer);
  const metadata = parseWavHeader(bytes);

  if (!metadata.isValid) {
    throw new Error(metadata.error || 'Fichier WAV invalide');
  }

  const { numChannels, sampleRate, dataOffset, dataLength } = metadata;
  const rawPcmBytes = bytes.subarray(dataOffset, dataOffset + dataLength);

  // Convert raw 16-bit little-endian PCM bytes into Int16Array
  const sampleCount = Math.floor(rawPcmBytes.length / 2);
  const samples = new Int16Array(sampleCount);
  const view = new DataView(rawPcmBytes.buffer, rawPcmBytes.byteOffset, rawPcmBytes.byteLength);

  for (let i = 0; i < sampleCount; i++) {
    samples[i] = view.getInt16(i * 2, true);
  }

  const encoder = new Mp3Encoder(numChannels, sampleRate, kbps);
  const mp3Buffers: Uint8Array[] = [];
  const sampleBlockSize = 1152;

  if (numChannels === 1) {
    // Mono encoding
    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const chunk = samples.subarray(i, i + sampleBlockSize);
      const mp3buf = encoder.encodeBuffer(chunk);
      if (mp3buf && mp3buf.length > 0) {
        mp3Buffers.push(new Uint8Array(mp3buf));
      }
    }
  } else {
    // Stereo: de-interleave into left and right channels
    const frames = Math.floor(samples.length / 2);
    const left = new Int16Array(frames);
    const right = new Int16Array(frames);
    for (let i = 0; i < frames; i++) {
      left[i] = samples[i * 2];
      right[i] = samples[i * 2 + 1];
    }
    for (let i = 0; i < frames; i += sampleBlockSize) {
      const leftChunk = left.subarray(i, i + sampleBlockSize);
      const rightChunk = right.subarray(i, i + sampleBlockSize);
      const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf && mp3buf.length > 0) {
        mp3Buffers.push(new Uint8Array(mp3buf));
      }
    }
  }

  const flushBuf = encoder.flush();
  if (flushBuf && flushBuf.length > 0) {
    mp3Buffers.push(new Uint8Array(flushBuf));
  }

  // Combine MP3 buffers into a single contiguous Uint8Array
  const totalLength = mp3Buffers.reduce((sum, buf) => sum + buf.length, 0);
  const result = new Uint8Array(totalLength);
  let currentOffset = 0;
  for (const buf of mp3Buffers) {
    result.set(buf, currentOffset);
    currentOffset += buf.length;
  }

  return result;
}

/**
 * Creates a clean timestamped filename for downloaded audio
 */
export function generateAudioFilename(format: 'mp3' | 'wav', voiceName?: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const voiceTag = voiceName ? `-${voiceName.toLowerCase()}` : '';
  return `la-voix-de-la-marque${voiceTag}-${year}-${month}-${day}_${hours}h${minutes}.${format}`;
}

/**
 * Triggers a file download directly in the browser.
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
