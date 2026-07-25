import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const BIN_ID = '6a61552bda38895dfe81c30b';
const MASTER_KEY = '$2a$10$V7cxtZaMD/NAqEmmfPShr.3A3n5Gmi52qatpkCacaILG6g0EiDCbq';
const IMGBB_API_KEY = '01401d9c20e1a8a8132df08f1e48ad43';
const ADMIN_KEY = '3030';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Upload image to ImgBB if base64 provided
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

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);

  // API Proxy Endpoint: /api/members
  if (reqUrl.pathname === '/api/members') {
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
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(records));
            return;
          }
        }
      } catch (err) {
        console.warn('JSONBin fetch error, using local members.json:', err);
      }

      // Fallback to local members.json file
      try {
        const membersFilePath = path.join(__dirname, 'members.json');
        const fileContent = fs.readFileSync(membersFilePath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(fileContent);
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
      }
      return;
    }

    // POST /api/members
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const newMember = JSON.parse(body);

          // Handle base64 photo upload if provided
          if (newMember.photoBase64) {
            const uploadedUrl = await uploadToImgBB(newMember.photoBase64);
            if (uploadedUrl) {
              newMember.photoUrl = uploadedUrl;
            }
            delete newMember.photoBase64;
          }
          
          // Get latest records
          const getRes = await fetch(`${JSONBIN_URL}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
          });
          const getData = await getRes.json();
          const currentRecords = Array.isArray(getData.record) ? getData.record : [];

          // Prepend new member
          const updatedRecords = [newMember, ...currentRecords];

          // Save back to JSONBin
          await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify(updatedRecords)
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(updatedRecords));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // DELETE /api/members
    if (req.method === 'DELETE') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { id, pin } = JSON.parse(body || '{}');

          if (!id || !pin) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing member ID or Security PIN.' }));
            return;
          }

          // Get current records
          const getRes = await fetch(`${JSONBIN_URL}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
          });
          const getData = await getRes.json();
          const currentRecords = Array.isArray(getData.record) ? getData.record : [];

          const memberIndex = currentRecords.findIndex(m => m.id === id);
          if (memberIndex === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Resident profile not found.' }));
            return;
          }

          const targetMember = currentRecords[memberIndex];
          const isAdmin = pin === ADMIN_KEY;
          const isPinMatch = targetMember.securityPin && targetMember.securityPin === pin;

          if (!isAdmin && !isPinMatch) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Incorrect 4-Digit Security PIN.' }));
            return;
          }

          // Delete record
          currentRecords.splice(memberIndex, 1);

          // If array becomes empty, keep 1 dummy or handle
          const recordsToSave = currentRecords.length > 0 ? currentRecords : [{ id: 'empty-seed', fullName: 'Abia TechRise Village', profession: 'Cohort Directory', lga: 'Umuahia North' }];

          // Save back to JSONBin
          await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify(recordsToSave)
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, remaining: currentRecords }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  // Serve static files (index.html)
  let filePath = path.join(__dirname, reqUrl.pathname === '/' ? 'index.html' : reqUrl.pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      if (ext === '.css') contentType = 'text/css';
      if (ext === '.js') contentType = 'text/javascript';
      if (ext === '.json') contentType = 'application/json';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 ABIA TECHRISE 3.0 REMEMBRANCE VILLA LOCAL SERVER`);
  console.log(`--------------------------------------------------`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`⚡ Connected live to JSONBin ID: ${BIN_ID}`);
  console.log(`📸 ImgBB Integration Active Key: ${IMGBB_API_KEY.slice(0,6)}...`);
  console.log(`==================================================\n`);
});
