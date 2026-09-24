const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const { optimizeHTML } = require('../utils/optimizer');
const { head, headerNav, portfolioControls, footer, card } = require('../core/compiler');
const { CONFIG, catNome, catDesc } = require('../core/config');

async function buildIndex(projects, buildTime, LOCALE_EN) {
  const publicProjects = projects.filter(p => p.visibilidade !== "Interno");
  const html = `
    ${head("Portfólio - " + CONFIG.site.title, "index-page", {}, buildTime, LOCALE_EN)}
    ${headerNav()}
    <main class="wrap">
      ${portfolioControls("", publicProjects)}
      <div class="grid" id="portfolio-grid">
        ${publicProjects.map(p => card(p)).join('')}
      </div>
      <div id="no-results" class="no-results" style="display:none;" data-i18n="no_results">Nenhum projeto encontrado.</div>
    </main>
    ${footer()}
    </body>
    </html>
  `;
  return await optimizeHTML(html);
}

async function buildCategoria(catSlug, projects, buildTime, LOCALE_EN) {
  const publicProjects = projects.filter(p => p.visibilidade !== "Interno");
  const catProjects = publicProjects.filter(p => {
    if (Array.isArray(p.categoria)) return p.categoria.includes(catSlug);
    return p.categoria === catSlug;
  });
  
  const cNome = catNome(catSlug);
  const cDesc = catDesc(catSlug);

  const html = `
    ${head(cNome + " - " + CONFIG.site.title, "category-page", {
      description: cDesc,
      i18nTitle: "cat_" + catSlug,
      i18nDesc: "cat_desc_" + catSlug
    }, buildTime, LOCALE_EN)}
    ${headerNav(catSlug)}
    <main class="wrap">
      <div class="category-header">
        <h1 data-i18n="cat_${catSlug}">${cNome}</h1>
        <p data-i18n="cat_desc_${catSlug}">${cDesc}</p>
      </div>
      ${portfolioControls(catSlug, publicProjects)}
      <div class="grid" id="portfolio-grid">
        ${catProjects.map(p => card(p)).join('')}
      </div>
      <div id="no-results" class="no-results" style="display:none;" data-i18n="no_results">Nenhum projeto encontrado.</div>
    </main>
    ${footer()}
    </body>
    </html>
  `;
  return await optimizeHTML(html);
}

async function buildProjeto(p, allProjects, buildTime, LOCALE_EN) {
  // Simplified logic for individual project generation
  const html = `
    ${head(p.titulo + " - " + CONFIG.site.title, "project-page", {
      description: p.resumo || p.titulo,
      image: p.capa
    }, buildTime, LOCALE_EN)}
    ${headerNav()}
    <main class="wrap project-detail">
      <h1>${p.titulo}</h1>
      <p>${p.resumo || ''}</p>
      <div class="project-content">
        ${p.historia ? marked.parse(p.historia) : ''}
      </div>
    </main>
    ${footer()}
    </body>
    </html>
  `;
  return await optimizeHTML(html);
}

async function buildApi(catSlug, projects, buildTime, LOCALE_EN) {
  const items = projects.filter(p => {
    const matchCat = Array.isArray(p.categoria) ? p.categoria.includes(catSlug) : p.categoria === catSlug;
    return matchCat && p.visibilidade === "Público";
  }).sort((a, b) => b.ano - a.ano);
  return JSON.stringify(items, null, 2);
}

async function buildEmbed(catSlug, projects, buildTime, LOCALE_EN) {
  let items;
  if (catSlug === "todos") {
    items = projects.filter(p => p.visibilidade === "Público").sort((a, b) => b.ano - a.ano);
  } else {
    items = projects.filter(p => {
      const matchCat = Array.isArray(p.categoria) ? p.categoria.includes(catSlug) : p.categoria === catSlug;
      return matchCat && p.visibilidade === "Público";
    }).sort((a, b) => b.ano - a.ano);
  }

  const titleSlug = catSlug === "todos" ? "Todos os Projetos" : catNome(catSlug);
  const html = `${head("Embed — " + titleSlug, "embed", {}, buildTime, LOCALE_EN)}
<div class="wrap grid">
  ${items.length ? items.map(p => card(p)).join("") : `<div class="empty">Sem projetos.</div>`}
</div>
</body></html>`;
  return await optimizeHTML(html);
}

async function buildEmbedProjeto(p, buildTime, LOCALE_EN) {
  let mediaHtml = "";
  if (p.video_url) {
    if (p.video_url.endsWith(".mp4") || p.video_url.endsWith(".webm")) {
      const isMotion = Array.isArray(p.categoria) ? p.categoria.includes("motion") : p.categoria === "motion";
      if (isMotion) {
        mediaHtml = `
          <video src="${p.video_url}" autoplay loop muted playsinline></video>
          <button style="position:absolute; bottom:20px; right:20px; background:rgba(0,0,0,0.5); border:none; color:#fff; border-radius:50%; width:40px; height:40px; cursor:pointer; z-index:10;" onclick="const v = this.previousElementSibling; v.muted = !v.muted; this.textContent = v.muted ? '🔇' : '🔊';" aria-label="Toggle sound">🔇</button>
        `;
      } else {
        mediaHtml = `<video src="${p.video_url}" preload="metadata" playsinline controls></video>`;
      }
    } else {
      mediaHtml = `<iframe src="${p.video_url}" frameborder="0" allowfullscreen></iframe>`;
    }
  } else {
    mediaHtml = `<img src="${p.capa}" alt="${p.titulo}">`;
  }

  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.titulo} — Embed</title>
  <style>
    body { margin: 0; padding: 0; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; }
    iframe, video, img { width: 100%; height: 100%; object-fit: contain; border: none; }
  </style>
