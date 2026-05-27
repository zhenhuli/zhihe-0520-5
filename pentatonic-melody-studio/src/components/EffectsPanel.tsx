"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import type { EffectConfig, EffectType } from "@/types";
import { EFFECT_TYPES, DEFAULT_EFFECT_PARAMS } from "@/types";

interface EffectsPanelProps {
  trackId: string;
  trackName: string;
  effects: EffectConfig[];
  onEffectsChange: (effects: EffectConfig[]) => void;
  onApplyEffects: (trackId: string, effects: EffectConfig[]) => void;
}

export function EffectsPanel({
  trackId,
  trackName,
  effects,
  onEffectsChange,
  onApplyEffects,
}: EffectsPanelProps) {
  const [expandedEffect, setExpandedEffect] = useState<EffectType | null>(null);

  const toggleEffect = useCallback(
    (type: EffectType) => {
      const existingEffect = effects.find((e) => e.type === type);
      let newEffects: EffectConfig[];

      if (existingEffect) {
        newEffects = effects.map((e) =>
          e.type === type ? { ...e, enabled: !e.enabled } : e
        );
      } else {
        newEffects = [
          ...effects,
          {
            type,
            enabled: true,
            wet: 0.3,
            params: { ...DEFAULT_EFFECT_PARAMS[type] },
          },
        ];
      }

      onEffectsChange(newEffects);
    },
    [effects, onEffectsChange]
  );

  const removeEffect = useCallback(
    (type: EffectType) => {
      onEffectsChange(effects.filter((e) => e.type !== type));
      if (expandedEffect === type) {
        setExpandedEffect(null);
      }
    },
    [effects, onEffectsChange, expandedEffect]
  );

  const updateEffectWet = useCallback(
    (type: EffectType, wet: number) => {
      onEffectsChange(
        effects.map((e) => (e.type === type ? { ...e, wet } : e))
      );
    },
    [effects, onEffectsChange]
  );

  const updateEffectParam = useCallback(
    (type: EffectType, param: string, value: number) => {
      onEffectsChange(
        effects.map((e) =>
          e.type === type
            ? { ...e, params: { ...e.params, [param]: value } }
            : e
        )
      );
    },
    [effects, onEffectsChange]
  );

  const handleApply = useCallback(() => {
    onApplyEffects(trackId, effects);
  }, [trackId, effects, onApplyEffects]);

  const getEffectInfo = (type: EffectType) => {
    return EFFECT_TYPES.find((e) => e.key === type);
  };

  const getParamLabel = (param: string): string => {
    const labels: Record<string, string> = {
      decay: "衰减时间",
      preDelay: "预延迟",
      delayTime: "延迟时间",
      feedback: "反馈",
      frequency: "频率",
      depth: "深度",
      distortion: "失真度",
      octaves: "八度",
    };
    return labels[param] || param;
  };

  const enabledEffects = effects.filter((e) => e.enabled);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-parchment-light to-parchment rounded-xl p-4 shadow-lg border-2 border-ink/20"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-ink font-chinese flex items-center gap-2">
          <span>🎛️</span>
          音效叠加
          <span className="text-sm font-normal text-ink/60">- {trackName}</span>
        </h3>
        {enabledEffects.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApply}
            className="px-4 py-2 rounded-lg bg-jade hover:bg-jade-light text-white font-chinese text-sm transition-colors"
          >
            ✅ 应用音效
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
        {EFFECT_TYPES.map((effectType) => {
          const existingEffect = effects.find((e) => e.type === effectType.key);
          const isActive = existingEffect?.enabled || false;

          return (
            <motion.button
              key={effectType.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleEffect(effectType.key)}
              onContextMenu={(e) => {
                e.preventDefault();
                setExpandedEffect(
                  expandedEffect === effectType.key ? null : effectType.key
                );
              }}
              className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                isActive
                  ? "bg-indigo text-white shadow-lg"
                  : "bg-parchment-dark/30 text-ink hover:bg-parchment-dark/50"
              }`}
            >
              <span className="text-2xl">{effectType.emoji}</span>
              <span className="text-xs font-chinese">{effectType.name}</span>
              {isActive && (
                <span className="text-[10px] opacity-70">
                  湿: {Math.round((existingEffect?.wet || 0) * 100)}%
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {expandedEffect && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-parchment-dark/20 rounded-lg mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-ink font-chinese flex items-center gap-2">
              <span>{getEffectInfo(expandedEffect)?.emoji}</span>
              {getEffectInfo(expandedEffect)?.name} 设置
            </h4>
            <button
              onClick={() => removeEffect(expandedEffect)}
              className="text-vermilion hover:text-vermilion-light text-sm font-chinese"
            >
              移除
            </button>
          </div>

          {effects.find((e) => e.type === expandedEffect) && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-ink/60 font-chinese block mb-1">
                  湿信号 (Wet):{" "}
                  {Math.round(
                    (effects.find((e) => e.type === expandedEffect)?.wet || 0) * 100
                  )}
                  %
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effects.find((e) => e.type === expandedEffect)?.wet || 0}
                  onChange={(e) =>
                    updateEffectWet(expandedEffect, parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-parchment-dark/30 rounded-lg appearance-none cursor-pointer accent-indigo"
                />
              </div>

              {Object.entries(
                effects.find((e) => e.type === expandedEffect)?.params || {}
              ).map(([param, value]) => (
                <div key={param}>
                  <label className="text-xs text-ink/60 font-chinese block mb-1">
                    {getParamLabel(param)}: {value}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={param === "frequency" ? "20" : param === "decay" ? "10" : "1"}
                    step={param === "frequency" ? "0.1" : "0.01"}
                    value={value}
                    onChange={(e) =>
                      updateEffectParam(
                        expandedEffect,
                        param,
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-parchment-dark/30 rounded-lg appearance-none cursor-pointer accent-indigo"
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {enabledEffects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {enabledEffects.map((effect) => {
            const info = getEffectInfo(effect.type);
            return (
              <motion.div
                key={effect.type}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-indigo/20 rounded-full text-indigo text-xs font-chinese flex items-center gap-1"
              >
                <span>{info?.emoji}</span>
                <span>{info?.name}</span>
                <span className="text-indigo/60">
                  {Math.round(effect.wet * 100)}%
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-ink/50 font-chinese mt-3">
        💡 右键点击音效图标可展开详细设置
      </p>
    </motion.div>
  );
}
