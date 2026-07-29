'use client';

import { useState, useRef, useEffect } from 'react';

const cafeData = [
  { name: "Goodfields Makassar", cat: "aesthetic", price: "$$", rating: 4.7, addr: "Jl. Chairil Anwar, Ujung Pandang" },
  { name: "Duft Coffee Indonesia", cat: "aesthetic", price: "$$", rating: 4.8, addr: "Jalan A.P. Pettarani, Panakkukang" },
  { name: "Postropis Coffee & Space", cat: "coworking", price: "$$", rating: 4.8, addr: "Jalan Adipura Raya, Panakkukang" },
  { name: "1997 Coffee", cat: "aesthetic", price: "$$", rating: 5.0, addr: "Jalan Bougenville, Panakkukang" },
  { name: "EIGHTEEN Eatery", cat: "aesthetic", price: "$$", rating: 4.6, addr: "Jalan Rusa, Maricaya" },
  { name: "Mark Trees Cafe", cat: "aesthetic", price: "$$", rating: 4.7, addr: "Jalan G. Batu Putih, Ujung Pandang" },
  { name: "Aynaka Coffee Racing Centre", cat: "outdoor", price: "$$", rating: 4.5, addr: "Jalan Btn Gaedenia, Panakkukang" },
  { name: "SIJA PETTARANI", cat: "aesthetic", price: "$$", rating: 4.8, addr: "Jl. Andi Pangeran Pettarani 3, Panakkukang" },
  { name: "Monochrome Cafe", cat: "aesthetic", price: "$$", rating: 4.6, addr: "Jalan Bulukunyi, Maricaya Baru" },
  { name: "Crematology X Makassar", cat: "aesthetic", price: "$$", rating: 4.5, addr: "Jalan Metro Tanjung Bunga, Mariso" },
  { name: "STORIAMO COFFE AND ROASTERY", cat: "aesthetic", price: "$$", rating: 4.6, addr: "Topaz Lorong 2, Panakkukang" },
  { name: "Cafe Aestetic Dimakassar", cat: "aesthetic", price: "$$", rating: 5.0, addr: "Bitoa, Manggala" },
  { name: "Bangi Cafe Sunset CPI", cat: "outdoor", price: "$$", rating: 4.2, addr: "CPI, Panambungan, Mariso" },
  { name: "THE ICON BEACH LOUNGE & CAFE", cat: "outdoor", price: "$$$", rating: 4.6, addr: "Lego-Lego, CPI, Mariso" },
  { name: "Gravity Sky Lounge", cat: "rooftop", price: "$$$", rating: 4.7, addr: "Swiss-BelHotel, Ujung Pandang" },
  { name: "COASTLINE Cafe", cat: "outdoor", price: "$$", rating: 4.4, addr: "CPI, Panambungan, Mariso" },
  { name: "Center Point Cafe", cat: "outdoor", price: "$$", rating: 4.6, addr: "CPI, Panambungan, Mariso" },
  { name: "Negeri Sembilan Melayu's Signature & Coffee", cat: "aesthetic", price: "$$$", rating: 4.9, addr: "Lego-Lego, CPI, Mariso" },
  { name: "Seroeni - Sunset Quay", cat: "outdoor", price: "$$$", rating: 4.9, addr: "Lego-Lego, CPI, Mariso" },
  { name: "Ballairate", cat: "aesthetic", price: "$$", rating: 4.4, addr: "Swiss-BelHotel, Ujung Pandang" },
  { name: "Kultur Haus Sunset Quay", cat: "aesthetic", price: "$$$", rating: 4.6, addr: "Lego-Lego, CPI, Mariso" },
  { name: "Fore Coffee - Sunset Quay", cat: "aesthetic", price: "$$", rating: 4.2, addr: "CPI, Panambungan, Mariso" },
  { name: "Wam's Coffee", cat: "aesthetic", price: "$$", rating: 4.9, addr: "Jalan Inspeksi Kanal Puri Borong Raya, Manggala" },
  { name: "Utata Space", cat: "aesthetic", price: "$$", rating: 4.4, addr: "Bitoa, Manggala" },
  { name: "Warkop Phoenam", cat: "traditional", price: "$", rating: 4.6, addr: "Jl. Sulawesi No. 14" },
];

