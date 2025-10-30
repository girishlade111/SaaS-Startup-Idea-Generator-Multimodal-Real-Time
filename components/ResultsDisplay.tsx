
import React, { useState, useMemo } from 'react';
import type { Idea, GroundingSource } from '../types';
import { IdeaCard } from './IdeaCard';
import { Loader } from './Loader';
import { SparklesIcon, AlertTriangleIcon, RefreshCwIcon, GlobeIcon, SearchIcon, DownloadIcon } from './IconComponents';

interface ResultsDisplayProps {
  ideas: Idea[];
  sources: GroundingSource[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onGenerateLogo: (ideaId: string) => void;
  logoLoadingId: string | null;
  onStartChat: (idea: Idea) => void;
}

const SourcesDisplay: React.FC<{ sources: GroundingSource[] }> = ({ sources }) => {
  const [filter, setFilter] = useState('');
  const webSources = sources.filter(s => s.web);

  if (webSources.length === 0) {
    return null;
  }

  const filteredSources = webSources.filter(source => {
    if (!source.web) return false;
    const query = filter.toLowerCase();
    const titleMatch = source.web.title?.toLowerCase().includes(query);
    const snippetMatch = source.web.snippets?.some(snippet =>
      snippet.content?.toLowerCase().includes(query)
    );
    return titleMatch || snippetMatch;
  });

  return (
    <div className="mt-8 bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
        <h4 className="font-semibold text-neutral-200 flex items-center gap-2 text-sm">
          <GlobeIcon className="w-5 h-5 text-neutral-400" />
          Powered by Google Search
        </h4>
        <div className="relative">
           <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
           <input
             type="text"
             placeholder="Filter sources..."
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="w-full sm:w-64 bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
             aria-label="Filter search sources"
           />
        </div>
      </div>

      {filteredSources.length > 0 ? (
        <div className="space-y-4">
          {filteredSources.map((source, index) => (
            source.web && (
              <div key={index} className="border-t border-neutral-800 pt-4 first:pt-0 first:border-t-0">
                <a
                  href={source.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-brand-light hover:text-brand transition-colors block truncate"
                >
                  {source.web.title || source.web.uri}
                </a>
                {source.web.snippets?.map((snippet, sIndex) => (
                  snippet.content && (
                    <blockquote key={sIndex} className="mt-2 pl-3 border-l-2 border-neutral-700">
                      <p className="text-xs text-neutral-400 italic">
                        "...{snippet.content}..."
                      </p>
                    </blockquote>
                  )
                ))}
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-t border-neutral-800">
          <p className="text-neutral-400 text-sm">No sources found matching your filter.</p>
        </div>
      )}
    </div>
  )
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ ideas, sources, isLoading, error, onRetry, onGenerateLogo, logoLoadingId, onStartChat }) => {
  const [savedIdeas, setSavedIdeas] = useState<Idea[]>(() => {
    try {
      const saved = localStorage.getItem('savedSaaSIdeas');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved ideas from localStorage", e);
      return [];
    }
  });

  const savedIdeaIds = useMemo(() => new Set(savedIdeas.map(i => i.id)), [savedIdeas]);

  const handleSaveIdea = (ideaToSave: Idea) => {
    if (savedIdeaIds.has(ideaToSave.id)) return;

    const updatedSavedIdeas = [...savedIdeas, ideaToSave];
    localStorage.setItem('savedSaaSIdeas', JSON.stringify(updatedSavedIdeas));
    setSavedIdeas(updatedSavedIdeas);
  };

  const handleExport = () => {
    if (!ideas || ideas.length === 0) return;

    const dataStr = JSON.stringify(ideas, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = 'saas-ideas.json';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };
  
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-neutral-900/50 border border-red-500/50 rounded-xl p-8 text-center">
        <div className="p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/30">
          <AlertTriangleIcon className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-100">Something went wrong</h3>
        <p className="text-neutral-400 mt-2 max-w-sm">{error}</p>
        <button
          onClick={onRetry}
          className="mt-6 flex items-center justify-center gap-2 bg-neutral-700 text-neutral-100 font-semibold py-2 px-5 rounded-lg hover:bg-neutral-600 transition-colors"
        >
          <RefreshCwIcon className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (ideas.length === 0 && !isLoading) {
    return (
        <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-8 text-center">
          <div className="p-4 bg-neutral-800 rounded-full mb-4 border border-neutral-700">
            <SparklesIcon className="w-8 h-8 text-brand-light" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-100">Generation Complete!</h3>
          <p className="text-neutral-400 mt-2">Your web-validated SaaS concepts are ready.</p>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 text-sm font-semibold bg-neutral-800 text-neutral-200 px-4 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-700 transition-colors"
          aria-label="Export all ideas to JSON"
        >
          <DownloadIcon className="w-4 h-4" />
          Export All
        </button>
      </div>
      <div className="space-y-6">
        {ideas.map((idea) => (
          <IdeaCard 
            key={idea.id} 
            idea={idea} 
            onGenerateLogo={onGenerateLogo}
            isLogoLoading={logoLoadingId === idea.id}
            onSave={handleSaveIdea}
            isSaved={savedIdeaIds.has(idea.id)}
            onStartChat={onStartChat}
          />
        ))}
      </div>
      <SourcesDisplay sources={sources} />
    </div>
  );
};
