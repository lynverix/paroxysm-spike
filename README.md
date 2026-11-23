# paroxysm spike (milestone 0) — throwaway

Answers feasibility questions only. Contains no proxy code and no service worker virtualization.
Delete the repo when you're done.

## Questions it answers
| # | Question |
|---|---|
| T1 | On `file://`, is `navigator.serviceWorker` missing, or does `register()` fail? |
| T2 | What headers does the host send for the SVG and the worker script (content type, CSP, sandbox)? |
| T3 | Can a worker be registered at a subpath scope like `/gh/<owner>/<repo>@main/`? |
| T4a | Is `new Function()` allowed inside a worker served from that host? (Fern-style virtualization needs it) |
| T4b | Does `importScripts()` fail after install? (expected: yes) |
| T6 | Can the worker answer an in-scope navigation with synthesised `text/html`? |
| T7 | Does a proxy-style path (`~/sj/.../https://...`) get intercepted inside the scope? |
| T8 | Can this origin open `wss://api.scvmath.org/wi/`? |
| T9 | Cache Storage and IndexedDB available? |

## Steps
1. Create a **public** GitHub repo named `paroxysm-spike`. Upload `index.svg`, `spike-sw.js`, `spike-extra.js` to the repo root (default branch `main`). Before uploading, edit the `OWNER` line near the top of the script in `index.svg`.
2. Optional second host: repo Settings > Pages > deploy from `main` / root.
3. **Test A (file://)**: download `index.svg` from your repo and double-click it to open in Chrome. Copy the JSON from the bottom text box. Note what T1 and T3 say.
4. Click **open jsDelivr copy**. On that page: wait for the tests to finish, copy the JSON. Reload once, then click **T6b** and note what the page shows. Use the browser Back button to return.
5. Optional: repeat step 4 with **open GitHub Pages copy**.
6. Paste all JSON blocks (and anything that looked wrong on screen) back to Claude.

Notes:
- jsDelivr caches branch URLs. If you edit a file after uploading, either set `REF` to a commit hash or purge it at `https://purge.jsdelivr.net/gh/<owner>/paroxysm-spike@main/index.svg`.
- Optional local dry run before publishing: `python3 -m http.server 8080` in this folder, then open `http://localhost:8080/index.svg` (T1-T9 run there too).
