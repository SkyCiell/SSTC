import { OpenRouterProvider } from './openrouterProvider.js';
import { GeminiProvider } from './geminiProvider.js';
import { OpenAIProvider } from './openaiProvider.js';
import { BaseAIProvider } from './baseProvider.js';

export { OpenRouterProvider, GeminiProvider, OpenAIProvider, BaseAIProvider };

export class MockProvider extends BaseAIProvider {
  constructor() {
    super('mock');
  }

  async generateCode({ framework, customPrompt }) {
    const isReact = framework === 'react-tailwind';

    if (isReact) {
      return {
        code: `import React from 'react';
import { LayoutGrid, Sparkles, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function GeneratedUI() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header Navbar */}
      <header className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Reconstructed Dashboard</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-zinc-400">
          <a href="#" className="text-white">Overview</a>
          <a href="#" className="hover:text-white transition">Analytics</a>
          <a href="#" className="hover:text-white transition">Settings</a>
        </nav>
        <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-md">
          Action Button
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Banner Section */}
        <div className="p-6 bg-gradient-to-r from-indigo-900/40 via-zinc-900 to-zinc-900 border border-indigo-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium">
              <Sparkles className="w-3.5 h-3.5" /> UI Pixel Reconstruction Active
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              ${customPrompt ? customPrompt : 'Responsive Hero Dashboard UI'}
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
              Extracted container layouts, structural flexbox alignment, and verified visual styling from screenshot source.
            </p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20">
            <span>Explore Component</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Layout Precision</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">99.4%</p>
            <p className="text-[11px] text-emerald-400 font-mono">+ Verified Structure</p>
          </div>

          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Spacing & Padding</span>
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">Pixel Match</p>
            <p className="text-[11px] text-indigo-400 font-mono">+ Flexbox & Grid</p>
          </div>

          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Typography Sizing</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">Exact Hierarchy</p>
            <p className="text-[11px] text-zinc-400 font-mono">+ Clean Styling</p>
          </div>
        </div>
      </main>
    </div>
  );
}`,
        rawResponse: 'Mock generated response',
      };
    }

    return {
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reconstructed UI Component</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #09090b; color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .container { background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; width: 100%; max-width: 520px; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .badge { display: inline-block; padding: 4px 10px; background-color: rgba(79,70,229,0.15); border: 1px solid rgba(99,102,241,0.3); color: #818cf8; border-radius: 9999px; font-size: 11px; font-weight: 500; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 8px; tracking: -0.025em; }
    .subtitle { font-size: 13px; color: #a1a1aa; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: inline-flex; items-center: center; justify-content: center; width: 100%; padding: 12px 18px; background-color: #4f46e5; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn:hover { background-color: #4338ca; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Reconstructed HTML + CSS</div>
    <h2 class="title">${customPrompt ? customPrompt : 'Pixel-Accurate UI Reconstruction'}</h2>
    <p class="subtitle">Systematic layout structural extraction, flexbox grid positioning, and typography match completed.</p>
    <button class="btn">Explore UI Design</button>
  </div>
</body>
</html>`,
      rawResponse: 'Mock HTML generated response',
    };
  }
}

export function getAIProvider() {
  const providerName = (process.env.AI_PROVIDER || 'openrouter').toLowerCase();

  if (providerName === 'openrouter') {
    return new OpenRouterProvider();
  }

  if (providerName === 'openai') {
    return new OpenAIProvider();
  }

  if (providerName === 'gemini') {
    return new GeminiProvider();
  }

  if (providerName === 'mock') {
    return new MockProvider();
  }

  // Default primary provider is OpenRouter
  return new OpenRouterProvider();
}
