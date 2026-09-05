import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Star, RefreshCw, X, Check, Filter } from 'lucide-react';
import { Mentor } from '../types';
import { MentorCard } from './MentorCard';

interface DiscoverScreenProps {
  mentors: Mentor[];
  onLoadMore: () => void;
  hasMore: boolean;
  onRequestSwap: (mentor: Mentor) => void;
  onViewProfile: (mentor: Mentor) => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  mentors,
  onLoadMore,
  hasMore,
  onRequestSwap,
  onViewProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedMentor, setSelectedMentor] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [minStarsActive, setMinStarsActive] = useState<boolean>(false);

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<'skill' | 'mentor' | 'availability' | null>(null);

  // Available skills list derived from mentors
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    mentors.forEach((m) => {
      m.teaches.forEach((t) => set.add(t.name));
      m.wantsToLearn.forEach((skill) => set.add(skill));
    });
    return Array.from(set);
  }, [mentors]);

  // Unique mentor names
  const mentorNames = useMemo(() => {
    return mentors.map((m) => m.name);
  }, [mentors]);

  // Filtered mentors logic
  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      // Search query (matches mentor name, teaches skills, wantsToLearn, location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesLocation = m.location.toLowerCase().includes(q);
        const matchesTeaches = m.teaches.some((t) => t.name.toLowerCase().includes(q));
        const matchesWants = m.wantsToLearn.some((skill) => skill.toLowerCase().includes(q));
        if (!matchesName && !matchesLocation && !matchesTeaches && !matchesWants) {
          return false;
        }
      }

      // Skill Filter
      if (selectedSkill !== 'All') {
        const teachesSkill = m.teaches.some((t) => t.name.toLowerCase() === selectedSkill.toLowerCase());
        const wantsSkill = m.wantsToLearn.some((skill) => skill.toLowerCase() === selectedSkill.toLowerCase());
        if (!teachesSkill && !wantsSkill) return false;
      }

      // Mentor Name Filter
      if (selectedMentor !== 'All' && m.name !== selectedMentor) {
        return false;
      }

      // Availability Filter
      if (selectedAvailability !== 'All') {
        const hours = parseInt(selectedAvailability, 10);
        if (m.availabilityHours < hours) return false;
      }

      // Min 4+ Stars Filter
      if (minStarsActive && m.rating < 4.0) {
        return false;
      }

      return true;
    });
  }, [mentors, searchQuery, selectedSkill, selectedMentor, selectedAvailability, minStarsActive]);

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedSkill('All');
    setSelectedMentor('All');
    setSelectedAvailability('All');
    setMinStarsActive(false);
    setOpenDropdown(null);
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedSkill !== 'All' ||
    selectedMentor !== 'All' ||
    selectedAvailability !== 'All' ||
    minStarsActive;

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Top Header Section from Image 1 */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#131b2e] tracking-tight">
          Discover & Match
        </h1>
        <p className="text-sm sm:text-base text-[#464555] mt-1 max-w-3xl leading-relaxed">
          Find mentors who want what you have, and have what you want. Search by skill, name, or availability.
        </p>
      </div>

      {/* Search & Filter Card from Image 1 */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 sm:p-6 mb-8 shadow-xs">
        {/* Row 1: Search Input + Find Mentors CTA */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOpenDropdown(null);
          }}
          className="flex flex-col sm:flex-row gap-3 items-stretch"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#777587]" />
            <input
              id="skills-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search skills or mentors"
              className="w-full h-12 pl-12 pr-10 rounded-xl bg-white border border-[#e2e8f0] text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/15 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#777587] hover:text-[#131b2e] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            id="find-mentors-btn"
            className="h-12 px-7 rounded-xl bg-[#3525cd] hover:bg-[#2b1cb5] text-white text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.99]"
          >
            Find Mentors
          </button>
        </form>

        {/* Row 2: FILTERS */}
        <div className="mt-5 pt-5 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-xs font-bold text-[#464555] tracking-wider uppercase mr-1">
              FILTERS:
            </span>

            {/* Skill Name Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="filter-skill-name-btn"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'skill' ? null : 'skill')
                }
                className={`h-9 px-3.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedSkill !== 'All'
                    ? 'bg-[#eaedff] text-[#3525cd] border-[#dad7ff]'
                    : 'bg-[#faf8ff] text-[#464555] border-[#e2e8f0] hover:bg-[#f1f5f9]'
                }`}
              >
                <span>{selectedSkill === 'All' ? 'All Skills' : selectedSkill}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#777587]" />
              </button>

              {openDropdown === 'skill' && (
                <div className="absolute left-0 mt-1.5 w-56 max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-[#e2e8f0] p-1.5 z-30 animate-in fade-in zoom-in-95">
                  <div
                    onClick={() => {
                      setSelectedSkill('All');
                      setOpenDropdown(null);
                    }}
                    className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                      selectedSkill === 'All'
                        ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                        : 'text-[#464555] hover:bg-[#faf8ff]'
                    }`}
                  >
                    <span>All Skills</span>
                    {selectedSkill === 'All' && <Check className="w-3.5 h-3.5" />}
                  </div>
                  {allSkills.map((sk) => (
                    <div
                      key={sk}
                      onClick={() => {
                        setSelectedSkill(sk);
                        setOpenDropdown(null);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                        selectedSkill === sk
                          ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                          : 'text-[#464555] hover:bg-[#faf8ff]'
                      }`}
                    >
                      <span className="truncate">{sk}</span>
                      {selectedSkill === sk && <Check className="w-3.5 h-3.5" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mentor Name Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="filter-mentor-name-btn"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'mentor' ? null : 'mentor')
                }
                className={`h-9 px-3.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedMentor !== 'All'
                    ? 'bg-[#eaedff] text-[#3525cd] border-[#dad7ff]'
                    : 'bg-[#faf8ff] text-[#464555] border-[#e2e8f0] hover:bg-[#f1f5f9]'
                }`}
              >
                <span>{selectedMentor === 'All' ? 'All Mentors' : selectedMentor}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#777587]" />
              </button>

              {openDropdown === 'mentor' && (
                <div className="absolute left-0 mt-1.5 w-52 max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-[#e2e8f0] p-1.5 z-30 animate-in fade-in zoom-in-95">
                  <div
                    onClick={() => {
                      setSelectedMentor('All');
                      setOpenDropdown(null);
                    }}
                    className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                      selectedMentor === 'All'
                        ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                        : 'text-[#464555] hover:bg-[#faf8ff]'
                    }`}
                  >
                    <span>All Mentors</span>
                    {selectedMentor === 'All' && <Check className="w-3.5 h-3.5" />}
                  </div>
                  {mentorNames.map((name) => (
                    <div
                      key={name}
                      onClick={() => {
                        setSelectedMentor(name);
                        setOpenDropdown(null);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                        selectedMentor === name
                          ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                          : 'text-[#464555] hover:bg-[#faf8ff]'
                      }`}
                    >
                      <span className="truncate">{name}</span>
                      {selectedMentor === name && <Check className="w-3.5 h-3.5" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Availability Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="filter-availability-btn"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'availability' ? null : 'availability')
                }
                className={`h-9 px-3.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedAvailability !== 'All'
                    ? 'bg-[#eaedff] text-[#3525cd] border-[#dad7ff]'
                    : 'bg-[#faf8ff] text-[#464555] border-[#e2e8f0] hover:bg-[#f1f5f9]'
                }`}
              >
                <span>
                  {selectedAvailability === 'All'
                    ? 'All Availability'
                    : `${selectedAvailability}h+/week`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#777587]" />
              </button>

              {openDropdown === 'availability' && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-[#e2e8f0] p-1.5 z-30 animate-in fade-in zoom-in-95">
                  <div
                    onClick={() => {
                      setSelectedAvailability('All');
                      setOpenDropdown(null);
                    }}
                    className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                      selectedAvailability === 'All'
                        ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                        : 'text-[#464555] hover:bg-[#faf8ff]'
                    }`}
                  >
                    <span>Any Availability</span>
                    {selectedAvailability === 'All' && <Check className="w-3.5 h-3.5" />}
                  </div>
                  {['1', '2', '3', '4'].map((hrs) => (
                    <div
                      key={hrs}
                      onClick={() => {
                        setSelectedAvailability(hrs);
                        setOpenDropdown(null);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between ${
                        selectedAvailability === hrs
                          ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                          : 'text-[#464555] hover:bg-[#faf8ff]'
                      }`}
                    >
                      <span>At least {hrs}h/week</span>
                      {selectedAvailability === hrs && <Check className="w-3.5 h-3.5" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Min 4+ Stars Pill from Image 1 (Filled state) */}
            <button
              type="button"
              id="filter-min-stars-btn"
              onClick={() => setMinStarsActive(!minStarsActive)}
              className={`h-9 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                minStarsActive
                  ? 'bg-[#3525cd] text-white hover:bg-[#2b1cb5]'
                  : 'bg-white text-[#464555] border border-[#e2e8f0] hover:bg-[#f1f5f9]'
              }`}
            >
              <span>Min 4+ Stars</span>
              <Star
                className={`w-3.5 h-3.5 ${
                  minStarsActive ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'
                }`}
              />
            </button>
          </div>

          {/* Clear All button */}
          <button
            type="button"
            id="clear-filters-btn"
            onClick={handleClearAll}
            className="text-xs font-semibold text-[#777587] hover:text-[#3525cd] transition-colors cursor-pointer py-1.5 px-2"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Mentors Grid from Image 1 (3 Columns on desktop, responsive for tablet & mobile) */}
      {filteredMentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredMentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onRequestSwap={onRequestSwap}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#eaedff] text-[#3525cd] flex items-center justify-center mx-auto mb-4">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#131b2e]">No mentors found</h3>
          <p className="text-sm text-[#464555] mt-1.5 mb-6">
            Try loosening your filters or searching for another skill term like "Python" or "Design".
          </p>
          <button
            onClick={handleClearAll}
            className="px-5 py-2.5 rounded-xl bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#2b1cb5] cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Load More Mentors Button from Image 1 */}
      {hasMore && filteredMentors.length > 0 && (
        <div className="mt-12 flex justify-center">
          <button
            id="load-more-mentors-btn"
            onClick={onLoadMore}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#eaedff]/70 hover:bg-[#eaedff] border border-[#dad7ff] text-[#3525cd] text-sm font-semibold transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-98"
          >
            <span>Load More Mentors</span>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
