'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CafeDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/cafes/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setCafe(data.data);
        else router.push('/');
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = () => {
    if (messages.length === 0 && cafe) {
      setMessages([{
        role: 'assistant',
        content: `Halo! Saya AI asisten untuk ${cafe.name} 😊\n\nTanyakan apa saja tentang cafe ini — menu, harga, fasilitas, atau lainnya!`
      }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || aiLoading) return;
    const userMsg = input.trim();
    setInput('');
    if (messages.length === 0) startChat();
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setAiLoading(true);

    try {
      const cafeContext = `Nama: ${cafe.name}\nAlamat: ${cafe.address}\nKategori: ${cafe.category}\nRating: ${cafe.rating}\nHarga: ${cafe.priceInfo || cafe.priceRange}\nJam Buka: ${cafe.openHours}\nMenu: ${(cafe.menu || []).join(', ')}\nFasilitas: ${(cafe.facilities || []).join(', ')}\nCocok Untuk: ${(cafe.suitableFor || []).join(', ')}\nTentang: ${cafe.about || cafe.description}\nTips: ${cafe.tips || ''}\nSpot Favorit: ${cafe.favoriteSpot || ''}`;
      const systemMessage = `Kamu adalah asisten AI yang ramah dan cerdas untuk cafe "${cafe.name}" di Makassar. Kamu bisa menjawab APAPUN yang ditanyakan pengunjung — mulai dari info cafe, menu, harga, rekomendasi, hingga pertanyaan umum lainnya. Utamakan informasi tentang cafe ini jika relevan. Data cafe:\n\n${cafeContext}`;
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history, systemOverride: systemMessage, cafeId: id }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Maaf, tidak bisa menjawab saat ini.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Coba lagi!' }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">☕</div>
        <p className="text-gray-500">Memuat detail cafe...</p>
      </div>
    </div>
  );

  if (!cafe) return null;

  const priceLabel = cafe.priceRange === '$' ? 'Murah' : cafe.priceRange === '$$' ? 'Sedang' : 'Mahal';
  const categoryEmoji = { aesthetic: '📸', coworking: '💻', outdoor: '🌿', rooftop: '🌆', traditional: '☕', cozy: '🛋️' };

  return (
    <div className="min-h-screen bg-warm">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/" className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-medium text-primary hover:bg-white transition-all">
          ← Kembali
        </Link>
      </div>

      {/* Hero Image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {cafe.image ? (
          <img src={cafe.image} alt={cafe.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-warm to-secondary/30 flex items-center justify-center">
            <span className="text-8xl opacity-40">{categoryEmoji[cafe.category] || '☕'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
              {categoryEmoji[cafe.category]} {cafe.category}
            </span>
            <span className="bg-yellow-400/90 text-yellow-900 text-xs px-3 py-1 rounded-full font-bold">
              ⭐ {cafe.rating}
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
              {priceLabel}
            </span>
          </div>
          <h1 className="text-white font-display text-3xl font-bold">{cafe.name}</h1>
          <p className="text-white/80 text-sm mt-1">📍 {cafe.address}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* About */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-primary text-lg mb-3">📝 Tentang Cafe</h2>
          <p className="text-gray-600 leading-relaxed">{cafe.about || cafe.description}</p>
        </div>

        {/* Menu */}
        {cafe.menu && cafe.menu.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-primary text-lg mb-3">☕ Rekomendasi Menu</h2>
            <div className="grid grid-cols-2 gap-2">
              {cafe.menu.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-secondary">•</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price + Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-primary text-base mb-2">💰 Kisaran Harga</h2>
            <p className="text-gray-600 text-sm">{cafe.priceInfo || `Kategori: ${priceLabel}`}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-primary text-base mb-2">🕐 Jam Buka</h2>
            <p className="text-gray-600 text-sm">{cafe.openHours || 'Cek di Google Maps'}</p>
          </div>
        </div>

        {/* Facilities */}
        {cafe.facilities && cafe.facilities.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-primary text-lg mb-3">🪑 Fasilitas</h2>
            <div className="flex flex-wrap gap-2">
              {cafe.facilities.map((f, i) => (
                <span key={i} className="flex items-center gap-1 bg-green-50 text-green-700 text-sm px-3 py-1.5 rounded-full">
                  ✅ {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suitable For */}
        {cafe.suitableFor && cafe.suitableFor.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-primary text-lg mb-3">🎯 Cocok Untuk</h2>
            <div className="flex flex-wrap gap-2">
              {cafe.suitableFor.map((s, i) => (
                <span key={i} className="bg-secondary/10 text-secondary text-sm px-3 py-1.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Favorite Spot */}
        {cafe.favoriteSpot && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-primary text-lg mb-3">📸 Spot Favorit</h2>
            <p className="text-gray-600 leading-relaxed">{cafe.favoriteSpot}</p>
          </div>
        )}

        {/* Tips */}
        {cafe.tips && (
          <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl p-6 shadow-sm border border-secondary/20">
            <h2 className="font-bold text-primary text-lg mb-3">💡 Tips Berkunjung</h2>
            <p className="text-gray-600 leading-relaxed">{cafe.tips}</p>
          </div>
        )}

        {/* Maps Button */}
        {cafe.mapsLink && (
          <a
            href={cafe.mapsLink}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-gradient-cafe text-white py-4 rounded-2xl font-semibold text-base hover:opacity-90 transition-all shadow-md"
          >
            🗺️ Lihat di Google Maps
          </a>
        )}

        {/* ===== AI CHAT SECTION ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-secondary/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-5 flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h2 className="font-bold text-white text-lg">Tanya AI tentang {cafe.name}</h2>
              <p className="text-white/80 text-xs">Tanya menu, harga, fasilitas, atau apapun tentang cafe ini</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Messages area */}
            <div className="bg-gray-50 rounded-xl p-3 h-56 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <p className="text-gray-400 text-sm text-center">Belum ada percakapan. Mulai tanya sekarang!</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Apa menu andalannya?', 'Berapa harganya?', 'Ada WiFi tidak?', 'Jam bukanya kapan?'].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { startChat(); setInput(q); }}
                        className="text-xs bg-secondary/10 text-secondary px-3 py-1.5 rounded-full hover:bg-secondary/20 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white px-3 py-2 rounded-xl shadow-sm">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                onFocus={startChat}
                placeholder={`Tanya tentang ${cafe.name}...`}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                disabled={aiLoading}
              />
              <button
                onClick={sendMessage}
                disabled={aiLoading || !input.trim()}
                className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
        {/* ===== END AI CHAT ===== */}

      </div>
    </div>
  );
}