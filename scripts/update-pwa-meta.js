const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const manifestJsonPath = path.join(distDir, 'manifest.json');

// 更新 index.html
if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // 更新 title
  html = html.replace(/<title>.*?<\/title>/, '<title>LunChips</title>');
  
  // 添加或更新 apple-mobile-web-app-title
  if (html.includes('apple-mobile-web-app-title')) {
    html = html.replace(
      /<meta name="apple-mobile-web-app-title" content=".*?"\s*\/?>/,
      '<meta name="apple-mobile-web-app-title" content="LunChips" />'
    );
  } else {
    // 在 theme-color meta 之後添加
    html = html.replace(
      /(<meta name="theme-color"[^>]*>)/,
      '$1\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="default" />\n    <meta name="apple-mobile-web-app-title" content="LunChips" />\n    <meta name="application-name" content="LunChips" />'
    );
  }
  
  // 添加 manifest link 如果不存在
  if (!html.includes('rel="manifest"')) {
    html = html.replace(
      /(<meta name="theme-color"[^>]*>)/,
      '$1\n    <link rel="manifest" href="/manifest.json" />'
    );
  }
  
  // 添加 apple-touch-icon 如果不存在
  if (!html.includes('apple-touch-icon')) {
    html = html.replace(
      /(<link rel="manifest"[^>]*>)/,
      '$1\n    <link rel="apple-touch-icon" href="/coinfin.png" />\n    <link rel="apple-touch-icon" sizes="152x152" href="/coinfin.png" />\n    <link rel="apple-touch-icon" sizes="180x180" href="/coinfin.png" />\n    <link rel="icon" type="image/png" href="/coinfin.png" />'
    );
  } else {
    // 更新現有的 apple-touch-icon
    html = html.replace(
      /<link rel="apple-touch-icon"[^>]*>/g,
      '<link rel="apple-touch-icon" href="/coinfin.png" />'
    );
    html = html.replace(
      /<link rel="icon"[^>]*>/g,
      '<link rel="icon" type="image/png" href="/coinfin.png" />'
    );
  }
  
  fs.writeFileSync(indexHtmlPath, html, 'utf8');
  console.log('✅ Updated dist/index.html');
}

// 更新 manifest.json
if (fs.existsSync(manifestJsonPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
  
  manifest.name = 'LunChips';
  manifest.short_name = 'LunChips';
  
  // 更新所有圖標路徑
  if (manifest.icons && Array.isArray(manifest.icons)) {
    manifest.icons = manifest.icons.map(icon => ({
      ...icon,
      src: '/coinfin.png'
    }));
  }
  
  fs.writeFileSync(manifestJsonPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✅ Updated dist/manifest.json');
}

// 複製 coinfin.png 到 dist
const coinfinSource = path.join(__dirname, '..', 'assets', 'icons', 'coinfin.png');
const coinfinDest = path.join(distDir, 'coinfin.png');

if (fs.existsSync(coinfinSource)) {
  fs.copyFileSync(coinfinSource, coinfinDest);
  console.log('✅ Copied coinfin.png to dist/');
}

console.log('✅ PWA meta tags updated successfully!');






