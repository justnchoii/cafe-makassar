const Cafe = require('../models/Cafe');

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const MAX_HISTORY_ITEMS = 10;
const MAX_CONTEXT_CAFES = 8;
const MIN_RELEVANCE_SCORE = 3;
const MAX_DEBUG_RESPONSE_LENGTH = 1200;
const CAFE_TOPIC_KEYWORDS = [
  'cafe', 'coffee', 'kopi', 'ngopi', 'warkop', 'barista', 'slowbar', 'slow bar', 'manual brew',
  'v60', 'pour over', 'filter coffee', 'hand brew', 'aesthetic', 'estetik', 'instagramable',
  'instagrammable', 'wifi', 'wfc', 'coworking', 'rooftop', 'sunset', 'outdoor', 'indoor',
  'murah', 'mahal', 'budget', 'hemat', 'terjangkau', 'mahasiswa', 'view', 'pemandangan',
  'makan', 'nongkrong', 'hangout', 'makassar',
];
const CAFE_FOLLOW_UP_KEYWORDS = [
  'alamat', 'alamatnya', 'dimana', 'di mana', 'lokasi', 'lokasinya', 'jam', 'jamnya', 'buka',
  'tutup', 'harga', 'rating', 'fasilitas', 'maps', 'menu', 'nomor', 'kontak', 'telepon',
  'selain itu', 'apalagi', 'yang lain', 'beda apa', 'bandingkan',
];
const STOP_WORDS = new Set([
  'ada', 'aja', 'apa', 'apakah', 'atau', 'buat', 'bisa', 'cafe', 'coffee', 'dan', 'dari',
  'dengan', 'di', 'dimana', 'dong', 'enak', 'itu', 'ini', 'juga', 'kalau', 'kalo', 'ke',
  'kok', 'lagi', 'makassar', 'mau', 'nya', 'saja', 'sih', 'sudah', 'tentang', 'untuk',
  'yang',
]);

const QUERY_HINTS = [
  {
    keywords: ['murah', 'budget', 'hemat', 'mahasiswa', 'terjangkau'],
    score: cafe => (cafe.priceRange === '$' ? 8 : cafe.priceRange === '$$' ? 2 : 0),
  },
  {
    keywords: ['mahal', 'premium', 'fine dining', 'expensive'],
    score: cafe => (cafe.priceRange === '$$$' ? 8 : cafe.priceRange === '$$' ? 3 : 0),
  },
  {
    keywords: ['wifi', 'wfc', 'work', 'kerja', 'laptop', 'nugas', 'meeting', 'coworking'],
    score: cafe => (
      (cafe.category === 'coworking' ? 8 : 0)
      + (hasFacility(cafe, 'wifi') ? 4 : 0)
      + (hasFacility(cafe, 'colokan') ? 2 : 0)
    ),
  },
  {
    keywords: ['slowbar', 'slow bar', 'manual brew', 'v60', 'pour over', 'filter coffee', 'hand brew'],
    score: cafe => (
      (hasFacility(cafe, 'coffee bar') ? 7 : 0)
      + (normalizeText(cafe.name).includes('roastery') ? 5 : 0)
      + (buildCafeSearchBlob(cafe).includes('manual brew') ? 4 : 0)
    ),
  },
  {
    keywords: ['aesthetic', 'estetik', 'instagramable', 'instagrammable', 'foto'],
    score: cafe => (
      (cafe.category === 'aesthetic' ? 8 : 0)
      + (buildCafeSearchBlob(cafe).includes('aesthetic') ? 2 : 0)
    ),
  },
  {
    keywords: ['rooftop', 'sunset', 'view', 'pemandangan'],
    score: cafe => (
      (cafe.category === 'rooftop' ? 8 : 0)
      + (buildCafeSearchBlob(cafe).includes('sunset') ? 3 : 0)
    ),
  },
  {
    keywords: ['outdoor', 'semi outdoor', 'taman', 'alam', 'hijau'],
    score: cafe => (
      (cafe.category === 'outdoor' ? 8 : 0)
      + (hasFacility(cafe, 'outdoor') ? 3 : 0)
    ),
  },
  {
    keywords: ['tradisional', 'warkop', 'kopi toraja', 'klasik'],
    score: cafe => (cafe.category === 'traditional' ? 8 : 0),
  },
  {
    keywords: ['indoor', 'ac', 'dingin'],
    score: cafe => (
      (hasFacility(cafe, 'indoor') ? 4 : 0)
      + (hasFacility(cafe, 'ac') ? 4 : 0)
    ),
  },
];

