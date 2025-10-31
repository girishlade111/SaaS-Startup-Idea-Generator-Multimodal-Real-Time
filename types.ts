
export interface Idea {
  id: string;
  name: string;
  tagline: string;
  description: string;
  targetProblem: string;
  marketSize: string;
  coreFeatures: string[];
  techStack: string[];
  revenueModel: string;
  pricingStrategy: string;
  competitiveLandscape: {
    player: string;
    pricing?: string;
    marketShare?: string;
    keyDifferentiators: string[];
  }[];
  feasibilityScore: number;
  marketValidationScore: number;
  launchStrategy: string[];
  logoIdeaUrl?: string;
  potentialRisks: {
    risk: string;
    mitigation: string;
  }[];
  fundingStage: string;
  fundingRaised: string;
  keyInvestors: string[];
}

export interface FormState {
  textInput: string;
  videoFile: File | null;
  imageFile: File | null;
  industry: string;
  targetAudience: string;
  searchQuery: string;
  thinkingMode: boolean;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
    snippets?: {
      uri?: string;
      title?: string;
      content?: string;
    }[];
  };
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: string;
    id: string;
}


export type Page = 'generator' | 'dashboard' | 'pricing' | 'about';
