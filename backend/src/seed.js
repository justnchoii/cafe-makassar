require('dotenv').config();
const mongoose = require('mongoose');
const Cafe = require('./models/Cafe');

const cafes = [
  {
    name: "Dottore Coffee",
    description: "Cafe aesthetic dengan interior industrial modern dan kopi specialty. Tempat favorit untuk foto-foto dan work from cafe.",
    address: "Jl. Penghibur No. 15, Losari, Makassar",
    category: "aesthetic",
    rating: 4.7,
    priceRange: "$$",
    facilities: ["WiFi", "AC", "Smoking Area", "Meeting Room", "Live Music"],
    openHours: "09:00 - 24:00",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
    location: { lat: -5.1477, lng: 119.4327 }
  },
  {
    name: "Kalaras Coffee & Eatery",
    description: "Rooftop cafe dengan pemandangan sunset pantai Losari yang memukau. Menu lengkap dari kopi hingga makanan berat.",
    address: "Jl. Metro Tanjung Bunga, Makassar",
    category: "rooftop",
    rating: 4.5,
    priceRange: "$$$",
    facilities: ["WiFi", "Rooftop", "Parking", "Live Music", "Full Kitchen"],
    openHours: "10:00 - 01:00",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    location: { lat: -5.1589, lng: 119.3891 }
  },
  {
    name: "Kultura Coffee",
    description: "Cafe coworking space bernuansa budaya Makassar. Cocok untuk bekerja dengan suasana tenang dan kopi lokal.",
    address: "Jl. A.P. Pettarani No. 88, Makassar",
    category: "coworking",
    rating: 4.6,
    priceRange: "$$",
    facilities: ["WiFi Cepat", "AC", "Stop Kontak", "Meeting Room", "Printer"],
    openHours: "07:00 - 23:00",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    location: { lat: -5.1520, lng: 119.4380 }
  },
  {
    name: "Warung Kopi Daeng",
    description: "Kedai kopi tradisional Makassar dengan kopi Toraja asli. Suasana hangat dan harga terjangkau.",
    address: "Jl. Somba Opu No. 200, Makassar",
    category: "traditional",
    rating: 4.3,
    priceRange: "$",
    facilities: ["Outdoor Seating", "Parking", "Traditional Snacks"],
    openHours: "06:00 - 22:00",
    image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=400&fit=crop",
    location: { lat: -5.1398, lng: 119.4089 }
  },
  {
    name: "The Garden Cafe",
    description: "Cafe outdoor dengan taman hijau yang asri. Spot instagramable dan menu healthy food.",
    address: "Jl. Boulevard, Panakkukang, Makassar",
    category: "outdoor",
    rating: 4.4,
    priceRange: "$$",
    facilities: ["WiFi", "Garden", "Parking", "Pet Friendly", "Kids Area"],
    openHours: "08:00 - 22:00",
    image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&h=400&fit=crop",
    location: { lat: -5.1560, lng: 119.4440 }
  },
  {
    name: "Nara Coffee & Kitchen",
    description: "Cafe minimalis Jepang dengan menu fusion. Interior clean dan instagramable, cocok buat nongkrong santai.",
    address: "Jl. Hertasning No. 52, Makassar",
    category: "aesthetic",
    rating: 4.8,
    priceRange: "$$",
    facilities: ["WiFi", "AC", "Instagram Spot", "Dessert Bar"],
    openHours: "10:00 - 23:00",
    image: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop",
    location: { lat: -5.1645, lng: 119.4512 }
  },
  {
    name: "Sky Lounge Makassar",
    description: "Rooftop lounge di lantai 20 dengan view 360° kota Makassar. Premium coffee dan cocktails.",
    address: "Jl. Jend. Sudirman No. 1, Makassar",
    category: "rooftop",
    rating: 4.6,
    priceRange: "$$$",
    facilities: ["WiFi", "AC", "Bar", "Live DJ", "VIP Room"],
    openHours: "15:00 - 02:00",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop",
    location: { lat: -5.1350, lng: 119.4100 }
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
