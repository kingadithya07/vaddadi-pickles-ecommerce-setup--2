# Vaddadi Pickles - Cloudflare Image CDN Setup

This Cloudflare Worker routes and caches all product images from your Supabase Storage bucket (`vaddadi pickles product images`) across Cloudflare's global edge network (280+ cities).

### Benefits:
- **Lightning Fast Loads:** Edge caching serves images locally in milliseconds.
- **Zero Egress Overages:** Offloads 99% of bandwidth from Supabase.
- **Works with Free Plan:** Operates completely within Cloudflare Workers' generous free tier (100,000 requests/day free).
- **Flexible URLs:** Supports full Supabase paths, direct filenames, or query parameters.

---

## Option 1: Quick 2-Minute Setup in Cloudflare Dashboard (No CLI needed)

1. **Log in to Cloudflare:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Open Your Worker:**
   - In the left sidebar, click **Compute (Workers & Pages)** > click on **`vaddadipickles-media`**.
3. **Paste the Worker Code:**
   - Click **Edit code** (Quick Edit).
   - Delete the default `Hello World` code.
   - Copy the entire code from [`worker.js`](./worker.js) and paste it into the editor.
   - Click **Save and deploy**.
4. **Your Live Worker URL:**
   - `https://vaddadipickles-media.cjnews.workers.dev`
5. **Connected in Your App:**
   - In your `.env` file (or Vercel / Render environment variables):
     ```env
     VITE_IMAGE_CDN_URL=https://vaddadipickles-media.cjnews.workers.dev
     ```
   - Done! All store images will now automatically route through Cloudflare Edge.

---

## Option 2: Deploy with Wrangler CLI

1. Open your terminal in this repository and navigate to this folder:
   ```bash
   cd cloudflare-worker
   ```
2. Log in to Cloudflare:
   ```bash
   npx wrangler login
   ```
3. Deploy the worker:
   ```bash
   npx wrangler deploy
   ```
4. Copy the resulting URL printed in the terminal and set it as `VITE_IMAGE_CDN_URL` in your `.env`.

---

## Testing Your CDN Worker

Once deployed, you can verify your worker in the browser:

1. **Health Check:**
   `https://vaddadipickles-media.cjnews.workers.dev/`
   Returns JSON confirmation that the worker is operational.

2. **Image Delivery & Caching:**
   `https://vaddadipickles-media.cjnews.workers.dev/storage/v1/object/public/vaddadi%20pickles%20product%20images/Gongura.jpg`
   - First visit response header: `X-CDN-Cache: MISS`
   - Refresh / subsequent visits: `X-CDN-Cache: HIT` (served directly from Cloudflare Edge RAM/SSD cache)

---

## Upgrading to a Custom Domain (e.g. `images.vaddadipickles.com`)

Whenever you configure your custom domain on Cloudflare:
1. In Cloudflare Dashboard, go to your Worker > **Settings** > **Triggers** (or **Domains & Routes**).
2. Click **Add Custom Domain** (e.g. `images.vaddadipickles.com`).
3. Cloudflare will automatically provision DNS records and SSL certificates.
4. Update `VITE_IMAGE_CDN_URL=https://images.vaddadipickles.com` in your `.env`!
