import React from 'react';
import { Search, LayoutGrid, Code, Eye, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

export const GENERATION_STEPS = [
  { id: 1, label: 'Analyzing screenshot', icon: Search, desc: 'Canvas, typography & color extraction' },
  { id: 2, label: 'Building layout', icon: LayoutGrid, desc: 'Flexbox/Grid positioning structure' },
  { id: 3, label: 'Generating code', icon: Code, desc: 'Writing React/HTML output' },
  { id: 4, label: 'Rendering preview', icon: Eye, desc: 'Mounting DOM iframe' },
  { id: 5, label: 'Refining UI', icon: Sparkles, desc: 'Fidelity verification check' },
];

export default function GenerationProgress({ currentStep = 0, isGenerating = false }) {
  if (!isGenerating && (currentStep === 0 || currentStep > 5)) return null;

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-3 space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Progress Log
        </span>
        <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest">
          Step {Math.min(currentStep, 5)} / 5
        </span>
      </div>

      <div className="space-y-1">
        {GENERATION_STEPS.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between p-2 text-xs font-mono transition-colors ${
                isCurrent
                  ? 'bg-zinc-900 border border-zinc-700 text-zinc-100'
                  : isDone
                  ? 'bg-zinc-950 text-zinc-400'
                  : 'text-zinc-600'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <div className="flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                </div>
                <div className="truncate">
                  <p className={`text-[11px] uppercase tracking-wider ${isCurrent ? 'text-zinc-100 font-bold' : isDone ? 'text-zinc-300 font-medium' : 'text-zinc-500'}`}>
                    {step.label}
                  </p>
                </div>
              </div>

              {isCurrent && (
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider ml-2 flex-shrink-0">
                  Running
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
