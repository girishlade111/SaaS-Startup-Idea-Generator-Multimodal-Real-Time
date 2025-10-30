import React, { useState, useEffect } from 'react';
import type { Idea } from '../types';
import { DownloadIcon, StarIcon, TargetIcon, CheckCircleIcon, ThumbsUpIcon, ThumbsDownIcon, Wand2Icon, TwitterIcon, LinkedinIcon, BookmarkIcon, CheckIcon } from './IconComponents';

const ScoreBar: React.FC<{ score: number; max: number; label: string; color: string }> = ({ score, max, label, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-neutral-300">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{score}{max === 100 ? '%' : `/${max}`}</span>
    </div>
    <div className="w-full bg-neutral-700/50 rounded-full h-1.5">
      <div className={`bg-gradient-to-r ${color === 'text-green-400' ? 'from-green-500 to-emerald-500' : 'from-sky-500 to-cyan-500'} h-1.5 rounded-full`} style={{ width: `${(score / max) * 100}%` }}></div>
    </div>
  </div>
);

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block bg-neutral-800 text-neutral-300 text-xs font-medium px-2.5 py-1 rounded-md border border-neutral-700">
        {children}
    </span>
);

const ActionButton: React.FC<{ children: React.ReactNode; onClick?: () => void; 'aria-label': string; disabled?: boolean; }> = ({ children, onClick, 'aria-label': ariaLabel, disabled = false }) => (
  <button 
    onClick={onClick}
    aria-label={ariaLabel}
    disabled={disabled}
    className="p-2 bg-neutral-800 rounded-lg hover:enabled:bg-neutral-700/80 border border-neutral-700 transition-colors disabled:cursor-not-allowed"
  >
    {children}
  </button>
);


const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
  <div className={className}>
    <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2 text-sm">
      {icon}
      {title}
    </h4>
    {children}
  </div>
);

