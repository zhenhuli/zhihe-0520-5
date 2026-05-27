"use client";

import { motion } from "framer-motion";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { TempoRampConfig, TempoRampPoint } from "@/types";

interface TempoRampPanelProps {
  baseBpm: number;
  totalSteps: number;
  tempoRamp: TempoRampConfig | null;
  onTempoRampChange: (config: TempoRampConfig | null) => void;
  onApply: () => void;
}

export function TempoRampPanel({
  baseBpm,
  totalSteps,
  tempoRamp,
  onTempoRampChange,
  onApply,
}: TempoRampPanelProps) {
  const [editingPoint, setEditingPoint] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgRect, setSvgRect] = useState<DOMRect | null>(null);

  const sortedPoints = useMemo(() => {
    if (!tempoRamp?.points) return [];
    return [...tempoRamp.points].sort((a, b) => a.step - b.step);
  }, [tempoRamp]);

  const isEnabled = tempoRamp?.enabled || false;

  const chartWidth = 600;
  const chartHeight = 120;
  const minBpm = 40;
  const maxBpm = 200;
  const bpmRange = maxBpm - minBpm;

  const getX = useCallback(
    (step: number) => (step / totalSteps) * chartWidth,
    [totalSteps]
  );
  const getY = useCallback(
    (bpm: number) => chartHeight - ((bpm - minBpm) / bpmRange) * chartHeight,
    [bpmRange]
  );

  const getStepFromX = useCallback(
    (x: number) => Math.round((x / chartWidth) * totalSteps),
    [totalSteps]
  );
  const getBpmFromY = useCallback(
    (y: number) => Math.round(minBpm + ((chartHeight - y) / chartHeight) * bpmRange),
    [bpmRange]
  );

  useEffect(() => {
    if (svgRef.current) {
      setSvgRect(svgRef.current.getBoundingClientRect());
    }
  }, [isEnabled]);

  const toggleEnabled = useCallback(() => {
    if (!tempoRamp) {
      onTempoRampChange({
        enabled: true,
        points: [
          { step: 0, bpm: baseBpm },
          { step: totalSteps, bpm: baseBpm },
        ],
      });
    } else {
      onTempoRampChange({
        ...tempoRamp,
        enabled: !tempoRamp.enabled,
      });
    }
  }, [tempoRamp, baseBpm, totalSteps, onTempoRampChange]);

  const addPoint = useCallback(() => {
    if (!tempoRamp) return;
    const newStep =
      sortedPoints.length > 0
        ? Math.min(totalSteps, sortedPoints[sortedPoints.length - 1].step + 8)
        : 0;
    const newBpm =
      sortedPoints.length > 0
        ? sortedPoints[sortedPoints.length - 1].bpm
        : baseBpm;

    onTempoRampChange({
      ...tempoRamp,
      points: [...tempoRamp.points, { step: newStep, bpm: newBpm }],
    });
  }, [tempoRamp, sortedPoints, totalSteps, baseBpm, onTempoRampChange]);

  const updatePoint = useCallback(
    (index: number, updates: Partial<TempoRampPoint>) => {
      if (!tempoRamp) return;
      const newPoints = [...tempoRamp.points];
      const originalIndex = tempoRamp.points.findIndex(
        (p) =>
          p.step === sortedPoints[index].step && p.bpm === sortedPoints[index].bpm
      );
      if (originalIndex >= 0) {
        newPoints[originalIndex] = { ...newPoints[originalIndex], ...updates };
        onTempoRampChange({ ...tempoRamp, points: newPoints });
      }
    },
    [tempoRamp, sortedPoints, onTempoRampChange]
  );

  const removePoint = useCallback(
    (index: number) => {
      if (!tempoRamp || tempoRamp.points.length <= 2) return;
      const originalIndex = tempoRamp.points.findIndex(
        (p) =>
          p.step === sortedPoints[index].step && p.bpm === sortedPoints[index].bpm
      );
      if (originalIndex >= 0) {
        onTempoRampChange({
          ...tempoRamp,
          points: tempoRamp.points.filter((_, i) => i !== originalIndex),
        });
      }
    },
    [tempoRamp, sortedPoints, onTempoRampChange]
  );

  const addPreset = useCallback(
    (type: "accelerando" | "ritardando" | "rubato") => {
      let points: TempoRampPoint[] = [];
      switch (type) {
        case "accelerando":
          points = [
            { step: 0, bpm: baseBpm },
            { step: totalSteps, bpm: Math.min(200, baseBpm + 40) },
          ];
          break;
        case "ritardando":
          points = [
            { step: 0, bpm: baseBpm },
            { step: totalSteps, bpm: Math.max(40, baseBpm - 40) },
          ];
          break;
        case "rubato":
          points = [
            { step: 0, bpm: baseBpm },
            { step: 8, bpm: baseBpm + 10 },
            { step: 16, bpm: baseBpm - 5 },
            { step: 24, bpm: baseBpm + 15 },
            { step: 32, bpm: baseBpm },
          ];
          break;
      }
      onTempoRampChange({ enabled: true, points });
    },
    [baseBpm, totalSteps, onTempoRampChange]
  );

  const getBpmAtStep = useCallback(
    (step: number): number => {
      if (!isEnabled || sortedPoints.length < 2) return baseBpm;

      if (step <= sortedPoints[0].step) return sortedPoints[0].bpm;
      if (step >= sortedPoints[sortedPoints.length - 1].step)
        return sortedPoints[sortedPoints.length - 1].bpm;

      for (let i = 0; i < sortedPoints.length - 1; i++) {
        const p1 = sortedPoints[i];
        const p2 = sortedPoints[i + 1];
        if (step >= p1.step && step <= p2.step) {
          const progress = (step - p1.step) / (p2.step - p1.step);
          return Math.round(p1.bpm + (p2.bpm - p1.bpm) * progress);
        }
      }
      return baseBpm;
    },
    [isEnabled, sortedPoints, baseBpm]
  );

  const pathD = useMemo(() => {
    if (!isEnabled || sortedPoints.length < 2) {
      return `M 0 ${getY(baseBpm)} L ${chartWidth} ${getY(baseBpm)}`;
    }
    const points = sortedPoints.map((p) => `${getX(p.step)} ${getY(p.bpm)}`);
    return `M ${points.join(" L ")}`;
  }, [isEnabled, sortedPoints, baseBpm, getX, getY]);

  const handleMouseDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingIndex(index);
      setEditingPoint(index);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingIndex === null || !svgRect || !tempoRamp) return;

      const svgX = e.clientX - svgRect.left;
      const svgY = e.clientY - svgRect.top;

      const scaleX = chartWidth / svgRect.width;
      const scaleY = chartHeight / svgRect.height;

      const newStep = Math.max(0, Math.min(totalSteps, getStepFromX(svgX * scaleX)));
      const newBpm = Math.max(minBpm, Math.min(maxBpm, getBpmFromY(svgY * scaleY)));

      updatePoint(draggingIndex, { step: newStep, bpm: newBpm });
    },
    [draggingIndex, svgRect, tempoRamp, totalSteps, getStepFromX, getBpmFromY, updatePoint]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-parchment-light to-parchment rounded-xl p-4 shadow-lg border-2 border-ink/20"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-ink font-chinese flex items-center gap-2">
          <span>📈</span>
          速度渐变
        </h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={toggleEnabled}
              className="w-4 h-4 accent-jade"
            />
            <span className="text-sm text-ink font-chinese">启用</span>
          </label>
          {isEnabled && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onApply}
              className="px-4 py-2 rounded-lg bg-jade hover:bg-jade-light text-white font-chinese text-sm transition-colors"
            >
              ✅ 应用
            </motion.button>
          )}
        </div>
      </div>

      {!isEnabled && (
        <div className="text-center py-8 text-ink/50 font-chinese">
          <p>勾选&quot;启用&quot;以使用速度渐变功能</p>
          <p className="text-sm mt-2">可以让音乐在播放过程中逐渐加快或减慢</p>
        </div>
      )}

      {isEnabled && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addPreset("accelerando")}
              className="px-3 py-1 rounded-lg bg-gold/20 hover:bg-gold/30 text-gold-dark text-sm font-chinese transition-colors"
            >
              ⚡ 渐快
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addPreset("ritardando")}
              className="px-3 py-1 rounded-lg bg-indigo/20 hover:bg-indigo/30 text-indigo text-sm font-chinese transition-colors"
            >
              🐢 渐慢
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addPreset("rubato")}
              className="px-3 py-1 rounded-lg bg-vermilion/20 hover:bg-vermilion/30 text-vermilion text-sm font-chinese transition-colors"
            >
              🎭 自由速度
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addPoint}
              className="px-3 py-1 rounded-lg bg-ink/10 hover:bg-ink/20 text-ink text-sm font-chinese transition-colors"
            >
              + 添加节点
            </motion.button>
          </div>

          <div className="bg-parchment-dark/20 rounded-lg p-4 mb-4">
            <svg
              ref={svgRef}
              width="100%"
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="overflow-visible select-none"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const y = (i / 4) * chartHeight;
                const bpm = Math.round(maxBpm - (i / 4) * bpmRange);
                return (
                  <g key={i}>
                    <line
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="rgba(44, 24, 16, 0.1)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="-5"
                      y={y + 4}
                      fontSize="10"
                      fill="rgba(44, 24, 16, 0.5)"
                      textAnchor="end"
                    >
                      {bpm}
                    </text>
                  </g>
                );
              })}

              <path
                d={pathD}
                fill="none"
                stroke="#00A86B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {sortedPoints.map((point, idx) => (
                <g
                  key={`${point.step}-${point.bpm}-${idx}`}
                  onMouseDown={(e) => handleMouseDown(idx, e)}
                  className={`cursor-${draggingIndex === idx ? "grabbing" : "grab"}`}
                  style={{ userSelect: "none" }}
                >
                  <circle
                    cx={getX(point.step)}
                    cy={getY(point.bpm)}
                    r="12"
                    fill="transparent"
                  />
                  <circle
                    cx={getX(point.step)}
                    cy={getY(point.bpm)}
                    r="8"
                    fill={draggingIndex === idx ? "#00875A" : "#00A86B"}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all"
                  />
                  <text
                    x={getX(point.step)}
                    y={getY(point.bpm) - 12}
                    fontSize="10"
                    fill="#2C1810"
                    textAnchor="middle"
                    fontWeight="bold"
                    style={{ pointerEvents: "none" }}
                  >
                    {point.bpm}
                  </text>
                </g>
              ))}
            </svg>
            <p className="text-xs text-ink/50 font-chinese text-center mt-2">
              💡 拖拽节点可调整速度变化
            </p>
          </div>

          <div className="space-y-2 max-h-48 overflow-auto">
            {sortedPoints.map((point, idx) => (
              <motion.div
                key={`${point.step}-${point.bpm}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  editingPoint === idx ? "bg-jade/20" : "bg-parchment-dark/20"
                }`}
              >
                <span className="text-sm font-bold text-ink font-chinese w-16">
                  节点 {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-ink/60 font-chinese">步骤:</label>
                  <input
                    type="number"
                    min="0"
                    max={totalSteps}
                    value={point.step}
                    onChange={(e) =>
                      updatePoint(idx, { step: parseInt(e.target.value) || 0 })
                    }
                    className="w-16 px-2 py-1 rounded bg-parchment border border-ink/20 text-ink text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-ink/60 font-chinese">BPM:</label>
                  <input
                    type="number"
                    min="40"
                    max="200"
                    value={point.bpm}
                    onChange={(e) =>
                      updatePoint(idx, { bpm: parseInt(e.target.value) || baseBpm })
                    }
                    className="w-16 px-2 py-1 rounded bg-parchment border border-ink/20 text-ink text-sm"
                  />
                </div>
                {sortedPoints.length > 2 && (
                  <button
                    onClick={() => removePoint(idx)}
                    className="ml-auto text-vermilion hover:text-vermilion-light text-sm"
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[0, 8, 16, 24].map((step) => (
              <div
                key={step}
                className="text-center p-2 bg-parchment-dark/20 rounded-lg"
              >
                <p className="text-xs text-ink/60 font-chinese">步骤 {step}</p>
                <p className="text-lg font-bold text-jade">{getBpmAtStep(step)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
