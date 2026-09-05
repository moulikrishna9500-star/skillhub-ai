import React, { useState } from 'react';
import { BookOpen, BriefcaseBusiness, CheckCircle2, ExternalLink, Loader2, Map, Sparkles, Target } from 'lucide-react';
import { ExperienceLevel, fetchFreeResources, generateRoadmap, getSkillRecommendations, Recommendation, Resource, RoadmapResult, ResourcesResult, RecommendationsResult } from '../services/ai';
import { UserProfile } from '../types';

type Tool = 'resources' | 'recommendations' | 'roadmap';

interface Props { currentUser: UserProfile; }

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-[#ffdad6] bg-[#fff5f4] p-4 text-sm text-[#ba1a1a]">{message}</div>
);

export const AIStudioScreen: React.FC<Props> = ({ currentUser }) => {
  const [tool, setTool] = useState<Tool>('resources');
  const [level, setLevel] = useState<ExperienceLevel>('intermediate');
  const [skill, setSkill] = useState(currentUser.wantsToLearn[0] || '');
  const [careerGoal, setCareerGoal] = useState('');
  const [startingSkill, setStartingSkill] = useState(currentUser.teaches[0] || '');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ResourcesResult | RecommendationsResult | RoadmapResult | null>(null);

  const run = async () => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      if (tool === 'resources') {
        if (!skill.trim()) throw new Error('Enter a skill to find resources.');
        setResult(await fetchFreeResources(skill.trim(), level));
      } else if (tool === 'recommendations') {
        if (!currentUser.teaches.length && !currentUser.wantsToLearn.length) throw new Error('Add at least one skill to your profile first.');
        setResult(await getSkillRecommendations([...new Set([...currentUser.teaches, ...currentUser.wantsToLearn])], careerGoal.trim() || undefined, level));
      } else {
        if (!startingSkill.trim() || !targetRole.trim()) throw new Error('Enter a starting skill and target role.');
        setResult(await generateRoadmap(startingSkill.trim(), targetRole.trim(), level));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The AI request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    { id: 'resources' as Tool, label: 'Free resources', icon: BookOpen, text: 'Find current courses, docs, and practice.' },
    { id: 'recommendations' as Tool, label: 'Next skills', icon: Target, text: 'Discover skills that complement yours.' },
    { id: 'roadmap' as Tool, label: 'Learning roadmap', icon: Map, text: 'Build a focused six-month plan.' },
  ];

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#eaedff] px-3 py-1 text-xs font-bold text-[#3525cd]"><Sparkles className="h-3.5 w-3.5" /> OpenRouter learning copilot</div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">AI Studio</h1>
        <p className="mt-1 max-w-2xl text-sm sm:text-base text-[#464555]">Turn your skills into a practical, free learning plan. Results are generated for your goals and experience level.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          {tools.map(({ id, label, icon: Icon, text }) => (
            <button key={id} onClick={() => { setTool(id); setResult(null); setError(''); }} className={`w-full rounded-2xl border p-4 text-left transition-colors ${tool === id ? 'border-[#dad7ff] bg-[#eaedff]' : 'border-[#e2e8f0] bg-white hover:bg-[#faf8ff]'}`}>
              <Icon className={`h-5 w-5 ${tool === id ? 'text-[#3525cd]' : 'text-[#777587]'}`} />
              <span className="mt-3 block text-sm font-bold">{label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-[#777587]">{text}</span>
            </button>
          ))}
        </aside>
        <section className="min-w-0">
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {tool === 'resources' && <Field label="Skill to learn" value={skill} onChange={setSkill} placeholder="e.g. TypeScript" />}
              {tool === 'recommendations' && <Field label="Career goal (optional)" value={careerGoal} onChange={setCareerGoal} placeholder="e.g. Become a product engineer" />}
              {tool === 'roadmap' && <><Field label="Starting skill" value={startingSkill} onChange={setStartingSkill} placeholder="e.g. JavaScript" /><Field label="Target role" value={targetRole} onChange={setTargetRole} placeholder="e.g. Frontend engineer" /></>}
              <label className="block sm:w-44"><span className="mb-1.5 block text-xs font-bold text-[#464555]">Experience</span><select value={level} onChange={(e) => setLevel(e.target.value as ExperienceLevel)} className="h-11 w-full rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm focus:border-[#3525cd] focus:outline-none"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
              <button onClick={run} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-semibold text-white hover:bg-[#2b1cb5] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading ? 'Thinking...' : 'Generate'}</button>
            </div>
          </div>
          <div className="mt-6 space-y-4">{error && <ErrorMessage message={error} />}{result && <ResultView tool={tool} result={result} />}</div>
        </section>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) => <label className="block min-w-0 flex-1"><span className="mb-1.5 block text-xs font-bold text-[#464555]">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-[#e2e8f0] px-3 text-sm focus:border-[#3525cd] focus:outline-none" /></label>;

const ResultView = ({ tool, result }: { tool: Tool; result: ResourcesResult | RecommendationsResult | RoadmapResult }) => {
  if (tool === 'resources') {
    const data = result as ResourcesResult;
    return <><Header title={`${data.totalResourcesFound || data.resources?.length || 0} free resources for ${data.skill}`} icon={BookOpen} /><div className="grid gap-3 md:grid-cols-2">{(data.resources || []).map((item: Resource) => <article key={item.id} className="rounded-2xl border border-[#e2e8f0] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><span className="text-[11px] font-bold uppercase tracking-wider text-[#3525cd]">{item.type}</span><h3 className="mt-1 font-bold">{item.title}</h3></div><a href={item.url} target="_blank" rel="noreferrer" className="rounded-lg bg-[#eaedff] p-2 text-[#3525cd]" aria-label={`Open ${item.title}`}><ExternalLink className="h-4 w-4" /></a></div><p className="mt-2 text-sm leading-relaxed text-[#777587]">{item.description}</p><div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-[#464555]"><span className="rounded-md bg-[#f1f5f9] px-2 py-1">{item.difficulty || 'All levels'}</span>{item.quality && <span className="rounded-md bg-[#e8fbf3] px-2 py-1 text-[#00714d]">{item.quality}</span>}{item.duration && <span className="rounded-md bg-[#f1f5f9] px-2 py-1">{item.duration}</span>}</div></article>)}</div>{data.summary?.recommendedLearningPath && <Callout text={data.summary.recommendedLearningPath} />}</>;
  }
  if (tool === 'recommendations') {
    const data = result as RecommendationsResult;
    return <><Header title="Your next best skills" icon={BriefcaseBusiness} /><div className="space-y-3">{(data.recommendations || []).map((item: Recommendation) => <article key={item.rank} className="rounded-2xl border border-[#e2e8f0] bg-white p-5"><div className="flex flex-wrap items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3525cd] text-xs font-bold text-white">{item.rank}</span><h3 className="text-base font-bold">{item.skill}</h3><span className="rounded-full bg-[#eaedff] px-2.5 py-1 text-[11px] font-bold text-[#3525cd]">{item.jobMarketDemand} demand</span></div><p className="mt-3 text-sm leading-relaxed text-[#464555]">{item.reason}</p><div className="mt-3 grid gap-2 text-xs text-[#777587] sm:grid-cols-3"><span><b className="text-[#131b2e]">Time:</b> {item.estimatedHours}h / {item.estimatedWeeks} weeks</span><span><b className="text-[#131b2e]">Growth:</b> {item.jobGrowthRate}</span><span><b className="text-[#131b2e]">Salary impact:</b> {item.salaryImpact}</span></div></article>)}</div>{data.summary?.careerOutcome && <Callout text={data.summary.careerOutcome} />}</>;
  }
  const data = result as RoadmapResult;
  return <><Header title={`${data.totalDuration}: ${data.targetRole}`} icon={Map} /><div className="mb-4 rounded-2xl border border-[#e2e8f0] bg-white p-5"><p className="text-sm text-[#464555]">{data.summary?.careerOutcome}</p><div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[#3525cd]"><span>{data.summary?.jobReadinessLevel || 'Job-ready focus'}</span><span>{data.summary?.timeToHireability || 'Project-led progression'}</span></div></div><div className="space-y-3">{(data.phases || []).map((phase) => <details key={phase.phase} open={phase.phase === 1} className="group rounded-2xl border border-[#e2e8f0] bg-white p-5"><summary className="cursor-pointer list-none"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaedff] text-sm font-bold text-[#3525cd]">{phase.phase}</span><div><p className="text-xs font-bold uppercase tracking-wider text-[#777587]">{phase.month} · {phase.hoursPerWeek}h/week</p><h3 className="mt-1 text-base font-bold">{phase.title}</h3></div></div></summary><div className="ml-11 mt-4 space-y-3 border-t border-[#f1f5f9] pt-4 text-sm"><p className="text-[#464555]">{phase.description}</p><p><b>Skills:</b> {phase.skillsToLearn?.join(', ')}</p>{phase.projects?.map((project) => <div key={project.name} className="rounded-xl bg-[#faf8ff] p-3"><b>{project.name}</b><p className="mt-1 text-xs text-[#777587]">{project.description}</p></div>)}<p className="text-xs text-[#00714d]"><b>Success:</b> {phase.successMetrics?.join(' · ')}</p></div></details>)}</div>{data.summary?.nextSteps && <Callout text={data.summary.nextSteps} />}</>;
};

const Header = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => <h2 className="mb-3 flex items-center gap-2 text-base font-bold"><Icon className="h-4 w-4 text-[#3525cd]" />{title}</h2>;
const Callout = ({ text }: { text: string }) => <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#6cf8bb] bg-[#e8fbf3] p-4 text-sm text-[#00714d]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{text}</div>;
