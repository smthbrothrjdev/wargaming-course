import './style.css';
import { marked } from "marked";

/**
 * Auto-import all markdown files under src/pages
 * and expose them as URLs that can be fetched.
 */
const pages = import.meta.glob('/src/pages/**/*.md', {
  as: 'url'
}) as Record<string, string>;

/**
 * Build slug → URL mapping.
 * Example: "foo/bar" → "/src/pages/foo/bar.md"
 */
const routes: Record<string, string> = {};

for (const fullPath in pages) {
  const slug = fullPath
    .replace('/src/pages/', '')
    .replace(/\.md$/, '');

  routes[slug] = pages[fullPath];
}

// App structure
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <nav id="nav"></nav>
  <main id="content">Loading…</main>
`;

const nav = document.querySelector('#nav')!;
const main = document.querySelector('#content')!;

function renderNav() {
  nav.innerHTML = Object.keys(routes)
    .map(slug => `<a href="#/${slug}">${slug}</a>`)
    .join(' | ');
}

async function loadPage() {
  const slug = location.hash.replace('#/', '') || 'index';
  const mdURL = routes[slug];

  if (!mdURL) {
    main.innerHTML = `<h1>404</h1><p>Page not found: ${slug}</p>`;
    return;
  }

  const res = await fetch(mdURL);
  const md = await res.text();
  main.innerHTML = marked.parse(md);
}

window.addEventListener('hashchange', loadPage);
window.addEventListener('DOMContentLoaded', () => {
  renderNav();
  loadPage();
});

