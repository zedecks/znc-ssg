const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const { hasCategory, catNome, catNomes, catDesc, CATEGORIAS, PARTNERS } = require('./config');
const { optimizeHTML } = require('../utils/optimizer');

// ---------- UI COMPONENTS ----------

function head(title, extraClass, seo = {}, buildTime, LOCALE_EN) {
  const desc = seo.description || "ZN CreativeStudio — Repositório de Exposição de Trabalhos Criativos (Ecossistema Zedecks)";
  const ogImg = seo.image || "https://zncreative.zedecks.com/assets/images/site-og.png";
  const ogUrl = seo.url || "https://zncreative.zedecks.com/";
  const type = seo.type || "website";

  const i18nTitle = seo.i18nTitle ? ` data-i18n="${seo.i18nTitle}"` : '';
  const i18nDesc = seo.i18nDesc ? ` data-i18n-content="${seo.i18nDesc}"` : '';

  const schema = seo.schema || {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ZN CreativeStudio",
    "url": "https://zncreative.zedecks.com/"
  };

  return `<!doctype html>
<html lang="pt" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title${i18nTitle}>${title}</title>
<meta name="description" content="${desc.replace(/"/g, '&quot;')}"${i18nDesc}>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}"${i18nDesc}>
<meta property="og:image" content="${ogImg}">
<meta property="og:url" content="${ogUrl}">
<meta property="og:type" content="${type}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}"${i18nDesc}>
<link rel="canonical" href="${ogUrl}">
<link rel="icon" type="image/x-icon" href="/assets/favicon.ico">
<script type="application/ld+json">
${JSON.stringify(schema)}
</script>
<script>
  window.__I18N_EN__ = ${JSON.stringify(LOCALE_EN)};
  window.__PARTNERS__ = ${JSON.stringify(PARTNERS)};
</script>
<script src="/assets/main.js?v=${buildTime}"></script>
<link rel="preload" href="/assets/images/zncreativestudio-logo.png" as="image" fetchpriority="high">
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Manrope:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" as="style">
<link rel="preload" href="/assets/style.css?v=${buildTime}" as="style">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Manrope:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css">
<link rel="stylesheet" href="/assets/style.css?v=${buildTime}">
</head>
<body class="${extraClass || ""}">`;
}

function headerNav(activeCat) {
  return `
<header class="site-header">
  <div class="wrap site-header-row">
    <a href="/index.html" class="logo" aria-label="ZN CreativeStudio">
      <img src="/assets/images/zncreativestudio-logo.png" alt="ZN CreativeStudio" width="160" height="40" fetchpriority="high" decoding="async" />
    </a>
    <div class="header-divider" aria-hidden="true"></div>
    <div class="nav-actions">
      <button id="lang-btn" class="flag-btn" onclick="switchLang()" aria-label="Alternar idioma" data-i18n-aria="aria_lang">
        <span id="lang-flag" class="fi fi-gb"></span>
      </button>
      <span class="nav-pip" aria-hidden="true"></span>
      <a href="/index.html" id="exit-internal-btn" class="icon-btn" aria-label="Sair da Área Interna" title="Sair da Área Interna" data-i18n-aria="aria_exit" data-i18n-title="aria_exit" onclick="sessionStorage.removeItem('zn_internal')" style="display:none; align-items:center; justify-content:center; color: #ef4444; text-decoration:none; margin-left: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </a>
    </div>
  </div>
</header>`;
}

