import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GameQuestion, AudioData, SizeTarget } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We cache the audio context to reuse it
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000,
    });
  }
  return audioContext;
};

// Helper to decode base64 audio
const decodeAudioData = async (base64String: string): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const ctx = getAudioContext();
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const numChannels = 1;
  const sampleRate = 24000;
  
  const buffer = ctx.createBuffer(numChannels, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < channelData.length; i++) {
    // Convert Int16 to Float32 [-1.0, 1.0]
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  return buffer;
};

export const playAudio = async (base64Audio: string) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const buffer = await decodeAudioData(base64Audio);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  } catch (error) {
    console.error("Audio playback error:", error);
  }
};

export const generateGameQuestion = async (): Promise<GameQuestion> => {
  // Ask Gemini to pick a random object and return Chinese text
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Generate a simple game question for a 4-year-old learning about sizes. Pick a random, cute object (animal, fruit, toy) and a target size (big or small). Return JSON. The 'objectName' MUST be in Simplified Chinese (Mandarin).",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          objectName: { type: Type.STRING, description: "Name of the object in Simplified Chinese, e.g., '苹果', '狮子'" },
          emoji: { type: Type.STRING, description: "A single emoji representing the object" },
          targetAttribute: { type: Type.STRING, enum: ["big", "small"] },
          colorHex: { type: Type.STRING, description: "A soft pastel background color hex code suitable for this object" }
        },
        required: ["objectName", "emoji", "targetAttribute", "colorHex"],
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as GameQuestion;
};

export const generateVoicePrompt = async (question: GameQuestion): Promise<string> => {
  const targetText = question.targetAttribute === 'big' ? '大的' : '小的';
  // Chinese prompt
  const promptText = `Say cheerfully and slowly in Chinese: "请找出${targetText}${question.objectName}"`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: {
      parts: [{ text: promptText }]
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }
        }
      }
    }
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) {
    throw new Error("No audio data returned");
  }

  return audioData;
};

export const generateSuccessAudio = async (): Promise<string> => {
  const phrases = ["太棒了！", "答对了！", "真聪明！", "好极了！"];
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: { parts: [{ text: `Say enthusiastically in Chinese: ${randomPhrase}` }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
    }
  });
  
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
}

export const generateFailureAudio = async (): Promise<string> => {
  const phrases = ["哎呀，不对哦。", "下次加油！", "那个不是哦。"];
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: { parts: [{ text: `Say gently and encouragingly in Chinese: ${randomPhrase}` }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
    }
  });
  
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
}