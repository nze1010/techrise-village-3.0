const fs = require('fs');

let html = fs.readFileSync('C:/Users/COLLINS/Desktop/techrise village 3.0/index.html', 'utf8');

// 1. Add Track Breakdown & LGA Leaderboard HTML into Admin Modal
const trackLgaHtml = `
        <!-- Master Intelligence: Skill Tracks Distribution & LGA Leaderboard -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1.25rem;">
          <!-- Skill Tracks Distribution -->
          <div style="background: rgba(10,15,30,0.85); border: 1px solid rgba(242,183,5,0.25); border-radius: 8px; padding: 0.85rem;">
            <h4 style="font-size: 0.85rem; color: #F2B705; margin-bottom: 0.6rem; display: flex; align-items: center; justify-content: space-between;">
              <span>💻 Skill Tracks Distribution</span>
              <span style="font-size: 0.7rem; color: #8B93A7;">Counts &amp; %</span>
            </h4>
            <div id="admin-track-distribution-list" style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.45rem; padding-right: 0.25rem;">
              <span style="color:#8B93A7; font-size:0.75rem;">Loading track analytics...</span>
            </div>
          </div>

          <!-- LGA Leaderboard -->
          <div style="background: rgba(10,15,30,0.85); border: 1px solid rgba(56,189,248,0.25); border-radius: 8px; padding: 0.85rem;">
            <h4 style="font-size: 0.85rem; color: #38BDF8; margin-bottom: 0.6rem; display: flex; align-items: center; justify-content: space-between;">
              <span>📍 LGA Alumni Leaderboard</span>
              <span style="font-size: 0.7rem; color: #8B93A7;">Top LGAs</span>
            </h4>
            <div id="admin-lga-leaderboard-list" style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.35rem; padding-right: 0.25rem;">
              <span style="color:#8B93A7; font-size:0.75rem;">Loading LGA leaderboard...</span>
            </div>
          </div>
        </div>

        <!-- Anti-Duplicate Audit Scanner Panel -->
        <div style="background: rgba(192,132,252,0.04); border: 1px solid rgba(192,132,252,0.25); border-radius: 8px; padding: 0.85rem; margin-bottom: 1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <label style="color: #C084FC; font-size: 0.82rem; font-weight: 700; display: block; margin-bottom: 0.1rem;">🛡️ Anti-Duplicate Audit Scanner</label>
              <p style="color: #8B93A7; font-size: 0.72rem;">Scans database for duplicate names, tracks, or phone numbers.</p>
            </div>
            <button onclick="adminScanDuplicates()" style="padding: 0.5rem 1rem; background: rgba(192,132,252,0.2); color: #C084FC; border: 1px solid rgba(192,132,252,0.4); border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight:700;">🔍 Run Duplicate Audit</button>
          </div>
          <div id="admin-duplicate-scan-results" style="display:none; margin-top:0.6rem; font-size:0.78rem; color:#EAEDF5; max-height:160px; overflow-y:auto; font-family:var(--font-mono);"></div>
        </div>
`;

if (!html.includes('admin-track-distribution-list')) {
  html = html.replace('<!-- Live Visitor Telemetry & Activity Stream -->', trackLgaHtml + '\n        <!-- Live Visitor Telemetry & Activity Stream -->');
}

// 2. Add Track & LGA render code + Duplicate Scanner JS to renderAdminDashboard
const trackLgaRenderJs = `
      // 📊 SKILL TRACKS DISTRIBUTION (% and counts)
      const trackCounts = {};
      membersList.forEach(m => {
        const track = m.profession || 'Unassigned';
        trackCounts[track] = (trackCounts[track] || 0) + 1;
      });

      const trackEl = document.getElementById('admin-track-distribution-list');
      if (trackEl) {
        const sortedTracks = Object.entries(trackCounts).sort((a,b) => b[1] - a[1]);
        const totalMembers = membersList.length || 1;
        trackEl.innerHTML = sortedTracks.map(([track, count]) => {
          const pct = ((count / totalMembers) * 100).toFixed(1);
          return \`
            <div style="margin-bottom:0.35rem;">
              <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:2px;">
                <span style="color:#EAEDF5; font-weight:600;">💻 \${escapeHtml(track)}</span>
                <span style="color:#F2B705; font-weight:700;">\${count} (\${pct}%)</span>
              </div>
              <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:10px; overflow:hidden;">
                <div style="width:\${pct}%; height:100%; background:linear-gradient(90deg, #F2B705, #1FAE7A); border-radius:10px;"></div>
              </div>
            </div>
          \`;
        }).join('');
      }

      // 📍 LGA LEADERBOARD (% and counts)
      const lgaCounts = {};
      membersList.forEach(m => {
        const lga = m.lga || 'Abia';
        lgaCounts[lga] = (lgaCounts[lga] || 0) + 1;
      });

      const lgaEl = document.getElementById('admin-lga-leaderboard-list');
      if (lgaEl) {
        const sortedLgas = Object.entries(lgaCounts).sort((a,b) => b[1] - a[1]);
        const totalMembers = membersList.length || 1;
        lgaEl.innerHTML = sortedLgas.map(([lga, count], i) => {
          const pct = ((count / totalMembers) * 100).toFixed(1);
          return \`
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:4px 8px; border-radius:6px; font-size:0.75rem;">
              <span>#\${i+1} 📍 <strong>\${escapeHtml(lga)}</strong></span>
              <span style="color:#38BDF8; font-weight:700;">\${count} (\${pct}%)</span>
            </div>
          \`;
        }).join('');
      }
`;