function portfolioControls(activeCatSlug = "", projects = [], hideTabs = false) {
  const usedCats = CATEGORIAS.filter(c => projects.some(p => hasCategory(p, c.slug)));
  const tabs = [{ slug: "", nome: "Todos", i18n: "cat_todos" }, ...usedCats.map(c => ({ ...c, i18n: "cat_" + c.slug }))];
  const tabsHtml = tabs.map(c =>
    `<button class="category-tab ${c.slug === activeCatSlug ? 'active' : ''}" onclick="filterCategory(this, '${c.slug}')" data-i18n="${c.i18n}">${c.nome}</button>`
  ).join("");

  return `
<div class="portfolio-controls-wrapper wrap" id="portfolio-controls" ${hideTabs ? 'style="justify-content: flex-end;"' : ''}>
  ${!hideTabs ? `
  <div class="portfolio-tabs">
    ${tabsHtml}
  </div>` : ''}
  <div class="portfolio-search">
    <input type="text" id="search-input" class="search-input-short" placeholder="🔍 Pesquisar projetos..." data-i18n-placeholder="search_placeholder" oninput="filterProjects()" autocomplete="off">
  </div>
</div>`;
}

function ctaModal() {
  const partnerBtns = PARTNERS.map(p =>
    `<a class="cta-partner-btn" href="#" onclick="triggerPartnerCTA('${p.id}');return false;">
      <span class="cta-icon">💬</span>
      <span>${p.nome}</span>
      <span class="cta-sub">WhatsApp</span>
    </a>`
  ).join("");

  return `
<div class="cta-overlay" id="cta-overlay" onclick="closeCTA(event)">
  <div class="cta-modal">
    <button class="cta-close" onclick="closeCTA(event)" aria-label="Fechar" data-i18n-aria="aria_close">✕</button>
    <h2 data-i18n="cta_title">Quero um projeto como este</h2>
    <p class="cta-desc" id="cta-desc" data-i18n="cta_desc">Escolha a empresa parceira para iniciar a conversa:</p>
    <div class="cta-partners">${partnerBtns}</div>
  </div>
</div>`;
}

function footer() {
  const currentYear = new Date().getFullYear();
  const yearText = currentYear === 2026 ? "2026" : `2026-${currentYear}`;
  return `
${ctaModal()}
<footer class="site-footer">
  <div class="wrap footer-row">
    <div class="footer-col footer-col-1">
      &copy; ${yearText}&nbsp;&nbsp;<strong>ZN CREATIVE STUDIO</strong>
    </div>
    <div class="footer-col footer-col-2">
      <span class="footer-dev-label" data-i18n="footer_partners">Parceiros:</span>
      <div class="footer-avatars" aria-label="Equipa" data-i18n-aria="aria_team">
        <a href="https://zedecks.com" target="_blank" rel="noopener noreferrer" class="avatar-badge" title="Zedecks IT"><img src="/assets/images/zedecks.webp" alt="Zedecks IT" loading="lazy" decoding="async"></a>
        <a href="https://edmilsonmuacigarro.com" target="_blank" rel="noopener noreferrer" class="avatar-badge" title="Edmilson Muacigarro"><img src="/assets/images/zedeckmuacy.webp" alt="Edmilson Muacigarro" loading="lazy" decoding="async"></a>
        <a href="https://nietzchenicolau.com" target="_blank" rel="noopener noreferrer" class="avatar-badge" title="Nietzche Nicolau"><img src="/assets/images/nn.webp" alt="Nietzche Nicolau" loading="lazy" decoding="async"></a>
        <a href="https://muacydesigner.zedecks.com" target="_blank" rel="noopener noreferrer" class="avatar-badge" title="Leoltino Muacigarro"><img src="/assets/images/muacy.webp" alt="Leoltino Muacigarro" loading="lazy" decoding="async"></a>
      </div>
    </div>
    <div class="footer-col footer-col-3" style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap; justify-content: flex-end;">
      <div class="footer-social-icons" style="margin: 0;">
        <a href="https://www.facebook.com/zncreativestudios" target="_blank" rel="noopener noreferrer" class="social-icon" title="Facebook" aria-label="Facebook">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <a href="https://www.instagram.com/zncreativetudio" target="_blank" rel="noopener noreferrer" class="social-icon" title="Instagram" aria-label="Instagram">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href="mailto:zncreative@zedecks.com" class="social-icon" title="Email" aria-label="Email">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </a>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <a href="/termos-e-politicas.html#termos" style="color: inherit; text-decoration: none; font-size: 0.9em; opacity: 0.8;" data-i18n="footer_terms">Termos</a>
        <span style="opacity: 0.5;">|</span>
        <a href="/termos-e-politicas.html#politicas" style="color: inherit; text-decoration: none; font-size: 0.9em; opacity: 0.8;" data-i18n="footer_policies">Políticas</a>
      </div>
    </div>
  </div>
</footer>
`;
}

