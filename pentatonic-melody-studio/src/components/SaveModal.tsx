"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;
}

export function SaveModal({ isOpen, onClose, onSave, defaultName = "" }: SaveModalProps) {
  const [name, setName] = useState(defaultName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
      onClose();
    }
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
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(44, 24, 16, 0.6)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
            style={{ backgroundColor: "#F5E6D3" }}
          >
            <div className="rounded-2xl shadow-2xl border-2 border-ink/20 p-6" style={{ backgroundColor: "#F5E6D3" }}>
              <h2 className="text-2xl font-bold text-ink font-chinese mb-4 flex items-center gap-2">
                <span className="text-3xl">💾</span>
                保存旋律
              </h2>

              <div className="mb-6">
                <label className="block text-sm text-ink/60 font-chinese mb-2">
                  旋律名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入旋律名称..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-ink/20 focus:border-jade/50 focus:outline-none transition-colors font-chinese text-ink placeholder-ink/30"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg bg-ink/10 hover:bg-ink/20 text-ink font-chinese transition-colors"
                >
                  取消
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="flex-1 py-3 rounded-lg bg-jade hover:bg-jade-light text-white font-chinese transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
