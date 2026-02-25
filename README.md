# Interactive Resume Chat (MVP)

Minimal Node.js + Express app that exposes a `/chat` endpoint. The backend injects your resume (from `data/resume.json`) into the prompt and asks the OpenAI API to only use that data when answering.

Quick start

1. Copy `.env.example` to `.env` and add your `OPENAI_API_KEY`.
2. Install deps and run:

```bash
npm install
npm start
```

3. Open http://localhost:3000 in your browser and ask questions about the resume.

Notes
- The frontend is static and only calls the backend; the backend is responsible for contacting OpenAI.
- The server now performs in-memory retrieval: it creates embeddings for resume snippets on startup and uses nearest-neighbor retrieval at query time (no external DB required).
- To scale beyond this prototype, you can swap the in-memory store for a persistent vector store (pgvector, Pinecone, Weaviate, etc.).
