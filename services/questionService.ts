import { GameQuestion, GameObject } from './types';

// 预定义的物品对，每个对包含一个大物品和一个小物品
const OBJECT_PAIRS: { big: GameObject; small: GameObject }[] = [
  // 动物类
  { 
    big: { name: '大象', emoji: '🐘', colorHex: '#B3E5FC', isBig: true },
    small: { name: '老鼠', emoji: '🐭', colorHex: '#C5CAE9', isBig: false }
  },
  { 
    big: { name: '鲸鱼', emoji: '🐋', colorHex: '#80DEEA', isBig: true },
    small: { name: '小鱼', emoji: '🐠', colorHex: '#B39DDB', isBig: false }
  },
  { 
    big: { name: '长颈鹿', emoji: '🦒', colorHex: '#FFAB91', isBig: true },
    small: { name: '小鸟', emoji: '🐦', colorHex: '#DCEDC8', isBig: false }
  },
  { 
    big: { name: '老虎', emoji: '🐯', colorHex: '#FFAB91', isBig: true },
    small: { name: '小猫', emoji: '🐱', colorHex: '#D7CCC8', isBig: false }
  },
  
  // 水果类
  { 
    big: { name: '西瓜', emoji: '🍉', colorHex: '#C8E6C9', isBig: true },
    small: { name: '草莓', emoji: '🍓', colorHex: '#F8BBD0', isBig: false }
  },
  { 
    big: { name: '菠萝', emoji: '🍍', colorHex: '#FFF9C4', isBig: true },
    small: { name: '葡萄', emoji: '🍇', colorHex: '#E1BEE7', isBig: false }
  },
  { 
    big: { name: '椰子', emoji: '🥥', colorHex: '#FFE0B2', isBig: true },
    small: { name: '樱桃', emoji: '🍒', colorHex: '#F8BBD0', isBig: false }
  },
  
  // 日常物品类
  { 
    big: { name: '汽车', emoji: '🚗', colorHex: '#B39DDB', isBig: true },
    small: { name: '自行车', emoji: '🚲', colorHex: '#FFCC80', isBig: false }
  },
  { 
    big: { name: '房子', emoji: '🏠', colorHex: '#FFAB91', isBig: true },
    small: { name: '帐篷', emoji: '⛺', colorHex: '#80DEEA', isBig: false }
  },
  { 
    big: { name: '书包', emoji: '🎒', colorHex: '#D7CCC8', isBig: true },
    small: { name: '铅笔', emoji: '✏️', colorHex: '#FFECB3', isBig: false }
  },
  
  // 自然类
  { 
    big: { name: '大树', emoji: '🌳', colorHex: '#A5D6A7', isBig: true },
    small: { name: '小花', emoji: '🌷', colorHex: '#F48FB1', isBig: false }
  },
  { 
    big: { name: '太阳', emoji: '☀️', colorHex: '#FFECB3', isBig: true },
    small: { name: '星星', emoji: '⭐', colorHex: '#E1BEE7', isBig: false }
  },
  { 
    big: { name: '大山', emoji: '⛰️', colorHex: '#A1887F', isBig: true },
    small: { name: '石头', emoji: '🪨', colorHex: '#BCAAA4', isBig: false }
  },
  
  // 食物类
  { 
    big: { name: '披萨', emoji: '🍕', colorHex: '#FFCDD2', isBig: true },
    small: { name: '糖果', emoji: '🍬', colorHex: '#F8BBD0', isBig: false }
  },
  { 
    big: { name: '汉堡', emoji: '🍔', colorHex: '#FFE0B2', isBig: true },
    small: { name: '薯条', emoji: '🍟', colorHex: '#FFF9C4', isBig: false }
  }
];

// 成功和失败短语
const SUCCESS_PHRASES = ["太棒了！", "答对了！", "真聪明！", "好极了！", "做得对！"];
const FAILURE_PHRASES = ["哎呀，不对哦。", "不对，下次加油！", "那个不是哦。", "再试一次吧！", "好好想一下哦。"];

// Audio context for playing sounds
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Simple beep sounds for feedback
const generateBeep = (frequency: number, duration: number): AudioBuffer => {
  const ctx = getAudioContext();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.sin(2 * Math.PI * frequency * i / ctx.sampleRate) * 0.3 * 
              Math.pow(0.5, i / (ctx.sampleRate * duration));
  }
  
  return buffer;
};

export const playAudio = async (buffer: AudioBuffer) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  } catch (error) {
    console.error("Audio playback error:", error);
  }
};


export const generateGameQuestion = async (): Promise<GameQuestion> => {
  // 随机选择一对物品
  const randomPair = OBJECT_PAIRS[Math.floor(Math.random() * OBJECT_PAIRS.length)];
  
  // 随机决定问题是找大的还是小的
  const targetAttribute = Math.random() > 0.5 ? 'big' : 'small' as 'big' | 'small';
  
  // 随机决定两个物品的显示顺序
  const shouldSwap = Math.random() > 0.5;
  
  let object1, object2, correctObject;
  
  if (shouldSwap) {
    object1 = randomPair.small;
    object2 = randomPair.big;
    correctObject = targetAttribute === 'big' ? 2 : 1;
  } else {
    object1 = randomPair.big;
    object2 = randomPair.small;
    correctObject = targetAttribute === 'big' ? 1 : 2;
  }
  
  return {
    object1,
    object2,
    targetAttribute,
    correctObject
  };
};

// 修改 generateVoicePrompt 函数，返回语音文本和音频
export const generateVoicePrompt = async (question: GameQuestion): Promise<{audio: AudioBuffer, promptText: string}> => {
  const targetText = question.targetAttribute === 'big' ? '大' : '小';
  
  // 生成语音文本
  const promptText = `请找出${question.object1.name}和${question.object2.name}中，${targetText}的那个`;
  
  // 播放语音
  await speakText(promptText);
  
  // 返回音频和文本
  return {
    audio: generateBeep(440, 0.5),
    promptText: promptText
  };
};

// 添加 speakText 函数（如果还没有）
export const speakText = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event);
    
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice => 
      voice.lang.includes('zh') || voice.lang.includes('CN') || voice.lang.includes('zh-CN')
    );
    
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  });
};

export const generateSuccessAudio = async (): Promise<AudioBuffer> => {
  const randomPhrase = SUCCESS_PHRASES[Math.floor(Math.random() * SUCCESS_PHRASES.length)];
  await speakText(randomPhrase);
  return generateBeep(523.25, 0.3);
};

export const generateFailureAudio = async (): Promise<AudioBuffer> => {
  const randomPhrase = FAILURE_PHRASES[Math.floor(Math.random() * FAILURE_PHRASES.length)];
  await speakText(randomPhrase);
  return generateBeep(349.23, 0.4);
};

// 初始化语音合成
if (typeof window !== 'undefined') {
  if (!window.speechSynthesis) {
    console.warn('Web Speech API not supported. Audio will be limited to beep sounds.');
  }
}