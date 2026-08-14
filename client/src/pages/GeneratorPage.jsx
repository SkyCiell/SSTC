import React, { useState } from 'react';
import UploadZone from '../components/UploadZone';
import CodeEditor from '../components/CodeEditor';
import LivePreview from '../components/LivePreview';
import { generateCodeAPI, saveProjectAPI, exportZipAPI } from '../services/api';

export default function GeneratorPage({ setCurrentProject, setActiveTab }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [framework, setFramework] = useState('react-tailwind');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [apiWarning, setApiWarning] = useState(null);

  const handleGenerate = async (isRefinePass = false) => {
    if (!selectedImage) return;

    setApiWarning(null);

    if (isRefinePass) {
      setIsRefining(true);
    } else {
      setIsGenerating(true);
    }

    setCurrentStep(1); // 1. Analyzing screenshot

    const timer1 = setTimeout(() => setCurrentStep(2), 500); // 2. Building layout
    const timer2 = setTimeout(() => setCurrentStep(3), 1000); // 3. Generating code

    try {
      const payloadImage = selectedImage.file || selectedImage.previewUrl;
      const data = await generateCodeAPI(payloadImage, framework, customPrompt, {
        isRefinement: isRefinePass,
        previousCode: isRefinePass ? generatedCode : '',
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      setCurrentStep(4); // 4. Rendering preview
      setGeneratedCode(data.generatedCode);
      if (data.warning) {
        setApiWarning(data.warning);
      }

      setTimeout(() => {
        setCurrentStep(5); // 5. Refining UI
        setTimeout(() => {
          setIsGenerating(false);
          setIsRefining(false);
        }, 500);
      }, 300);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setCurrentStep(0);
      setIsGenerating(false);
      setIsRefining(false);
      alert(`Generation Failed: ${err.message}`);
    }
  };

  const handleSaveProject = async () => {
    if (!generatedCode || !selectedImage) {
      alert('Please generate code first before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const projectName = prompt('Enter a name for this project:', 'My AI UI Project');
      if (!projectName) {
        setIsSaving(false);
        return;
      }

      const res = await saveProjectAPI({
        name: projectName,
        originalImage: selectedImage.previewUrl,
        framework,
        generatedCode,
      });

      setCurrentProject(res.project);
      alert('Project saved successfully!');
      setActiveTab('editor');
    } catch (err) {
      alert(`Failed to save project: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportZip = async () => {
    if (!generatedCode) return;
    try {
      await exportZipAPI(generatedCode, framework, 'screenshot-to-code-ui');
    } catch (err) {
      alert(`Export ZIP failed: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-zinc-950">
      {apiWarning && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-300 flex items-center justify-between flex-shrink-0">
          <span>⚠️ {apiWarning}</span>
          <button
            onClick={() => setApiWarning(null)}
            className="text-amber-400 hover:text-amber-200 text-xs font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3 Column Main Layout on Desktop / Stacked on Mobile */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Panel 1: Upload & Controls (Desktop: 3 cols) */}
        <div className="lg:col-span-3 h-full min-h-[350px]">
          <UploadZone
            selectedImage={selectedImage}
            onImageSelected={setSelectedImage}
            onClearImage={() => {
              setSelectedImage(null);
              setGeneratedCode('');
              setCurrentStep(0);
            }}
            framework={framework}
            setFramework={setFramework}
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            onGenerate={() => handleGenerate(false)}
            isGenerating={isGenerating}
            currentStep={currentStep}
          />
        </div>

        {/* Panel 2: Generated Code Editor (Desktop: 4 cols) */}
        <div className="lg:col-span-4 h-full min-h-[400px]">
          <CodeEditor
            code={generatedCode}
            onChangeCode={setGeneratedCode}
            framework={framework}
            onSave={handleSaveProject}
            onExport={handleExportZip}
            isSaving={isSaving}
            onRegenerate={selectedImage ? () => handleGenerate(false) : null}
          />
        </div>

        {/* Panel 3: Live Preview (Desktop: 5 cols) */}
        <div className="lg:col-span-5 h-full min-h-[450px]">
          <LivePreview
            code={generatedCode}
            framework={framework}
            originalImage={selectedImage?.previewUrl}
            onRefineUI={() => handleGenerate(true)}
            isRefining={isRefining}
          />
        </div>
      </div>
    </div>
  );
}
