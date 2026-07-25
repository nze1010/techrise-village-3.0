const fs = require('fs');

const BIN_ID = '6a61552bda38895dfe81c30b';
const MASTER_KEY = '$2a$10$V7cxtZaMD/NAqEmmfPShr.3A3n5Gmi52qatpkCacaILG6g0EiDCbq';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function pushAllMembersToJSONBin() {
  try {
    console.log('Reading members.json...');
    const raw = fs.readFileSync('C:\\Users\\COLLINS\\Desktop\\techrise village 3.0\\members.json', 'utf-8');
    const membersData = JSON.parse(raw);
    console.log(`Uploading ${membersData.length} member profiles to JSONBin...`);

    const res = await fetch(JSONBIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY
      },
      body: JSON.stringify(membersData)
    });

    const data = await res.json();
    console.log('JSONBin Status Code:', res.status);
    if (data.metadata) {
      console.log('JSONBin Metadata:', data.metadata);
      console.log('JSONBin Record length:', Array.isArray(data.record) ? data.record.length : typeof data.record);
    } else {
      console.log('JSONBin Response:', data);
    }
  } catch (err) {
    console.error('Error uploading to JSONBin:', err);
  }
}

pushAllMembersToJSONBin();
