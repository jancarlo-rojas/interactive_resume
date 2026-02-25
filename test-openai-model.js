require('dotenv').config();
// Test your OpenAI API key and model access
// Usage: node test-openai-model.js

const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
const chatModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002';

const client = new OpenAI({ apiKey });

async function testChatModel() {
  try {
    const completion = await client.chat.completions.create({
      model: chatModel,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello.' }
      ],
      max_tokens: 10
    });
    console.log('Chat model test succeeded:', completion.choices[0].message.content);
  } catch (err) {
    console.error('Chat model test failed:', err.message);
  }
}

async function testEmbeddingModel() {
  try {
    const result = await client.embeddings.create({
      model: embeddingModel,
      input: 'test'
    });
    console.log('Embedding model test succeeded:', result.data[0].embedding.slice(0, 5), '...');
  } catch (err) {
    console.error('Embedding model test failed:', err.message);
  }
}

(async () => {
  await testChatModel();
  await testEmbeddingModel();
})();
