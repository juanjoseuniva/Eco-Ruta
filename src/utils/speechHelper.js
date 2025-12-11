import * as Speech from 'expo-speech';

export const speakGuidance = (text) => {
  Speech.stop();
  Speech.speak(text, {
    language: 'es-ES',
    rate: 0.85,
    pitch: 1.0,
  });
};