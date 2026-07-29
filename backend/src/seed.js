require('dotenv').config();
const mongoose = require('mongoose');
const Cafe = require('./models/Cafe');

const cafes = [
  {
    name: "Goodfields Makassar",
    description: "Cafe aesthetic real dari link Google Maps yang kamu kirim. Cocok untuk nongkrong santai dengan interior modern dan suasana nyaman di area Ujung Pandang.",
    address: "Jalan Chairil Anwar, Sawerigading, Ujung Pandang, Makassar",
    category: "aesthetic",
    rating: 4.7,
    priceRange: "$$",
    facilities: ["WiFi", "AC", "Smoking Area", "Meeting Room", "Live Music"],
    openHours: "09:00 - 24:00",
    image: "/goodfields-makassar.png",
    mapsLink: "https://maps.app.goo.gl/j6uMYGuWDQusQmhL9",
    location: { lat: -5.1395574, lng: 119.4107145 }
  },
  {
    name: "Duft Coffee Indonesia",
    description: "Cafe real dari link Google Maps yang kamu kirim. Vibenya hangat dengan dominasi kayu, cocok untuk nongkrong santai dan ngopi di area Panakkukang.",
    address: "Jalan A.P. Pettarani, Tamamaung, Panakkukang, Makassar",
    category: "aesthetic",
    rating: 4.8,
    priceRange: "$$",
    facilities: ["WiFi", "AC", "Coffee Bar", "Indoor Seating", "Parking"],
    openHours: "10:00 - 01:00",
    image: "/duft-coffee-indonesia.png",
    mapsLink: "https://maps.app.goo.gl/QGPTcSpqvfukdRhz6",
    location: { lat: -5.1479834, lng: 119.4385163 }
  },
  {
    name: "Postropis Coffee & Space",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya luas, modern, dan cocok untuk kerja, meeting, atau nongkrong di area Panakkukang.",
    address: "Jalan Adipura Raya, Karuwisi Utara, Panakkukang, Makassar",
    category: "coworking",
    rating: 4.8,
    priceRange: "$$",
    facilities: ["WiFi Cepat", "AC", "Meeting Room", "Workspace", "Parking"],
    openHours: "07:00 - 23:00",
    image: "/postropis-coffee-space.png",
    mapsLink: "https://maps.app.goo.gl/z1m3AJjDsM5HotvXA",
    location: { lat: -5.1329919, lng: 119.4332702 }
  },
  {
    name: "1997 Coffee",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interior clean minimalis dengan nuansa abu-abu modern, cocok buat nongkrong santai dan foto aesthetic di area Panakkukang.",
    address: "Jalan Bougenville, Masale, Panakkukang, Makassar",
    category: "aesthetic",
    rating: 5.0,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/1997-coffee.png",
    mapsLink: "https://maps.app.goo.gl/qxGm2D5hxpji4ZNE7",
    location: { lat: -5.1584325, lng: 119.4447899 }
  },
  {
    name: "EIGHTEEN Eatery",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interior warm dan clean dengan sentuhan kayu, cocok untuk nongkrong, makan, dan foto aesthetic di area Maricaya.",
    address: "Jalan Rusa, Maricaya, Makassar",
    category: "aesthetic",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Dining Area", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/eighteen-eatery.png",
    mapsLink: "https://maps.app.goo.gl/1Tox751B86ugr9SPA",
    location: { lat: -5.15163, lng: 119.4216345 }
  },
  {
    name: "Mark Trees Cafe",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interior hangat dengan dominasi kayu dan suasana cozy, cocok buat nongkrong santai, ngobrol, dan foto aesthetic di area Ujung Pandang.",
    address: "Jalan G. Batu Putih, Mangkura, Ujung Pandang, Makassar",
    category: "aesthetic",
    rating: 4.7,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/mark-trees-cafe.png",
    mapsLink: "https://maps.app.goo.gl/N8VvVz4BdFf2bM6EA",
    location: { lat: -5.1469113, lng: 119.4159946 }
  },
  {
    name: "Aynaka Coffee Racing Centre",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya semi-outdoor dengan banyak tanaman dan suasana santai, cocok untuk nongkrong malam, ngopi, dan foto aesthetic di area Panakkukang.",
    address: "Jalan Btn Gaedenia, Karampuang, Panakkukang, Makassar",
    category: "outdoor",
    rating: 4.5,
    priceRange: "$$",
    facilities: ["Outdoor Seating", "Indoor Seating", "WiFi", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/aynaka-coffee-racing-centre.png",
    mapsLink: "https://maps.app.goo.gl/eTQvkpYFTBk4Wt2b6",
    location: { lat: -5.1458728, lng: 119.4502153 }
  },
  {
    name: "SIJA PETTARANI",
    description: "Cafe real dari link Google Maps yang kamu kirim. Konsepnya clean industrial dengan nuansa abu-abu modern, cocok untuk nongkrong santai, kerja ringan, dan foto aesthetic di area Pettarani.",
    address: "Jl. Andi Pangeran Pettarani 3, Tamamaung, Panakkukang, Makassar",
    category: "aesthetic",
    rating: 4.8,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/sija-pettarani.png",
    mapsLink: "https://maps.app.goo.gl/MoZJk7KHMZEkJKwC7",
    location: { lat: -5.1467249, lng: 119.4393314 }
  },
  {
    name: "Monochrome Cafe",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interior hitam-putih yang unik dan estetik, cocok untuk nongkrong, foto, dan makan santai di area Maricaya Baru.",
    address: "Jalan Bulukunyi, Maricaya Baru, Makassar",
    category: "aesthetic",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Dining Area", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/monochrome-cafe.png",
    mapsLink: "https://maps.app.goo.gl/pqokGk6spA9nc2rX9",
    location: { lat: -5.1471521, lng: 119.4216883 }
  },
  {
    name: "Crematology X Makassar",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interior modern dengan pencahayaan hangat dan area duduk cozy, cocok untuk nongkrong santai, ngopi, dan foto aesthetic di area Tanjung Bunga.",
    address: "Phinisi Point, Jalan Metro Tanjung Bunga, Lette, Mariso, Makassar",
    category: "aesthetic",
    rating: 4.5,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/crematology-x-makassar.png",
    mapsLink: "https://maps.app.goo.gl/teyyEnidH9w6HkNs6",
    location: { lat: -5.1521777, lng: 119.4041426 }
  },
  {
    name: "STORIAMO COFFE AND ROASTERY",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya rindang dengan area duduk santai dan nuansa cozy, cocok untuk nongkrong, kerja ringan, dan foto aesthetic di area Masale.",
    address: "Topaz Lorong 2, Masale, Panakkukang, Makassar",
    category: "aesthetic",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["Indoor Seating", "Outdoor Seating", "WiFi", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/storiamo-coffe-and-roastery.png",
    mapsLink: "https://maps.app.goo.gl/2Tj3tikM2qViMKkv9",
    location: { lat: -5.153884, lng: 119.4394774 }
  },
  {
    name: "Cafe Aestetic Dimakassar",
    description: "Cafe real dari link Google Maps yang kamu kirim. Konsepnya clean minimalis dengan area semi-outdoor, cocok untuk nongkrong malam, santai, dan foto aesthetic di area Manggala.",
    address: "Bitoa, Manggala, Makassar",
    category: "aesthetic",
    rating: 5.0,
    priceRange: "$$",
    facilities: ["Semi Outdoor", "Indoor Seating", "WiFi", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/cafe-aestetic-dimakassar.png",
    mapsLink: "https://maps.app.goo.gl/R66DTUCD6LNybUR99",
    location: { lat: -5.165512, lng: 119.4713769 }
  },
  {
    name: "Bangi Cafe Sunset CPI",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya cocok untuk menikmati sunset dengan view laut CPI, suasana santai, dan spot foto yang aesthetic di area Mariso.",
    address: "Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "outdoor",
    rating: 4.2,
    priceRange: "$$",
    facilities: ["Sea View", "Outdoor Seating", "Sunset Spot", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/bangi-cafe-sunset-cpi.png",
    mapsLink: "https://maps.app.goo.gl/faWz8Pj8EvjMR2EA8",
    location: { lat: -5.1498068, lng: 119.3940483 }
  },
  {
    name: "THE ICON BEACH LOUNGE & CAFE",
    description: "Cafe real dari link Google Maps yang kamu kirim. Beach lounge dengan suasana senja yang cantik, cocok untuk nongkrong, menikmati view laut, dan foto aesthetic di area CPI.",
    address: "Lego-Lego, Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "outdoor",
    rating: 4.6,
    priceRange: "$$$",
    facilities: ["Sea View", "Outdoor Seating", "Indoor Seating", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/the-icon-beach-lounge-cafe.png",
    mapsLink: "https://maps.app.goo.gl/EBfsuXrPBguUPEC28",
    location: { lat: -5.147356, lng: 119.395425 }
  },
  {
    name: "Gravity Sky Lounge",
    description: "Cafe real dari link Google Maps yang kamu kirim. Sky lounge dengan view laut dari ketinggian, cocok untuk sunset, nongkrong malam, dan foto aesthetic di area Ujung Pandang.",
    address: "Swiss-BelHotel Makassar, Jalan Ujung Pandang 12, Bulogading, Ujung Pandang, Makassar",
    category: "rooftop",
    rating: 4.7,
    priceRange: "$$$",
    facilities: ["Sea View", "Indoor Seating", "Sky Lounge", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/gravity-sky-lounge.png",
    mapsLink: "https://maps.app.goo.gl/1dfn1A24eyuHxtrB8",
    location: { lat: -5.136002, lng: 119.4043688 }
  },
  {
    name: "COASTLINE Cafe",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya modern dan estetik dengan nuansa tepi laut CPI, cocok untuk nongkrong santai, menikmati sunset, dan foto aesthetic di area Mariso.",
    address: "Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "outdoor",
    rating: 4.4,
    priceRange: "$$",
    facilities: ["Sea View", "Indoor Seating", "Outdoor Seating", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/coastline-cafe.png",
    mapsLink: "https://maps.app.goo.gl/YtmYUR94N4nBMWNW9",
    location: { lat: -5.148991, lng: 119.393503 }
  },
  {
    name: "Center Point Cafe",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya punya view area CPI yang luas, cocok untuk nongkrong sore, menikmati suasana pantai, dan foto aesthetic di area Mariso.",
    address: "Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "outdoor",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["Sea View", "Outdoor Seating", "Sunset Spot", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/center-point-cafe.png",
    mapsLink: "https://maps.app.goo.gl/5LJyqJ2YJcYLtDk47",
    location: { lat: -5.148242, lng: 119.3957857 }
  },
  {
    name: "Negeri Sembilan Melayu's Signature & Coffee",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interiornya elegan dan bersih dengan nuansa melayu modern, cocok untuk nongkrong, makan, dan foto aesthetic di area CPI.",
    address: "Lego-Lego, Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "aesthetic",
    rating: 4.9,
    priceRange: "$$$",
    facilities: ["Indoor Seating", "Dining Area", "AC", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/negeri-sembilan-signature-coffee.png",
    mapsLink: "https://maps.app.goo.gl/mMjNnEQy3NxNMrZE7",
    location: { lat: -5.1476032, lng: 119.3952551 }
  },
  {
    name: "Seroeni - Sunset Quay",
    description: "Cafe real dari link Google Maps yang kamu kirim. Tempatnya elegan dengan suasana sunset di area Sunset Quay, cocok untuk nongkrong santai, makan, dan foto aesthetic di CPI.",
    address: "Lego-Lego, Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "outdoor",
    rating: 4.9,
    priceRange: "$$$",
    facilities: ["Sea View", "Outdoor Seating", "Indoor Seating", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/seroeni-sunset-quay.png",
    mapsLink: "https://maps.app.goo.gl/aQ6iWB97u3cEhgB87",
    location: { lat: -5.1470229, lng: 119.3959728 }
  },
  {
    name: "Ballairate",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interiornya clean dan nyaman dengan nuansa hotel lounge, cocok untuk nongkrong santai, meeting ringan, dan foto aesthetic di area Ujung Pandang.",
    address: "Swiss-BelHotel Makassar, Jalan Ujung Pandang 12, Bulogading, Ujung Pandang, Makassar",
    category: "aesthetic",
    rating: 4.4,
    priceRange: "$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/ballairate.png",
    mapsLink: "https://maps.app.goo.gl/Xpng9ALfLSo7J6HS7",
    location: { lat: -5.1365371, lng: 119.4037076 }
  },
  {
    name: "Kultur Haus Sunset Quay",
    description: "Cafe real dari link Google Maps yang kamu kirim. Interiornya estetik dengan sentuhan hijau dan kayu, cocok untuk nongkrong santai, ngopi, dan foto aesthetic di area Sunset Quay CPI.",
    address: "Lego-Lego, Centre Point of Indonesia (CPI), Panambungan, Mariso, Makassar",
    category: "aesthetic",
    rating: 4.6,
    priceRange: "$$$",
    facilities: ["Indoor Seating", "AC", "Coffee Bar", "Parking"],
    openHours: "Cek jam buka di Google Maps",
    image: "/kultur-haus-sunset-quay.png",
    mapsLink: "https://maps.app.goo.gl/xNa1NUXsFRfGJuAu6",
    location: { lat: -5.1473483, lng: 119.3956325 }
  },
  {
    name: "Warkop Phoenam",
    description: "Warkop legendaris Makassar sejak 1946. Kopi tubruk khas Makassar dan roti bakar ikon kuliner kota.",
    address: "Jl. Sulawesi No. 14, Makassar",
    category: "traditional",
    rating: 4.6,
    priceRange: "$",
    facilities: ["Outdoor Seating", "Traditional Coffee", "Parking", "24 Jam"],
    openHours: "24 Jam",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop",
    location: { lat: -5.1380, lng: 119.4100 }
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe_makassar');
    console.log('Connected to MongoDB');
    
    await Cafe.deleteMany({});
    console.log('Cleared existing cafes');
    
    await Cafe.insertMany(cafes);
    console.log(`✅ Seeded ${cafes.length} cafes`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
