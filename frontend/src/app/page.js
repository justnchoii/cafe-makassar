'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import CafeCard from '../components/CafeCard';
import ChatWidget from '../components/ChatWidget';

const staticCafes = [
  {
    _id: '1',
    name: "Goodfields Makassar",
    description: "Cafe aesthetic real dari link Google Maps yang kamu kirim. Interior modern, nyaman buat nongkrong, dan berada di area Ujung Pandang Makassar.",
    address: "Jalan Chairil Anwar, Sawerigading, Ujung Pandang, Makassar",
    category: "aesthetic",
    rating: 4.7,
    priceRange: "$$",
    facilities: ["WiFi", "AC", "Smoking Area", "Meeting Room", "Live Music"],
    openHours: "09:00 - 24:00",
    image: "/goodfields-makassar.png",
    mapsLink: "https://maps.app.goo.gl/j6uMYGuWDQusQmhL9"
  },
  {
    _id: '2',
    name: "Duft Coffee Indonesia",
    description: "Cafe real dari link Google Maps yang kamu kirim. Vibenya hangat dengan dominasi kayu, cocok untuk nongkrong santai dan ngopi di area Panakkukang.",
    address: "Jalan A.P. Pettarani, Tamamaung, Panakkukang, Makassar",
    category: "aesthetic",
    rating: 4.5,
    priceRange: "$$",
    facilities: ["WiFi", "AC", "Coffee Bar", "Indoor Seating", "Parking"],
    openHours: "10:00 - 01:00",
    image: "/duft-coffee-indonesia.png",
    mapsLink: "https://maps.app.goo.gl/QGPTcSpqvfukdRhz6"
  },
  {
    _id: '3',
    name: "Postropis Coffee & Space",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya luas, modern, dan cocok untuk kerja, meeting, atau nongkrong di area Panakkukang.",
    address: "Jalan Adipura Raya, Karuwisi Utara, Panakkukang, Makassar",
    category: "coworking",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["WiFi Cepat", "AC", "Meeting Room", "Workspace", "Parking"],
    openHours: "07:00 - 23:00",
    image: "/postropis-coffee-space.png",
    mapsLink: "https://maps.app.goo.gl/z1m3AJjDsM5HotvXA"
  },
  {
    _id: '4',
    name: "Warung Kopi Daeng",
    description: "Kedai kopi tradisional Makassar dengan kopi Toraja asli. Suasana hangat khas budaya Bugis-Makassar dan harga terjangkau.",
    address: "Jl. Somba Opu No. 200, Makassar",
    category: "traditional",
    rating: 4.3,
    priceRange: "$",
    facilities: ["Outdoor Seating", "Parking", "Traditional Snacks"],
    openHours: "06:00 - 22:00",
    image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=400&fit=crop"
  },
  {
    _id: '5',
    name: "The Garden Cafe",
    description: "Cafe outdoor dengan taman hijau yang asri di tengah kota. Spot instagramable dan menu healthy food serta smoothie bowl.",
    address: "Jl. Boulevard, Panakkukang, Makassar",
    category: "outdoor",
    rating: 4.4,
    priceRange: "$$",
    facilities: ["WiFi", "Garden", "Parking", "Pet Friendly", "Kids Area"],
    openHours: "08:00 - 22:00",
    image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&h=400&fit=crop"
  },
  {
    _id: '6',
    name: "Nara Coffee & Kitchen",
    description: "Cafe minimalis Jepang dengan menu fusion. Interior clean dan instagramable, cocok buat nongkrong santai bareng teman.",
    address: "Jl. Hertasning No. 52, Makassar",
    category: "aesthetic",
    rating: 4.8,
    priceRange: "$$",
    facilities: ["WiFi", "AC", "Instagram Spot", "Dessert Bar"],
    openHours: "10:00 - 23:00",
    image: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop"
  },
  {
    _id: '7',
    name: "Sky Lounge Makassar",
    description: "Rooftop lounge di lantai 20 dengan view 360° kota Makassar. Premium coffee, cocktails, dan live DJ setiap weekend.",
    address: "Jl. Jend. Sudirman No. 1, Makassar",
    category: "rooftop",
    rating: 4.6,
    priceRange: "$$$",
    facilities: ["WiFi", "AC", "Bar", "Live DJ", "VIP Room"],
    openHours: "15:00 - 02:00",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop"
  },
  {
    _id: '8',
    name: "Digital Nomad Hub",
    description: "Co-working cafe 24 jam untuk digital nomad. Internet super cepat 100Mbps dan ruang kerja nyaman dengan locker pribadi.",
    address: "Jl. Ratulangi No. 33, Makassar",
    category: "coworking",
    rating: 4.5,
    priceRange: "$$",
    facilities: ["WiFi 100Mbps", "AC", "Locker", "Shower", "Nap Room", "24 Jam"],
    openHours: "24 Jam",
    image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&h=400&fit=crop"
  },
  {
    _id: '9',
    name: "Losari Beach Coffee",
    description: "Cafe tepi pantai Losari dengan view sunset terbaik di Makassar. Sajian kopi dan pisang epe khas Makassar yang legendaris.",
    address: "Jl. Penghibur, Pantai Losari, Makassar",
    category: "outdoor",
    rating: 4.7,
    priceRange: "$",
    facilities: ["Outdoor Seating", "Sea View", "Parking", "Traditional Food"],
    openHours: "07:00 - 23:00",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop"
  },
  {
    _id: '10',
    name: "Kopi Lain Hati Makassar",
    description: "Cafe hits dengan konsep aesthetic modern dan harga terjangkau. Menu kopi susu dan snack yang cocok untuk mahasiswa.",
    address: "Jl. Urip Sumoharjo No. 120, Makassar",
    category: "aesthetic",
    rating: 4.2,
    priceRange: "$",
    facilities: ["WiFi", "AC", "Instagram Spot", "Parking"],
    openHours: "10:00 - 24:00",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop"
  },
  {
    _id: '11',
    name: "Fort Rotterdam Cafe",
    description: "Cafe berkonsep heritage di dekat Benteng Rotterdam. Nuansa kolonial dengan sentuhan budaya Makassar yang unik dan bersejarah.",
    address: "Jl. Ujung Pandang No. 1, Makassar",
    category: "traditional",
    rating: 4.4,
    priceRange: "$$",
    facilities: ["WiFi", "Heritage View", "Outdoor", "Museum Nearby"],
    openHours: "08:00 - 22:00",
    image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&h=400&fit=crop"
  },
  {
    _id: '12',
    name: "Maleo Coffee Roasters",
    description: "Specialty coffee roaster dengan biji kopi Sulawesi Selatan pilihan. Single origin Toraja dan Enrekang yang di-roast in house.",
    address: "Jl. Bonto Lempangan No. 8, Makassar",
    category: "aesthetic",
    rating: 4.9,
    priceRange: "$$",
    facilities: ["WiFi", "AC", "Roasting Demo", "Coffee Cupping", "Workshop"],
    openHours: "09:00 - 22:00",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop"
  },
  {
    _id: '13',
    name: "Panorama Rooftop Bar",
    description: "Sky bar & cafe di hotel bintang 5 dengan panorama kota dan laut. Cocktail signature dan tapas menu premium.",
    address: "Jl. Andi Djemma No. 5, Makassar",
    category: "rooftop",
    rating: 4.7,
    priceRange: "$$$",
    facilities: ["WiFi", "AC", "Premium Bar", "Live Band", "Private Dining"],
    openHours: "16:00 - 02:00",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop"
  },
  {
    _id: '14',
    name: "Green Space Co-Working",
    description: "Coworking cafe dengan konsep hijau dan sustainable. Tanaman indoor, furnitur daur ulang, dan menu organic coffee.",
    address: "Jl. Perintis Kemerdekaan KM 12, Makassar",
    category: "coworking",
    rating: 4.3,
    priceRange: "$$",
    facilities: ["WiFi Cepat", "AC", "Standing Desk", "Phone Booth", "Projector"],
    openHours: "07:00 - 23:00",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop"
  },
  {
    _id: '15',
    name: "Taman Sari Coffee House",
    description: "Cafe di taman kota yang teduh dengan suasana rileks. Live acoustic setiap Jumat-Sabtu malam dan menu nusantara.",
    address: "Jl. Kakatua No. 18, Makassar",
    category: "outdoor",
    rating: 4.5,
    priceRange: "$",
    facilities: ["Garden Seating", "Live Acoustic", "Parking", "Kids Playground"],
    openHours: "08:00 - 23:00",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop"
  },
  {
    _id: '16',
    name: "Warkop Phoenam",
    description: "Warkop legendaris Makassar sejak 1946. Kopi tubruk khas Makassar dan roti bakar yang jadi ikon kuliner kota.",
    address: "Jl. Sulawesi No. 14, Makassar",
    category: "traditional",
    rating: 4.6,
    priceRange: "$",
    facilities: ["Outdoor Seating", "Traditional Coffee", "Parking", "24 Jam"],
    openHours: "24 Jam",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop"
  }
];

export default function Home() {
  const [cafes, setCafes] = useState(staticCafes);
  const [filteredCafes, setFilteredCafes] = useState(staticCafes);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);

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
      if (data.success && data.data.length > 0) {
        setCafes(data.data);
        setFilteredCafes(data.data);
      }
    } catch (error) {
      console.log('Using static cafe data');
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
            <p className="text-3xl font-bold text-primary">16+</p>
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
