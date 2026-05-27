"use client";

import { motion } from "framer-motion";
import type { PentatonicScale } from "@/types";
import { PENTATONIC_SCALES } from "@/types";

interface ScaleSelectorProps {
  selectedScale: PentatonicScale;
  onScaleChange: (scale: PentatonicScale) => void;
  playNote: (pitch: string) => void;
}

export function ScaleSelector({
  selectedScale,
  onScaleChange,
  playNote,
}: ScaleSelectorProps) {
  const scales = Object.entries(PENTATONIC_SCALES) as [PentatonicScale, typeof PENTATONIC_SCALES[PentatonicScale]][];

  const handleScaleSelect = (scale: PentatonicScale) => {
    onScaleChange(scale);
    const baseNotes = ["C4", "D4", "E4", "G4", "A4"];
    baseNotes.forEach((note, i) => {
      setTimeout(() => playNote(note), i * 100);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-b from-parchment-light to-parchment rounded-xl p-5 shadow-lg border-2 border-ink/20"
    >
      <h3 className="text-lg font-bold text-ink mb-4 font-chinese flex items-center gap-2">
        <span className="text-2xl">🎵</span>
        五声调式
      </h3>

      <div className="space-y-2">
        {scales.map(([key, scale], index) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleScaleSelect(key)}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              selectedScale === key
                ? "bg-gradient-to-r from-vermilion/20 to-gold/20 border-2 border-vermilion/50 shadow-md"
                : "bg-white/50 hover:bg-white/80 border-2 border-transparent"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-ink font-chinese text-lg">
                  {scale.name}
                </div>
                <div className="text-xs text-ink/60 mt-1">
                  {scale.description}
                </div>
              </div>
              <motion.div
                animate={selectedScale === key ? { rotate: 360 } : {}}
                transition={{ duration: 0.5 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-chinese ${
                  selectedScale === key
                    ? "bg-vermilion text-white"
                    : "bg-ink/10 text-ink/60"
                }`}
              >
                {scale.character}
              </motion.div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-ink/5 rounded-lg">
        <div className="text-xs text-ink/60 font-chinese mb-2">当前音阶音符</div>
        <div className="flex gap-2">
          {["宫 C", "商 D", "角 E", "徵 G", "羽 A"].map((note, i) => (
            <motion.div
              key={note}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex-1 h-8 rounded bg-gradient-to-b from-parchment to-parchment-dark flex items-center justify-center text-xs font-chinese text-ink/80 border border-ink/20"
            >
              {note}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
