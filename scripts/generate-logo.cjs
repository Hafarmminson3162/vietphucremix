const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const width = 1200;
  const height = 300;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="hatStrawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E9C378" />
      <stop offset="40%" stop-color="#D4A148" />
      <stop offset="80%" stop-color="#BF862E" />
      <stop offset="100%" stop-color="#A8711E" />
    </linearGradient>

    <filter id="hatShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="#000" flood-opacity="0.22" />
    </filter>
  </defs>

  <style>
    .vp-text {
      font-family: 'Playfair Display', 'DejaVu Serif', Georgia, serif;
      font-weight: 800;
      fill: #1C3F34;
      font-size: 196px;
    }
  </style>

  <g id="logo-group">
    <!-- Letter "V" -->
    <text x="30" y="222" class="vp-text">V</text>

    <!-- Letter "i" with round dot -->
    <text x="195" y="222" class="vp-text">i</text>

    <!-- Letter "e" (base letter without circumflex) -->
    <text x="275" y="222" class="vp-text">e</text>

    <!-- Dấu nặng (dot below) for letter "ệ" -->
    <circle cx="332" cy="264" r="14" fill="#1C3F34" />

    <!-- NÓN LÁ TRÊN ĐẦU CHỮ "ệ" -->
    <g transform="translate(332, 94)" filter="url(#hatShadow)">
      <!-- Hat cone body -->
      <path 
        d="M 0 -76 L 55 4 Q 0 15 -55 4 Z" 
        fill="url(#hatStrawGrad)" 
      />

      <!-- Concentric bamboo weave rings -->
      <path d="M -14 -52 Q 0 -47 14 -52" fill="none" stroke="#8C5317" stroke-width="2.0" opacity="0.8" />
      <path d="M -28 -32 Q 0 -26 28 -32" fill="none" stroke="#8C5317" stroke-width="2.2" opacity="0.85" />
      <path d="M -41 -12 Q 0 -4 41 -12" fill="none" stroke="#8C5317" stroke-width="2.4" opacity="0.9" />

      <!-- Radial bamboo ribs radiating from apex (0, -76) -->
      <line x1="0" y1="-76" x2="-40" y2="4" stroke="#8C5317" stroke-width="1.8" opacity="0.65" />
      <line x1="0" y1="-76" x2="-23" y2="8" stroke="#8C5317" stroke-width="1.8" opacity="0.65" />
      <line x1="0" y1="-76" x2="-7" y2="10" stroke="#8C5317" stroke-width="1.8" opacity="0.65" />
      <line x1="0" y1="-76" x2="7" y2="10" stroke="#8C5317" stroke-width="1.8" opacity="0.65" />
      <line x1="0" y1="-76" x2="23" y2="8" stroke="#8C5317" stroke-width="1.8" opacity="0.65" />
      <line x1="0" y1="-76" x2="40" y2="4" stroke="#8C5317" stroke-width="1.8" opacity="0.65" />

      <!-- Crimson Red Rim Band (Vành nón lá đỏ thắm) -->
      <path 
        d="M -56 4 Q 0 15.5 56 4" 
        fill="none" 
        stroke="#9E2A2B" 
        stroke-width="8" 
        stroke-linecap="round" 
      />
    </g>

    <!-- Letter "t" -->
    <text x="395" y="222" class="vp-text">t</text>

    <!-- Letter "p" -->
    <text x="565" y="222" class="vp-text">p</text>

    <!-- Letter "h" -->
    <text x="715" y="222" class="vp-text">h</text>

    <!-- Letter "u" (base letter) -->
    <text x="860" y="222" class="vp-text">u</text>

    <!-- Dấu nặng (dot below) for letter "ụ" -->
    <circle cx="925" cy="264" r="14" fill="#1C3F34" />

    <!-- Letter "c" -->
    <text x="1005" y="222" class="vp-text">c</text>
  </g>
</svg>
`;

  const buffer = Buffer.from(svg);
  const outPng1 = path.join(__dirname, '../public/viet-phuc-xanh-reu.png');
  const outPng2 = path.join(__dirname, '../src/assets/viet-phuc-xanh-reu.png');

  // Generate crisp transparent PNG
  await sharp(buffer)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outPng1);

  await sharp(buffer)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outPng2);

  console.log('Successfully generated:', outPng1, outPng2);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