const cafeStopWords = new Set([
  'cafe', 'coffee', 'coffe', 'lounge', 'space', 'eatery', 'roastery',
  'signature', 'house', 'the', 'and', 'sunset', 'quay'
]);

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCafeAliases(cafe) {
  const normalizedName = normalizeText(cafe.name);
  const words = normalizedName
    .split(' ')
    .filter(word => word.length >= 4 && !cafeStopWords.has(word));

  const aliases = new Set([normalizedName]);
  words.forEach(word => aliases.add(word));

  for (let i = 0; i < words.length - 1; i += 1) {
    aliases.add(`${words[i]} ${words[i + 1]}`);
  }

  return [...aliases].filter(alias => alias.length >= 4);
}

function findCafeByMessage(message) {
  const normalizedMessage = normalizeText(message);
  let bestMatch = null;

  for (const cafe of cafeData) {
    for (const alias of getCafeAliases(cafe)) {
      if (normalizedMessage.includes(alias)) {
        if (!bestMatch || alias.length > bestMatch.alias.length) {
          bestMatch = { cafe, alias };
        }
      }
    }
  }

  return bestMatch ? bestMatch.cafe : null;
}

function getCafeVibe(cafe) {
  if (cafe.cat === 'rooftop') {
    return 'lebih mewah dan enak buat lihat view malam dari ketinggian';
  }

  if (cafe.cat === 'outdoor') {
    return 'santai, terbuka, dan enak buat sunset atau foto-foto';
  }

  if (cafe.cat === 'traditional') {
    return 'klasik dan cocok buat ngopi santai';
  }

  return 'modern, nyaman, dan cocok buat nongkrong atau foto aesthetic';
}

function buildCafeQuickResponse(cafe) {
  return `☕ ${cafe.name}\nVibenya ${getCafeVibe(cafe)}.\n⭐ ${cafe.rating}/5 • ${cafe.price}\n📍 ${cafe.addr}`;
}

function getQuickResponse(msg) {
  const m = msg.toLowerCase();
  const matchedCafe = findCafeByMessage(msg);

  if (matchedCafe) {
    return buildCafeQuickResponse(matchedCafe);
  }

  if (m.includes('aesthetic') || m.includes('foto')) {
    return '📸 Cafe aesthetic: Cafe Aestetic Dimakassar (⭐5.0), 1997 Coffee (⭐5.0), SIJA PETTARANI (⭐4.8). Semua instagramable!';
  }
  if (m.includes('murah') || m.includes('hemat')) {
    return '💰 Cafe murah: Warkop Phoenam ($, legendaris!), Kopi Lain Hati ($, hits!), Goodfields Makassar ($$, worth it!).';
  }
  if (m.includes('kerja') || m.includes('wifi') || m.includes('coworking')) {
    return '💻 Cafe buat kerja: Postropis Coffee & Space, SIJA PETTARANI, Duft Coffee Indonesia. WiFi cepat dan nyaman!';
  }
  if (m.includes('rooftop') || m.includes('view')) {
    return '🌆 Rooftop: Gravity Sky Lounge, THE ICON BEACH LOUNGE & CAFE, Bangi Cafe Sunset CPI. View mantap!';
  }
  if (m.includes('rekomen') || m.includes('saran')) {
    const top = [...cafeData].sort((a,b) => b.rating - a.rating).slice(0,3);
    return `⭐ Top 3: ${top.map(c => `${c.name} (${c.rating})`).join(', ')}. Buka halaman Explore untuk detail!`;
  }
  if (m.includes('halo') || m.includes('hai') || m.includes('hi')) {
    return 'Halo! 👋 Tanya aja soal cafe aesthetic, murah, coworking, rooftop, atau rekomendasi! 😊';
  }
  return `Ada ${cafeData.length}+ cafe di Makassar! Tanya: "cafe aesthetic?", "cafe murah?", "cafe buat kerja?", atau "rekomendasi?" 😊`;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Halo! Ada yang bisa saya bantu tentang cafe di Makassar? ☕' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 600));
    
    const response = getQuickResponse(userMessage);
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-cafe text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-[28rem] glass-card flex flex-col overflow-hidden shadow-2xl animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-cafe text-white px-4 py-3 flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-sm font-medium">AI Assistant</p>
              <p className="text-[10px] opacity-70">Online • Siap membantu</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-cream/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-gradient-cafe text-white rounded-2xl rounded-br-md px-3 py-2 max-w-[75%]' 
                    : 'bg-white rounded-2xl rounded-bl-md px-3 py-2 max-w-[75%] shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-3 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></span>
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 px-3 py-2 rounded-full bg-warm border-none text-xs outline-none focus:ring-1 focus:ring-secondary"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 bg-gradient-cafe text-white rounded-full text-xs flex items-center justify-center disabled:opacity-50"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
