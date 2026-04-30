const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Role = 'user' | 'assistant';

type ChatMessage = {
  role: Role;
  content: string;
};

type SkillScore = { skill: string; current: number; required: number };
type CategoryScore = { category: string; score: number };
type JobRecommendation = {
  title: string;
  company: string;
  matchPercent: number;
  location: string;
  description: string;
};
type SalaryInsights = {
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  currency: string;
  roleBreakdown: { level: string; salary: string }[];
};
type RoadmapItem = {
  title: string;
  source: string;
  url: string;
  duration: string;
  skillCovered: string;
};
type InterviewQuestion = {
  question: string;
  sampleAnswer: string;
  difficulty: string;
};
type AnalysisResult = {
  score: number;
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  skillScores: SkillScore[];
  categoryScores: CategoryScore[];
  jobRecommendations: JobRecommendation[];
  salaryInsights: SalaryInsights;
  aiSummary: string;
  learningRoadmap: RoadmapItem[];
  modifiedResume: string;
  interviewQuestions: InterviewQuestion[];
  mockInterviewQuestions: InterviewQuestion[];
  chatbotResponse: string;
};

type RequestBody = {
  resumeText?: string;
  targetRole?: string;
  jobRole?: string;
  action?: 'analyze' | 'chat' | 'interview' | 'ping';
  messages?: ChatMessage[];
};

