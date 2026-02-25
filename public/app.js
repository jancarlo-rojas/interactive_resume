const form = document.getElementById('form');
const msg = document.getElementById('msg');
const log = document.getElementById('log');
const suggestionsArea = document.getElementById('suggestions-area');
const suggestionCards = document.querySelectorAll('.suggestion-card');

function linkifyText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  let html = div.innerHTML;
  
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]()]*)/g;
  html = html.replace(urlRegex, '<a href="$1" target="_blank" style="color:#0066cc;text-decoration:underline">$1</a>');
  
  const www_urlRegex = /(www\.[^\s<>"{}|\\^`\[\]()]*)/g;
  html = html.replace(www_urlRegex, '<a href="https://$1" target="_blank" style="color:#0066cc;text-decoration:underline">$1</a>');
  
  return html;
}

function createMessageElement(kind, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${kind}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = kind === 'user' ? 'You' : 'AI';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = linkifyText(text);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  return wrapper;
}

function hideSuggestions() {
  if (suggestionsArea) {
    suggestionsArea.style.display = 'none';
  }
}

function append(kind, text) {
  hideSuggestions();
  const el = createMessageElement(kind, text);
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

let typingEl = null;
function showTyping() {
  if (typingEl) return;
  typingEl = document.createElement('div');
  typingEl.className = 'message bot typing';
  typingEl.innerHTML = `<div class="avatar">AI</div><div class="bubble"><div class="dots"><span></span><span></span><span></span></div></div>`;
  log.appendChild(typingEl);
  log.scrollTop = log.scrollHeight;
}

function hideTyping() {
  if (!typingEl) return;
  typingEl.remove();
  typingEl = null;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = msg.value.trim();
  if (!text) return;
  append('user', text);
  msg.value = '';

  showTyping();

  try {
    const res = await fetch('/api/chat', {  // ✅ FIXED HERE
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    hideTyping();

    if (data.reply) append('bot', data.reply);
    else append('bot', data.error || 'No reply');

  } catch (err) {
    hideTyping();
    append('bot', 'Error: ' + err.message);
  }
});

suggestionCards.forEach(card => {
  card.addEventListener('click', async (e) => {
    e.preventDefault();
    const prompt = card.getAttribute('data-prompt');
    msg.value = prompt;
    form.dispatchEvent(new Event('submit'));
  });
});