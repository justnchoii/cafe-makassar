'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const cafeData = [
  { name: "Goodfields Makassar", desc: "Cafe aesthetic real di area Ujung Pandang dengan suasana modern dan nyaman", cat: "aesthetic", price: "$$", rating: 4.7, addr: "Jl. Chairil Anwar, Sawerigading, Ujung Pandang", fac: ["WiFi", "AC", "Live Music"] },
  { name: "Duft Coffee Indonesia", desc: "Cafe real dengan interior hangat dan nyaman buat nongkrong", cat: "aesthetic", price: "$$", rating: 4.8, addr: "Jalan A.P. Pettarani, Tamamaung, Panakkukang", fac: ["WiFi", "AC", "Coffee Bar"] },
  { name: "Postropis Coffee & Space", desc: "Cafe modern dan luas, cocok untuk kerja atau meeting", cat: "coworking", price: "$$", rating: 4.8, addr: "Jalan Adipura Raya, Karuwisi Utara, Panakkukang", fac: ["WiFi Cepat", "Meeting Room", "Workspace"] },
  { name: "1997 Coffee", desc: "Cafe real dengan interior clean minimalis, cocok untuk nongkrong santai dan foto aesthetic", cat: "aesthetic", price: "$$", rating: 5.0, addr: "Jalan Bougenville, Masale, Panakkukang", fac: ["Indoor Seating", "AC", "Coffee Bar"] },
  { name: "EIGHTEEN Eatery", desc: "Cafe real dengan interior warm dan clean, cocok untuk nongkrong, makan, dan foto aesthetic", cat: "aesthetic", price: "$$", rating: 4.6, addr: "Jalan Rusa, Maricaya", fac: ["Indoor Seating", "AC", "Dining Area"] },
  { name: "Mark Trees Cafe", desc: "Cafe real dengan interior hangat dan cozy, cocok untuk nongkrong santai dan foto aesthetic", cat: "aesthetic", price: "$$", rating: 4.7, addr: "Jalan G. Batu Putih, Mangkura, Ujung Pandang", fac: ["Indoor Seating", "AC", "Coffee Bar"] },
  { name: "Aynaka Coffee Racing Centre", desc: "Cafe real semi-outdoor dengan banyak tanaman, cocok untuk nongkrong malam dan suasana santai", cat: "outdoor", price: "$$", rating: 4.5, addr: "Jalan Btn Gaedenia, Karampuang, Panakkukang", fac: ["Outdoor Seating", "WiFi", "Parking"] },
  { name: "SIJA PETTARANI", desc: "Cafe real dengan konsep clean industrial, cocok untuk nongkrong santai, kerja ringan, dan foto aesthetic", cat: "aesthetic", price: "$$", rating: 4.8, addr: "Jl. Andi Pangeran Pettarani 3, Tamamaung, Panakkukang", fac: ["Indoor Seating", "AC", "Coffee Bar"] },
  { name: "Monochrome Cafe", desc: "Cafe real dengan interior hitam-putih yang unik dan estetik, cocok untuk nongkrong dan makan santai", cat: "aesthetic", price: "$$", rating: 4.6, addr: "Jalan Bulukunyi, Maricaya Baru", fac: ["Indoor Seating", "AC", "Dining Area"] },
  { name: "Crematology X Makassar", desc: "Cafe real dengan interior modern dan pencahayaan hangat, cocok untuk nongkrong santai, ngopi, dan foto aesthetic", cat: "aesthetic", price: "$$", rating: 4.5, addr: "Phinisi Point, Jalan Metro Tanjung Bunga, Mariso", fac: ["Indoor Seating", "AC", "Coffee Bar"] },
  { name: "STORIAMO COFFE AND ROASTERY", desc: "Cafe real dengan area rindang dan suasana cozy, cocok untuk nongkrong, kerja ringan, dan foto aesthetic", cat: "aesthetic", price: "$$", rating: 4.6, addr: "Topaz Lorong 2, Masale, Panakkukang", fac: ["Indoor Seating", "Outdoor Seating", "WiFi"] },
  { name: "Cafe Aestetic Dimakassar", desc: "Cafe real dengan konsep clean minimalis dan area semi-outdoor, cocok untuk nongkrong malam dan foto aesthetic", cat: "aesthetic", price: "$$", rating: 5.0, addr: "Bitoa, Manggala, Makassar", fac: ["Semi Outdoor", "WiFi", "Parking"] },
  { name: "Bangi Cafe Sunset CPI", desc: "Cafe real dengan spot sunset tepi laut, cocok untuk santai sore dan foto aesthetic", cat: "outdoor", price: "$$", rating: 4.2, addr: "Centre Point of Indonesia (CPI), Panambungan, Mariso", fac: ["Sea View", "Outdoor Seating", "Sunset Spot"] },
  { name: "THE ICON BEACH LOUNGE & CAFE", desc: "Cafe real beach lounge dengan suasana senja cantik, cocok untuk nongkrong dan menikmati view laut", cat: "outdoor", price: "$$$", rating: 4.6, addr: "Lego-Lego, Centre Point of Indonesia (CPI), Panambungan, Mariso", fac: ["Sea View", "Outdoor Seating", "Indoor Seating"] },
  { name: "Gravity Sky Lounge", desc: "Cafe real sky lounge dengan view laut dari ketinggian, cocok untuk sunset dan nongkrong malam", cat: "rooftop", price: "$$$", rating: 4.7, addr: "Swiss-BelHotel Makassar, Jalan Ujung Pandang 12", fac: ["Sea View", "Indoor Seating", "Sky Lounge"] },
  { name: "Taman Sari Coffee House", desc: "Taman teduh, live acoustic Jumat-Sabtu malam", cat: "outdoor", price: "$", rating: 4.5, addr: "Jl. Kakatua No. 18", fac: ["Garden", "Live Acoustic", "Kids Playground"] },
  { name: "Warkop Phoenam", desc: "Legendaris sejak 1946, kopi tubruk khas Makassar", cat: "traditional", price: "$", rating: 4.6, addr: "Jl. Sulawesi No. 14", fac: ["Traditional Coffee", "24 Jam"] },
];

function getAIResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('halo') || msg.includes('hai') || msg.includes('hi') || msg.includes('hey') || msg.includes('apa kabar')) {
    return `Halo! 👋 Selamat datang di Cafe Makassar!\n\nSaya bisa bantu kamu cari cafe terbaik di Makassar. Coba tanya:\n• "Cafe aesthetic yang instagramable?"\n• "Cafe buat kerja dengan WiFi cepat?"\n• "Cafe murah tapi enak dimana?"\n• "Rooftop cafe dengan view bagus?"\n• "Top 5 cafe terbaik?"\n\nMau cari yang mana? 😊☕`;
  }

  if (msg.includes('aesthetic') || msg.includes('instagramable') || msg.includes('foto') || msg.includes('cantik')) {
    const picks = cafeData.filter(c => c.cat === 'aesthetic');
    const list = picks.map(c => `📸 ${c.name} ⭐${c.rating} (${c.price})\n   📍 ${c.addr}\n   ${c.desc}\n   Fasilitas: ${c.fac.join(', ')}`).join('\n\n');
    return `Rekomendasi cafe aesthetic & instagramable di Makassar:\n\n${list}\n\n✨ Semua punya spot foto keren! Favorit saya: Cafe Aestetic Dimakassar dan 1997 Coffee, dua-duanya punya rating tertinggi 5.0!`;
  }

  if (msg.includes('kerja') || msg.includes('work') || msg.includes('wifi') || msg.includes('coworking') || msg.includes('laptop') || msg.includes('wfc')) {
    const picks = cafeData.filter(c => c.cat === 'coworking');
    const list = picks.map(c => `💻 ${c.name} ⭐${c.rating} (${c.price})\n   📍 ${c.addr}\n   ${c.desc}\n   Fasilitas: ${c.fac.join(', ')}`).join('\n\n');
    return `Cafe terbaik untuk kerja/WFC di Makassar:\n\n${list}\n\n🔌 Tips: Postropis Coffee & Space dan SIJA PETTARANI cocok banget buat kerja atau deadline!`;
  }

  if (msg.includes('murah') || msg.includes('terjangkau') || msg.includes('hemat') || msg.includes('mahasiswa') || msg.includes('budget')) {
    const picks = cafeData.filter(c => c.price === '$');
    const list = picks.map(c => `💰 ${c.name} ⭐${c.rating}\n   📍 ${c.addr}\n   ${c.desc}`).join('\n\n');
    return `Cafe murah tapi enak di Makassar:\n\n${list}\n\n💸 Semua harga ramah kantong! Warkop Phoenam paling legendaris — buka sejak 1946!`;
  }

  if (msg.includes('rooftop') || msg.includes('view') || msg.includes('sunset') || msg.includes('pemandangan') || msg.includes('tinggi')) {
    const picks = cafeData.filter(c => c.cat === 'rooftop');
    const list = picks.map(c => `🌆 ${c.name} ⭐${c.rating} (${c.price})\n   📍 ${c.addr}\n   ${c.desc}\n   Fasilitas: ${c.fac.join(', ')}`).join('\n\n');
    return `Rooftop cafe dengan view terbaik di Makassar:\n\n${list}\n\n🌅 Gravity Sky Lounge cocok banget buat sunset dengan view laut dari ketinggian!`;
  }

  if (msg.includes('outdoor') || msg.includes('taman') || msg.includes('alam') || msg.includes('hijau') || msg.includes('segar')) {
    const picks = cafeData.filter(c => c.cat === 'outdoor');
    const list = picks.map(c => `🌿 ${c.name} ⭐${c.rating} (${c.price})\n   📍 ${c.addr}\n   ${c.desc}\n   Fasilitas: ${c.fac.join(', ')}`).join('\n\n');
    return `Cafe outdoor asri di Makassar:\n\n${list}\n\n🍃 Bangi Cafe Sunset CPI dan THE ICON BEACH LOUNGE & CAFE cocok buat santai sambil lihat sunset!`;
  }

  if (msg.includes('tradisional') || msg.includes('toraja') || msg.includes('warkop') || msg.includes('klasik') || msg.includes('kopi tubruk')) {
    const picks = cafeData.filter(c => c.cat === 'traditional');
    const list = picks.map(c => `☕ ${c.name} ⭐${c.rating} (${c.price})\n   📍 ${c.addr}\n   ${c.desc}\n   Fasilitas: ${c.fac.join(', ')}`).join('\n\n');
    return `Warkop & cafe tradisional khas Makassar:\n\n${list}\n\n☕ Kopi Toraja dan kopi tubruk Makassar itu legend! Warkop Phoenam wajib dikunjungi!`;
  }

  if (msg.includes('terbaik') || msg.includes('rating') || msg.includes('top') || msg.includes('populer') || msg.includes('best')) {
    const picks = [...cafeData].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const list = picks.map((c, i) => `${i+1}. ${c.name} ⭐${c.rating} — ${c.cat}\n   📍 ${c.addr}\n   ${c.desc}`).join('\n\n');
    return `🏆 Top 5 Cafe Terbaik di Makassar:\n\n${list}\n\nSemua worth to visit! Cafe Aestetic Dimakassar dan 1997 Coffee sama-sama ada di puncak dengan rating 5.0! 🎯`;
  }

  if (msg.includes('rekomen') || msg.includes('saran') || msg.includes('suggest') || msg.includes('pilih')) {
    const picks = [...cafeData].sort((a, b) => b.rating - a.rating).slice(0, 4);
    const list = picks.map(c => `⭐ ${c.name} (${c.cat}) — Rating: ${c.rating}/5\n   📍 ${c.addr}\n   ${c.desc}`).join('\n\n');
    return `Rekomendasi cafe pilihan di Makassar:\n\n${list}\n\nMau yang spesifik? Tanya aja kategorinya:\n• Aesthetic / Coworking / Outdoor / Rooftop / Traditional 😊`;
  }

  if (msg.includes('makan') || msg.includes('menu') || msg.includes('food') || msg.includes('makanan')) {
    return `🍽️ Cafe di Makassar dengan menu makanan lengkap:\n\n1. EIGHTEEN Eatery — Nongkrong santai dengan area makan yang nyaman\n2. Crematology X Makassar — Ngopi santai dengan area duduk cozy\n3. STORIAMO COFFE AND ROASTERY — Nongkrong rindang dan santai\n4. Mark Trees Cafe — Nongkrong cozy dengan suasana hangat\n\n🥘 Jangan lupa coba pisang epe dan coto Makassar di sekitar cafe!`;
  }

  if (msg.includes('24 jam') || msg.includes('malam') || msg.includes('tengah malam') || msg.includes('begadang') || msg.includes('lembur')) {
    return `🌙 Cafe yang buka malam/24 jam di Makassar:\n\n1. Warkop Phoenam — 24 Jam, kopi tubruk legendaris\n   📍 Jl. Sulawesi No. 14\n\n2. Goodfields Makassar — Sampai jam 24:00\n   📍 Jl. Chairil Anwar, Ujung Pandang\n\n3. Kopi Lain Hati — Sampai jam 24:00\n   📍 Jl. Urip Sumoharjo No. 120\n\n4. Aynaka Coffee Racing Centre — Cocok buat nongkrong malam\n   📍 Jalan Btn Gaedenia, Panakkukang\n\n☕ Perfect buat begadang atau lembur!`;
  }

  if (msg.includes('lokasi') || msg.includes('alamat') || msg.includes('dimana') || msg.includes('daerah')) {
    const list = cafeData.map(c => `📍 ${c.name} — ${c.addr}`).join('\n');
    return `Lokasi semua cafe di Makassar:\n\n${list}\n\nMau tau detail cafe yang mana? Tanya aja! 🗺️`;
  }

  if (msg.includes('terima kasih') || msg.includes('makasih') || msg.includes('thanks') || msg.includes('thank')) {
    return `Sama-sama! 😊 Senang bisa membantu!\n\nKalau ada pertanyaan lain tentang cafe di Makassar, jangan ragu tanya ya. Selamat ngopi! ☕✨`;
  }

  // Default response
  return `Kami punya ${cafeData.length} cafe di Makassar! 🏪\n\n📸 Aesthetic: ${cafeData.filter(c=>c.cat==='aesthetic').length} cafe\n💻 Coworking: ${cafeData.filter(c=>c.cat==='coworking').length} cafe\n🌿 Outdoor: ${cafeData.filter(c=>c.cat==='outdoor').length} cafe\n🌆 Rooftop: ${cafeData.filter(c=>c.cat==='rooftop').length} cafe\n☕ Traditional: ${cafeData.filter(c=>c.cat==='traditional').length} cafe\n\nCoba tanya lebih spesifik, contoh:\n• "Cafe aesthetic yang instagramable?"\n• "Cafe murah buat mahasiswa?"\n• "Top 5 cafe terbaik?"\n• "Cafe buat kerja?"\n\nSaya siap bantu! 😊`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Halo! 👋 Saya asisten AI Cafe Makassar. Tanyakan apa saja tentang cafe di Makassar — rekomendasi, menu, suasana, atau apapun! Saya siap membantu ☕',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setIsLoading(true);

    // Simulate brief thinking delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Try backend API first
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      
      if (data.success && data.data.message) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: data.data.message, 
          timestamp: data.data.timestamp || new Date().toISOString()
        }]);
      } else {
        throw new Error('No response');
      }
    } catch (error) {
      // Fallback: use local AI response
      const aiResponse = getAIResponse(userMessage);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: aiResponse, 
        timestamp: new Date().toISOString() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Cafe aesthetic yang instagramable?",
    "Cafe buat kerja dengan WiFi cepat?",
    "Cafe murah tapi enak dimana?",
    "Rooftop cafe dengan view bagus?",
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pt-24 pb-4">
        {/* Chat Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600">AI Online</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-primary">
            🤖 AI Cafe Assistant
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Tanyakan rekomendasi cafe, menu, atau apapun tentang cafe di Makassar!
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-2xl bg-warm/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                {msg.role === 'ai' && (
                  <p className="text-xs text-secondary font-medium mb-1">🤖 AI Assistant</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className="text-[10px] opacity-50 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-secondary rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                  <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="whitespace-nowrap text-xs px-3 py-2 rounded-full bg-white border border-secondary/30 text-primary hover:bg-secondary/10 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya tentang cafe di Makassar..."
            className="flex-1 px-5 py-3.5 rounded-full bg-white border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary px-6 disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </form>
      </div>
    </main>
  );
}
