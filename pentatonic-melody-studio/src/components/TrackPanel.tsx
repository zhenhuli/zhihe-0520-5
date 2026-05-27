"use client";

import { motion } from "framer-motion";
import type { Track, InstrumentType } from "@/types";
import { INSTRUMENTS } from "@/types";

interface TrackPanelProps {
  tracks: Track[];
  currentTrackId: string;
  onTrackChange: (trackId: string) => void;
  onTrackMute: (trackId: string, muted: boolean) => void;
  onTrackSolo: (trackId: string, solo: boolean) => void;
  onTrackVolume: (trackId: string, volume: number) => void;
  onTrackInstrument: (trackId: string, instrument: InstrumentType) => void;
  onTrackRename: (trackId: string, name: string) => void;
  onAddTrack: () => void;
  onRemoveTrack: (trackId: string) => void;
}

export function TrackPanel({
  tracks,
  currentTrackId,
  onTrackChange,
  onTrackMute,
  onTrackSolo,
  onTrackVolume,
  onTrackInstrument,
  onTrackRename,
  onAddTrack,
  onRemoveTrack,
}: TrackPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-b from-parchment-light to-parchment rounded-xl p-4 shadow-lg border-2 border-ink/20"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-ink font-chinese flex items-center gap-2">
          <span className="text-2xl">🎚️</span>
          音轨
        </h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddTrack}
          className="w-8 h-8 rounded-full bg-jade hover:bg-jade-light text-white flex items-center justify-center transition-colors"
          title="添加音轨"
        >
          +
        </motion.button>
      </div>

      <div className="space-y-2">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-lg border-2 transition-all ${
              currentTrackId === track.id
                ? "bg-gradient-to-r from-vermilion/10 to-gold/10 border-vermilion/40 shadow-md"
                : "bg-white/50 border-transparent hover:border-ink/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTrackChange(track.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                style={{
                  backgroundColor:
                    currentTrackId === track.id ? "#E34234" : "rgba(44,24,16,0.15)",
                  color:
                    currentTrackId === track.id ? "white" : "rgba(44,24,16,0.6)",
                }}
              >
                {index + 1}
              </motion.button>
              <input
                type="text"
                value={track.name}
                onChange={(e) => onTrackRename(track.id, e.target.value)}
                className="flex-1 bg-transparent text-sm font-chinese text-ink font-bold outline-none border-b border-transparent focus:border-ink/30"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTrackMute(track.id, !track.muted)}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs transition-colors ${
                  track.muted
                    ? "bg-vermilion/20 text-vermilion"
                    : "bg-ink/10 text-ink/50 hover:bg-ink/20"
                }`}
                title={track.muted ? "取消静音" : "静音"}
              >
                {track.muted ? "🔇" : "🔊"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTrackSolo(track.id, !track.solo)}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs transition-colors ${
                  track.solo
                    ? "bg-gold/30 text-gold-dark"
                    : "bg-ink/10 text-ink/50 hover:bg-ink/20"
                }`}
                title={track.solo ? "取消独奏" : "独奏"}
              >
                S
              </motion.button>
              {tracks.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemoveTrack(track.id)}
                  className="w-7 h-7 rounded bg-ink/10 text-ink/50 hover:bg-vermilion/20 hover:text-vermilion flex items-center justify-center text-xs transition-colors"
                  title="删除音轨"
                >
                  ✕
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={track.instrument}
                onChange={(e) =>
                  onTrackInstrument(track.id, e.target.value as InstrumentType)
                }
                className="bg-ink/5 rounded px-2 py-1 text-ink/70 font-chinese outline-none border border-ink/10"
              >
                {INSTRUMENTS.map((inst) => (
                  <option key={inst.key} value={inst.key}>
                    {inst.emoji} {inst.name}
                  </option>
                ))}
              </select>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-ink/50">音量</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={track.volume}
                  onChange={(e) =>
                    onTrackVolume(track.id, parseFloat(e.target.value))
                  }
                  className="flex-1 h-1 appearance-none bg-ink/20 rounded-full accent-vermilion"
                />
                <span className="text-ink/50 w-8 text-right">
                  {Math.round(track.volume * 100)}
                </span>
              </div>
            </div>

            <div className="mt-1 text-xs text-ink/50 font-chinese">
              {track.notes.length} 个音符
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
