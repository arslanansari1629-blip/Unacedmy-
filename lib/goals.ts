export type Goal = {
  slug: string;
  name: string;
  emoji: string;
  category: Category;
  short?: string;
};

export type Category =
  | 'STATE & CIVIL SERVICES'
  | 'SCHOOL & ENGINEERING'
  | 'GOVT & BANKING'
  | 'MBA & SKILLS'
  | 'ENGINEERING & SCIENCE'
  | 'COMMERCE & LAW';

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[()/,]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const raw: Array<[string, string, Category]> = [
  ['UPSC Civil Services (IAS)', '🏛️', 'STATE & CIVIL SERVICES'],
  ['JEE Main & Advanced', '⚗️', 'SCHOOL & ENGINEERING'],
  ['NEET UG', '🧬', 'SCHOOL & ENGINEERING'],
  ['SSC Exams', '📋', 'GOVT & BANKING'],
  ['GRE', '🌍', 'MBA & SKILLS'],
  ['CAT', '📊', 'MBA & SKILLS'],
  ['NTA UGC NET', '🎓', 'ENGINEERING & SCIENCE'],
  ['Bank Exams', '🏦', 'GOVT & BANKING'],
  ['CA (Chartered Accountancy)', '💼', 'COMMERCE & LAW'],
  ['Law Entrance Exams', '⚖️', 'COMMERCE & LAW'],
  ['IELTS', '🗣️', 'MBA & SKILLS'],
  ['MP PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['Maharashtra PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['Punjab PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['Railway Exams', '🚂', 'GOVT & BANKING'],
  ['Rajasthan PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['UP PSC / UPSSSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['English Language', '🔤', 'GOVT & BANKING'],
  ['Campus Placements', '💻', 'MBA & SKILLS'],
  ['Class 9', '📚', 'SCHOOL & ENGINEERING'],
  ['Class 10', '📚', 'SCHOOL & ENGINEERING'],
  ['Class 11', '📚', 'SCHOOL & ENGINEERING'],
  ['Personal Development', '🌟', 'GOVT & BANKING'],
  ['Tamil Nadu PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['CDS / AFCAT / CAPF', '🪖', 'MBA & SKILLS'],
  ['GMAT', '📈', 'MBA & SKILLS'],
  ['GATE', '⚙️', 'ENGINEERING & SCIENCE'],
  ['Karnataka PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['AP PSC / Telangana PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['GATE - CSIT, DSAI', '⚙️', 'ENGINEERING & SCIENCE'],
  ['Kerala PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['Gujarat PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['West Bengal PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['DSSSB', '🏙️', 'STATE & CIVIL SERVICES'],
  ['CSIR UGC NET', '🔬', 'ENGINEERING & SCIENCE'],
  ['BPSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['TET', '👩‍🏫', 'STATE & CIVIL SERVICES'],
  ['UPTET', '👩‍🏫', 'STATE & CIVIL SERVICES'],
  ['Class 12 Board', '📚', 'SCHOOL & ENGINEERING'],
  ['OPSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['Haryana PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['Jammu & Kashmir PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['IIT JAM', '🔭', 'ENGINEERING & SCIENCE'],
  ['NEET PG', '🩺', 'SCHOOL & ENGINEERING'],
  ['MP TET', '👩‍🏫', 'STATE & CIVIL SERVICES'],
  ['Jharkhand PSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['Programming', '💻', 'MBA & SKILLS'],
  ['Company Secretary', '📑', 'COMMERCE & LAW'],
  ['Rajasthan TET', '👩‍🏫', 'STATE & CIVIL SERVICES'],
  ['Haryana TET', '👩‍🏫', 'STATE & CIVIL SERVICES'],
  ['NDA / Airforce X-Y / Navy', '✈️', 'GOVT & BANKING'],
  ['HPPSC', '🗺️', 'STATE & CIVIL SERVICES'],
  ['Engineering Services Exam', '🔧', 'ENGINEERING & SCIENCE'],
  ['Foundation NTSE', '🏆', 'COMMERCE & LAW'],
];

export const goals: Goal[] = raw.map(([name, emoji, category]) => ({
  slug: slugify(name),
  name,
  emoji,
  category,
}));

export const categories: Category[] = [
  'SCHOOL & ENGINEERING',
  'STATE & CIVIL SERVICES',
  'GOVT & BANKING',
  'ENGINEERING & SCIENCE',
  'MBA & SKILLS',
  'COMMERCE & LAW',
];

export const quickPicks = ['JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'Class 12'];

export const getGoal = (slug: string) => goals.find((g) => g.slug === slug);
