"use client";

import { motion } from "framer-motion";

interface ControlPanelProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
  isReady: boolean;
  noteCount: number;
  isRecording?: boolean;
}

export function ControlPanel({
  bpm,
  onBpmChange,
  isPlaying,
  onPlay,
  onStop,
  onPause,
  isReady,
  noteCount,
  isRecording = false,
}: ControlPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-parchment to-parchment-light rounded-xl p-4 shadow-lg border-2 border-ink/20"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <label className="text-xs text-ink/60 font-chinese mb-1">节拍 (BPM)</label>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onBpmChange(Math.max(40, bpm - 5))}
                className="w-8 h-8 rounded-full bg-ink/10 hover:bg-ink/20 text-ink font-bold transition-colors"
              >
                -
              </motion.button>
              <motion.span
                key={bpm}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="w-16 text-center text-2xl font-bold text-ink font-chinese"
              >
                {bpm}
              </motion.span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onBpmChange(Math.min(200, bpm + 5))}
                className="w-8 h-8 rounded-full bg-ink/10 hover:bg-ink/20 text-ink font-bold transition-colors"
              >
                +
              </motion.button>
            </div>
          </div>

          <div className="h-12 w-px bg-ink/20" />

          <div className="flex flex-col">
            <label className="text-xs text-ink/60 font-chinese mb-1">音符数量</label>
            <span className="text-xl font-bold text-ink font-chinese">
              {noteCount} <span className="text-sm font-normal">个</span>
            </span>
          </div>

          {isRecording && (
            <>
              <div className="h-12 w-px bg-ink/20" />
              <div className="flex items-center gap-2 px-3 py-2 bg-vermilion/10 rounded-lg">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-vermilion"
                />
                <span className="text-vermilion text-sm font-chinese font-bold">
                  录制中
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStop}
            className="w-12 h-12 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center text-ink transition-colors"
            title="停止"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPlaying ? onPause : onPlay}
            disabled={!isReady}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isPlaying
                ? "bg-gold hover:bg-gold-light text-ink"
                : "bg-jade hover:bg-jade-light text-white"
            } ${!isReady ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
