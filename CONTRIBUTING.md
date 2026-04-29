# Contributing to FCM Deck

Thank you for considering a contribution. Even small changes help.

## Ways to help

- Report bugs or unclear UX in [Issues](../../issues)
- Improve documentation, screenshots, or examples
- Suggest features
- Submit pull requests
- Help triage issues and review PRs

## Development setup

This is a fully static site. There are no build steps, no bundlers, no transpilers.

```bash
git clone https://github.com/<your-username>/fcm-deck.git
cd fcm-deck

# Option A — Firebase Hosting emulator (recommended)
npx firebase emulators:start --only hosting

# Option B — open the file directly
# Open public/index.html in your browser
```

That's it. Edit any file in `public/` and refresh.

## Code style

- Plain ES2020+ JavaScript, no frameworks, no transpiling.
- Two-space indentation.
- Use `const` / `let`, never `var`.
- Prefer small, focused functions.
- Keep dependencies to zero where possible. Anything new added at runtime must work without a build step.
- Use semantic HTML and accessible patterns (labels for inputs, `aria-*` where needed).
- CSS variables (already defined in `public/styles.css`) for colors, radii, shadows. Avoid hard-coded values.

## Project conventions

- **No backend.** All FCM logic stays in the browser via `public/fcm-client.js`.
- **No external storage.** All user data must remain in `localStorage` (or session-only memory).
- **Don't break existing data.** If changing the structure of stored projects/history, bump the storage key version (e.g. `fcm-saved-projects-v1` → `v2`) and migrate gracefully.
- **Don't log credentials.** Never `console.log` private key contents or access tokens.

## Pull request checklist

- [ ] My change is focused and small (open separate PRs for unrelated changes)
- [ ] I tested the change manually in the browser (Simple + Custom Payload modes if relevant)
- [ ] I checked dark mode and mobile layout
- [ ] I did not break any existing localStorage data
- [ ] I updated `README.md` if user-facing behavior changed

## Commit messages

Use a short imperative subject, e.g.:

- `fix: crash when sending empty topic`
- `feat: add APNs template`
- `docs: improve quick start instructions`
- `chore: update SEO metadata`

## Reporting bugs

A great bug report includes:

- What you tried to do
- What you expected
- What happened instead
- Browser + OS
- Steps to reproduce
- A redacted screenshot if helpful

## Security issues

Please do **not** open public issues for security vulnerabilities. Instead, contact the maintainers privately. We will respond as soon as possible.

## Code of conduct

Be kind. Assume good intent. Be patient with newcomers.

Thanks again — you rock.
