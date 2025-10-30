import React from 'react';
import { DashboardIdeaCard } from './DashboardIdeaCard';
import { geminiService } from '../services/geminiService';
import type { Idea } from '../types';

export const DashboardPage: React.FC = () => {
  const [savedIdeas, setSavedIdeas] = React.useState<Idea[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [logoLoadingId, setLogoLoadingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const ideasFromStorage = localStorage.getItem('savedSaaSIdeas');
      if (ideasFromStorage) {
        setSavedIdeas(JSON.parse(ideasFromStorage));
      }
    } catch (e) {
      console.error("Failed to load or parse ideas from localStorage", e);
    }
    setIsLoading(false);
  }, []);

  const handleGenerateLogo = async (ideaId: string, prompt?: string) => {
    setLogoLoadingId(ideaId);
    try {
      const ideaToUpdate = savedIdeas.find(i => i.id === ideaId);
      if (!ideaToUpdate) throw new Error("Idea not found");

      const newLogoUrl = await geminiService.generateLogo(ideaToUpdate, prompt);
      
      const updatedIdeas = savedIdeas.map(idea =>
        idea.id === ideaId ? { ...idea, logoIdeaUrl: newLogoUrl } : idea
      );

      setSavedIdeas(updatedIdeas);
      localStorage.setItem('savedSaaSIdeas', JSON.stringify(updatedIdeas));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(`Failed to generate logo: ${errorMessage}`);
    } finally {
      setLogoLoadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-100">My Dashboard</h1>
        <p className="mt-3 text-lg text-neutral-400">Review, manage, and build upon your saved SaaS ideas.</p>
      </div>
      
      {isLoading ? (
        <p className="text-center text-neutral-400">Loading saved ideas...</p>
      ) : savedIdeas.length > 0 ? (
        <div className="space-y-6">
          {savedIdeas.map(idea => (
            <DashboardIdeaCard 
              key={idea.id} 
              idea={idea} 
              onGenerateLogo={handleGenerateLogo}
              isLogoLoading={logoLoadingId === idea.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center bg-neutral-900/50 border border-neutral-800/60 rounded-xl py-20 px-6">
          <h3 className="text-2xl font-bold text-neutral-200">No Saved Ideas Yet</h3>
          <p className="text-neutral-400 mt-2">Go to the generator to create and save your first SaaS concept!</p>
        </div>
      )}
    </div>
  );
};
