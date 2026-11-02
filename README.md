# Get Bibled

Static website for The Christian Life Foundation. Plain HTML, CSS and JavaScript. No build step and no backend.

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy
Any static host works (GitHub Pages, Cloudflare Pages, Netlify, Vercel). Publish the repository root and point your domain's DNS at the host.
For GitHub Pages, the custom domain goes in a file named `CNAME` containing only the domain, for example `getbibled.com`.

## Where to edit content
| What | File |
|---|---|
| Colors, fonts, layout | `assets/style.css` |
| Card search, active menu link | `assets/site.js` |
| 30 "Promises of God" topics | `assets/promises-data.js` |
| 30 Bible questions | `assets/qa-topics.js` |
| 365 daily devotionals (only Jan 1 and Oct 26 exist) | inline `entries` object in `devotional.html` |
| Manual titles | `manual.html` (lists `v` and `r`), `library.html`, `resources.html`, `index.html` |
| Menu and footer | repeated in every page; edit all pages when changing them |

## Before you go live
- Footer text on most pages still says "Design prototype — not a published ministry website". Remove it:
  `sed -i 's#<br/><small>Design prototype — not a published ministry website</small>##' *.html`
  (on macOS use `sed -i ''`). Then check the pages by eye.
- Many pages carry "draft for editorial review" notices (`lesson-notice`, `mini`, `note`). Remove or rewrite them once the content is approved.
- Volunteer form (`get-involved.html`) and giving buttons are preview only. They do not send or store anything. Connect a form service and a payment provider first.
- `assets/four-part-cover-N-PREVIEW.svg` are preview covers, not final artwork. Manual downloads are not connected.
- Only two devotionals exist (Jan 1 and Oct 26); other dates show a "reserved" message.
- Read the Bible is an interface preview. Licensed translations and Hebrew/Greek data are not included.

## Notes
- `assets/style.css`, `site.js`, `promises-data.js`, `qa-topics.js` and all images are the originals. A small marked supplement at the end of `style.css` styles the volunteer form.
- Written new: `who-is-god.html`, `whats-next.html`, `404.html`. Their teaching text is a draft and the KJV quotations should be checked.
- `assets/qa-data.js` is not used by any page.

## Sign-in flow
- `index.html` is the sign-in / create-account page and the first thing visitors see.
- `home.html` is the main page. Visitors go there after signing in.
- Every other page loads `assets/config.js` and `assets/guard.js`. When sign-in is configured, a visitor who is not signed in is sent to `index.html` and returned to the page they wanted after signing in. A "Sign Out" link appears in the menu.
- Preview mode: while `assets/config.js` is empty, nothing is sent or saved and every page stays open. The sign-in page shows a "Continue to the site" link.
- The guard controls the visitor flow only. On GitHub Pages the page files and the repository are still public, so do not put private content in them.

### Connect Supabase
1. Create a project at supabase.com.
2. Put the Project URL and the public anon (publishable) key in `assets/config.js`. Never the service_role / secret key.
3. Authentication -> URL Configuration: set Site URL to the site address and add `.../index.html` as a redirect URL. Confirmation and password-reset emails return there.
