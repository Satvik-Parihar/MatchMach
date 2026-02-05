
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, BarChart2, Activity, Zap } from 'lucide-react';
import { naiveGenerator, kmpGenerator, rabinKarpGenerator } from './algorithms/visualizers';
import './index.css';

const ALGOS = {
  naive: { name: 'Naive Algorithm', generator: naiveGenerator },
  kmp: { name: 'Knuth-Morris-Pratt (KMP)', generator: kmpGenerator },
  rk: { name: 'Rabin-Karp', generator: rabinKarpGenerator }
};

function App() {
  const [text, setText] = useState('ABABDABACDABABCABAB');
  const [pattern, setPattern] = useState('ABABCABAB');
  const [selectedAlgo, setSelectedAlgo] = useState('naive');

  // Visualization State
  const [visState, setVisState] = useState({
    textIndex: -1,
    patternIndex: -1,
    state: 'idle', // idle, window, match, mismatch, found
    message: 'Ready to start'
  });
  const [foundIndices, setFoundIndices] = useState([]);
  const [history, setHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms

  // Comparison State
  const [comparisonData, setComparisonData] = useState(null);
  const generatorRef = useRef(null);
  const timerRef = useRef(null);

  const resetVisualization = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setVisState({ textIndex: -1, patternIndex: -1, state: 'idle', message: 'Ready' });
    setFoundIndices([]);
    setHistory([]);
    generatorRef.current = null;
  };

  const startVisualization = () => {
    if (!generatorRef.current) {
      generatorRef.current = ALGOS[selectedAlgo].generator(text, pattern);
      setFoundIndices([]); // Clear previous found
    }
    setIsPlaying(true);
  };

  const pauseVisualization = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const stepForward = () => {
    if (!generatorRef.current) return;

    const { value, done } = generatorRef.current.next();

    if (done) {
      setIsPlaying(false);
      setVisState(prev => ({ ...prev, message: 'Search Completed!', state: 'finished' }));
      return;
    }

    setVisState(prev => ({ ...prev, ...value }));

    if (value.state === 'found') {
      setFoundIndices(prev => [...prev, value.textIndex]);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(stepForward, speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed]);

  const handleCompare = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/compare', { text, pattern });
      setComparisonData(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching comparison data');
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-6xl mb-10 flex justify-between items-center glass-panel p-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
            MatchMach
          </h1>
          <p className="text-gray-400 text-sm mt-1">String Matching Algorithm Visualizer & Comparator</p>
        </div>
        <div className="flex gap-4">
          {/* Algorithm Selector */}
          <div className="flex bg-slate-800 rounded-lg p-1">
            {Object.keys(ALGOS).map(key => (
              <button
                key={key}
                onClick={() => { setSelectedAlgo(key); resetVisualization(); }}
                className={`px-4 py-2 rounded-md text-sm transition-all ${selectedAlgo === key ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Controls & Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="text-yellow-400" size={20} /> Configuration
            </h2>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Text String</label>
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); resetVisualization(); }}
                className="input-field h-24 font-mono text-sm tracking-widest"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Pattern to Find</label>
              <input
                value={pattern}
                onChange={e => { setPattern(e.target.value); resetVisualization(); }}
                className="input-field font-mono text-sm tracking-widest"
              />
            </div>

            <div className="pt-4 border-t border-gray-700">
              <label className="block text-gray-400 text-sm mb-2">Speed: {speed}ms</label>
              <input
                type="range"
                min="50" max="1000" step="50"
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="text-indigo-400" size={20} /> Controls
            </h2>
            <div className="flex gap-2">
              {!isPlaying ? (
                <button onClick={startVisualization} className="btn w-full justify-center">
                  <Play size={18} /> Start
                </button>
              ) : (
                <button onClick={pauseVisualization} className="btn btn-secondary w-full justify-center">
                  <Pause size={18} /> Pause
                </button>
              )}
              <button onClick={resetVisualization} className="btn btn-secondary w-12 justify-center">
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-sm text-gray-400 font-mono">
                {visState.message}
              </p>
            </div>
          </div>
        </div>

        {/* Middle/Right: Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
            <h2 className="absolute top-6 left-6 text-xl font-semibold text-gray-300">
              {ALGOS[selectedAlgo].name} Visualization
            </h2>

            {/* Visualizer Container */}
            <div className="w-full overflow-x-auto pb-8">
              <div className="min-w-max">
                {/* Text Array */}
                <div className="flex gap-2 mb-8">
                  {text.split('').map((char, i) => {
                    let status = '';
                    if (foundIndices.includes(i)) status = 'found'; // Start of found pattern
                    else if (i === visState.textIndex) {
                      if (visState.state === 'match') status = 'match';
                      else if (visState.state === 'mismatch') status = 'mismatch';
                      else status = 'active'; // Window or check
                    }

                    // Keep 'found' status for whole pattern length? 
                    // The generator returns start index. Let's make it simpler.
                    // Check if i is within any found range [foundIndex, foundIndex + m]
                    const isFound = foundIndices.some(startIdx => i >= startIdx && i < startIdx + pattern.length);

                    return (
                      <motion.div
                        key={i}
                        layout
                        className={`char-box text-lg ${isFound ? 'found' : status}`}
                      >
                        {char}
                        <div className="absolute -bottom-5 text-[10px] text-gray-500 font-mono">{i}</div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pattern Array (Floating) */}
                <AnimatePresence>
                  {visState.state !== 'idle' && visState.state !== 'finished' && (
                    <motion.div
                      className="flex gap-2 p-2 rounded-lg bg-slate-800/80 border border-indigo-500/30 w-fit"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        x: visState.textIndex * 48 - (visState.patternIndex * 48) // Align pattern visually
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      {pattern.split('').map((char, j) => (
                        <div
                          key={j}
                          className={`char-box text-lg ${j === visState.patternIndex ? 'active' : ''}`}
                        >
                          {char}
                          <div className="absolute -bottom-5 text-[10px] text-gray-500 font-mono">{j}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Logic Explanation Overlay/Watermark */}
            <div className="absolute bottom-6 right-6 text-right opacity-20 pointer-events-none">
              <h3 className="text-4xl font-bold">
                {visState.state === 'match' ? 'MATCH' :
                  visState.state === 'mismatch' ? 'MISMATCH' :
                    visState.state === 'found' ? 'FOUND' :
                      visState.state.toUpperCase()}
              </h3>
            </div>
          </div>

          {/* Comparison Section */}
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BarChart2 className="text-pink-400" size={20} /> Performance Analysis
              </h2>
              <button onClick={handleCompare} className="btn text-sm py-2 px-4 shadow-pink-500/20 bg-gradient-to-r from-pink-600 to-rose-600">
                Run Full Global Benchmark
              </button>
            </div>

            {comparisonData ? (
              <div className="space-y-4">
                {['naive', 'kmp', 'rabinKarp'].map(algo => {
                  const data = comparisonData[algo];
                  const maxTime = Math.max(...Object.values(comparisonData).map(d => d.time));
                  const maxSteps = Math.max(...Object.values(comparisonData).map(d => d.steps));

                  return (
                    <div key={algo} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-300 capitalize">{ALGOS[algo]?.name || algo}</span>
                        <span className="text-xs text-gray-400">{data.time.toFixed(4)}ms | {data.steps} ops</span>
                      </div>
                      <div className="w-full h-8 bg-slate-800 rounded-full overflow-hidden flex">
                        {/* Time Bar */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(data.time / maxTime) * 100}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                          title="Time Taken"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Click "Run Benchmark" to compare efficiency on current text inputs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
