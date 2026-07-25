const BIN_ID = process.env.JSONBIN_BIN_ID || '6a61552bda38895dfe81c30b';
const MASTER_KEY = process.env.JSONBIN_API_KEY || '$2a$10$V7cxtZaMD/NAqEmmfPShr.3A3n5Gmi52qatpkCacaILG6g0EiDCbq';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '01401d9c20e1a8a8132df08f1e48ad43';
const ADMIN_KEY = process.env.ADMIN_KEY || '3030';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function uploadToImgBB(base64Data) {
  try {
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const formData = new URLSearchParams();
    formData.append('image', cleanBase64);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data && data.data && data.data.url) {
      return data.data.display_url || data.data.url;
    }
    return '';
  } catch (err) {
    console.error('ImgBB upload error:', err);
    return '';
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // GET /api/members
    if (req.method === 'GET') {
      try {
        const response = await fetch(`${JSONBIN_URL}/latest`, {
          headers: { 'X-Master-Key': MASTER_KEY }
        });
        if (response.ok) {
          const data = await response.json();
          const records = Array.isArray(data.record) ? data.record.filter(m => m.id !== 'empty-seed') : [];
          if (records.length > 5) {
            return res.status(200).json(records);
          }
        }
      } catch (err) {
        console.warn('JSONBin fetch error, falling back to local members.json file:', err);
      }

      // Fallback to local members.json
      try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'members.json');
        const fileData = fs.readFileSync(filePath, 'utf-8');
        return res.status(200).json(JSON.parse(fileData));
      } catch (e) {
        return res.status(200).json([]);
      }
    }

    // POST /api/members
    if (req.method === 'POST') {
      const newMember = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (newMember.photoBase64) {
        const uploadedUrl = await uploadToImgBB(newMember.photoBase64);
        if (uploadedUrl) {
          newMember.photoUrl = uploadedUrl;
        }
        delete newMember.photoBase64;
      }

      const getRes = await fetch(`${JSONBIN_URL}/latest`, {
        headers: { 'X-Master-Key': MASTER_KEY }
      });
      const getData = await getRes.json();
      const currentRecords = Array.isArray(getData.record) ? getData.record.filter(m => m.id !== 'empty-seed') : [];

      const updatedRecords = [newMember, ...currentRecords];

      await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify(updatedRecords)
      });

      return res.status(200).json(updatedRecords);
    }

    // DELETE /api/members
    if (req.method === 'DELETE') {
      const { id, pin } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || req.query;

      if (!id || !pin) {
        return res.status(400).json({ error: 'Missing member ID or Security PIN.' });
      }

      const getRes = await fetch(`${JSONBIN_URL}/latest`, {
        headers: { 'X-Master-Key': MASTER_KEY }
      });
      const getData = await getRes.json();
      const currentRecords = Array.isArray(getData.record) ? getData.record : [];

      const memberIndex = currentRecords.findIndex(m => m.id === id);
      if (memberIndex === -1) {
        return res.status(404).json({ error: 'Resident profile not found.' });
      }

      const targetMember = currentRecords[memberIndex];
      const isAdmin = pin === ADMIN_KEY;
      const isPinMatch = targetMember.securityPin && targetMember.securityPin === pin;

      if (!isAdmin && !isPinMatch) {
        return res.status(403).json({ error: 'Incorrect 4-Digit Security PIN.' });
      }

      currentRecords.splice(memberIndex, 1);

      const recordsToSave = currentRecords.length > 0 ? currentRecords : [{ id: 'empty-seed', fullName: 'Abia TechRise Village', profession: 'Cohort Directory', lga: 'Umuahia North' }];

      await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify(recordsToSave)
      });

      return res.status(200).json({ success: true, remaining: currentRecords.filter(m => m.id !== 'empty-seed') });
    }

    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server Exception' });
  }
}
