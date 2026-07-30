'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import CafeCard from '../components/CafeCard';
import ChatWidget from '../components/ChatWidget';
import { resolveCafeImageUrl } from '../lib/imageStorage';

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
    rating: 4.8,
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
    rating: 4.8,
    priceRange: "$$",
    facilities: ["WiFi Cepat", "AC", "Meeting Room", "Workspace", "Parking"],
    openHours: "07:00 - 23:00",
    image: "/postropis-coffee-space.png",
    mapsLink: "https://maps.app.goo.gl/z1m3AJjDsM5HotvXA"
  },
  {
    _id: '4',
    name: "1997 Coffee",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interior clean minimalis dengan nuansa abu-abu modern, cocok buat nongkrong santai dan foto aesthetic di area Panakkukang.",
    address: "Jalan Bougenville, Masale, Panakkukang, Makassar",
    category: "aesthetic",
    rating: 5.0,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/1997-coffee.png",
    mapsLink: "https://maps.app.goo.gl/qxGm2D5hxpji4ZNE7"
  },
  {
    _id: '5',
    name: "EIGHTEEN Eatery",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interior warm dan clean dengan sentuhan kayu, cocok untuk nongkrong, makan, dan foto aesthetic di area Maricaya.",
    address: "Jalan Rusa, Maricaya, Makassar",
    category: "aesthetic",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Dining Area", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/eighteen-eatery.png",
    mapsLink: "https://maps.app.goo.gl/1Tox751B86ugr9SPA"
  },
  {
    _id: '6',
    name: "Mark Trees Cafe",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interior hangat dengan dominasi kayu dan suasana cozy, cocok buat nongkrong santai, ngobrol, dan foto aesthetic di area Ujung Pandang.",
    address: "Jalan G. Batu Putih, Mangkura, Ujung Pandang, Makassar",
    category: "aesthetic",
    rating: 4.7,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/mark-trees-cafe.png",
    mapsLink: "https://maps.app.goo.gl/N8VvVz4BdFf2bM6EA"
  },
  {
    _id: '7',
    name: "Aynaka Coffee Racing Centre",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya semi-outdoor dengan banyak tanaman dan suasana santai, cocok untuk nongkrong malam, ngopi, dan foto aesthetic di area Panakkukang.",
    address: "Jalan Btn Gaedenia, Karampuang, Panakkukang, Makassar",
    category: "outdoor",
    rating: 4.5,
    priceRange: "$$",
    facilities: ["Outdoor Seating", "Indoor Seating", "WiFi", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/aynaka-coffee-racing-centre.png",
    mapsLink: "https://maps.app.goo.gl/eTQvkpYFTBk4Wt2b6"
  },
  {
    _id: '8',
    name: "SIJA PETTARANI",
    description: "Cafe real dari link Google Maps yang kamu kirim. Konsepnya clean industrial dengan nuansa abu-abu modern, cocok untuk nongkrong santai, kerja ringan, dan foto aesthetic di area Pettarani.",
    address: "Jl. Andi Pangeran Pettarani 3, Tamamaung, Panakkukang, Makassar",
    category: "aesthetic",
    rating: 4.8,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/sija-pettarani.png",
    mapsLink: "https://maps.app.goo.gl/MoZJk7KHMZEkJKwC7"
  },
  {
    _id: '9',
    name: "Monochrome Cafe",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interior hitam-putih yang unik dan estetik, cocok untuk nongkrong, foto, dan makan santai di area Maricaya Baru.",
    address: "Jalan Bulukunyi, Maricaya Baru, Makassar",
    category: "aesthetic",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Dining Area", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/monochrome-cafe.png",
    mapsLink: "https://maps.app.goo.gl/pqokGk6spA9nc2rX9"
  },
  {
    _id: '10',
    name: "Crematology X Makassar",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interior modern dengan pencahayaan hangat dan area duduk cozy, cocok untuk nongkrong santai, ngopi, dan foto aesthetic di area Tanjung Bunga.",
    address: "Phinisi Point, Jalan Metro Tanjung Bunga, Lette, Mariso, Makassar",
    category: "aesthetic",
    rating: 4.5,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/crematology-x-makassar.png",
    mapsLink: "https://maps.app.goo.gl/teyyEnidH9w6HkNs6"
  },
  {
    _id: '11',
    name: "STORIAMO COFFE AND ROASTERY",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya rindang dengan area duduk santai dan nuansa cozy, cocok untuk nongkrong, kerja ringan, dan foto aesthetic di area Masale.",
    address: "Topaz Lorong 2, Masale, Panakkukang, Makassar",
    category: "aesthetic",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["Indoor Seating", "Outdoor Seating", "WiFi", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/storiamo-coffe-and-roastery.png",
    mapsLink: "https://maps.app.goo.gl/2Tj3tikM2qViMKkv9"
  },
  {
    _id: '12',
    name: "Cafe Aestetic Dimakassar",
    description: "Cafe real dari link Google Maps yang kamu kirim. Konsepnya clean minimalis dengan area semi-outdoor, cocok untuk nongkrong malam, santai, dan foto aesthetic di area Manggala.",
    address: "Bitoa, Manggala, Makassar",
    category: "aesthetic",
    rating: 5.0,
    priceRange: "$$",
    facilities: ["Semi Outdoor", "Indoor Seating", "WiFi", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/cafe-aestetic-dimakassar.png",
    mapsLink: "https://maps.app.goo.gl/R66DTUCD6LNybUR99"
  },
  {
    _id: '13',
    name: "Bangi Cafe Sunset CPI",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya cocok untuk menikmati sunset dengan view laut CPI, suasana santai, dan spot foto yang aesthetic di area Mariso.",
    address: "Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "outdoor",
    rating: 4.2,
    priceRange: "$$",
    facilities: ["Sea View", "Outdoor Seating", "Sunset Spot", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/bangi-cafe-sunset-cpi.png",
    mapsLink: "https://maps.app.goo.gl/faWz8Pj8EvjMR2EA8"
  },
  {
    _id: '14',
    name: "THE ICON BEACH LOUNGE & CAFE",
    description: "Cafe real dari link Google Maps yang kamu kirim. Beach lounge dengan suasana senja yang cantik, cocok untuk nongkrong, menikmati view laut, dan foto aesthetic di area CPI.",
    address: "Lego-Lego, Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "outdoor",
    rating: 4.6,
    priceRange: "$$$",
    facilities: ["Sea View", "Outdoor Seating", "Indoor Seating", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/the-icon-beach-lounge-cafe.png",
    mapsLink: "https://maps.app.goo.gl/EBfsuXrPBguUPEC28"
  },
  {
    _id: '15',
    name: "Gravity Sky Lounge",
    description: "Cafe real dari link Google Maps yang kamu kirim. Sky lounge dengan view laut dari ketinggian, cocok untuk sunset, nongkrong malam, dan foto aesthetic di area Ujung Pandang.",
    address: "Swiss-BelHotel Makassar, Jalan Ujung Pandang 12, Bulogading, Ujung Pandang, Makassar",
    category: "rooftop",
    rating: 4.7,
    priceRange: "$$$",
    facilities: ["Sea View", "Indoor Seating", "Sky Lounge", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/gravity-sky-lounge.png",
    mapsLink: "https://maps.app.goo.gl/1dfn1A24eyuHxtrB8"
  },
  {
    _id: '16',
    name: "COASTLINE Cafe",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya modern dan estetik dengan nuansa tepi laut CPI, cocok untuk nongkrong santai, menikmati sunset, dan foto aesthetic di area Mariso.",
    address: "Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "outdoor",
    rating: 4.4,
    priceRange: "$$",
    facilities: ["Sea View", "Indoor Seating", "Outdoor Seating", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/coastline-cafe.png",
    mapsLink: "https://maps.app.goo.gl/YtmYUR94N4nBMWNW9"
  },
  {
    _id: '17',
    name: "Center Point Cafe",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya punya view area CPI yang luas, cocok untuk nongkrong sore, menikmati suasana pantai, dan foto aesthetic di area Mariso.",
    address: "Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "outdoor",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["Sea View", "Outdoor Seating", "Sunset Spot", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/center-point-cafe.png",
    mapsLink: "https://maps.app.goo.gl/5LJyqJ2YJcYLtDk47"
  },
  {
    _id: '18',
    name: "Negeri Sembilan Melayu's Signature & Coffee",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interiornya elegan dan bersih dengan nuansa melayu modern, cocok untuk nongkrong, makan, dan foto aesthetic di area CPI.",
    address: "Lego-Lego, Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "aesthetic",
    rating: 4.9,
    priceRange: "$$$",
    facilities: ["Indoor Seating", "Dining Area", "AC", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/negeri-sembilan-signature-coffee.png",
    mapsLink: "https://maps.app.goo.gl/mMjNnEQy3NxNMrZE7"
  },
  {
    _id: '19',
    name: "Seroeni - Sunset Quay",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya elegan dengan suasana sunset di area Sunset Quay, cocok untuk nongkrong santai, makan, dan foto aesthetic di CPI.",
    address: "Lego-Lego, Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "outdoor",
    rating: 4.9,
    priceRange: "$$$",
    facilities: ["Sea View", "Outdoor Seating", "Indoor Seating", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/seroeni-sunset-quay.png",
    mapsLink: "https://maps.app.goo.gl/aQ6iWB97u3cEhgB87"
  },
  {
    _id: '20',
    name: "Ballairate",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interiornya clean dan nyaman dengan nuansa hotel lounge, cocok untuk nongkrong santai, meeting ringan, dan foto aesthetic di area Ujung Pandang.",
    address: "Swiss-BelHotel Makassar, Jalan Ujung Pandang 12, Bulogading, Ujung Pandang, Makassar",
    category: "aesthetic",
    rating: 4.4,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/ballairate.png",
    mapsLink: "https://maps.app.goo.gl/Xpng9ALfLSo7J6HS7"
  },
  {
    _id: '21',
    name: "Kultur Haus Sunset Quay",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interiornya estetik dengan sentuhan hijau dan kayu, cocok untuk nongkrong santai, ngopi, dan foto aesthetic di area Sunset Quay CPI.",
    address: "Lego-Lego, Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "aesthetic",
    rating: 4.6,
    priceRange: "$$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/kultur-haus-sunset-quay.png",
    mapsLink: "https://maps.app.goo.gl/xNa1NUXsFRfGJuAu6"
  },
  {
    _id: '22',
    name: "Fore Coffee - Sunset Quay",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya clean modern khas Fore dengan suasana CPI, cocok untuk nongkrong santai, ngopi cepat, dan foto aesthetic di area Sunset Quay.",
    address: "Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "aesthetic",
    rating: 4.2,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/fore-coffee-sunset-quay.png",
    mapsLink: "https://maps.app.goo.gl/QfxFZk9LtekmsYRt8"
  },
  {
    _id: '23',
    name: "Wam's Coffee",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya cozy dengan nuansa industrial hangat, cocok untuk nongkrong malam, ngopi, dan foto aesthetic di area Manggala.",
    address: "Jalan Inspeksi Kanal Puri Borong Raya, Borong, Manggala, Makassar",
    category: "aesthetic",
    rating: 4.9,
    priceRange: "$$",
    facilities: ["Indoor Seating", "Outdoor Seating", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/wams-coffee.png",
    mapsLink: "https://maps.app.goo.gl/VzEJ1wFr869z2vts9"
  },
  {
    _id: '24',
    name: "Utata Space",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interiornya luas dan industrial modern, cocok untuk nongkrong, kerja ringan, dan foto aesthetic di area Manggala.",
    address: "Bitoa, Manggala, Makassar",
    category: "aesthetic",
    rating: 4.4,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Workspace", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/utata-space.png",
    mapsLink: "https://maps.app.goo.gl/EfyNNJuhDpHZWMmQ6"
  },
  {
    _id: '25',
    name: "Warkop Phoenam",
    description: "Warkop legendaris Makassar sejak 1946. Kopi tubruk khas Makassar dan roti bakar yang jadi ikon kuliner kota.",
    address: "Jl. Sulawesi No. 14, Makassar",
    category: "traditional",
    rating: 4.6,
    priceRange: "$",
    facilities: ["Outdoor Seating", "Traditional Coffee", "Parking", "24 Jam"],
    openHours: "24 Jam",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop"
  },
  {
    _id: '26',
    name: "Beyours Coffee & Space",
    description: "Cafe dengan interior kayu yang hangat dan cozy, cocok untuk ngopi santai dan nongkrong dengan nuansa rustic yang nyaman.",
    address: "Makassar",
    category: "aesthetic",
    rating: 4.5,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/beyours-coffee-space.png",
    mapsLink: "https://maps.app.goo.gl/ncXZq8ZXQ6D5TrAq6"
  },
  {
    _id: '27',
    name: "REAL CAFE",
    description: "Cafe dengan konsep industrial yang unik dan autentik, cocok untuk nongkrong malam dengan suasana yang berbeda dan raw.",
    address: "Makassar",
    category: "aesthetic",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["Indoor Seating", "Outdoor Seating", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/real-cafe.png",
    mapsLink: "https://maps.app.goo.gl/g3dNnR2c69Zw5oLk8"
  },
  {
    name: "KOPIKU",
    description: "Cafe kopi dengan neon sign khas yang ikonik, cocok untuk nongkrong malam dengan suasana casual dan ramai. Tempatnya sederhana tapi selalu rame pengunjung.",
    address: "Makassar",
    category: "aesthetic",
    rating: 4.9,
    priceRange: "$$",
    facilities: ["Indoor Seating", "Outdoor Seating", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/kopiku.jpg",
    mapsLink: "https://maps.app.goo.gl/JG3nB6FziCDu8dzZ9"
  },
  {
    name: "THEMA",
    description: "Cafe modern dengan interior industrial minimalis, dilengkapi TV layar besar, cocok untuk nongkrong santai sambil nonton atau kerja.",
    address: "Makassar",
    category: "coworking",
    rating: 4.7,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "WiFi", "TV Screen", "Coffee Bar"],
    openHours: "Cek jam buka di Google Maps",
    image: "/thema.jpg",
    mapsLink: "https://maps.app.goo.gl/rZ2PwgNQ7KYBbA57A"
  },
  {
    name: "TOMORO COFFEE",
    description: "Cafe kopi chain modern dengan konsep clean dan minimalis, cocok untuk ngopi cepat, kerja, dan nongkrong santai dengan kopi berkualitas.",
    address: "Makassar",
    category: "aesthetic",
    rating: 4.9,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "WiFi", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/tomoro-coffee.jpg",
    mapsLink: "https://maps.app.goo.gl/XnqvaoTVWZwQJtaXA"
  },
  {
    name: "Eksposed 3.0 Signature Pettarani",
    description: "Cafe modern dua lantai dengan konsep industrial dan rooftop terbuka, cocok untuk nongkrong, foto aesthetic, dan menikmati suasana sore di area Pettarani.",
    address: "Jalan A.P. Pettarani, Makassar",
    category: "rooftop",
    rating: 4.5,
    priceRange: "$$",
    facilities: ["Indoor Seating", "Outdoor Seating", "AC", "WiFi", "Parking", "Rooftop"],
    openHours: "Cek jam buka di Google Maps",
    image: "/eksposed-pettarani.jpg",
    mapsLink: "https://maps.app.goo.gl/7SownMCEJPrFx36U8"
  },
  {
    name: "VENDOR COFFEE",
    description: "Cafe aesthetic dengan interior kayu hangat dan neon sign elegan, cocok untuk ngopi santai dan foto aesthetic.",
    address: "Makassar",
    category: "aesthetic",
    rating: 4.8,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "WiFi"],
    openHours: "Cek jam buka di Google Maps",
    image: "/vendor-coffee.jpg",
    mapsLink: "https://maps.app.goo.gl/KXnTFVFziugUWwxy9"
  },
  {
    name: "Monolith Coffee",
    description: "Cafe dengan arsitektur unik bergaya heritage, cocok untuk ngopi santai dan foto aesthetic dengan nuansa kolonial yang elegan.",
    address: "Makassar",
    category: "aesthetic",
    rating: 4.7,
    priceRange: "$$",
    facilities: ["Indoor Seating", "Outdoor Seating", "AC", "Coffee Bar", "WiFi", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/monolith-coffee.jpg",
    mapsLink: "https://maps.app.goo.gl/TibXk1eQnwWsu1XR7"
  },
  {
    name: "Aksen Cafe",
    description: "Cafe Coffee & Eatery dengan konsep bersih dan minimalis, cocok untuk ngopi santai dan makan ringan di suasana yang nyaman.",
    address: "Makassar",
    category: "aesthetic",
    rating: 5.0,
    priceRange: "$$",
    facilities: ["Indoor Seating", "Outdoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/aksen-cafe.jpg",
    mapsLink: "https://maps.app.goo.gl/JrFe2oAb2oLBb1sG8"
  },
  {
    name: "MAUKI",
    description: "Cafe malam dengan bangunan dua lantai megah, lampu string yang hangat, dan nuansa industrial modern. Cocok untuk nongkrong malam dan foto aesthetic.",
    address: "Makassar",
    category: "outdoor",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["Indoor Seating", "Outdoor Seating", "AC", "Coffee Bar", "WiFi", "Parking", "Live Music"],
    openHours: "Cek jam buka di Google Maps",
    image: "/mauki.jpg",
    mapsLink: "https://maps.app.goo.gl/Dh95SiFuaiqLLQCf9"
  }
].map(cafe => ({
  ...cafe,
  image: resolveCafeImageUrl(cafe.image),
}));

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
        const cafesWithResolvedImages = data.data.map(cafe => ({
          ...cafe,
          image: resolveCafeImageUrl(cafe.image),
        }));
        setCafes(cafesWithResolvedImages);
        setFilteredCafes(cafesWithResolvedImages);
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
