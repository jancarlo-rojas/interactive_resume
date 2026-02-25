// No need for @vercel/node import, use standard req/res types
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Load all data files
function loadJson(filename: string) {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', filename), 'utf8'));
  } catch (e) {
    return {};
  }
}

const profile = loadJson('profile.json');
const resume = loadJson('resume.json');
const personality = loadJson('personality.json');
const projects = loadJson('projects.json');
const careerGoals = loadJson('career_goals.json');
const performance = loadJson('performance.json');
const leadership = loadJson('leadership.json');
const behavioral = loadJson('behavorial.json');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function chunkText(text: string, maxLen = 800) {
  const parts: string[] = [];
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

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function norm(a: number[]) {
  return Math.sqrt(dot(a, a));
}

function cosineSim(a: number[], b: number[]) {
  return dot(a, b) / (norm(a) * norm(b) + 1e-8);
}

function flattenResume() {
  const sections: string[] = [];
  if (profile.name || profile.title) {
    sections.push(`Name: ${profile.name}. Title: ${profile.title}`);
  }
  if (profile.location) {
    sections.push(`Location: ${profile.location}`);
  }
  if (profile.contact) {
    const contactParts: string[] = [];
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
    const techParts: string[] = [];
    if (resume.technical_skills.programming) techParts.push(`Programming: ${resume.technical_skills.programming.join(', ')}`);
    if (resume.technical_skills.tools) techParts.push(`Tools: ${resume.technical_skills.tools.join(', ')}`);
    if (resume.technical_skills.it_foundations) techParts.push(`IT Foundations: ${resume.technical_skills.it_foundations.join(', ')}`);
    if (techParts.length > 0) sections.push(`Technical Skills: ${techParts.join('. ')}`);
  }
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
    const passionParts: string[] = [];
    if (personality.personal_passions.gaming) passionParts.push(`Gaming: ${personality.personal_passions.gaming}`);
    if (personality.personal_passions.running) passionParts.push(`Running: ${personality.personal_passions.running}`);
    if (personality.personal_passions.technology) passionParts.push(`Technology: ${personality.personal_passions.technology}`);
    if (passionParts.length > 0) sections.push(`Personal Interests and Passions: ${passionParts.join('. ')}`);
  }
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
  if (careerGoals.career_vision) {
    const visionParts: string[] = [];
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
  if (performance.competitive_traits && performance.competitive_traits.length > 0) {
    sections.push(`Competitive Traits: ${performance.competitive_traits.join(', ')}`);
  }
  if (performance.risk_profile) {
    sections.push(`Risk Profile: ${performance.risk_profile}`);
  }
  if (performance.growth_orientation) {
    sections.push(`Growth Orientation: ${performance.growth_orientation}`);
  }
  if (leadership.leadership_style) {
    sections.push(`Leadership Style: ${leadership.leadership_style}`);
  }
  if (leadership.leadership_strengths && leadership.leadership_strengths.length > 0) {
    sections.push(`Leadership Strengths: ${leadership.leadership_strengths.join(', ')}`);
  }
  if (leadership.leadership_development_goals && leadership.leadership_development_goals.length > 0) {
    sections.push(`Leadership Development Goals: ${leadership.leadership_development_goals.join(', ')}`);
  }
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
  return sections.join('\n\n');
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const userMessage = req.body && req.body.message;
    if (!userMessage) return res.status(400).json({ error: 'message required' });

    try {
      const embModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002';
      const allText = flattenResume();
      const textChunks = chunkText(allText, 800);
      const chunkEmbeddings = [];
      for (let i = 0; i < textChunks.length; i++) {
        const text = textChunks[i];
        const r = await client.embeddings.create({ model: embModel, input: text });
        const embedding = r.data[0].embedding;
        chunkEmbeddings.push({ id: `chunk-${i}`, text, embedding });
      }
      const q = await client.embeddings.create({ model: embModel, input: userMessage });
      const qEmbedding = q.data[0].embedding;
      const scored = chunkEmbeddings.map(c => ({ ...c, score: cosineSim(qEmbedding, c.embedding) }));
      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, 5).filter(s => s.score > 0.2);
      const finalChunks = top.length > 0 ? top : (scored.length > 0 ? [scored[0]] : []);

      const systemInstruction = `You are a personable assistant representing someone's professional profile. Your role is to answer questions based on resume data, but respond in a natural, conversational way instead of just reading the resume verbatim.\n\nGuidelines:\n- Synthesize and paraphrase information rather than copying it directly\n- Use \"I\" perspective when discussing personal experiences, skills, and goals\n- Add context and brief explanations to make answers more meaningful\n- Connect related topics when relevant\n- Keep responses concise (2-3 sentences typically)\n- If asked something not in the resume, say \"I don't have that information stored!\"\n- Show personality and enthusiasm about relevant topics\n- Use conversational language, not robotic responses`;

      const messages = [
        { role: 'system', content: systemInstruction }
      ];
      if (finalChunks.length > 0) {
        const snippets = finalChunks.map(t => `- (${t.id}) ${t.text}`).join('\n\n');
        messages.push({ role: 'system', content: `Relevant resume snippets:\n\n${snippets}` });
      } else {
        messages.push({ role: 'system', content: 'No relevant data snippets were found for this query.' });
      }
      messages.push({ role: 'user', content: userMessage });
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: messages as any,
        max_tokens: 500
      });
      const reply = completion.choices && completion.choices[0] && completion.choices[0].message
        ? completion.choices[0].message.content
        : 'No response from model';
      res.json({ reply, retrieved: finalChunks.map(t => ({ id: t.id, score: t.score })) });
    } catch (err: any) {
      console.error('API logic error:', err);
      res.status(500).json({ error: err.message || String(err) });
    }
  } catch (outerErr: any) {
    // Catch any unexpected errors and always return JSON
    console.error('Handler outer error:', outerErr);
    res.status(500).json({ error: 'Unexpected server error', details: outerErr.message || String(outerErr) });
  }
}
