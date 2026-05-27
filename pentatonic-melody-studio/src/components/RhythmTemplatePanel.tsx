"use client";

import { motion } from "framer-motion";
import type { RhythmTemplateType } from "@/types";
import { RHYTHM_TEMPLATES } from "@/types";

interface RhythmTemplatePanelProps {
  selectedTemplate: RhythmTemplateType;
  onTemplateChange: (template: RhythmTemplateType) => void;
  onApplyTemplate: (template: RhythmTemplateType) => void;
}

export function RhythmTemplatePanel({
  selectedTemplate,
  onTemplateChange,
  onApplyTemplate,
}: RhythmTemplatePanelProps) {
  const templates = Object.entries(RHYTHM_TEMPLATES) as [
    RhythmTemplateType,
    typeof RHYTHM_TEMPLATES[RhythmTemplateType]
  ][];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-b from-parchment-light to-parchment rounded-xl p-4 shadow-lg border-2 border-ink/20"
    >
      <h3 className="text-lg font-bold text-ink font-chinese flex items-center gap-2 mb-3">
        <span className="text-2xl">🎼</span>
        节奏模板
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {templates.map(([key, template], index) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onTemplateChange(key);
              onApplyTemplate(key);
            }}
            className={`p-3 rounded-lg text-left transition-all ${
              selectedTemplate === key
                ? "bg-gradient-to-r from-jade/20 to-indigo/20 border-2 border-jade/50 shadow-md"
                : "bg-white/50 hover:bg-white/80 border-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{template.emoji}</span>
              <div>
                <div className="font-bold text-ink font-chinese text-sm">
                  {template.name}
                </div>
                <div className="text-xs text-ink/60 mt-0.5">
                  {template.description}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
