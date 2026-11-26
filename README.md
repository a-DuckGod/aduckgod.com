# aduckgod.com

My link page and portfolio. Plain HTML, CSS and JS with no build step, hosted on Cloudflare Workers Static Assets (`aduckgod-com`).

```
index.html       home: profile, Discord status, socials
portfolio.html   projects, bot demo, pricing, contact
404.html         page not found
style.css        styles for every page
script.js        live Discord status, command menu, bot demo, prompt typer, screenshot lightbox
worker.js        serves 404.html for unmatched routes on Cloudflare Workers Static Assets
assets/          duck.svg, icons.svg (every icon), avatar.png, bot-avatar.jpg (demo bot),
                 og.png (link preview, 1200×630), screenshots
```

Run it locally with `python -m http.server 8000` and open http://localhost:8000.

## Editing

- Settings are in `CONFIG` at the top of `script.js`: Discord username, Discord user ID, the custom-status toggle and both invites. The invites are also plain links in the HTML, so search for the invite code and change it there too: my server (`discordInvite`) is in `index.html` and `portfolio.html`, the demo server (`demoInvite`) is in `portfolio.html`.
- Prices: the amounts in the pricing section of `portfolio.html`, plus "Bots from $5" on the Discord tile in `index.html`.
- Mods: the aDuckCounter and LumenForge rows in `portfolio.html` have `data-soon`, which shows that text as a toast instead of opening a link. When one goes public, put the real link in `href` and delete `data-soon`.
- Bot demo: the Discord window on the portfolio page is built in HTML (`#chat` in `portfolio.html`, `.dc` styles in `style.css`). Edit its text there, and the replies and timings in the Discord demo section of `script.js`, so they match what the bot actually says. The bot's profile picture is `assets/bot-avatar.jpg`.
- Rotating words on the home page: the `data-rotate` attribute in `index.html`, separated by `|`. The AI prompt examples: `data-prompts` in `portfolio.html`.
- Command menu (press `/` or Ctrl+K): the `COMMANDS` list in `script.js`.
- Icons: `assets/icons.svg`. Use one with `<svg class="i"><use href="assets/icons.svg?v=3#i-github"/></svg>`.
- Caching: after changing `style.css` or `script.js`, bump the `?v=` number where it's linked in the `<head>` of all three pages. After changing `icons.svg`, bump its `?v=` everywhere it's used (every `<use href>` and `ICONS` in `script.js`), and keep it the same number everywhere.

## Live Discord status

The home page shows your Discord status using [Lanyard](https://github.com/Phineas/lanyard). It only works while you're in the Lanyard Discord server (discord.gg/UrXF2cfJ7F). Your user ID is `discordId` in `script.js`. Set it to `''` to turn the status off.

## Hosting & Deploy (Cloudflare)

Hosted on **Cloudflare Workers Static Assets** as the `aduckgod-com` Worker with custom domains `aduckgod.com` and `www.aduckgod.com`.

- Static files (`index.html`, `portfolio.html`, `404.html`, `style.css`, `script.js`, and `assets/`) are served directly from Cloudflare's edge; `worker.js` serves `404.html` with HTTP `404` for unmatched paths.
- To enable automatic deploys on every `git push` to `main`, connect this repository in the Cloudflare dashboard under **Workers & Pages → `aduckgod-com` → Settings → Build**.