function getGeminiRequestConfig(rawKey) {
  const key = rawKey.trim();

  return {
    url: GEMINI_URL,
    headers: {
      'x-goog-api-key': key,
    },
  };
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stringifyValue(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ');
  }

  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([, nestedValue]) => nestedValue !== undefined && nestedValue !== null && nestedValue !== '')
      .map(([key, nestedValue]) => `${key}: ${nestedValue}`)
      .join(', ');
  }

  return value ? String(value) : '';
}

function hasAny(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

function hasFacility(cafe, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  return (cafe.facilities || []).some(facility => normalizeText(facility).includes(normalizedKeyword));
}

function isDebugEnabled() {
  return String(process.env.CHAT_DEBUG || '').toLowerCase() === 'true';
}

function logChatDebug(label, payload) {
  if (!isDebugEnabled()) {
    return;
  }

  console.log(`[chat-debug] ${label}:`, payload);
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(item => item && typeof item.content === 'string' && item.content.trim())
    .slice(-MAX_HISTORY_ITEMS)
    .map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content.trim() }],
    }));
}

function extractConversationText(message, history) {
  const historyText = Array.isArray(history)
    ? history
      .filter(item => item && typeof item.content === 'string')
      .map(item => item.content)
      .join(' ')
    : '';

  return normalizeText(`${historyText} ${message}`);
}

function mentionsCafeName(text, cafes) {
  const normalizedText = normalizeText(text);

  return cafes.some(cafe => {
    const normalizedName = normalizeText(cafe.name);

    if (normalizedText.includes(normalizedName)) {
      return true;
    }

    return normalizedName
      .split(' ')
      .filter(token => token.length >= 4 && !STOP_WORDS.has(token))
      .some(token => normalizedText.includes(token));
  });
}

function isCafeRelatedQuery(message, history, cafes) {
  const messageText = normalizeText(message);
  const historyText = Array.isArray(history)
    ? history
      .filter(item => item && typeof item.content === 'string')
      .map(item => item.content)
      .join(' ')
    : '';
  const normalizedHistoryText = normalizeText(historyText);
  const hasCafeKeyword = hasAny(messageText, CAFE_TOPIC_KEYWORDS);
  const messageMentionsCafe = mentionsCafeName(messageText, cafes);
  const historyMentionsCafe = mentionsCafeName(normalizedHistoryText, cafes);
  const isFollowUp = hasAny(messageText, CAFE_FOLLOW_UP_KEYWORDS);

  if (hasCafeKeyword || messageMentionsCafe) {
    return true;
  }

  if (isFollowUp && (historyMentionsCafe || hasAny(normalizedHistoryText, CAFE_TOPIC_KEYWORDS))) {
    return true;
  }

  return false;
}

function extractSearchTerms(text) {
  return normalizeText(text)
    .split(' ')
    .filter(term => term.length >= 3 && !STOP_WORDS.has(term));
}

function formatField(label, value) {
  const text = stringifyValue(value);
  return `${label}: ${text || 'tidak tersedia'}`;
}

function buildCafeContext(cafes) {
  return cafes.map(cafe => {
    const lines = [
      `- Nama: ${cafe.name}`,
      formatField('Deskripsi', cafe.about || cafe.description),
      formatField('Kategori', cafe.category),
      formatField('Harga', cafe.priceInfo || cafe.priceRange),
      formatField('Rating', cafe.rating ? `${cafe.rating}/5` : ''),
      formatField('Alamat', cafe.address),
      formatField('Fasilitas', cafe.facilities),
      formatField('Menu', cafe.menu),
      cafe.suitableFor?.length ? `  Cocok untuk: ${cafe.suitableFor.join(', ')}` : '',
      cafe.tips ? `  Tips: ${cafe.tips}` : '',
      formatField('Jam buka', cafe.openHours),
      formatField('Maps', cafe.mapsLink),
    ].filter(Boolean);

    return lines.join('\n  ');
  }).join('\n');
}

function createSystemPrompt(cafes, isCafeRelated) {
  const basePrompt = `Kamu adalah AI Assistant cerdas di website Cafe Makassar. Kamu bisa menjawab APA SAJA yang ditanyakan.

ATURAN:
1. Jawab SEMUA pertanyaan dengan baik — cafe, teknologi, sains, matematika, sejarah, bahasa, coding, kesehatan, atau topik apapun.
2. Gunakan Bahasa Indonesia yang natural, ramah, dan jelas.
3. Untuk pertanyaan tentang cafe di Makassar, gunakan data cafe yang diberikan sebagai sumber utama.
4. Jangan mengarang informasi cafe yang tidak ada di data. Jika tidak ada, bilang jujur.
5. Untuk pertanyaan NON-cafe, jawab seperti asisten AI umum yang pintar dan membantu.
6. Gunakan riwayat percakapan untuk memahami konteks follow-up.
7. Jawaban boleh panjang jika pertanyaan membutuhkan penjelasan detail.`;

  if (!isCafeRelated || cafes.length === 0) {
    return `${basePrompt}\n\nJawab pertanyaan ini sebagai AI assistant umum yang membantu.`;
  }

  return `${basePrompt}

Data cafe Makassar yang relevan:
${buildCafeContext(cafes)}`;
}

