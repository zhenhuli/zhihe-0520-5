"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Track, DrumHit, PentatonicScale } from "@/types";
import { PENTATONIC_SCALES } from "@/types";
import { downloadMIDIFile, downloadTextFile, exportMelodyToText } from "@/utils/storage";

interface MelodyExporterProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  drumHits: DrumHit[];
  bpm: number;
  scale: PentatonicScale;
  melodyName: string;
}

export function MelodyExporter({
  isOpen,
  onClose,
  tracks,
  drumHits,
  bpm,
  scale,
  melodyName,
}: MelodyExporterProps) {
  const [exportFormat, setExportFormat] = useState<"midi" | "json" | "text">("midi");
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set(tracks.map((t) => t.id)));
  const [includeDrums, setIncludeDrums] = useState(true);
  const [customFilename, setCustomFilename] = useState("");

  const toggleTrack = (trackId: string) => {
    setSelectedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const selectAllTracks = () => {
    setSelectedTracks(new Set(tracks.map((t) => t.id)));
  };

  const deselectAllTracks = () => {
    setSelectedTracks(new Set());
  };

  const handleExport = () => {
    const filename = customFilename.trim() || melodyName || "pentatonic-melody";
    const exportTracks = tracks.filter((t) => selectedTracks.has(t.id));

    if (exportFormat === "midi") {
      const midiTracks = exportTracks.map((track) => ({
        notes: track.notes.map((n) => ({
          pitch: n.pitch,
          step: n.step,
          duration: n.duration,
          velocity: n.velocity,
        })),
      }));

      if (includeDrums && drumHits.length > 0) {
        const drumTrack = {
          notes: drumHits.map((h) => {
            const drumPitches: Record<string, string> = {
              kick: "C2",
              snare: "D2",
              hihat: "F#2",
              tom: "G2",
              clap: "E2",
              cymbal: "A2",
            };
            return {
              pitch: drumPitches[h.instrument] || "C2",
              step: h.step,
              duration: 1,
              velocity: h.velocity,
            };
          }),
        };
        midiTracks.push(drumTrack);
      }

      if (midiTracks.length > 0) {
        downloadMIDIFile(midiTracks, bpm, filename);
      }
    } else if (exportFormat === "text") {
      const textTracks = exportTracks.map((t) => ({
        name: t.name,
        notes: t.notes.map((n) => ({
          pitch: n.pitch,
          step: n.step,
          duration: n.duration,
        })),
      }));
      const content = exportMelodyToText(textTracks, bpm, PENTATONIC_SCALES[scale]?.name || scale);
      downloadTextFile(content, `${filename}.txt`);
    }
  };

  const totalNoteCount = tracks
    .filter((t) => selectedTracks.has(t.id))
    .reduce((sum, t) => sum + t.notes.length, 0);

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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto"
          >
            <div className="rounded-2xl shadow-2xl border-2 border-ink/20 overflow-hidden" style={{ backgroundColor: "#F5E6D3" }}>
              <div className="p-5 border-b-2 border-ink/10" style={{ background: "linear-gradient(to right, rgba(232, 213, 196, 0.3), transparent)" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-ink font-chinese flex items-center gap-2">
                    <span className="text-3xl">📤</span>
                    导出旋律
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

              <div className="p-5 max-h-[60vh] overflow-auto">
                <div className="mb-5">
                  <label className="block text-sm text-ink/60 font-chinese mb-3">导出格式</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "midi", name: "MIDI", emoji: "🎹", desc: "音频制作软件通用" },
                      { key: "json", name: "JSON", emoji: "📋", desc: "工程数据格式" },
                      { key: "text", name: "文本", emoji: "📝", desc: "可读的乐谱格式" },
                    ].map((format) => (
                      <motion.button
                        key={format.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setExportFormat(format.key as typeof exportFormat)}
                        className={`p-3 rounded-xl border-2 transition-colors ${
                          exportFormat === format.key
                            ? "border-jade bg-jade/10"
                            : "border-ink/20 hover:border-ink/30"
                        }`}
                      >
                        <div className="text-2xl mb-1">{format.emoji}</div>
                        <div className="text-sm font-bold text-ink font-chinese">{format.name}</div>
                        <div className="text-xs text-ink/50 font-chinese">{format.desc}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {exportFormat === "midi" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-5"
                  >
                    <div className="bg-parchment/50 rounded-xl p-4 border border-ink/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-ink/60 font-chinese">选择音轨</span>
                        <div className="flex gap-2">
                          <button
                            onClick={selectAllTracks}
                            className="text-xs text-jade hover:text-jade-light font-chinese"
                          >
                            全选
                          </button>
                          <button
                            onClick={deselectAllTracks}
                            className="text-xs text-ink/50 hover:text-ink/70 font-chinese"
                          >
                            全不选
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-auto">
                        {tracks.map((track) => (
                          <label
                            key={track.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedTracks.has(track.id)
                                ? "bg-jade/10"
                                : "hover:bg-ink/5"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedTracks.has(track.id)}
                              onChange={() => toggleTrack(track.id)}
                              className="w-4 h-4 rounded border-ink/30 text-jade focus:ring-jade"
                            />
                            <span className="text-sm font-chinese text-ink flex-1">
                              {track.name}
                            </span>
                            <span className="text-xs text-ink/50 font-chinese">
                              {track.notes.length} 音符
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-3 mt-4 p-2 rounded-lg cursor-pointer hover:bg-ink/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={includeDrums}
                        onChange={(e) => setIncludeDrums(e.target.checked)}
                        className="w-4 h-4 rounded border-ink/30 text-jade focus:ring-jade"
                      />
                      <span className="text-sm font-chinese text-ink">包含鼓点</span>
                      <span className="text-xs text-ink/50 font-chinese">
                        ({drumHits.length} 个鼓点)
                      </span>
                    </label>
                  </motion.div>
                )}

                <div className="mb-5">
                  <label className="block text-sm text-ink/60 font-chinese mb-2">
                    文件名
                  </label>
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder={melodyName || "pentatonic-melody"}
                    className="w-full px-4 py-3 rounded-lg border-2 border-ink/20 focus:border-jade/50 focus:outline-none transition-colors font-chinese text-ink placeholder-ink/30"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                  />
                </div>

                <div className="bg-parchment/50 rounded-xl p-4 border border-ink/10 mb-5">
                  <h3 className="font-bold text-ink font-chinese mb-3">导出预览</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-ink/60 font-chinese">格式:</div>
                    <div className="text-ink font-chinese uppercase">{exportFormat}</div>
                    <div className="text-ink/60 font-chinese">音轨:</div>
                    <div className="text-ink font-chinese">{selectedTracks.size} 轨</div>
                    <div className="text-ink/60 font-chinese">音符:</div>
                    <div className="text-ink font-chinese">
                      {totalNoteCount}{includeDrums && drumHits.length > 0 ? ` + ${drumHits.length}鼓点` : ""}
                    </div>
                    <div className="text-ink/60 font-chinese">速度:</div>
                    <div className="text-ink font-chinese">{bpm} BPM</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  disabled={selectedTracks.size === 0 && exportFormat === "midi"}
                  className="w-full py-3 rounded-lg bg-vermilion hover:bg-vermilion-light text-white font-chinese transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⬇️ 导出{exportFormat.toUpperCase()}文件
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}