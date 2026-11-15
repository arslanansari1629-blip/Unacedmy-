import { goals, Goal } from './goals';

export type Lecture = {
  id: string;
  title: string;
  educator: string;
  duration: string;
  lectures: number;
  level: 'Foundation' | 'Intermediate' | 'Advanced' | 'Crash Course';
  tag: string;
};

export type Pdf = {
  id: string;
  title: string;
  pages: number;
  kind: 'Handwritten Notes' | 'Slide PDF' | 'Formula Sheet' | 'PYQ Paper' | 'Revision Notes';
  topics: string[];
};

export type Educator = {
  id: string;
  name: string;
  subject: string;
  initials: string;
  lectures: number;
  rating: number;
};

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const pick = <T,>(arr: T[], seed: number, offset = 0) => arr[(seed + offset) % arr.length];

const SUBJECT_BANK: Record<string, string[]> = {
  'STATE & CIVIL SERVICES': ['Polity', 'Modern History', 'Geography', 'Economy', 'Environment & Ecology', 'Current Affairs', 'Answer Writing', 'Governance'],
  'SCHOOL & ENGINEERING': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Organic Chemistry', 'Calculus', 'Mechanics', 'Botany'],
  'GOVT & BANKING': ['Quantitative Aptitude', 'Reasoning', 'General Awareness', 'English', 'Computer Knowledge', 'Data Interpretation', 'Vocabulary'],
  'MBA & SKILLS': ['Verbal Ability', 'Logical Reasoning', 'Data Insights', 'Communication', 'Aptitude', 'Case Studies', 'Interview Craft'],
  'ENGINEERING & SCIENCE': ['Data Structures', 'Algorithms', 'Operating Systems', 'Databases', 'Computer Networks', 'Discrete Maths', 'Linear Algebra', 'Digital Logic'],
  'COMMERCE & LAW': ['Accounting', 'Business Law', 'Taxation', 'Contract Law', 'Constitutional Law', 'Auditing', 'Economics'],
};

const EDUCATORS = [
  'Dr. Aakash Verma', 'Ritu Sharma', 'Sandeep Kaushik', 'Neha Bansal', 'Vikram Rathore',
  'Ananya Iyer', 'Rohit Malhotra', 'Shalini Gupta', 'Karan Deshmukh', 'Meera Nair',
  'Prateek Joshi', 'Farhan Qureshi', 'Divya Menon', 'Arjun Chauhan', 'Sneha Pillai',
];

const TOPIC_TEMPLATES = [
  (s: string) => `${s} — Complete Revision in One Shot`,
  (s: string) => `${s}: Concept Builders & Solved Examples`,
  (s: string) => `${s} Marathon | Most Expected Questions`,
  (s: string) => `${s} Fundamentals for Beginners`,
  (s: string) => `High-Yield ${s} | Last 30 Days Strategy`,
  (s: string) => `${s} PYQ Breakdown (2019–2025)`,
  (s: string) => `${s} Doubt Clearing Session`,
  (s: string) => `${s} Advanced Problem Solving`,
];

export function buildLectures(goal: Goal): Lecture[] {
  const seed = hash(goal.slug);
  const subjects = SUBJECT_BANK[goal.category];
  return Array.from({ length: 8 }, (_, i) => {
    const subject = pick(subjects, seed, i);
    const educator = pick(EDUCATORS, seed, i * 3);
    const level = (['Foundation', 'Intermediate', 'Advanced', 'Crash Course'] as const)[(seed + i) % 4];
    return {
      id: `${goal.slug}-lec-${i + 1}`,
      title: TOPIC_TEMPLATES[(seed + i) % TOPIC_TEMPLATES.length](subject),
      educator,
      duration: `${((seed + i * 7) % 6) + 1}h ${((seed + i * 11) % 5) * 10 + 5}m`,
      lectures: ((seed + i * 13) % 18) + 4,
      level,
      tag: subject,
    };
  });
}

export function buildPdfs(goal: Goal): Pdf[] {
  const seed = hash(goal.slug) + 17;
  const subjects = SUBJECT_BANK[goal.category];
  const kinds = ['Handwritten Notes', 'Slide PDF', 'Formula Sheet', 'PYQ Paper', 'Revision Notes'] as const;
  return Array.from({ length: 8 }, (_, i) => {
    const subjectsPick = [pick(subjects, seed, i), pick(subjects, seed, i + 2), pick(subjects, seed, i + 4)];
    return {
      id: `${goal.slug}-pdf-${i + 1}`,
      title: `${subjectsPick[0]} ${kinds[(seed + i) % kinds.length]}`,
      pages: ((seed + i * 23) % 180) + 12,
      kind: kinds[(seed + i) % kinds.length],
      topics: Array.from(new Set(subjectsPick)),
    };
  });
}

export function buildEducators(goal: Goal): Educator[] {
  const seed = hash(goal.slug) + 41;
  const subjects = SUBJECT_BANK[goal.category];
  return Array.from({ length: 6 }, (_, i) => {
    const name = pick(EDUCATORS, seed, i * 5);
    return {
      id: `${goal.slug}-edu-${i + 1}`,
      name,
      subject: pick(subjects, seed, i),
      initials: name
        .replace(/^Dr\.\s*/, '')
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2),
      lectures: ((seed + i * 31) % 90) + 20,
      rating: Math.round((4 + ((seed + i * 3) % 10) / 10) * 10) / 10,
    };
  });
}

export const featuredGoals = ['jee-main-and-advanced', 'neet-ug', 'upsc-civil-services-ias', 'gate', 'ssc-exams', 'cat']
  .map((slug) => goals.find((g) => g.slug === slug))
  .filter((g): g is Goal => Boolean(g));

export const totalLectures = goals.length * 8;