function buildCafeSearchBlob(cafe) {
  return normalizeText([
    cafe.name,
    cafe.description,
    cafe.address,
    cafe.category,
    cafe.priceRange,
    stringifyValue(cafe.facilities),
    cafe.openHours,
    cafe.mapsLink,
    stringifyValue(cafe.location),
  ].join(' '));
}

function scoreCafeForQuery(cafe, messageText, conversationText, searchTerms, isFollowUp) {
  const normalizedName = normalizeText(cafe.name);
  const searchBlob = buildCafeSearchBlob(cafe);
  let score = 0;

  if (messageText.includes(normalizedName)) {
    score += 80;
  } else if (conversationText.includes(normalizedName)) {
    score += isFollowUp ? 35 : 16;
  }

  const nameTokens = normalizedName
    .split(' ')
    .filter(token => token.length >= 4 && !STOP_WORDS.has(token));

  for (const token of nameTokens) {
    if (messageText.includes(token)) {
      score += 8;
    } else if (conversationText.includes(token)) {
      score += isFollowUp ? 4 : 1;
    }
  }

  for (const term of searchTerms) {
    if (searchBlob.includes(term)) {
      score += 3;
    }
  }

  for (const hint of QUERY_HINTS) {
    if (hasAny(messageText, hint.keywords)) {
      score += hint.score(cafe);
    }
  }

  return score;
}

function selectRelevantCafes(message, history, cafes) {
  if (!Array.isArray(cafes) || cafes.length === 0) {
    return [];
  }

  const messageText = normalizeText(message);
  const conversationText = extractConversationText(message, history);
  const searchTerms = Array.from(new Set([
    ...extractSearchTerms(messageText),
    ...extractSearchTerms(conversationText),
  ]));
  const isFollowUp = hasAny(messageText, [
    'alamat', 'alamatnya', 'dimana', 'di mana', 'lokasi', 'lokasinya',
    'jam', 'jamnya', 'buka', 'tutup', 'harga', 'rating', 'fasilitas', 'maps',
  ]) && Array.isArray(history) && history.length > 0;

  const scored = cafes
    .map(cafe => ({
      cafe,
      score: scoreCafeForQuery(cafe, messageText, conversationText, searchTerms, isFollowUp),
    }))
    .filter(entry => entry.score >= MIN_RELEVANCE_SCORE)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (b.cafe.rating || 0) - (a.cafe.rating || 0);
    })
    .slice(0, MAX_CONTEXT_CAFES)
    .map(entry => entry.cafe);

  if (scored.length > 0) {
    return scored;
  }

  return [...cafes]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, MAX_CONTEXT_CAFES);
}

function formatCafeList(cafes) {
  return cafes
    .slice(0, 5)
    .map(cafe => {
      const details = [
        `☕ **${cafe.name}**`,
        cafe.rating ? `(Rating: ${cafe.rating}/5)` : '',
        cafe.address ? `- ${cafe.address}` : '',
      ].filter(Boolean).join(' ');

      return `${details}\n${cafe.description}`;
    })
    .join('\n\n');
}

function generateFallbackResponse(message, cafes, isCafeRelated) {
  if (!isCafeRelated) {
    return 'AI sedang tidak tersedia untuk pertanyaan umum saat ini. Coba lagi sebentar lagi setelah koneksi Gemini aktif.';
  }

  if (!cafes.length) {
    return 'Maaf, data cafe belum tersedia saat ini.';
  }

  const normalizedMessage = normalizeText(message);
  const list = formatCafeList(cafes);

  if (hasAny(normalizedMessage, ['slowbar', 'slow bar', 'manual brew', 'v60', 'pour over', 'filter coffee', 'hand brew'])) {
    return `Di data yang ada, slowbar atau manual brew belum tertulis secara eksplisit. Tapi cafe yang paling mendekati untuk kamu cek adalah:\n\n${list}`;
  }

  return `Berikut cafe yang paling relevan dari database Cafe Makassar:\n\n${list}\n\nKalau mau, tanya lagi lebih spesifik seperti area, budget, WiFi, suasana, atau nama cafe tertentu.`;
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .map(part => part?.text || '')
    .join('\n')
    .trim();
}

