const axios = require('axios');
const Cafe = require('../models/Cafe');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Fetch cafe data for context
    const cafes = await Cafe.find({});
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
      timeout: 60000,
    });

    const aiResponse = response.data.response || 'Maaf, saya tidak bisa menjawab saat ini. Silakan coba lagi.';

    res.json({ 
      success: true, 
      data: { 
        message: aiResponse,
        timestamp: new Date().toISOString()
      } 
    });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.json({ 
      success: true, 
      data: { 
        message: 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti atau hubungi kami langsung!',
        timestamp: new Date().toISOString()
      } 
    });
  }
};
