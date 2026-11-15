export type Goal = {
  /** Upstream goal UID used by the live API (goal_uid param). */
  uid: string;
  slug: string;
  name: string;
  emoji: string;
  category: Category;
};

export type Category =
  | 'School & Engineering'
  | 'State & Civil Services'
  | 'Govt & Banking'
  | 'MBA & Skills'
  | 'Engineering & Science'
  | 'Commerce & Law'
  | 'Medical';

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[()/,]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Category rule mirrors the upstream app's own grouping logic exactly. */
function groupFor(name: string): Category {
  const s = name.toLowerCase();
  if (s.includes('jee') || s.includes('neet') || s.includes('class ') || s.includes('board'))
    return 'School & Engineering';
  if (s.includes('psc') || s.includes('upsc') || s.includes('bpsc') || s.includes('dsssb') || s.includes('opsc') || s.includes('tet'))
    return 'State & Civil Services';
  if (s.includes('gate') || s.includes('csir') || s.includes('jam') || s.includes('ugc') || s.includes('ies') || s.includes('engineering'))
    return 'Engineering & Science';
  if (s.includes('cat') || s.includes('gre') || s.includes('gmat') || s.includes('ielts') || s.includes('placement') || s.includes('programming'))
    return 'MBA & Skills';
  if (s.includes('ca ') || s.includes('company') || s.includes('law') || s.includes('ntse')) return 'Commerce & Law';
  if (s.includes('neet pg')) return 'Medical';
  return 'Govt & Banking';
}

/** Real goal UIDs read from the source app's bundle — these drive every API call. */
const RAW: Array<[string, string, string]> = [
  ['KSCGY', 'UPSC Civil Services (IAS)', '🏛️'],
  ['TMUVD', 'JEE Main & Advanced', '⚗️'],
  ['YOTUH', 'NEET UG', '🧬'],
  ['VLEMN', 'SSC Exams', '📋'],
  ['MAFGF', 'GRE', '🌍'],
  ['XNDUS', 'CAT', '📊'],
  ['TEWDQ', 'NTA UGC NET', '🎓'],
  ['RTPSX', 'Bank Exams', '🏦'],
  ['BBKWG', 'CA (Chartered Accountancy)', '💼'],
  ['MRZFY', 'Law Entrance Exams', '⚖️'],
  ['DZVHL', 'IELTS', '🗣️'],
  ['GWDPV', 'MP PSC', '🗺️'],
  ['GNFFE', 'Maharashtra PSC', '🗺️'],
  ['FHWHO', 'Punjab PSC', '🗺️'],
  ['QJEJG', 'Railway Exams', '🚂'],
  ['SCANJ', 'Rajasthan PSC', '🗺️'],
  ['XCTVJ', 'UP PSC / UPSSSC', '🗺️'],
  ['EWFJR', 'English Language', '🔤'],
  ['NJHPJ', 'Campus Placements', '💻'],
  ['SUVLV', 'Class 9', '📚'],
  ['GSZGO', 'Class 10', '📚'],
  ['GWDPZ', 'Class 11', '📚'],
  ['DOZGI', 'Personal Development', '🌟'],
  ['ZISFF', 'Tamil Nadu PSC', '🗺️'],
  ['TUNWK', 'CDS / AFCAT / CAPF', '🪖'],
  ['LGQVU', 'GMAT', '📈'],
  ['PESHE', 'GATE', '⚙️'],
  ['LVECA', 'Karnataka PSC', '🗺️'],
  ['QKHZF', 'AP PSC / Telangana PSC', '🗺️'],
  ['NVLIA', 'GATE - CSIT, DSAI', '⚙️'],
  ['ZIUBD', 'Kerala PSC', '🗺️'],
  ['RJVOD', 'Gujarat PSC', '🗺️'],
  ['UQCMN', 'West Bengal PSC', '🗺️'],
  ['JJTHM', 'DSSSB', '🏙️'],
  ['BIZXQ', 'CSIR UGC NET', '🔬'],
  ['QOIVT', 'BPSC', '🗺️'],
  ['GMXMZ', 'TET', '👩‍🏫'],
  ['IFKUZ', 'UPTET', '👩‍🏫'],
  ['PLWCX', 'Class 12 Board', '📚'],
  ['XTKHH', 'OPSC', '🗺️'],
  ['ZKXEQ', 'Haryana PSC', '🗺️'],
  ['EGKYI', 'Jammu & Kashmir PSC', '🗺️'],
  ['SIFWL', 'IIT JAM', '🔭'],
  ['SDDOC', 'NEET PG', '🩺'],
  ['WXKBF', 'MP TET', '👩‍🏫'],
  ['AELON', 'Jharkhand PSC', '🗺️'],
  ['DOKOV', 'Programming', '💻'],
  ['MCRYW', 'Company Secretary', '📑'],
  ['SWBEI', 'Rajasthan TET', '👩‍🏫'],
  ['WJWZU', 'Haryana TET', '👩‍🏫'],
  ['DANNJ', 'NDA / Airforce X-Y / Navy', '✈️'],
  ['JXGKD', 'HPPSC', '🗺️'],
  ['QFJOA', 'Engineering Services Exam', '🔧'],
  ['TPSBK', 'Foundation NTSE', '🏆'],
];

export const goals: Goal[] = RAW.map(([uid, name, emoji]) => ({
  uid,
  slug: slugify(name),
  name,
  emoji,
  category: groupFor(name),
}));

export const categories: Category[] = [
  'School & Engineering',
  'State & Civil Services',
  'Govt & Banking',
  'Engineering & Science',
  'MBA & Skills',
  'Commerce & Law',
  'Medical',
];

export const quickPicks = ['JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'Class 12'];

export const getGoal = (slug: string) => goals.find((g) => g.slug === slug);
export const getGoalByUid = (uid: string) => goals.find((g) => g.uid === uid);
