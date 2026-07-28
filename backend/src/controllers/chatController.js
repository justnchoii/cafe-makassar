const axios = require('axios');
const Cafe = require('../models/Cafe');

// Smart fallback: jawab berdasarkan data cafe jika Ollama tidak tersedia
function generateFallbackResponse(message, cafes) {
  const msg = message.toLowerCase();
  
  // Rekomendasi berdasarkan kategori
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
    const list = picks.map((c, i) => `${i+1}. **${c.name}** ⭐${c.rating} - ${c.category}\n   📍 ${c.address}`).join('\n\n');
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
  
  // Default: tampilkan semua kategori
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

    // Try Ollama AI first
    try {
      const cafeContext = cafes.map(c => 
        `- ${c.name}: ${c.description}. Kategori: ${c.category}, Harga: ${c.priceRange}, Rating: ${c.rating}/5, Alamat: ${c.address}, Fasilitas: ${c.facilities.join(', ')}`
      ).join('\n');

      const systemPrompt = `Kamu adalah asisten AI untuk website Cafe Makassar. Kamu membantu pengguna menemukan cafe terbaik di Makassar.
Berikut daftar cafe yang tersedia:
${cafeContext}

Jawab dalam Bahasa Indonesia dengan ramah dan informatif. Jika ditanya rekomendasi, berikan saran berdasarkan data cafe yang ada.
Jika ditanya hal di luar topik cafe Makassar, tetap jawab dengan sopan tapi arahkan kembali ke topik cafe.`;

      const prompt = `${systemPrompt}\n\nUser: ${message}\nAssistant:`;

      const response = await axios.post(process.env.OLLAMA_API_URL, {
        model: 'llama3',
        prompt: prompt,
        stream: false,
      }, {
        timeout: 30000,
      });

      const aiResponse = response.data.response || generateFallbackResponse(message, cafes);

      return res.json({ 
        success: true, 
        data: { message: aiResponse, timestamp: new Date().toISOString() } 
      });
    } catch (aiError) {
      // Ollama not available, use smart fallback
      console.log('Ollama not available, using fallback:', aiError.message);
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
