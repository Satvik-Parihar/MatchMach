
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Zap,
  BookOpen, Activity, Layout, Info,
  ChevronLeft, ChevronRight, Hash, Table as TableIcon,
  CheckCircle, XCircle
} from 'lucide-react';
import { naiveGenerator, kmpGenerator, rabinKarpGenerator } from './algorithms/visualizers';
import { algorithmTheory } from './data/theory';
import './index.css';

const ALGOS = {
  naive: { name: 'Naive Search', id: 'naive', generator: naiveGenerator },
  kmp: { name: 'KMP Algorithm', id: 'kmp', generator: kmpGenerator },
  rk: { name: 'Rabin-Karp', id: 'rk', generator: rabinKarpGenerator }
};

function App() {
  const [activeTab, setActiveTab] = useState('visualizer');
  const [text, setText] = useState('ABABDABACDABABCABAB');
  const [pattern, setPattern] = useState('ABABCABAB');
  const [selectedAlgo, setSelectedAlgo] = useState('naive');

  // Visualization State
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [foundIndices, setFoundIndices] = useState([]);

  const generatorRef = useRef(null);
  const timerRef = useRef(null);

  // Derived current state
  const visState = history[currentStep] || {
    textIndex: -1,
    patternIndex: -1,
    state: 'idle',
    message: 'Ready to start'
  };

  const resetVisualization = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setHistory([]);
    setCurrentStep(0);
    setFoundIndices([]);
    generatorRef.current = null;

    // Initialize with idle state
    setHistory([{
      textIndex: -1,
      patternIndex: -1,
      state: 'idle',
      message: 'Ready to start'
    }]);
  };

  // Initialize on load
  useEffect(() => {
    resetVisualization();
  }, [selectedAlgo, text, pattern]);

  const generateNextStep = () => {
    if (!generatorRef.current) {
      generatorRef.current = ALGOS[selectedAlgo].generator(text, pattern);
    }

    const { value, done } = generatorRef.current.next();

    if (done) {
      return null;
    }
    return value;
  };

  const nextStep = () => {
    // If we are reviewing history, just move forward
    if (currentStep < history.length - 1) {
      setCurrentStep(c => c + 1);
      return;
    }

    // Generate new step
    const step = generateNextStep();
    if (step) {
      setHistory(prev => [...prev, step]);
      setCurrentStep(c => c + 1);

      if (step.state === 'found') {
        setFoundIndices(prev => [...prev, step.textIndex]);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(nextStep, speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed, history]); // Add history dependency to keep loop fresh if needed


  // Box size + gap for pattern calculations (56px + 8px gap)
  const BOX_OFFSET = 64;
  const patternOffset = visState.textIndex >= 0
    ? (visState.textIndex - (visState.patternIndex >= 0 ? visState.patternIndex : 0))
    : 0;

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* SIDEBAR */}
      <aside className="w-80 bg-[var(--bg-panel)] border-r border-[var(--border)] flex flex-col z-20 shrink-0 shadow-2xl">
        <div className="p-8 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <Layout className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">MatchMach</h1>
              <p className="text-xs text-[var(--text-muted)] font-medium">Visual Algorithm Engine</p>
            </div>
          </div>
        </div>

        <nav className="p-6 space-y-2 flex-1 overflow-y-auto">
          <p className="px-2 py-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Navigation</p>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'visualizer' ? 'bg-[var(--bg-sub)] text-white border border-[var(--border)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg-sub)] hover:text-white'
              }`}
          >
            <Activity size={20} className={activeTab === 'visualizer' ? 'text-indigo-400' : ''} /> Visualizer Canvas
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'theory' ? 'bg-[var(--bg-sub)] text-white border border-[var(--border)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg-sub)] hover:text-white'
              }`}
          >
            <BookOpen size={20} className={activeTab === 'theory' ? 'text-indigo-400' : ''} /> Theory & Concepts
          </button>

          <p className="px-2 py-2 mt-8 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Configuration</p>

          <div className="p-4 rounded-xl bg-[var(--bg-sub)] border border-[var(--border)] space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Text String</label>
              <input
                value={text}
                onChange={e => { setText(e.target.value); resetVisualization(); }}
                className="input-field"
                spellCheck="false"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Pattern</label>
              <input
                value={pattern}
                onChange={e => { setPattern(e.target.value); resetVisualization(); }}
                className="input-field"
                spellCheck="false"
              />
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Animation Speed</label>
                <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded">{speed}ms</span>
              </div>
              <input
                type="range" min="50" max="1000" step="50"
                value={speed} onChange={e => setSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-main)] rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </nav>
      </aside>


      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-hidden flex flex-col relative z-10 h-screen">

        {activeTab === 'visualizer' && (
          <div className="shrink-0 h-20 border-b border-[var(--border)] bg-[var(--bg-panel)] flex items-center px-8 justify-between z-20 shadow-sm">
            <div className="flex items-center gap-2 bg-[var(--bg-sub)] p-1.5 rounded-xl border border-[var(--border)]">
              {Object.keys(ALGOS).map(key => (
                <button
                  key={key}
                  onClick={() => { setSelectedAlgo(key); resetVisualization(); }}
                  className={`px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all tracking-wide ${selectedAlgo === key ? 'bg-[var(--bg-panel)] text-white shadow-md border border-[var(--border)]' : 'text-[var(--text-muted)] hover:text-white'
                    }`}
                >
                  {ALGOS[key].name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 mr-4 text-sm font-mono text-[var(--text-muted)] border-r border-[var(--border)] pr-8 h-8">
                <span>Step: <span className="text-white font-bold">{currentStep}</span></span>
                <span className="mx-2 opacity-30">|</span>
                <span>Shift: <span className="text-white font-bold">{patternOffset}</span></span>
              </div>


              <div className="flex items-center bg-[var(--bg-sub)] rounded-lg p-1 gap-1 border border-[var(--border)]">
                <button onClick={prevStep} className="p-2 hover:text-white text-[var(--text-muted)] transition-colors rounded-md" disabled={currentStep === 0}><ChevronLeft size={18} /></button>
                <button onClick={isPlaying ? () => setIsPlaying(false) : () => setIsPlaying(true)} className="p-2 hover:text-white text-indigo-400 transition-colors rounded-md font-bold">
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button onClick={nextStep} className="p-2 hover:text-white text-[var(--text-muted)] transition-colors rounded-md"><ChevronRight size={18} /></button>
              </div>

              <button onClick={resetVisualization} className="btn-outline px-4 py-2.5" title="Reset Simulation"><RotateCcw size={18} /></button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className={`flex-1 ${activeTab === 'visualizer' ? 'overflow-hidden flex flex-col items-center justify-center' : 'overflow-y-auto custom-scrollbar'} bg-[var(--bg-main)]`}>

          {activeTab === 'visualizer' && (
            <div className="w-full h-full flex flex-col items-center relative p-8">

              {/* Legend / Key - Moved from Header */}
              <div className="flex items-center justify-center gap-8 mb-8 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-sub)] px-8 py-3 rounded-full border border-[var(--border)] shadow-lg shadow-black/20">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                  <span>Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                  <span>Mismatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                  <span>Found</span>
                </div>
              </div>

              {/* VISUALIZATION CANVAS */}
              <div className="flex-1 w-full max-w-full overflow-x-auto p-4 flex flex-col items-center justify-center no-scrollbar">

                {/* Text Row */}
                <div className="relative mb-2">
                  <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] -rotate-90">Text</div>
                  <div className="flex gap-2">
                    {text.split('').map((char, i) => {
                      let status = '';
                      const isRkWindow = selectedAlgo === 'rk' && ['window', 'hash-mismatch', 'hash-match'].includes(visState.state);

                      // Check if index is in found indices (final or partial history)
                      if (foundIndices.some(idx => i >= idx && i < idx + pattern.length)) {
                        status = 'found';
                      } else if (isRkWindow && i >= visState.textIndex && i < visState.textIndex + pattern.length) {
                        // Highlight full window for RK hash check
                        if (visState.state === 'hash-mismatch') status = 'mismatch';
                        else status = 'active'; // hash-match or window -> active/blue
                      } else if (i === visState.textIndex) {
                        status = visState.state;
                      }

                      return (
                        <div key={i} className="flex flex-col items-center gap-3">
                          <motion.div layout className={`char-box ${status} ${i === visState.textIndex ? 'active' : ''} ${status === 'found' ? 'found' : ''}`}>
                            {char}
                          </motion.div>
                          <span className={`text-xs font-mono font-medium ${i === visState.textIndex ? 'text-indigo-400' : 'text-[var(--text-muted)]'}`}>{i}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pattern Row */}
                <div className="h-[120px] w-full flex justify-center mt-4">
                  <AnimatePresence>
                    {visState.state !== 'idle' && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="relative"
                        style={{ width: `${text.length * BOX_OFFSET}px` }}
                      >
                        <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] -rotate-90">Pattern</div>

                        <motion.div
                          className="absolute flex gap-2"
                          animate={{ left: patternOffset * BOX_OFFSET }}
                          transition={{ type: "spring", stiffness: 180, damping: 24, mass: 0.8 }}
                        >
                          {pattern.split('').map((char, j) => {
                            const isActive = j === visState.patternIndex;
                            const isRkWindow = selectedAlgo === 'rk' && ['window', 'hash-mismatch', 'hash-match'].includes(visState.state);

                            let statusClass = "bg-[var(--bg-panel)] border-indigo-500/20 text-indigo-400 opacity-60";

                            if (isActive || isRkWindow) {
                              if (visState.state === 'match') statusClass = "bg-emerald-600 border-emerald-500 text-white opacity-100";
                              else if (visState.state === 'mismatch' || visState.state === 'hash-mismatch') statusClass = "bg-rose-600 border-rose-500 text-white opacity-100";
                              else statusClass = "bg-indigo-600 border-indigo-500 text-white opacity-100 shadow-xl shadow-indigo-500/20";
                            }

                            return (
                              <div key={j} className="flex flex-col items-center gap-3">
                                <div className={`w-[56px] h-[56px] rounded-xl border-2 flex items-center justify-center text-xl font-bold font-mono transition-all duration-300 ${statusClass} ${isActive || isRkWindow ? 'scale-110' : ''}`}>
                                  {char}
                                </div>
                                {/* Updated to show Global Index (shifted) */}
                                <span className={`text-xs font-mono font-bold ${isActive ? 'text-indigo-400' : 'text-[var(--text-muted)] opacity-50'}`}>
                                  {j + patternOffset}
                                </span>
                              </div>
                            );
                          })}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* INFO PANELS (Tables/Result) */}
              <div className="shrink-0 w-full max-w-4xl grid grid-cols-2 gap-6 pb-6">

                {/* Algorithm Specific Data (KMP Table / Rabin-Karp Hash) */}
                {(selectedAlgo === 'kmp' || selectedAlgo === 'rk') && (
                  <div className="panel p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
                      {selectedAlgo === 'kmp' ? <><TableIcon size={14} /> LPS Table</> : <><Hash size={14} /> Hash Values</>}
                    </h3>

                    {selectedAlgo === 'kmp' && visState.lps && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse">
                          <thead>
                            <tr>
                              {pattern.split('').map((c, i) => (
                                <th key={i} className="border border-[var(--border)] p-2 text-xs text-[var(--text-muted)] font-mono">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {visState.lps.map((val, i) => (
                                <td key={i} className="border border-[var(--border)] p-2 text-sm font-bold text-indigo-400 bg-[var(--bg-sub)]">{val}</td>
                              ))}
                            </tr>
                            <tr>
                              {pattern.split('').map((_, i) => (
                                <td key={i} className="border border-[var(--border)] p-1 text-[10px] text-[var(--text-muted)]">{i}</td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {selectedAlgo === 'rk' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[var(--bg-sub)] p-3 rounded-xl border border-[var(--border)]">
                            <span className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Pattern Hash (p)</span>
                            <span className="text-xl font-mono font-bold text-emerald-400">{visState.hashP !== undefined ? visState.hashP : '-'}</span>
                          </div>
                          <div className="bg-[var(--bg-sub)] p-3 rounded-xl border border-[var(--border)]">
                            <span className="text-[10px] uppercase text-[var(--text-muted)] block mb-1">Window Hash (t)</span>
                            <span className={`text-xl font-mono font-bold ${visState.hashP === visState.hashT ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {visState.hashT !== undefined ? visState.hashT : '-'}
                            </span>
                          </div>
                        </div>

                        {/* Hash Function Legend */}
                        <div className="bg-[var(--bg-sub)] p-3 rounded-xl border border-[var(--border)]">
                          <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-2">
                            Full Sum Hash Function
                          </h4>
                          <div className="flex gap-2 flex-wrap text-xs font-mono text-[var(--text-muted)]">
                            <span className="bg-[var(--bg-panel)] px-2 py-1 rounded border border-[var(--border)]">a=1</span>
                            <span className="bg-[var(--bg-panel)] px-2 py-1 rounded border border-[var(--border)]">b=2</span>
                            <span className="bg-[var(--bg-panel)] px-2 py-1 rounded border border-[var(--border)]">c=3</span>
                            <span className="opacity-50">...</span>
                            <span className="bg-[var(--bg-panel)] px-2 py-1 rounded border border-[var(--border)]">z=26</span>
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] mt-2 italic">
                            Hash = Sum of character values in the window.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Result Summary (Only when finished) */}
                {visState.state === 'finished' && (
                  <div className="panel p-6 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 border-emerald-500/30 bg-emerald-950/20 col-span-2">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2"><CheckCircle size={18} /> Search Complete</h3>
                        <p className="text-sm text-emerald-200/60 mt-1">Found {foundIndices.length} matches in {history.length} steps.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Efficiency</span>
                        <div className="text-2xl font-bold text-white">{((foundIndices.length / history.length) * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Found at Indices</h4>
                      <div className="flex gap-2 flex-wrap">
                        {foundIndices.length > 0 ? foundIndices.map((idx, i) => (
                          <span key={i} className="px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-sm">
                            Shift {idx}
                          </span>
                        )) : <span className="text-sm text-[var(--text-muted)] italic">No matches found.</span>}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {activeTab === 'theory' && (
            <div className="max-w-6xl mx-auto p-12">
              <div className="mb-10 p-8 rounded-2xl bg-gradient-to-r from-indigo-900/10 to-violet-900/10 border border-indigo-500/10">
                <h2 className="text-4xl font-bold text-white mb-3">Algorithm Theory</h2>
                <p className="text-[var(--text-muted)] text-lg">Understanding the mechanics and time complexity of string matching.</p>
              </div>

              <div className="space-y-8">
                {Object.keys(algorithmTheory).map(key => {
                  const data = algorithmTheory[key];
                  return (
                    <div key={key} className="panel p-0 overflow-hidden">
                      <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-sub)] flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-white tracking-tight">{data.title}</h3>
                      </div>
                      <div className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-12">
                        <div className="xl:col-span-2 space-y-8">
                          {/* Complexity Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-center">
                              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Time (Best)</div>
                              <div className="text-emerald-400 font-mono font-bold text-lg">{data.complexity.best}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-center">
                              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Time (Avg)</div>
                              <div className="text-indigo-400 font-mono font-bold text-lg">{data.complexity.average}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-center">
                              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Time (Worst)</div>
                              <div className="text-rose-400 font-mono font-bold text-lg">{data.complexity.worst}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-center">
                              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Space</div>
                              <div className="text-fuchsia-400 font-mono font-bold text-lg">{data.complexity.space}</div>
                            </div>
                          </div>

                          <p className="text-base leading-7 text-[var(--text-muted)]">{data.description}</p>
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Algorithm Steps</h4>
                            <ul className="space-y-4">
                              {data.steps.map((step, i) => (
                                <li key={i} className="flex gap-4 text-sm text-[var(--text-muted)] group">
                                  <span className="shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors flex items-center justify-center text-xs font-mono">{i + 1}</span>
                                  <span className="pt-1.5">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-8">
                          <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)]">
                            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={14} /> Advantages</h4>
                            <ul className="space-y-3">
                              {data.pros.map((p, i) => (
                                <li key={i} className="text-sm text-[var(--text-muted)] flex items-start gap-3">
                                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)]">
                            <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Info size={14} /> Limitations</h4>
                            <ul className="space-y-3">
                              {data.cons.map((c, i) => (
                                <li key={i} className="text-sm text-[var(--text-muted)] flex items-start gap-3">
                                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
