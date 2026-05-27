export interface Note {
  id: string;
  pitch: string;
  step: number;
  duration: number;
  velocity: number;
}

export interface DrumHit {
  id: string;
  step: number;
  instrument: DrumInstrument;
  velocity: number;
}

export type DrumInstrument = "kick" | "snare" | "hihat" | "tom" | "clap" | "cymbal";

export const DRUM_INSTRUMENTS: { key: DrumInstrument; name: string; emoji: string; color: string }[] = [
  { key: "kick", name: "底鼓", emoji: "🥁", color: "bg-vermilion" },
  { key: "snare", name: "军鼓", emoji: "🪘", color: "bg-gold" },
  { key: "hihat", name: "踩镲", emoji: "🔔", color: "bg-jade" },
  { key: "tom", name: "通鼓", emoji: "🎯", color: "bg-indigo" },
  { key: "clap", name: "拍手", emoji: "👏", color: "bg-ink" },
  { key: "cymbal", name: "镲片", emoji: "💿", color: "bg-gold-dark" },
];

export interface Track {
  id: string;
  name: string;
  notes: Note[];
  instrument: InstrumentType;
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number;
}

export type InstrumentType =
  | "synth"
  | "guzheng"
  | "pipa"
  | "erhu"
  | "flute"
  | "piano";

export const INSTRUMENTS: { key: InstrumentType; name: string; emoji: string }[] = [
  { key: "synth", name: "合成器", emoji: "🎹" },
  { key: "guzheng", name: "古筝", emoji: "🎵" },
  { key: "pipa", name: "琵琶", emoji: "🎸" },
  { key: "erhu", name: "二胡", emoji: "🎻" },
  { key: "flute", name: "笛子", emoji: "🎶" },
  { key: "piano", name: "钢琴", emoji: "🎹" },
];

export interface Melody {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  bpm: number;
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  tracks: Track[];
  drumHits: DrumHit[];
  scale: PentatonicScale;
  style: MusicStyle;
  rhythmTemplate: RhythmTemplateType;
}

export type PentatonicScale = "gong" | "shang" | "jue" | "zhi" | "yu";

export interface ScaleInfo {
  name: string;
  intervals: number[];
  description: string;
  character: string;
}

export const PENTATONIC_SCALES: Record<PentatonicScale, ScaleInfo> = {
  gong: {
    name: "宫调式",
    intervals: [0, 2, 4, 7, 9],
    description: "明亮、庄重、典雅",
    character: "君",
  },
  shang: {
    name: "商调式",
    intervals: [2, 4, 7, 9, 12],
    description: "清新、悠扬、抒情",
    character: "臣",
  },
  jue: {
    name: "角调式",
    intervals: [4, 7, 9, 12, 14],
    description: "柔和、细腻、含蓄",
    character: "民",
  },
  zhi: {
    name: "徵调式",
    intervals: [7, 9, 12, 14, 17],
    description: "欢快、热烈、活泼",
    character: "事",
  },
  yu: {
    name: "羽调式",
    intervals: [9, 12, 14, 17, 19],
    description: "深沉、抒情、优美",
    character: "物",
  },
};

export type MusicStyle = "classical" | "joyful" | "elegant" | "deep" | "lively";

export interface StyleInfo {
  name: string;
  description: string;
  oscillator: ToneOscillatorType;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  effect: "none" | "reverb" | "delay" | "chorus";
  emoji: string;
}

export const MUSIC_STYLES: Record<MusicStyle, StyleInfo> = {
  classical: {
    name: "古风典雅",
    description: "传统国风范，音色温润含蓄",
    oscillator: "triangle",
    envelope: { attack: 0.08, decay: 0.2, sustain: 0.4, release: 1.2 },
    effect: "reverb",
    emoji: "🏯",
  },
  joyful: {
    name: "欢快活泼",
    description: "明亮轻快，富有活力",
    oscillator: "square",
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.6 },
    effect: "none",
    emoji: "🎊",
  },
  elegant: {
    name: "悠扬抒情",
    description: "柔和绵长，如流水般",
    oscillator: "sine",
    envelope: { attack: 0.15, decay: 0.3, sustain: 0.6, release: 2.0 },
    effect: "reverb",
    emoji: "🌊",
  },
  deep: {
    name: "深沉厚重",
    description: "低沉饱满，富有韵味",
    oscillator: "sawtooth",
    envelope: { attack: 0.1, decay: 0.4, sustain: 0.3, release: 1.5 },
    effect: "delay",
    emoji: "🌙",
  },
  lively: {
    name: "激昂热烈",
    description: "高亢有力，激情澎湃",
    oscillator: "square",
    envelope: { attack: 0.02, decay: 0.08, sustain: 0.7, release: 0.4 },
    effect: "chorus",
    emoji: "🔥",
  },
};

export type RhythmTemplateType =
  | "none"
  | "simple"
  | "syncopated"
  | "flowing"
  | "marching"
  | "waltz";

export interface RhythmTemplateInfo {
  name: string;
  description: string;
  pattern: number[];
  emoji: string;
}

