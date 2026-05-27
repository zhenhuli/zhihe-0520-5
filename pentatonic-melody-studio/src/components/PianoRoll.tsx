"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo } from "react";
import type { Note } from "@/types";
import { PENTATONIC_NOTES, OCTAVES } from "@/types";

interface PianoRollProps {
  notes: Note[];
  onNoteAdd: (note: Note) => void;
  onNoteRemove: (noteId: string) => void;
  currentStep: number;
  totalSteps?: number;
  playNote: (pitch: string) => void;
}

const CELL_WIDTH = 40;
const CELL_HEIGHT = 36;
const TOTAL_STEPS = 32;

export function PianoRoll({
  notes,
  onNoteAdd,
  onNoteRemove,
  currentStep,
  totalSteps = TOTAL_STEPS,
  playNote,
}: PianoRollProps) {
  const pitches = useMemo(() => {
    const result: string[] = [];
    for (const octave of [...OCTAVES].reverse()) {
      for (const note of PENTATONIC_NOTES) {
        result.push(`${note}${octave}`);
      }
    }
    return result;
  }, []);

  const handleCellClick = useCallback(
    (pitch: string, step: number) => {
      const existingNote = notes.find(
        (n) => n.pitch === pitch && n.step === step
      );

      if (existingNote) {
        onNoteRemove(existingNote.id);
      } else {
        playNote(pitch);
        onNoteAdd({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pitch,
          step,
          duration: 1,
          velocity: 0.8,
        });
      }
    },
    [notes, onNoteAdd, onNoteRemove, playNote]
  );

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

  const getNoteNameCN = (pitch: string) => {
    const noteName = pitch.replace(/[0-9]/g, "");
    const names: Record<string, string> = {
      C: "宫",
      D: "商",
      E: "角",
      G: "徵",
      A: "羽",
    };
    return names[noteName] || noteName;
  };

  return (
    <div className="overflow-auto bg-parchment/50 rounded-lg border-2 border-ink/20">
      <div className="flex">
        <div className="sticky left-0 z-10 bg-parchment border-r border-ink/20">
          <div
            className="flex items-center justify-center text-xs font-bold text-ink/60 font-chinese bg-parchment border-b border-ink/20"
            style={{ width: 50, height: 24 }}
          >
            音高
          </div>
          {pitches.map((pitch) => (
            <div
              key={pitch}
              className="flex items-center justify-end pr-2 text-xs font-chinese text-ink/80 bg-gradient-to-r from-parchment to-transparent border-b border-ink/10"
              style={{ width: 50, height: CELL_HEIGHT }}
            >
              <span className="text-ink/60">{pitch.slice(-1)}</span>
              <span className="ml-1 font-bold">{getNoteNameCN(pitch)}</span>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="flex sticky top-0 z-10 bg-parchment border-b border-ink/20">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center justify-center text-xs font-medium border-r border-ink/10 ${
                  i % 4 === 0 ? "text-ink/80 bg-parchment-dark/30" : "text-ink/40"
                }`}
                style={{ width: CELL_WIDTH, height: 24 }}
              >
                {i % 4 === 0 ? Math.floor(i / 4) + 1 : ""}
              </div>
            ))}
          </div>

          {pitches.map((pitch) => (
            <div key={pitch} className="flex">
              {Array.from({ length: totalSteps }).map((_, colIndex) => {
                const note = notes.find(
                  (n) => n.pitch === pitch && n.step === colIndex
                );
                const isPlayhead = currentStep === colIndex;
                const isBeat = colIndex % 4 === 0;

                return (
                  <motion.div
                    key={colIndex}
                    onClick={() => handleCellClick(pitch, colIndex)}
                    className={`relative cursor-pointer border-r border-b border-ink/10 transition-colors ${
                      isBeat ? "bg-ink/5" : "bg-transparent"
                    } ${isPlayhead ? "bg-vermilion/20" : ""} hover:bg-jade/10`}
                    style={{ width: CELL_WIDTH, height: CELL_HEIGHT }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {note && (
                      <motion.div
                        layoutId={note.id}
                        className={`absolute inset-1 ${getNoteColor(
                          note.pitch
                        )} rounded-md shadow-md flex items-center justify-center text-white text-xs font-bold font-chinese`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {getNoteNameCN(note.pitch)}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}

          {currentStep >= 0 && (
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-vermilion z-20 pointer-events-none"
              style={{ left: currentStep * CELL_WIDTH }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