const TRUSTED_LINKS = {
  html: { source: 'W3Schools', url: 'https://www.w3schools.com/html/', title: 'HTML Tutorial' },
  css: { source: 'W3Schools', url: 'https://www.w3schools.com/css/', title: 'CSS Tutorial' },
  javascript: { source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', title: 'JavaScript Guide' },
  typescript: { source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', title: 'JavaScript Foundations for TypeScript' },
  react: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/', title: 'Front End Development Libraries' },
  node: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/', title: 'Back End Development and APIs' },
  express: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/', title: 'Node and Express APIs' },
  sql: { source: 'W3Schools', url: 'https://www.w3schools.com/sql/', title: 'SQL Tutorial' },
  mysql: { source: 'W3Schools', url: 'https://www.w3schools.com/sql/', title: 'SQL and Relational Databases' },
  postgres: { source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction', title: 'Server-side Web Development Intro' },
  mongodb: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/', title: 'MongoDB and APIs' },
  python: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/', title: 'Scientific Computing with Python' },
  java: { source: 'W3Schools', url: 'https://www.w3schools.com/java/', title: 'Java Tutorial' },
  c: { source: 'W3Schools', url: 'https://www.w3schools.com/c/', title: 'C Tutorial' },
  api: { source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/API', title: 'Web APIs' },
  rest: { source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', title: 'HTTP and REST Basics' },
  git: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/learn-git-and-version-control/', title: 'Git and Version Control' },
  github: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/learn-git-and-version-control/', title: 'GitHub Workflow Basics' },
  docker: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/docker-simplified-96639a35ff36/', title: 'Docker Basics' },
  aws: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/aws-for-beginners/', title: 'AWS for Beginners' },
  testing: { source: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Testing_strategies', title: 'Testing Strategies' },
  dsa: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/', title: 'Algorithms and Data Structures' },
  problem: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/', title: 'Problem Solving Practice' },
  default: { source: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/', title: 'General Learning Path' },
} as const;

const ROLE_SKILL_LIBRARY: Record<string, string[]> = {
  'web developer': ['HTML', 'CSS', 'JavaScript', 'Responsive Design', 'Git', 'REST APIs', 'Debugging', 'React', 'Node.js', 'SQL'],
  'frontend developer': ['HTML', 'CSS', 'JavaScript', 'Responsive Design', 'React', 'TypeScript', 'Git', 'Accessibility', 'Testing', 'REST APIs'],
  'backend developer': ['Node.js', 'Express', 'REST APIs', 'SQL', 'Database Design', 'Authentication', 'Git', 'Debugging', 'Testing', 'System Design'],
  'full stack developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'SQL', 'REST APIs', 'Git', 'Testing'],
  'python developer': ['Python', 'SQL', 'APIs', 'Git', 'Debugging', 'Testing', 'Data Structures', 'Problem Solving', 'Flask', 'Database Design'],
  'java developer': ['Java', 'OOP', 'SQL', 'Git', 'Spring', 'REST APIs', 'Debugging', 'Testing', 'Data Structures', 'Problem Solving'],
  'data analyst': ['SQL', 'Python', 'Excel', 'Statistics', 'Data Visualization', 'Pandas', 'Problem Solving', 'Communication', 'Reporting', 'Data Cleaning'],
  'software engineer': ['Programming', 'Data Structures', 'Algorithms', 'Git', 'Debugging', 'Problem Solving', 'REST APIs', 'SQL', 'Testing', 'System Design'],
};

const FALLBACK_JOB_TITLES = [
  'Junior Web Developer',
  'Frontend Developer Intern',
  'Software Developer Trainee',
  'UI Developer',
  'Backend Developer Intern',
  'Full Stack Developer Intern',
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sanitizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeSkill(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^basic\s+/i, '')
    .replace(/^core\s+/i, '')
    .replace(/^fundamentals\s+of\s+/i, '')
    .replace(/^knowledge\s+of\s+/i, '');
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function uniqueStrings(items: string[]): string[] {
  return Array.from(new Set(items.map(normalizeSkill).filter(Boolean)));
}

function extractResumeSkills(resumeText: string): string[] {
  const lower = resumeText.toLowerCase();
  const vocabulary = new Set<string>();
  const candidates = [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB',
    'Python', 'Java', 'C', 'C++', 'Git', 'GitHub', 'REST APIs', 'API Design', 'Responsive Design', 'Accessibility',
    'Testing', 'Debugging', 'Data Structures', 'Algorithms', 'Problem Solving', 'Prompt Engineering', 'Generative AI',
    'Web Development', 'Communication', 'Teamwork', 'Leadership', 'Time Management', 'Adaptability', 'OOP', 'Excel',
    'Statistics', 'Data Visualization', 'Pandas', 'Flask', 'Spring', 'Authentication', 'Database Design', 'System Design',
    'UI/UX', 'Figma', 'AWS', 'Docker', 'Public Speaking'
  ];

  for (const skill of candidates) {
    const pattern = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${pattern}\\b`, 'i').test(lower)) {
      vocabulary.add(skill);
    }
  }

  const lines = resumeText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const skillSectionIndex = lines.findIndex((line) => /skills|technical skills|technologies/i.test(line));
  if (skillSectionIndex >= 0) {
    const slice = lines.slice(skillSectionIndex + 1, skillSectionIndex + 12).join(', ');
    slice
      .split(/[,•|/]/)
      .map((part) => part.replace(/^[A-Za-z\s]+:/, '').trim())
      .filter((part) => /^[A-Za-z0-9+.#\-\s]{2,40}$/.test(part))
      .forEach((part) => vocabulary.add(titleCase(part)));
  }

  return uniqueStrings(Array.from(vocabulary));
}

function inferRoleSkills(jobRole: string): string[] {
  const normalizedRole = jobRole.toLowerCase().trim();
  for (const [role, skills] of Object.entries(ROLE_SKILL_LIBRARY)) {
    if (normalizedRole.includes(role)) return skills;
  }
  if (normalizedRole.includes('web')) return ROLE_SKILL_LIBRARY['web developer'];
  if (normalizedRole.includes('front')) return ROLE_SKILL_LIBRARY['frontend developer'];
  if (normalizedRole.includes('back')) return ROLE_SKILL_LIBRARY['backend developer'];
  if (normalizedRole.includes('full')) return ROLE_SKILL_LIBRARY['full stack developer'];
  if (normalizedRole.includes('python')) return ROLE_SKILL_LIBRARY['python developer'];
  if (normalizedRole.includes('java')) return ROLE_SKILL_LIBRARY['java developer'];
  if (normalizedRole.includes('data')) return ROLE_SKILL_LIBRARY['data analyst'];
  return ROLE_SKILL_LIBRARY['software engineer'];
}

function skillLookupKey(skill: string): keyof typeof TRUSTED_LINKS {
  const value = skill.toLowerCase();
  if (value.includes('html')) return 'html';
  if (value.includes('css')) return 'css';
  if (value.includes('typescript')) return 'typescript';
  if (value.includes('javascript')) return 'javascript';
  if (value.includes('react')) return 'react';
  if (value.includes('node')) return 'node';
  if (value.includes('express')) return 'express';
  if (value.includes('mysql')) return 'mysql';
  if (value.includes('postgres')) return 'postgres';
  if (value.includes('sql') || value.includes('database')) return 'sql';
  if (value.includes('mongodb')) return 'mongodb';
  if (value.includes('python')) return 'python';
  if (value.includes('java')) return 'java';
  if (value === 'c' || value.includes('c programming')) return 'c';
  if (value.includes('api')) return 'api';
  if (value.includes('rest')) return 'rest';
  if (value.includes('git') && value.includes('hub')) return 'github';
  if (value.includes('git')) return 'git';
  if (value.includes('docker')) return 'docker';
  if (value.includes('aws')) return 'aws';
  if (value.includes('test')) return 'testing';
  if (value.includes('algorithm') || value.includes('data structure')) return 'dsa';
  if (value.includes('problem')) return 'problem';
  return 'default';
}

function makeRoadmap(missingSkills: string[]): RoadmapItem[] {
  const roadmap = missingSkills.map((skill, index) => {
    const link = TRUSTED_LINKS[skillLookupKey(skill)];
    return {
      title: `${skill} Learning Path`,
      source: link.source,
      url: link.url,
      duration: `${2 + (index % 4)} weeks`,
      skillCovered: skill,
    };
  });

  return roadmap.filter((item, index, arr) => arr.findIndex((entry) => entry.url === item.url && entry.skillCovered === item.skillCovered) === index);
}

function makeSkillScores(roleSkills: string[], resumeSkills: string[], matchedSkills: string[], missingSkills: string[]): SkillScore[] {
  const selected = uniqueStrings([...roleSkills, ...resumeSkills]).slice(0, 12);
  return selected.map((skill, index) => {
    const matched = matchedSkills.includes(skill);
    const missing = missingSkills.includes(skill);
    const current = matched ? 70 + (index % 25) : resumeSkills.includes(skill) ? 45 + (index % 20) : 10 + (index % 15);
    const required = roleSkills.includes(skill) ? 80 + (index % 15) : 55 + (index % 10);
    return { skill, current: Math.min(current, 100), required: Math.min(required, 100) };
  });
}

function makeCategoryScores(overallScore: number, matchedCount: number, missingCount: number, resumeSkills: string[]): CategoryScore[] {
  const communicationBonus = resumeSkills.some((skill) => /communication|leadership|teamwork|public speaking/i.test(skill)) ? 12 : 0;
  return [
    { category: 'Technical Skills', score: Math.max(20, overallScore) },
    { category: 'Problem Solving', score: Math.min(100, 35 + matchedCount * 8) },
    { category: 'Tools & Workflow', score: Math.min(100, 30 + Math.max(0, matchedCount - 1) * 9) },
    { category: 'Communication', score: Math.min(100, 40 + communicationBonus) },
    { category: 'Role Readiness', score: Math.max(15, overallScore - missingCount * 3) },
  ];
}

function makeJobRecommendations(jobRole: string, matchedSkills: string[], resumeSkills: string[]): JobRecommendation[] {
  const normalizedRole = titleCase(jobRole || 'Software Engineer');
  const baseRoles = [
    normalizedRole,
    matchedSkills.includes('React') || matchedSkills.includes('HTML') ? 'Frontend Developer' : '',
    matchedSkills.includes('Node.js') || matchedSkills.includes('SQL') ? 'Backend Developer' : '',
    matchedSkills.includes('React') && matchedSkills.includes('Node.js') ? 'Full Stack Developer' : '',
    ...FALLBACK_JOB_TITLES,
  ].filter(Boolean);

  const uniqueRoles = Array.from(new Set(baseRoles)).slice(0, 5);
  return uniqueRoles.map((title, index) => ({
    title,
    company: ['TechNova', 'CodeBridge', 'NextWave Labs', 'PixelSprint', 'CloudAxis'][index % 5],
    matchPercent: Math.max(55, Math.min(96, 58 + matchedSkills.length * 6 - index * 4 + (resumeSkills.length % 7))),
    location: ['Remote', 'Hyderabad', 'Bengaluru', 'Pune', 'Chennai'][index % 5],
    description: `Role focused on ${matchedSkills.slice(0, 3).join(', ') || 'core development skills'} with growth opportunities in ${title.toLowerCase()}.`,
  }));
}

function makeSalaryInsights(jobRole: string, overallScore: number): SalaryInsights {
  const multiplier = Math.max(0.7, overallScore / 100);
  const roleKey = jobRole.toLowerCase();
  const base = roleKey.includes('intern') ? 300000 : roleKey.includes('senior') ? 900000 : 450000;
  const minSalary = Math.round(base * multiplier);
  const avgSalary = Math.round(minSalary * 1.25);
  const maxSalary = Math.round(avgSalary * 1.35);
  return {
    minSalary,
    avgSalary,
    maxSalary,
    currency: 'INR',
    roleBreakdown: [
      { level: 'Entry', salary: `₹${Math.round(minSalary / 100000)}L - ₹${Math.round(avgSalary / 100000)}L` },
      { level: 'Mid', salary: `₹${Math.round(avgSalary / 100000)}L - ₹${Math.round((avgSalary * 1.2) / 100000)}L` },
      { level: 'Growth', salary: `₹${Math.round((avgSalary * 1.1) / 100000)}L - ₹${Math.round(maxSalary / 100000)}L` },
    ],
  };
}

function mergeIntoSkillsSection(resumeText: string, missingSkills: string[], matchedSkills: string[]): string {
  const recommended = uniqueStrings([...matchedSkills, ...missingSkills]);
  if (!recommended.length) return resumeText;

  const lines = resumeText.split(/\r?\n/);
  const sectionIndex = lines.findIndex((line) => /technical skills|skills/i.test(line));
  if (sectionIndex === -1) {
    return `${resumeText.trim()}\n\nSKILLS:\n${recommended.join(', ')}`.trim();
  }

  let insertIndex = sectionIndex + 1;
  while (insertIndex < lines.length) {
    const line = lines[insertIndex].trim();
    if (!line) {
      insertIndex += 1;
      continue;
    }
    if (/^[A-Z][A-Z\s&]+:?$/.test(line) && !/^[A-Za-z\s]+:/.test(line)) {
      break;
    }
    insertIndex += 1;
  }

  const existingBlock = lines.slice(sectionIndex + 1, insertIndex).join(' ');
  const existingSkills = uniqueStrings(existingBlock.split(/[,•|/]/).map((part) => part.replace(/^[A-Za-z\s]+:/, '').trim()));
  const mergedSkills = uniqueStrings([...existingSkills, ...recommended]);
  const replacement = [`Skills: ${mergedSkills.join(', ')}`];

  return [...lines.slice(0, sectionIndex + 1), ...replacement, ...lines.slice(insertIndex)].join('\n').replace(/\n{3,}/g, '\n\n');
}

function makeInterviewQuestions(jobRole: string, matchedSkills: string[], missingSkills: string[]): InterviewQuestion[] {
  const role = titleCase(jobRole || 'Software Engineer');
  const focusSkills = uniqueStrings([...matchedSkills, ...missingSkills]).slice(0, 6);
  const baseQuestions = focusSkills.map((skill, index) => ({
    question: `How would you apply ${skill} in a ${role} project?`,
    sampleAnswer: `Explain the context, the tools you would use, and how ${skill} improves delivery quality for the project.`,
    difficulty: index < 2 ? 'Easy' : index < 4 ? 'Medium' : 'Hard',
  }));

  while (baseQuestions.length < 10) {
    const index = baseQuestions.length + 1;
    baseQuestions.push({
      question: `Describe a project decision you would make to improve performance or maintainability as a ${role}.`,
      sampleAnswer: 'Use a structured example covering the problem, your reasoning, the implementation choice, and the measurable impact.',
      difficulty: index % 3 === 0 ? 'Hard' : 'Medium',
    });
  }

  return baseQuestions.slice(0, 10);
}

function makeSummary(jobRole: string, matchedSkills: string[], missingSkills: string[]): string {
  const role = titleCase(jobRole || 'Software Engineer');
  const strengths = matchedSkills.length ? matchedSkills.slice(0, 4).join(', ') : 'core programming fundamentals';
  const gaps = missingSkills.length ? missingSkills.slice(0, 4).join(', ') : 'no major skill gaps';
  return `This resume shows a credible foundation for a ${role} path, especially in ${strengths}. The profile already signals hands-on exposure and enough baseline knowledge to target entry-level or internship opportunities.\n\nTo improve competitiveness, focus next on ${gaps}. Closing these gaps will raise role readiness, strengthen interviews, and make the profile align more closely with current hiring expectations.`;
}

function makeSuggestions(jobRole: string, missingSkills: string[]): string[] {
  const role = titleCase(jobRole || 'Software Engineer');
  if (!missingSkills.length) {
    return [`Your resume already aligns strongly with the ${role} role; keep building stronger project depth and measurable outcomes.`];
  }

  return missingSkills.slice(0, 5).map((skill) => `Add ${skill} to your project work and resume examples to strengthen your fit for ${role} roles.`);
}

function makeChatbotReply(messages: ChatMessage[] | undefined, jobRole: string, matchedSkills: string[], missingSkills: string[]): string {
  const lastUserMessage = [...(messages || [])].reverse().find((message) => message.role === 'user')?.content ?? '';
  const role = titleCase(jobRole || 'Software Engineer');
  return `For the ${role} path, your strongest signals are ${matchedSkills.slice(0, 3).join(', ') || 'your current fundamentals'}. I would next focus on ${missingSkills.slice(0, 3).join(', ') || 'deeper project work'} based on your question: "${lastUserMessage}".`;
}

function analyzeResume(resumeText: string, jobRole: string, messages?: ChatMessage[]): AnalysisResult {
  const resumeSkills = extractResumeSkills(resumeText);
  const roleSkills = inferRoleSkills(jobRole);
  const matchedSkills = roleSkills.filter((skill) => resumeSkills.some((resumeSkill) => resumeSkill.toLowerCase() === skill.toLowerCase()));
  let missingSkills = roleSkills.filter((skill) => !matchedSkills.some((matched) => matched.toLowerCase() === skill.toLowerCase()));

  let overallScore = Math.round((matchedSkills.length / Math.max(1, matchedSkills.length + missingSkills.length)) * 100);

  if (overallScore < 100 && missingSkills.length === 0) {
    missingSkills = ['Advanced Projects', 'Testing', 'Version Control'];
    overallScore = Math.min(overallScore, 85);
  }

  const learningRoadmap = makeRoadmap(missingSkills.slice(0, 6));
  const result: AnalysisResult = {
    score: overallScore,
    overallScore,
    matchedSkills,
    missingSkills,
    suggestions: makeSuggestions(jobRole, missingSkills),
    skillScores: makeSkillScores(roleSkills, resumeSkills, matchedSkills, missingSkills),
    categoryScores: makeCategoryScores(overallScore, matchedSkills.length, missingSkills.length, resumeSkills),
    jobRecommendations: makeJobRecommendations(jobRole, matchedSkills, resumeSkills),
    salaryInsights: makeSalaryInsights(jobRole, overallScore),
    aiSummary: makeSummary(jobRole, matchedSkills, missingSkills),
    learningRoadmap,
    modifiedResume: mergeIntoSkillsSection(resumeText, missingSkills, matchedSkills),
    interviewQuestions: makeInterviewQuestions(jobRole, matchedSkills, missingSkills),
    mockInterviewQuestions: makeInterviewQuestions(jobRole, matchedSkills, missingSkills),
    chatbotResponse: makeChatbotReply(messages, jobRole, matchedSkills, missingSkills),
  };

  return result;
}

function streamTextResponse(content: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const chunks = content.match(/.{1,24}/g) ?? [content];
      for (const chunk of chunks) {
        const payload = `data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = (await req.json()) as RequestBody;
    const action = body.action ?? 'analyze';
    const resumeText = sanitizeText(body.resumeText);
    const jobRole = sanitizeText(body.targetRole || body.jobRole);

    console.log('[analyze-resume] request', JSON.stringify({
      action,
      jobRole,
      resumeLength: resumeText.length,
      messagesCount: body.messages?.length ?? 0,
    }));

    if (action === 'ping') {
      const payload = {
        ok: true,
        function: 'analyze-resume',
        timestamp: new Date().toISOString(),
      };
      console.log('[analyze-resume] response', JSON.stringify(payload));
      return jsonResponse(payload);
    }

    if ((action === 'analyze' || action === 'chat' || action === 'interview') && !jobRole) {
      return jsonResponse({ error: 'targetRole is required' }, 400);
    }

    const syntheticResume = resumeText || (body.messages || []).map((message) => message.content).join('\n');
    if ((action === 'analyze' || action === 'chat' || action === 'interview') && !syntheticResume.trim()) {
      return jsonResponse({ error: 'resumeText or messages content is required' }, 400);
    }

    const analysis = analyzeResume(syntheticResume, jobRole, body.messages);

    if (action === 'chat') {
      console.log('[analyze-resume] chat response', JSON.stringify({ preview: analysis.chatbotResponse.slice(0, 120) }));
      return streamTextResponse(analysis.chatbotResponse);
    }

    if (action === 'interview') {
      const prompt = body.messages && body.messages.length > 1
        ? `Feedback: focus on clarity, structure, and examples. Next question: ${analysis.interviewQuestions[1]?.question ?? analysis.interviewQuestions[0]?.question}`
        : analysis.interviewQuestions[0]?.question ?? `Tell me about yourself as a ${titleCase(jobRole)} candidate.`;
      console.log('[analyze-resume] interview response', JSON.stringify({ preview: prompt.slice(0, 120) }));
      return streamTextResponse(prompt);
    }

    console.log('[analyze-resume] response', JSON.stringify({
      overallScore: analysis.overallScore,
      matchedSkills: analysis.matchedSkills.length,
      missingSkills: analysis.missingSkills.length,
      jobs: analysis.jobRecommendations.length,
      roadmap: analysis.learningRoadmap.length,
    }));

    return jsonResponse(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[analyze-resume] error', message);
    return jsonResponse({ error: message }, 500);
  }
});
