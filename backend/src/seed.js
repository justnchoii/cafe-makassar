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
    name: "Digital Nomad Hub",
    description: "Co-working cafe 24 jam untuk digital nomad. Internet super cepat dan ruang kerja nyaman.",
    address: "Jl. Ratulangi No. 33, Makassar",
    category: "coworking",
    rating: 4.5,
    priceRange: "$$",
    facilities: ["WiFi 100Mbps", "AC", "Locker", "Shower", "Nap Room", "24 Jam"],
    openHours: "24 Jam",
    image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&h=400&fit=crop",
    location: { lat: -5.1480, lng: 119.4200 }
  },
  {
    name: "Losari Beach Coffee",
    description: "Cafe tepi pantai Losari dengan view sunset terbaik di Makassar. Sajian kopi dan pisang epe khas Makassar.",
    address: "Jl. Penghibur, Pantai Losari, Makassar",
    category: "outdoor",
    rating: 4.7,
    priceRange: "$",
    facilities: ["Outdoor Seating", "Sea View", "Parking", "Traditional Food"],
    openHours: "07:00 - 23:00",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    location: { lat: -5.1400, lng: 119.4050 }
  },
  {
    name: "Kopi Lain Hati Makassar",
    description: "Cafe hits dengan konsep aesthetic modern dan harga terjangkau. Menu kopi susu dan snack untuk mahasiswa.",
    address: "Jl. Urip Sumoharjo No. 120, Makassar",
    category: "aesthetic",
    rating: 4.2,
    priceRange: "$",
    facilities: ["WiFi", "AC", "Instagram Spot", "Parking"],
    openHours: "10:00 - 24:00",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
    location: { lat: -5.1550, lng: 119.4500 }
  },
  {
    name: "Fort Rotterdam Cafe",
    description: "Cafe berkonsep heritage di dekat Benteng Rotterdam. Nuansa kolonial dengan sentuhan budaya Makassar.",
    address: "Jl. Ujung Pandang No. 1, Makassar",
    category: "traditional",
    rating: 4.4,
    priceRange: "$$",
    facilities: ["WiFi", "Heritage View", "Outdoor", "Museum Nearby"],
    openHours: "08:00 - 22:00",
    image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&h=400&fit=crop",
    location: { lat: -5.1340, lng: 119.4060 }
  },
  {
    name: "Maleo Coffee Roasters",
    description: "Specialty coffee roaster dengan biji kopi Sulawesi Selatan pilihan. Single origin Toraja dan Enrekang.",
    address: "Jl. Bonto Lempangan No. 8, Makassar",
    category: "aesthetic",
    rating: 4.9,
    priceRange: "$$",
    facilities: ["WiFi", "AC", "Roasting Demo", "Coffee Cupping", "Workshop"],
    openHours: "09:00 - 22:00",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
    location: { lat: -5.1500, lng: 119.4350 }
  },
  {
    name: "Panorama Rooftop Bar",
    description: "Sky bar & cafe di hotel bintang 5 dengan panorama kota dan laut. Cocktail signature dan tapas premium.",
    address: "Jl. Andi Djemma No. 5, Makassar",
    category: "rooftop",
    rating: 4.7,
    priceRange: "$$$",
    facilities: ["WiFi", "AC", "Premium Bar", "Live Band", "Private Dining"],
    openHours: "16:00 - 02:00",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
    location: { lat: -5.1450, lng: 119.4250 }
  },
  {
    name: "Green Space Co-Working",
    description: "Coworking cafe dengan konsep hijau dan sustainable. Tanaman indoor dan menu organic coffee.",
    address: "Jl. Perintis Kemerdekaan KM 12, Makassar",
    category: "coworking",
    rating: 4.3,
    priceRange: "$$",
    facilities: ["WiFi Cepat", "AC", "Standing Desk", "Phone Booth", "Projector"],
    openHours: "07:00 - 23:00",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
    location: { lat: -5.1600, lng: 119.4800 }
  },
  {
    name: "Taman Sari Coffee House",
    description: "Cafe di taman kota yang teduh dengan live acoustic setiap Jumat-Sabtu malam dan menu nusantara.",
    address: "Jl. Kakatua No. 18, Makassar",
    category: "outdoor",
    rating: 4.5,
    priceRange: "$",
    facilities: ["Garden Seating", "Live Acoustic", "Parking", "Kids Playground"],
    openHours: "08:00 - 23:00",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop",
    location: { lat: -5.1430, lng: 119.4150 }
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
