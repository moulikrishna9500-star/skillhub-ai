/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DiscoverScreen } from './components/DiscoverScreen';
import { MyLearningScreen } from './components/MyLearningScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { RequestSwapModal } from './components/RequestSwapModal';
import { MentorProfileModal } from './components/MentorProfileModal';
import { AuthScreen } from './components/AuthScreen';
import { AIStudioScreen } from './components/AIStudioScreen';
import { supabase } from './lib/supabase';
import { Mentor, ActiveSwap, UserProfile, Review } from './types';
import { CheckCircle2 } from 'lucide-react';

const generateInitialsAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=3525cd&color=fff&size=160&bold=true`;

const rowToProfile = (row: Record<string, any>, email: string): UserProfile => ({
  id: row.id,
  email,
  phone: row.phone ?? '',
  name: row.name ?? 'Member',
  avatar: row.avatar || generateInitialsAvatar(row.name ?? 'Member'),
  headline: row.badge ?? 'Community Member & Skill Swapper',
  location: '',
  timezone: row.timezone ?? 'UTC',
  rating: Number(row.rating) || 0,
  reviewsCount: Number(row.reviews_count) || 0,
  teaches: Array.isArray(row.skills_teach) ? row.skills_teach : [],
  wantsToLearn: Array.isArray(row.skills_learn) ? row.skills_learn : [],
  availabilityHours: 2,
  bio: row.bio ?? '',
  hoursBanked: row.hours_taught ?? 0,
  swapsCompleted: row.total_sessions ?? 0,
  isOnline: true,
});

const toSkillNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((skill) => typeof skill === 'string' ? skill : skill && typeof skill === 'object' && 'name' in skill ? String(skill.name) : '')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const toDbSwapStatus = (status?: string): 'pending' | 'active' | 'completed' | 'cancelled' => {
  if (status === 'active' || status === 'accepted') return 'active';
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
};

const ensureMentorRecord = async (mentor: Mentor, createIfMissing = false) => {
  const { data: existingMentor, error: existingError } = await supabase
    .from('mentors')
    .select('id')
    .eq('user_id', mentor.id)
    .limit(1)
    .maybeSingle();

  if (existingMentor?.id) {
    return existingMentor.id;
  }
  if (existingError) {
    console.warn('mentor lookup failed:', existingError.message);
    return null;
  }
  if (!createIfMissing) {
    return null;
  }

  const { data: createdMentor, error: createError } = await supabase
    .from('mentors')
    .upsert({
      user_id: mentor.id,
      name: mentor.name,
      location: mentor.location || 'Remote',
      rating: mentor.rating || 0,
      reviews_count: mentor.reviewCount || 0,
      avatar: mentor.avatar,
      teaches: mentor.teaches.map((skill) => skill.name),
      wants_to_learn: mentor.wantsToLearn,
      availability: mentor.availability,
      bio: mentor.bio || '',
      is_online: mentor.isOnline,
      sessions_count: mentor.completedSwaps || 0,
    }, { onConflict: 'user_id' })
    .select('id')
    .single();

  if (createError) {
    console.warn('mentor upsert failed:', createError.message);
    return null;
  }

  return createdMentor?.id ?? null;
};

const ensureOwnMentorRecord = async (profile: UserProfile) => {
  if (!profile.id) return null;
  return ensureMentorRecord({
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    location: profile.location || 'Remote',
    timezone: profile.timezone || 'UTC',
    rating: profile.rating,
    reviewCount: profile.reviewsCount,
    matchScore: 0,
    teaches: profile.teaches.map((name, index) => ({ name, isPrimary: index === 0 })),
    wantsToLearn: profile.wantsToLearn,
    availability: `${profile.availabilityHours}h/week available`,
    availabilityHours: profile.availabilityHours,
    bio: profile.bio,
    isOnline: profile.isOnline,
    title: profile.headline,
    completedSwaps: profile.swapsCompleted,
  }, true);
};

const rowToMentor = (
  row: Record<string, any>,
  currentUserId?: string,
  currentTeaches: string[] = [],
  currentWantsToLearn: string[] = [],
  completedSwaps = 0,
): Mentor | null => {
  if (!row.id || row.id === currentUserId) return null;

  const teaches = toSkillNames(row.skills_teach);
  const wantsToLearn = toSkillNames(row.skills_learn);
  if (teaches.length === 0 && wantsToLearn.length === 0) return null;

  const normalizeSkill = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');
  const teachesLower = teaches.map((skill) => normalizeSkill(skill));
  const wantsLower = wantsToLearn.map((skill) => normalizeSkill(skill));
  const currentTeachesLower = currentTeaches.map((skill) => normalizeSkill(skill));
  const currentWantsLower = currentWantsToLearn.map((skill) => normalizeSkill(skill));

  const reciprocalMatches = currentWantsLower.filter((skill) => teachesLower.includes(skill)).length;
  const offerMatches = currentTeachesLower.filter((skill) => wantsLower.includes(skill)).length;
  const isFullMutualMatch = reciprocalMatches > 0 && offerMatches > 0;
  const matchScore = isFullMutualMatch ? 100 : 70;

  return {
    id: row.id,
    name: row.name || 'Community Member',
    avatar: row.avatar || generateInitialsAvatar(row.name || 'Community Member'),
    location: row.location || 'Remote',
    timezone: row.timezone || 'UTC',
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.reviews_count) || 0,
    matchScore,
    isPerfectMatch: isFullMutualMatch,
    teaches: teaches.map((name, index) => ({ name, isPrimary: index === 0 })),
    wantsToLearn: wantsToLearn.length > 0 ? wantsToLearn : ['Open to learning'],
    availability: '2h/week available',
    availabilityHours: 2,
    bio: row.bio || '',
    isOnline: true,
    title: row.badge || 'Community Member',
    completedSwaps,
  };
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'discover' | 'my-learning' | 'ai-studio' | 'profile'>('discover');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const loadMentors = useCallback(async (currentUserId?: string) => {
    const { data: currentProfileData, error: currentProfileError } = currentUserId
      ? await supabase.from('profiles').select('*').eq('id', currentUserId).maybeSingle()
      : { data: null, error: null };

    if (currentProfileError) {
      showToast(`Could not load your profile for matching: ${currentProfileError.message}`);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId ?? '')
      .order('created_at', { ascending: false });

    if (error) {
      showToast(`Could not load community profiles: ${error.message}`);
      return;
    }

    const currentTeaches = toSkillNames(currentProfileData?.skills_teach);
    const currentWantsToLearn = toSkillNames(currentProfileData?.skills_learn);

    const profileIds = data.map((row) => row.id);
    const { data: mentorRows, error: mentorError } = profileIds.length > 0
      ? await supabase.from('mentors').select('id, user_id').in('user_id', profileIds)
      : { data: [], error: null };

    if (mentorError) {
      showToast(`Could not load mentor records: ${mentorError.message}`);
      return;
    }

    const mentorIds = (mentorRows ?? []).map((row) => row.id);
    const { data: completedSwapRows, error: completedSwapError } = mentorIds.length > 0
      ? await supabase.from('swaps').select('mentor_id').in('mentor_id', mentorIds).eq('status', 'completed')
      : { data: [], error: null };

    if (completedSwapError) {
      showToast(`Could not load completed swaps: ${completedSwapError.message}`);
      return;
    }

    const userIdByMentorId = new Map((mentorRows ?? []).map((row) => [row.id, row.user_id]));
    const completedSwapsByUserId = new Map<string, number>();
    (completedSwapRows ?? []).forEach((row) => {
      const userId = userIdByMentorId.get(row.mentor_id);
      if (userId) completedSwapsByUserId.set(userId, (completedSwapsByUserId.get(userId) ?? 0) + 1);
    });

    setMentors(data
      .map((row) => rowToMentor(row, currentUserId, currentTeaches, currentWantsToLearn, completedSwapsByUserId.get(row.id) ?? 0))
      .filter((mentor): mentor is Mentor => mentor !== null));
  }, []);

  const [activeSwaps, setActiveSwaps] = useState<ActiveSwap[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ActiveSwap[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);

  const hydrateReceivedReviews = useCallback(async (userId: string) => {
    const { data: mentorRows, error: mentorError } = await supabase
      .from('mentors')
      .select('id')
      .eq('user_id', userId);
    if (mentorError) {
      showToast(`Could not load your reviews: ${mentorError.message}`);
      return;
    }

    const mentorIds = (mentorRows ?? []).map((row) => row.id);
    const { data: ownedSwaps, error: swapsError } = await supabase
      .from('swaps')
      .select('id, requester_id, mentor_id')
      .or(`requester_id.eq.${userId}${mentorIds.length ? `,mentor_id.in.(${mentorIds.join(',')})` : ''}`);
    if (swapsError) {
      showToast(`Could not load your reviews: ${swapsError.message}`);
      return;
    }

    const swapIds = (ownedSwaps ?? []).map((row) => row.id);
    if (!swapIds.length) {
      setReceivedReviews([]);
      return;
    }

    const { data: reviewRows, error: reviewsError } = await supabase
      .from('swap_reviews')
      .select('id, swap_id, reviewer_id, rating, feedback, created_at')
      .in('swap_id', swapIds)
      .neq('reviewer_id', userId)
      .order('created_at', { ascending: false });
    if (reviewsError) {
      showToast(`Could not load your reviews: ${reviewsError.message}`);
      return;
    }

    const reviewerIds = Array.from(new Set((reviewRows ?? []).map((row) => row.reviewer_id)));
    const { data: reviewerProfiles } = reviewerIds.length
      ? await supabase.from('profiles').select('id, name, avatar').in('id', reviewerIds)
      : { data: [] };
    const profilesById = new Map((reviewerProfiles ?? []).map((row) => [row.id, row]));
    const swapsById = new Map((ownedSwaps ?? []).map((row) => [row.id, row]));
    const ownMentorIds = new Set(mentorIds);

    setReceivedReviews((reviewRows ?? [])
      .filter((row) => {
        const swap = swapsById.get(row.swap_id);
        return swap && (swap.requester_id === userId || ownMentorIds.has(swap.mentor_id));
      })
      .map((row) => {
        const reviewer = profilesById.get(row.reviewer_id);
        return {
          id: row.id,
          authorName: reviewer?.name ?? 'Community Member',
          authorAvatar: reviewer?.avatar || generateInitialsAvatar(reviewer?.name ?? 'Community Member'),
          rating: Number(row.rating),
          date: new Date(row.created_at).toLocaleDateString(),
          comment: row.feedback || 'No written feedback provided.',
          skillExchanged: 'Skill exchange',
        };
      }));
  }, []);

  const hydrateSwapRequests = useCallback(async (userId?: string) => {
    if (!userId) {
      setActiveSwaps([]);
      setIncomingRequests([]);
      return;
    }

    const { data: outgoingRows, error: outgoingError } = await supabase
      .from('swaps')
      .select('*')
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });

    const { data: mentorRows } = await supabase
      .from('mentors')
      .select('id')
      .eq('user_id', userId);

    const mentorIds = (mentorRows ?? []).map((row) => row.id);
    const { data: incomingRows, error: incomingError } = mentorIds.length > 0
      ? await supabase.from('swaps').select('*').in('mentor_id', mentorIds).order('created_at', { ascending: false })
      : { data: [], error: null };

    const { data: reviewRows, error: reviewError } = await supabase
      .from('swap_reviews')
      .select('swap_id')
      .eq('reviewer_id', userId);

    const combinedRows = [...(outgoingRows ?? []), ...(incomingRows ?? [])]
      .filter((row) => row.status !== 'declined')
      .filter((row, index, rows) => rows.findIndex((candidate) => candidate.id === row.id) === index);

    if (outgoingError || incomingError || reviewError) {
      showToast(`Could not load swap requests: ${(outgoingError ?? incomingError ?? reviewError)?.message}`);
      setActiveSwaps([]);
      setIncomingRequests([]);
      return;
    }

    const allMentorIds = Array.from(new Set(combinedRows.map((row) => row.mentor_id)));
    const { data: mentorUserRows } = allMentorIds.length > 0
      ? await supabase.from('mentors').select('id, user_id').in('id', allMentorIds)
      : { data: [] as Array<{ id: string; user_id: string }> };

    const mentorUserIdByMentorId = new Map((mentorUserRows ?? []).map((row) => [row.id, row.user_id]));
    const profileIds = Array.from(new Set([
      ...combinedRows.map((row) => row.requester_id),
      ...Array.from(mentorUserIdByMentorId.values()),
    ]));

    const { data: profileRows } = profileIds.length > 0
      ? await supabase.from('profiles').select('*').in('id', profileIds)
      : { data: [] as Record<string, any>[] };

    const profilesById = new Map((profileRows ?? []).map((row) => [row.id, row]));
    const reviewedSwapIds = new Set((reviewRows ?? []).map((row) => row.swap_id));

    const mappedSwaps = combinedRows.map((row) => {
      const isOutgoing = row.requester_id === userId;
      const partnerUserId = isOutgoing
        ? mentorUserIdByMentorId.get(row.mentor_id)
        : row.requester_id;
      const partnerProfile = partnerUserId ? profilesById.get(partnerUserId) : null;

      if (!partnerProfile) return null;

      const counterMentor = rowToMentor(
        partnerProfile,
        userId,
        toSkillNames(partnerProfile.skills_teach),
        toSkillNames(partnerProfile.skills_learn),
      );

      if (!counterMentor) return null;

      return {
        id: row.id,
        mentor: counterMentor,
        skillYouTeach: row.offered_skill || 'Skill',
        skillYouLearn: row.requested_skill || 'Skill',
        status: toDbSwapStatus(row.status),
        nextSession: row.next_session?.date
          ? `${row.next_session.date}${row.next_session.time ? ` at ${row.next_session.time}` : ''}`
          : row.next_session ? 'Meeting details available' : 'Awaiting acceptance',
        hoursCompleted: 0,
        totalHoursPlanned: 4,
        lastMessage: row.current_goal || 'New swap request',
        progressPercent: Number(row.progress_percent ?? 0),
        partnerProfile: rowToProfile(partnerProfile, partnerProfile.email ?? ''),
        reviewSubmitted: reviewedSwapIds.has(row.id),
      } as ActiveSwap;
    }).filter((swap): swap is ActiveSwap => swap !== null);

    const outgoing = mappedSwaps.filter((swap) => {
      const original = combinedRows.find((row) => row.id === swap.id);
      return original?.requester_id === userId;
    });
    const incoming = mappedSwaps.filter((swap) => {
      const original = combinedRows.find((row) => row.id === swap.id);
      return original && original.requester_id !== userId;
    });

    setActiveSwaps(outgoing);
    setIncomingRequests(incoming);
  }, []);

  // Modals
  const [requestSwapMentor, setRequestSwapMentor] = useState<Mentor | null>(null);
  const [viewProfileMentor, setViewProfileMentor] = useState<Mentor | null>(null);

  // Global toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── Supabase session restore on mount ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await loadMentors(session?.user?.id);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) setCurrentUser(rowToProfile(profile, session.user.email ?? ''));
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadMentors]);

  useEffect(() => {
    const channel = supabase
      .channel('profiles-discover')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
        const { data: { user } } = await supabase.auth.getUser();
        await loadMentors(user?.id);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadMentors]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase
      .channel(`swaps-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'swaps' }, async () => {
        await hydrateSwapRequests(currentUser.id);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUser?.id, hydrateSwapRequests]);

  // ── Auth handlers ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentUser?.id) {
      void loadMentors(currentUser.id);
      void (async () => {
        await ensureOwnMentorRecord(currentUser);
        await hydrateSwapRequests(currentUser.id);
        await hydrateReceivedReviews(currentUser.id);
      })();
    }
  }, [currentUser, loadMentors, hydrateSwapRequests, hydrateReceivedReviews]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab('discover');
    setRequestSwapMentor(null);
    setViewProfileMentor(null);
    showToast('Logged out successfully.');
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    if (!updated.id) {
      throw new Error('You must be signed in to update your profile.');
    }

    const { error } = await supabase.from('profiles').upsert({
      id: updated.id,
      email: updated.email ?? '',
      name: updated.name,
      phone: updated.phone ?? null,
      bio: updated.bio,
      timezone: updated.timezone,
      skills_teach: updated.teaches,
      skills_learn: updated.wantsToLearn,
    }, { onConflict: 'id' });

    if (error) {
      throw new Error(`Could not save profile preferences: ${error.message}`);
    }

    setCurrentUser(updated);
    await ensureOwnMentorRecord(updated);
  };

  // ── Swap handlers ──────────────────────────────────────────────────────────
  const handleLoadMore = () => setHasMore(false);

  const handleRequestSwap = (mentor: Mentor) => setRequestSwapMentor(mentor);
  const handleViewProfile = (mentor: Mentor) => setViewProfileMentor(mentor);

  const handleSubmitSwapProposal = async (proposal: {
    mentor: Mentor;
    skillYouTeach: string;
    skillYouLearn: string;
    weeklyHours: number;
    message: string;
  }) => {
    if (!currentUser?.id) return;

    const requestId = crypto.randomUUID();
    const optimisticSwap: ActiveSwap = {
      id: requestId,
      mentor: proposal.mentor,
      skillYouTeach: proposal.skillYouTeach,
      skillYouLearn: proposal.skillYouLearn,
      status: 'pending',
      nextSession: 'Awaiting acceptance',
      hoursCompleted: 0,
      totalHoursPlanned: proposal.weeklyHours * 4,
      lastMessage: proposal.message,
      progressPercent: 0,
    };

    setActiveSwaps((prev) => [optimisticSwap, ...prev]);

    const mentorRowId = await ensureMentorRecord(proposal.mentor);
    if (!mentorRowId) {
      showToast('This mentor profile is not ready for swaps. Run the mentor migration in Supabase, then try again.');
      setRequestSwapMentor(null);
      return;
    }

    const { data, error } = await supabase
      .from('swaps')
      .insert([{
        requester_id: currentUser.id,
        mentor_id: mentorRowId,
        title: `${proposal.skillYouTeach} ↔ ${proposal.skillYouLearn}`,
        category: 'swap',
        offered_skill: proposal.skillYouTeach,
        requested_skill: proposal.skillYouLearn,
        status: 'needs_scheduling',
        current_goal: proposal.message || 'Swap request created',
        next_session: { duration_hours: proposal.weeklyHours, status: 'pending' },
      }])
      .select()
      .single();

    if (error) {
      showToast(`Could not save swap request: ${error.message}`);
      setActiveSwaps((prev) => prev.filter((swap) => swap.id !== requestId));
      setRequestSwapMentor(null);
      return;
    }

    setActiveSwaps((prev) => prev.map((swap) => swap.id === requestId ? {
      ...swap,
      id: data.id,
      status: 'pending',
      nextSession: 'Awaiting acceptance',
    } : swap));

    if (proposal.mentor.id === currentUser.id) {
      setIncomingRequests((prev) => [optimisticSwap, ...prev]);
    }

    setRequestSwapMentor(null);
    showToast(`Swap request sent to ${proposal.mentor.name}! View it in My Learning.`);
    await hydrateSwapRequests(currentUser.id);
  };

  const updateSwapStatus = async (swapId: string, status: 'accepted' | 'declined' | 'completed' | 'cancelled') => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(swapId)) {
      showToast('This swap is still being saved. Please try again in a moment.');
      return;
    }

    const { error } = await supabase.from('swaps').update({ status }).eq('id', swapId);
    if (error) {
      const action = status === 'accepted' ? 'accept' : status === 'declined' ? 'decline' : status === 'completed' ? 'complete' : 'cancel';
      showToast(`Could not ${action} request: ${error.message}`);
      return;
    }
    await hydrateSwapRequests(currentUser?.id);
    showToast(
      status === 'accepted'
        ? 'Swap request accepted.'
        : status === 'declined'
          ? 'Swap request declined.'
          : status === 'completed'
            ? 'Swap marked as completed.'
            : 'Swap cancelled.',
    );
  };

  const handleAcceptRequest = (swapId: string) => updateSwapStatus(swapId, 'accepted');
  const handleDeclineRequest = (swapId: string) => updateSwapStatus(swapId, 'declined');
  const handleScheduleMeeting = async (swapId: string, date: string, time: string) => {
    const { error } = await supabase
      .from('swaps')
      .update({ next_session: { date, time, status: 'scheduled' } })
      .eq('id', swapId);
    if (error) {
      showToast(`Could not schedule meeting: ${error.message}`);
      return;
    }
    await hydrateSwapRequests(currentUser?.id);
    showToast('Meeting scheduled successfully.');
  };
  const handleCompleteSkill = (swapId: string) => updateSwapStatus(swapId, 'completed');
  const handleCancelSwap = (swapId: string) => {
    if (window.confirm('Cancel this swap? Both participants will be able to leave feedback.')) {
      void updateSwapStatus(swapId, 'cancelled');
    }
  };
  const handleSubmitReview = async (swapId: string, rating: number, feedback: string) => {
    if (!currentUser?.id) return;
    const { error } = await supabase.from('swap_reviews').insert({
      swap_id: swapId,
      reviewer_id: currentUser.id,
      rating,
      feedback: feedback.trim(),
    });
    if (error) {
      showToast(`Could not save feedback: ${error.message}`);
      return;
    }
    await hydrateSwapRequests(currentUser.id);
    showToast('Your rating and feedback were saved.');
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#3525cd] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#777587] font-medium">Loading SkillHub AI...</p>
        </div>
      </div>
    );
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#00a86b]" />
            <span>{toastMessage}</span>
          </div>
        )}
        <AuthScreen onLogin={handleLogin} />
      </>
    );
  }

  // ── Authenticated app ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e] selection:bg-[#3525cd]/15 selection:text-[#3525cd]">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#00a86b]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activeTab === 'discover' && (
          <DiscoverScreen
            mentors={mentors}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            onRequestSwap={handleRequestSwap}
            onViewProfile={handleViewProfile}
          />
        )}
        {activeTab === 'my-learning' && (
          <MyLearningScreen
            swaps={activeSwaps}
            currentUser={currentUser}
            incomingRequests={incomingRequests}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onScheduleMeeting={handleScheduleMeeting}
            onCompleteSkill={handleCompleteSkill}
            onCancelSwap={handleCancelSwap}
            onSubmitReview={handleSubmitReview}
            onNavigateToDiscover={() => setActiveTab('discover')}
            onViewMentor={handleViewProfile}
          />
        )}
        {activeTab === 'ai-studio' && <AIStudioScreen currentUser={currentUser} />}
        {activeTab === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            receivedReviews={receivedReviews}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      <RequestSwapModal
        mentor={requestSwapMentor}
        currentUser={currentUser}
        onClose={() => setRequestSwapMentor(null)}
        onSubmitSwap={handleSubmitSwapProposal}
      />

      <MentorProfileModal
        mentor={viewProfileMentor}
        onClose={() => setViewProfileMentor(null)}
        onRequestSwap={handleRequestSwap}
      />

      <Footer />
    </div>
  );
}
