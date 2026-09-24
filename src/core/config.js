const path = require('path');
const fs = require('fs-extra');

// Default generic configurations
const DEFAULT_CONFIG = {
  site: {
    title: "ZNC User Portfolio",
    description: "Creative portfolio built with znc-ssg.",
    url: "https://example.com/",
    image: "https://example.com/assets/images/site-og.png",
    author: "ZNC User",
    footerName: "ZNC User",
    startYear: new Date().getFullYear(),
    footerPartners: [],
    socials: []
  },
  categories: [
    { slug: "design", nome: "Design", descricao: "Design projects and mockups." },
    { slug: "development", nome: "Development", descricao: "Web and app development projects." }
  ],
  partners: [
    { id: "freelance", nome: "ZNC User", whatsapp: "000000000" }
  ],
  paths: {
    content: "workspace",
    output: "dist",
    assets: "assets",
    templates: "templates"
  }
};

let userConfig = {};
try {
  const configPath = path.join(process.cwd(), 'znc.config.js');
  if (fs.existsSync(configPath)) {
    userConfig = require(configPath);
  }
} catch (error) {
  console.warn("Could not load znc.config.js. Using defaults.");
}

const CONFIG = { ...DEFAULT_CONFIG, ...userConfig };

function hasCategory(p, catSlug) {
  if (Array.isArray(p.categoria)) return p.categoria.includes(catSlug);
  return p.categoria === catSlug;
}

function catNome(catSlug) {
  const c = (CONFIG.categories || []).find(c => c.slug === catSlug);
  return c ? c.nome : catSlug;
}

function catNomes(cat) {
  if (Array.isArray(cat)) {
    return cat.map(c => `<span data-i18n="cat_${c}">${catNome(c)}</span>`).join(', ');
  }
  return `<span data-i18n="cat_${cat}">${catNome(cat)}</span>`;
}

function catDesc(catSlug) {
  const c = (CONFIG.categories || []).find(c => c.slug === catSlug);
  return c && c.descricao ? c.descricao : "";
}

module.exports = {
  CONFIG,
  hasCategory,
  catNome,
  catNomes,
  catDesc
};
