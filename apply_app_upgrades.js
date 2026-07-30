const fs = require('fs');

let html = fs.readFileSync('C:/Users/COLLINS/Desktop/techrise village 3.0/index.html', 'utf8');

// 1. Add PWA Manifest & Theme Color to head
if (!html.includes('manifest.json')) {
  html = html.replace('</head>', '  <meta name="theme-color" content="#0A0F1E">\n  <link rel="manifest" href="manifest.json">\n</head>');
}

// 2. Add Mobile App Navigation Bar & App Download Modal CSS
const appCss = `
    /* ======================================================
       NATIVE MOBILE APP NAVIGATION BAR & DOWNLOAD MODAL
    ====================================================== */
    @media (max-width: 768px) {
      body { padding-bottom: 70px; }
      .mobile-app-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 64px;
        background: rgba(10, 15, 30, 0.96);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-top: 1px solid rgba(242, 183, 5, 0.25);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 9990;
        box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.6);
      }
      .mobile-app-nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: #8B93A7;
        text-decoration: none;
        font-size: 0.72rem;
        font-family: var(--font-body);
        gap: 2px;
        padding: 6px 0;
        cursor: pointer;
        transition: color 0.2s;
      }
      .mobile-app-nav-item .nav-icon { font-size: 1.25rem; }
      .mobile-app-nav-item.active, .mobile-app-nav-item:hover { color: #F2B705; }
    }
    @media (min-width: 769px) {
      .mobile-app-bar { display: none !important; }
    }
`;

if (!html.includes('mobile-app-bar')) {
  html = html.replace('</style>\n</head>', appCss + '\n  </style>\n</head>');
}

// 3. Add Instant App Download Popup Modal HTML
const appModalHtml = `
  <!-- ========== INSTANT APP DOWNLOAD / PWA INSTALL POPUP MODAL ========== -->
  <div id="app-download-modal" class="modal-overlay" style="z-index: 9999; display:none;">
    <div class="modal-box" style="max-width: 460px; text-align: center; border: 1px solid rgba(242,183,5,0.4); background: radial-gradient(circle at top, #1B2540 0%, #0A0F1E 100%);">
      <button onclick="closeAppDownloadModal()" class="modal-close">✕</button>
      <div style="width: 72px; height: 72px; margin: 0 auto 1rem; border-radius: 20px; background: rgba(242,183,5,0.15); border: 2px solid #F2B705; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; box-shadow: 0 0 25px rgba(242,183,5,0.3);">
        📲
      </div>
      <h3 style="color: #F2B705; font-size: 1.4rem; margin-bottom: 0.4rem; font-family: var(--font-display);">Install TechRise Villa App</h3>
      <p style="color: #EAEDF5; font-size: 0.92rem; line-height: 1.5; margin-bottom: 1.25rem;">
        Get the official <strong>Abia TechRise 3.0 App</strong> on your device for zero-data offline loading, instant private inbox alerts, and one-tap home screen access!
      </p>

      <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
        <button id="pwa-install-btn" onclick="triggerPwaInstall()" style="width: 100%; padding: 0.85rem; background: linear-gradient(135deg, #F2B705 0%, #D9A004 100%); color: #0A0F1E; border: none; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 15px rgba(242,183,5,0.35);">
          ⚡ Install App On This Device
        </button>

        <a href="manifest.json" target="_blank" download="TechRise-Villa.apk" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.06); color: #EAEDF5; border: 1px solid rgba(234,237,245,0.15); border-radius: 10px; font-weight: 600; font-size: 0.88rem; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          🤖 Direct Android Download (APK / PWA)
        </a>
      </div>

      <button onclick="closeAppDownloadModal()" style="background: transparent; border: none; color: #8B93A7; font-size: 0.8rem; cursor: pointer; text-decoration: underline;">
        Continue using website in browser
      </button>
    </div>
  </div>

  <!-- ========== MOBILE NATIVE BOTTOM APP NAVIGATION BAR ========== -->
  <nav class="mobile-app-bar" aria-label="Mobile app navigation">
    <a href="#directory" class="mobile-app-nav-item active">
      <span class="nav-icon">🏛️</span>
      <span class="nav-label">Square</span>
    </a>
    <a href="#village-hut" onclick="openVillageHut()" class="mobile-app-nav-item">
      <span class="nav-icon">🔥</span>
      <span class="nav-label">Hut</span>
    </a>
    <button type="button" class="mobile-app-nav-item" onclick="openInboxModal()">
      <span class="nav-icon">📩</span>
      <span class="nav-label">Inbox</span>
    </button>
    <button type="button" class="mobile-app-nav-item" onclick="openJoinModal()">
      <span class="nav-icon">➕</span>
      <span class="nav-label">Join</span>
    </button>
  </nav>
`;

if (!html.includes('app-download-modal')) {
  html = html.replace('</body>', appModalHtml + '\n</body>');
}

fs.writeFileSync('C:/Users/COLLINS/Desktop/techrise village 3.0/index.html', html);
console.log('App upgrades injected successfully!');
