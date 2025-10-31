
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { GeneratorForm } from './components/GeneratorForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { DashboardPage } from './components/DashboardPage';
import { PricingPage } from './components/PricingPage';
import { AboutPage } from './components/AboutPage';
import { ChatWidget } from './components/ChatWidget';
import { geminiService } from './services/geminiService';
import type { Idea, FormState, Page, GroundingSource } from './types';
import { SparklesIcon, InstagramIcon, LinkedinIcon, GithubIcon, CodepenIcon, MailIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [lastFormData, setLastFormData] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoLoadingId, setLogoLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('generator');
  const [initialChatMessage, setInitialChatMessage] = useState<string | null>(null);

  const handleGenerateIdeas = useCallback(async (formData: FormState) => {
    setLastFormData(formData);
    setIsLoading(true);
    setError(null);
    setIsGenerated(true);
    setIdeas([]);
    setSources([]);

    try {
      console.log('Generating ideas with form data:', formData);
      const { ideas: generatedIdeas, sources: generatedSources } = await geminiService.generateSaaSIdeas(formData);
      setIdeas(generatedIdeas);
      setSources(generatedSources);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate ideas. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleGenerateLogo = async (ideaId: string, prompt?: string) => {
    setLogoLoadingId(ideaId);
    try {
      const ideaToUpdate = ideas.find(i => i.id === ideaId);
      if (!ideaToUpdate) throw new Error("Idea not found");

      const newLogoUrl = await geminiService.generateLogo(ideaToUpdate, prompt);
      setIdeas(currentIdeas =>
        currentIdeas.map(idea =>
          idea.id === ideaId ? { ...idea, logoIdeaUrl: newLogoUrl } : idea
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      // For simplicity, we'll just log the error. A more robust app might show a toast notification.
      console.error(`Failed to generate logo: ${errorMessage}`);
    } finally {
      setLogoLoadingId(null);
    }
  };


  const handleReset = () => {
    setIsGenerated(false);
    setIdeas([]);
    setSources([]);
    setError(null);
  };

  const handleRetry = () => {
    if (lastFormData) {
      handleGenerateIdeas(lastFormData);
    }
  };
  
  const handleStartChatWithIdea = (idea: Idea) => {
    const message = `Let's discuss the SaaS idea "${idea.name}". Here is the description: "${idea.description}". What are the first steps I should take to validate this idea?`;
    setInitialChatMessage(message);
  };

  const clearInitialChatMessage = () => {
    setInitialChatMessage(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'pricing':
        return <PricingPage />;
      case 'about':
        return <AboutPage onNavigate={setCurrentPage} />;
      case 'generator':
      default:
        return (
          <>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-400 leading-tight tracking-tight">
                AI SaaS Idea Generator
              </h1>
              <p className="mt-4 text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
                Fuse your vision with real-time market data. Generate, validate, and refine your next big SaaS idea using multimodal AI.
              </p>
            </div>
            <div className="mt-16 max-w-6xl mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className={`lg:col-span-4 transition-opacity duration-500`}>
                  <GeneratorForm onSubmit={handleGenerateIdeas} isLoading={isLoading} isGenerated={isGenerated} onReset={handleReset} />
                </div>
                <div className={`lg:col-span-8 transition-all duration-500`}>
                  {isGenerated ? (
                     <ResultsDisplay 
                        ideas={ideas} 
                        sources={sources} 
                        isLoading={isLoading} 
                        error={error} 
                        onRetry={handleRetry}
                        onGenerateLogo={handleGenerateLogo}
                        logoLoadingId={logoLoadingId}
                        onStartChat={handleStartChatWithIdea}
                      />
                  ) : (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-8 text-center">
                       <div className="p-4 bg-neutral-800 rounded-full mb-4 border border-neutral-700">
                        <SparklesIcon className="w-8 h-8 text-brand-light" />
                      </div>
                      <h3 className="text-2xl font-bold text-neutral-100">Your Ideas Await</h3>
                      <p className="text-neutral-400 mt-2 max-w-sm">Fill out the form to generate and validate your SaaS concepts. The future is just a click away.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans flex flex-col">
       <div 
        className="absolute inset-0 -z-10 h-full w-full"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.15), rgba(255, 255, 255, 0))'
        }}
      />
      
      <Header activePage={currentPage} onNavigate={setCurrentPage} />

      <main className="container mx-auto px-4 py-8 md:py-16 flex-grow">
        {renderPage()}
      </main>

      <footer className="w-full mt-24 py-8 border-t border-neutral-800/60">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="hover:text-brand-light transition-colors">Lade Stack</a>. Built for SaaS Entrepreneurs.
          </p>
          <div className="flex items-center gap-5">
            <a href="https://www.instagram.com/girish_lade_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-neutral-500 hover:text-brand-light transition-colors">
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/girish-lade-075bba201/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-neutral-500 hover:text-brand-light transition-colors">
              <LinkedinIcon className="w-5 h-5" />
            </a>
            <a href="https://github.com/girishlade111" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-neutral-500 hover:text-brand-light transition-colors">
              <GithubIcon className="w-5 h-5" />
            </a>
            <a href="https://codepen.io/Girish-Lade-the-looper" target="_blank" rel="noopener noreferrer" aria-label="CodePen" className="text-neutral-500 hover:text-brand-light transition-colors">
              <CodepenIcon className="w-5 h-5" />
            </a>
            <a href="mailto:girishlade111@gmail.com" aria-label="Email" className="text-neutral-500 hover:text-brand-light transition-colors">
              <MailIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>

      <ChatWidget 
        initialMessage={initialChatMessage}
        onInitialMessageSent={clearInitialChatMessage}
      />
    </div>
  );
};

export default App;
