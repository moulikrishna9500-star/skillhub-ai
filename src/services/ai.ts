export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Resource {
  id: number;
  type: string;
  title: string;
  url: string;
  description: string;
  difficulty?: string;
  quality?: string;
  duration?: string;
  learningOutcome?: string;
  platform?: string;
  channel?: string;
  author?: string;
}

export interface ResourcesResult {
  skill: string;
  totalResourcesFound: number;
  resources: Resource[];
  summary: {
    totalLearningHours?: number;
    recommendedLearningPath?: string;
    bestForBeginners?: number[];
    bestForPractice?: number[];
  };
}

export interface Recommendation {
  rank: number;
  skill: string;
  category: string;
  reason: string;
  difficulty: string;
  estimatedHours: number;
  estimatedWeeks: number;
  jobMarketDemand: string;
  jobGrowthRate: string;
  salaryImpact: string;
  careerPaths: string[];
  learningPath: string;
}

export interface RecommendationsResult {
  currentSkills: string[];
  careerGoal: string;
  recommendations: Recommendation[];
  summary: {
    recommendedSequence?: number[];
    totalLearningHours?: number;
    estimatedTimeToMastery?: string;
    careerOutcome?: string;
  };
}

export interface RoadmapPhase {
  phase: number;
  month: string;
  title: string;
  description: string;
  skillsToLearn: string[];
  hoursPerWeek: number;
  difficulty: string;
  projects: { name: string; description: string; duration?: string }[];
  milestones: string[];
  successMetrics: string[];
}

export interface RoadmapResult {
  startingSkill: string;
  targetRole: string;
  experienceLevel: string;
  totalDuration: string;
  prerequisitesMet: boolean;
  prerequisites: string[];
  phases: RoadmapPhase[];
  summary: {
    totalLearningHours?: number;
    careerOutcome?: string;
    timeToHireability?: string;
    jobReadinessLevel?: string;
    nextSteps?: string;
  };
  motivationTips: string[];
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const getOpenRouterConfig = () => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter is not configured. Add VITE_OPENROUTER_API_KEY to your environment.');
  }
  return {
    apiKey,
    model: import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/auto',
  };
};

const isTransientOpenRouterError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { status?: number; code?: number; message?: string };
  return [429, 500, 503].includes(Number(candidate.status ?? candidate.code))
    || /high demand|temporarily unavailable|overloaded|rate limit/i.test(candidate.message || '');
};

const getInFlightBudgetMessage = (response: Response, details: string) => {
  if (response.status !== 402) return null;

  try {
    const payload = JSON.parse(details) as {
      error?: {
        message?: string;
        metadata?: { reason?: string };
      };
    };
    if (payload.error?.metadata?.reason !== 'in_flight_budget_exhausted') return null;
  } catch {
    return null;
  }

  const retryAfter = Number(response.headers.get('Retry-After'));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    const minutes = Math.ceil(retryAfter / 60);
    return `OpenRouter is processing other requests right now. Please try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`;
  }
  return 'OpenRouter is processing other requests right now. Please try again shortly.';
};

const parseJsonResponse = <T>(text: string): T => {
  const normalized = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return JSON.parse(normalized) as T;
  } catch {
    for (let start = normalized.indexOf('{'); start !== -1; start = normalized.indexOf('{', start + 1)) {
      let depth = 0;
      let inString = false;
      let escaped = false;

      for (let index = start; index < normalized.length; index += 1) {
        const character = normalized[index];
        if (inString) {
          if (escaped) escaped = false;
          else if (character === '\\') escaped = true;
          else if (character === '"') inString = false;
          continue;
        }
        if (character === '"') {
          inString = true;
        } else if (character === '{') {
          depth += 1;
        } else if (character === '}' && --depth === 0) {
          try {
            return JSON.parse(normalized.slice(start, index + 1)) as T;
          } catch {
            break;
          }
        }
      }
    }
    throw new Error('No valid JSON object found.');
  }
};

const AI_DEADLINE_MS = 45_000;

