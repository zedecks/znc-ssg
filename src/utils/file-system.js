const fs = require('fs-extra');
const path = require('path');

function readProjects(contentDir) {
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith(".json"));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(contentDir, f), "utf8")));
}

function ensureDir(p) { 
  fs.mkdirSync(p, { recursive: true }); 
}

function loadLocale(localePath) {
  return JSON.parse(fs.readFileSync(localePath, "utf8"));
}

module.exports = {
  readProjects,
  ensureDir,
  loadLocale
};
