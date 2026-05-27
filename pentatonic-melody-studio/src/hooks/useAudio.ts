"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import * as Tone from "tone";
import type { Track, DrumHit, MusicStyle, DrumInstrument, Note, EffectConfig, TempoRampConfig } from "@/types";
import { MUSIC_STYLES } from "@/types";

interface SynthMap {
  [trackId: string]: Tone.PolySynth;
}

interface TrackEffectChain {
  reverb?: Tone.Reverb;
  delay?: Tone.FeedbackDelay;
  chorus?: Tone.Chorus;
  distortion?: Tone.Distortion;
  tremolo?: Tone.Tremolo;
  vibrato?: Tone.Vibrato;
  phaser?: Tone.Phaser;
}

interface TrackEffectsMap {
  [trackId: string]: TrackEffectChain;
}

export function useAudio() {
  const masterSynthRef = useRef<Tone.PolySynth | null>(null);
  const drumSynthRef = useRef<Tone.NoiseSynth | null>(null);
  const kickSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const cymbalSynthRef = useRef<Tone.MetalSynth | null>(null);
  const trackSynthsRef = useRef<SynthMap>({});
  const trackEffectsRef = useRef<TrackEffectsMap>({});
  const effectRef = useRef<Tone.Reverb | Tone.FeedbackDelay | Tone.Chorus | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<Note[]>([]);
  const recordingStartTimeRef = useRef<number | null>(null);
  const scheduleRef = useRef<number[]>([]);
  const currentStyleRef = useRef<MusicStyle>("classical");
  const tempoRampRef = useRef<TempoRampConfig | null>(null);

  useEffect(() => {
    const masterSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.8,
      },
    }).toDestination();
    masterSynthRef.current = masterSynth;

    const drumSynth = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();
    drumSynthRef.current = drumSynth;

    const kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
        attackCurve: "exponential",
      },
    }).toDestination();
    kickSynthRef.current = kickSynth;

    const cymbalSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.2,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();
    cymbalSynthRef.current = cymbalSynth;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReady(true);

    return () => {
      masterSynth.dispose();
      drumSynth.dispose();
      kickSynth.dispose();
      cymbalSynth.dispose();
      Object.values(trackSynthsRef.current).forEach((s) => s.dispose());
      trackSynthsRef.current = {};
      Object.values(trackEffectsRef.current).forEach((chain) => {
        Object.values(chain).forEach((effect) => effect.dispose());
      });
      trackEffectsRef.current = {};
      if (effectRef.current) {
        effectRef.current.dispose();
      }
    };
  }, []);

  const updateStyle = useCallback((style: MusicStyle) => {
    currentStyleRef.current = style;
    const styleInfo = MUSIC_STYLES[style];

    if (masterSynthRef.current) {
      masterSynthRef.current.set({
        oscillator: { type: styleInfo.oscillator as unknown as Tone.ToneOscillatorType },
        envelope: styleInfo.envelope,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }

    Object.values(trackSynthsRef.current).forEach((synth) => {
      synth.set({
        oscillator: { type: styleInfo.oscillator as unknown as Tone.ToneOscillatorType },
        envelope: styleInfo.envelope,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });

    if (effectRef.current) {
      effectRef.current.dispose();
      effectRef.current = null;
    }

    if (styleInfo.effect === "reverb") {
      const reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).toDestination();
      if (masterSynthRef.current) {
        masterSynthRef.current.disconnect();
        masterSynthRef.current.connect(reverb);
      }
      Object.values(trackSynthsRef.current).forEach((synth) => {
        synth.disconnect();
        synth.connect(reverb);
      });
      effectRef.current = reverb;
    } else if (styleInfo.effect === "delay") {
      const delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.3, wet: 0.2 }).toDestination();
      if (masterSynthRef.current) {
        masterSynthRef.current.disconnect();
        masterSynthRef.current.connect(delay);
      }
      Object.values(trackSynthsRef.current).forEach((synth) => {
        synth.disconnect();
        synth.connect(delay);
      });
      effectRef.current = delay;
    } else if (styleInfo.effect === "chorus") {
      const chorus = new Tone.Chorus({ frequency: 4, depth: 0.5, wet: 0.3 }).toDestination();
      if (masterSynthRef.current) {
        masterSynthRef.current.disconnect();
        masterSynthRef.current.connect(chorus);
      }
      Object.values(trackSynthsRef.current).forEach((synth) => {
        synth.disconnect();
        synth.connect(chorus);
      });
      effectRef.current = chorus;
    } else {
      if (masterSynthRef.current) {
        masterSynthRef.current.disconnect();
        masterSynthRef.current.toDestination();
      }
      Object.values(trackSynthsRef.current).forEach((synth) => {
        synth.disconnect();
        synth.toDestination();
      });
    }
  }, []);

  const ensureTrackSynth = useCallback((trackId: string) => {
    if (!trackSynthsRef.current[trackId]) {
      const styleInfo = MUSIC_STYLES[currentStyleRef.current];
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: styleInfo.oscillator as unknown as Tone.ToneOscillatorType },
        envelope: styleInfo.envelope,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      if (effectRef.current) {
        synth.connect(effectRef.current);
      } else {
        synth.toDestination();
      }

      trackSynthsRef.current[trackId] = synth;
    }
    return trackSynthsRef.current[trackId];
  }, []);

  const playNote = useCallback(
    (pitch: string, duration: string = "8n", velocity: number = 0.8) => {
      if (!masterSynthRef.current || !isReady) return;
      masterSynthRef.current.triggerAttackRelease(pitch, duration, Tone.now(), velocity);
    },
    [isReady]
  );

  const playDrum = useCallback(
    (instrument: DrumInstrument, velocity: number = 0.8) => {
      if (!isReady) return;

      if (instrument === "kick" && kickSynthRef.current) {
        kickSynthRef.current.triggerAttackRelease("C2", "8n", Tone.now(), velocity);
      } else if (instrument === "snare" && drumSynthRef.current) {
        drumSynthRef.current.triggerAttackRelease("8n", Tone.now(), velocity * 0.9);
      } else if (instrument === "hihat" && drumSynthRef.current) {
        drumSynthRef.current.triggerAttackRelease("32n", Tone.now(), velocity * 0.5);
      } else if (instrument === "tom" && kickSynthRef.current) {
        kickSynthRef.current.triggerAttackRelease("G2", "8n", Tone.now(), velocity * 0.7);
      } else if (instrument === "clap" && drumSynthRef.current) {
        drumSynthRef.current.triggerAttackRelease("16n", Tone.now(), velocity * 0.8);
      } else if (instrument === "cymbal" && cymbalSynthRef.current) {
        cymbalSynthRef.current.triggerAttackRelease("8n", Tone.now(), velocity * 0.4);
      }
    },
    [isReady]
  );

  const scheduleNotes = useCallback(
    (
      tracks: Track[],
      bpm: number,
      drumHits: DrumHit[] = [],
      totalSteps: number = 32
    ) => {
      if (!masterSynthRef.current || !isReady) return;

      Tone.Transport.cancel();
      scheduleRef.current = [];
      Tone.Transport.bpm.value = bpm;

      const stepDuration = "8n";
      const hasSolo = tracks.some((t) => t.solo && !t.muted);

      tracks.forEach((track) => {
        if (track.muted) return;
        if (hasSolo && !track.solo) return;

        const synth =
          track.id === "track-1"
            ? masterSynthRef.current!
            : ensureTrackSynth(track.id);

        track.notes.forEach((note) => {
          const time = Tone.Time(stepDuration).toSeconds() * note.step;
          const duration = Tone.Time(stepDuration).toSeconds() * note.duration;

          const eventId = Tone.Transport.schedule((time) => {
            synth.triggerAttackRelease(
              note.pitch,
              duration,
              time,
              note.velocity * track.volume
            );
          }, time);
          scheduleRef.current.push(eventId);
        });
      });

      if (!hasSolo) {
        drumHits.forEach((hit) => {
          const time = Tone.Time(stepDuration).toSeconds() * hit.step;

          const eventId = Tone.Transport.schedule((time) => {
            if (hit.instrument === "kick" && kickSynthRef.current) {
              kickSynthRef.current.triggerAttackRelease(
                "C2",
                "8n",
                time,
                hit.velocity
              );
            } else if (hit.instrument === "snare" && drumSynthRef.current) {
              drumSynthRef.current.triggerAttackRelease(
                "8n",
                time,
                hit.velocity * 0.9
              );
            } else if (hit.instrument === "hihat" && drumSynthRef.current) {
              drumSynthRef.current.triggerAttackRelease(
                "32n",
                time,
                hit.velocity * 0.5
              );
            } else if (hit.instrument === "tom" && kickSynthRef.current) {
              kickSynthRef.current.triggerAttackRelease(
                "G2",
                "8n",
                time,
                hit.velocity * 0.7
              );
            } else if (hit.instrument === "clap" && drumSynthRef.current) {
              drumSynthRef.current.triggerAttackRelease(
                "16n",
                time,
                hit.velocity * 0.8
              );
            } else if (hit.instrument === "cymbal" && cymbalSynthRef.current) {
              cymbalSynthRef.current.triggerAttackRelease(
                "8n",
                time,
                hit.velocity * 0.4
              );
            }
          }, time);
          scheduleRef.current.push(eventId);
        });
      }

      for (let i = 0; i <= totalSteps; i++) {
        const time = Tone.Time(stepDuration).toSeconds() * i;
        Tone.Transport.schedule(() => {
          setCurrentStep(i);
        }, time);
      }

      const totalDuration = Tone.Time(stepDuration).toSeconds() * totalSteps;
      Tone.Transport.schedule(() => {
        setIsPlaying(false);
        setCurrentStep(-1);
      }, totalDuration);
    },
    [isReady, ensureTrackSynth]
  );

  const start = useCallback(() => {
    if (!isReady) return;
    Tone.start();
    Tone.Transport.start();
    setIsPlaying(true);
  }, [isReady]);

  const stop = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    setIsPlaying(false);
    setCurrentStep(-1);
  }, []);

  const pause = useCallback(() => {
    Tone.Transport.pause();
    setIsPlaying(false);
  }, []);

  const startRecording = useCallback(() => {
    if (!isReady) return;
    Tone.start();
    setIsRecording(true);
    setRecordedNotes([]);
    recordingStartTimeRef.current = Tone.now();
  }, [isReady]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    recordingStartTimeRef.current = null;
  }, []);

  const recordNote = useCallback(
    (pitch: string, duration: string = "8n", velocity: number = 0.8) => {
      if (!isRecording || recordingStartTimeRef.current === null) return;

      const stepDuration = Tone.Time("8n").toSeconds();
      const currentTime = Tone.now();
      const elapsedTime = currentTime - recordingStartTimeRef.current;
      const step = Math.round(elapsedTime / stepDuration);

      if (step >= 0 && step < 32) {
        const note: Note = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pitch,
          step,
          duration: 1,
          velocity,
        };
        setRecordedNotes((prev) => [...prev, note]);
      }

      if (masterSynthRef.current) {
        masterSynthRef.current.triggerAttackRelease(pitch, duration, Tone.now(), velocity);
      }
    },
    [isRecording]
  );

  const clearRecordedNotes = useCallback(() => {
    setRecordedNotes([]);
  }, []);

  const applyTrackEffects = useCallback(
    (trackId: string, effects: EffectConfig[]) => {
      const synth =
        trackId === "track-1" ? masterSynthRef.current : trackSynthsRef.current[trackId];
      if (!synth) return;

      if (trackEffectsRef.current[trackId]) {
        Object.values(trackEffectsRef.current[trackId]).forEach((effect) => effect.dispose());
      }
      trackEffectsRef.current[trackId] = {};

      synth.disconnect();
      let lastNode: Tone.ToneAudioNode = synth;

      effects.forEach((effectConfig) => {
        if (!effectConfig.enabled) return;

        let effect: Tone.ToneAudioNode | null = null;

        switch (effectConfig.type) {
          case "reverb":
            effect = new Tone.Reverb({
              decay: effectConfig.params.decay || 2,
              wet: effectConfig.wet,
            }).toDestination();
            trackEffectsRef.current[trackId].reverb = effect as Tone.Reverb;
            break;
          case "delay":
            effect = new Tone.FeedbackDelay({
              delayTime: effectConfig.params.delayTime || 0.25,
              feedback: effectConfig.params.feedback || 0.3,
              wet: effectConfig.wet,
            }).toDestination();
            trackEffectsRef.current[trackId].delay = effect as Tone.FeedbackDelay;
            break;
          case "chorus":
            effect = new Tone.Chorus({
              frequency: effectConfig.params.frequency || 4,
              depth: effectConfig.params.depth || 0.5,
              wet: effectConfig.wet,
            }).toDestination();
            trackEffectsRef.current[trackId].chorus = effect as Tone.Chorus;
            break;
          case "distortion":
            effect = new Tone.Distortion({
              distortion: effectConfig.params.distortion || 0.5,
              wet: effectConfig.wet,
            }).toDestination();
            trackEffectsRef.current[trackId].distortion = effect as Tone.Distortion;
            break;
          case "tremolo":
            effect = new Tone.Tremolo({
              frequency: effectConfig.params.frequency || 10,
              depth: effectConfig.params.depth || 0.5,
              wet: effectConfig.wet,
            }).toDestination().start();
            trackEffectsRef.current[trackId].tremolo = effect as Tone.Tremolo;
            break;
          case "vibrato":
            effect = new Tone.Vibrato({
              frequency: effectConfig.params.frequency || 5,
              depth: effectConfig.params.depth || 0.1,
              wet: effectConfig.wet,
            }).toDestination();
            trackEffectsRef.current[trackId].vibrato = effect as Tone.Vibrato;
            break;
          case "phaser":
            effect = new Tone.Phaser({
              frequency: effectConfig.params.frequency || 0.5,
              octaves: effectConfig.params.octaves || 3,
              wet: effectConfig.wet,
            }).toDestination();
            trackEffectsRef.current[trackId].phaser = effect as Tone.Phaser;
            break;
        }

        if (effect) {
          lastNode.connect(effect);
          lastNode = effect;
        }
      });

      if (Object.keys(trackEffectsRef.current[trackId]).length === 0) {
        if (effectRef.current) {
          synth.connect(effectRef.current);
        } else {
          synth.toDestination();
        }
      }
    },
    []
  );

  const setTempoRamp = useCallback((config: TempoRampConfig | null) => {
    tempoRampRef.current = config;
  }, []);

  const scheduleWithTempoRamp = useCallback(
    (
      tracks: Track[],
      baseBpm: number,
      drumHits: DrumHit[] = [],
      totalSteps: number = 32,
      tempoRamp?: TempoRampConfig
    ) => {
      if (!masterSynthRef.current || !isReady) return;

      Tone.Transport.cancel();
      scheduleRef.current = [];

      const stepDuration = "8n";
      const baseStepSeconds = Tone.Time(stepDuration).toSeconds();
      const hasSolo = tracks.some((t) => t.solo && !t.muted);

      const getBpmAtStep = (step: number): number => {
        if (!tempoRamp?.enabled || tempoRamp.points.length < 2) return baseBpm;

        const sortedPoints = [...tempoRamp.points].sort((a, b) => a.step - b.step);

        if (step <= sortedPoints[0].step) return sortedPoints[0].bpm;
        if (step >= sortedPoints[sortedPoints.length - 1].step)
          return sortedPoints[sortedPoints.length - 1].bpm;

        for (let i = 0; i < sortedPoints.length - 1; i++) {
          const p1 = sortedPoints[i];
          const p2 = sortedPoints[i + 1];
          if (step >= p1.step && step <= p2.step) {
            const progress = (step - p1.step) / (p2.step - p1.step);
            return p1.bpm + (p2.bpm - p1.bpm) * progress;
          }
        }
        return baseBpm;
      };

      const calculateTime = (targetStep: number): number => {
        if (!tempoRamp?.enabled || tempoRamp.points.length < 2) {
          return baseStepSeconds * targetStep;
        }

        let time = 0;
        for (let s = 0; s < targetStep; s++) {
          const currentBpm = getBpmAtStep(s);
          const scaleFactor = baseBpm / currentBpm;
          time += baseStepSeconds * scaleFactor;
        }
        return time;
      };

      tracks.forEach((track) => {
        if (track.muted) return;
        if (hasSolo && !track.solo) return;

        const synth =
          track.id === "track-1"
            ? masterSynthRef.current!
            : ensureTrackSynth(track.id);

        track.notes.forEach((note) => {
          const time = calculateTime(note.step);
          const currentBpm = getBpmAtStep(note.step);
          const scaleFactor = baseBpm / currentBpm;
          const duration = baseStepSeconds * note.duration * scaleFactor;

          const eventId = Tone.Transport.schedule((t) => {
            synth.triggerAttackRelease(note.pitch, duration, t, note.velocity * track.volume);
          }, time);
          scheduleRef.current.push(eventId);
        });
      });

      if (!hasSolo) {
        drumHits.forEach((hit) => {
          const time = calculateTime(hit.step);

          const eventId = Tone.Transport.schedule((t) => {
            if (hit.instrument === "kick" && kickSynthRef.current) {
              kickSynthRef.current.triggerAttackRelease("C2", "8n", t, hit.velocity);
            } else if (hit.instrument === "snare" && drumSynthRef.current) {
              drumSynthRef.current.triggerAttackRelease("8n", t, hit.velocity * 0.9);
            } else if (hit.instrument === "hihat" && drumSynthRef.current) {
              drumSynthRef.current.triggerAttackRelease("32n", t, hit.velocity * 0.5);
            } else if (hit.instrument === "tom" && kickSynthRef.current) {
              kickSynthRef.current.triggerAttackRelease("G2", "8n", t, hit.velocity * 0.7);
            } else if (hit.instrument === "clap" && drumSynthRef.current) {
              drumSynthRef.current.triggerAttackRelease("16n", t, hit.velocity * 0.8);
            } else if (hit.instrument === "cymbal" && cymbalSynthRef.current) {
              cymbalSynthRef.current.triggerAttackRelease("8n", t, hit.velocity * 0.4);
            }
          }, time);
          scheduleRef.current.push(eventId);
        });
      }

      for (let i = 0; i <= totalSteps; i++) {
        const time = calculateTime(i);
        Tone.Transport.schedule(() => {
          setCurrentStep(i);
        }, time);
      }

      const totalDuration = calculateTime(totalSteps);
      Tone.Transport.schedule(() => {
        setIsPlaying(false);
        setCurrentStep(-1);
      }, totalDuration);
    },
    [isReady, ensureTrackSynth]
  );

  return {
    isReady,
    isPlaying,
    currentStep,
    isRecording,
    recordedNotes,
    playNote,
    playDrum,
    scheduleNotes,
    scheduleWithTempoRamp,
    start,
    stop,
    pause,
    updateStyle,
    startRecording,
    stopRecording,
    recordNote,
    clearRecordedNotes,
    applyTrackEffects,
    setTempoRamp,
  };
}
