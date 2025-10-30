import React from 'react';
import { IdeaCard } from './IdeaCard';
import { geminiService } from '../services/geminiService';
import type { Idea, FormState } from '../types';

export const DashboardPage: React.FC = () => {
  // In a real app, this data would come from a user-specific API call.
  // We're using a mock service to simulate having saved ideas.
  const [savedIdeas, setSavedIdeas] = React.useState<Idea[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [logoLoadingId, setLogoLoadingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // FIX: Provide mock form data to satisfy the function signature for this mock data generation,
    // and correctly access the `ideas` array from the response object.
    const mockFormData: FormState = {
      textInput: 'AI for social media managers',
      videoFile: null,
      imageFile: null,
      industry: 'Social Media Marketing',
      targetAudience: 'Marketing agencies',
      searchQuery: 'latest trends in social media marketing tools'
    };
    geminiService.generateSaaSIdeas(mockFormData).then(response => {
      // Simulate having only one saved idea for variety
      setSavedIdeas(response.ideas.slice(0, 1)); 
      setIsLoading(false);
    });
  }, []);

  const handleGenerateLogo = async (ideaId: string) => {
    setLogoLoadingId(ideaId);
    try {
      const ideaToUpdate = savedIdeas.find(i => i.id === ideaId);
      if (!ideaToUpdate) throw new Error("Idea not found");

      const newLogoUrl = await geminiService.generateLogo(ideaToUpdate);
      setSavedIdeas(currentIdeas =>
        currentIdeas.map(idea =>
          idea.id === ideaId ? { ...idea, logoIdeaUrl: newLogoUrl } : idea
        )
      );
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
            // FIX: Pass `onGenerateLogo` and `isLogoLoading` props to `IdeaCard` to enable logo generation functionality on the dashboard.
            <IdeaCard 
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
