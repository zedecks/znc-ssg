const { minify: minifyHtml } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const { minify: minifyJs } = require('terser');

const HTML_MINIFY_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  removeAttributeQuotes: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true
};

async function optimizeHTML(html) {
  try {
    return await minifyHtml(html, HTML_MINIFY_OPTIONS);
  } catch (error) {
    console.error('Error optimizing HTML:', error);
    return html;
  }
}

function optimizeCSS(css) {
  try {
    const output = new CleanCSS({ level: 2 }).minify(css);
    return output.styles;
  } catch (error) {
    console.error('Error optimizing CSS:', error);
    return css;
  }
}

async function optimizeJS(js) {
  try {
    const result = await minifyJs(js, {
      compress: {
        drop_console: true,
        passes: 2
      },
      mangle: true
    });
    return result.code;
  } catch (error) {
    console.error('Error optimizing JS:', error);
    return js;
  }
}

module.exports = {
  optimizeHTML,
  optimizeCSS,
  optimizeJS
};
