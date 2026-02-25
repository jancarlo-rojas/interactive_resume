import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load JSON safely
function loadJSON(file) {
  try {
    const filePath = path.join(process.cwd(), "data", file);
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function chunkText(text, maxLen = 800) {
  const parts = [];
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  let buf = "";
  for (const p of paragraphs) {
    if ((buf + "\n" + p).length > maxLen) {
      if (buf) parts.push(buf);
      buf = p;
    } else {
      buf = buf ? buf + "\n" + p : p;
    }
  }
  if (buf) parts.push(buf);
  return parts;
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function norm(a) {
  return Math.sqrt(dot(a, a));
}

function cosineSim(a, b) {
  return dot(a, b) / (norm(a) * norm(b) + 1e-8);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message required" });
  }

  try {
    // Load all resume data
    const profile = loadJSON("profile.json");
    const resume = loadJSON("resume.json");
    const personality = loadJSON("personality.json");
    const projects = loadJSON("projects.json");
    const careerGoals = loadJSON("career_goals.json");
    const performance = loadJSON("performance.json");
    const leadership = loadJSON("leadership.json");
    const behavioral = loadJSON("behavioral.json");

    const sections = [];

    if (profile.summary) sections.push(profile.summary);

    if (resume.experience) {
      resume.experience.forEach(e => {
        sections.push(`${e.role} at ${e.company}: ${(e.highlights || []).join("; ")}`);
      });
    }

    if (resume.technical_skills) {
      const tech = resume.technical_skills;
      sections.push(
        `Technical skills: ${
          [
            ...(tech.programming || []),
            ...(tech.tools || []),
            ...(tech.it_foundations || [])
          ].join(", ")
        }`
      );
    }

    if (projects.personal_projects) {
      projects.personal_projects.forEach(p => {
        sections.push(`${p.title}: ${p.description}`);
      });
    }

    const allText = sections.join("\n\n");
    const textChunks = chunkText(allText);

    // Create embeddings fresh each invocation (serverless safe)
    const embModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

    const chunkEmbeddings = await Promise.all(
      textChunks.map(async (text) => {
        const r = await client.embeddings.create({
          model: embModel,
          input: text
        });
        return { text, embedding: r.data[0].embedding };
      })
    );

    const q = await client.embeddings.create({
      model: embModel,
      input: message
    });

    const qEmbedding = q.data[0].embedding;

    const scored = chunkEmbeddings.map(c => ({
      text: c.text,
      score: cosineSim(qEmbedding, c.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    const topChunks = scored.slice(0, 5);

    const systemInstruction = `
You are a personable assistant representing someone's professional profile.
Respond naturally in first person.
Keep answers concise (2–3 sentences).
If info isn't in resume data, say you don't have that information.
`;

    const messages = [
      { role: "system", content: systemInstruction },
      {
        role: "system",
        content: "Relevant resume info:\n\n" + topChunks.map(t => t.text).join("\n\n")
      },
      { role: "user", content: message }
    ];

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      max_tokens: 400
    });

    const reply =
      completion.choices?.[0]?.message?.content || "No response";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}