"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEORY_HINTS, HINT_CATEGORIES } from "@/data/theoryHints";
import type { TheoryHint } from "@/types";

interface TheoryHintsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TheoryHints({ isOpen, onClose }: TheoryHintsProps) {
  const [selectedCategory, setSelectedCategory] = useState<TheoryHint["category"] | "all">("all");
  const [selectedHint, setSelectedHint] = useState<TheoryHint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRandomHint, setShowRandomHint] = useState(false);
  const [randomHint, setRandomHint] = useState<TheoryHint | null>(null);

  const filteredHints = useMemo(() => {
    return THEORY_HINTS.filter((hint) => {
      if (selectedCategory !== "all" && hint.category !== selectedCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          hint.title.toLowerCase().includes(query) ||
          hint.content.toLowerCase().includes(query) ||
          hint.relatedConcepts?.some((c) => c.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const getCategoryInfo = (category: TheoryHint["category"]) => {
    return HINT_CATEGORIES.find((c) => c.key === category);
  };

  const handleRandomHint = () => {
    const randomIndex = Math.floor(Math.random() * THEORY_HINTS.length);
    setRandomHint(THEORY_HINTS[randomIndex]);
    setShowRandomHint(true);
  };

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
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 shadow-2xl border-l-2 border-ink/20 overflow-hidden flex flex-col"
            style={{ backgroundColor: "#F5E6D3" }}
          >
            <div className="p-5 border-b-2 border-ink/10" style={{ background: "linear-gradient(to right, rgba(232, 213, 196, 0.3), transparent)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-ink font-chinese flex items-center gap-2">
                  <span className="text-3xl">📖</span>
                  乐理提示
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

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRandomHint}
                className="w-full py-2 rounded-lg bg-gold/20 hover:bg-gold/30 text-gold-dark font-chinese text-sm transition-colors flex items-center justify-center gap-2"
              >
                🎲 随机学习一个乐理知识
              </motion.button>
            </div>

            <div className="p-4 border-b-2 border-ink/10 bg-parchment/30">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索乐理知识..."
                className="w-full px-4 py-2 rounded-lg border-2 border-ink/20 focus:border-jade/50 focus:outline-none transition-colors font-chinese text-ink placeholder-ink/30 text-sm mb-3"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
              />

              <div className="flex flex-wrap gap-2">
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
                {HINT_CATEGORIES.map((cat) => (
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
            </div>

            <div className="flex-1 overflow-auto p-4">
              {filteredHints.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-ink/60 font-chinese">没有找到相关乐理知识</p>
                  <p className="text-ink/40 text-sm mt-2">尝试调整搜索条件</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHints.map((hint, index) => {
                    const categoryInfo = getCategoryInfo(hint.category);

                    return (
                      <motion.div
                        key={hint.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedHint(hint)}
                        className="rounded-xl p-4 border-2 border-ink/10 hover:border-jade/30 cursor-pointer transition-all"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-ink font-chinese">{hint.title}</h3>
                          {categoryInfo && (
                            <span className="px-2 py-0.5 text-xs rounded font-chinese bg-jade/10 text-jade">
                              {categoryInfo.emoji} {categoryInfo.name}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-ink/60 font-chinese line-clamp-2">
                          {hint.content}
                        </p>

                        {hint.relatedConcepts && hint.relatedConcepts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {hint.relatedConcepts.slice(0, 3).map((concept, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs rounded bg-gold/10 text-gold-dark font-chinese"
                              >
                                {concept}
                              </span>
                            ))}
                            {hint.relatedConcepts.length > 3 && (
                              <span className="px-2 py-0.5 text-xs rounded bg-ink/10 text-ink/50 font-chinese">
                                +{hint.relatedConcepts.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {selectedHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                style={{ backgroundColor: "rgba(44, 24, 16, 0.8)" }}
                onClick={() => setSelectedHint(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-lg w-full rounded-2xl shadow-2xl border-2 border-ink/20 overflow-hidden"
                  style={{ backgroundColor: "#F5E6D3" }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        {getCategoryInfo(selectedHint.category) && (
                          <span className="px-3 py-1 rounded-full text-sm font-chinese bg-jade/10 text-jade">
                            {getCategoryInfo(selectedHint.category)?.emoji}{" "}
                            {getCategoryInfo(selectedHint.category)?.name}
                          </span>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedHint(null)}
                        className="w-8 h-8 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center text-ink"
                      >
                        ✕
                      </motion.button>
                    </div>

                    <h3 className="text-xl font-bold text-ink font-chinese mb-4">
                      {selectedHint.title}
                    </h3>

                    <div className="text-ink/70 font-chinese leading-relaxed mb-5 whitespace-pre-wrap">
                      {selectedHint.content}
                    </div>

                    {selectedHint.relatedConcepts && selectedHint.relatedConcepts.length > 0 && (
                      <div className="mb-5">
                        <h4 className="text-sm text-ink/60 font-chinese mb-2">相关概念</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedHint.relatedConcepts.map((concept, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-sm font-chinese bg-gold/10 text-gold-dark"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedHint.examples && selectedHint.examples.length > 0 && (
                      <div>
                        <h4 className="text-sm text-ink/60 font-chinese mb-2">示例</h4>
                        {selectedHint.examples.map((example, idx) => (
                          <div
                            key={idx}
                            className="bg-parchment/50 rounded-lg p-3 mb-2 border border-ink/10"
                          >
                            <p className="text-sm text-ink/70 font-chinese">{example.description}</p>
                            {example.notes && example.notes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {example.notes.map((note, nIdx) => (
                                  <span
                                    key={nIdx}
                                    className="px-2 py-0.5 text-xs rounded bg-indigo/10 text-indigo font-chinese"
                                  >
                                    {note.pitch}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showRandomHint && randomHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                style={{ backgroundColor: "rgba(44, 24, 16, 0.8)" }}
                onClick={() => setShowRandomHint(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.9, opacity: 0, rotate: 5 }}
                  transition={{ type: "spring", damping: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-md w-full rounded-2xl shadow-2xl border-2 border-gold/30 overflow-hidden"
                  style={{ backgroundColor: "#F5E6D3" }}
                >
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">🎲</div>
                      <span className="px-3 py-1 rounded-full text-sm font-chinese bg-gold/20 text-gold-dark">
                        随机乐理知识
                      </span>
                    </div>

                    {getCategoryInfo(randomHint.category) && (
                      <div className="text-center mb-3">
                        <span className="px-3 py-1 rounded-full text-sm font-chinese bg-jade/10 text-jade">
                          {getCategoryInfo(randomHint.category)?.emoji}{" "}
                          {getCategoryInfo(randomHint.category)?.name}
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-ink font-chinese text-center mb-4">
                      {randomHint.title}
                    </h3>

                    <div className="text-ink/70 font-chinese leading-relaxed mb-5 whitespace-pre-wrap text-center">
                      {randomHint.content}
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRandomHint}
                        className="flex-1 py-2 rounded-lg bg-gold/20 hover:bg-gold/30 text-gold-dark font-chinese transition-colors"
                      >
                        再来一个
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedHint(randomHint);
                          setShowRandomHint(false);
                        }}
                        className="flex-1 py-2 rounded-lg bg-jade hover:bg-jade-light text-white font-chinese transition-colors"
                      >
                        查看详情
                      </motion.button>
                    </div>
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