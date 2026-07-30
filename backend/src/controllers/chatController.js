const Cafe = require('../models/Cafe');

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

function buildCafeContext(cafes) {
  return cafes.map(cafe =>
    `- ${cafe.name}: ${cafe.description}. Kategori: ${cafe.category}, Harga: ${cafe.priceRange}, Rating: ${cafe.rating}/5, Alamat: ${cafe.address}, Fasilitas: ${cafe.facilities.join(', ')}`
  ).join('\n');
}

function createSystemPrompt(cafes) {
  return `Kamu adalah AI Assistant untuk website Cafe Makassar.

Tugasmu:
- Jawab dalam Bahasa Indonesia dengan natural, ramah, dan nyambung seperti AI chat modern.
- Prioritaskan bantuan seputar cafe di Makassar berdasarkan data yang tersedia.
- Jangan mengarang rating, alamat, fasilitas, harga, atau suasana jika datanya tidak ada.
- Kalau user salah ketik nama cafe tapi maksudnya masih jelas, tetap pahami.
- Kalau user meminta rekomendasi, pilih yang paling relevan lalu jelaskan alasannya.
- Kalau user menyebut beberapa cafe, jangan otomatis membandingkan kecuali user memang meminta perbandingan.
- Kalau user bertanya umum atau sedikit di luar topik, tetap jawab dengan sopan dan natural, lalu kaitkan ke cafe Makassar bila relevan.
- Kalau user bertanya hal spesifik seperti slowbar atau manual brew sementara data tidak menyebutnya secara eksplisit, katakan dengan jujur lalu berikan cafe yang paling mendekati berdasarkan data yang ada.
- Hindari jawaban template yang kaku.

Data cafe Makassar:
${buildCafeContext(cafes)}`;
}

