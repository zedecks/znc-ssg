const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { readProjects, ensureDir, loadLocale } = require('../utils/file-system');
const { optimizeCSS, optimizeJS } = require('../utils/optimizer');
const { buildIndex, buildCategoria, buildProjeto } = require('../core/pages');
const { CONFIG } = require('../core/config');

async function build(options = {}) {
  const startTime = Date.now();
  console.log(chalk.blue(`\n🚀 Iniciando a compilação do SSG (ZN CreativeStudio Motor) \n`));

  const ROOT = process.cwd();
  const CONTENT_DIR = path.join(ROOT, CONFIG.paths.content);
  const DIST_DIR = path.join(ROOT, CONFIG.paths.output);
  const ASSETS_DIR = path.join(ROOT, CONFIG.paths.assets);
  const TEMPLATES_DIR = path.join(ROOT, CONFIG.paths.templates);

  ensureDir(DIST_DIR);
  ensureDir(path.join(DIST_DIR, 'assets'));

  // 1. Otimizar CSS e JS base
  try {
    if (fs.existsSync(path.join(TEMPLATES_DIR, 'style.css'))) {
      const cssRaw = fs.readFileSync(path.join(TEMPLATES_DIR, 'style.css'), 'utf8');
      const cssMin = optimizeCSS(cssRaw);
      fs.writeFileSync(path.join(DIST_DIR, 'assets', 'style.css'), cssMin);
      console.log(chalk.green('✓ CSS Base otimizado.'));
    }
    
    if (fs.existsSync(path.join(TEMPLATES_DIR, 'main.js'))) {
      const jsRaw = fs.readFileSync(path.join(TEMPLATES_DIR, 'main.js'), 'utf8');
      const jsMin = await optimizeJS(jsRaw);
      fs.writeFileSync(path.join(DIST_DIR, 'assets', 'main.js'), jsMin);
      console.log(chalk.green('✓ JS Base otimizado.'));
    }
  } catch (err) {
    console.error(chalk.red('Erro na otimização de templates base:'), err.message);
  }

  // 2. Copiar assets puros
  if (fs.existsSync(ASSETS_DIR)) {
    fs.copySync(ASSETS_DIR, path.join(DIST_DIR, 'assets'), { overwrite: true });
    console.log(chalk.green('✓ Assets copiados.'));
  }

  // 3. Ler Localização (Inglês)
  let localeEn = {};
  const localePath = path.join(ROOT, "locales", "en.json");
  if (fs.existsSync(localePath)) {
    localeEn = loadLocale(localePath);
  }

  // 4. Ler Projectos JSON
  if (!fs.existsSync(CONTENT_DIR)) {
    console.warn(chalk.yellow(`Atenção: A pasta de conteúdos "${CONTENT_DIR}" não foi encontrada.`));
    ensureDir(CONTENT_DIR);
  }
  
  const projects = fs.existsSync(CONTENT_DIR) ? readProjects(CONTENT_DIR) : [];
  console.log(chalk.cyan(`> ${projects.length} projetos carregados.`));

  // 5. Construir Páginas
  const buildTime = Date.now();
  
  // Home
  const indexHtml = await buildIndex(projects, buildTime, localeEn);
  fs.writeFileSync(path.join(DIST_DIR, "index.html"), indexHtml);
  
  // Categorias
  ensureDir(path.join(DIST_DIR, "categoria"));
  for (const cat of (CONFIG.categories || [])) {
    const catHtml = await buildCategoria(cat.slug, projects, buildTime, localeEn);
    fs.writeFileSync(path.join(DIST_DIR, "categoria", `${cat.slug}.html`), catHtml);
  }

  // Projetos Individuais
  ensureDir(path.join(DIST_DIR, "projeto"));
  for (const p of projects) {
    const projHtml = await buildProjeto(p, projects, buildTime, localeEn);
    fs.writeFileSync(path.join(DIST_DIR, "projeto", `${p.slug}.html`), projHtml);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(chalk.green.bold(`\n🎉 Build concluído com sucesso em ${duration}s!`));
  console.log(chalk.dim(`Directoria de saída: ${DIST_DIR}\n`));
}

module.exports = build;