export const RHYTHM_TEMPLATES: Record<RhythmTemplateType, RhythmTemplateInfo> = {
  none: {
    name: "自由节奏",
    description: "无预设节奏，自由创作",
    pattern: [],
    emoji: "✨",
  },
  simple: {
    name: "简易节奏",
    description: "每拍一个音符，简单清晰",
    pattern: [0, 1, 2, 3, 4, 5, 6, 7],
    emoji: "🎵",
  },
  syncopated: {
    name: "切分节奏",
    description: "反拍切分，富有动感",
    pattern: [0, 1.5, 3, 4.5, 6, 7.5],
    emoji: "⚡",
  },
  flowing: {
    name: "流水节奏",
    description: "八分音符连绵不断",
    pattern: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5],
    emoji: "💧",
  },
  marching: {
    name: "进行曲",
    description: "强拍突出，铿锵有力",
    pattern: [0, 2, 4, 6],
    emoji: "🎺",
  },
  waltz: {
    name: "华尔兹",
    description: "三拍子优雅节奏",
    pattern: [0, 1, 2, 4, 5, 6],
    emoji: "💃",
  },
};

export const PENTATONIC_NOTES = ["C", "D", "E", "G", "A"];

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const OCTAVES = [3, 4, 5, 6];

export type ToneOscillatorType = "sine" | "square" | "sawtooth" | "triangle";

export interface RecordingState {
  isRecording: boolean;
  recordedNotes: Note[];
  startTime: number | null;
}

export interface SelectionRange {
  startStep: number;
  endStep: number;
  startPitch: string;
  endPitch: string;
}

export interface ClipboardData {
  notes: Note[];
  sourceTrackId: string;
  offsetStep: number;
}

export type EffectType = "reverb" | "delay" | "chorus" | "distortion" | "tremolo" | "vibrato" | "phaser";

export interface EffectConfig {
  type: EffectType;
  enabled: boolean;
  wet: number;
  params: Record<string, number>;
}

export const EFFECT_TYPES: { key: EffectType; name: string; emoji: string }[] = [
  { key: "reverb", name: "混响", emoji: "🏛️" },
  { key: "delay", name: "延迟", emoji: "🔄" },
  { key: "chorus", name: "合唱", emoji: "🎭" },
  { key: "distortion", name: "失真", emoji: "⚡" },
  { key: "tremolo", name: "颤音", emoji: "〰️" },
  { key: "vibrato", name: "震音", emoji: "🎻" },
  { key: "phaser", name: "移相", emoji: "🌊" },
];

export const DEFAULT_EFFECT_PARAMS: Record<EffectType, Record<string, number>> = {
  reverb: { decay: 2, preDelay: 0.01 },
  delay: { delayTime: 0.25, feedback: 0.3 },
  chorus: { frequency: 4, depth: 0.5 },
  distortion: { distortion: 0.5 },
  tremolo: { frequency: 10, depth: 0.5 },
  vibrato: { frequency: 5, depth: 0.1 },
  phaser: { frequency: 0.5, octaves: 3 },
};

export interface TempoRampPoint {
  step: number;
  bpm: number;
}

export interface TempoRampConfig {
  enabled: boolean;
  points: TempoRampPoint[];
}

export interface TrackEffect {
  trackId: string;
  effects: EffectConfig[];
}

export interface MelodyClip {
  id: string;
  name: string;
  notes: Note[];
  trackId: string;
  startStep: number;
  endStep: number;
  createdAt: number;
}

export interface ProjectFile {
  version: string;
  type: "pentatonic-project";
  createdAt: number;
  updatedAt: number;
  metadata: {
    name: string;
    description?: string;
    author?: string;
    tags?: string[];
  };
  projectData: {
    bpm: number;
    timeSignature: {
      numerator: number;
      denominator: number;
    };
    scale: PentatonicScale;
    style: MusicStyle;
    rhythmTemplate: RhythmTemplateType;
    tracks: Track[];
    drumHits: DrumHit[];
    tempoRamp?: TempoRampConfig;
    trackEffects?: Record<string, EffectConfig[]>;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: "classical" | "folk" | "modern" | "festive" | "emotional";
  difficulty: "beginner" | "intermediate" | "advanced";
  preview: string;
  tags: string[];
  data: {
    bpm: number;
    scale: PentatonicScale;
    style: MusicStyle;
    rhythmTemplate: RhythmTemplateType;
    tracks: Track[];
    drumHits: DrumHit[];
  };
}

export interface TheoryHint {
  id: string;
  title: string;
  content: string;
  category: "scale" | "rhythm" | "harmony" | "expression" | "instrument";
  relatedConcepts?: string[];
  examples?: {
    description: string;
    notes?: { pitch: string; step: number; duration: number }[];
  }[];
}

export interface ExportConfig {
  format: "json" | "midi";
  includeMetadata: boolean;
  filename?: string;
}

export const TEMPLATE_CATEGORIES: { key: Template["category"]; name: string; emoji: string }[] = [
  { key: "classical", name: "古典雅韵", emoji: "🏯" },
  { key: "folk", name: "民间风情", emoji: "🎋" },
  { key: "modern", name: "现代融合", emoji: "🎧" },
  { key: "festive", name: "喜庆节日", emoji: "🎊" },
  { key: "emotional", name: "抒情写意", emoji: "💝" },
];

export const DIFFICULTY_LEVELS: { key: Template["difficulty"]; name: string; emoji: string }[] = [
  { key: "beginner", name: "入门", emoji: "🌱" },
  { key: "intermediate", name: "进阶", emoji: "🌿" },
  { key: "advanced", name: "高级", emoji: "🌳" },
];
