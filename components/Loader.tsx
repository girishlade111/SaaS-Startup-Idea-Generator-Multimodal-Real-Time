import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-8 text-center">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-3 h-3 bg-brand rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-brand rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-brand rounded-full animate-pulse"></div>
      </div>
      <h3 className="text-xl font-bold text-neutral-200 mt-8">Analyzing Market Signals...</h3>
      <p className="text-neutral-400 mt-2 max-w-md">Our AI is fusing multimodal inputs with real-time web data to generate and validate your SaaS ideas. This may take a moment.</p>
    </div>
  );
};