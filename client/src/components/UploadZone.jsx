import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, X, Sparkles, Code, Layout, RefreshCw } from 'lucide-react';
import GenerationProgress from './GenerationProgress';

export default function UploadZone({
  onImageSelected,
  selectedImage,
  onClearImage,
  framework,
  setFramework,
  onGenerate,
  isGenerating,
  customPrompt,
  setCustomPrompt,
  currentStep = 0,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      onImageSelected({
        file,
        previewUrl: event.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 p-5 space-y-5 overflow-y-auto font-sans">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h2 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
          Screenshot Input
        </h2>
        {selectedImage && (
          <button
            onClick={onClearImage}
            className="text-[11px] font-mono text-zinc-400 hover:text-zinc-100 transition flex items-center gap-1 uppercase tracking-wider"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Drag and Drop Zone */}
      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 min-h-[200px] border border-dashed transition flex flex-col items-center justify-center p-6 text-center cursor-pointer ${
            isDragging
              ? 'border-zinc-400 bg-zinc-900'
              : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950 hover:bg-zinc-900/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="w-10 h-10 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 mb-3">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Drag & Drop UI Screenshot
          </p>
          <p className="text-[11px] font-mono text-zinc-500 mt-1">
            or click to browse (PNG, JPG, WEBP)
          </p>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center max-h-[280px] p-2">
          <img
            src={selectedImage.previewUrl}
            alt="UI Screenshot Preview"
            className="max-h-[240px] w-auto object-contain"
          />
        </div>
      )}

      {/* Framework Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5 text-zinc-400" />
          Target Framework
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFramework('react-tailwind')}
            className={`flex items-center justify-center gap-2 py-2 px-3 border text-xs font-mono font-medium tracking-wider transition ${
              framework === 'react-tailwind'
                ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            React + Tailwind
          </button>

          <button
            type="button"
            onClick={() => setFramework('html-css')}
            className={`flex items-center justify-center gap-2 py-2 px-3 border text-xs font-mono font-medium tracking-wider transition ${
              framework === 'html-css'
                ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            HTML + CSS
          </button>
        </div>
      </div>

      {/* Custom Refinement Prompt */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
          Refinement Instructions
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Specify layout or style preferences..."
          rows={2}
          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition resize-none"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={onGenerate}
        disabled={!selectedImage || isGenerating}
        className={`w-full py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition ${
          !selectedImage || isGenerating
            ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm'
        }`}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
            <span>Analyzing & Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-zinc-950" />
            <span>Generate UI Code</span>
          </>
        )}
      </button>

      {/* Progress Status Indicator */}
      {(isGenerating || (currentStep > 0 && currentStep <= 5)) && (
        <GenerationProgress currentStep={currentStep} isGenerating={isGenerating} />
      )}
    </div>
  );
}

