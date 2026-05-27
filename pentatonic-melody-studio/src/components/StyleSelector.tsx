"use client";

import { motion } from "framer-motion";
import type { MusicStyle } from "@/types";
import { MUSIC_STYLES } from "@/types";

interface StyleSelectorProps {
  selectedStyle: MusicStyle;
  onStyleChange: (style: MusicStyle) => void;
}

export function StyleSelector({
  selectedStyle,
  onStyleChange,
}: StyleSelectorProps) {
  const styles = Object.entries(MUSIC_STYLES) as [
    MusicStyle,
    typeof MUSIC_STYLES[MusicStyle]
  ][];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-b from-parchment-light to-parchment rounded-xl p-4 shadow-lg border-2 border-ink/20"
    >
      <h3 className="text-lg font-bold text-ink font-chinese flex items-center gap-2 mb-3">
        <span className="text-2xl">🎨</span>
        曲风
      </h3>

      <div className="space-y-2">
        {styles.map(([key, style], index) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStyleChange(key)}
            className={`w-full p-2.5 rounded-lg text-left transition-all ${
              selectedStyle === key
                ? "bg-gradient-to-r from-indigo/20 to-gold/20 border-2 border-indigo/40 shadow-md"
                : "bg-white/50 hover:bg-white/80 border-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{style.emoji}</span>
              <div className="flex-1">
                <div className="font-bold text-ink font-chinese text-sm">
                  {style.name}
                </div>
                <div className="text-xs text-ink/60 mt-0.5">
                  {style.description}
                </div>
              </div>
              {selectedStyle === key && (
                <motion.div
                  layoutId="style-check"
                  className="w-5 h-5 rounded-full bg-indigo flex items-center justify-center text-white text-xs"
                >
                  ✓
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