function card(p) {
  const badge = p.visibilidade === "Interno" ? `<span class="badge-interno" data-i18n="badge_internal">INTERNO</span>` : "";
  const tags = (p.tags || []).join(" ");
  const searchData = `${p.titulo} ${p.titulo_en || ''} ${p.cliente} ${p.cliente_en || ''} ${catNomes(p.categoria).replace(/<[^>]+>/g, '')} ${tags} ${p.ano}`;

  let mediaHtml = `<img src="${p.capa}" alt="${p.titulo}" width="800" height="450" loading="lazy">`;
  let isVideo = false;
  let isSlideshow = false;

  if (p.video_url && (p.video_url.endsWith('.mp4') || p.video_url.endsWith('.webm'))) {
    isVideo = true;
    if (hasCategory(p, "motion")) {
      mediaHtml = `
        <video data-src="${p.video_url}" poster="${p.capa}" preload="none" loop muted playsinline class="lazy-video"></video>
        <button class="mute-toggle" onclick="event.preventDefault(); const v = this.previousElementSibling; v.muted = !v.muted; this.textContent = v.muted ? '🔇' : '🔊';" aria-label="Toggle sound">🔇</button>
      `;
    } else {
      mediaHtml = `
        <video data-src="${p.video_url}#t=0.1" preload="none" playsinline loop muted class="lazy-video"></video>
        <div class="video-overlay-play">
          <svg class="play-icon" viewBox="0 0 24 24" width="48" height="48" fill="rgba(255,255,255,0.9)"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <button class="mute-toggle" onclick="event.preventDefault(); const v = this.parentElement.querySelector('video'); v.muted = !v.muted; this.textContent = v.muted ? '🔇' : '🔊';" aria-label="Toggle sound">🔇</button>
      `;
    }
  } else if (p.galeria && p.galeria.length > 0) {
    isSlideshow = true;
    const allImages = [p.capa, ...p.galeria.filter(g => g !== p.capa)];
    const dataImgs = JSON.stringify(allImages).replace(/"/g, '&quot;');
    mediaHtml = `<img src="${p.capa}" alt="${p.titulo}" width="800" height="450" loading="lazy" class="card-slideshow" data-images="${dataImgs}">`;
  }

  return `
<a class="card ${isVideo ? 'has-video' : ''} ${isSlideshow ? 'has-slideshow' : ''}" href="/projeto/${p.slug}.html" data-search="${searchData.replace(/"/g, '&quot;')}" data-cat="${Array.isArray(p.categoria) ? p.categoria.join(' ') : p.categoria}" onmouseenter="const v = this.querySelector('video'); if(v) v.play().catch(()=>{});" onmouseleave="const v = this.querySelector('video'); if(v) v.pause();">
  <div class="thumb">${mediaHtml}</div>
  <div class="meta">
    <span class="cat">${catNomes(p.categoria)}</span>${badge}
    <h2 data-i18n-en="${(p.titulo_en || p.titulo).replace(/"/g, '&quot;')}">${p.titulo}</h2>
    <div class="client"><span data-i18n-en="${(p.cliente_en || p.cliente).replace(/"/g, '&quot;')}">${p.cliente}</span> · ${p.ano}</div>
  </div>
</a>`;
}

// Ensure the page builders export these functions
module.exports = {
  head,
  headerNav,
  portfolioControls,
  ctaModal,
  footer,
  card
};
