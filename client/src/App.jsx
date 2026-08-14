import React, { useState } from 'react';
import Navbar from './components/Navbar';
import GeneratorPage from './pages/GeneratorPage';
import HistoryPage from './pages/HistoryPage';
import EditorPage from './pages/EditorPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'history' | 'editor'
  const [currentProject, setCurrentProject] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleSelectProjectFromHistory = (id) => {
    setSelectedProjectId(id);
    setActiveTab('editor');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProject={currentProject}
      />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeTab === 'generator' && (
          <GeneratorPage
            setCurrentProject={(proj) => {
              setCurrentProject(proj);
              setSelectedProjectId(proj.id);
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage onSelectProject={handleSelectProjectFromHistory} />
        )}

        {activeTab === 'editor' && (
          <EditorPage
            projectId={selectedProjectId}
            onBackToHistory={() => setActiveTab('history')}
          />
        )}
      </main>
    </div>
  );
}
