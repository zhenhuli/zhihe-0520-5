"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo } from "react";
import type { DrumHit, DrumInstrument } from "@/types";
import { DRUM_INSTRUMENTS } from "@/types";

interface DrumPanelProps {
  drumHits: DrumHit[];
  currentStep: number;
  totalSteps?: number;
  onDrumAdd: (hit: DrumHit) => void;
  onDrumRemove: (hitId: string) => void;
  playDrum: (instrument: DrumInstrument) => void;
}

const CELL_WIDTH = 30;

export function DrumPanel({
  drumHits,
  currentStep,
  totalSteps = 32,
  onDrumAdd,
  onDrumRemove,
  playDrum,
}: DrumPanelProps) {
  const instruments = useMemo(() => DRUM_INSTRUMENTS, []);

  const handleCellClick = useCallback(
    (instrument: DrumInstrument, step: number) => {
      const existing = drumHits.find(
        (h) => h.instrument === instrument && h.step === step
      );
      if (existing) {
        onDrumRemove(existing.id);
      } else {
        playDrum(instrument);
        onDrumAdd({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          step,
          instrument,
          velocity: 0.8,
        });
      }
    },
    [drumHits, onDrumAdd, onDrumRemove, playDrum]
  );

  const getDrumColor = (instrument: DrumInstrument) => {
    const found = instruments.find((i) => i.key === instrument);
    return found?.color || "bg-gray-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-parchment/50 rounded-xl p-4 shadow-lg border-2 border-ink/20"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-ink font-chinese flex items-center gap-2">
          <span className="text-2xl">🥁</span>
          鼓点伴奏
        </h3>
        <span className="text-xs text-ink/50 font-chinese">
          {drumHits.length} 个鼓点
        </span>
      </div>

      <div className="overflow-auto rounded-lg border-2 border-ink/20 bg-parchment/30">
        <div className="flex min-w-max">
          <div className="sticky left-0 z-10 bg-parchment border-r border-ink/20">
            <div
              className="flex items-center justify-center text-xs font-bold text-ink/60 font-chinese bg-parchment border-b border-ink/20"
              style={{ width: 50, height: 20 }}
            >
              鼓组
            </div>
            {instruments.map((inst) => (
              <div
                key={inst.key}
                className="flex items-center justify-end pr-2 text-xs font-chinese text-ink/80 bg-gradient-to-r from-parchment to-transparent border-b border-ink/10"
                style={{ width: 50, height: 28 }}
              >
                <span className="mr-1">{inst.emoji}</span>
                <span className="text-ink/60">{inst.name}</span>
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
                  style={{ width: CELL_WIDTH, height: 20 }}
                >
                  {i % 4 === 0 ? Math.floor(i / 4) + 1 : ""}
                </div>
              ))}
            </div>

            {instruments.map((inst) => (
              <div key={inst.key} className="flex">
                {Array.from({ length: totalSteps }).map((_, colIndex) => {
                  const hit = drumHits.find(
                    (h) => h.instrument === inst.key && h.step === colIndex
                  );
                  const isPlayhead = currentStep === colIndex;
                  const isBeat = colIndex % 4 === 0;

                  return (
                    <motion.div
                      key={colIndex}
                      onClick={() => handleCellClick(inst.key, colIndex)}
                      className={`relative cursor-pointer border-r border-b border-ink/10 transition-colors ${
                        isBeat ? "bg-ink/5" : "bg-transparent"
                      } ${isPlayhead ? "bg-vermilion/20" : ""} hover:bg-jade/10`}
                      style={{ width: CELL_WIDTH, height: 28 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {hit && (
                        <motion.div
                          className={`absolute inset-1 ${getDrumColor(
                            hit.instrument
                          )} rounded shadow-md`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
