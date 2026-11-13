import test from 'node:test';
import assert from 'node:assert/strict';
import { parseWavHeader, wavToMp3, generateAudioFilename } from './audioConversion';

// Helper to synthesize a valid WAV file in memory
function createTestWav(sampleRate = 24000, numChannels = 1, numSamples = 2400): Uint8Array {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = numSamples * 2;
  const buffer = new Uint8Array(44 + dataSize);
  const view = new DataView(buffer.buffer);

  // RIFF header
  buffer.set([0x52, 0x49, 0x46, 0x46], 0); // 'RIFF'
  view.setUint32(4, 36 + dataSize, true);
  buffer.set([0x57, 0x41, 0x56, 0x45], 8); // 'WAVE'

  // fmt subchunk
  buffer.set([0x66, 0x6d, 0x74, 0x20], 12); // 'fmt '
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16 bits per sample

  // data subchunk
  buffer.set([0x64, 0x61, 0x74, 0x61], 36); // 'data'
  view.setUint32(40, dataSize, true);

  // Fill with a simple 440Hz sine wave
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.floor(Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 16000);
    view.setInt16(44 + i * 2, sample, true);
  }

  return buffer;
}

test('parseWavHeader parses valid RIFF/WAVE 24kHz mono audio', () => {
  const wav = createTestWav(24000, 1, 2400);
  const meta = parseWavHeader(wav);

  assert.equal(meta.isValid, true);
  assert.equal(meta.sampleRate, 24000);
  assert.equal(meta.numChannels, 1);
  assert.equal(meta.bitsPerSample, 16);
  assert.equal(meta.dataOffset, 44);
  assert.equal(meta.dataLength, 4800);
});

test('parseWavHeader rejects truncated or invalid headers', () => {
  const shortBuffer = new Uint8Array(20);
  const meta1 = parseWavHeader(shortBuffer);
  assert.equal(meta1.isValid, false);

  const corruptedRiff = new Uint8Array(50);
  const meta2 = parseWavHeader(corruptedRiff);
  assert.equal(meta2.isValid, false);
});

test('wavToMp3 successfully converts WAV PCM to MP3 audio stream', () => {
  const wav = createTestWav(24000, 1, 4800); // 0.2s of audio
  const mp3 = wavToMp3(wav, 128);

  assert.ok(mp3.length > 0, 'MP3 output should not be empty');
  // First two bytes of MP3 frame typically start with sync word 0xFF 0xFB or 0xE0+
  assert.equal(mp3[0], 0xff, 'First byte of MP3 frame should be 0xFF');
});

test('generateAudioFilename formats clean extension and date', () => {
  const mp3Name = generateAudioFilename('mp3', 'Kore');
  assert.ok(mp3Name.startsWith('la-voix-de-la-marque-kore-'));
  assert.ok(mp3Name.endsWith('.mp3'));

  const wavName = generateAudioFilename('wav');
  assert.ok(wavName.startsWith('la-voix-de-la-marque-'));
  assert.ok(wavName.endsWith('.wav'));
});
