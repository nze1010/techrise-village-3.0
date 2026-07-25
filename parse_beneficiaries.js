const fs = require('fs');

const txtPath = 'C:\\Users\\COLLINS\\Downloads\\Abia_TechRise_Cohort_3_Arranged_Beneficiaries.txt';
const outputPath = 'C:\\Users\\COLLINS\\Desktop\\techrise village 3.0\\members.json';

function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeTrack(rawTrack) {
  if (!rawTrack) return 'Other';
  const t = rawTrack.trim();

  // Exact match first (most reliable)
  const exactMap = {
    'AI & Machine Learning': 'AI & Machine Learning',
    'Computer Aided Design and Manufacturing': 'Computer Aided Design and Manufacturing',
    'Creative Arts: 2D & 3D Animation': 'Creative Arts: 2D & 3D Animation',
    'Cybersecurity': 'Cybersecurity',
    'Enterprise Python: Backend Development': 'Enterprise Python: Backend Development',
    'Fullstack Web Development with JavaScript': 'Fullstack Web Development with JavaScript',
    'UI/UX Design': 'UI/UX Design',
  };
  if (exactMap[t]) return exactMap[t];

  // Fallback fuzzy match
  const lower = t.toLowerCase();
  if (lower.includes('computer aided') || lower.includes('manufacturing')) return 'Computer Aided Design and Manufacturing';
  if (lower.includes('creative arts') || lower.includes('2d') || lower.includes('3d') || lower.includes('animation')) return 'Creative Arts: 2D & 3D Animation';
  if (lower.includes('ui') && lower.includes('ux')) return 'UI/UX Design';
  if (lower.includes('cybersecurity') || lower.includes('cyber')) return 'Cybersecurity';
  if (lower.includes('fullstack') || lower.includes('javascript') || lower.includes('web development')) return 'Fullstack Web Development with JavaScript';
  if (lower.includes('python') || lower.includes('backend')) return 'Enterprise Python: Backend Development';
  if (lower.includes('ai') || lower.includes('machine learning')) return 'AI & Machine Learning';

  return 'Other';
}

function normalizeLga(rawLga) {
  if (!rawLga) return 'Other';
  const validLgas = [
    'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano',
    'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa',
    'Ohafia', 'Osisioma Ngwa', 'Ugwunagbo', 'Ukwa East', 'Ukwa West',
    'Umuahia North', 'Umuahia South', 'Umunneochi'
  ];

  const trimmed = rawLga.trim();
  const match = validLgas.find(lga => lga.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

function parseFile() {
  const content = fs.readFileSync(txtPath, 'utf-8');
  const lines = content.split('\n');

  let currentLga = 'Umuahia North';
  const members = [];
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const headerMatch = line.match(/^([A-Z\s]+)\s*\(\d+\)$/);
    if (headerMatch) {
      currentLga = toTitleCase(headerMatch[1].trim());
      continue;
    }

    if (/^\d+\.\s*/.test(line)) {
      const parts = line.replace(/^\d+\.\s*/, '').split('|');
      if (parts.length >= 2) {
        const rawName = parts[0].trim();
        const rawTrack = parts[1].trim();
        let rawOrigin = currentLga;

        if (parts.length >= 3 && parts[2].includes('Origin:')) {
          rawOrigin = parts[2].replace('Origin:', '').trim();
        }

        count++;
        // Strict authentic profiles with NO mockup/false phone figures
        const member = {
          id: `m-${count}`,
          fullName: toTitleCase(rawName),
          profession: normalizeTrack(rawTrack),
          lga: normalizeLga(rawOrigin || currentLga),
          phone: "",
          securityPin: "3030"
        };

        members.push(member);
      }
    }
  }

  const jsonString = JSON.stringify(members);
  const sizeKb = (Buffer.byteLength(jsonString, 'utf8') / 1024).toFixed(2);
  console.log(`Parsed ${members.length} authentic members. Total compact size: ${sizeKb} KB`);

  fs.writeFileSync(outputPath, jsonString);
  console.log(`Wrote clean JSON output to ${outputPath}`);
}

parseFile();