function summarizeCafeForDebug(cafe) {
  return {
    name: cafe.name,
    category: cafe.category,
    priceRange: cafe.priceRange,
    rating: cafe.rating,
    address: cafe.address,
  };
}

async function callGeminiWithRetry(payload, apiKey, retries = 1) {
  const config = getGeminiRequestConfig(apiKey);
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...config.headers },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) {
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }
      throw new Error('RATE_LIMIT');
    }

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    return response;
  }
}

async function callGroq(systemPrompt, history, message) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(item => ({
      role: item.role === 'user' ? 'user' : 'assistant',
      content: item.content,
    })),
    { role: 'user', content: message },
  ];

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Groq HTTP ${response.status}: ${err.slice(0, 100)}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

// ---- SSE streaming helpers ----

function sseSend(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// Streams a Groq (OpenAI-compatible) chat completion, invoking onDelta(text) per token chunk.
// Returns true if any text was streamed, false if the provider returned nothing usable.
async function streamGroq(systemPrompt, history, message, onDelta) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(item => ({
      role: item.role === 'user' ? 'user' : 'assistant',
      content: item.content,
    })),
    { role: 'user', content: message },
  ];

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Groq HTTP ${response.status}: ${err.slice(0, 100)}`);
  }

  let full = '';
  let buffer = '';
  const decoder = new TextDecoder();

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      const line = part.split('\n').find(l => l.startsWith('data:'));
      if (!line) continue;
      const payload = line.replace(/^data:\s*/, '').trim();
      if (payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch (_) {
        // partial/incomplete JSON chunk — ignore, next read will complete it
      }
    }
  }

  return full.trim().length > 0;
}

// Streams a Gemini response using the streamGenerateContent + alt=sse endpoint,
// invoking onDelta(text) per token chunk. Returns true if any text was streamed.
async function streamGemini(systemPrompt, sanitizedHistory, message, apiKey, onDelta) {
  const streamUrl = GEMINI_URL.replace(':generateContent', ':streamGenerateContent') + '?alt=sse';

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [
      ...sanitizedHistory,
      { role: 'user', parts: [{ text: message }] },
    ],
    generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 1024 },
  };

  const response = await fetch(streamUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Gemini stream HTTP ${response.status}: ${err.slice(0, 100)}`);
  }

  let full = '';
  let buffer = '';
  const decoder = new TextDecoder();

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      const line = part.split('\n').find(l => l.startsWith('data:'));
      if (!line) continue;
      const payload = line.replace(/^data:\s*/, '').trim();
      if (!payload) continue;
      try {
        const json = JSON.parse(payload);
        const delta = extractGeminiText(json);
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch (_) {
        // partial/incomplete JSON chunk — ignore, next read will complete it
      }
    }
  }

  return full.trim().length > 0;
}

// SSE endpoint: streams the AI reply to the client token-by-token over a single
// open HTTP connection (Content-Type: text/event-stream), instead of waiting for
// the full response before sending it as one JSON payload.
exports.chatStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15000);
  const stop = () => clearInterval(heartbeat);
  req.on('close', stop);

  try {
    const { message, history = [], systemOverride } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      sseSend(res, 'error', { message: 'Message is required' });
      stop();
      return res.end();
    }

    const allCafes = await Cafe.find({}).lean();

    let systemPrompt;
    let cafeRelated = false;
    let cafesForContext = [];
    if (systemOverride && typeof systemOverride === 'string') {
      systemPrompt = systemOverride;
    } else {
      cafeRelated = isCafeRelatedQuery(message, history, allCafes);
      const relevantCafes = cafeRelated ? selectRelevantCafes(message, history, allCafes) : [];
      cafesForContext = cafeRelated
        ? (relevantCafes.length > 0 ? relevantCafes : allCafes.slice(0, MAX_CONTEXT_CAFES))
        : [];
      systemPrompt = createSystemPrompt(cafeRelated ? cafesForContext : [], cafeRelated);
    }

    const sanitizedHistory = sanitizeHistory(history);

    // 1. Try Groq streaming first (higher rate limits)
    if (process.env.GROQ_API_KEY) {
      try {
        const groqHistory = Array.isArray(history)
          ? history.filter(h => h && typeof h.content === 'string').slice(-10)
          : [];
        const streamed = await streamGroq(systemPrompt, groqHistory, message.trim(), (delta) => {
          sseSend(res, 'chunk', { text: delta });
        });
        if (streamed) {
          sseSend(res, 'done', { mode: 'groq', timestamp: new Date().toISOString() });
          stop();
          return res.end();
        }
      } catch (groqErr) {
        console.log('Groq streaming failed, trying Gemini:', groqErr.message);
      }
    }

    // 2. Fallback to Gemini streaming
    if (process.env.GEMINI_API_KEY) {
      try {
        const streamed = await streamGemini(
          systemPrompt,
          sanitizedHistory,
          message.trim(),
          process.env.GEMINI_API_KEY,
          (delta) => sseSend(res, 'chunk', { text: delta }),
        );
        if (streamed) {
          sseSend(res, 'done', { mode: 'gemini', timestamp: new Date().toISOString() });
          stop();
          return res.end();
        }
      } catch (geminiErr) {
        if (geminiErr.message === 'RATE_LIMIT') {
          sseSend(res, 'chunk', { text: 'AI sedang sibuk. Tunggu sebentar lalu coba lagi ya! 🙏' });
          sseSend(res, 'done', { mode: 'fallback', timestamp: new Date().toISOString() });
          stop();
          return res.end();
        }
        console.log('Gemini streaming failed:', geminiErr.message);
      }
    }

    // 3. Local fallback — simulate token-by-token delivery so the UI behaves
    // the same way whether or not an AI provider key is configured.
    const fallbackMessage = generateFallbackResponse(message, cafesForContext, cafeRelated);
    const words = fallbackMessage.split(' ');
    for (const word of words) {
      sseSend(res, 'chunk', { text: word + ' ' });
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, 15));
    }
    sseSend(res, 'done', { mode: 'fallback', timestamp: new Date().toISOString() });
    stop();
    res.end();
  } catch (error) {
    console.error('Chat Stream Error:', error.message);
    sseSend(res, 'error', { message: 'Maaf, terjadi kesalahan. Silakan coba lagi! 🙏' });
    stop();
    res.end();
  }
};

