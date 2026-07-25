const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Use Buffer-based replacement to avoid encoding issues in source
function makeReplacement(hexBad, good) {
  // hexBad is array of byte values as they appear in the file
  const badBytes = Buffer.from(hexBad);
  const badStr = badBytes.toString('utf8');
  if (content.includes(badStr)) {
    const count = content.split(badStr).length - 1;
    content = content.split(badStr).join(good);
    console.log(`Fixed ${count}x: ${JSON.stringify(badStr)} -> ${good}`);
  }
}

// Load lines to do targeted replacements
const lines = content.split('\n');

// Line 826: 🏙️™️ -> 🏙️
lines[825] = lines[825].replace(/🏙️™[^\s]?\s?/g, '🏙️ ');

// Line 861: eye emoji (👁️ = U+1F441 U+FE0F)
// The garbled text is ðŸ'ï¸ = bytes: EF BF BD (👁) +  EF BF BD
// Replace with word "👁️"
lines[860] = lines[860].replace(/ðŸ'ï¸/, '\u{1F441}\uFE0F');

// Line 869, 961, 1172: ✏️ pencil
[868, 960, 1171].forEach(idx => {
  if (lines[idx]) lines[idx] = lines[idx].replace(/âœï¸/, '\u{270F}\uFE0F');
});

// Line 987: 🐦 bird
lines[986] = lines[986].replace(/ðŸ¦/, '\u{1F426}');

// Line 1621: 𝕏 Twitter X
lines[1620] = lines[1620].replace(/ð•/, '\u{1D54F}');

// Lines with ❌ error messages
[1780, 1785, 1792, 1799, 2080, 2157, 2174, 2469, 2475, 2483, 2491, 2532].forEach(idx => {
  if (lines[idx]) lines[idx] = lines[idx].replace(/âŒ/g, '\u274C');
});

// Line 2449: ❤️
lines[2448] = lines[2448].replace(/â¤ï¸/, '\u2764\uFE0F');

content = lines.join('\n');

fs.writeFileSync('index.html', content, 'utf8');
console.log('✅ Buffer-based targeted fixes applied!');

const remaining = content.match(/[\u0080-\u00FF]{2,}/g);
console.log('Remaining garbled count:', remaining ? remaining.length : 0);
if (remaining) console.log('Sample:', [...new Set(remaining)].slice(0,5));
