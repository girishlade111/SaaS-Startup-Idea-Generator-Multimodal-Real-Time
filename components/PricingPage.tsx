import React from 'react';
import { CheckIcon } from './IconComponents';

const PricingCard: React.FC<{
  plan: string;
  price: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
}> = ({ plan, price, description, features, isFeatured = false }) => {
  const cardClasses = `bg-neutral-900/50 border rounded-xl p-8 flex flex-col h-full relative overflow-hidden transition-all duration-300 ${isFeatured ? 'border-brand/50 shadow-glow-md' : 'border-neutral-800/60'}`;
  const buttonClasses = `w-full mt-auto font-semibold py-3 px-4 rounded-lg transition-opacity ${isFeatured ? 'bg-gradient-to-r from-brand to-brand/80 text-white hover:opacity-90' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'}`;
  
  return (
    <div className="h-full">
      <div className={cardClasses}>
        {isFeatured && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </div>
        )}
        <h3 className="text-2xl font-bold text-neutral-100">{plan}</h3>
        <p className="text-neutral-400 mt-2 h-10">{description}</p>
        <div className="mt-6">
          <span className="text-5xl font-extrabold text-neutral-50">{price}</span>
          <span className="text-neutral-400 font-medium">{price !== 'Free' && price !== 'Custom' && '/ month'}</span>
        </div>
        <ul className="space-y-3 my-8 flex-grow">
          {features.map(feature => (
            <li key={feature} className="flex items-start gap-3">
              <CheckIcon className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300">{feature}</span>
            </li>
          ))}
        </ul>
        <button className={buttonClasses}>
          {plan === 'Hobbyist' ? 'Start for Free' : 'Choose Plan'}
        </button>
      </div>
    </div>
  );
};

export const PricingPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-100">Find the Right Plan</h1>
        <p className="mt-3 text-lg text-neutral-400">Start for free, then scale as you grow. No credit card required.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <PricingCard
          plan="Hobbyist"
          price="Free"
          description="For individuals getting started with new ideas."
          features={[
            '5 Idea Generations per month',
            'Basic Market Validation',
            'Text-only Input',
            'Save up to 3 ideas',
          ]}
        />
        <PricingCard
          plan="Startup"
          price="$29"
          description="For serious founders validating and building."
          isFeatured={true}
          features={[
            '100 Idea Generations per month',
            'Advanced Market Validation',
            'Text, Image & Video Inputs',
            'Unlimited Saved Ideas',
            'Export to PDF & Notion',
            'AI Mentor Chat',
          ]}
        />
        <PricingCard
          plan="Enterprise"
          price="Custom"
          description="For teams and agencies requiring advanced features."
          features={[
            'Unlimited Idea Generations',
            'Real-time API Access',
            'Team Collaboration',
            'Dedicated Support',
            'Competitor Analyzer',
            'Custom Integrations',
          ]}
        />
      </div>
    </div>
  );
};