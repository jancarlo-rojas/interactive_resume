const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let resume = {};
let profile = {};
let personality = {};
let projects = {};
let careerGoals = {};
let performance = {};
let leadership = {};
let behavioral = {};

// Load all data files
try {
  profile = JSON.parse(fs.readFileSync('./data/profile.json', 'utf8'));
} catch (e) {
  console.warn('Could not load profile.json');
}

try {
  resume = JSON.parse(fs.readFileSync('./data/resume.json', 'utf8'));
} catch (e) {
  console.warn('Could not load resume.json; continue with empty resume');
}

try {
  personality = JSON.parse(fs.readFileSync('./data/personality.json', 'utf8'));
} catch (e) {
  console.warn('Could not load personality.json');
}

try {
  projects = JSON.parse(fs.readFileSync('./data/projects.json', 'utf8'));
} catch (e) {
  console.warn('Could not load projects.json');
}

try {
  careerGoals = JSON.parse(fs.readFileSync('./data/career_goals.json', 'utf8'));
} catch (e) {
  console.warn('Could not load career_goals.json');
}

try {
  performance = JSON.parse(fs.readFileSync('./data/performance.json', 'utf8'));
} catch (e) {
  console.warn('Could not load performance.json');
}

try {
  leadership = JSON.parse(fs.readFileSync('./data/leadership.json', 'utf8'));
} catch (e) {
  console.warn('Could not load leadership.json');
}

