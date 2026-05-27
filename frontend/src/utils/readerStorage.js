const HISTORY_KEY = 'reader_reading_history';
const LANG_KEY = 'reader_preferred_language';
const MAX_HISTORY = 50;

export function getPreferredLanguage() {
  return localStorage.getItem(LANG_KEY) || 'en';
}

export function setPreferredLanguage(code) {
  localStorage.setItem(LANG_KEY, code);
}

export function getReadingHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToReadingHistory(post) {
  if (!post?.slug) return;
  const history = getReadingHistory().filter((h) => h.slug !== post.slug);
  const entry = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    image: post.image || null,
    categoryName: post.category_detail?.name || null,
    readAt: new Date().toISOString(),
  };
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

export function getReaderStats() {
  const history = getReadingHistory();
  const uniqueSlugs = new Set(history.map((h) => h.slug));
  const thisWeek = history.filter((h) => {
    const d = new Date(h.readAt);
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  }).length;

  return {
    totalReads: history.length,
    uniquePosts: uniqueSlugs.size,
    readsThisWeek: thisWeek,
    recentReads: history.slice(0, 5),
  };
}
