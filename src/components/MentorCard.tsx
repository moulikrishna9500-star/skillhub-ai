import React from 'react';
import { MapPin, Star, Clock, ArrowRight, ArrowLeftRight, Sparkles } from 'lucide-react';
import { Mentor } from '../types';

interface MentorCardProps {
  mentor: Mentor;
  onRequestSwap: (mentor: Mentor) => void;
  onViewProfile: (mentor: Mentor) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  onRequestSwap,
  onViewProfile,
}) => {
  return (
    <div
      id={`mentor-card-${mentor.id}`}
      className="relative flex flex-col justify-between bg-white rounded-2xl border border-[#e2e8f0] p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#c7c4d8] group"
    >
      {/* Top Right Match Score Badge */}
      <div className="absolute top-4 right-4 z-10">
        {mentor.isPerfectMatch ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#3525cd] text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5 fill-current text-yellow-300" />
            <span>{mentor.matchScore}% Perfect Match</span>
          </div>
        ) : (
          <div className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#eaedff] text-[#3525cd]">
            <span>{mentor.matchScore}% Match</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div>
        {/* Mentor Info Row: Avatar + Details */}
        <div className="flex items-start gap-3.5 pr-28 sm:pr-32">
          <div className="relative shrink-0 cursor-pointer" onClick={() => onViewProfile(mentor)}>
            <img
              src={mentor.avatar}
              alt={mentor.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover border border-[#e2e8f0] shadow-xs group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Name & Details */}
          <div className="min-w-0">
            <h3
              onClick={() => onViewProfile(mentor)}
              className="text-lg font-bold text-[#131b2e] leading-snug truncate hover:text-[#3525cd] cursor-pointer transition-colors"
            >
              {mentor.name}
            </h3>

            {/* Location & Timezone */}
            <div className="flex items-center gap-1 text-xs text-[#464555] mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#777587] shrink-0" />
              <span className="truncate">
                {mentor.location} ({mentor.timezone})
              </span>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-1 text-xs text-[#131b2e] mt-1 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>{mentor.rating.toFixed(1)}</span>
              <span className="text-[#777587]">({mentor.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* TEACHES Section */}
        <div className="mt-5">
          <span className="block text-[11px] font-bold tracking-wider text-[#777587] uppercase mb-2">
            TEACHES
          </span>
          <div className="flex flex-wrap gap-2">
            {mentor.teaches.map((skill, idx) => (
              <span
                key={idx}
                className={`text-xs px-2.5 py-1 rounded-md font-medium inline-flex items-center ${
                  idx === 0
                    ? 'bg-[#e8fbf3] text-[#00714d] border border-[#6cf8bb]/40'
                    : 'bg-[#f2f4f8] text-[#131b2e]'
                }`}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>

        {/* WANTS TO LEARN Section */}
        <div className="mt-4">
          <span className="block text-[11px] font-bold tracking-wider text-[#777587] uppercase mb-2">
            WANTS TO LEARN
          </span>
          <div className="flex flex-wrap gap-2 rounded-xl bg-[#eaedff]/60 border border-[#dad7ff]/60 p-2.5">
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0 text-[#3525cd] mt-1" />
            {mentor.wantsToLearn.map((skill, idx) => (
              <span
                key={`${skill}-${idx}`}
                className="text-xs px-2 py-1 rounded-md bg-white text-[#3525cd] font-semibold border border-[#dad7ff]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-[#464555] font-medium">
          <Clock className="w-3.5 h-3.5 text-[#777587]" />
          <span>{mentor.availability}</span>
        </div>
      </div>

      {/* Action Button Row */}
      <div className="mt-6 pt-2">
        {mentor.isPerfectMatch ? (
          <button
            id={`request-swap-btn-${mentor.id}`}
            onClick={() => onRequestSwap(mentor)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#3525cd] hover:bg-[#2b1cb5] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.99]"
          >
            <span>Request Free Swap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id={`view-profile-btn-${mentor.id}`}
            onClick={() => onViewProfile(mentor)}
            className="w-full py-2.5 px-4 rounded-xl border border-[#3525cd] text-[#3525cd] hover:bg-[#eaedff]/50 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <span>View Profile</span>
          </button>
        )}
      </div>
    </div>
  );
};
