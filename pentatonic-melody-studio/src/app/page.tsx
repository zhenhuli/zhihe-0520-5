"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { PianoRoll } from "@/components/PianoRoll";
import { ControlPanel } from "@/components/ControlPanel";
import { ScaleSelector } from "@/components/ScaleSelector";
import { SaveModal } from "@/components/SaveModal";
import { MelodyList } from "@/components/MelodyList";
import { TrackPanel } from "@/components/TrackPanel";
import { DrumPanel } from "@/components/DrumPanel";
import { RhythmTemplatePanel } from "@/components/RhythmTemplatePanel";
import { StyleSelector } from "@/components/StyleSelector";
import { RecordingPanel } from "@/components/RecordingPanel";
import { ClipEditor } from "@/components/ClipEditor";
import { EffectsPanel } from "@/components/EffectsPanel";
import { TempoRampPanel } from "@/components/TempoRampPanel";
import { ProjectManager } from "@/components/ProjectManager";
import { TemplateMarket } from "@/components/TemplateMarket";
import { MelodyExporter } from "@/components/MelodyExporter";
import { TheoryHints } from "@/components/TheoryHints";
import { useAudio } from "@/hooks/useAudio";
import { saveMelody, getMelodies, deleteMelody, generateId } from "@/utils/storage";
import type {
  Note,
  Melody,
  PentatonicScale,
  Track,
  DrumHit,
  MusicStyle,
  RhythmTemplateType,
  InstrumentType,
  SelectionRange,
  ClipboardData,
  EffectConfig,
  TempoRampConfig,
  MelodyClip,
  ProjectFile,
  Template,
} from "@/types";
import { RHYTHM_TEMPLATES, PENTATONIC_NOTES, OCTAVES } from "@/types";

