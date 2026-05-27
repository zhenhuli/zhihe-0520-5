"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Template } from "@/types";
import { TEMPLATE_CATEGORIES, DIFFICULTY_LEVELS, PENTATONIC_SCALES, MUSIC_STYLES } from "@/types";
import { TEMPLATES } from "@/data/templates";

interface TemplateMarketProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (data: Template["data"]) => void;
}

export function TemplateMarket({ isOpen, onClose, onApplyTemplate }: TemplateMarketProps) {
  const [selectedCategory, setSelectedCategory] = useState<Template["category"] | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Template["difficulty"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    if (selectedCategory !== "all" && tpl.category !== selectedCategory) return false;
    if (selectedDifficulty !== "all" && tpl.difficulty !== selectedDifficulty) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tpl.name.toLowerCase().includes(query) ||
        tpl.description.toLowerCase().includes(query) ||
        tpl.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleApplyTemplate = (tpl: Template) => {
    onApplyTemplate(tpl.data);
    onClose();
  };

  const getCategoryInfo = (category: Template["category"]) => {
    return TEMPLATE_CATEGORIES.find((c) => c.key === category);
  };

  const getDifficultyInfo = (difficulty: Template["difficulty"]) => {
    return DIFFICULTY_LEVELS.find((d) => d.key === difficulty);
  };

  const totalNoteCount = (tpl: Template) =>
    tpl.data.tracks.reduce((sum, t) => sum + t.notes.length, 0);

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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-4xl mx-auto max-h-[85vh]"
          >
            <div className="rounded-2xl shadow-2xl border-2 border-ink/20 overflow-hidden" style={{ backgroundColor: "#F5E6D3" }}>
              <div className="p-5 border-b-2 border-ink/10" style={{ background: "linear-gradient(to right, rgba(232, 213, 196, 0.3), transparent)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-ink font-chinese flex items-center gap-2">
                    <span className="text-3xl">🏪</span>
                    模板市场
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

                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索模板..."
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border-2 border-ink/20 focus:border-jade/50 focus:outline-none transition-colors font-chinese text-ink placeholder-ink/30 text-sm"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                  />
                </div>
              </div>

              <div className="p-4 border-b-2 border-ink/10 bg-parchment/30">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-sm text-ink/60 font-chinese mr-2">分类:</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1 rounded-full text-sm font-chinese transition-colors ${
                      selectedCategory === "all"
                        ? "bg-jade text-white"
                        : "bg-ink/10 text-ink/70 hover:bg-ink/20"
                    }`}
                  >
                    全部
                  </motion.button>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat.key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-3 py-1 rounded-full text-sm font-chinese transition-colors ${
                        selectedCategory === cat.key
                          ? "bg-jade text-white"
                          : "bg-ink/10 text-ink/70 hover:bg-ink/20"
                      }`}
                    >
                      {cat.emoji} {cat.name}
                    </motion.button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-ink/60 font-chinese mr-2">难度:</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDifficulty("all")}
                    className={`px-3 py-1 rounded-full text-sm font-chinese transition-colors ${
                      selectedDifficulty === "all"
                        ? "bg-indigo text-white"
                        : "bg-ink/10 text-ink/70 hover:bg-ink/20"
                    }`}
                  >
                    全部
                  </motion.button>
                  {DIFFICULTY_LEVELS.map((diff) => (
                    <motion.button
                      key={diff.key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDifficulty(diff.key)}
                      className={`px-3 py-1 rounded-full text-sm font-chinese transition-colors ${
                        selectedDifficulty === diff.key
                          ? "bg-indigo text-white"
                          : "bg-ink/10 text-ink/70 hover:bg-ink/20"
                      }`}
                    >
                      {diff.emoji} {diff.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="p-4 max-h-[50vh] overflow-auto">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-ink/60 font-chinese">没有找到匹配的模板</p>
                    <p className="text-ink/40 text-sm mt-2">尝试调整筛选条件</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((tpl) => {
                      const categoryInfo = getCategoryInfo(tpl.category);
                      const difficultyInfo = getDifficultyInfo(tpl.difficulty);

                      return (
                        <motion.div
                          key={tpl.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setSelectedTemplate(tpl)}
                          className="rounded-xl p-4 border-2 border-ink/10 hover:border-jade/30 cursor-pointer transition-all"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="text-4xl">{tpl.preview}</div>
                            <div className="flex-1">
                              <h3 className="font-bold text-ink font-chinese">{tpl.name}</h3>
                              <div className="flex gap-2 mt-1">
                                {categoryInfo && (
                                  <span className="px-2 py-0.5 text-xs rounded font-chinese bg-jade/10 text-jade">
                                    {categoryInfo.name}
                                  </span>
                                )}
                                {difficultyInfo && (
                                  <span className="px-2 py-0.5 text-xs rounded font-chinese bg-indigo/10 text-indigo">
                                    {difficultyInfo.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-ink/60 font-chinese mb-3 line-clamp-2">
                            {tpl.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-ink/50 mb-3 font-chinese">
                            <span>🎵 {totalNoteCount(tpl)} 音符</span>
                            <span>⏱️ {tpl.data.bpm} BPM</span>
                            <span>🎼 {PENTATONIC_SCALES[tpl.data.scale]?.name}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {tpl.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs rounded bg-gold/10 text-gold-dark font-chinese"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyTemplate(tpl);
                            }}
                            className="w-full mt-3 py-2 rounded-lg bg-vermilion hover:bg-vermilion-light text-white font-chinese text-sm transition-colors"
                          >
                            使用此模板
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {selectedTemplate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center"
                style={{ backgroundColor: "rgba(44, 24, 16, 0.8)" }}
                onClick={() => setSelectedTemplate(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-lg mx-4 rounded-2xl shadow-2xl border-2 border-ink/20 overflow-hidden"
                  style={{ backgroundColor: "#F5E6D3" }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-5xl">{selectedTemplate.preview}</span>
                        <div>
                          <h3 className="text-xl font-bold text-ink font-chinese">
                            {selectedTemplate.name}
                          </h3>
                          <p className="text-sm text-ink/60 font-chinese">
                            {selectedTemplate.description}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedTemplate(null)}
                        className="w-8 h-8 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center text-ink"
                      >
                        ✕
                      </motion.button>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-parchment/50 rounded-lg p-3">
                          <div className="text-xs text-ink/50 font-chinese mb-1">调式</div>
                          <div className="text-ink font-chinese">
                            {PENTATONIC_SCALES[selectedTemplate.data.scale]?.name}
                          </div>
                        </div>
                        <div className="flex-1 bg-parchment/50 rounded-lg p-3">
                          <div className="text-xs text-ink/50 font-chinese mb-1">曲风</div>
                          <div className="text-ink font-chinese">
                            {MUSIC_STYLES[selectedTemplate.data.style]?.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-parchment/50 rounded-lg p-3">
                          <div className="text-xs text-ink/50 font-chinese mb-1">速度</div>
                          <div className="text-ink font-chinese">{selectedTemplate.data.bpm} BPM</div>
                        </div>
                        <div className="flex-1 bg-parchment/50 rounded-lg p-3">
                          <div className="text-xs text-ink/50 font-chinese mb-1">音轨</div>
                          <div className="text-ink font-chinese">
                            {selectedTemplate.data.tracks.length} 轨
                          </div>
                        </div>
                      </div>

                      <div className="bg-parchment/50 rounded-lg p-3">
                        <div className="text-xs text-ink/50 font-chinese mb-1">标签</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedTemplate.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs rounded bg-gold/10 text-gold-dark font-chinese"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApplyTemplate(selectedTemplate)}
                      className="w-full py-3 rounded-lg bg-vermilion hover:bg-vermilion-light text-white font-chinese transition-colors"
                    >
                      使用此模板开始创作
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}