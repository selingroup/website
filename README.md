# selingroup.org

Website of the Selin Group at MIT, migrated from Squarespace in November 2026.
Built with [Eleventy](https://www.11ty.dev/) and hosted on GitHub Pages.

**To edit content, see [CLAUDE.md](CLAUDE.md)** — it explains where every piece of content lives,
with copy-paste recipes. (Claude and other AI assistants read it automatically.)

## One-time setup

1. **Install Node.js** (v20 or newer) from https://nodejs.org if you don't have it.
2. **Download the images from Squarespace** (do this *before* cancelling Squarespace):
   ```bash
   npm install
   npm run fetch-images
   ```
   This copies ~55 photos into `src/assets/images/`. Check the output for any failures.
3. **Preview locally:** `npm start`, then open http://localhost:8080.
4. **Move the deploy workflow into place** (it couldn't be written there directly):
   ```bash
   mkdir -p .github/workflows && mv setup/deploy.yml .github/workflows/deploy.yml && rmdir setup
   ```
5. **Create the GitHub repository** (e.g. `selingroup/website`, or under your account) and push:
   ```bash
   git init && git add . && git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
6. **Turn on GitHub Pages:** repo → Settings → Pages → *Source: GitHub Actions*.
   The included workflow (`.github/workflows/deploy.yml`) builds and publishes on every push.
7. **Custom domain:** Settings → Pages → Custom domain → `www.selingroup.org`
   (the `src/CNAME` file already contains it). Then, at your domain registrar
   (Squarespace Domains if the domain was registered there):
   - `CNAME` record: `www` → `<your-github-username>.github.io`
   - `A` records for the bare domain `selingroup.org`: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - Once DNS resolves, tick **Enforce HTTPS** in Pages settings.
8. Cancel the Squarespace *website* plan only after the new site is live (keep the domain
   registration, or transfer it to another registrar).

## Structure

```
src/
  _data/site.yml           site title, nav, home page text, footer
  _data/publications.yml   all publications
  _data/redirects.yml      old Squarespace URLs → new pages
  people/*.md              one file per person (current + alumni)
  news/*.md                one file per news item
  research.md, join.md     text pages
  assets/                  CSS and images
  _includes/               page templates (rarely need changing)
scripts/fetch-images.mjs   one-time image download from Squarespace
```
