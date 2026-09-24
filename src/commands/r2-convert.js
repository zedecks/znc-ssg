const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.startsWith('.')) continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function processImage(file, inPath, outDirPath, OUT_DIR) {
  const outName = (file.replace(/\.[^/.]+$/, "") + ".webp").toLowerCase();
  const outPath = path.join(outDirPath, outName);
  const displayPath = path.relative(OUT_DIR, outPath);
  
  try {
    const inputStats = fs.statSync(inPath);
    await sharp(inPath)
      .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(outPath);
      
    const outputStats = fs.statSync(outPath);
    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
    console.log(chalk.green(`✅ [IMAGEM] -> ${displayPath} (${(outputStats.size / 1024).toFixed(1)}KB) [Poupança: ${savings}%]`));
  } catch (err) {
    console.error(chalk.red(`❌ Erro a processar imagem ${file}:`), err.message);
  }
}

function processVideo(file, inPath, outDirPath, OUT_DIR) {
  return new Promise((resolve) => {
    const outName = (file.replace(/\.[^/.]+$/, "") + ".mp4").toLowerCase();
    const outPath = path.join(outDirPath, outName);
    const displayPath = path.relative(OUT_DIR, outPath);
    
    console.log(chalk.yellow(`⏳ [VÍDEO] A processar ${displayPath}...`));
    const inputStats = fs.statSync(inPath);

    ffmpeg(inPath)
      .outputOptions([
        '-c:v libx264',
        '-crf 26',
        '-preset fast',
        '-c:a aac',
        '-b:a 128k',
        '-vf scale=1920:1080:force_original_aspect_ratio=decrease',
        '-movflags +faststart'
      ])
      .save(outPath)
      .on('end', () => {
        const outputStats = fs.statSync(outPath);
        const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
        console.log(chalk.green(`✅ [VÍDEO] -> ${displayPath} (${(outputStats.size / 1024 / 1024).toFixed(2)}MB) [Poupança: ${savings}%]`));
        resolve();
      })
      .on('error', (err) => {
        console.error(chalk.red(`❌ Erro a processar vídeo ${file}:`), err.message);
        resolve();
      });
  });
}

async function r2Convert() {
  const ROOT = process.cwd();
  const IN_DIR = path.join(ROOT, 'workspace', 'r2_entrada');
  const OUT_DIR = path.join(ROOT, 'workspace', 'r2_saida');

  fs.ensureDirSync(IN_DIR);
  fs.ensureDirSync(OUT_DIR);

  const allFiles = getAllFiles(IN_DIR);
  if (allFiles.length === 0) {
    console.log(chalk.yellow(`\n📦 A pasta workspace/r2_entrada/ está vazia.`));
    console.log(`Coloque pastas (ex: imagens, motions) ou ficheiros lá dentro e corra o script novamente.\n`);
    return;
  }

  console.log(chalk.cyan(`\n🚀 Encontrados ${allFiles.length} ficheiros. A iniciar conversão preservando a estrutura de pastas...\n`));

  for (const inPath of allFiles) {
    const relPath = path.relative(IN_DIR, inPath);
    const relDir = path.dirname(relPath);
    const fileName = path.basename(inPath);
    const ext = path.extname(fileName).toLowerCase();
    
    const outDirPath = path.join(OUT_DIR, relDir);
    fs.ensureDirSync(outDirPath);

    const isImage = ['.png', '.jpg', '.jpeg'].includes(ext);
    const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);

    if (isImage) {
      await processImage(fileName, inPath, outDirPath, OUT_DIR);
    } else if (isVideo) {
      await processVideo(fileName, inPath, outDirPath, OUT_DIR);
    } else {
      console.log(chalk.gray(`⏭️  Ignorado: ${relPath} (Formato não suportado)`));
    }
  }
  console.log(chalk.green.bold(`\n🎉 Optimização R2 completa!`));
}

module.exports = r2Convert;
