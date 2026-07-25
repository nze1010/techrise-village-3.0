const fs = require('fs');
let lines = fs.readFileSync('index.html', 'utf8').split('\n');

// Map of line number (1-indexed) -> replacement text
// Format: [lineIndex (0-based), 'bad string', 'good string']
const fixes = [
  // Hamburger menu ☰
  [815, 'â˜°', '☰'],
  // Announcement emoji 📢
  [835, '📍¢', '📢'],
  // Edit pencil ✏️ in stats
  [868, 'âœï¸', '✏️'],
  // Post announcement 📢
  [873, '📍¢', '📢'],
  // Post button 📢
  [875, '📍¢', '📢'],
  // Backspace ⌫ in PIN numpad
  [950, 'âŒ«', '⌫'],
  // Edit profile ✏️ heading
  [960, 'âœï¸', '✏️'],
  // Start Discussion ✏️
  [1171, 'âœï¸', '✏️'],
  // ❌ error messages
  [1780, 'âŒ', '❌'],
  [1785, 'âŒ', '❌'],
  [1792, 'âŒ', '❌'],
  [1799, 'âŒ', '❌'],
  // Announcement textContent 📢
  [1958, '📍¢', '📢'],
  // ❌ more errors
  [2080, 'âŒ', '❌'],
  [2157, 'âŒ', '❌'],
  [2174, 'âŒ', '❌'],
  // ❤️ likes
  [2448, 'â¤ï¸', '❤️'],
  // ❌ more status messages
  [2469, 'âŒ', '❌'],
  [2475, 'âŒ', '❌'],
  [2483, 'âŒ', '❌'],
  [2491, 'âŒ', '❌'],
  [2532, 'âŒ', '❌'],
];

// Also fix CSS comment lines with ≤
[617, 681, 773].forEach(lineIdx => {
  if (lines[lineIdx]) {
    lines[lineIdx] = lines[lineIdx].replace(/â‰¤/g, '≤');
  }
});

// Apply all line fixes
fixes.forEach(([lineIdx, bad, good]) => {
  if (lines[lineIdx] !== undefined) {
    lines[lineIdx] = lines[lineIdx].split(bad).join(good);
    console.log(`Fixed line ${lineIdx + 1}: replaced "${bad}" with "${good}"`);
  }
});

// Global cleanup for any remaining known garbled patterns
let content = lines.join('\n');
const globalFixes = [
  ['â˜°', '☰'],
  ['âœï¸', '✏️'],
  ['âŒ«', '⌫'],
  ['âŒ', '❌'],
  ['â¤ï¸', '❤️'],
  ['â‰¤', '≤'],
  ['📍¢', '📢'],
  ['🏙️™ï¸', '🏙️'],
  ['🏙️™', '🏙️'],
];

globalFixes.forEach(([bad, good]) => {
  content = content.split(bad).join(good);
});

fs.writeFileSync('index.html', content, 'utf8');
console.log('\n✅ All remaining garbled emojis fixed!');
