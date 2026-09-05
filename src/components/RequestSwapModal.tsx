import React, { useState } from 'react';
import { X, Sparkles, Clock, ArrowLeftRight, CheckCircle2, Send, ShieldCheck } from 'lucide-react';
import { Mentor, UserProfile } from '../types';

interface RequestSwapModalProps {
  mentor: Mentor | null;
  currentUser: UserProfile;
  onClose: () => void;
  onSubmitSwap: (proposal: {
    mentor: Mentor;
    skillYouTeach: string;
    skillYouLearn: string;
    weeklyHours: number;
    message: string;
  }) => void;
}

export const RequestSwapModal: React.FC<RequestSwapModalProps> = ({
  mentor,
  currentUser,
  onClose,
  onSubmitSwap,
}) => {
  if (!mentor) return null;

  const [selectedTeachSkill, setSelectedTeachSkill] = useState<string>(
    currentUser.teaches.find((t) =>
      mentor.wantsToLearn.some((wanted) => t.toLowerCase().includes(wanted.toLowerCase()))
    ) ||
      currentUser.teaches[0] ||
      'UX Design'
  );
  const [selectedLearnSkill, setSelectedLearnSkill] = useState<string>(
    mentor.teaches[0]?.name || 'Python Expert'
  );
  const [weeklyHours, setWeeklyHours] = useState<number>(Math.min(mentor.availabilityHours, 2));
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const swapMessage = message.trim() || `Hi ${mentor.name}! I'd like to propose a 1:1 skill exchange session with you.`;

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onSubmitSwap({
          mentor,
          skillYouTeach: selectedTeachSkill,
          skillYouLearn: selectedLearnSkill,
          weeklyHours,
          message: swapMessage,
        });
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-[#faf8ff] border-b border-[#e2e8f0] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  referrerPolicy="no-referrer"
                  className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#131b2e]">{mentor.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#3525cd] font-semibold">
                    {mentor.matchScore}% Match
                  </span>
                </div>
                <p className="text-xs text-[#464555] mt-0.5">
                  {mentor.location} ({mentor.timezone}) • ⭐ {mentor.rating} ({mentor.reviewCount} reviews)
                </p>
              </div>
            </div>

            <button
              id="close-swap-modal-btn"
              onClick={onClose}
              className="text-[#777587] hover:text-[#131b2e] p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#e8fbf3] text-[#00a86b] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-[#131b2e]">Swap Proposal Sent!</h4>
            <p className="text-sm text-[#464555] mt-2 max-w-md mx-auto">
              We notified {mentor.name}. Once accepted, your weekly 1:1 barter sessions will appear in
              your <strong>My Learning</strong> dashboard.
            </p>
            <div className="mt-6 flex justify-center">
              <span className="text-xs text-[#00714d] font-semibold bg-[#e8fbf3] px-3.5 py-1.5 rounded-full border border-[#6cf8bb]/40">
                100% Free Peer Skill Exchange
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Value Exchange Preview */}
            <div className="bg-[#eaedff]/40 rounded-xl p-3.5 border border-[#dad7ff]/60 flex items-center justify-between text-xs">
              <div className="flex-1">
                <span className="text-[#777587] block uppercase font-bold text-[10px]">You Teach</span>
                <span className="font-semibold text-[#131b2e] truncate">{selectedTeachSkill}</span>
              </div>
              <div className="px-3 text-[#3525cd]">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div className="flex-1 text-right">
                <span className="text-[#777587] block uppercase font-bold text-[10px]">You Learn</span>
                <span className="font-semibold text-[#3525cd] truncate">{selectedLearnSkill}</span>
              </div>
            </div>

            {/* Step 1: What will you teach */}
            <div>
              <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-2">
                1. What skill do you offer to teach {mentor.name.split(' ')[0]}?
              </label>
              <div className="flex flex-wrap gap-2">
                {currentUser.teaches.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSelectedTeachSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedTeachSkill === skill
                        ? 'bg-[#3525cd] text-white shadow-xs'
                        : 'bg-[#faf8ff] text-[#464555] border border-[#e2e8f0] hover:bg-[#eaedff]'
                    }`}
                  >
                    {skill}
                    {mentor.wantsToLearn.some((wanted) => skill.toLowerCase().includes(wanted.toLowerCase())) && (
                      <span className="ml-1.5 text-[10px] bg-[#6cf8bb]/30 text-white font-bold px-1 rounded">
                        Target Match
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: What do you want to learn */}
            <div>
              <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-2">
                2. Which skill do you want to learn from {mentor.name.split(' ')[0]}?
              </label>
              <div className="flex flex-wrap gap-2">
                {mentor.teaches.map((skill) => (
                  <button
                    key={skill.name}
                    type="button"
                    onClick={() => setSelectedLearnSkill(skill.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedLearnSkill === skill.name
                        ? 'bg-[#006c49] text-white shadow-xs'
                        : 'bg-[#faf8ff] text-[#464555] border border-[#e2e8f0] hover:bg-[#e8fbf3]'
                    }`}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Commitment */}
            <div>
              <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-2">
                3. Proposed weekly commitment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setWeeklyHours(h)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      weeklyHours === h
                        ? 'bg-[#eaedff] text-[#3525cd] border border-[#3525cd] font-bold'
                        : 'bg-[#faf8ff] text-[#464555] border border-[#e2e8f0] hover:bg-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{h} hour / week</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Message */}
            <div>
              <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1.5">
                4. Introduction & Learning Goals
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                aria-label="Introduction and learning goals"
                className="w-full p-3 rounded-xl border border-[#e2e8f0] text-xs text-[#131b2e] leading-relaxed focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd]"
              />
            </div>

            {/* Community Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-[#777587] bg-[#faf8ff] p-2.5 rounded-lg border border-[#e2e8f0]">
              <ShieldCheck className="w-4 h-4 text-[#00a86b] shrink-0" />
              <span>
                Zero cash transaction. Both swappers commit equal time and reciprocal ratings.
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#464555] hover:text-[#131b2e] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-swap-request-btn"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1cb5] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Proposal...</span>
                ) : (
                  <>
                    <span>Send Free Swap Request</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
