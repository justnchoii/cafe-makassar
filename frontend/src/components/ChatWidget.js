'use client';

import { useState, useRef, useEffect } from 'react';

const cafeData = [
  { name: "Goodfields Makassar", cat: "aesthetic", price: "$$", rating: 4.7, addr: "Jl. Chairil Anwar, Ujung Pandang" },
  { name: "Duft Coffee Indonesia", cat: "aesthetic", price: "$$", rating: 4.8, addr: "Jalan A.P. Pettarani, Panakkukang" },
  { name: "Postropis Coffee & Space", cat: "coworking", price: "$$", rating: 4.8, addr: "Jalan Adipura Raya, Panakkukang" },
  { name: "Nara Coffee & Kitchen", cat: "aesthetic", price: "$$", rating: 4.8, addr: "Jl. Hertasning No. 52" },
  { name: "Maleo Coffee Roasters", cat: "aesthetic", price: "$$", rating: 4.9, addr: "Jl. Bonto Lempangan No. 8" },
  { name: "Warkop Phoenam", cat: "traditional", price: "$", rating: 4.6, addr: "Jl. Sulawesi No. 14" },
  { name: "Digital Nomad Hub", cat: "coworking", price: "$$", rating: 4.5, addr: "Jl. Ratulangi No. 33" },
  { name: "Losari Beach Coffee", cat: "outdoor", price: "$", rating: 4.7, addr: "Pantai Losari" },
];

function getQuickResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('aesthetic') || m.includes('foto')) {
    return '📸 Cafe aesthetic: Maleo Coffee Roasters (⭐4.9), Nara Coffee (⭐4.8), Goodfields Makassar (⭐4.7). Semua instagramable!';
  }
  if (m.includes('murah') || m.includes('hemat')) {
    return '💰 Cafe murah: Warkop Phoenam ($, legendaris!), Losari Beach Coffee ($, view laut), Kopi Lain Hati ($, hits!).';
  }
  if (m.includes('kerja') || m.includes('wifi') || m.includes('coworking')) {
    return '💻 Cafe buat kerja: Digital Nomad Hub (24jam, 100Mbps), Postropis Coffee & Space, Green Space Co-Working. WiFi cepat!';
  }
  if (m.includes('rooftop') || m.includes('view')) {
    return '🌆 Rooftop: Sky Lounge (lantai 20!), Panorama Rooftop Bar, Kalaras Coffee. View mantap!';
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
