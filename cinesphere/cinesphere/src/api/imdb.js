// ─── IMDB Unofficial API ──────────────────────────────────────────────────────
// Base: https://imdb.iamidiotareyoutoo.com
// Search: /search?q=<query>
// Detail: /title/<imdb_id>   (returns richer object with ratings, plot, etc.)
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://imdb.iamidiotareyoutoo.com'

// Low-level fetch wrapper
const get = async (path, params = {}) => {
  const url = new URL(`${BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`IMDB API error ${res.status}: ${res.statusText}`)
  const json = await res.json()
  if (!json.ok && json.error_code !== 200) {
    throw new Error(json.description || 'API returned an error')
  }
  return json
}

// ─── Normalise a raw search result item into our internal Movie shape ─────────
// Raw fields:  #TITLE  #YEAR  #IMDB_ID  #RANK  #ACTORS  #IMG_POSTER  #IMDB_URL
export function normalizeSearchItem(raw) {
  return {
    id: raw['#IMDB_ID'],          // e.g. "tt4574334"
    imdb_id: raw['#IMDB_ID'],
    title: raw['#TITLE'] || 'Untitled',
    year: raw['#YEAR'] ? String(raw['#YEAR']) : null,
    release_date: raw['#YEAR'] ? `${raw['#YEAR']}-01-01` : null,
    rank: raw['#RANK'] || null,
    actors: raw['#ACTORS'] || null,         // comma-separated string
    poster_path: null,                       // not used – we have full URL
    poster_url: raw['#IMG_POSTER'] || null,
    imdb_url: raw['#IMDB_URL'] || null,
    // Placeholders filled by detail call
    overview: null,
    vote_average: null,
    vote_count: null,
    genres: [],
    runtime: null,
    director: null,
    cast: [],
    similar: [],
    backdrop_url: null,
  }
}

// ─── Normalise a detail response ─────────────────────────────────────────────
// The /title/:id endpoint returns a richer object.  Field names vary by title
// but common ones are documented below.
export function normalizeDetail(raw, fallback = {}) {
  // Some fields come back as arrays, some as strings – handle both.
  const asString = (v) => (Array.isArray(v) ? v.join(', ') : v ?? null)
  const asArray  = (v) => (Array.isArray(v) ? v : v ? [v] : [])

  // Rating
  const ratingRaw = raw['#RATING'] ?? raw.rating ?? raw.Rating ?? null
  const voteCountRaw = raw['#VOTES'] ?? raw.Votes ?? null

  // Genres
  const genreRaw = raw['#GENRE'] ?? raw.Genre ?? raw.genre ?? null
  const genres = genreRaw
    ? asString(genreRaw).split(',').map((g, i) => ({ id: i, name: g.trim() }))
    : []

  // Runtime – may be "142 min" or a number
  const runtimeRaw = raw['#RUNTIME'] ?? raw.Runtime ?? null
  let runtime = null
  if (runtimeRaw) {
    const mins = parseInt(String(runtimeRaw).replace(/[^\d]/g, ''), 10)
    if (!isNaN(mins)) runtime = mins
  }

  // Cast / director
  const actorsRaw = raw['#ACTORS'] ?? raw.Actors ?? fallback.actors ?? null
  const directorRaw = raw['#DIRECTOR'] ?? raw.Director ?? fallback.director ?? null

  // Build cast array from actor string
  const cast = asString(actorsRaw)
    ? asString(actorsRaw).split(',').map((name, i) => ({
        id: `cast-${i}`,
        name: name.trim(),
        character: '',
        profile_path: null,
      }))
    : []

  // Plot / overview
  const overview =
    raw['#PLOT'] ?? raw.Plot ?? raw.plot ?? raw.description ?? fallback.overview ?? null

  // Poster
  const posterUrl = raw['#IMG_POSTER'] ?? raw.poster ?? fallback.poster_url ?? null

  // Release date
  const yearRaw = raw['#YEAR'] ?? raw.Year ?? fallback.year ?? null
  const releaseDate = yearRaw ? `${String(yearRaw).slice(0, 4)}-01-01` : null

  return {
    id: raw['#IMDB_ID'] ?? raw.imdbID ?? fallback.id,
    imdb_id: raw['#IMDB_ID'] ?? raw.imdbID ?? fallback.imdb_id,
    title: raw['#TITLE'] ?? raw.Title ?? fallback.title ?? 'Untitled',
    year: yearRaw ? String(yearRaw).slice(0, 4) : null,
    release_date: releaseDate,
    poster_url: posterUrl,
    poster_path: null,            // kept for MovieCard compat – see posterUrl()
    backdrop_url: null,           // API doesn't provide backdrops
    overview,
    vote_average: ratingRaw ? parseFloat(ratingRaw) : null,
    vote_count: voteCountRaw ? parseInt(String(voteCountRaw).replace(/[,\s]/g, ''), 10) : null,
    genres,
    runtime,
    director: asString(directorRaw),
    cast,
    similar: [],                  // API doesn't provide similar titles
    rank: raw['#RANK'] ?? fallback.rank ?? null,
    actors: asString(actorsRaw),
    imdb_url: raw['#IMDB_URL'] ?? fallback.imdb_url ?? null,
  }
}

// ─── Public API object ────────────────────────────────────────────────────────
export const imdb = {
  /**
   * Search by title keyword.  Returns an array of normalised movie objects.
   * The raw API returns up to ~20 results per query; pagination is not natively
   * supported so we slice client-side for a consistent UX.
   */
  search: async (query) => {
    const data = await get('/search', { q: query })
    const results = Array.isArray(data.description) ? data.description : []
    return results.map(normalizeSearchItem)
  },

  /**
   * Fetch detail for a single title by IMDB ID (e.g. "tt4574334").
   * Falls back gracefully if the endpoint returns sparse data.
   */
  detail: async (id, fallback = {}) => {
    try {
      const data = await get(`/title/${id}`)
      // Detail responses wrap result in .description or top-level
      const raw = Array.isArray(data.description)
        ? data.description[0]
        : data.description ?? data
      return normalizeDetail(raw, { ...fallback, id })
    } catch {
      // If detail fails (some IDs have no detail page), return the fallback
      if (fallback.id) return { ...fallback }
      throw new Error(`Could not load details for ${id}`)
    }
  },

  /**
   * Trending: the API has no trending endpoint, so we search for popular
   * evergreen terms and return a diverse mix.
   */
  trending: async () => {
    const queries = ['action', 'drama', 'thriller']
    const results = await Promise.allSettled(queries.map(q => imdb.search(q)))
    const all = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []))
    // Deduplicate by id and sort by rank ascending (lower = more popular)
    const seen = new Set()
    return all
      .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true })
      .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
  },

  /**
   * Popular: search a broad term to populate the default grid.
   */
  popular: async (queryTerm = 'the') => {
    return imdb.search(queryTerm)
  },
}

// ─── Image helpers ────────────────────────────────────────────────────────────
/**
 * Returns the poster URL for a movie object.
 * Accepts both the old TMDB-style {poster_path} and the new {poster_url}.
 */
export function posterUrl(movie) {
  if (!movie) return null
  return movie.poster_url || null
}

/**
 * Returns a backdrop URL.  The API doesn't supply backdrops, so we return null.
 * Kept for drop-in compatibility with old TMDB call sites.
 */
export function backdropUrl(movie) {
  if (!movie) return null
  return movie.backdrop_url || null
}
