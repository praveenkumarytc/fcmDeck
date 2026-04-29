<div align="center">

<img src="public/favicon.svg" alt="FCM Deck" width="80" />

# FCM Deck

**The free, open-source FCM push notification sender that runs entirely in your browser.**

[![Live](https://img.shields.io/badge/Live-fcmdeck.web.app-4f46e5?style=for-the-badge)](https://fcmdeck.web.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-16a34a?style=for-the-badge)](#contributing)
[![Made with Web Crypto](https://img.shields.io/badge/Made%20with-Web%20Crypto-ec4899?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

[Live Demo](https://fcmdeck.web.app) · [Report a bug](../../issues) · [Request a feature](../../issues)

</div>

---

## Why FCM Deck?

Sending Firebase push notifications during development usually means:

- Spinning up a Node script you copy-paste between projects, **or**
- Maintaining a private dashboard, **or**
- Pasting curl commands and OAuth tokens into your terminal

FCM Deck replaces all of that with a clean, professional web app:

- Save **multiple Firebase projects** in your browser
- Send to **single token, multiple tokens, or topics**
- **Simple mode** for quick title + body, or **Custom Payload** mode for the full FCM HTTP v1 message
- **Notification history**, dark mode, search, export/import
- **No backend, no Cloud Functions, no Blaze plan** — works on the free Spark plan
- **Your service account JSON never leaves your browser**

> All credentials and history live in your browser's `localStorage`. Nothing is uploaded to any server.

---

## Features

- **Project Manager** — save multiple Firebase projects with one click
- **Two Compose Modes**
  - Simple — title, body, image, data, priority
  - Custom Payload — full FCM v1 message JSON (with templates: Basic, Data, Android Channel, APNs, Web Push)
- **Multi-target Sending** — single token, multiple tokens (parallel), or topic
- **Notification History** — last 50 sends, success/failure indicators, relative timestamps
- **Dark / Light Theme** — auto-detects system preference
- **Search & Filter** projects, **Edit alias**, **Export/Import** all projects
- **JSON Tools** — format and validate the custom payload inline
- **Welcome Tutorial** — first-time popup explaining how it works and that nothing is stored remotely
- **Privacy First** — service account JSON, project list, history, theme — all stored only in the user's browser

---

## How it works (the cool part)

FCM Deck calls Firebase Cloud Messaging directly from the browser, with no backend in between.

```
[ Browser ]
    │  service account JSON (in your localStorage)
    │
    ▼
1. Sign a JWT (RS256) using Web Crypto API
2. Exchange the JWT for an OAuth 2.0 access token
   POST https://oauth2.googleapis.com/token
3. Send the FCM message
   POST https://fcm.googleapis.com/v1/projects/{projectId}/messages:send
```

Access tokens are cached in memory for ~55 minutes.

This means:

- **Static hosting is enough.** Free Firebase Hosting (Spark plan) is plenty.
- **Zero infrastructure.** No Cloud Functions, no Cloud Run, no Node server.
- **Zero data leakage.** Your private key is never sent to any third-party server you don't control.

---

## Quick start

### Use the hosted version

[https://fcmdeck.web.app](https://fcmdeck.web.app)

### Run locally

```bash
git clone https://github.com/<your-username>/fcm-deck.git
cd fcm-deck
npx firebase emulators:start --only hosting
```

Or simply open `public/index.html` in a browser.

### Deploy your own

```bash
npm install -g firebase-tools
firebase login
firebase init hosting          # point to public/
firebase deploy --only hosting
```

---

## Usage

1. Open the app and follow the welcome popup.
2. Click **Add Project** and upload your Firebase **service account JSON** (Project Settings → Service Accounts → Generate new private key).
3. Pick the project from the sidebar.
4. Pick **Simple** or **Custom Payload** mode and fill in target + message.
5. Hit **Send Notification**.

To send to multiple devices, paste tokens separated by commas or new lines.

---

## Project structure

```
fcm-deck/
├── public/
│   ├── index.html              # UI markup
│   ├── styles.css              # Design system + theming
│   ├── app.js                  # Application logic
│   ├── fcm-client.js           # Browser-side JWT + OAuth + FCM v1 sender
│   ├── firebase-init.js        # Firebase Web SDK init (analytics)
│   ├── favicon.svg
│   ├── og-image.svg
│   ├── manifest.webmanifest
│   ├── robots.txt
│   └── sitemap.xml
├── firebase.json               # Hosting config
├── .firebaserc
├── package.json
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Contributing

Contributions are warmly welcomed. Whether it's a bug report, a typo fix, or a new feature, you're appreciated.

### Quick contribution flow

1. **Fork** this repository
2. **Create** a feature branch: `git checkout -b feat/awesome-thing`
3. **Make** your changes (keep them focused and small)
4. **Open** a pull request describing the change and motivation

For larger changes, please open an issue first to discuss the approach.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full details, code style, and ways to help.

### Ideas / good first issues

- Notification scheduling (send later)
- Save composed messages as templates
- Per-project default topics list
- Drag & drop to reorder saved projects
- iOS / Android live preview of the notification
- Localization (i18n)
- Keyboard shortcuts for switching projects
- Replace SVG OG image with a generated PNG version
- A11y improvements (focus traps, ARIA polish)

---

## Roadmap

- [ ] Per-project named templates
- [ ] Scheduled / recurring sends
- [ ] Saved recipient lists (token groups)
- [ ] In-app FCM token generator helper
- [ ] PWA install + offline shell
- [ ] CI workflow + Lighthouse budget

---

## Security

- Service account keys grant full FCM admin privileges. Treat them like passwords.
- This tool keeps them only in the user's browser `localStorage`.
- Anyone with access to the same browser profile can read them. **Don't use shared/kiosk machines.**
- For team or public deployments, put the site behind authentication.

If you discover a security issue, please open a **private** issue or contact the maintainers directly rather than disclosing publicly.

---

## License

[MIT](LICENSE) — do whatever you want, just keep the copyright notice.

---

<div align="center">

If FCM Deck saves you time, please consider giving the repo a star — it really helps.

Made with care by the community.

</div>
