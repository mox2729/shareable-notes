# Shareable Notes App

A React-based notes app with rich-text editing, AI-assisted summaries, tags, and optional glossary features.  
Uses serverless functions to securely call OpenAI.

---

## Live Demo

Hosted on Vercel: [https://your-app.vercel.app](https://your-app.vercel.app)

---

## Features

- Create, edit, delete, and pin notes
- Rich-text editor with bold, italic, underline, lists, alignment
- AI-generated summaries and tag suggestions
- Optional glossary highlighting
- Encryption-ready notes using Web Crypto API
- Local persistence (localStorage; can upgrade to IndexedDB)
- Fully client-side; serverless AI integration via `/api/openai.js`

---

## Getting Started (Local Development)

1. Clone the repo:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/shareable-notes.git
cd shareable-notes
```
