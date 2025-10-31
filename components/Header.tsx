
import React from 'react';
import { BotMessageSquareIcon } from './IconComponents';
import type { Page } from '../types';

interface HeaderProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, onNavigate }) => {
  const navLinkClasses = (page: Page) => 
    `px-3 py-1.5 rounded-md hover:text-neutral-50 transition-colors cursor-pointer text-sm font-medium ${activePage === page ? 'text-neutral-50 bg-neutral-800' : 'text-neutral-400'}`;

  return (
    <header className="py-4 sticky top-0 z-50 bg-neutral-950/50 backdrop-blur-lg border-b border-neutral-800/60">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('generator')}>
          <BotMessageSquareIcon className="w-7 h-7 text-brand" />
          <span className="text-xl font-bold text-neutral-50 tracking-wider">
            Lade<span className="text-brand">Stack</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1 rounded-lg">
          <a onClick={() => onNavigate('generator')} className={navLinkClasses('generator')}>Generator</a>
          <a onClick={() => onNavigate('dashboard')} className={navLinkClasses('dashboard')}>Dashboard</a>
          <a onClick={() => onNavigate('pricing')} className={navLinkClasses('pricing')}>Pricing</a>
          <a onClick={() => onNavigate('about')} className={navLinkClasses('about')}>About</a>
        </nav>
        <button className="px-4 py-2 text-sm font-semibold bg-neutral-50 text-neutral-950 rounded-lg hover:bg-neutral-200 transition-colors">
          Sign In
        </button>
      </div>
    </header>
  );
};