exports.chat = async (req, res) => {
  try {
    const { message, history = [], systemOverride } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const allCafes = await Cafe.find({}).lean();

    // If systemOverride provided (per-cafe page), use it directly
    let systemPrompt;
    if (systemOverride && typeof systemOverride === 'string') {
      systemPrompt = systemOverride;
    } else {
      const cafeRelated = isCafeRelatedQuery(message, history, allCafes);
      const relevantCafes = cafeRelated ? selectRelevantCafes(message, history, allCafes) : [];
      const cafesForContext = cafeRelated
        ? (relevantCafes.length > 0 ? relevantCafes : allCafes.slice(0, MAX_CONTEXT_CAFES))
        : [];
      systemPrompt = createSystemPrompt(cafeRelated ? cafesForContext : [], cafeRelated);
    }

    const sanitizedHistory = sanitizeHistory(history);

    // 1. Try Groq first (higher rate limits)
    if (process.env.GROQ_API_KEY) {
      try {
        const groqHistory = Array.isArray(history)
          ? history.filter(h => h && typeof h.content === 'string').slice(-10)
          : [];
        const aiResponse = await callGroq(systemPrompt, groqHistory, message.trim());
        if (aiResponse) {
          return res.json({
            success: true,
            mode: 'groq',
            data: { message: aiResponse, timestamp: new Date().toISOString() },
          });
        }
      } catch (groqErr) {
        console.log('Groq failed, trying Gemini:', groqErr.message);
      }
    }

    // 2. Fallback to Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const payload = {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            ...sanitizedHistory,
            { role: 'user', parts: [{ text: message.trim() }] },
          ],
          generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 1024 },
        };

        const response = await callGeminiWithRetry(payload, process.env.GEMINI_API_KEY);
        const data = await response.json();
        const aiResponse = extractGeminiText(data);

        if (aiResponse) {
          return res.json({
            success: true,
            mode: 'gemini',
            data: { message: aiResponse, timestamp: new Date().toISOString() },
          });
        }
      } catch (geminiErr) {
        if (geminiErr.message === 'RATE_LIMIT') {
          return res.json({
            success: true,
            mode: 'fallback',
            data: { message: 'AI sedang sibuk. Tunggu sebentar lalu coba lagi ya! 🙏', timestamp: new Date().toISOString() },
          });
        }
        console.log('Gemini failed:', geminiErr.message);
      }
    }

    // 3. Local fallback
    const fallbackMessage = generateFallbackResponse(message, cafeRelated ? cafesForContext : [], cafeRelated);
    return res.json({
      success: true,
      mode: 'fallback',
      data: { message: fallbackMessage, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Chat Error:', error.message);
    return res.json({
      success: true,
      data: { message: 'Maaf, terjadi kesalahan. Silakan coba lagi! 🙏', timestamp: new Date().toISOString() },
    });
  }
};
