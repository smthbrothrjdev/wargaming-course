import './style.css';
import { marked } from 'marked';

// 1) Eagerly import all .md files under src/pages as raw strings
const modules = import.meta.glob('./pages/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

// 2) Build slug -> markdownContent map
const routes: Record<string, string> = {};

for (const path in modules) {
  // path looks like "./pages/index.md" or "./pages/intro.md"
  const slug = path
    .replace(/^\.\/pages\//, '')  // "index.md" -> "index.md"
    .replace(/\.md$/, '');        // "index.md" -> "index"

  routes[slug] = modules[path];
}

console.log('routes:', routes);

// 3) Basic layout
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <nav id="nav"></nav>
  <main id="content"></main>
`;

const nav = document.querySelector<HTMLDivElement>('#nav')!;
const main = document.querySelector<HTMLElement>('#content')!;

// 4) Render nav from discovered routes
function renderNav() {
  nav.innerHTML = Object.keys(routes)
    .map((slug) => `<a href="#/${slug}">${slug}</a>`)
    .join(' | ');
}

// 5) Render a page based on the hash
function loadPageFromHash() {
  const slug = location.hash.replace(/^#\//, '') || 'index';
  const md = routes[slug];

  if (!md) {
    main.innerHTML = `<h1>404</h1><p>Unknown page: ${slug}</p>`;
    return;
  }

  main.innerHTML = marked.parse(md);
}

// 6) Init
renderNav();
loadPageFromHash();
window.addEventListener('hashchange', loadPageFromHash);

