import React from 'react';
import {
  X,
  MapPin,
  Star,
  Award,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';
import { Mentor } from '../types';

interface MentorProfileModalProps {
  mentor: Mentor | null;
  onClose: () => void;
  onRequestSwap: (mentor: Mentor) => void;
}

export const MentorProfileModal: React.FC<MentorProfileModalProps> = ({
  mentor,
  onClose,
  onRequestSwap,
}) => {
  if (!mentor) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Profile Hero */}
        <div className="bg-[#faf8ff] border-b border-[#e2e8f0] p-6 sm:p-7 relative">
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 text-[#777587] hover:text-[#131b2e] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 pr-8">
            <div className="relative shrink-0">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-4 border-white shadow-md"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#131b2e]">{mentor.name}</h2>
                {mentor.isPerfectMatch ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#3525cd] text-white">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    {mentor.matchScore}% Perfect Match
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#eaedff] text-[#3525cd]">
                    {mentor.matchScore}% Match
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-medium text-[#464555] mt-1">{mentor.title}</p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#777587] mt-2.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {mentor.location} ({mentor.timezone})
                </span>
                <span className="flex items-center gap-1 font-semibold text-[#131b2e]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {mentor.rating.toFixed(1)} ({mentor.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
          {/* About Bio */}
          <div>
            <h3 className="text-xs font-bold text-[#777587] uppercase tracking-wider mb-2">About Mentor</h3>
            <p className="text-sm text-[#131b2e] leading-relaxed">{mentor.bio}</p>
          </div>

          {/* Skill Exchange Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TEACHES */}
            <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#e2e8f0]">
              <span className="block text-[11px] font-bold text-[#777587] uppercase tracking-wider mb-2.5">
                Teaches ({mentor.teaches.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {mentor.teaches.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-lg font-medium bg-[#e8fbf3] text-[#00714d] border border-[#6cf8bb]/40"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* WANTS TO LEARN */}
            <div className="p-4 rounded-xl bg-[#eaedff]/40 border border-[#dad7ff]">
              <span className="block text-[11px] font-bold text-[#3525cd] uppercase tracking-wider mb-2.5">
                Wants to Learn
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#3525cd]">
                <ArrowLeftRight className="w-4 h-4" />
                {mentor.wantsToLearn.map((skill, idx) => (
                  <span
                    key={`${skill}-${idx}`}
                    className="inline-flex items-center rounded-md bg-white px-2 py-1 border border-[#dad7ff]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonials / Reviews */}
          {mentor.reviews && mentor.reviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#777587] uppercase tracking-wider">
                  Swapper Reviews ({mentor.reviews.length})
                </h3>
                <span className="text-xs text-[#3525cd] font-medium">100% Positive Feedback</span>
              </div>

              <div className="space-y-3">
                {mentor.reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl border border-[#e2e8f0] bg-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.authorAvatar}
                          alt={rev.authorName}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-[#131b2e]">{rev.authorName}</span>
                        <span className="text-[11px] text-[#777587]">({rev.date})</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-[#131b2e]">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#464555] leading-relaxed">{rev.comment}</p>
                    <span className="inline-block mt-2 text-[10px] font-medium text-[#3525cd] bg-[#eaedff] px-2 py-0.5 rounded-md">
                      Exchanged: {rev.skillExchanged}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom CTA */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#e2e8f0] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-[#464555] hover:text-[#131b2e] cursor-pointer"
          >
            Back to Discovery
          </button>

          <button
            id={`modal-request-swap-btn-${mentor.id}`}
            onClick={() => {
              onClose();
              onRequestSwap(mentor);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1cb5] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <span>Request Free Swap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
