import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-12 border-t border-[#e2e8f0]/80 bg-[#faf8ff] text-center">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center justify-center gap-2">
          <Logo size="sm" showText={false} />
          <span className="text-sm font-medium text-[#464555]">
            SkillHub AI © {new Date().getFullYear()}
          </span>
        </div>
        <p className="text-sm text-[#777587]">
          Empowering the community through shared knowledge.
        </p>
      </div>
    </footer>
  );
};
