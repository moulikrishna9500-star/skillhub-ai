import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeftRight,
  Plus,
  BookOpen,
} from 'lucide-react';
import { ActiveSwap, UserProfile, Mentor } from '../types';

interface MyLearningScreenProps {
  swaps: ActiveSwap[];
  incomingRequests?: ActiveSwap[];
  currentUser: UserProfile;
  onNavigateToDiscover: () => void;
  onViewMentor: (mentor: Mentor) => void;
  onAcceptRequest: (swapId: string) => void;
  onDeclineRequest: (swapId: string) => void;
  onScheduleMeeting: (swapId: string, date: string, time: string) => void;
  onCompleteSkill: (swapId: string) => void;
  onCancelSwap: (swapId: string) => void;
  onSubmitReview: (swapId: string, rating: number, feedback: string) => void;
}

export const MyLearningScreen: React.FC<MyLearningScreenProps> = ({
  swaps,
  incomingRequests = [],
  currentUser,
  onNavigateToDiscover,
  onViewMentor,
  onAcceptRequest,
  onDeclineRequest,
  onScheduleMeeting,
  onCompleteSkill,
  onCancelSwap,
  onSubmitReview,
}) => {
  const [loggedHoursSuccess, setLoggedHoursSuccess] = useState<string | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; feedback: string }>>({});
  const [scheduleSwapId, setScheduleSwapId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const allSwaps = [...incomingRequests, ...swaps].filter(
    (swap, index, entries) => entries.findIndex((entry) => entry.id === swap.id) === index,
  ).sort((a, b) => Number(a.status === 'completed' || a.status === 'cancelled') - Number(b.status === 'completed' || b.status === 'cancelled'));
  const activeSwapsCount = allSwaps.filter((swap) => swap.status !== 'completed' && swap.status !== 'cancelled').length;
  const completedSwapsCount = allSwaps.filter((swap) => swap.status === 'completed').length;

  const handleLogHour = (swap: ActiveSwap) => {
    setLoggedHoursSuccess(swap.mentor.name);
    setTimeout(() => {
      setLoggedHoursSuccess(null);
    }, 3500);
  };

  const openSchedule = (swapId: string) => {
    setScheduleSwapId(swapId);
    setScheduleDate('');
    setScheduleTime('');
  };

  const submitSchedule = (event: React.FormEvent) => {
    event.preventDefault();
    if (!scheduleSwapId || !scheduleDate || !scheduleTime) return;
    onScheduleMeeting(scheduleSwapId, scheduleDate, scheduleTime);
    setScheduleSwapId(null);
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#131b2e] tracking-tight">
            My Learning & Active Swaps
          </h1>
          <p className="text-sm sm:text-base text-[#464555] mt-1 max-w-2xl">
            Track your reciprocal 1:1 skill trades, upcoming video pairings, and hour commitments.
          </p>
        </div>

        <button
          onClick={onNavigateToDiscover}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#2b1cb5] text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Find New Swap Partner</span>
        </button>
      </div>

      {/* Success Banner */}
      {loggedHoursSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-[#e8fbf3] border border-[#6cf8bb] text-[#00714d] text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00a86b]" />
            <span>
              1 Hour logged successfully with {loggedHoursSuccess}! Reciprocal barter balance updated.
            </span>
          </div>
          <span className="bg-white/80 px-2 py-0.5 rounded text-[11px] font-bold">
            +1 Banked Credit
          </span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#777587] block mb-1">Active Swaps</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#131b2e]">{activeSwapsCount}</span>
            <span className="text-xs text-[#00a86b] font-semibold">Live</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#777587] block mb-1">Completed Swaps</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#131b2e]">{completedSwapsCount}</span>
            <span className="text-xs text-[#00a86b] font-semibold">
              ★ {currentUser.reviewsCount > 0 ? currentUser.rating.toFixed(2) : 'No ratings yet'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Swaps list */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-[#131b2e] flex items-center justify-between">
            <span>Ongoing Mentorship Exchanges</span>
            <span className="text-xs font-semibold text-[#3525cd] bg-[#eaedff] px-2.5 py-0.5 rounded-full">
            {activeSwapsCount} Active
            </span>
          </h2>

          {allSwaps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#cbd5e1] p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-[#eaedff] text-[#3525cd] flex items-center justify-center mx-auto mb-3">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#131b2e]">No active swaps yet</h3>
              <p className="text-xs text-[#777587] mt-1 max-w-sm mx-auto">
                Discover mentors in topics you want to learn and propose a free 1:1 reciprocal skill exchange.
              </p>
              <button
                onClick={onNavigateToDiscover}
                className="mt-4 px-4 py-2 bg-[#3525cd] hover:bg-[#2b1cb5] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Browse Mentors in Discover
              </button>
            </div>
          ) : (
            allSwaps.map((swap) => (
            <div
              key={swap.id}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs hover:border-[#dad7ff] transition-all"
            >
              {/* Top Row: Partner info + Next session */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-3.5">
                  <div
                    className="relative cursor-pointer"
                    onClick={() => onViewMentor(swap.mentor)}
                  >
                    <img
                      src={swap.mentor.avatar}
                      alt={swap.mentor.name}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-full object-cover border border-[#e2e8f0]"
                    />
                  </div>
                  <div>
                    <h3
                      onClick={() => onViewMentor(swap.mentor)}
                      className="font-bold text-[#131b2e] hover:text-[#3525cd] cursor-pointer flex items-center gap-2"
                    >
                      {swap.mentor.name}
                      {swap.status === 'pending' && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#fff2d6] text-[#a16207]">
                          New Request
                        </span>
                      )}
                      {!incomingRequests.some((request) => request.id === swap.id) && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#eaedff] text-[#3525cd]">
                          {swap.mentor.matchScore}% Match
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#777587]">
                      {swap.mentor.location} ({swap.mentor.timezone})
                    </p>
                  </div>
                </div>

                {swap.nextSession && (
                  <div className="bg-[#faf8ff] px-3.5 py-2 rounded-xl border border-[#e2e8f0] flex items-center gap-2 text-xs">
                    <Calendar className="w-4 h-4 text-[#3525cd]" />
                    <div>
                      <span className="text-[#777587] block text-[10px]">
                        {swap.status === 'pending' ? 'Request Status' : swap.status === 'completed' ? 'Completed' : swap.status === 'cancelled' ? 'Cancelled' : 'Next Live Pairing:'}
                      </span>
                      <span className="font-semibold text-[#131b2e]">{swap.nextSession}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Exchange Strip */}
              <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#faf8ff] p-3 rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] font-bold text-[#777587] uppercase block mb-1">
                    You Teach ({swap.mentor.name.split(' ')[0]})
                  </span>
                  <span className="font-semibold text-[#00714d] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00a86b]" />
                    {swap.skillYouTeach}
                  </span>
                </div>

                {swap.status === 'active' && swap.partnerProfile && (
                  <div className="mb-4 rounded-xl border border-[#6cf8bb]/50 bg-[#e8fbf3] p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00714d] mb-2">
                      Partner details shared
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#464555]">
                      <span><strong>Name:</strong> {swap.partnerProfile.name}</span>
                      <span><strong>Email:</strong> {swap.partnerProfile.email || 'Not provided'}</span>
                      <span><strong>Phone:</strong> {swap.partnerProfile.phone || 'Not provided'}</span>
                      <span><strong>Timezone:</strong> {swap.partnerProfile.timezone}</span>
                    </div>
                  </div>
                )}

                <div className="bg-[#eaedff]/40 p-3 rounded-xl border border-[#dad7ff]">
                  <span className="text-[10px] font-bold text-[#3525cd] uppercase block mb-1">
                    You Learn ({swap.mentor.name.split(' ')[0]})
                  </span>
                  <span className="font-semibold text-[#3525cd] flex items-center gap-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#3525cd]" />
                    {swap.skillYouLearn}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {incomingRequests.some((request) => request.id === swap.id) && swap.status === 'pending' && (
                    <>
                      <button onClick={() => onAcceptRequest(swap.id)} className="px-3.5 py-2 rounded-xl bg-[#006c49] text-white text-xs font-semibold cursor-pointer">
                        Accept
                      </button>
                      <button onClick={() => onDeclineRequest(swap.id)} className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 text-xs font-semibold cursor-pointer">
                        Decline
                      </button>
                    </>
                  )}
                  {swap.status === 'active' && (
                    <button onClick={() => openSchedule(swap.id)} className="px-3.5 py-2 rounded-xl border border-[#dad7ff] text-[#3525cd] text-xs font-semibold cursor-pointer">
                      Schedule Meeting
                    </button>
                  )}
                  {swap.status === 'active' && (
                    <button onClick={() => onCompleteSkill(swap.id)} className="px-3.5 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-semibold cursor-pointer">
                      Mark Completed
                    </button>
                  )}
                  {(swap.status === 'active' || swap.status === 'pending') && (
                    <button onClick={() => onCancelSwap(swap.id)} className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 text-xs font-semibold cursor-pointer">
                      Cancel Swap
                    </button>
                  )}
                </div>

                {swap.status === 'active' && (
                  <button
                    onClick={() => handleLogHour(swap)}
                    className="px-3 py-2 rounded-xl bg-[#e8fbf3] hover:bg-[#d1fae5] text-[#00714d] text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-[#6cf8bb]/40"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Log 1h Completed</span>
                  </button>
                )}
              </div>
              {(swap.status === 'completed' || swap.status === 'cancelled') && !swap.reviewSubmitted && (
                <div className="mt-4 rounded-xl border border-[#dad7ff] bg-[#faf8ff] p-4">
                  <p className="text-xs font-bold text-[#131b2e]">Rate {swap.mentor.name}</p>
                  <div className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setReviewDrafts((prev) => ({ ...prev, [swap.id]: { rating, feedback: prev[swap.id]?.feedback || '' } }))}
                        className={`text-xl ${rating <= (reviewDrafts[swap.id]?.rating || 0) ? 'text-amber-400' : 'text-slate-300'}`}
                        aria-label={`Rate ${rating} out of 5`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewDrafts[swap.id]?.feedback || ''}
                    onChange={(event) => setReviewDrafts((prev) => ({ ...prev, [swap.id]: { rating: prev[swap.id]?.rating || 0, feedback: event.target.value } }))}
                    placeholder="Share feedback about this swap"
                    className="mt-2 min-h-20 w-full rounded-lg border border-[#e2e8f0] p-2 text-xs"
                  />
                  <button
                    disabled={!reviewDrafts[swap.id]?.rating}
                    onClick={() => onSubmitReview(swap.id, reviewDrafts[swap.id].rating, reviewDrafts[swap.id].feedback)}
                    className="mt-2 rounded-lg bg-[#3525cd] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Submit Rating & Feedback
                  </button>
                </div>
              )}
            </div>
          )))}
        </div>

        {/* Right 1 Col: Community Guidelines & Goals */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#131b2e] mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#3525cd]" />
              Progress Snapshot
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-[#faf8ff] border border-[#e2e8f0] p-3">
                <span className="text-[#777587]">Active exchanges</span>
                <span className="font-semibold text-[#131b2e]">{activeSwapsCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#faf8ff] border border-[#e2e8f0] p-3">
                <span className="text-[#777587]">Completed swaps</span>
                <span className="font-semibold text-[#131b2e]">{completedSwapsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {scheduleSwapId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={submitSchedule} className="w-full max-w-md rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#131b2e]">Schedule a meeting</h2>
                <p className="mt-1 text-xs text-[#777587]">Choose a date and time for your skill exchange.</p>
              </div>
              <button type="button" onClick={() => setScheduleSwapId(null)} className="text-sm font-semibold text-[#777587]">Cancel</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-[#464555]">
                <span className="mb-1.5 block">Date</span>
                <input type="date" required value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} min={new Date().toISOString().split('T')[0]} className="h-11 w-full rounded-xl border border-[#e2e8f0] px-3 text-sm focus:border-[#3525cd] focus:outline-none" />
              </label>
              <label className="text-xs font-bold text-[#464555]">
                <span className="mb-1.5 block">Time</span>
                <input type="time" required value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} className="h-11 w-full rounded-xl border border-[#e2e8f0] px-3 text-sm focus:border-[#3525cd] focus:outline-none" />
              </label>
            </div>
            <button type="submit" className="mt-5 h-11 w-full rounded-xl bg-[#3525cd] text-sm font-semibold text-white hover:bg-[#2b1cb5]">
              Save Meeting Time
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
