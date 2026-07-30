# ABIA TECHRISE 3.0 · REMEMBRANCE VILLA

**ABIA TECHRISE 3.0 REMEMBRANCE VILLA** is a member portfolio directory and digital village for cohort graduates. It allows alumni to register their profile, display active projects, showcase LinkedIn & portfolio links, and stay reachable post-graduation.

---

## 📁 Project Structure

- `index.html` - Self-contained single-page website (inline CSS & JS, no framework or build step required). Firestore is the single source of truth for shared application data and telemetry.
- `worker.js` - Cloudflare Worker proxy script that safely interfaces with [JSONBin.io](https://jsonbin.io) without exposing API keys in the client browser.
- `README.md` - Deployment and setup documentation.

---

## ⚡ Quick Start (Local Demo Mode)

Run the included local server and connect to the configured Firebase project:
1. Run `node local_server.js`.
2. Open `http://localhost:3000` in a browser.
3. Members, messages, announcements, Village Hut posts, and telemetry are stored in Firestore rather than browser storage.

---

## 🛠️ Production Setup: Deploying Backend Proxy (`worker.js`)

To enable shared multi-user persistence across the web via [JSONBin.io](https://jsonbin.io):

### Step 1: Create a Bin on JSONBin.io
1. Sign up / log in to [JSONBin.io](https://jsonbin.io).
2. Create a new Bin containing an empty JSON array: `[]`.
3. Copy your **Bin ID** (e.g. `65a123456789abcdef123456`).
4. Under API Keys, copy your **Master Key** (e.g. `$2a$10$abcdef...`).

### Step 2: Deploy `worker.js` to Cloudflare Workers

#### Option A: Using Wrangler CLI (Recommended)
1. Install Wrangler CLI if not installed:
   ```bash
   npm install -g wrangler
   ```
2. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```
3. Deploy the worker script:
   ```bash
   npx wrangler deploy worker.js --name techrise-villa-proxy
   ```
4. Set your encrypted environment secrets:
   ```bash
   npx wrangler secret put JSONBIN_BIN_ID
   # When prompted, paste your JSONBin Bin ID
   
   npx wrangler secret put JSONBIN_API_KEY
   # When prompted, paste your JSONBin Master API Key
   ```

#### Option B: Via Cloudflare Dashboard
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com) and navigate to **Workers & Pages**.
2. Click **Create Application** -> **Create Worker**.
3. Name your worker (e.g. `techrise-villa-proxy`) and click **Deploy**.
4. Click **Edit Code**, delete the default code, paste the contents of `worker.js`, and click **Save and Deploy**.
5. Go back to the Worker's **Settings** -> **Variables and Secrets**.
6. Under **Environment Variables**, click **Add** and create two encrypted secrets:
   - Secret Name: `JSONBIN_BIN_ID` (Value: your JSONBin Bin ID)
   - Secret Name: `JSONBIN_API_KEY` (Value: your JSONBin Master Key)
7. Click **Save and Deploy**.

---

## 🔗 Step 3: Link Worker URL in `index.html`

1. Copy your Cloudflare Worker public URL from the deployment dashboard (e.g., `https://techrise-villa-proxy.your-subdomain.workers.dev`).
2. Open `index.html` in an editor.
3. Near line 490 inside `<script>`, locate the `WORKER_URL` constant:
   ```javascript
   const WORKER_URL = "";
   ```
4. Replace `""` with your Worker URL:
   ```javascript
   const WORKER_URL = "https://techrise-villa-proxy.your-subdomain.workers.dev";
   ```
5. Save `index.html`. Hosting `index.html` on GitHub Pages, Netlify, Vercel, or any static host will now automatically fetch and store cohort profiles securely!

---

## 👨‍💻 Credits

**DEVELOPED BY ENGR JOSIAH COLLINS CHINAZA · PYTHON TRACK**
Abia TechRise 3.0 Cohort
