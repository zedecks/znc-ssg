const CATEGORIAS = [
  { slug: "motion", nome: "Motions", descricao: "Projetos de animação que dão vida a ideias e criam narrativas visuais dinâmicas." },
  { slug: "audiovisual", nome: "Audiovisuais", descricao: "Produções e captações criadas para transmitir emoções e contar histórias autênticas." },
  { slug: "branding", nome: "Branding", descricao: "Identidades visuais concebidas para fortalecer o posicionamento, atrair o público certo e gerar resultados reais." },
  { slug: "social-media", nome: "Social Media", descricao: "Conteúdos estratégicos desenhados para maximizar o engajamento e a presença digital da tua marca." },
  { slug: "design-grafico", nome: "Design Gráficos", descricao: "Peças visuais apelativas e funcionais focadas em comunicar mensagens de forma clara e impactante." },
  { slug: "ui-ux", nome: "UI/UX", descricao: "Interfaces intuitivas projetadas com foco absoluto na usabilidade e na experiência do utilizador." },
  { slug: "web-dev", nome: "Web Development", descricao: "Soluções digitais rápidas, modernas e à medida para impulsionar o teu negócio na internet." },
  { slug: "apps", nome: "Apps", descricao: "Aplicações móveis e web apps inovadoras, desenvolvidas para proporcionar experiências fluidas e de alto desempenho." },
  { slug: "eventos", nome: "Eventos", descricao: "Cobertura visual e conteúdos criativos para imortalizar momentos e amplificar o impacto de cada evento." },
  { slug: "outros", nome: "Outros", descricao: "Projetos variados e multidisciplinares que exploram diferentes abordagens criativas e desafios únicos." },
];

const PARTNERS = [
  { id: "zedecks", nome: "Zedeck's IT", whatsapp: "258877703308" },
  { id: "nn", nome: "Agência NN", whatsapp: "258868864717" },
];

function hasCategory(p, catSlug) {
  if (Array.isArray(p.categoria)) return p.categoria.includes(catSlug);
  return p.categoria === catSlug;
}

function catNome(catSlug) {
  const c = CATEGORIAS.find(c => c.slug === catSlug);
  return c ? c.nome : catSlug;
}

function catNomes(cat) {
  if (Array.isArray(cat)) {
    return cat.map(c => `<span data-i18n="cat_${c}">${catNome(c)}</span>`).join(', ');
  }
  return `<span data-i18n="cat_${cat}">${catNome(cat)}</span>`;
}

function catDesc(catSlug) {
  const c = CATEGORIAS.find(c => c.slug === catSlug);
  return c && c.descricao ? c.descricao : "Projetos desenvolvidos para fortalecer marcas, atrair clientes e gerar resultados reais através da criatividade.";
}

module.exports = {
  CATEGORIAS,
  PARTNERS,
  hasCategory,
  catNome,
  catNomes,
  catDesc
};
