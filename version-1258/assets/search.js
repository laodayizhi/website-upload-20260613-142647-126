import { MOVIES } from './search-data.js';

const params = new URLSearchParams(window.location.search);
const query = (params.get('q') || '').trim();
const input = document.querySelector('#search-page-input');
const results = document.querySelector('#search-results');
const empty = document.querySelector('#search-empty');
const title = document.querySelector('#search-result-title');
const desc = document.querySelector('#search-result-desc');

if (input) {
  input.value = query;
}

function normalize(value) {
  return String(value || '').toLowerCase();
}

function matchMovie(movie, q) {
  if (!q) {
    return true;
  }

  const haystack = [
    movie.title,
    movie.year,
    movie.region,
    movie.type,
    movie.genre,
    movie.tags,
    movie.oneLine,
    movie.category
  ].join(' ').toLowerCase();

  return haystack.includes(q.toLowerCase());
}

function card(movie) {
  const tags = normalize(movie.tags)
    .split(/[,，、/|]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join('');

  return `
    <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-region="${escapeHtml(movie.region)}" data-type="${escapeHtml(movie.type)}" data-genre="${escapeHtml(movie.genre)}" data-year="${escapeHtml(movie.year)}">
      <a class="poster-link" href="${escapeHtml(movie.url)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)} 海报" loading="lazy">
        <span class="type-badge">${escapeHtml(movie.type)}</span>
        <span class="poster-play" aria-hidden="true">▶</span>
      </a>
      <div class="movie-card-body">
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p class="movie-meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · <a href="${escapeHtml(movie.categoryUrl)}">${escapeHtml(movie.category)}</a></p>
        <p class="movie-one-line">${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const matched = MOVIES.filter((movie) => matchMovie(movie, query)).slice(0, query ? 240 : 80);

if (title) {
  title.textContent = query ? `“${query}” 的搜索结果` : '默认推荐影片';
}

if (desc) {
  desc.textContent = query
    ? `共找到 ${MOVIES.filter((movie) => matchMovie(movie, query)).length} 部相关影片，当前展示前 ${matched.length} 部。`
    : `默认展示 ${matched.length} 部影片，可输入关键词检索完整片库。`;
}

if (results) {
  results.innerHTML = matched.map(card).join('');
}

if (empty) {
  empty.hidden = matched.length > 0;
}
