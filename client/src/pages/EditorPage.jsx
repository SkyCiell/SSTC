import React, { useState, useEffect } from 'react';
import { getProjectByIdAPI, updateProjectAPI, exportZipAPI } from '../services/api';
import CodeEditor from '../components/CodeEditor';
import LivePreview from '../components/LivePreview';
import { History, Image as ImageIcon, Download, Save, ArrowLeft, GitCommit } from 'lucide-react';

export default function EditorPage({ projectId, onBackToHistory }) {
  const [project, setProject] = useState(null);
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const loadProject = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectByIdAPI(id);
      setProject(data.project);
      setVersions(data.versions || []);
      
      // Default to latest code version
      const latestVer = data.versions?.[data.versions.length - 1];
      setCurrentVersion(latestVer ? latestVer.version : 1);
      setCode(data.project.generated_code || '');
    } catch (err) {
      setError(err.message || 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVersion = (versionObj) => {
    setCurrentVersion(versionObj.version);
    setCode(versionObj.code);
  };

  const handleSaveVersion = async () => {
    if (!code || !project) return;
    setIsSaving(true);
    try {
      const res = await updateProjectAPI(project.id, { code });
      setProject(res.project);
      setVersions(res.versions);
      const latestVer = res.versions[res.versions.length - 1];
      setCurrentVersion(latestVer.version);
      alert(`Version ${latestVer.version} saved successfully!`);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportZip = async () => {
    if (!code || !project) return;
    try {
      await exportZipAPI(code, project.framework, project.name);
    } catch (err) {
      alert(`Export ZIP failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-zinc-950 flex items-center justify-center text-zinc-500 text-sm">
        Loading project editor...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 bg-zinc-950 p-6 flex flex-col items-center justify-center space-y-4">
        <p className="text-red-400 text-sm">{error || 'Project not found'}</p>
        <button
          onClick={onBackToHistory}
          className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg text-xs font-medium"
        >
          Back to History
        </button>
      </div>
    );
  }

  const [isRefining, setIsRefining] = useState(false);

  const handleRefineUI = async () => {
    if (!code || !project || !project.original_image) return;
    setIsRefining(true);
    try {
      const data = await generateCodeAPI(project.original_image, project.framework, '', {
        isRefinement: true,
        previousCode: code,
      });

      setCode(data.generatedCode);

      // Automatically save as a new version
      const res = await updateProjectAPI(project.id, { code: data.generatedCode });
      setProject(res.project);
      setVersions(res.versions);
      const latestVer = res.versions[res.versions.length - 1];
      setCurrentVersion(latestVer.version);
    } catch (err) {
      alert(`Refinement failed: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-hidden font-sans">
      {/* Top Project Sub-Header */}
      <div className="h-10 px-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToHistory}
            className="p-1 text-zinc-400 hover:text-zinc-100 transition"
            title="Back to History"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              {project.name}
              <span className="text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-widest bg-zinc-900 text-zinc-400 border border-zinc-800">
                {project.framework}
              </span>
            </h1>
          </div>
        </div>

        {/* Version dropdown */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-zinc-400">
            <GitCommit className="w-3.5 h-3.5 text-zinc-400" />
            <span className="uppercase tracking-wider">Version:</span>
            <select
              value={currentVersion || 1}
              onChange={(e) => {
                const targetVer = versions.find((v) => v.version === Number(e.target.value));
                if (targetVer) handleSelectVersion(targetVer);
              }}
              className="bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-200 focus:outline-none font-mono"
            >
              {versions.map((v) => (
                <option key={v.id || v.version} value={v.version}>
                  v{v.version} ({new Date(v.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left Drawer / Screenshot Thumbnail Preview (Desktop: 3 cols) */}
        <div className="lg:col-span-3 h-full min-h-[250px] bg-zinc-950 border-r border-zinc-800 p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
              Source Screenshot
            </h3>
            <div className="border border-zinc-800 bg-zinc-950 p-2 flex items-center justify-center max-h-[220px]">
              <img
                src={project.original_image}
                alt={project.name}
                className="max-h-[200px] w-auto object-contain"
              />
            </div>
          </div>

          {/* Versions History List */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-zinc-400" />
              Version History ({versions.length})
            </h3>
            <div className="space-y-1">
              {versions.map((ver) => (
                <button
                  key={ver.id || ver.version}
                  onClick={() => handleSelectVersion(ver)}
                  className={`w-full text-left p-2 text-xs font-mono transition flex items-center justify-between border ${
                    currentVersion === ver.version
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100 font-bold'
                      : 'bg-zinc-950 hover:bg-zinc-900/50 text-zinc-400 border-transparent'
                  }`}
                >
                  <span className="uppercase tracking-wider">Version {ver.version}</span>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(ver.created_at).toLocaleDateString('id-ID')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Code Editor (Desktop: 4 cols) */}
        <div className="lg:col-span-4 h-full min-h-[400px]">
          <CodeEditor
            code={code}
            onChangeCode={setCode}
            framework={project.framework}
            onSave={handleSaveVersion}
            onExport={handleExportZip}
            isSaving={isSaving}
          />
        </div>

        {/* Right: Live Preview (Desktop: 5 cols) */}
        <div className="lg:col-span-5 h-full min-h-[450px]">
          <LivePreview
            code={code}
            framework={project.framework}
            originalImage={project.original_image}
            onRefineUI={handleRefineUI}
            isRefining={isRefining}
          />
        </div>
      </div>
    </div>
  );
}
