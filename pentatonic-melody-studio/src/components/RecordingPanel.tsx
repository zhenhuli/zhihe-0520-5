"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo } from "react";
import type { Note } from "@/types";
import { PENTATONIC_NOTES, OCTAVES } from "@/types";

interface RecordingPanelProps {
  isRecording: boolean;
  recordedNotes: Note[];
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRecordNote: (pitch: string) => void;
  onClearRecorded: () => void;
  onApplyToTrack: () => void;
}

export function RecordingPanel({
  isRecording,
  recordedNotes,
  onStartRecording,
  onStopRecording,
  onRecordNote,
  onClearRecorded,
  onApplyToTrack,
}: RecordingPanelProps) {
  const pitches = useMemo(() => {
    const result: string[] = [];
    for (const octave of OCTAVES) {
      for (const note of PENTATONIC_NOTES) {
        result.push(`${note}${octave}`);
      }
    }
    return result;
  }, []);

  const getNoteNameCN = useCallback((pitch: string) => {
    const noteName = pitch.replace(/[0-9]/g, "");
    const names: Record<string, string> = {
      C: "宫",
      D: "商",
      E: "角",
      G: "徵",
      A: "羽",
    };
    return names[noteName] || noteName;
  }, []);

  const getNoteColor = (pitch: string) => {
    const noteName = pitch.replace(/[0-9]/g, "");
    const colors: Record<string, string> = {
      C: "bg-vermilion",
      D: "bg-gold",
      E: "bg-jade",
      G: "bg-indigo",
      A: "bg-ink",
    };
    return colors[noteName] || "bg-gray-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-parchment-light to-parchment rounded-xl p-4 shadow-lg border-2 border-ink/20"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-ink font-chinese flex items-center gap-2">
          <span>🎙️</span>
          旋律录制
        </h3>
        {isRecording && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-1 bg-vermilion/20 rounded-full"
          >
            <span className="w-3 h-3 rounded-full bg-vermilion animate-pulse" />
            <span className="text-vermilion text-sm font-chinese">录制中...</span>
          </motion.div>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartRecording}
            className="flex-1 py-3 rounded-lg bg-vermilion hover:bg-vermilion-light text-white font-chinese font-bold transition-colors shadow-lg"
          >
            ⏺ 开始录制
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStopRecording}
            className="flex-1 py-3 rounded-lg bg-ink hover:bg-ink-light text-white font-chinese font-bold transition-colors shadow-lg"
          >
            ⏹ 停止录制
          </motion.button>
        )}
        {recordedNotes.length > 0 && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onApplyToTrack}
              className="flex-1 py-3 rounded-lg bg-jade hover:bg-jade-light text-white font-chinese font-bold transition-colors shadow-lg"
            >
              ✅ 应用到音轨
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearRecorded}
              className="px-4 py-3 rounded-lg bg-ink/10 hover:bg-ink/20 text-ink font-chinese transition-colors"
            >
              🗑️
            </motion.button>
          </>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-ink/60 font-chinese mb-2">
          已录制: <span className="font-bold text-ink">{recordedNotes.length}</span> 个音符
        </p>
        {recordedNotes.length > 0 && (
          <div className="flex flex-wrap gap-1 max-h-20 overflow-auto p-2 bg-parchment-dark/20 rounded-lg">
            {recordedNotes.map((note, idx) => (
              <motion.span
                key={note.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-2 py-1 rounded text-xs text-white font-bold ${getNoteColor(
                  note.pitch
                )}`}
              >
                {getNoteNameCN(note.pitch)}
                {idx < recordedNotes.length - 1 && (
                  <span className="ml-1 text-white/60">→</span>
                )}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-parchment-dark/20 rounded-lg p-3">
        <p className="text-xs text-ink/60 font-chinese mb-2 text-center">
          {isRecording ? "点击琴键录制音符" : "开始录制后点击琴键"}
        </p>
        <div className="flex flex-wrap justify-center gap-1">
          {pitches.map((pitch) => (
            <motion.button
              key={pitch}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRecordNote(pitch)}
              disabled={!isRecording}
              className={`w-10 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold font-chinese transition-all shadow-md ${getNoteColor(
                pitch
              )} text-white ${!isRecording ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"}`}
            >
              <span>{getNoteNameCN(pitch)}</span>
              <span className="text-[10px] opacity-70">{pitch.slice(-1)}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
