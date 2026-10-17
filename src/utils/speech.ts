/**
 * Web Speech API Utility for Chemistry Scientific & Vietnamese Element Pronunciations
 */

export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

export const speakElementName = (
  text: string,
  lang: 'en' | 'vi' = 'en',
  onStart?: () => void,
  onEnd?: () => void,
  rate = 0.95
) => {
  if (!isSpeechSupported()) {
    console.warn('Web Speech API is not supported in this browser environment.');
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'en' ? 'en-US' : 'vi-VN';
  utterance.rate = rate; // slightly relaxed for clear pronunciation
  utterance.pitch = 1.0;

  // Try to find native voice
  const voices = window.speechSynthesis.getVoices();
  const targetPrefix = lang === 'en' ? 'en' : 'vi';
  const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.error('Speech error:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};
