import { UPSTREAM_ORIGIN } from './upstream';

/** Shape of the upstream list endpoints (Django-style pagination). */
export type Page<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export type Teacher = {
  first_name?: string;
  last_name?: string;
  username: string;
  uid: string;
  avatar?: string;
  intro_photo?: string;
  permalink?: string;
  topics_display?: string;
  avg_rating?: string | null;
  bio?: string;
  followers_count?: string;
  is_verified_educator?: boolean;
  topic?: string;
  level_info?: { follower_count?: number };
  avatar_v1_web?: string;
  avatar_v2?: string;
  credentials?: Record<string, Array<{ title?: string }>>;
};

export type Course = {
  uid: string;
  name: string;
  slug?: string;
  thumbnail?: string;
  thumbnail_v1?: string;
  item_count?: number;
  view_count?: number;
  language_display?: string;
  permalink?: string;
  goal_uid?: string;
  starts_at?: string;
  ends_at?: string;
  author?: { username?: string; first_name?: string; last_name?: string; avatar?: string };
  topic_groups?: Array<{ name: string; title?: string; uid: string; level?: number }>;
};

export type Lecture = {
  type?: string;
  rank?: number;
  value?: {
    uid: string;
    title: string;
    description?: string;
    slug?: string;
    permalink?: string;
    for_plus?: boolean;
    video?: unknown;
    live_class?: {
      video_url?: string;
      live_at?: string;
      started_at?: string;
      video_duration?: number;
      state?: number;
      slides_pdf?: { with_annotation?: string; no_annotation?: string };
      author?: { first_name?: string; last_name?: string; username?: string };
      practice_dpp?: unknown;
      learner_notes?: unknown;
    };
  };
};

/**
 * Unacademy's raw lecture media lives at
 * https://uamedia.uacdn.net/lesson-raw/<lesson uid>/output.webm
 * where <lesson uid> is the `uid` query param of the official player URL.
 * This is what makes a lecture directly playable.
 */
export function mediaFromVideoUrl(videoUrl?: string | null): string | null {
  if (!videoUrl) return null;
  try {
    const uid = new URL(videoUrl).searchParams.get('uid');
    if (!uid) return null;
    return `https://uamedia.uacdn.net/lesson-raw/${encodeURIComponent(uid)}/output.webm`;
  } catch {
    return null;
  }
}

export const teacherName = (t: Teacher) =>
  `${t.first_name ?? ''} ${t.last_name ?? ''}`.trim() || t.username;

export const teacherAvatar = (t: Teacher) => t.avatar_v2 ?? t.avatar ?? t.intro_photo ?? t.avatar_v1_web ?? '';

export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'ED';

async function getJson<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${UPSTREAM_ORIGIN}${path}`, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; StudyBison/1.0)', accept: 'application/json' },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Educators for a goal. */
export async function fetchTeachers(goalUid: string, offset = 0) {
  return getJson<Page<Teacher>>(`/api/teachers?goal_uid=${encodeURIComponent(goalUid)}&offset=${offset}`);
}

/** Courses of one educator (type: popular | recent | ...). */
export async function fetchCourses(username: string, offset = 0, type = 'popular') {
  return getJson<Page<Course>>(`/api/courses?username=${encodeURIComponent(username)}&offset=${offset}&type=${type}`);
}

/** Every lecture inside one course/batch. */
export async function fetchLectures(courseUid: string) {
  return getJson<Page<Lecture>>(`/api/lectures?uid=${encodeURIComponent(courseUid)}`);
}

/** Every educator of a goal, walking upstream pages (bounded). */
export async function fetchAllTeachers(goalUid: string, maxPages = 6) {
  const out: Teacher[] = [];
  for (let page = 0; page < maxPages; page += 1) {
    const chunk = await fetchTeachers(goalUid, page * 9);
    if (!chunk?.results?.length) break;
    out.push(...chunk.results);
    if (!chunk.next) break;
  }
  return out;
}

/** Every batch of one educator across pages (bounded). */
export async function fetchAllCourses(username: string, maxPages = 6, type = 'popular') {
  const out: Course[] = [];
  for (let page = 0; page < maxPages; page += 1) {
    const chunk = await fetchCourses(username, page * 12, type);
    if (!chunk?.results?.length) break;
    out.push(...chunk.results);
    if (!chunk.next) break;
  }
  return { count: out.length, results: out };
}

/** Fetch a page of all courses for a goal by walking its educators (bounded). */
export async function fetchGoalCatalogue(goalUid: string, maxTeachers = 4, perTeacher = 2) {
  const teachersPage = await fetchTeachers(goalUid);
  const teachers = teachersPage?.results ?? [];
  const picked = teachers.slice(0, maxTeachers);

  const perTeacherResults = await Promise.all(
    picked.map(async (t) => ({
      teacher: t,
      courses: (await fetchCourses(t.username, 0, 'popular'))?.results.slice(0, perTeacher) ?? [],
    })),
  );

  return {
    teacherCount: teachersPage?.count ?? teachers.length,
    teachers,
    perTeacherResults,
  };
}
