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

module.exports = {
  buildIndex,
  buildCategoria,
  buildProjeto
};