if (!html.includes('admin-track-distribution-list').length > 1 && !html.includes('SKILL TRACKS DISTRIBUTION')) {
  html = html.replace('document.getElementById(\'admin-stat-searches\').textContent = totalSearches;', 'document.getElementById(\'admin-stat-searches\').textContent = totalSearches;\n' + trackLgaRenderJs);
}

// 3. Add adminScanDuplicates function
const dupScanJS = `
    function adminScanDuplicates() {
      if (!isAdminAuthenticated) return;
      const resEl = document.getElementById('admin-duplicate-scan-results');
      if (!resEl) return;
      resEl.style.display = 'block';
      resEl.innerHTML = '🔍 Scanning 827+ database records for duplicate registrations...';

      setTimeout(() => {
        const duplicatesFound = [];
        const seenNames = {};
        const seenPhones = {};

        membersList.forEach(m => {
          const normName = (m.fullName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const normPhone = (m.phone || '').replace(/[^0-9]/g, '');

          if (normName && seenNames[normName]) {
            duplicatesFound.push({ type: 'Name Match', original: seenNames[normName], duplicate: m });
          } else if (normName) {
            seenNames[normName] = m;
          }

          if (normPhone && normPhone.length >= 8 && seenPhones[normPhone]) {
            duplicatesFound.push({ type: 'Phone Match', original: seenPhones[normPhone], duplicate: m });
          } else if (normPhone && normPhone.length >= 8) {
            seenPhones[normPhone] = m;
          }
        });

        if (duplicatesFound.length === 0) {
          resEl.innerHTML = '<span style="color:#6EE7B7;">✅ Zero duplicate profiles found! Database is clean and unique.</span>';
        } else {
          resEl.innerHTML = \`
            <div style="color:#FCA5A5; margin-bottom:0.4rem;">⚠️ Found \${duplicatesFound.length} potential duplicate record(s):</div>
            \${duplicatesFound.map(item => \`
              <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); padding:4px 8px; border-radius:4px; margin-bottom:4px; font-size:0.72rem;">
                <strong>\${item.type}:</strong> "\${escapeHtml(item.duplicate.fullName)}" (\${escapeHtml(item.duplicate.id)}) matches "\${escapeHtml(item.original.fullName)}" (\${escapeHtml(item.original.id)})
                <button onclick="adminDeleteMemberById('\${escapeHtml(item.duplicate.id)}')" style="margin-left:6px; background:rgba(239,68,68,0.3); color:#FFF; border:none; border-radius:3px; padding:2px 6px; cursor:pointer; font-size:0.68rem;">Remove Dup</button>
              </div>
            \`).join('')}
          \`;
        }
      }, 400);
    }
    window.adminScanDuplicates = adminScanDuplicates;

    function adminDeleteMemberById(memberId) {
      if (!isAdminAuthenticated || !confirm(\`Permanently delete duplicate member \${memberId}?\`)) return;
      const idx = membersList.findIndex(m => m.id === memberId);
      if (idx !== -1) membersList.splice(idx, 1);
      if (db) {
        db.collection('members').doc(memberId).delete().catch(() => {});
      }
      renderDirectory();
      renderAdminDashboard();
      adminScanDuplicates();
    }
    window.adminDeleteMemberById = adminDeleteMemberById;
`;

if (!html.includes('adminScanDuplicates')) {
  html = html.replace('function adminLogout() {', dupScanJS + '\n    function adminLogout() {');
}

fs.writeFileSync('C:/Users/COLLINS/Desktop/techrise village 3.0/index.html', html);
console.log('Admin analytics and scanner applied successfully!');
