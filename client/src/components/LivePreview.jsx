import React, { useState, useEffect, useRef } from 'react';
import { Eye, Monitor, Smartphone, Tablet, RefreshCw, AlertCircle, Columns, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function LivePreview({ code, framework, originalImage, onRefineUI, isRefining }) {
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'comparison'
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    updatePreview();
  }, [code, framework]);

  const updatePreview = () => {
    if (!iframeRef.current) return;

    setError(null);

    const isReact = framework === 'react-tailwind';

    let htmlContent = '';

    if (!code || code.trim() === '') {
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-zinc-950 text-zinc-400 flex items-center justify-center min-h-screen font-sans">
          <div class="text-center space-y-2">
            <p className="text-sm font-medium">Live Preview Standby</p>
            <p className="text-xs text-zinc-600">Generated UI preview will render here in real-time.</p>
          </div>
        </body>
        </html>
      `;
    } else if (isReact) {
      // Clean import statements from raw generated React code for standalone Babel execution
      const sanitizedCode = code
        .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '')
        .replace(/export\s+default\s+function/g, 'function GeneratedComponent')
        .replace(/export\s+default/g, '');

      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <!-- Tailwind CSS CDN -->
          <script src="https://cdn.tailwindcss.com"></script>
          <!-- React 18 & ReactDOM CDN -->
          <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <!-- Babel Standalone for JSX compilation -->
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <!-- Lucide Icons CDN -->
          <script src="https://unpkg.com/lucide@latest"></script>
          <script>
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    zinc: {
                      950: '#09090b',
                      900: '#18181b',
                      800: '#27272a',
                    }
                  }
                }
              }
            }
          </script>
          <style>
            body { margin: 0; background-color: #09090b; color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif; }
          </style>
        </head>
        <body class="bg-zinc-950 text-zinc-100">
          <div id="root"></div>
          <script type="text/babel">
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              window.parent.postMessage({ type: 'PREVIEW_ERROR', error: msg }, '*');
              return false;
            };

            // Lucide Icon Helper fallback
            const IconWrapper = ({ name, className = 'w-4 h-4' }) => {
              return <i data-lucide={name || 'circle'} className={className}></i>;
            };

            try {
              ${sanitizedCode}

              const App = typeof GeneratedComponent !== 'undefined' ? GeneratedComponent : () => <div>Component definition error</div>;
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<App />);

              setTimeout(() => {
                if (window.lucide) {
                  window.lucide.createIcons();
                }
              }, 100);
            } catch (err) {
              window.parent.postMessage({ type: 'PREVIEW_ERROR', error: err.message }, '*');
            }
          </script>
        </body>
        </html>
      `;
    } else {
      // HTML + CSS Direct Render
      let preparedHtml = code;
      if (!preparedHtml.includes('cdn.tailwindcss.com')) {
        preparedHtml = preparedHtml.replace(
          '</head>',
          '<script src="https://cdn.tailwindcss.com"></script></head>'
        );
      }
      htmlContent = preparedHtml;
    }

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'PREVIEW_ERROR') {
        setError(event.data.error);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden font-sans">
      {/* Live Preview Header */}
      <div className="h-10 px-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">Live Preview</span>
          </div>

          {/* Mode Switcher */}
          {originalImage && (
            <div className="flex items-center space-x-1 bg-zinc-950 p-0.5 border border-zinc-800 font-mono text-[11px] uppercase tracking-wider">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2 py-0.5 transition ${
                  viewMode === 'preview'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                Rendered
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-2 py-0.5 transition flex items-center gap-1 ${
                  viewMode === 'comparison'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <Columns className="w-3 h-3" />
                Visual Compare
              </button>
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Refine Accuracy Button */}
          {onRefineUI && code && (
            <button
              onClick={onRefineUI}
              disabled={isRefining}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 text-[11px] font-mono font-medium uppercase tracking-wider transition flex items-center space-x-1 disabled:opacity-40"
              title="Compare with screenshot and refine layout accuracy"
            >
              <Sparkles className={`w-3 h-3 text-indigo-400 ${isRefining ? 'animate-spin' : ''}`} />
              <span>{isRefining ? 'Refining...' : 'Refine UI'}</span>
            </button>
          )}

          {/* Viewport controls */}
          <div className="flex items-center space-x-1 bg-zinc-950 p-0.5 border border-zinc-800 text-[11px] font-mono">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 transition ${
                viewport === 'desktop' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 transition ${
                viewport === 'tablet' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 transition ${
                viewport === 'mobile' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3 h-3" />
            </button>

            <div className="w-[1px] h-3 bg-zinc-800 mx-1"></div>

            <button
              onClick={updatePreview}
              className="p-1 text-zinc-500 hover:text-zinc-200 transition"
              title="Reload Preview"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Error alert bar */}
      {error && (
        <div className="bg-zinc-900 border-b border-red-500/40 px-4 py-2 text-xs font-mono text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Content Container */}
      {viewMode === 'comparison' && originalImage ? (
        /* Visual Comparison Split View */
        <div className="flex-1 bg-zinc-950 p-3 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-auto">
          {/* Left: Original Screenshot */}
          <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div className="h-8 px-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                Original Source Screenshot
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Source</span>
            </div>
            <div className="flex-1 p-2 flex items-center justify-center bg-zinc-950 overflow-auto">
              <img
                src={originalImage}
                alt="Source Screenshot"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          {/* Right: Rendered Generated UI */}
          <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div className="h-8 px-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                Reconstructed Live Render
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Interactive</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                ref={iframeRef}
                title="UI Live Comparison Preview"
                className="w-full h-full border-0 bg-zinc-950"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Single Render View */
        <div className="flex-1 bg-zinc-950 p-3 flex justify-center items-center overflow-auto">
          <div
            className={`h-full bg-zinc-950 border border-zinc-800 overflow-hidden transition-all duration-300 ${getViewportWidth()}`}
          >
            <iframe
              ref={iframeRef}
              title="UI Live Preview"
              className="w-full h-full border-0 bg-zinc-950"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}

