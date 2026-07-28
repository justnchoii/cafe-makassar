'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import CafeCard from '../components/CafeCard';
import ChatWidget from '../components/ChatWidget';

export default function Home() {
  const [cafes, setCafes] = useState([]);
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: '✨ Semua', emoji: '✨' },
    { id: 'aesthetic', label: '📸 Aesthetic', emoji: '📸' },
    { id: 'coworking', label: '💻 Coworking', emoji: '💻' },
    { id: 'outdoor', label: '🌿 Outdoor', emoji: '🌿' },
    { id: 'rooftop', label: '🌆 Rooftop', emoji: '🌆' },
    { id: 'traditional', label: '☕ Traditional', emoji: '☕' },
  ];

  useEffect(() => {
    fetchCafes();
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredCafes(cafes);
    } else {
      setFilteredCafes(cafes.filter(c => c.category === activeCategory));
    }
  }, [activeCategory, cafes]);

  const fetchCafes = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/cafes`);
      const data = await res.json();
      if (data.success) {
        setCafes(data.data);
        setFilteredCafes(data.data);
      }
    } catch (error) {
      console.error('Error fetching cafes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cafe opacity-90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Temukan Cafe<br/>
            <span className="text-secondary">Terbaik</span> di Makassar
          </h1>
          <p className="text-lg md:text-xl opacity-80 mb-8 max-w-2xl mx-auto">
            Jelajahi cafe aesthetic, coworking space, dan hidden gems di Kota Makassar 
            dengan rekomendasi AI yang personal untukmu ☕
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="#cafes" className="btn-primary text-lg">
              🗺️ Jelajahi Cafe
            </Link>
            <Link href="/chat" className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-all duration-300 border border-white/30">
              🤖 Tanya AI
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">50+</p>
            <p className="text-sm text-gray-500">Cafe Terdaftar</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">4.5⭐</p>
            <p className="text-sm text-gray-500">Rating Rata-rata</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">5</p>
            <p className="text-sm text-gray-500">Kategori</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">AI</p>
            <p className="text-sm text-gray-500">Rekomendasi Pintar</p>
          </div>
        </div>
      </section>

      {/* Cafe List Section */}
      <section id="cafes" className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-primary mb-4">
            Cafe Pilihan Kami
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Diseleksi khusus untuk pengalaman ngopi terbaik di Makassar
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 justify-center flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-gradient-cafe text-white shadow-lg scale-105'
                  : 'bg-white text-primary hover:bg-warm border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cafe Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="h-48 bg-warm rounded-xl mb-4"></div>
                <div className="h-4 bg-warm rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-warm rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCafes.map((cafe, index) => (
              <CafeCard key={cafe._id} cafe={cafe} index={index} />
            ))}
          </div>
        )}

        {filteredCafes.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">☕</p>
            <p className="text-gray-500">Belum ada cafe untuk kategori ini</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-cafe text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-4xl font-bold mb-4">
            Bingung Mau Ngopi Dimana?
          </h2>
          <p className="opacity-80 mb-8 text-lg">
            Tanya AI kami! Ceritakan mood kamu, dan kami akan carikan cafe yang perfect untukmu 🎯
          </p>
          <Link href="/chat" className="inline-block bg-secondary text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-secondary/90 hover:scale-105 transition-all duration-300 shadow-xl">
            💬 Mulai Chat dengan AI
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white/60 py-8 text-center text-sm">
        <p>© 2026 Cafe Makassar. Built with ❤️ for Makassar coffee lovers.</p>
      </footer>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </main>
  );
}
