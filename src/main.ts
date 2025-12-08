import './style.css';
import { marked } from 'marked';

// 1) Eagerly import all .md files under src/pages as raw strings
const modules = import.meta.glob('./pages/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

// 2) slug -> markdownContent map
const routes: Record<string, string> = {};

for (const path in modules) {
  // "./pages/index.md" -> "index"
  const slug = path
    .replace(/^\.\/pages\//, '')
    .replace(/\.md$/, '');

  routes[slug] = modules[path];
}

console.log('routes:', routes);

// 3) Basic layout
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <nav id="nav"></nav>
  <main id="content"></main>
`;

const nav = document.querySelector<HTMLElement>('#nav')!;
const main = document.querySelector<HTMLElement>('#content')!;

// 4) Nav from discovered routes
function renderNav() {
  nav.innerHTML = Object.keys(routes)
    .map((slug) => `<a href="#/${slug}">${slug}</a>`)
    .join(' | ');
}

// 5) Render markdown page from hash
function loadPageFromHash() {
  const slug = location.hash.replace(/^#\//, '') || 'index';
  const md = routes[slug];

  if (!md) {
    main.innerHTML = `<h1>404</h1><p>Unknown page: ${slug}</p>`;
    return;
  }

  const result = marked.parse(md);

  if (result instanceof Promise) {
    // Async pipeline (e.g. if you ever add async extensions)
    result
      .then((html) => {
        main.innerHTML = html;
      })
      .catch((err) => {
        console.error(err);
        main.innerHTML = `<h1>Error</h1><p>Failed to render markdown.</p>`;
      });
  } else {
    // Normal sync case
    main.innerHTML = result;
  }
}

// 6) Init
renderNav();
loadPageFromHash();
window.addEventListener('hashchange', loadPageFromHash);

