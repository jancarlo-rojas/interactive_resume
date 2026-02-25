# Interactive Resume – Jancarlo Rojas

An AI-powered interactive resume website that allows visitors to ask questions about my background, experience, personality, and career goals in real time.

Instead of a static PDF, this project turns my resume into structured data and connects it to an AI chat interface for dynamic responses.


## 🚀 Overview

This project transforms my professional profile into a structured, modular data system that powers an AI-driven chat experience.

Visitors can:

The AI pulls from organized JSON files to generate intelligent, context-aware responses.


## 🧠 Architecture

The application is structured into multiple data layers:

### 📁 Data Layer (`/data`)

This modular structure allows the AI to respond intelligently to HR-style, technical, and consulting-focused prompts.


## 🛠 Tech Stack

**Frontend**

**Backend**

**AI Integration**

**Version Control**


## 💡 Key Features



## 🎯 Purpose

This project demonstrates:


It reflects my goal of pursuing a career in IT Consulting / Technology Advisory.


## 📬 Contact

Jancarlo L. Rojas  
Email: jancarlo.ll.rojas@gmail.com  
LinkedIn: https://linkedin.com/in/jancarlorojas  


# Interactive Resume Chat (MVP)

This repository contains a minimal, self-hosted "resume-only" chat demo: a web chat UI that sends user queries to a Node.js backend; the backend restricts answers to information extracted from a supplied resume. It's designed to be simple, local, and DB-free — suitable for prototyping a private resume QA assistant.

**Contents**
- **`server/index.js`**: Express server that handles `/chat`. It loads `data/resume.json`, creates in-memory embeddings for resume snippets at startup, retrieves nearest snippets for each query, and calls the OpenAI API to generate answers constrained to those snippets.
- **`data/resume.json`**: Example resume/profile data used to answer questions. Replace or extend this file to customize the assistant's knowledge.
- **`public/index.html`**, **`public/app.js`**, **`public/styles.css`**: Frontend chat UI — centered card layout, avatars, typing indicator, and animations. The frontend only communicates with the backend (never calls OpenAI directly).
- **`package.json`**: Node dependencies and start scripts.
- **`.env.example`**, **`.env`**: Environment variable examples and local secret file. **Never commit `.env`** to a public repo.
- **`.gitignore`**: Exclude `node_modules` and `.env`.

**Data files**
- **`data/resume.json`**: JSON object with fields such as `summary`, `skills`, `experience`, `education`. The server flattens and chunks this data to produce text snippets for embedding.
- **`.env` / `.env.example`**: Contains `OPENAI_API_KEY`, `OPENAI_MODEL`, and `OPENAI_EMBEDDING_MODEL` environment variables. The server reads the API key from `process.env.OPENAI_API_KEY`.

**Languages & Tech Stack**
- **Languages**: JavaScript (Node.js), HTML, CSS.
- **Runtime**: Node.js (recommended >=18).
- **Server**: Express.js
- **OpenAI client**: `openai` npm package (used for embeddings and chat completions)
- **Utilities**: `dotenv` for env vars, `cors` for simple cross-origin support.

**Main features**
- Resume-only answers: the assistant is instructed to answer only from the provided resume snippets. If the resume doesn't contain the answer, the assistant replies: "I don't know based on the resume." 
- In-memory retrieval (no DB): the server computes embeddings for resume chunks at startup and stores them in memory. On each query it embeds the query, finds nearest chunks by cosine similarity, and includes the top snippets in the system prompt.
- Simple, privacy-friendly architecture: no external vector DB is required by default — good for local use and prototypes.
- Sleek frontend: centered chat card, message bubbles with avatars, typing animation, and responsive layout.

How it works (high level)
1. Server startup: loads `data/resume.json`, flattens important fields into readable text, chunks the text, and computes embeddings for each chunk using `OPENAI_EMBEDDING_MODEL`.
2. On user query: the backend embeds the query, computes cosine similarity against the in-memory chunk embeddings, selects best matching snippets, and creates a system + user message sequence that includes only those snippets.
3. The backend calls OpenAI's chat completion API with the constructed messages and returns the model reply to the frontend.

How to run
1. Install Node.js (LTS >=18).
2. From the project root:

```powershell
cd C:\InteractiveResume
npm install
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY (do not share it)
npm start
```

Open http://localhost:3000 in your browser.

Configuration
- `OPENAI_API_KEY` — your secret key (set in `.env`).
- `OPENAI_MODEL` — the chat/completion model to use (default in `.env.example`).
- `OPENAI_EMBEDDING_MODEL` — embedding model used to index snippets (default in `.env.example`).
- `data/resume.json` — edit this file to supply your resume/profile data.

Security & notes
- Keep your `OPENAI_API_KEY` out of version control. Use `.env` and `.gitignore` (already added).
- For larger or production workloads, replace the in-memory store with a persistent vector DB (pgvector, Pinecone, Weaviate, etc.), and add rate-limiting / authentication to the API.

Development with AI
- This project was scaffolded and iteratively developed with the help of an AI coding assistant. The assistant helped create the Express backend, the front-end UI, the in-memory retrieval logic (chunking, embeddings, cosine-sim), and refined UX (typing indicator, animations). The code was generated, applied to files, and then tested and adjusted to meet the project's goals. The AI was used as a pair-programmer — it suggested structure and provided code snippets which were integrated into this repo.