function generateFallbackResponse(message, cafes) {
  const msg = message.toLowerCase();

  if (
    msg.includes('slowbar')
    || msg.includes('slow bar')
    || msg.includes('manual brew')
    || msg.includes('v60')
    || msg.includes('pour over')
    || msg.includes('filter coffee')
    || msg.includes('hand brew')
  ) {
    const picks = cafes
      .filter(c => c.facilities.includes('Coffee Bar') || c.name.toLowerCase().includes('roastery') || c.description.toLowerCase().includes('ngopi'))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    if (picks.length > 0) {
      const list = picks.map(c => `☕ **${c.name}** (Rating: ${c.rating}/5) - ${c.address}\n   ${c.description}`).join('\n\n');
      return `Di data yang ada, belum tertulis slowbar atau manual brew secara eksplisit. Tapi cafe yang paling mendekati untuk kamu cek adalah:\n\n${list}\n\nKalau kamu mau, aku juga bisa pilihkan yang paling cocok buat ngopi serius atau ngobrol santai.`;
    }
  }

  if (msg.includes('aesthetic') || msg.includes('instagramable') || msg.includes('foto')) {
    const picks = cafes.filter(c => c.category === 'aesthetic');
    if (picks.length > 0) {
      const list = picks.map(c => `☕ **${c.name}** (Rating: ${c.rating}/5) - ${c.address}\n   ${c.description}`).join('\n\n');
      return `Untuk cafe aesthetic & instagramable di Makassar, saya rekomendasikan:\n\n${list}\n\nSemuanya punya spot foto keren! 📸`;
    }
  }

  if (msg.includes('kerja') || msg.includes('work') || msg.includes('wifi') || msg.includes('coworking') || msg.includes('laptop')) {
    const picks = cafes.filter(c => c.category === 'coworking');
    if (picks.length > 0) {
      const list = picks.map(c => `💻 **${c.name}** (Rating: ${c.rating}/5) - ${c.address}\n   ${c.description}`).join('\n\n');
      return `Untuk kerja/WFC, cafe dengan WiFi cepat di Makassar:\n\n${list}\n\nSemua punya WiFi cepat dan colokan! 🔌`;
    }
  }

  if (msg.includes('murah') || msg.includes('terjangkau') || msg.includes('hemat') || msg.includes('mahasiswa')) {
    const picks = cafes.filter(c => c.priceRange === '$');
    if (picks.length > 0) {
      const list = picks.map(c => `💰 **${c.name}** (Rating: ${c.rating}/5) - ${c.address}\n   ${c.description}`).join('\n\n');
      return `Cafe murah tapi enak di Makassar:\n\n${list}\n\nHarga ramah kantong! 💸`;
    }
  }

  if (msg.includes('rooftop') || msg.includes('view') || msg.includes('sunset') || msg.includes('pemandangan')) {
    const picks = cafes.filter(c => c.category === 'rooftop');
    if (picks.length > 0) {
      const list = picks.map(c => `🌆 **${c.name}** (Rating: ${c.rating}/5) - ${c.address}\n   ${c.description}`).join('\n\n');
      return `Rooftop cafe dengan view terbaik di Makassar:\n\n${list}\n\nCocok buat nikmati sunset! 🌅`;
    }
  }

  if (msg.includes('outdoor') || msg.includes('taman') || msg.includes('alam') || msg.includes('hijau')) {
    const picks = cafes.filter(c => c.category === 'outdoor');
    if (picks.length > 0) {
      const list = picks.map(c => `🌿 **${c.name}** (Rating: ${c.rating}/5) - ${c.address}\n   ${c.description}`).join('\n\n');
      return `Cafe outdoor asri di Makassar:\n\n${list}\n\nSegar dan nyaman! 🍃`;
    }
  }

  if (msg.includes('tradisional') || msg.includes('kopi toraja') || msg.includes('warkop') || msg.includes('klasik')) {
    const picks = cafes.filter(c => c.category === 'traditional');
    if (picks.length > 0) {
      const list = picks.map(c => `☕ **${c.name}** (Rating: ${c.rating}/5) - ${c.address}\n   ${c.description}`).join('\n\n');
      return `Warkop & cafe tradisional di Makassar:\n\n${list}\n\nRasakan kopi khas Makassar! ☕`;
    }
  }

  if (msg.includes('terbaik') || msg.includes('rating') || msg.includes('top') || msg.includes('populer')) {
    const picks = [...cafes].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const list = picks.map((c, i) => `${i + 1}. **${c.name}** ⭐${c.rating} - ${c.category}\n   📍 ${c.address}`).join('\n\n');
    return `Top 5 cafe terbaik di Makassar berdasarkan rating:\n\n${list}\n\nSemua worth to visit! 🏆`;
  }

  if (msg.includes('rekomen') || msg.includes('saran') || msg.includes('suggest')) {
    const picks = [...cafes].sort((a, b) => b.rating - a.rating).slice(0, 4);
    const list = picks.map(c => `⭐ **${c.name}** (${c.category}) - Rating: ${c.rating}/5\n   📍 ${c.address}\n   ${c.description}`).join('\n\n');
    return `Rekomendasi cafe di Makassar untuk kamu:\n\n${list}\n\nMau cari yang spesifik? Tanya aja kategori yang kamu mau! 😊`;
  }

  if (msg.includes('halo') || msg.includes('hai') || msg.includes('hi') || msg.includes('hey')) {
    return `Halo! 👋 Selamat datang di Cafe Makassar!\n\nSaya bisa bantu kamu cari cafe terbaik di Makassar. Coba tanya:\n- "Cafe aesthetic yang instagramable?"\n- "Cafe buat kerja dengan WiFi cepat?"\n- "Cafe murah tapi enak dimana?"\n- "Rooftop cafe dengan view bagus?"\n- "Rekomendasi cafe terbaik?"\n\nMau cari yang mana? 😊☕`;
  }

  const categories = {
    aesthetic: cafes.filter(c => c.category === 'aesthetic').length,
    coworking: cafes.filter(c => c.category === 'coworking').length,
    outdoor: cafes.filter(c => c.category === 'outdoor').length,
    rooftop: cafes.filter(c => c.category === 'rooftop').length,
    traditional: cafes.filter(c => c.category === 'traditional').length,
  };

  return `Kami punya ${cafes.length} cafe di Makassar! 🏪\n\n📸 Aesthetic: ${categories.aesthetic} cafe\n💻 Coworking: ${categories.coworking} cafe\n🌿 Outdoor: ${categories.outdoor} cafe\n🌆 Rooftop: ${categories.rooftop} cafe\n☕ Traditional: ${categories.traditional} cafe\n\nMau rekomendasi yang mana? Ceritakan kebutuhan atau mood kamu! 😊`;
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const cafes = await Cafe.find({});

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
            parts: [{ text: createSystemPrompt(cafes) }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 520,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data?.candidates?.[0]?.content?.parts
        ?.map(part => part?.text || '')
        .join('\n')
        .trim() || generateFallbackResponse(message, cafes);

      return res.json({
        success: true,
        data: { message: aiResponse, timestamp: new Date().toISOString() }
      });
    } catch (aiError) {
      console.log('Gemini not available, using fallback:', aiError.message);
      const fallbackResponse = generateFallbackResponse(message, cafes);
      return res.json({
        success: true,
        data: { message: fallbackResponse, timestamp: new Date().toISOString() }
      });
    }
  } catch (error) {
    console.error('Chat Error:', error.message);
    res.json({
      success: true,
      data: {
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi! 🙏',
        timestamp: new Date().toISOString()
      }
    });
  }
};
