import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Download, Save, Code2, RefreshCw } from 'lucide-react';

export default function CodeEditor({
  code,
  onChangeCode,
  framework,
  onSave,
  onExport,
  isSaving,
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const language = framework === 'react-tailwind' ? 'javascript' : 'html';

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 overflow-hidden font-sans">
      {/* Editor Header / Controls Bar */}
      <div className="h-10 px-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Code2 className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
            {framework === 'react-tailwind' ? 'Component.jsx' : 'index.html'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-widest bg-zinc-900 text-zinc-400 border border-zinc-800">
            {framework}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Regenerate Button */}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              title="Regenerate code"
              className="px-2 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition text-[11px] font-mono uppercase tracking-wider flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-2 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition text-[11px] font-mono uppercase tracking-wider flex items-center gap-1"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Save Button */}
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving || !code}
              className="px-2.5 py-1 bg-zinc-100 hover:bg-white text-zinc-950 text-[11px] font-mono font-bold uppercase tracking-wider transition flex items-center space-x-1 disabled:opacity-40"
            >
              <Save className="w-3 h-3" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          )}

          {/* Export ZIP Button */}
          {onExport && (
            <button
              onClick={onExport}
              disabled={!code}
              className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 text-[11px] font-mono font-medium uppercase tracking-wider transition flex items-center space-x-1 disabled:opacity-40"
            >
              <Download className="w-3 h-3 text-zinc-400" />
              <span>Export ZIP</span>
            </button>
          )}
        </div>
      </div>

      {/* Monaco Code Editor Area */}
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code || '// Code will appear here after AI processing...'}
          onChange={(val) => onChangeCode(val || '')}
          options={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            padding: { top: 12, bottom: 12 },
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
