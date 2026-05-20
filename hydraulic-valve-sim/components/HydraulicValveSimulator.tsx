'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HydraulicValveSimulator() {
  const [valveAngle, setValveAngle] = useState(45);
  const [inputPressure, setInputPressure] = useState(50);
  const [flowDirection, setFlowDirection] = useState<'forward' | 'reverse'>('forward');
  const [isRunning, setIsRunning] = useState(true);

  const valveOpenPercentage = useMemo(() => {
    return Math.abs(Math.cos((valveAngle * Math.PI) / 180)) * 100;
  }, [valveAngle]);

  const flowRate = useMemo(() => {
    if (!isRunning) return 0;
    const openFactor = valveOpenPercentage / 100;
    const pressureFactor = inputPressure / 100;
    return openFactor * pressureFactor * 100;
  }, [valveOpenPercentage, inputPressure, isRunning]);

  const velocity = useMemo(() => {
    if (valveOpenPercentage < 5) return 0;
    return (flowRate / valveOpenPercentage) * 100;
  }, [flowRate, valveOpenPercentage]);

  const workState = useMemo(() => {
    if (valveOpenPercentage < 5) return { name: '截止', color: 'bg-red-500', description: '阀门完全关闭，流体被截断' };
    if (valveOpenPercentage < 40) return { name: '节流', color: 'bg-yellow-500', description: '阀门部分开启，控制流量大小' };
    if (valveOpenPercentage > 80 && Math.abs(inputPressure - 50) < 15) return { name: '稳压', color: 'bg-green-500', description: '阀门全开，压力稳定在正常范围' };
    return { name: '调节', color: 'bg-blue-500', description: '阀门处于正常调节工作状态' };
  }, [valveOpenPercentage, inputPressure]);

  const outputPressure = useMemo(() => {
    const pressureDrop = (1 - valveOpenPercentage / 100) * inputPressure * 0.6;
    return Math.max(0, inputPressure - pressureDrop);
  }, [inputPressure, valveOpenPercentage]);

  const particleCount = Math.max(0, Math.floor(flowRate / 8));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            液压阀门流体动态仿真器
          </h1>
          <p className="text-slate-400">调节阀门角度与压力，直观观察液压传动原理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative w-full h-80 md:h-96 bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl overflow-hidden">
                <svg viewBox="0 0 800 400" className="w-full h-full">
                  <defs>
                    <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="50%" stopColor="#334155" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                    <linearGradient id="fluidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <rect x="50" y="160" width="700" height="80" rx="10" fill="url(#pipeGradient)" stroke="#64748b" strokeWidth="2" />
                  <rect x="50" y="175" width="700" height="50" fill="#0f172a" rx="5" />

                  <motion.rect
                    x="50"
                    y="175"
                    width={flowDirection === 'forward' ? 350 : 350}
                    height="50"
                    fill="url(#fluidGradient)"
                    opacity={isRunning ? 0.8 : 0.3}
                    initial={false}
                    animate={{
                      x: flowDirection === 'forward' ? 50 : 400,
                      width: 350,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.rect
                    x={flowDirection === 'forward' ? 400 : 50}
                    y="175"
                    width={350 * (valveOpenPercentage / 100)}
                    height="50"
                    fill="url(#fluidGradient)"
                    opacity={isRunning ? 0.6 : 0.2}
                    initial={false}
                    animate={{
                      opacity: isRunning ? 0.6 : 0.2,
                      width: 350 * (valveOpenPercentage / 100),
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {isRunning && Array.from({ length: particleCount }).map((_, i) => (
                    <motion.circle
                      key={i}
                      r={3 + Math.random() * 3}
                      fill="#60a5fa"
                      opacity={0.8}
                      filter="url(#glow)"
                      initial={false}
                      animate={{
                        x: flowDirection === 'forward'
                          ? [100, 700]
                          : [700, 100],
                        y: [180 + Math.random() * 40, 180 + Math.random() * 40, 180 + Math.random() * 40],
                      }}
                      transition={{
                        duration: 3 / (velocity / 50 + 0.5),
                        repeat: Infinity,
                        delay: (i * 0.15) % 2,
                        ease: 'linear',
                      }}
                    />
                  ))}

                  <g>
                    <rect x="380" y="120" width="40" height="160" fill="#475569" rx="5" stroke="#64748b" strokeWidth="2" />
                    <motion.rect
                      x="385"
                      y="125"
                      width="30"
                      height="150"
                      fill="#1e3a5f"
                      rx="3"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                      }}
                    />
                    <motion.g
                      style={{ originX: 0.5, originY: 0.5 }}
                      animate={{ rotate: valveAngle }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <circle cx="400" cy="200" r="45" fill="#334155" stroke="#64748b" strokeWidth="3" />
                      <rect
                        x="360"
                        y="195"
                        width="80"
                        height="10"
                        fill="#94a3b8"
                        rx="2"
                      />
                      <circle cx="400" cy="200" r="15" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                      <line x1="400" y1="200" x2="400" y2="170" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                    </motion.g>
                  </g>

                  <g>
                    <motion.path
                      d={`M 120 270 Q 200 ${270 - velocity * 0.3} 280 270`}
                      stroke="#22c55e"
                      strokeWidth="2"
                      fill="none"
                      opacity={velocity > 5 ? 0.8 : 0.2}
                    />
                    <motion.path
                      d={`M 520 270 Q 600 ${270 - velocity * 0.3} 680 270`}
                      stroke="#22c55e"
                      strokeWidth="2"
                      fill="none"
                      opacity={velocity > 5 && valveOpenPercentage > 20 ? 0.8 : 0.2}
                    />
                    {velocity > 20 && (
                      <motion.path
                        d="M 200 100 Q 250 80 300 100"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        fill="none"
                        opacity={0.6}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </g>

                  <text x="80" y="155" fill="#94a3b8" fontSize="12" fontWeight="bold">入口</text>
                  <text x="680" y="155" fill="#94a3b8" fontSize="12" fontWeight="bold">出口</text>
                  <text x="380" y="110" fill="#f59e0b" fontSize="11" fontWeight="bold">阀门</text>
                  <text x="130" y="290" fill="#22c55e" fontSize="10" opacity={velocity > 5 ? 1 : 0.3}>流速</text>
                  <text x="530" y="290" fill="#22c55e" fontSize="10" opacity={velocity > 5 && valveOpenPercentage > 20 ? 1 : 0.3}>流速</text>
                </svg>

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <motion.div
                    className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}
                    animate={{ scale: isRunning ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-white text-sm font-medium">{isRunning ? '运行中' : '已停止'}</span>
                </div>

                <div className="absolute top-4 right-4">
                  <motion.div
                    className={`px-4 py-2 rounded-lg text-white text-sm font-bold ${workState.color}`}
                    key={workState.name}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {workState.name}状态
                  </motion.div>
                </div>

                <AnimatePresence>
                  {valveOpenPercentage < 10 && (
                    <motion.div
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      ⚠️ 阀门即将完全关闭
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <DataCard label="阀门开度" value={`${valveOpenPercentage.toFixed(1)}%`} color="text-blue-400" />
                <DataCard label="入口压力" value={`${inputPressure.toFixed(1)} MPa`} color="text-orange-400" />
                <DataCard label="出口压力" value={`${outputPressure.toFixed(1)} MPa`} color="text-cyan-400" />
                <DataCard label="流量" value={`${flowRate.toFixed(1)} L/min`} color="text-green-400" />
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <DataCard label="流速" value={`${velocity.toFixed(1)} m/s`} color="text-purple-400" />
                <DataCard label="流向" value={flowDirection === 'forward' ? '正向 →' : '← 反向'} color="text-pink-400" />
                <DataCard label="阀门角度" value={`${valveAngle}°`} color="text-yellow-400" />
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> 控制面板
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-slate-300 font-medium">阀门角度</label>
                    <span className="text-yellow-400 font-bold">{valveAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={valveAngle}
                    onChange={(e) => setValveAngle(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>全开</span>
                    <span>全关</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-slate-300 font-medium">入口压力</label>
                    <span className="text-orange-400 font-bold">{inputPressure} MPa</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputPressure}
                    onChange={(e) => setInputPressure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>低压</span>
                    <span>高压</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium mb-2 block">流向控制</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFlowDirection('forward')}
                      className={`py-2 px-4 rounded-lg font-medium transition-all ${
                        flowDirection === 'forward'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      正向 →
                    </button>
                    <button
                      onClick={() => setFlowDirection('reverse')}
                      className={`py-2 px-4 rounded-lg font-medium transition-all ${
                        flowDirection === 'reverse'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      ← 反向
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                    isRunning
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isRunning ? '⏹ 停止仿真' : '▶ 开始仿真'}
                </button>

                <div className="pt-4 border-t border-slate-700">
                  <label className="text-slate-300 font-medium mb-3 block">快捷模式</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => { setValveAngle(85); setInputPressure(50); }}
                      className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all text-left"
                    >
                      🚫 截止模式
                    </button>
                    <button
                      onClick={() => { setValveAngle(60); setInputPressure(70); }}
                      className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all text-left"
                    >
                      📊 节流模式
                    </button>
                    <button
                      onClick={() => { setValveAngle(10); setInputPressure(50); }}
                      className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all text-left"
                    >
                      ⚡ 稳压模式
                    </button>
                    <button
                      onClick={() => { setValveAngle(30); setInputPressure(80); }}
                      className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all text-left"
                    >
                      🔥 高压模式
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📚</span> 工作原理
              </h2>
              <div className="space-y-3 text-sm">
                <div className={`p-3 rounded-lg border-l-4 ${workState.color} bg-slate-900/50`}>
                  <p className="text-white font-medium">{workState.name}状态</p>
                  <p className="text-slate-400 text-xs mt-1">{workState.description}</p>
                </div>
                <div className="text-slate-400 space-y-2">
                  <p>• <span className="text-white">阀门角度</span>: 0°全开，90°全关</p>
                  <p>• <span className="text-white">流量公式</span>: Q = K × √ΔP × 开度</p>
                  <p>• <span className="text-white">伯努利原理</span>: 流速增大，压强减小</p>
                  <p>• <span className="text-white">节流效应</span>: 阀门前后产生压力差</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      className="bg-slate-900/50 rounded-xl p-3 border border-slate-700"
      whileHover={{ scale: 1.02 }}
    >
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </motion.div>
  );
}
