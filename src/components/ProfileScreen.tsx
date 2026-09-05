import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  Clock,
  Award,
  ShieldCheck,
  Plus,
  X,
  Check,
  Edit3,
  BookOpen,
  ArrowLeftRight,
  User,
  Phone,
} from 'lucide-react';
import { Review, UserProfile } from '../types';

interface ProfileScreenProps {
  currentUser: UserProfile;
  receivedReviews: Review[];
  onUpdateProfile: (updated: UserProfile) => Promise<void>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  receivedReviews,
  onUpdateProfile,
}) => {
  const [profile, setProfile] = useState<UserProfile>(currentUser);
  const [newTeachSkill, setNewTeachSkill] = useState('');
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(currentUser.bio || '');

  // Edit general details
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [headlineInput, setHeadlineInput] = useState(currentUser.headline || '');
  const [locationInput, setLocationInput] = useState(currentUser.location || '');
  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '');

  const [saveToast, setSaveToast] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfile(currentUser);
    setBioInput(currentUser.bio || '');
    setNameInput(currentUser.name || '');
    setHeadlineInput(currentUser.headline || '');
    setLocationInput(currentUser.location || '');
    setPhoneInput(currentUser.phone || '');
  }, [currentUser]);

  const handleAddTeachSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const skill = newTeachSkill.trim();
    if (!skill || profile.teaches.includes(skill)) return;
    const updated = {
      ...profile,
      teaches: [...profile.teaches, skill],
    };
    if (await saveProfile(updated)) {
      setNewTeachSkill('');
    }
  };

  const handleRemoveTeachSkill = async (skill: string) => {
    const updated = {
      ...profile,
      teaches: profile.teaches.filter((s) => s !== skill),
    };
    await saveProfile(updated);
  };

  const handleAddLearnSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const skill = newLearnSkill.trim();
    if (!skill || profile.wantsToLearn.includes(skill)) return;
    const updated = {
      ...profile,
      wantsToLearn: [...profile.wantsToLearn, skill],
    };
    if (await saveProfile(updated)) {
      setNewLearnSkill('');
    }
  };

  const handleRemoveLearnSkill = async (skill: string) => {
    const updated = {
      ...profile,
      wantsToLearn: profile.wantsToLearn.filter((s) => s !== skill),
    };
    await saveProfile(updated);
  };

  const saveProfile = async (updated: UserProfile): Promise<boolean> => {
    if (isSaving) return false;
    setSaveError(null);
    setIsSaving(true);
    try {
      await onUpdateProfile(updated);
      setProfile(updated);
      triggerSaveToast();
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save profile preferences.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBio = async () => {
    const updated = { ...profile, bio: bioInput.trim() };
    await saveProfile(updated);
    setIsEditingBio(false);
  };

  const handleSaveDetails = async () => {
    if (!nameInput.trim()) return;
    const updated = {
      ...profile,
      name: nameInput.trim(),
      headline: headlineInput.trim() || 'Community Member & Skill Swapper',
      location: locationInput.trim() || 'Remote',
      phone: phoneInput.trim(),
    };
    await saveProfile(updated);
    setIsEditingDetails(false);
  };

  const triggerSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Toast */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#006c49] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>Profile preferences saved!</span>
        </div>
      )}
      {saveError && (
        <div className="fixed top-20 right-6 z-50 bg-red-50 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-red-200">
          {saveError}
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#f1f5f9]">
          <div className="flex items-start sm:items-center gap-5 w-full sm:w-auto">
            <div className="relative shrink-0">
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
              />
            </div>

            <div className="flex-1">
              {!isEditingDetails ? (
                <>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#131b2e]">{profile.name}</h1>
                    <span className="bg-[#6cf8bb]/20 text-[#00714d] text-xs font-bold px-3 py-1 rounded-full border border-[#6cf8bb]/40">
                      Verified Member
                    </span>
                    <button
                      onClick={() => setIsEditingDetails(true)}
                      className="text-xs text-[#3525cd] hover:underline flex items-center gap-1 cursor-pointer font-medium ml-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                  </div>
                  <p className="text-sm font-medium text-[#464555] mt-1">{profile.headline || 'SkillHub Community Member'}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#777587] mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.location || 'Remote'} ({profile.timezone || 'UTC'})
                    </span>
                    {profile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {profile.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-semibold text-[#131b2e]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {profile.reviewsCount > 0 ? `${profile.rating.toFixed(1)} (${profile.reviewsCount} reviews)` : 'No ratings yet'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="space-y-2.5 max-w-md">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777587] uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-lg text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#777587] uppercase mb-1">Headline</label>
                    <input
                      type="text"
                      value={headlineInput}
                      onChange={(e) => setHeadlineInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-lg text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#777587] uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-lg text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd]"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveDetails}
                      className="px-3.5 py-1.5 bg-[#3525cd] text-white text-xs font-semibold rounded-lg hover:bg-[#2b1cb5] cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditingDetails(false)}
                      className="px-3 py-1.5 border border-[#e2e8f0] text-[#777587] text-xs font-semibold rounded-lg hover:bg-[#f8fafc] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bio Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#777587] uppercase tracking-wider">
              About & Exchange Philosophy
            </span>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="text-xs text-[#3525cd] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingBio ? 'Cancel' : 'Edit Bio'}</span>
            </button>
          </div>

          {isEditingBio ? (
            <div className="space-y-3">
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={3}
                aria-label="Your biography and learning goals"
                className="w-full p-3 rounded-xl border border-[#e2e8f0] text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd]"
              />
              <button
                onClick={handleSaveBio}
                className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#2b1cb5] cursor-pointer"
              >
                Save Bio
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#131b2e] leading-relaxed">
              {profile.bio || (
                <span className="text-[#94a3b8] italic">
                  No bio provided yet. Click "Edit Bio" to describe your craft and what skills you want to trade.
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Skills Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* SKILLS I TEACH */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-[#00714d] uppercase tracking-wider block">
                Skills I Teach (Barter Offer)
              </span>
              <p className="text-xs text-[#777587] mt-0.5">
                Other mentors discover you when they want these skills.
              </p>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8fbf3] text-[#00714d]">
              {profile.teaches.length} Active
            </span>
          </div>

          {profile.teaches.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.teaches.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#e8fbf3] text-[#00714d] border border-[#6cf8bb]/40"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveTeachSkill(skill)}
                    className="hover:text-red-600 cursor-pointer"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <form onSubmit={handleAddTeachSkill} noValidate className="flex gap-2">
            <input
              type="text"
              value={newTeachSkill}
              onChange={(e) => setNewTeachSkill(e.target.value)}
              aria-label="Add skill to teach"
              className="flex-1 px-3.5 py-2 border border-[#e2e8f0] rounded-xl text-xs focus:outline-none focus:border-[#3525cd]"
            />
            <button
              type="submit"
              disabled={isSaving || !newTeachSkill.trim()}
              className="px-4 py-2 bg-[#006c49] text-white text-xs font-semibold rounded-xl hover:bg-[#005a3c] cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* SKILLS I WANT TO LEARN */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-[#3525cd] uppercase tracking-wider block">
                Skills I Want to Learn (Seek)
              </span>
              <p className="text-xs text-[#777587] mt-0.5">
                AI matches you with mentors who teach these topics.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#eaedff] text-[#3525cd]">
              {profile.wantsToLearn.length} Active
            </span>
          </div>

          {profile.wantsToLearn.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.wantsToLearn.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#eaedff] text-[#3525cd] border border-[#dad7ff]"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveLearnSkill(skill)}
                    className="hover:text-red-600 cursor-pointer"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <form onSubmit={handleAddLearnSkill} noValidate className="flex gap-2">
            <input
              type="text"
              value={newLearnSkill}
              onChange={(e) => setNewLearnSkill(e.target.value)}
              aria-label="Add skill to learn"
              className="flex-1 px-3.5 py-2 border border-[#e2e8f0] rounded-xl text-xs focus:outline-none focus:border-[#3525cd]"
            />
            <button
              type="submit"
              disabled={isSaving || !newLearnSkill.trim()}
              className="px-4 py-2 bg-[#3525cd] text-white text-xs font-semibold rounded-xl hover:bg-[#2b1cb5] cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      {/* Feedback from swap partners */}
      <div className="mb-8 bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#131b2e] mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          Feedback from swap partners
        </h3>
        {receivedReviews.length === 0 ? (
          <p className="text-sm text-[#777587]">No feedback received yet.</p>
        ) : (
          <div className="space-y-3">
            {receivedReviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-[#e2e8f0] bg-[#faf8ff] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <img src={review.authorAvatar} alt={review.authorName} className="h-8 w-8 rounded-full object-cover" />
                    <span className="text-sm font-bold text-[#131b2e]">{review.authorName}</span>
                  </div>
                  <span className="text-xs font-semibold text-amber-600">★ {review.rating}/5</span>
                </div>
                <p className="mt-2 text-sm text-[#464555]">{review.comment}</p>
                <p className="mt-2 text-[11px] text-[#777587]">{review.date}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Community Endorsements and Verified Status */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#131b2e] mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#3525cd]" />
          Verified Community Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#e2e8f0] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#00a86b] shrink-0" />
            <div>
              <span className="font-bold text-[#131b2e] block">Verified Member</span>
              <p className="text-[#777587] mt-1">Identity verified & fair barter pledge accepted.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#e2e8f0] flex items-start gap-3">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
            <div>
              <span className="font-bold text-[#131b2e] block">
                {profile.reviewsCount > 0 ? `${profile.rating.toFixed(1)} / 5.0 Rating` : 'New Member'}
              </span>
              <p className="text-[#777587] mt-1">
                {profile.reviewsCount > 0
                  ? `Based on ${profile.reviewsCount} verified swap reviews.`
                  : 'Ratings are updated after completing barter sessions.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
