"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProjectFile, Track, DrumHit, PentatonicScale, MusicStyle, RhythmTemplateType, TempoRampConfig, EffectConfig } from "@/types";
import { PENTATONIC_SCALES, MUSIC_STYLES } from "@/types";
import { createProjectFile, downloadProjectFile, loadProjectFromFile, saveProjectToLibrary, getProjectsFromLibrary, deleteProjectFromLibrary } from "@/utils/storage";

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    bpm: number;
    scale: PentatonicScale;
    style: MusicStyle;
    rhythmTemplate: RhythmTemplateType;
    tracks: Track[];
    drumHits: DrumHit[];
    tempoRamp?: TempoRampConfig;
    trackEffects?: Record<string, EffectConfig[]>;
  };
  onLoadProject: (project: ProjectFile) => void;
}

export function ProjectManager({ isOpen, onClose, currentData, onLoadProject }: ProjectManagerProps) {
  const [activeTab, setActiveTab] = useState<"export" | "import" | "library">("export");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectAuthor, setProjectAuthor] = useState("");
  const [projectTags, setProjectTags] = useState("");
  const [projects, setProjects] = useState<ProjectFile[]>(() => getProjectsFromLibrary());
  const [importStatus, setImportStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectDataWithTimeSig = {
    ...currentData,
    timeSignature: { numerator: 4, denominator: 4 },
  };

  const handleExport = () => {
    if (!projectName.trim()) return;

    const tags = projectTags.split(",").map((t) => t.trim()).filter(Boolean);
    const project = createProjectFile(projectName, projectDataWithTimeSig, {
      description: projectDescription || undefined,
      author: projectAuthor || undefined,
      tags,
    });

    downloadProjectFile(project);
  };

  const handleSaveToLibrary = () => {
    if (!projectName.trim()) return;

    const tags = projectTags.split(",").map((t) => t.trim()).filter(Boolean);
    const project = createProjectFile(projectName, projectDataWithTimeSig, {
      description: projectDescription || undefined,
      author: projectAuthor || undefined,
      tags,
    });

    saveProjectToLibrary(project);
    setProjects(getProjectsFromLibrary());
    setImportStatus("已保存到工程库！");
    setTimeout(() => setImportStatus(""), 2000);
  };

  const handleImportFile = async (file: File) => {
    const project = await loadProjectFromFile(file);
    if (project) {
      onLoadProject(project);
      onClose();
    } else {
      setImportStatus("导入失败：文件格式不正确");
      setTimeout(() => setImportStatus(""), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImportFile(file);
    }
    e.target.value = "";
  };

  const handleDeleteProject = (createdAt: number) => {
    deleteProjectFromLibrary(createdAt);
    setProjects(getProjectsFromLibrary());
  };

  const handleLoadFromLibrary = (project: ProjectFile) => {
    onLoadProject(project);
    onClose();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalNoteCount = currentData.tracks.reduce((sum, t) => sum + t.notes.length, 0);

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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-2xl mx-auto"
          >
            <div className="rounded-2xl shadow-2xl border-2 border-ink/20 overflow-hidden" style={{ backgroundColor: "#F5E6D3" }}>
              <div className="p-5 border-b-2 border-ink/10" style={{ background: "linear-gradient(to right, rgba(232, 213, 196, 0.3), transparent)" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-ink font-chinese flex items-center gap-2">
                    <span className="text-3xl">📁</span>
                    工程管理
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

              <div className="flex border-b-2 border-ink/10">
                {[
                  { key: "export", label: "导出工程", emoji: "⬇️" },
                  { key: "import", label: "导入工程", emoji: "⬆️" },
                  { key: "library", label: "工程库", emoji: "📚" },
                ].map((tab) => (
                  <motion.button
                    key={tab.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`flex-1 py-3 px-4 font-chinese text-sm transition-colors flex items-center justify-center gap-2 ${
                      activeTab === tab.key
                        ? "bg-jade/20 text-jade border-b-2 border-jade"
                        : "text-ink/60 hover:bg-ink/5"
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              <div className="p-5 max-h-[60vh] overflow-auto">
                {activeTab === "export" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="bg-parchment/50 rounded-xl p-4 border border-ink/10">
                      <h3 className="font-bold text-ink font-chinese mb-3">当前工程信息</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm text-ink/70">
                        <div>🎵 音符数: {totalNoteCount}</div>
                        <div>🎚️ 音轨数: {currentData.tracks.length}</div>
                        <div>🥁 鼓点数: {currentData.drumHits.length}</div>
                        <div>⏱️ BPM: {currentData.bpm}</div>
                        <div>🎼 调式: {PENTATONIC_SCALES[currentData.scale]?.name}</div>
                        <div>🎭 曲风: {MUSIC_STYLES[currentData.style]?.name}</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-ink/60 font-chinese mb-2">
                        工程名称 *
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="请输入工程名称..."
                        className="w-full px-4 py-3 rounded-lg border-2 border-ink/20 focus:border-jade/50 focus:outline-none transition-colors font-chinese text-ink placeholder-ink/30"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-ink/60 font-chinese mb-2">
                        工程描述
                      </label>
                      <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="简要描述这个工程..."
                        className="w-full px-4 py-3 rounded-lg border-2 border-ink/20 focus:border-jade/50 focus:outline-none transition-colors font-chinese text-ink placeholder-ink/30 resize-none"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-ink/60 font-chinese mb-2">
                          作者
                        </label>
                        <input
                          type="text"
                          value={projectAuthor}
                          onChange={(e) => setProjectAuthor(e.target.value)}
                          placeholder="作者名称"
                          className="w-full px-4 py-3 rounded-lg border-2 border-ink/20 focus:border-jade/50 focus:outline-none transition-colors font-chinese text-ink placeholder-ink/30"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-ink/60 font-chinese mb-2">
                          标签（逗号分隔）
                        </label>
                        <input
                          type="text"
                          value={projectTags}
                          onChange={(e) => setProjectTags(e.target.value)}
                          placeholder="古风, 抒情..."
                          className="w-full px-4 py-3 rounded-lg border-2 border-ink/20 focus:border-jade/50 focus:outline-none transition-colors font-chinese text-ink placeholder-ink/30"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveToLibrary}
                        disabled={!projectName.trim()}
                        className="flex-1 py-3 rounded-lg bg-indigo/10 hover:bg-indigo/20 text-indigo font-chinese transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        📚 保存到工程库
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExport}
                        disabled={!projectName.trim()}
                        className="flex-1 py-3 rounded-lg bg-jade hover:bg-jade-light text-white font-chinese transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ⬇️ 下载工程文件
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "import" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div
                      className="border-2 border-dashed border-ink/20 rounded-xl p-8 text-center cursor-pointer hover:border-jade/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                    >
                      <div className="text-5xl mb-4">📁</div>
                      <p className="text-ink font-chinese text-lg mb-2">点击选择工程文件</p>
                      <p className="text-ink/50 text-sm">支持 .json 格式的工程文件</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    <div className="bg-parchment/50 rounded-xl p-4 border border-ink/10">
                      <h3 className="font-bold text-ink font-chinese mb-2">导入说明</h3>
                      <ul className="text-sm text-ink/70 space-y-1 font-chinese">
                        <li>• 工程文件包含完整的旋律数据</li>
                        <li>• 导入后将替换当前编辑的内容</li>
                        <li>• 建议先保存当前工程再导入</li>
                      </ul>
                    </div>

                    {importStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-3 px-4 rounded-lg bg-jade/10 text-jade font-chinese"
                      >
                        {importStatus}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {activeTab === "library" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {projects.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-4">📚</div>
                        <p className="text-ink/60 font-chinese">工程库为空</p>
                        <p className="text-ink/40 text-sm mt-2">保存工程到这里方便下次继续编辑</p>
                      </div>
                    ) : (
                      projects.map((project) => (
                        <motion.div
                          key={project.createdAt}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="rounded-xl p-4 border-2 border-ink/10 hover:border-jade/30 transition-colors"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-ink font-chinese">{project.metadata.name}</h3>
                              {project.metadata.description && (
                                <p className="text-xs text-ink/50 font-chinese mt-1">
                                  {project.metadata.description}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-ink/40 font-chinese">
                              {formatDate(project.updatedAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-ink/60 mb-3 font-chinese flex-wrap">
                            <span>🎵 {project.projectData.tracks.reduce((s, t) => s + t.notes.length, 0)} 音符</span>
                            <span>⏱️ {project.projectData.bpm} BPM</span>
                            {project.metadata.tags && project.metadata.tags.length > 0 && (
                              <span>🏷️ {project.metadata.tags.join(", ")}</span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleLoadFromLibrary(project)}
                              className="flex-1 py-2 rounded-lg bg-jade/10 hover:bg-jade/20 text-jade font-chinese text-sm transition-colors"
                            >
                              加载
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleDeleteProject(project.createdAt)}
                              className="px-4 py-2 rounded-lg bg-vermilion/10 hover:bg-vermilion/20 text-vermilion font-chinese text-sm transition-colors"
                            >
                              删除
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}