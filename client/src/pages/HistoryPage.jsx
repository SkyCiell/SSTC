import React, { useState, useEffect } from 'react';
import { getProjectsAPI, deleteProjectAPI } from '../services/api';
import { History, Search, Trash2, ExternalLink, Calendar, Code, AlertCircle } from 'lucide-react';

export default function HistoryPage({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectsAPI();
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load project history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProjectAPI(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-lg font-mono font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              Project Archive
            </h1>
            <p className="text-xs text-zinc-400 font-normal mt-1">
              Reopen saved UI screenshot generation projects and version history.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-zinc-950 border border-zinc-800 p-2 pl-8 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition"
            />
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="py-20 text-center text-zinc-500 text-xs font-mono">
            Loading project archive...
          </div>
        ) : error ? (
          <div className="p-4 bg-zinc-900 border border-red-500/40 font-mono text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center space-y-2 font-sans">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">No saved projects found</p>
            <p className="text-xs text-zinc-500 font-normal">
              Generate code from a screenshot and click save to populate history.
            </p>
          </div>
        ) : (
          /* Project Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer group flex flex-col justify-between"
              >
                {/* Thumbnail Image */}
                <div className="h-40 bg-zinc-950 border-b border-zinc-800 overflow-hidden flex items-center justify-center relative p-2">
                  <img
                    src={proj.original_image}
                    alt={proj.name}
                    className="max-h-full w-auto object-contain"
                  />
                  <span className="absolute top-2 right-2 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {proj.framework}
                  </span>
                </div>

                {/* Project Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100 truncate group-hover:text-white transition">
                      {proj.name}
                    </h3>
                    <div className="flex items-center space-x-3 text-[11px] font-mono text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(proj.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                      Open Project
                    </button>
                    <button
                      onClick={(e) => handleDelete(proj.id, e)}
                      className="text-[11px] font-mono text-zinc-500 hover:text-red-400 p-1 transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
