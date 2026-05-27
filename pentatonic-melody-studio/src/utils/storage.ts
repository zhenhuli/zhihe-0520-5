import type { Melody, ProjectFile } from "@/types";

const STORAGE_KEY = "pentatonic-melodies";
const PROJECTS_KEY = "pentatonic-projects";
const PROJECT_VERSION = "1.0.0";

export function saveMelody(melody: Melody): void {
  if (typeof window === "undefined") return;
  
  const melodies = getMelodies();
  const existingIndex = melodies.findIndex((m) => m.id === melody.id);
  
  if (existingIndex >= 0) {
    melodies[existingIndex] = { ...melody, updatedAt: Date.now() };
  } else {
    melodies.push({ ...melody, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(melodies));
}

export function getMelodies(): Melody[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getMelodyById(id: string): Melody | null {
  const melodies = getMelodies();
  return melodies.find((m) => m.id === id) || null;
}

export function deleteMelody(id: string): void {
  if (typeof window === "undefined") return;
  
  const melodies = getMelodies().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(melodies));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createProjectFile(
  name: string,
  projectData: ProjectFile["projectData"],
  metadata?: Partial<ProjectFile["metadata"]>
): ProjectFile {
  return {
    version: PROJECT_VERSION,
    type: "pentatonic-project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    metadata: {
      name,
      description: metadata?.description,
      author: metadata?.author,
      tags: metadata?.tags || [],
    },
    projectData,
  };
}

export function exportProjectToJSON(project: ProjectFile): string {
  return JSON.stringify(project, null, 2);
}

export function importProjectFromJSON(jsonString: string): ProjectFile | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (
      parsed.type === "pentatonic-project" &&
      parsed.version &&
      parsed.projectData
    ) {
      return parsed as ProjectFile;
    }
    return null;
  } catch {
    return null;
  }
}

export function downloadProjectFile(project: ProjectFile): void {
  if (typeof window === "undefined") return;
  
  const jsonString = exportProjectToJSON(project);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.metadata.name || "pentatonic-project"}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadProjectFromFile(file: File): Promise<ProjectFile | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(importProjectFromJSON(content));
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

export function saveProjectToLibrary(project: ProjectFile): void {
  if (typeof window === "undefined") return;
  
  const projects = getProjectsFromLibrary();
  const existingIndex = projects.findIndex(
    (p) => p.createdAt === project.createdAt
  );
  
  if (existingIndex >= 0) {
    projects[existingIndex] = { ...project, updatedAt: Date.now() };
  } else {
    projects.push(project);
  }
  
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getProjectsFromLibrary(): ProjectFile[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(PROJECTS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function deleteProjectFromLibrary(createdAt: number): void {
  if (typeof window === "undefined") return;
  
  const projects = getProjectsFromLibrary().filter(
    (p) => p.createdAt !== createdAt
  );
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function generateMIDIExport(
  tracks: { notes: { pitch: string; step: number; duration: number; velocity: number }[] }[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _bpm: number
): string {
  const midiHeader = [
    0x4D, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x01,
    (tracks.length >> 8) & 0xFF, tracks.length & 0xFF,
    0x00, 0x60,
  ];
  
  const noteToMIDI = (note: string): number => {
    const noteMap: Record<string, number> = {
      C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5,
      "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11,
    };
    const octave = parseInt(note.slice(-1));
    const pitch = note.slice(0, -1);
    return noteMap[pitch] || 0 + (octave + 1) * 12;
  };
  
  const ticksPerStep = 48;
  const midiData = [...midiHeader];
  
  tracks.forEach((track) => {
    const trackEvents: number[] = [];
    let currentTick = 0;
    
    const sortedNotes = [...track.notes].sort((a, b) => a.step - b.step);
    
    sortedNotes.forEach((note) => {
      const tick = note.step * ticksPerStep;
      const deltaTime = tick - currentTick;
      
      const deltaTimeBytes: number[] = [];
      let dt = deltaTime;
      do {
        let byte = dt & 0x7F;
        dt >>= 7;
        if (dt > 0) byte |= 0x80;
        deltaTimeBytes.push(byte);
      } while (dt > 0);
      
      const midiNote = noteToMIDI(note.pitch);
      const velocity = Math.min(127, Math.max(0, Math.floor(note.velocity * 127)));
      
      trackEvents.push(...deltaTimeBytes);
      trackEvents.push(0x90);
      trackEvents.push(midiNote);
      trackEvents.push(velocity);
      
      const durationTicks = note.duration * ticksPerStep;
      const offDeltaBytes: number[] = [];
      dt = durationTicks;
      do {
        let byte = dt & 0x7F;
        dt >>= 7;
        if (dt > 0) byte |= 0x80;
        offDeltaBytes.push(byte);
      } while (dt > 0);
      
      trackEvents.push(...offDeltaBytes);
      trackEvents.push(0x80);
      trackEvents.push(midiNote);
      trackEvents.push(0x00);
      
      currentTick = tick + durationTicks;
    });
    
    trackEvents.push(0x00);
    trackEvents.push(0xFF);
    trackEvents.push(0x2F);
    trackEvents.push(0x00);
    
    const trackLength = trackEvents.length;
    midiData.push(0x4D, 0x54, 0x72, 0x6B);
    midiData.push(
      (trackLength >> 24) & 0xFF,
      (trackLength >> 16) & 0xFF,
      (trackLength >> 8) & 0xFF,
      trackLength & 0xFF
    );
    midiData.push(...trackEvents);
  });
  
  return midiData.map((b) => String.fromCharCode(b)).join("");
}

export function downloadMIDIFile(
  tracks: { notes: { pitch: string; step: number; duration: number; velocity: number }[] }[],
  bpm: number,
  filename: string
): void {
  if (typeof window === "undefined") return;
  
  const midiContent = generateMIDIExport(tracks, bpm);
  const blob = new Blob([midiContent], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportMelodyToText(
  tracks: { name: string; notes: { pitch: string; step: number; duration: number }[] }[],
  bpm: number,
  scale: string
): string {
  let content = "";
  content += `五声音阶旋律 - ${scale}调式\n`;
  content += `BPM: ${bpm}\n`;
  content += `生成时间: ${new Date().toLocaleString("zh-CN")}\n`;
  content += `${"=".repeat(40)}\n\n`;
  
  tracks.forEach((track, idx) => {
    content += `【音轨 ${idx + 1}】${track.name}\n`;
    content += `${"-".repeat(30)}\n`;
    
    const sortedNotes = [...track.notes].sort((a, b) => a.step - b.step);
    
    sortedNotes.forEach((note, i) => {
      const stepStr = note.step.toString().padStart(3);
      const durationStr = note.duration.toString().padStart(2);
      content += `  ${i + 1}. 音高: ${note.pitch.padEnd(3)} | 步长: ${stepStr} | 时长: ${durationStr}拍\n`;
    });
    
    content += "\n";
  });
  
  return content;
}

export function downloadTextFile(content: string, filename: string): void {
  if (typeof window === "undefined") return;
  
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { PROJECT_VERSION };