try {
  behavioral = JSON.parse(fs.readFileSync('./data/behavorial.json', 'utf8'));
} catch (e) {
  console.warn('Could not load behavorial.json');
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory vector store for resume chunks
const chunks = []; // { id, text, embedding }

function chunkText(text, maxLen = 800) {
  const parts = [];
  // naive split by sentences / newlines
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  let buf = '';
  for (const p of paragraphs) {
    if ((buf + '\n' + p).length > maxLen) {
      if (buf) parts.push(buf);
      buf = p;
    } else {
      buf = buf ? buf + '\n' + p : p;
    }
  }
  if (buf) parts.push(buf);
  return parts;
}

async function createEmbeddingsForResume() {
  // flatten resume into readable text sections
  const sections = [];
  
  // Add profile info
  if (profile.name || profile.title) {
    sections.push(`Name: ${profile.name}. Title: ${profile.title}`);
  }
  if (profile.location) {
    sections.push(`Location: ${profile.location}`);
  }
  if (profile.contact) {
    const contactParts = [];
    if (profile.contact.email) contactParts.push(`Email: ${profile.contact.email}`);
    if (profile.contact.phone) contactParts.push(`Phone: ${profile.contact.phone}`);
    if (profile.contact.linkedin) contactParts.push(`LinkedIn: ${profile.contact.linkedin}`);
    if (profile.contact.bitbucket) contactParts.push(`Bitbucket: ${profile.contact.bitbucket}`);
    if (profile.contact.portfolio) contactParts.push(`Portfolio: ${profile.contact.portfolio}`);
    if (contactParts.length > 0) sections.push(`Contact: ${contactParts.join('. ')}`);
  }
  if (profile.summary) {
    sections.push(`Summary: ${profile.summary}`);
  }

  // Add resume info (education, experience, technical skills)
  if (resume.education) {
    for (const ed of resume.education) {
      sections.push(`Education: ${ed.degree} from ${ed.school} (${ed.start || ''} - ${ed.expected_graduation || ed.year || ''}). GPA: ${ed.gpa || 'N/A'}. Relevant coursework: ${ed.relevant_coursework ? ed.relevant_coursework.join(', ') : 'N/A'}`);
    }
  }
  if (resume.experience) {
    for (const e of resume.experience) {
      const h = e.highlights ? e.highlights.join('; ') : '';
      sections.push(`Experience: ${e.role} at ${e.company} (${e.start || ''} - ${e.end || ''}). ${h}`);
    }
  }
  if (resume.technical_skills) {
    const techParts = [];
    if (resume.technical_skills.programming) techParts.push(`Programming: ${resume.technical_skills.programming.join(', ')}`);
    if (resume.technical_skills.tools) techParts.push(`Tools: ${resume.technical_skills.tools.join(', ')}`);
    if (resume.technical_skills.it_foundations) techParts.push(`IT Foundations: ${resume.technical_skills.it_foundations.join(', ')}`);
    if (techParts.length > 0) sections.push(`Technical Skills: ${techParts.join('. ')}`);
  }

  // Add data from personality.json
  if (personality.professional_traits) {
    if (personality.professional_traits.core_strengths) {
      sections.push(`Core Strengths: ${personality.professional_traits.core_strengths.join(', ')}`);
    }
    if (personality.professional_traits.personality_drivers) {
      sections.push(`Personality Drivers: ${personality.professional_traits.personality_drivers.join(', ')}`);
    }
    if (personality.professional_traits.development_areas) {
      sections.push(`Development Areas: ${personality.professional_traits.development_areas.join(', ')}`);
    }
  }
  if (personality.personal_passions) {
    const passionParts = [];
    if (personality.personal_passions.gaming) passionParts.push(`Gaming: ${personality.personal_passions.gaming}`);
    if (personality.personal_passions.running) passionParts.push(`Running: ${personality.personal_passions.running}`);
    if (personality.personal_passions.technology) passionParts.push(`Technology: ${personality.personal_passions.technology}`);
    if (passionParts.length > 0) sections.push(`Personal Interests and Passions: ${passionParts.join('. ')}`);
  }

  // Add data from projects.json
  if (projects.personal_projects && projects.personal_projects.length > 0) {
    for (const proj of projects.personal_projects) {
      sections.push(`Project - ${proj.title}: ${proj.description}`);
    }
  }
  if (projects.repositories && projects.repositories.length > 0) {
    for (const repo of projects.repositories) {
      sections.push(`Repository - ${repo.name}: ${repo.description}. URL: ${repo.url}`);
    }
  }
  if (projects.project_interests && projects.project_interests.length > 0) {
    sections.push(`Project Interests: ${projects.project_interests.join(', ')}`);
  }

  // Add data from career_goals.json
  if (careerGoals.career_vision) {
    const visionParts = [];
    if (careerGoals.career_vision.target_path) visionParts.push(`Career target: ${careerGoals.career_vision.target_path}`);
    if (careerGoals.career_vision.timeline) visionParts.push(`Timeline: ${careerGoals.career_vision.timeline}`);
    if (visionParts.length > 0) sections.push(`Career Vision: ${visionParts.join('. ')}`);
  }
  if (careerGoals.professional_focus_areas && careerGoals.professional_focus_areas.length > 0) {
    sections.push(`Professional Focus Areas: ${careerGoals.professional_focus_areas.join(', ')}`);
  }
  if (careerGoals.long_term_goals && careerGoals.long_term_goals.length > 0) {
    sections.push(`Long-term Goals: ${careerGoals.long_term_goals.join(', ')}`);
  }

  // Add data from performance.json
  if (performance.competitive_traits && performance.competitive_traits.length > 0) {
    sections.push(`Competitive Traits: ${performance.competitive_traits.join(', ')}`);
  }
  if (performance.risk_profile) {
    sections.push(`Risk Profile: ${performance.risk_profile}`);
  }
  if (performance.growth_orientation) {
    sections.push(`Growth Orientation: ${performance.growth_orientation}`);
  }

  // Add data from leadership.json
  if (leadership.leadership_style) {
    sections.push(`Leadership Style: ${leadership.leadership_style}`);
  }
  if (leadership.leadership_strengths && leadership.leadership_strengths.length > 0) {
    sections.push(`Leadership Strengths: ${leadership.leadership_strengths.join(', ')}`);
  }
  if (leadership.leadership_development_goals && leadership.leadership_development_goals.length > 0) {
    sections.push(`Leadership Development Goals: ${leadership.leadership_development_goals.join(', ')}`);
  }

  // Add data from behavorial.json
  if (behavioral.pressure_handling) {
    sections.push(`Pressure Handling: ${behavioral.pressure_handling}`);
  }
  if (behavioral.problem_solving_example) {
    sections.push(`Problem Solving Example: ${behavioral.problem_solving_example}`);
  }
  if (behavioral.teamwork_example) {
    sections.push(`Teamwork Example: ${behavioral.teamwork_example}`);
  }
  if (behavioral.conflict_style) {
    sections.push(`Conflict Style: ${behavioral.conflict_style}`);
  }

  const allText = sections.join('\n\n');
  const textChunks = chunkText(allText, 800);

  for (let i = 0; i < textChunks.length; i++) {
    const text = textChunks[i];
    try {
      const embModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
      const r = await client.embeddings.create({ model: embModel, input: text });
      const embedding = r.data[0].embedding;
      chunks.push({ id: `chunk-${i}`, text, embedding });
    } catch (err) {
      console.error('Embedding error', err);
    }
  }
  console.log(`Created ${chunks.length} resume chunks for retrieval`);
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

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ error: 'message required' });

  try {
    // embed the user query
    const embModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    const q = await client.embeddings.create({ model: embModel, input: userMessage });
    const qEmbedding = q.data[0].embedding;

    // compute similarities
    const scored = chunks.map(c => ({ ...c, score: cosineSim(qEmbedding, c.embedding) }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 5).filter(s => s.score > 0.2);
    // If no chunks pass threshold, include the best one anyway
    const finalChunks = top.length > 0 ? top : (scored.length > 0 ? [scored[0]] : []);

    const systemInstruction = `You are a personable assistant representing someone's professional profile. Your role is to answer questions based on resume data, but respond in a natural, conversational way instead of just reading the resume verbatim.

Guidelines:
- Synthesize and paraphrase information rather than copying it directly
- Use "I" perspective when discussing personal experiences, skills, and goals
- Add context and brief explanations to make answers more meaningful
- Connect related topics when relevant
- Keep responses concise (2-3 sentences typically)
- If asked something not in the resume, say "I don't have that information in my resume"
- Show personality and enthusiasm about relevant topics
- Use conversational language, not robotic responses`;

    const messages = [
      { role: 'system', content: systemInstruction }
    ];

    if (finalChunks.length > 0) {
      const snippets = finalChunks.map(t => `- (${t.id}) ${t.text}`).join('\n\n');
      messages.push({ role: 'system', content: `Relevant resume snippets:\n\n${snippets}` });
    } else {
      messages.push({ role: 'system', content: 'No relevant resume snippets were found for this query.' });
    }

    messages.push({ role: 'user', content: userMessage });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      max_tokens: 500
    });

    const reply = completion.choices && completion.choices[0] && completion.choices[0].message
      ? completion.choices[0].message.content
      : 'No response from model';

    res.json({ reply, retrieved: finalChunks.map(t => ({ id: t.id, score: t.score })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 3000;

createEmbeddingsForResume().then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}).catch(err => {
  console.error('Failed to create embeddings', err);
  app.listen(PORT, () => console.log(`Server listening on port ${PORT} (embeddings failed)`));
});
