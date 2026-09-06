# Astrosynthetic — site

Plain HTML/CSS/JS, no build step. Three files do all the work: `index.html`, `styles.css`, `script.js`. The "robot" is an inline SVG, so there's no image asset to host or license — it animates purely via CSS variables driven by scroll position.

## Deploy to GitHub Pages

```bash
cd astrosynthetic-site        # this folder
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Then on GitHub:
1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. Save. Your site will be live at `https://<your-username>.github.io/<your-repo>/` within a minute or two.

## Pointing astrosynthetic.com at it

The `CNAME` file in this repo already contains `astrosynthetic.com`, which is what tells GitHub Pages to serve your custom domain instead of the default `github.io` URL. You still need to set DNS at your domain registrar:

**Apex domain (astrosynthetic.com)** — add four `A` records pointing to GitHub's Pages IPs:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**www subdomain (optional, recommended)** — add a `CNAME` record:
```
www.astrosynthetic.com  →  <your-username>.github.io
```

Then back in **Settings → Pages**, enter `astrosynthetic.com` as the custom domain and check **Enforce HTTPS** once it's available (can take a few hours after DNS propagates).

## Wiring up the waitlist form

The form in `#access` is currently client-side only — it shows a confirmation message but doesn't send anywhere, since GitHub Pages can't run a backend. To actually collect emails, pick one:

- **Formspree** (easiest): create a form at formspree.io, then change the `<form>` tag's behavior in `script.js` to `fetch()` the Formspree endpoint instead of just showing a note.
- **Getform / Basin**: same idea, different provider.
- **Your own API**: point the fetch at any endpoint you control.

## Editing content

- Copy lives directly in `index.html` — headline, capability list, roadmap stages, waitlist copy.
- Colors, type, and spacing are all CSS custom properties at the top of `styles.css` under `:root`, so a palette or font change is a few lines, not a rewrite.
- The scroll-reactive robot behavior (rotation, glow, parallax) is driven by the `--progress` CSS variable set in `script.js` — search `--progress` in `styles.css` to see every place it's used if you want to tune the intensity of the effect.
