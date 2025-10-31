
import React, { useState, useEffect, useRef } from 'react';
import type { Idea } from '../types';
import { geminiService } from '../services/geminiService';
import { DownloadIcon, StarIcon, TargetIcon, CheckCircleIcon, ThumbsUpIcon, ThumbsDownIcon, Wand2Icon, TwitterIcon, LinkedinIcon, BookmarkIcon, CheckIcon, RefreshCwIcon, DollarSignIcon, RocketIcon, ShieldAlertIcon, BriefcaseIcon, Volume2Icon, VolumeXIcon, MessageSquareTextIcon } from './IconComponents';

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

// --- Audio Utility Functions ---
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


interface IdeaCardProps {
  idea: Idea;
  onGenerateLogo: (ideaId: string, prompt?: string) => void;
  isLogoLoading: boolean;
  onSave?: (idea: Idea) => void;
  isSaved?: boolean;
  onStartChat: (idea: Idea) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onGenerateLogo, isLogoLoading, onSave, isSaved, onStartChat }) => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const feedbackStorageKey = `feedback_${idea.id}`;
  const hasGeneratedLogo = idea.logoIdeaUrl && idea.logoIdeaUrl.startsWith('data:image');
  
  const stopAudio = () => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const handleReadAloud = async () => {
    if (isSpeaking) {
        stopAudio();
        return;
    }

    try {
        setIsSpeaking(true);
        const textToRead = `SaaS Idea: ${idea.name}. Tagline: ${idea.tagline}. Description: ${idea.description}`;
        const base64Audio = await geminiService.generateSpeech(textToRead);

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            // FIX: Cast window to any to access vendor-prefixed webkitAudioContext for broader browser support.
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioContext = audioContextRef.current;
        
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
            setIsSpeaking(false);
            audioSourceRef.current = null;
        };
        source.start();
        audioSourceRef.current = source;
    } catch (error) {
        console.error("Failed to play audio:", error);
        setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const savedFeedback = localStorage.getItem(feedbackStorageKey);
    if (savedFeedback) {
      setIsSubmitted(true);
    }
    
    // Cleanup audio on component unmount
    return () => {
        stopAudio();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };
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

  const handleRegenerateSubmit = () => {
    onGenerateLogo(idea.id, regeneratePrompt);
    setIsRegenerating(false);
    setRegeneratePrompt('');
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
          <div className="mt-3">
            {!hasGeneratedLogo ? (
              <button 
                onClick={() => onGenerateLogo(idea.id)} 
                disabled={isLogoLoading}
                className="flex items-center gap-2 text-sm font-semibold bg-neutral-800 text-neutral-200 px-3 py-1.5 rounded-md border border-neutral-700 hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
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
            ) : !isRegenerating ? (
              <button 
                onClick={() => setIsRegenerating(true)} 
                disabled={isLogoLoading}
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-50"
              >
                <RefreshCwIcon className="w-3 h-3" />
                Regenerate
              </button>
            ) : (
              <div className="space-y-2 animate-[fadeIn_0.3s_ease-in-out] max-w-sm">
                <input
                  type="text"
                  value={regeneratePrompt}
                  onChange={(e) => setRegeneratePrompt(e.target.value)}
                  placeholder="e.g., 'blue color, abstract style'"
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-md px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all"
                  aria-label="Logo regeneration prompt"
                />
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleRegenerateSubmit} 
                    disabled={isLogoLoading}
                    className="flex items-center justify-center text-xs font-semibold bg-brand text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait w-28"
                  >
                    {isLogoLoading ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : 'Generate New'}
                  </button>
                  <button 
                    onClick={() => setIsRegenerating(false)} 
                    disabled={isLogoLoading}
                    className="text-xs font-semibold text-neutral-300 px-3 py-1.5 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <ActionButton onClick={() => onStartChat(idea)} aria-label="Discuss with AI Mentor">
            <MessageSquareTextIcon className="w-4 h-4 text-neutral-300" />
          </ActionButton>
          <ActionButton onClick={handleReadAloud} aria-label={isSpeaking ? "Stop reading" : "Read aloud"}>
            {isSpeaking ? <VolumeXIcon className="w-4 h-4 text-red-400" /> : <Volume2Icon className="w-4 h-4 text-neutral-300" />}
          </ActionButton>
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
            <div>
                <ScoreBar score={idea.marketValidationScore} max={100} label="Market Validation" color="text-green-400" />
                {idea.marketValidationRationale && (
                    <p className="text-xs text-neutral-400 mt-1.5 pl-1 italic">"{idea.marketValidationRationale}"</p>
                )}
            </div>
            <div>
                <ScoreBar score={idea.feasibilityScore} max={10} label="Feasibility Score" color="text-sky-400" />
                {idea.feasibilityRationale && (
                    <p className="text-xs text-neutral-400 mt-1.5 pl-1 italic">"{idea.feasibilityRationale}"</p>
                )}
            </div>
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

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Section 
            title="Monetization" 
            icon={<DollarSignIcon className="w-5 h-5 text-neutral-400"/>}
          >
            <div className="space-y-2">
                <p className="text-xs text-neutral-400"><span className="font-semibold text-neutral-300 block">Revenue Model:</span> {idea.revenueModel}</p>
                <p className="text-xs text-neutral-400"><span className="font-semibold text-neutral-300 block">Pricing Strategy:</span> {idea.pricingStrategy}</p>
            </div>
          </Section>
          <Section 
            title="Go-to-Market Plan"
            icon={<RocketIcon className="w-5 h-5 text-neutral-400"/>}
          >
            <ol className="list-decimal list-inside space-y-1">
              {idea.launchStrategy?.map(step => (
                <li key={step} className="text-xs text-neutral-400">{step}</li>
              ))}
            </ol>
          </Section>
           <Section 
            title="Potential Risks"
            icon={<ShieldAlertIcon className="w-5 h-5 text-neutral-400"/>}
          >
             <div className="space-y-3">
              {idea.potentialRisks?.map(item => (
                <div key={item.risk}>
                  <h6 className="text-xs font-semibold text-neutral-300">{item.risk}</h6>
                  <p className="text-xs text-neutral-400 pl-2 border-l-2 border-neutral-700 ml-1 mt-1">
                    <span className="font-medium text-neutral-500">Mitigation: </span>{item.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </Section>
      </div>
      
      <div className="mt-6">
        <Section
            title="Funding & Investment"
            icon={<BriefcaseIcon className="w-5 h-5 text-neutral-400"/>}
        >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/60">
                <div className="lg:col-span-1">
                    <h6 className="text-xs font-semibold text-neutral-300">Current Funding Stage</h6>
                    <p className="text-sm text-neutral-200 mt-1">{idea.fundingStage}</p>
                </div>
                <div className="lg:col-span-1">
                    <h6 className="text-xs font-semibold text-neutral-300">Total Funding Raised</h6>
                    <p className="text-sm text-neutral-200 mt-1">{idea.fundingRaised}</p>
                </div>
                <div className="col-span-2">
                    <h6 className="text-xs font-semibold text-neutral-300">Key Investors</h6>
                    <div className="flex flex-wrap gap-2 mt-2">
                         {idea.keyInvestors?.map(investor => <Tag key={investor}>{investor}</Tag>)}
                    </div>
                </div>
            </div>
        </Section>
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