</head>
<body class="embed-single">
  ${mediaHtml}
</body>
</html>`;
  return await optimizeHTML(html);
}

async function buildInterno(projects, buildTime, LOCALE_EN) {
  const todos = [...projects].sort((a, b) => b.ano - a.ano);
  const html = `${head("Área Interna — " + CONFIG.site.title, null, {
    i18nTitle: "title_internal"
  }, buildTime, LOCALE_EN)}
${headerNav()}
<div class="wrap gate" id="gate">
  <p class="tag-eyebrow" data-i18n="internal_title">Área interna</p>
  <h1 style="font-size:26px;" data-i18n="internal_subtitle">Introduz a palavra-passe da equipa</h1>
  <input type="password" id="pw" placeholder="palavra-passe" data-i18n-placeholder="internal_placeholder">
  <button onclick="tryUnlock()" data-i18n="internal_btn">Entrar</button>
  <p class="warn" data-i18n="internal_warn">Nota: esta proteção é apenas cosmética (feita em JavaScript no browser).</p>
</div>
<div class="wrap" id="content" style="display:none;">
  ${portfolioControls("", projects)}
  <div class="grid" id="portfolio-grid">
    ${todos.map(p => card(p)).join("")}
  </div>
</div>
${footer()}
</body></html>`;
  return await optimizeHTML(html);
}

async function buildLegalPage(buildTime, LOCALE_EN) {
  const ptPath = path.join(process.cwd(), "content", "legal", "termos-pt.md");
  const enPath = path.join(process.cwd(), "content", "legal", "termos-en.md");
  
  let ptContent = fs.existsSync(ptPath) ? fs.readFileSync(ptPath, "utf8") : "";
  let enContent = fs.existsSync(enPath) ? fs.readFileSync(enPath, "utf8") : "*(Translation pending)*";

  const extractTOC = (markdown) => {
    const lines = markdown.split('\\n');
    let tocHtml = '<ul>';
    lines.forEach(line => {
      const match = line.trim().match(/^(#{1,2})\\s+(.+)$/);
      if (match) {
        const title = match[2];
        const slug = title.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        tocHtml += \`<li><a href="#\${slug}">\${title}</a></li>\`;
      }
    });
    tocHtml += '</ul>';
    return tocHtml;
  };

  let ptHtml = marked.parse(ptContent);
  let enHtml = marked.parse(enContent);

  const injectIDs = (html) => {
    return html.replace(/<h([12])[^>]*>(.*?)<\\/h\\1>/g, (match, level, text) => {
      const cleanText = text.replace(/<[^>]+>/g, '');
      const slug = cleanText.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return \`<h\${level} id="\${slug}">\${text}</h\${level}>\`;
    });
  };

  ptHtml = injectIDs(ptHtml);
  enHtml = injectIDs(enHtml);

  const ptTOC = extractTOC(ptContent);
  const enTOC = extractTOC(enContent);

  const html = \`\${head("Termos & Políticas — " + CONFIG.site.title, "page-legal", {
    description: "Termos de Serviço e Políticas de Privacidade.",
    i18nTitle: "seo_title_legal",
    i18nDesc: "seo_desc_legal"
  }, buildTime, LOCALE_EN)}
\${headerNav()}
<main id="content">
  <div class="project-hero-container" style="min-height: 25vh; display: flex; align-items: center; margin-bottom: 20px;">
    <section class="wrap hero-header-wrap" style="grid-template-columns: 1fr; justify-items: center; padding-top: 80px;">
      <div class="hero-header-text" style="text-align: center; display: flex; flex-direction: column; align-items: center;">
        <h1 class="project-title" style="margin-top: 16px; margin-bottom: 16px; text-align: center;" data-i18n="legal_title">Termos & Políticas</h1>
      </div>
    </section>
  </div>
  
  <div class="wrap" style="display: flex; gap: 40px; margin-top: 40px; align-items: flex-start;">
    <aside class="legal-sidebar" style="flex: 0 0 250px; width: 250px; min-width: 250px; position: sticky; top: 100px; padding: 20px; background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border);">
      <h3 style="margin-top: 0; font-size: 1.1rem;" data-i18n="legal_index">Índice</h3>
      <div class="lang-content" data-lang="pt">\${ptTOC}</div>
      <div class="lang-content" data-lang="en" style="display:none;">\${enTOC}</div>
    </aside>

    <article class="legal-content section-block" style="flex: 1; padding: 0 20px;">
      <div class="lang-content" data-lang="pt">\${ptHtml}</div>
      <div class="lang-content" data-lang="en" style="display:none;">\${enHtml}</div>
    </article>
  </div>
</main>
\${footer()}
</body></html>\`;
  return await optimizeHTML(html);
}

module.exports = {
  buildIndex,
  buildCategoria,
  buildProjeto,
  buildApi,
  buildEmbed,
  buildEmbedProjeto,
  buildInterno,
  buildLegalPage
};
