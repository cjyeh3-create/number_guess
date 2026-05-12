/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Send, 
  History as HistoryIcon, 
  Trophy, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Hash,
  Lightbulb,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Terminal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGuessGame } from '../hooks/useGuessGame';
import { GameStatus, GuessResult } from '../types';

export default function GuessNumberGame() {
  const {
    guesses,
    status,
    message,
    guessCount,
    submitGuess,
    resetGame,
    minNumber,
    maxNumber,
    targetNumber,
    currentRange
  } = useGuessGame();

  const [inputValue, setInputValue] = useState<string>('');
  const [bestScore, setBestScore] = useState<number | null>(() => {
    const saved = localStorage.getItem('guess-game-best-score');
    return saved ? parseInt(saved, 10) : null;
  });
  
  const inputRef = useRef<HTMLInputElement>(null);

  // 自動對焦輸入框
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      inputRef.current?.focus();
    }
  }, [status, guesses]);

  // 當贏得遊戲時觸發紙屑特效並紀錄最佳成績
  useEffect(() => {
    if (status === GameStatus.WON) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b']
      });

      if (bestScore === null || guessCount < bestScore) {
        setBestScore(guessCount);
        localStorage.setItem('guess-game-best-score', guessCount.toString());
      }
    }
  }, [status, guessCount, bestScore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputValue, 10);
    if (!isNaN(num)) {
      submitGuess(num);
      setInputValue('');
    }
  };

  const handleReset = () => {
    resetGame();
    setInputValue('');
  };

  const accuracy = useMemo(() => {
    if (guesses.length === 0) return 0;
    if (status === GameStatus.WON) return 100;
    const latest = guesses[0].value;
    const diff = Math.abs(latest - targetNumber);
    return Math.max(0, Math.round(100 - (diff / (maxNumber - minNumber)) * 100));
  }, [guesses, targetNumber, status, maxNumber, minNumber]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden" id="app-container">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">GuessMaster Pro</h1>
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-widest leading-none">React 18 + TS + Vite</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 mr-2">Version:</span>
            <span className="text-xs font-mono font-bold text-indigo-600">v1.2.0-STABLE</span>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 shadow-md shadow-slate-200"
          >
            <RotateCcw size={16} />
            重新開始
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-6 lg:p-8 gap-8 max-w-[1440px] mx-auto w-full">
        {/* Left Column: Game Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-center items-center relative overflow-hidden shrink-0">
            <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-500 ${status === GameStatus.WON ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`}></div>
            
            <div className="mb-8 text-center">
              <AnimatePresence mode="wait">
                {status === GameStatus.WON ? (
                  <motion.div
                    key="won"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-4 shadow-inner ring-4 ring-emerald-50">
                      <Trophy size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">恭喜答對！</h2>
                    <p className="text-slate-500">正確答案就是 <span className="font-mono font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">{targetNumber}</span></p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 text-slate-400 rounded-full mb-4 shadow-inner">
                      <Hash size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">數字是多少？</h2>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-500 text-sm">目前的縮小範圍</p>
                      <div className="flex items-center gap-3">
                        <motion.div 
                          key={currentRange.min}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-mono font-bold text-xl shadow-lg shadow-slate-200"
                        >
                          {currentRange.min}
                        </motion.div>
                        <div className="h-0.5 w-6 bg-slate-200"></div>
                        <motion.div 
                          key={currentRange.max}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-mono font-bold text-xl shadow-lg shadow-slate-200"
                        >
                          {currentRange.max}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-full max-w-sm space-y-6">
              <div className="relative flex flex-col">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 ml-1 tracking-wider">輸入您的猜測</label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="number"
                    min={minNumber}
                    max={maxNumber}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={status === GameStatus.WON}
                    placeholder="? ? ?"
                    className={`w-full h-20 text-4xl font-mono text-center border-2 rounded-2xl bg-slate-50 transition-all outline-none ${
                      status === GameStatus.WON 
                        ? 'border-emerald-500 text-emerald-600' 
                        : 'border-slate-200 focus:border-indigo-500 text-slate-800'
                    }`}
                  />
                  {status === GameStatus.WON && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                  )}
                </div>
                
                <AnimatePresence>
                  {message && status !== GameStatus.WON && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-sm font-bold mt-2 text-center ${
                        message.includes('小') ? 'text-blue-500' : 'text-orange-500'
                      }`}
                    >
                      {message.includes('小') ? <ArrowDownCircle className="inline mr-1" size={16} /> : <ArrowUpCircle className="inline mr-1" size={16} />}
                      {message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={(e) => {
                  if (status === GameStatus.WON) handleReset();
                  else handleSubmit(e as any);
                }}
                disabled={status !== GameStatus.WON && !inputValue}
                className={`w-full h-16 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 shadow-lg ${
                  status === GameStatus.WON
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none'
                }`}
              >
                {status === GameStatus.WON ? (
                  <>
                    <RotateCcw size={24} />
                    再玩一次
                  </>
                ) : (
                  <>
                    <Send size={24} />
                    提交猜測
                  </>
                )}
              </button>
            </div>

            {/* Stats row */}
            <div className="mt-12 flex gap-12 w-full justify-center">
              <div className="text-center group">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">已猜次數</p>
                <p className="text-4xl font-black text-slate-800">{guessCount.toString().padStart(2, '0')}</p>
              </div>
              <div className="text-center group">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">最佳紀錄</p>
                <p className="text-4xl font-black text-slate-800">{bestScore !== null ? bestScore.toString().padStart(2, '0') : '--'}</p>
              </div>
              <div className="text-center group">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1 group-hover:text-orange-500 transition-colors">即時準度</p>
                <p className="text-4xl font-black text-slate-800">{accuracy}%</p>
              </div>
            </div>
          </section>

          {/* Quick status cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
            <div className="bg-indigo-600 rounded-2xl p-5 text-white flex items-center gap-4 shadow-lg shadow-indigo-100">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-indigo-100 font-medium opacity-80">核心引擎</p>
                <p className="font-bold">自定義 Hook 優化</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">資料安全</p>
                <p className="font-bold text-slate-700">TypeScript 嚴格驗證</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="hidden lg:flex w-80 flex-col gap-6 h-full overflow-hidden">
          {/* History Panel */}
          <div className="flex-[3] bg-white border border-slate-200 rounded-3xl flex flex-col shadow-sm overflow-hidden min-h-0">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <HistoryIcon size={18} className="text-slate-400" />
                歷史猜測紀錄
              </h3>
              <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md font-bold">{guesses.length} ENTRIES</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {guesses.map((guess, index) => (
                  <motion.div
                    key={guess.timestamp}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${
                      guess.result === GuessResult.CORRECT 
                        ? 'bg-emerald-50 border-emerald-100' 
                        : 'bg-slate-50 border-slate-100 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        guess.result === GuessResult.CORRECT 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {guesses.length - index}
                      </span>
                      <span className="font-mono font-bold text-slate-700 text-lg">{guess.value}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                      guess.result === GuessResult.CORRECT ? 'text-emerald-600' :
                      guess.result === GuessResult.TOO_HIGH ? 'text-indigo-500' : 'text-rose-500'
                    }`}>
                      {guess.result === GuessResult.CORRECT ? '答對了' :
                       guess.result === GuessResult.TOO_HIGH ? '太大了' : '太小了'}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {guesses.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-2 mt-10">
                  <HistoryIcon size={48} />
                  <p className="text-xs font-bold uppercase tracking-widest">暫無紀錄</p>
                </div>
              )}
            </div>
          </div>

          {/* Decorator: Code View */}
          <div className="flex-1 bg-slate-900 rounded-3xl p-5 text-slate-300 font-mono text-[10px] overflow-hidden leading-relaxed shadow-lg relative shrink-0">
            <div className="absolute top-0 right-0 p-3 flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <Terminal size={14} className="text-indigo-400" />
              <span className="text-indigo-400 font-bold">useGuessGame.ts</span>
            </div>
            <div className="space-y-0.5 opacity-60">
              <p><span className="text-pink-400">export const</span> useGuessGame = () =&gt; &#123;</p>
              <p className="pl-4"><span className="text-pink-400">const</span> [target, setTarget] = useState(42);</p>
              <p className="pl-4"><span className="text-pink-400">const</span> checkGuess = (n: <span className="text-blue-300">number</span>) =&gt; &#123;</p>
              <p className="pl-8 text-slate-500">// 核心業務邏輯...</p>
              <p className="pl-4">&#125;;</p>
              <p className="text-slate-600 italic">// 封裝狀態與驗證邏輯</p>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="h-10 bg-white border-t border-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] shrink-0">
        Engineered for precision &bull; GuessMaster Pro v1.2
      </footer>
    </div>
  );
}

