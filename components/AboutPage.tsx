import React from 'react';
import type { Page } from '../types';
import { TargetIcon, EyeIcon } from './IconComponents';

interface AboutPageProps {
    onNavigate: (page: Page) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
    return (
        <div className="max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-100">About Lade Stack</h1>
                <p className="mt-4 text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto">
                    At <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="text-brand-light hover:underline transition-colors">Lade Stack</a>, innovation meets simplicity. Founded by Girish Lade, a passionate engineer, developer, and designer, Lade Stack is built with one clear mission — to make powerful AI-integrated tools accessible to every developer and creator around the world.
                </p>
            </div>

            <div className="space-y-12">
                
                <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-8 space-y-4">
                    <h3 className="text-2xl font-bold text-neutral-100 text-center mb-4">The Founder & Philosophy</h3>
                    <p className="text-neutral-300 leading-relaxed">
                        Girish is not just a coder; he’s a creator at heart — blending clean design with functional technology. With a background in web development, UX/UI design, and backend systems, he has built everything from full-fledged e-commerce platforms and AI-powered compilers to multi-tool SaaS platforms that help developers build faster and smarter.
                    </p>
                    <p className="text-neutral-300 leading-relaxed">
                        Under Lade Stack, Girish is working on a suite of products that redefine how developers interact with code, design, and automation. His philosophy is simple — “Build tools that empower creators, not complicate their workflow.”
                    </p>
                    <p className="text-neutral-300 leading-relaxed">
                        Every project under Lade Stack reflects his obsession with performance, usability, and modern aesthetics. The brand emphasizes minimal, elegant design, smooth user experiences, and AI features that feel natural, not forced.
                    </p>
                    <p className="text-neutral-300 leading-relaxed">
                        Beyond code, Girish is an active learner, always exploring new AI models, backend frameworks, and design trends, turning experiments into real-world tools. He believes in open collaboration, practical innovation, and continuous growth — the three pillars that drive Lade Stack forward.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SectionCard
                        icon={<EyeIcon className="w-8 h-8 text-brand-light" />}
                        title="Our Vision"
                        text="To become a global platform where developers and creators can access smart, AI-driven tools to build, test, and deploy faster than ever — without losing creativity or control."
                    />

                    <SectionCard
                        icon={<TargetIcon className="w-8 h-8 text-brand-light" />}
                        title="Our Mission"
                        text="To simplify complex technologies into intuitive products that enhance productivity, creativity, and learning for developers worldwide."
                    />
                </div>
            </div>

            <div className="text-center mt-16">
                <h2 className="text-3xl font-bold text-neutral-200">Ready to build the future?</h2>
                <p className="text-neutral-400 mt-2">Let's turn your vision into a validated business concept.</p>
                <button 
                    onClick={() => onNavigate('generator')} 
                    className="mt-6 inline-block bg-gradient-to-r from-brand to-brand/80 text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Start Generating Ideas
                </button>
            </div>
        </div>
    );
};

const SectionCard: React.FC<{ icon: React.ReactNode; title: string; text: string; }> = ({ icon, title, text }) => (
    <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-8 flex flex-col h-full">
        <div className="p-3 bg-neutral-800 rounded-full border border-neutral-700 self-start mb-4">
            {icon}
        </div>
        <div>
            <h3 className="text-2xl font-bold text-neutral-100">{title}</h3>
            <p className="text-neutral-400 mt-2 leading-relaxed">{text}</p>
        </div>
    </div>
);