interface IdeaCardProps {
  idea: Idea;
  onGenerateLogo: (ideaId: string) => void;
  isLogoLoading: boolean;
  onSave?: (idea: Idea) => void;
  isSaved?: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onGenerateLogo, isLogoLoading, onSave, isSaved }) => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackStorageKey = `feedback_${idea.id}`;
  const hasGeneratedLogo = idea.logoIdeaUrl && idea.logoIdeaUrl.startsWith('data:image');

  useEffect(() => {
    const savedFeedback = localStorage.getItem(feedbackStorageKey);
    if (savedFeedback) {
      setIsSubmitted(true);
    }
  }, [feedbackStorageKey]);

  const handleRating = (newRating: 'up' | 'down') => {
    setRating(currentRating => currentRating === newRating ? null : newRating);
  };

  const handleSubmit = () => {
    if (!rating) return;
    
    const feedbackData = {
      rating,
      text: feedbackText,
    };
    
    localStorage.setItem(feedbackStorageKey, JSON.stringify(feedbackData));
    setIsSubmitted(true);
  };
  
  const handleShare = (platform: 'twitter' | 'linkedin') => {
    const text = `Check out this AI-generated SaaS idea: "${idea.name}" - ${idea.tagline}. #SaaS #AI #Startup`;
    const appUrl = 'https://ladestack.in'; // Using a placeholder URL

    let url = '';

    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`;
    } else if (platform === 'linkedin') {
      // Using the older shareArticle syntax for better compatibility
      url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent(`AI SaaS Idea: ${idea.name}`)}&summary=${encodeURIComponent(text)}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-6 transition-all duration-300 hover:border-brand/50 hover:shadow-glow-md">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="relative w-20 h-20 flex-shrink-0">
          <img src={idea.logoIdeaUrl} alt={`${idea.name} logo idea`} className="w-20 h-20 rounded-lg object-cover border-2 border-neutral-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-neutral-100">{idea.name}</h3>
          <p className="text-brand-light font-medium">{idea.tagline}</p>
          {!hasGeneratedLogo && (
              <button 
                onClick={() => onGenerateLogo(idea.id)} 
                disabled={isLogoLoading}
                className="mt-3 flex items-center gap-2 text-sm font-semibold bg-neutral-800 text-neutral-200 px-3 py-1.5 rounded-md border border-neutral-700 hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isLogoLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2Icon className="w-4 h-4" />
                    Generate Logo
                  </>
                )}
              </button>
          )}
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <ActionButton onClick={() => handleShare('twitter')} aria-label="Share on Twitter">
            <TwitterIcon className="w-4 h-4 text-neutral-300" />
          </ActionButton>
          <ActionButton onClick={() => handleShare('linkedin')} aria-label="Share on LinkedIn">
            <LinkedinIcon className="w-4 h-4 text-neutral-300" />
          </ActionButton>
           {onSave && (
            isSaved ? (
              <ActionButton aria-label="Idea saved" disabled>
                <CheckIcon className="w-4 h-4 text-green-400" />
              </ActionButton>
            ) : (
              <ActionButton onClick={() => onSave(idea)} aria-label="Save idea">
                <BookmarkIcon className="w-4 h-4 text-neutral-300" />
              </ActionButton>
            )
          )}
          <ActionButton aria-label="Download idea">
            <DownloadIcon className="w-4 h-4 text-neutral-300" />
          </ActionButton>
        </div>
      </div>
      
      <p className="mt-4 text-neutral-300 text-sm leading-relaxed">{idea.description}</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 bg-neutral-800/30 p-4 rounded-lg border border-neutral-700/60">
           <ScoreBar score={idea.marketValidationScore} max={100} label="Market Validation" color="text-green-400" />
           <ScoreBar score={idea.feasibilityScore} max={10} label="Feasibility Score" color="text-sky-400" />
        </div>

        <div className="bg-neutral-800/30 p-4 rounded-lg border border-neutral-700/60">
          <Section 
            title="Target Problem" 
            icon={<TargetIcon className="w-5 h-5 text-neutral-400"/>}
          >
            <p className="text-xs text-neutral-400 leading-snug">{idea.targetProblem}</p>
          </Section>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section 
          title="Core Features" 
          icon={<CheckCircleIcon className="w-5 h-5 text-neutral-400"/>}
        >
          <div className="flex flex-wrap gap-2">
            {idea.coreFeatures?.map(feature => <Tag key={feature}>{feature}</Tag>)}
          </div>
        </Section>
        
        <Section 
          title="Competitive Landscape"
          icon={<StarIcon className="w-5 h-5 text-neutral-400"/>}
        >
          <div className="space-y-3">
            {idea.competitiveLandscape?.map(comp => (
              comp && <div key={comp.player} className="bg-neutral-800/30 p-3 rounded-lg border border-neutral-700/50">
                <h5 className="font-semibold text-neutral-200 text-sm">{comp.player}</h5>
                
                {/* Details section, shown only if there's content */}
                {(comp.pricing || comp.marketShare || (comp.keyDifferentiators && comp.keyDifferentiators.length > 0)) && (
                  <div className="mt-2 border-t border-neutral-700/50 pt-2 space-y-3">
                    
                    {/* Pricing and Market Share */}
                    {(comp.pricing || comp.marketShare) && (
                      <div>
                        <div className="flex flex-col gap-1">
                          {comp.pricing && (
                            <p className="text-xs text-neutral-400">
                              <span className="font-medium text-neutral-300">Pricing: </span>{comp.pricing}
                            </p>
                          )}
                          {comp.marketShare && (
                            <p className="text-xs text-neutral-400">
                              <span className="font-medium text-neutral-300">Market Share: </span>{comp.marketShare}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Key Differentiators Sub-section */}
                    {comp.keyDifferentiators && comp.keyDifferentiators.length > 0 && (
                      <div>
                        <h6 className="text-xs font-semibold text-neutral-300 mb-1">Key Differentiators:</h6>
                        <ul className="list-disc list-inside space-y-1 pl-1">
                        {comp.keyDifferentiators.map((differentiator, index) => (
                            <li key={index} className="text-xs text-neutral-400 leading-snug">
                              {differentiator}
                            </li>
                        ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>
      
      <div className="mt-6 pt-6 border-t border-neutral-800/60">
        {isSubmitted ? (
          <div className="text-center p-4 bg-neutral-800/40 rounded-lg">
            <h5 className="font-semibold text-green-400">Thank you for your feedback!</h5>
            <p className="text-sm text-neutral-400 mt-1">Your insights help us improve the AI.</p>
          </div>
        ) : (
          <div>
            <h4 className="font-semibold text-neutral-200 text-sm text-center mb-4">Was this idea helpful?</h4>
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => handleRating('up')}
                className={`p-3 rounded-full transition-all duration-200 border ${rating === 'up' ? 'bg-green-500/20 border-green-500 text-green-400 scale-110' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}
                aria-pressed={rating === 'up'}
                aria-label="Good idea"
              >
                <ThumbsUpIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleRating('down')}
                className={`p-3 rounded-full transition-all duration-200 border ${rating === 'down' ? 'bg-red-500/20 border-red-500 text-red-400 scale-110' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}
                aria-pressed={rating === 'down'}
                aria-label="Bad idea"
              >
                <ThumbsDownIcon className="w-5 h-5" />
              </button>
            </div>
            
            {rating && (
              <div className="mt-4 animate-[fadeIn_0.5s_ease-in-out]">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Optional: Tell us more..."
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                ></textarea>
                <button
                  onClick={handleSubmit}
                  className="w-full mt-2 bg-brand text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};