const generateJson = async <T>(prompt: string): Promise<T> => {
  const { apiKey, model } = getOpenRouterConfig();
  let timeoutId: number | undefined;

  try {
    const request = fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SkillHub AI',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        reasoning: { effort: 'low' },
        response_format: { type: 'json_object' },
        plugins: [{ id: 'web' }],
      }),
    });

    const timeout = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(
        () => reject(new Error('AI generation timed out after 18 seconds. Please try a shorter request again.')),
        AI_DEADLINE_MS,
      );
    });

    const response = await Promise.race([request, timeout]);

    if (!response.ok) {
      const details = await response.text();
      const inFlightBudgetMessage = getInFlightBudgetMessage(response, details);
      if (inFlightBudgetMessage) throw new Error(inFlightBudgetMessage);
      if (response.status === 401) {
        throw new Error('OpenRouter authentication failed. Set VITE_OPENROUTER_API_KEY to a valid API key and try again.');
      }

      const error = new Error(`OpenRouter request failed with status ${response.status}: ${details}`);
      Object.assign(error, { status: response.status });
      throw error;
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        finish_reason?: string;
        message?: {
          content?: string | Array<{ text?: string }>;
          refusal?: string | null;
        };
      }>;
      error?: { message?: string };
    };

    if (payload.error?.message) throw new Error(`OpenRouter error: ${payload.error.message}`);

    const choice = payload.choices?.[0];
    const content = choice?.message?.content;
    const text = (typeof content === 'string' ? content : content?.map((part) => part.text || '').join('') ?? '').trim();

    if (!text) {
      if (choice?.message?.refusal) throw new Error(`OpenRouter refused the request: ${choice.message.refusal}`);
      if (choice?.finish_reason === 'length') throw new Error('OpenRouter response was truncated. Please try again.');
      throw new Error('OpenRouter returned an empty response. Please try again.');
    }

    try {
      return parseJsonResponse<T>(text);
    } catch {
      throw new Error('OpenRouter returned invalid JSON. Please try again.');
    }
  } catch (error) {
    if (isTransientOpenRouterError(error)) {
      throw new Error('OpenRouter is temporarily busy. Please try again in a few seconds.');
    }
    throw error;
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
};

export const fetchFreeResources = async (skill: string, level?: ExperienceLevel) => {
  return await generateJson<ResourcesResult>(`You are an expert learning resource curator. Use web search when available to find 10 real, current, completely free resources for "${skill}"${level ? ` at ${level} level` : ''}.
Prefer official documentation, reputable YouTube courses, GitHub projects, and free interactive courses. Never invent URLs; use exact clickable URLs. Return only JSON with this shape:
{"skill":"${skill}","totalResourcesFound":10,"resources":[{"id":1,"type":"youtube|blog|github|documentation|interactive","title":"","url":"","description":"","difficulty":"Beginner|Intermediate|Advanced","quality":"Excellent|Good|Fair","duration":"","learningOutcome":"","platform":"","channel":"","author":""}],"summary":{"totalLearningHours":0,"recommendedLearningPath":"","bestForBeginners":[1],"bestForPractice":[2]}}`);
};

export const getSkillRecommendations = async (currentSkills: string[], careerGoal?: string, experienceLevel?: ExperienceLevel) => {
  return await generateJson<RecommendationsResult>(`You are a career development AI expert. Use current job-market information from web search when available. Current skills: ${currentSkills.join(', ')}. Career goal: ${careerGoal || 'not specified'}. Experience: ${experienceLevel || 'intermediate'}.
Recommend exactly 5 valuable next skills, considering progression, market demand, complementary skills, and future-proofing. Return only JSON:
{"currentSkills":${JSON.stringify(currentSkills)},"careerGoal":"${careerGoal || 'Not specified'}","recommendations":[{"rank":1,"skill":"","category":"","reason":"","difficulty":"","estimatedHours":0,"estimatedWeeks":0,"jobMarketDemand":"","jobGrowthRate":"","salaryImpact":"","careerPaths":[],"learningPath":""}],"summary":{"recommendedSequence":[1,2,3,4,5],"totalLearningHours":0,"estimatedTimeToMastery":"","careerOutcome":""}}`);
};

export const generateRoadmap = async (startingSkill: string, targetRole: string, experienceLevel: ExperienceLevel = 'intermediate') => {
  return await generateJson<RoadmapResult>(`You are an expert learning path designer. Create a practical, personalized six-month roadmap from "${startingSkill}" to "${targetRole}" for a ${experienceLevel} learner. Return only valid JSON with populated values. The phases array must contain exactly three phases: phase 1 for months 1-2, phase 2 for months 3-4, and phase 3 for months 5-6. Include realistic projects in every phase and interview preparation in phase 3. Use this exact structure:
{"startingSkill":"${startingSkill}","targetRole":"${targetRole}","experienceLevel":"${experienceLevel}","totalDuration":"6 months","prerequisitesMet":true,"prerequisites":[],"phases":[{"phase":1,"month":"Month 1-2","title":"","description":"","skillsToLearn":[],"hoursPerWeek":0,"difficulty":"","projects":[{"name":"","description":"","duration":""}],"milestones":[],"successMetrics":[]},{"phase":2,"month":"Month 3-4","title":"","description":"","skillsToLearn":[],"hoursPerWeek":0,"difficulty":"","projects":[{"name":"","description":"","duration":""}],"milestones":[],"successMetrics":[]},{"phase":3,"month":"Month 5-6","title":"","description":"","skillsToLearn":[],"hoursPerWeek":0,"difficulty":"","projects":[{"name":"","description":"","duration":""}],"milestones":[],"successMetrics":[]}],"summary":{"totalLearningHours":0,"careerOutcome":"","timeToHireability":"","jobReadinessLevel":"","nextSteps":""},"motivationTips":[]}`);
};
