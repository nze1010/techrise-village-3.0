const fs = require('fs');
const https = require('https');

const members = JSON.parse(fs.readFileSync('./members.json', 'utf8'));
console.log(`Loaded ${members.length} members from members.json`);

const PROJECT_ID = 'techrise-village';

function convertValue(val) {
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return { integerValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(convertValue) } };
  }
  if (typeof val === 'object' && val !== null) {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = convertValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val || '') };
}

async function uploadMember(member) {
  const fields = {};
  for (const [k, v] of Object.entries(member)) {
    fields[k] = convertValue(v);
  }
  
  const body = JSON.stringify({ fields });
  const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/members/${member.id}`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: path,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });

    req.on('error', (err) => resolve(false));
    req.write(body);
    req.end();
  });
}

async function runSeeding() {
  console.log('🚀 Uploading 827 residents directly to Firestore Cloud...');
  let successCount = 0;
  
  // Concurrency batches of 25 requests
  for (let i = 0; i < members.length; i += 25) {
    const batch = members.slice(i, i + 25);
    const results = await Promise.all(batch.map(uploadMember));
    successCount += results.filter(Boolean).length;
    if ((i + 25) % 100 === 0 || i + 25 >= members.length) {
      console.log(`Progress: ${Math.min(i + 25, members.length)} / ${members.length} uploaded...`);
    }
  }

  console.log(`✅ Seeding Complete! Successfully uploaded ${successCount} / ${members.length} residents to Firestore.`);
}

runSeeding();
