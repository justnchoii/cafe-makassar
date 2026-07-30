const Cafe = require('../models/Cafe');

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const MAX_HISTORY_ITEMS = 10;
const MAX_CONTEXT_CAFES = 8;
const MIN_RELEVANCE_SCORE = 3;
const MAX_DEBUG_RESPONSE_LENGTH = 1200;
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

  if (key.startsWith('AQ')) {
    return {
      url: GEMINI_URL,
      headers: {
        Authorization: `Bearer ${key}`,
      },
    };
  }

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
      formatField('Deskripsi', cafe.description),
      formatField('Kategori', cafe.category),
      formatField('Harga', cafe.priceRange),
      formatField('Rating', cafe.rating ? `${cafe.rating}/5` : ''),
      formatField('Alamat', cafe.address),
      formatField('Fasilitas', cafe.facilities),
      formatField('Jam buka', cafe.openHours),
      formatField('Maps', cafe.mapsLink),
      formatField('Koordinat', cafe.location),
    ];

    return lines.join('\n  ');
  }).join('\n');
}

function createSystemPrompt(cafes) {
  return `Kamu adalah AI resmi Website Cafe Makassar.

ATURAN WAJIB:
1. Jawab HANYA berdasarkan data cafe yang diberikan dan riwayat percakapan.
2. Jangan mengarang nama cafe.
3. Jangan mengarang alamat.
4. Jangan mengarang rating.
5. Jangan mengarang harga.
6. Jangan mengarang fasilitas, jam buka, atau detail suasana yang tidak tertulis.
7. Jika informasi tidak ada pada data, jawab persis: "Maaf, informasi tersebut belum tersedia pada database Cafe Makassar."
8. Jika user bertanya follow-up seperti "alamatnya dimana?" atau "jam bukanya?", gunakan konteks dari riwayat chat untuk menentukan cafe yang sedang dibahas.
9. Jika user bertanya selain cafe Makassar, jawab singkat lalu arahkan kembali ke topik cafe.
10. Selalu prioritaskan rekomendasi cafe dari data yang tersedia.

Gaya jawaban:
- Gunakan Bahasa Indonesia yang natural, ringkas, dan membantu.
- Kalau ada beberapa cafe relevan, pilih 3 sampai 5 yang paling cocok lalu jelaskan singkat alasannya.
- Kalau data tidak menyebut hal spesifik seperti slowbar atau manual brew, katakan jujur dan sebut cafe yang paling mendekati dari data.

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

function generateFallbackResponse(message, cafes) {
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

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const allCafes = await Cafe.find({}).lean();
    const relevantCafes = selectRelevantCafes(message, history, allCafes);
    const cafesForContext = relevantCafes.length > 0 ? relevantCafes : allCafes.slice(0, MAX_CONTEXT_CAFES);
    const sanitizedHistory = sanitizeHistory(history);

    logChatDebug('request-summary', {
      message: message.trim(),
      historyCount: Array.isArray(history) ? history.length : 0,
      sanitizedHistoryCount: sanitizedHistory.length,
      totalCafeCount: allCafes.length,
      contextCafeCount: cafesForContext.length,
    });
    logChatDebug('all-cafes-sample', allCafes.slice(0, 2).map(summarizeCafeForDebug));
    logChatDebug('selected-context-cafes', cafesForContext.map(summarizeCafeForDebug));
    logChatDebug('system-prompt-preview', createSystemPrompt(cafesForContext).slice(0, MAX_DEBUG_RESPONSE_LENGTH));

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
      }

      const geminiConfig = getGeminiRequestConfig(process.env.GEMINI_API_KEY);
      const response = await fetch(geminiConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...geminiConfig.headers,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: createSystemPrompt(cafesForContext) }],
          },
          contents: [
            ...sanitizedHistory,
            {
              role: 'user',
              parts: [{ text: message.trim() }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: 420,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini request failed with status ${response.status}`);
      }

      const data = await response.json();
      logChatDebug('gemini-raw-response', JSON.stringify(data, null, 2).slice(0, MAX_DEBUG_RESPONSE_LENGTH));
      const aiResponse = extractGeminiText(data);

      if (!aiResponse) {
        throw new Error('Gemini returned empty response');
      }

      logChatDebug('gemini-text-response', aiResponse.slice(0, MAX_DEBUG_RESPONSE_LENGTH));

      return res.json({
        success: true,
        mode: 'gemini',
        contextCount: cafesForContext.length,
        data: {
          message: aiResponse,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (aiError) {
      console.log('Gemini not available, using fallback:', aiError.message);
      const fallbackResponse = generateFallbackResponse(message, cafesForContext);
      logChatDebug('fallback-response', fallbackResponse.slice(0, MAX_DEBUG_RESPONSE_LENGTH));

      return res.json({
        success: true,
        mode: 'fallback',
        contextCount: cafesForContext.length,
        data: {
          message: fallbackResponse,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Chat Error:', error.message);
    return res.json({
      success: true,
      data: {
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi! 🙏',
        timestamp: new Date().toISOString(),
      },
    });
  }
};