const TOTAL_STEPS = 32;

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "track-1",
      name: "主旋律",
      notes: [],
      instrument: "synth",
      muted: false,
      solo: false,
      volume: 1,
      pan: 0,
    },
  ]);
  const [currentTrackId, setCurrentTrackId] = useState("track-1");
  const [drumHits, setDrumHits] = useState<DrumHit[]>([]);
  const [bpm, setBpm] = useState(90);
  const [scale, setScale] = useState<PentatonicScale>("gong");
  const [style, setStyle] = useState<MusicStyle>("classical");
  const [rhythmTemplate, setRhythmTemplate] = useState<RhythmTemplateType>("none");
  const [melodyName, setMelodyName] = useState("");
  const [melodyId, setMelodyId] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isMelodyListOpen, setIsMelodyListOpen] = useState(false);
  const [savedMelodies, setSavedMelodies] = useState<Melody[]>(() => getMelodies());
  const [activeTab, setActiveTab] = useState<"edit" | "record" | "clip" | "effects" | "tempo">("edit");
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [clips, setClips] = useState<MelodyClip[]>([]);
  const [trackEffects, setTrackEffects] = useState<Record<string, EffectConfig[]>>({});
  const [tempoRamp, setTempoRamp] = useState<TempoRampConfig | null>(null);

  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [isTemplateMarketOpen, setIsTemplateMarketOpen] = useState(false);
  const [isExporterOpen, setIsExporterOpen] = useState(false);
  const [isTheoryHintsOpen, setIsTheoryHintsOpen] = useState(false);

  const {
    isReady,
    isPlaying,
    currentStep,
    isRecording,
    recordedNotes,
    playNote,
    playDrum,
    scheduleNotes,
    scheduleWithTempoRamp,
    start,
    stop,
    pause,
    updateStyle,
    startRecording,
    stopRecording,
    recordNote,
    clearRecordedNotes,
    applyTrackEffects,
  } = useAudio();

  const currentTrack = useMemo(
    () => tracks.find((t) => t.id === currentTrackId) || tracks[0],
    [tracks, currentTrackId]
  );

  const currentNotes = useMemo(
    () => currentTrack?.notes || [],
    [currentTrack]
  );

  useEffect(() => {
    if (isReady) {
      scheduleNotes(tracks, bpm, drumHits, TOTAL_STEPS);
    }
  }, [tracks, bpm, drumHits, isReady, scheduleNotes]);

  useEffect(() => {
    if (isReady) {
      updateStyle(style);
    }
  }, [style, isReady, updateStyle]);

  const handleNoteAdd = useCallback(
    (note: Note) => {
      setTracks((prev) =>
        prev.map((t) =>
          t.id === currentTrackId
            ? { ...t, notes: [...t.notes, note] }
            : t
        )
      );
    },
    [currentTrackId]
  );

  const handleNoteRemove = useCallback(
    (noteId: string) => {
      setTracks((prev) =>
        prev.map((t) =>
          t.id === currentTrackId
            ? { ...t, notes: t.notes.filter((n) => n.id !== noteId) }
            : t
        )
      );
    },
    [currentTrackId]
  );

  const handleTrackMute = useCallback((trackId: string, muted: boolean) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, muted } : t))
    );
  }, []);

  const handleTrackSolo = useCallback((trackId: string, solo: boolean) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, solo } : t))
    );
  }, []);

  const handleTrackVolume = useCallback((trackId: string, volume: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, volume } : t))
    );
  }, []);

  const handleTrackInstrument = useCallback(
    (trackId: string, instrument: InstrumentType) => {
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, instrument } : t))
      );
    },
    []
  );

  const handleTrackRename = useCallback((trackId: string, name: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, name } : t))
    );
  }, []);

  const handleAddTrack = useCallback(() => {
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: `音轨${tracks.length + 1}`,
      notes: [],
      instrument: "synth",
      muted: false,
      solo: false,
      volume: 1,
      pan: 0,
    };
    setTracks((prev) => [...prev, newTrack]);
    setCurrentTrackId(newTrack.id);
  }, [tracks.length]);

  const handleRemoveTrack = useCallback(
    (trackId: string) => {
      if (tracks.length <= 1) return;
      const newTracks = tracks.filter((t) => t.id !== trackId);
      setTracks(newTracks);
      if (currentTrackId === trackId) {
        setCurrentTrackId(newTracks[0].id);
      }
    },
    [tracks, currentTrackId]
  );

  const handleDrumAdd = useCallback((hit: DrumHit) => {
    setDrumHits((prev) => [...prev, hit]);
  }, []);

  const handleDrumRemove = useCallback((hitId: string) => {
    setDrumHits((prev) => prev.filter((h) => h.id !== hitId));
  }, []);

  const handleApplyRhythmTemplate = useCallback(
    (template: RhythmTemplateType) => {
      if (template === "none") return;
      const templateInfo = RHYTHM_TEMPLATES[template];
      const pattern = templateInfo.pattern;

      if (pattern.length === 0) return;

      const currentTrackNotes = tracks.find((t) => t.id === currentTrackId)?.notes || [];
      const existingPitches = currentTrackNotes.length > 0
        ? [...new Set(currentTrackNotes.map((n) => n.pitch))]
        : ["C5", "D5", "E5", "G5", "A5"];

      const newNotes: Note[] = [];
      for (let bar = 0; bar < 4; bar++) {
        const barOffset = bar * 8;
        pattern.forEach((pos, idx) => {
          const step = Math.floor(barOffset + pos);
          if (step < TOTAL_STEPS) {
            const pitch =
              existingPitches[idx % existingPitches.length] || "C5";
            newNotes.push({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${bar}-${idx}`,
              pitch,
              step,
              duration: 1,
              velocity: 0.8,
            });
          }
        });
      }

      setTracks((prev) =>
        prev.map((t) =>
          t.id === currentTrackId
            ? { ...t, notes: [...t.notes, ...newNotes] }
            : t
        )
      );
    },
    [tracks, currentTrackId]
  );

  const handlePlay = useCallback(() => {
    if (tempoRamp?.enabled && tempoRamp.points.length >= 2) {
      scheduleWithTempoRamp(tracks, bpm, drumHits, TOTAL_STEPS, tempoRamp);
    } else {
      scheduleNotes(tracks, bpm, drumHits, TOTAL_STEPS);
    }
    start();
  }, [scheduleNotes, scheduleWithTempoRamp, tracks, bpm, drumHits, start, tempoRamp]);

  const handleApplyRecordedNotes = useCallback(() => {
    if (recordedNotes.length === 0) return;
    setTracks((prev) =>
      prev.map((t) =>
        t.id === currentTrackId
          ? { ...t, notes: [...t.notes, ...recordedNotes] }
          : t
      )
    );
    clearRecordedNotes();
  }, [recordedNotes, currentTrackId, clearRecordedNotes]);

  const pitches = useMemo(() => {
    const result: string[] = [];
    for (const octave of [...OCTAVES].reverse()) {
      for (const note of PENTATONIC_NOTES) {
        result.push(`${note}${octave}`);
      }
    }
    return result;
  }, []);

  const getPitchIndex = useCallback(
    (pitch: string) => pitches.indexOf(pitch),
    [pitches]
  );

  const handleDeleteSelection = useCallback(() => {
    if (!selection) return;
    const minStep = Math.min(selection.startStep, selection.endStep);
    const maxStep = Math.max(selection.startStep, selection.endStep);
    const minPitchIdx = Math.min(
      getPitchIndex(selection.startPitch),
      getPitchIndex(selection.endPitch)
    );
    const maxPitchIdx = Math.max(
      getPitchIndex(selection.startPitch),
      getPitchIndex(selection.endPitch)
    );

    setTracks((prev) =>
      prev.map((t) =>
        t.id === currentTrackId
          ? {
              ...t,
              notes: t.notes.filter((n) => {
                const pitchIdx = getPitchIndex(n.pitch);
                return !(
                  n.step >= minStep &&
                  n.step <= maxStep &&
                  pitchIdx >= minPitchIdx &&
                  pitchIdx <= maxPitchIdx
                );
              }),
            }
          : t
      )
    );
    setSelection(null);
  }, [selection, currentTrackId, getPitchIndex]);

  const handleCopySelection = useCallback(() => {
    if (!selection) return;
    const minStep = Math.min(selection.startStep, selection.endStep);
    const maxStep = Math.max(selection.startStep, selection.endStep);
    const minPitchIdx = Math.min(
      getPitchIndex(selection.startPitch),
      getPitchIndex(selection.endPitch)
    );
    const maxPitchIdx = Math.max(
      getPitchIndex(selection.startPitch),
      getPitchIndex(selection.endPitch)
    );

    const selectedNotes = currentNotes.filter((n) => {
      const pitchIdx = getPitchIndex(n.pitch);
      return (
        n.step >= minStep &&
        n.step <= maxStep &&
        pitchIdx >= minPitchIdx &&
        pitchIdx <= maxPitchIdx
      );
    });

    if (selectedNotes.length > 0) {
      setClipboard({
        notes: selectedNotes.map((n) => ({ ...n })),
        sourceTrackId: currentTrackId,
        offsetStep: minStep,
      });
    }
  }, [selection, currentNotes, currentTrackId, getPitchIndex]);

  const handlePaste = useCallback(
    (targetStep: number) => {
      if (!clipboard) return;
      const stepOffset = targetStep - clipboard.offsetStep;
      const newNotes = clipboard.notes.map((n) => ({
        ...n,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        step: Math.max(0, Math.min(TOTAL_STEPS - 1, n.step + stepOffset)),
      }));
      setTracks((prev) =>
        prev.map((t) =>
          t.id === currentTrackId
            ? { ...t, notes: [...t.notes, ...newNotes] }
            : t
        )
      );
    },
    [clipboard, currentTrackId]
  );

  const handleSaveClip = useCallback(
    (name: string) => {
      if (!selection) return;
      const minStep = Math.min(selection.startStep, selection.endStep);
      const maxStep = Math.max(selection.startStep, selection.endStep);
      const minPitchIdx = Math.min(
        getPitchIndex(selection.startPitch),
        getPitchIndex(selection.endPitch)
      );
      const maxPitchIdx = Math.max(
        getPitchIndex(selection.startPitch),
        getPitchIndex(selection.endPitch)
      );

      const selectedNotes = currentNotes.filter((n) => {
        const pitchIdx = getPitchIndex(n.pitch);
        return (
          n.step >= minStep &&
          n.step <= maxStep &&
          pitchIdx >= minPitchIdx &&
          pitchIdx <= maxPitchIdx
        );
      });

      if (selectedNotes.length > 0) {
        const newClip: MelodyClip = {
          id: `clip-${Date.now()}`,
          name,
          notes: selectedNotes.map((n) => ({ ...n })),
          trackId: currentTrackId,
          startStep: minStep,
          endStep: maxStep,
          createdAt: Date.now(),
        };
        setClips((prev) => [...prev, newClip]);
      }
    },
    [selection, currentNotes, currentTrackId, getPitchIndex]
  );

  const handleLoadClip = useCallback(
    (clip: MelodyClip) => {
      const newNotes = clip.notes.map((n) => ({
        ...n,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }));
      setTracks((prev) =>
        prev.map((t) =>
          t.id === currentTrackId
            ? { ...t, notes: [...t.notes, ...newNotes] }
            : t
        )
      );
    },
    [currentTrackId]
  );

  const handleDeleteClip = useCallback((clipId: string) => {
    setClips((prev) => prev.filter((c) => c.id !== clipId));
  }, []);

  const handleTrackEffectsChange = useCallback(
    (effects: EffectConfig[]) => {
      setTrackEffects((prev) => ({
        ...prev,
        [currentTrackId]: effects,
      }));
    },
    [currentTrackId]
  );

  const handleApplyEffects = useCallback(() => {
    const effects = trackEffects[currentTrackId] || [];
    applyTrackEffects(currentTrackId, effects);
  }, [currentTrackId, trackEffects, applyTrackEffects]);

  const handleTempoRampApply = useCallback(() => {
    if (tempoRamp?.enabled) {
      scheduleWithTempoRamp(tracks, bpm, drumHits, TOTAL_STEPS, tempoRamp);
    }
  }, [tempoRamp, tracks, bpm, drumHits, scheduleWithTempoRamp]);

  const handleSave = useCallback(
    (name: string) => {
      const melody: Melody = {
        id: melodyId || generateId(),
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        bpm,
        timeSignature: { numerator: 4, denominator: 4 },
        tracks,
        drumHits,
        scale,
        style,
        rhythmTemplate,
      };
      saveMelody(melody);
      setMelodyId(melody.id);
      setMelodyName(name);
      setSavedMelodies(getMelodies());
    },
    [bpm, tracks, drumHits, scale, style, rhythmTemplate, melodyId]
  );

  const handleLoad = useCallback((melody: Melody) => {
    setTracks(melody.tracks.length > 0 ? melody.tracks : [
      {
        id: "track-1",
        name: "主旋律",
        notes: [],
        instrument: "synth",
        muted: false,
        solo: false,
        volume: 1,
        pan: 0,
      },
    ]);
    setCurrentTrackId(melody.tracks[0]?.id || "track-1");
    setDrumHits(melody.drumHits || []);
    setBpm(melody.bpm);
    setScale(melody.scale);
    setStyle(melody.style || "classical");
    setRhythmTemplate(melody.rhythmTemplate || "none");
    setMelodyId(melody.id);
    setMelodyName(melody.name);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteMelody(id);
      setSavedMelodies(getMelodies());
      if (melodyId === id) {
        setMelodyId(null);
        setMelodyName("");
      }
    },
    [melodyId]
  );

  const handleClear = useCallback(() => {
    setTracks([
      {
        id: "track-1",
        name: "主旋律",
        notes: [],
        instrument: "synth",
        muted: false,
        solo: false,
        volume: 1,
        pan: 0,
      },
    ]);
    setCurrentTrackId("track-1");
    setDrumHits([]);
    setMelodyId(null);
    setMelodyName("");
    stop();
  }, [stop]);

  const handleLoadProject = useCallback((project: ProjectFile) => {
    const data = project.projectData;
    setTracks(data.tracks.length > 0 ? data.tracks : [
      {
        id: "track-1",
        name: "主旋律",
        notes: [],
        instrument: "synth",
        muted: false,
        solo: false,
        volume: 1,
        pan: 0,
      },
    ]);
    setCurrentTrackId(data.tracks[0]?.id || "track-1");
    setDrumHits(data.drumHits || []);
    setBpm(data.bpm);
    setScale(data.scale);
    setStyle(data.style);
    setRhythmTemplate(data.rhythmTemplate || "none");
    if (data.tempoRamp) {
      setTempoRamp(data.tempoRamp);
    }
    if (data.trackEffects) {
      setTrackEffects(data.trackEffects);
    }
    setMelodyName(project.metadata.name);
  }, []);

  const handleApplyTemplate = useCallback((data: Template["data"]) => {
    setTracks(data.tracks.length > 0 ? data.tracks : [
      {
        id: "track-1",
        name: "主旋律",
        notes: [],
        instrument: "synth",
        muted: false,
        solo: false,
        volume: 1,
        pan: 0,
      },
    ]);
    setCurrentTrackId(data.tracks[0]?.id || "track-1");
    setDrumHits(data.drumHits || []);
    setBpm(data.bpm);
    setScale(data.scale);
    setStyle(data.style);
    setRhythmTemplate(data.rhythmTemplate || "none");
    setMelodyName("");
    setMelodyId(null);
  }, []);

  const totalNoteCount = tracks.reduce((sum, t) => sum + t.notes.length, 0);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-4xl"
            >
              🎐
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-ink font-chinese">
                五音阁
              </h1>
              <p className="text-ink/60 text-sm font-chinese">
                国风五声音阶旋律创作平台
              </p>
            </div>
            {melodyName && (
              <div className="px-3 py-1 bg-gold/20 rounded-full text-gold-dark text-sm font-chinese">
                📝 {melodyName}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsTheoryHintsOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo/10 hover:bg-indigo/20 text-indigo font-chinese text-sm transition-colors"
            >
              📖 乐理
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsTemplateMarketOpen(true)}
              className="px-4 py-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold-dark font-chinese text-sm transition-colors"
            >
              🏪 模板
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExporterOpen(true)}
              className="px-4 py-2 rounded-lg bg-jade/10 hover:bg-jade/20 text-jade font-chinese text-sm transition-colors"
            >
              📤 导出
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProjectManagerOpen(true)}
              className="px-4 py-2 rounded-lg bg-parchment-dark/30 hover:bg-parchment-dark/50 text-ink font-chinese text-sm transition-colors"
            >
              📁 工程
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="px-4 py-2 rounded-lg bg-ink/10 hover:bg-ink/20 text-ink font-chinese text-sm transition-colors"
            >
              🗑️ 清空
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMelodyListOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo/10 hover:bg-indigo/20 text-indigo font-chinese text-sm transition-colors"
            >
              📜 作品
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSaveModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-vermilion hover:bg-vermilion-light text-white font-chinese text-sm transition-colors shadow-lg"
            >
              💾 保存
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-4"
        >
          <ScaleSelector
            selectedScale={scale}
            onScaleChange={setScale}
            playNote={playNote}
          />

          <StyleSelector
            selectedStyle={style}
            onStyleChange={setStyle}
          />

          <TrackPanel
            tracks={tracks}
            currentTrackId={currentTrackId}
            onTrackChange={setCurrentTrackId}
            onTrackMute={handleTrackMute}
            onTrackSolo={handleTrackSolo}
            onTrackVolume={handleTrackVolume}
            onTrackInstrument={handleTrackInstrument}
            onTrackRename={handleTrackRename}
            onAddTrack={handleAddTrack}
            onRemoveTrack={handleRemoveTrack}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-b from-parchment-light to-parchment rounded-xl p-4 shadow-lg border-2 border-ink/20"
          >
            <h3 className="text-lg font-bold text-ink mb-3 font-chinese flex items-center gap-2">
              <span>📖</span>
              使用说明
            </h3>
            <ul className="text-sm text-ink/70 space-y-2 font-chinese">
              <li className="flex items-start gap-2">
                <span className="text-vermilion">•</span>
                点击网格添加或删除音符
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-dark">•</span>
                选择不同调式感受音乐色彩
              </li>
              <li className="flex items-start gap-2">
                <span className="text-jade">•</span>
                调节BPM改变音乐速度
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo">•</span>
                切换曲风体验不同音色
              </li>
              <li className="flex items-start gap-2">
                <span className="text-vermilion">•</span>
                添加鼓点丰富节奏层次
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-dark">•</span>
                多音轨编排丰富织体
              </li>
              <li className="flex items-start gap-2">
                <span className="text-jade">•</span>
                使用模板快速开始创作
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo">•</span>
                导出MIDI用于其他软件
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 space-y-4"
        >
          <ControlPanel
            bpm={bpm}
            onBpmChange={setBpm}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onStop={stop}
            onPause={pause}
            isReady={isReady}
            noteCount={totalNoteCount}
            isRecording={isRecording}
          />

          <div className="flex gap-1 mb-2 bg-parchment-dark/20 p-1 rounded-lg">
            {[
              { key: "edit", label: "编辑", emoji: "🎼" },
              { key: "record", label: "录制", emoji: "🎙️" },
              { key: "clip", label: "剪辑", emoji: "✂️" },
              { key: "effects", label: "音效", emoji: "🎛️" },
              { key: "tempo", label: "速度", emoji: "📈" },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-chinese transition-colors flex items-center justify-center gap-1 ${
                  activeTab === tab.key
                    ? "bg-jade text-white shadow-md"
                    : "text-ink/70 hover:bg-parchment-dark/30"
                }`}
              >
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {activeTab === "edit" && (
            <>
              <div className="bg-parchment/50 rounded-xl p-4 shadow-lg border-2 border-ink/20">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-ink font-chinese flex items-center gap-2">
                    <span>🎼</span>
                    旋律编辑器
                    <span className="ml-2 text-sm text-ink/50 font-normal">
                      - {currentTrack?.name}
                    </span>
                  </h2>
                  <div className="text-sm text-ink/60 font-chinese">
                    {!isReady && "🔊 点击播放开始音频引擎"}
                  </div>
                </div>
                <PianoRoll
                  notes={currentNotes}
                  onNoteAdd={handleNoteAdd}
                  onNoteRemove={handleNoteRemove}
                  currentStep={currentStep}
                  totalSteps={TOTAL_STEPS}
                  playNote={playNote}
                />
              </div>

              <RhythmTemplatePanel
                selectedTemplate={rhythmTemplate}
                onTemplateChange={setRhythmTemplate}
                onApplyTemplate={handleApplyRhythmTemplate}
              />

              <DrumPanel
                drumHits={drumHits}
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                onDrumAdd={handleDrumAdd}
                onDrumRemove={handleDrumRemove}
                playDrum={playDrum}
              />
            </>
          )}

          {activeTab === "record" && (
            <RecordingPanel
              isRecording={isRecording}
              recordedNotes={recordedNotes}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onRecordNote={recordNote}
              onClearRecorded={clearRecordedNotes}
              onApplyToTrack={handleApplyRecordedNotes}
            />
          )}

          {activeTab === "clip" && (
            <ClipEditor
              notes={currentNotes}
              totalSteps={TOTAL_STEPS}
              selection={selection}
              onSelectionChange={setSelection}
              onDeleteSelection={handleDeleteSelection}
              onCopySelection={handleCopySelection}
              onPaste={handlePaste}
              hasClipboard={!!clipboard}
              clips={clips}
              onSaveClip={handleSaveClip}
              onLoadClip={handleLoadClip}
              onDeleteClip={handleDeleteClip}
            />
          )}

          {activeTab === "effects" && (
            <EffectsPanel
              trackId={currentTrackId}
              trackName={currentTrack?.name || ""}
              effects={trackEffects[currentTrackId] || []}
              onEffectsChange={handleTrackEffectsChange}
              onApplyEffects={handleApplyEffects}
            />
          )}

          {activeTab === "tempo" && (
            <TempoRampPanel
              baseBpm={bpm}
              totalSteps={TOTAL_STEPS}
              tempoRamp={tempoRamp}
              onTempoRampChange={setTempoRamp}
              onApply={handleTempoRampApply}
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-ink/50 text-sm font-chinese py-4"
          >
            <p>🎵 宫商角徵羽，五音传千年 🎵</p>
          </motion.div>
        </motion.div>
      </div>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSave}
        defaultName={melodyName}
      />

      <MelodyList
        melodies={savedMelodies}
        onLoad={handleLoad}
        onDelete={handleDelete}
        isOpen={isMelodyListOpen}
        onClose={() => setIsMelodyListOpen(false)}
      />

      <ProjectManager
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        currentData={{
          bpm,
          scale,
          style,
          rhythmTemplate,
          tracks,
          drumHits,
          tempoRamp: tempoRamp || undefined,
          trackEffects,
        }}
        onLoadProject={handleLoadProject}
      />

      <TemplateMarket
        isOpen={isTemplateMarketOpen}
        onClose={() => setIsTemplateMarketOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      <MelodyExporter
        isOpen={isExporterOpen}
        onClose={() => setIsExporterOpen(false)}
        tracks={tracks}
        drumHits={drumHits}
        bpm={bpm}
        scale={scale}
        melodyName={melodyName}
      />

      <TheoryHints
        isOpen={isTheoryHintsOpen}
        onClose={() => setIsTheoryHintsOpen(false)}
      />
    </div>
  );
}