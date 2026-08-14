import React from 'react';
import { Code2, History, Wand2, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentProject }) {
  return (
    <header className="h-12 bg-zinc-950 border-b border-zinc-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-zinc-200">
          <Code2 className="w-4 h-4" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xs tracking-wider text-zinc-100 uppercase font-mono">
            Screenshot To Code
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 uppercase tracking-widest">
            AI Vision
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-zinc-950 p-0.5 rounded border border-zinc-800">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition ${
            activeTab === 'generator'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Wand2 className="w-3 h-3 text-zinc-400" />
          <span>Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition ${
            activeTab === 'history'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <History className="w-3 h-3 text-zinc-400" />
          <span>History</span>
        </button>

        {currentProject && (
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition ${
              activeTab === 'editor'
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="max-w-[120px] truncate">{currentProject.name || 'Editor'}</span>
          </button>
        )}
      </nav>

      {/* Right side status / indicator */}
      <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Engine Online</span>
      </div>
    </header>
  );
}
