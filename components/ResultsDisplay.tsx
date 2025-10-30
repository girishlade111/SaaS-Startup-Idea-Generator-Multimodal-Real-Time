import React from 'react';
import type { Idea, GroundingSource } from '../types';
import { IdeaCard } from './IdeaCard';
import { Loader } from './Loader';
import { SparklesIcon, AlertTriangleIcon, RefreshCwIcon, GlobeIcon } from './IconComponents';

interface ResultsDisplayProps {
  ideas: Idea[];
  sources: GroundingSource[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onGenerateLogo: (ideaId: string) => void;
  logoLoadingId: string | null;
}

const SourcesDisplay: React.FC<{ sources: GroundingSource[] }> = ({ sources }) => {
  const webSources = sources.filter(s => s.web);

  if (webSources.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-6">
      <h4 className="font-semibold text-neutral-200 mb-4 flex items-center gap-2 text-sm">
        <GlobeIcon className="w-5 h-5 text-neutral-400" />
        Powered by Google Search
      </h4>
      <div className="space-y-4">
        {webSources.map((source, index) => (
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
    </div>
  )
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ ideas, sources, isLoading, error, onRetry, onGenerateLogo, logoLoadingId }) => {
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
      <div className="space-y-6">
        {ideas.map((idea) => (
          <IdeaCard 
            key={idea.id} 
            idea={idea} 
            onGenerateLogo={onGenerateLogo}
            isLogoLoading={logoLoadingId === idea.id}
          />
        ))}
      </div>
      <SourcesDisplay sources={sources} />
    </div>
  );
};