import React, { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X, CheckCircle, Sparkles, BookOpen, User, Compass, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'discover' | 'my-learning' | 'ai-studio' | 'profile';
  setActiveTab: (tab: 'discover' | 'my-learning' | 'ai-studio' | 'profile') => void;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCommunityInfo, setShowCommunityInfo] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] transition-all">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab('discover')}
              className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3525cd] rounded-lg"
            >
              <Logo size="md" text="SkillHub AI" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                id="nav-discover-mentors"
                onClick={() => setActiveTab('discover')}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-150 rounded-lg cursor-pointer ${
                  activeTab === 'discover'
                    ? 'text-[#3525cd] font-bold'
                    : 'text-[#464555] hover:text-[#131b2e] hover:bg-[#faf8ff]'
                }`}
              >
                Discover Mentors
                {activeTab === 'discover' && (
                  <span className="absolute bottom-[-10px] left-4 right-4 h-[2.5px] bg-[#3525cd] rounded-full" />
                )}
              </button>

              <button
                id="nav-my-learning"
                onClick={() => setActiveTab('my-learning')}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-150 rounded-lg cursor-pointer ${
                  activeTab === 'my-learning'
                    ? 'text-[#3525cd] font-bold'
                    : 'text-[#464555] hover:text-[#131b2e] hover:bg-[#faf8ff]'
                }`}
              >
                My Learning
                {activeTab === 'my-learning' && (
                  <span className="absolute bottom-[-10px] left-4 right-4 h-[2.5px] bg-[#3525cd] rounded-full" />
                )}
              </button>

              <button
                id="nav-ai-studio"
                onClick={() => setActiveTab('ai-studio')}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-150 rounded-lg cursor-pointer ${
                  activeTab === 'ai-studio'
                    ? 'text-[#3525cd] font-bold'
                    : 'text-[#464555] hover:text-[#131b2e] hover:bg-[#faf8ff]'
                }`}
              >
                AI Studio
                {activeTab === 'ai-studio' && (
                  <span className="absolute bottom-[-10px] left-4 right-4 h-[2.5px] bg-[#3525cd] rounded-full" />
                )}
              </button>

              <button
                id="nav-profile"
                onClick={() => setActiveTab('profile')}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-150 rounded-lg cursor-pointer ${
                  activeTab === 'profile'
                    ? 'text-[#3525cd] font-bold'
                    : 'text-[#464555] hover:text-[#131b2e] hover:bg-[#faf8ff]'
                }`}
              >
                Profile
                {activeTab === 'profile' && (
                  <span className="absolute bottom-[-10px] left-4 right-4 h-[2.5px] bg-[#3525cd] rounded-full" />
                )}
              </button>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* 100% Free Community Badge from Image 1 */}
            <div className="relative">
              <button
                id="free-community-badge"
                onClick={() => setShowCommunityInfo(!showCommunityInfo)}
                className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#6cf8bb]/20 text-[#00714d] border border-[#6cf8bb]/40 hover:bg-[#6cf8bb]/30 transition-all cursor-pointer shadow-xs"
                title="Click to learn how SkillHub works"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a86b] mr-2 animate-pulse" />
                100% Free Community
              </button>

              {/* Tooltip modal on clicking badge */}
              {showCommunityInfo && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#e2e8f0] p-4 text-xs z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9] mb-2">
                    <span className="font-bold text-[#131b2e] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3525cd]" />
                      Skill Barter Model
                    </span>
                    <button
                      onClick={() => setShowCommunityInfo(false)}
                      className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[#464555] leading-relaxed mb-2">
                    SkillHub is completely subscription-free. You teach 1 hour of your craft in exchange for 1 hour of mentorship from someone else. No money ever changes hands!
                  </p>
                  <div className="bg-[#eaedff]/50 rounded-lg p-2 text-[#3525cd] font-medium flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#00a86b]" />
                    Fair 1:1 time credit economy
                  </div>
                </div>
              )}
            </div>

            {/* Header Logout Button (Desktop) */}
            <button
              id="header-logout-btn"
              onClick={onLogout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5c5b6b] hover:text-[#ba1a1a] hover:bg-[#fff0f0] border border-[#e2e8f0] hover:border-[#ffdad6] transition-colors cursor-pointer"
              title="Log out of your account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#464555] hover:text-[#131b2e] hover:bg-[#eaedff]/40 rounded-lg cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e2e8f0] bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="mb-3 px-2 py-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#00714d] bg-[#6cf8bb]/20 px-3 py-1 rounded-full border border-[#6cf8bb]/30 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00a86b]" />
              100% Free Community
            </span>
            <span className="text-xs text-[#777587]">{currentUser.location}</span>
          </div>

          <button
            id="mobile-nav-discover"
            onClick={() => {
              setActiveTab('discover');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'discover'
                ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                : 'text-[#464555] hover:bg-[#faf8ff]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#3525cd]" />
            Discover Mentors
          </button>

          <button
            id="mobile-nav-my-learning"
            onClick={() => {
              setActiveTab('my-learning');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'my-learning'
                ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                : 'text-[#464555] hover:bg-[#faf8ff]'
            }`}
          >
          <BookOpen className="w-4 h-4 text-[#3525cd]" />
          My Learning
          </button>

          <button
            id="mobile-nav-ai-studio"
            onClick={() => {
              setActiveTab('ai-studio');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'ai-studio'
                ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                : 'text-[#464555] hover:bg-[#faf8ff]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Studio
          </button>

          <button
            id="mobile-nav-profile"
            onClick={() => {
              setActiveTab('profile');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                : 'text-[#464555] hover:bg-[#faf8ff]'
            }`}
          >
            <User className="w-4 h-4 text-[#3525cd]" />
            Profile & Skills
          </button>

          <div className="pt-2 mt-2 border-t border-[#f1f5f9]">
            <button
              id="mobile-nav-logout"
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#ba1a1a] hover:bg-[#fff0f0] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
