const fs = require('fs');
const buf = fs.readFileSync('index.html');

// Map: hex bytes to find -> hex bytes to replace with
// Derived from the hex dump analysis
const replacements = [
  // Line 826: 🏙️™️ (garbled) -> 🏙️ (clean)
  // Garbled: ef909f8f99 efb88f c28f e284a2 c3af c2b8 c28f
  // Actually the garbled part is: 3e c28f e284a2 c3af c2b8 c28f
  // We want to remove the extra c28f e284a2 c3af c2b8 c28f after 🏙️ (ef90 9f8f99 efb88f)
  {
    find: Buffer.from('ef909f8f99efb88fc28fe284a2c3afc2b8c28f', 'hex'),
    replace: Buffer.from('ef909f8f99efb88f', 'hex') // just 🏙️
  },
  // Line 861: ðŸ'ï¸ -> 👁️
  // Garbled: c3b0 c5b8 e280 98c2 81c3 afc2 b8c2 8f
  // 👁️ = F0 9F 91 81 EF B8 8F
  {
    find: Buffer.from('c3b0c5b8e28098c281c3afc2b8c28f', 'hex'),
    replace: Buffer.from('f09f9181efb88f', 'hex') // 👁️
  },
  // Line 869, 961, 1172: âœï¸ -> ✏️
  // Garbled: c3a2 c593 c28f c3af c2b8 c28f
  // ✏️ = E2 9C 8F EF B8 8F
  {
    find: Buffer.from('c3a2c593c28fc3afc2b8c28f', 'hex'),
    replace: Buffer.from('e29c8fefb88f', 'hex') // ✏️
  },
  // Line 987: ðŸ¦ -> 🐦
  // Garbled: c3b0 c5b8 c290 c2a6
  // 🐦 = F0 9F 90 A6
  {
    find: Buffer.from('c3b0c5b8c290c2a6', 'hex'),
    replace: Buffer.from('f09f90a6', 'hex') // 🐦
  },
  // Line 1621: ð• -> 𝕏
  // Garbled: c3b0 c29d e280 a2c2 8f
  // 𝕏 = F0 9D 95 8F
  {
    find: Buffer.from('c3b0c29de280a2c28f', 'hex'),
    replace: Buffer.from('f09d958f', 'hex') // 𝕏
  }
];

// Also handle ❌ (âŒ) and ❤️ (â¤ï¸)
// Let's find their hex patterns
const content = buf.toString('utf8');
console.log('âŒ in content:', content.includes('âŒ'));
console.log('â¤ï¸ in content:', content.includes('â¤ï¸'));

// Get hex of these garbled strings
const xBuf = Buffer.from('âŒ', 'utf8');
const heartBuf = Buffer.from('â¤ï¸', 'utf8');
console.log('âŒ hex:', xBuf.toString('hex'));
console.log('â¤ï¸ hex:', heartBuf.toString('hex'));
console.log('❌ correct hex:', Buffer.from('❌').toString('hex'));
console.log('❤️ correct hex:', Buffer.from('❤️').toString('hex'));
