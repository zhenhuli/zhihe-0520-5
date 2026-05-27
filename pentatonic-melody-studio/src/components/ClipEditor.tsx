"use client";

import { motion } from "framer-motion";
import { useState, useCallback, useMemo } from "react";
import type { Note, SelectionRange, MelodyClip } from "@/types";
import { PENTATONIC_NOTES, OCTAVES } from "@/types";

interface ClipEditorProps {
  notes: Note[];
  totalSteps: number;
  selection: SelectionRange | null;
  onSelectionChange: (selection: SelectionRange | null) => void;
  onDeleteSelection: () => void;
  onCopySelection: () => void;
  onPaste: (targetStep: number) => void;
  hasClipboard: boolean;
  clips: MelodyClip[];
  onSaveClip: (name: string) => void;
  onLoadClip: (clip: MelodyClip) => void;
  onDeleteClip: (clipId: string) => void;
}

export function ClipEditor({
  notes,
  totalSteps,
  selection,
  onSelectionChange,
  onDeleteSelection,
  onCopySelection,
  onPaste,
  hasClipboard,
  clips,
  onSaveClip,
  onLoadClip,
  onDeleteClip,
}: ClipEditorProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [clipName, setClipName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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

  const handleGridMouseDown = useCallback(
    (pitch: string, step: number, e: React.MouseEvent) => {
      e.preventDefault();
      setIsSelecting(true);
      onSelectionChange({
        startStep: step,
        endStep: step,
        startPitch: pitch,
        endPitch: pitch,
      });
    },
    [onSelectionChange]
  );

  const handleGridMouseEnter = useCallback(
    (pitch: string, step: number) => {
      if (!isSelecting || !selection) return;
      onSelectionChange({
        ...selection,
        endStep: step,
        endPitch: pitch,
      });
    },
    [isSelecting, selection, onSelectionChange]
  );

  const handleGridMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  const isInSelection = useCallback(
    (pitch: string, step: number) => {
      if (!selection) return false;
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
      const pitchIdx = getPitchIndex(pitch);
      return (
        step >= minStep && step <= maxStep && pitchIdx >= minPitchIdx && pitchIdx <= maxPitchIdx
      );
    },
    [selection, getPitchIndex]
  );

  const getSelectedNoteCount = useMemo(() => {
    if (!selection) return 0;
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
    return notes.filter((n) => {
      const pitchIdx = getPitchIndex(n.pitch);
      return (
        n.step >= minStep &&
        n.step <= maxStep &&
        pitchIdx >= minPitchIdx &&
        pitchIdx <= maxPitchIdx
      );
    }).length;
  }, [selection, notes, getPitchIndex]);

  const handleSaveClip = useCallback(() => {
    if (clipName.trim()) {
      onSaveClip(clipName.trim());
      setClipName("");
      setShowSaveDialog(false);
    }
  }, [clipName, onSaveClip]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-parchment-light to-parchment rounded-xl p-4 shadow-lg border-2 border-ink/20"
      onMouseUp={handleGridMouseUp}
      onMouseLeave={handleGridMouseUp}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-ink font-chinese flex items-center gap-2">
          <span>✂️</span>
          片段剪辑
        </h3>
        <div className="flex gap-2">
          {selection && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCopySelection}
                className="px-3 py-1 rounded-lg bg-indigo/10 hover:bg-indigo/20 text-indigo text-sm font-chinese transition-colors"
              >
                📋 复制 ({getSelectedNoteCount})
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDeleteSelection}
                className="px-3 py-1 rounded-lg bg-vermilion/10 hover:bg-vermilion/20 text-vermilion text-sm font-chinese transition-colors"
              >
                🗑️ 删除
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSaveDialog(true)}
                className="px-3 py-1 rounded-lg bg-jade/10 hover:bg-jade/20 text-jade text-sm font-chinese transition-colors"
              >
                💾 保存片段
              </motion.button>
            </>
          )}
          {hasClipboard && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPaste(0)}
              className="px-3 py-1 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold-dark text-sm font-chinese transition-colors"
            >
              📝 粘贴到开头
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectionChange(null)}
            className="px-3 py-1 rounded-lg bg-ink/10 hover:bg-ink/20 text-ink text-sm font-chinese transition-colors"
          >
            ❌ 取消
          </motion.button>
        </div>
      </div>

      {showSaveDialog && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-3 bg-parchment-dark/20 rounded-lg"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={clipName}
              onChange={(e) => setClipName(e.target.value)}
              placeholder="输入片段名称..."
              className="flex-1 px-3 py-2 rounded-lg bg-parchment border border-ink/20 text-ink font-chinese text-sm focus:outline-none focus:border-jade"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveClip}
              className="px-4 py-2 rounded-lg bg-jade hover:bg-jade-light text-white font-chinese text-sm transition-colors"
            >
              保存
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowSaveDialog(false);
                setClipName("");
              }}
              className="px-4 py-2 rounded-lg bg-ink/10 hover:bg-ink/20 text-ink font-chinese text-sm transition-colors"
            >
              取消
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="mb-4">
        <p className="text-xs text-ink/60 font-chinese mb-2">
          拖拽选择区域 • 选中 {getSelectedNoteCount} 个音符
        </p>
        <div className="overflow-auto bg-parchment/50 rounded-lg border border-ink/20 max-h-40">
          <div className="relative min-w-max">
            {pitches.map((pitch) => (
              <div key={pitch} className="flex">
                <div
                  className="sticky left-0 z-10 w-12 h-6 flex items-center justify-end pr-1 text-[10px] font-chinese text-ink/60 bg-parchment border-r border-b border-ink/10"
                >
                  {pitch.slice(-1)}
                  {pitch.replace(/[0-9]/g, "")}
                </div>
                {Array.from({ length: totalSteps }).map((_, stepIdx) => {
                  const note = notes.find(
                    (n) => n.pitch === pitch && n.step === stepIdx
                  );
                  const isSelected = isInSelection(pitch, stepIdx);

                  return (
                    <div
                      key={stepIdx}
                      onMouseDown={(e) => handleGridMouseDown(pitch, stepIdx, e)}
                      onMouseEnter={() => handleGridMouseEnter(pitch, stepIdx)}
                      className={`w-6 h-6 border-r border-b border-ink/10 cursor-crosshair transition-colors ${
                        stepIdx % 4 === 0 ? "bg-ink/5" : ""
                      } ${isSelected ? "bg-indigo/30" : "hover:bg-jade/10"}`}
                    >
                      {note && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              isSelected ? "bg-indigo" : "bg-vermilion"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {clips.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-ink font-chinese mb-2">📦 已保存的片段</h4>
          <div className="space-y-2 max-h-32 overflow-auto">
            {clips.map((clip) => (
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2 bg-parchment-dark/20 rounded-lg"
              >
                <div>
                  <p className="text-sm font-bold text-ink font-chinese">{clip.name}</p>
                  <p className="text-xs text-ink/60">
                    {clip.notes.length} 个音符 • 步骤 {clip.startStep}-{clip.endStep}
                  </p>
                </div>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onLoadClip(clip)}
                    className="w-8 h-8 rounded bg-jade/20 hover:bg-jade/30 text-jade flex items-center justify-center"
                    title="加载"
                  >
                    📥
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDeleteClip(clip.id)}
                    className="w-8 h-8 rounded bg-vermilion/20 hover:bg-vermilion/30 text-vermilion flex items-center justify-center"
                    title="删除"
                  >
                    🗑️
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
