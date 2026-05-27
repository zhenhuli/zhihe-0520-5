"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Melody } from "@/types";
import { PENTATONIC_SCALES, MUSIC_STYLES } from "@/types";

interface MelodyListProps {
  melodies: Melody[];
  onLoad: (melody: Melody) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MelodyList({
  melodies,
  onLoad,
  onDelete,
  isOpen,
  onClose,
}: MelodyListProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalNoteCount = (melody: Melody) =>
    melody.tracks.reduce((sum, t) => sum + (t.notes?.length || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(44, 24, 16, 0.6)" }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 shadow-2xl border-l-2 border-ink/20 overflow-hidden flex flex-col"
            style={{ backgroundColor: "#F5E6D3" }}
          >
            <div className="p-5 border-b-2 border-ink/10" style={{ background: "linear-gradient(to right, rgba(232, 213, 196, 0.3), transparent)" }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-ink font-chinese flex items-center gap-2">
                  <span className="text-3xl">📜</span>
                  我的旋律
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center text-ink transition-colors"
                >
                  ✕
                </motion.button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4" style={{ backgroundColor: "#F5E6D3" }}>
              {melodies.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">🎵</div>
                  <p className="text-ink/60 font-chinese">还没有保存的旋律</p>
                  <p className="text-ink/40 text-sm mt-2">开始创作你的第一首国风旋律吧！</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {melodies.map((melody, index) => (
                    <motion.div
                      key={melody.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl p-4 border-2 border-ink/10 hover:border-jade/30 transition-colors"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-ink font-chinese text-lg">
                            {melody.name}
                          </h3>
                          <p className="text-xs text-ink/50 font-chinese">
                            {formatDate(melody.updatedAt)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 text-gold-dark text-xs rounded font-chinese" style={{ backgroundColor: "rgba(212, 175, 55, 0.2)" }}>
                            {PENTATONIC_SCALES[melody.scale]?.name || "宫调式"}
                          </span>
                          {melody.style && (
                            <span className="px-2 py-0.5 text-indigo text-xs rounded font-chinese" style={{ backgroundColor: "rgba(75, 0, 130, 0.2)" }}>
                              {MUSIC_STYLES[melody.style]?.name || "古风典雅"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-ink/60 mb-3 font-chinese flex-wrap">
                        <span>🎵 {totalNoteCount(melody)} 个音符</span>
                        <span>🎚️ {melody.tracks.length} 音轨</span>
                        {melody.drumHits?.length > 0 && (
                          <span>🥁 {melody.drumHits.length} 鼓点</span>
                        )}
                        <span>⏱️ {melody.bpm} BPM</span>
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onLoad(melody);
                            onClose();
                          }}
                          className="flex-1 py-2 rounded-lg bg-jade/10 hover:bg-jade/20 text-jade font-chinese text-sm transition-colors"
                        >
                          加载
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onDelete(melody.id)}
                          className="px-4 py-2 rounded-lg bg-vermilion/10 hover:bg-vermilion/20 text-vermilion font-chinese text-sm transition-colors"
                        >
                          删除
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
