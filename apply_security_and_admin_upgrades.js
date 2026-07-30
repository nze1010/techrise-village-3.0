const fs = require('fs');

let html = fs.readFileSync('C:/Users/COLLINS/Desktop/techrise village 3.0/index.html', 'utf8');

// 1. Anti-Duplicate Function & PWA trigger logic
const securityAndPwaJS = `
    // ============================================================
    // ANTI-DUPLICATE IDENTITY SIMILARITY SCANNER
    // ============================================================
    function checkDuplicateRegistration(fullName, profession, lga, phone) {
      if (!membersList || membersList.length === 0) return { isDuplicate: false };

      const cleanName = (fullName || '').toLowerCase()
        .replace(/\\b(engr|dr|mr|mrs|miss|prof|barr|pst|rev|evang)\\b\\.?/gi, '')
        .replace(/[^a-z0-9]/g, ' ')
        .trim().split(/\\s+/).filter(Boolean);

      const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

      for (const m of membersList) {
        const existingNameTokens = (m.fullName || '').toLowerCase()
          .replace(/\\b(engr|dr|mr|mrs|miss|prof|barr|pst|rev|evang)\\b\\.?/gi, '')
          .replace(/[^a-z0-9]/g, ' ')
          .trim().split(/\\s+/).filter(Boolean);

        // Check 1: Phone number match
        if (cleanPhone && cleanPhone.length >= 8 && m.phone) {
          const existingPhone = m.phone.replace(/[^0-9]/g, '');
          if (existingPhone && (existingPhone.endsWith(cleanPhone) || cleanPhone.endsWith(existingPhone))) {
            return {
              isDuplicate: true,
              reason: \`Phone number matches registered resident "\${m.fullName}". Search your profile in the directory and click "My Account" to update your details.\`,
              existingMember: m
            };
          }
        }

        // Check 2: Exact Name Match + Skill Track Match
        const sameTokens = cleanName.filter(t => existingNameTokens.includes(t));
        const nameSimilarity = sameTokens.length / Math.max(cleanName.length, existingNameTokens.length);

        if (nameSimilarity >= 0.75 && m.profession === profession) {
          return {
            isDuplicate: true,
            reason: \`A resident named "\${m.fullName}" is already registered under "\${profession}". Click "My Account" on your card to claim or edit your profile.\`,
            existingMember: m
          };
        }

        // Check 3: High Name Similarity + LGA Match
        if (nameSimilarity >= 0.85 && m.lga === lga) {
          return {
            isDuplicate: true,
            reason: \`A resident named "\${m.fullName}" is already registered in "\${lga}". Click "My Account" on your card to manage your profile.\`,
            existingMember: m
          };
        }
      }

      return { isDuplicate: false };
    }
    window.checkDuplicateRegistration = checkDuplicateRegistration;

    // ============================================================
    // PWA & APP DOWNLOAD POPUP LOGIC
    // ============================================================
    let deferredPwaPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPwaPrompt = e;
    });

    function openAppDownloadModal() {
      const modal = document.getElementById('app-download-modal');
      if (modal) modal.style.display = 'flex';
    }
    window.openAppDownloadModal = openAppDownloadModal;

    function closeAppDownloadModal() {
      const modal = document.getElementById('app-download-modal');
      if (modal) modal.style.display = 'none';
      try { sessionStorage.setItem('techrise_app_prompt_closed', 'true'); } catch(e) {}
    }
    window.closeAppDownloadModal = closeAppDownloadModal;

    function triggerPwaInstall() {
      if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        deferredPwaPrompt.userChoice.then((choiceResult) => {
          deferredPwaPrompt = null;
          closeAppDownloadModal();
        });
      } else {
        alert('📲 To install Abia TechRise App on your device:\\n\\n• iPhone / Safari: Tap Share icon ➔ "Add to Home Screen"\\n• Android / Chrome: Tap 3 dots Menu ➔ "Install App" or "Add to Home Screen"');
      }
    }
    window.triggerPwaInstall = triggerPwaInstall;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW reg error:', err));
    }
`;

if (!html.includes('checkDuplicateRegistration')) {
  html = html.replace('function renderAdminDashboard()', securityAndPwaJS + '\n    function renderAdminDashboard()');
}

// 2. Add Duplicate Check inside memberForm listener
const dupCheckBlock = `
            // Anti-Duplicate Security Interception
            const dupCheck = checkDuplicateRegistration(fullName, profession, lga, phone);
            if (dupCheck.isDuplicate) {
              statusMsg.className = "status-msg error";
              statusMsg.innerHTML = \`⚠️ <strong>Duplicate Profile Intercepted:</strong><br>\${dupCheck.reason}\`;
              statusMsg.style.display = "block";
              submitBtn.disabled = false;
              submitBtn.textContent = "Publish Profile to Directory";
              return;
            }
`;

if (!html.includes('dupCheck.isDuplicate')) {
  html = html.replace('const newId = "m-" + Date.now();', dupCheckBlock + '\n            const newId = "m-" + Date.now();');
}

// 3. Add Auto App Download Popup trigger in DOMContentLoaded
if (!html.includes('openAppDownloadModal()')) {
  html = html.replace('setTimeout(checkForAppUpdate, 5000);', 'setTimeout(checkForAppUpdate, 5000);\n      setTimeout(() => { if (!sessionStorage.getItem("techrise_app_prompt_closed")) openAppDownloadModal(); }, 1200);');
}

fs.writeFileSync('C:/Users/COLLINS/Desktop/techrise village 3.0/index.html', html);
console.log('Security & PWA logic applied successfully!');
