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
    location: { lat: -5.1480, lng: 119.4200 }
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
