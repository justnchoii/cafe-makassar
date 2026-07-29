# Cafe Makassar 🏪☕

Web platform untuk menemukan cafe terbaik di Makassar dengan fitur AI Chat Assistant.

![Cafe Makassar](https://img.shields.io/badge/Made%20in-Makassar-brown)
![Tech](https://img.shields.io/badge/Stack-MERN-blue)
![AI](https://img.shields.io/badge/AI-Ollama-green)

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MongoDB |
| Backend | Express.js + Swagger |
| Frontend | Next.js + Tailwind CSS |
| AI | Ollama (llama3) |
| Storage | MinIO |
| Deploy | Docker + GitHub Codespace |

## 📦 Fitur

- ✨ Tampilan aesthetic & responsive
- 🗺️ Explore cafe berdasarkan kategori
- 🤖 AI Chat Assistant untuk rekomendasi cafe
- 📸 Upload gambar cafe ke MinIO
- 📚 REST API dengan Swagger documentation
- 🐳 Docker compose untuk deployment

## 🛠️ Cara Menjalankan

### Dengan Docker (Recommended)

```bash
# Clone repo
git clone <repo-url>
cd cafe-makassar

# Jalankan semua services
docker-compose up --build

# Seed database (pertama kali)
docker exec cafe-backend node src/seed.js
```

### Akses:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger Docs**: http://localhost:5000/api-docs
- **MinIO Console**: http://localhost:9001

### Manual (Development)

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (terminal baru)
cd frontend
npm install
npm run dev
```

## 🤖 AI Chat

AI Chat frontend sekarang bisa memakai **Gemini API** lewat route internal Next.js (`frontend/src/app/api/chat/route.js`) agar jawaban lebih natural seperti AI chat modern, tetapi tetap diarahkan ke data cafe Makassar yang ada di web.

Tambahkan API key di `frontend/.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Format key dari Google AI Studio bisa berbeda-beda, misalnya `AIza...` atau `AQ...`. Keduanya didukung oleh route chat frontend ini.

Kalau API key belum diisi, chat tetap jalan memakai fallback lokal berbasis data cafe.

Fitur:
- Rekomendasi cafe berdasarkan mood/kebutuhan
- Info detail cafe (menu, harga, fasilitas)
- Floating chat widget di setiap halaman
- Halaman chat dedicated

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cafes | Get all cafes |
| GET | /api/cafes/:id | Get cafe by ID |
| POST | /api/cafes | Create cafe |
| PUT | /api/cafes/:id | Update cafe |
| DELETE | /api/cafes/:id | Delete cafe |
| POST | /api/chat | Chat with AI |
| POST | /api/upload | Upload image |

## 📁 Struktur Project

```
cafe-makassar/
├── backend/
│   ├── src/
│   │   ├── config/       # DB, MinIO, Swagger config
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes + Swagger docs
│   │   ├── index.js      # Entry point
│   │   └── seed.js       # Database seeder
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   └── components/   # React components
│   ├── Dockerfile
│   └── package.json
├── .devcontainer/        # GitHub Codespace config
├── docker-compose.yml
└── README.md
```

## 👨‍💻 Development

Project ini dibuat untuk tugas kuliah dengan requirement:
- Database MongoDB
- RESTful API dengan Swagger
- Web Frontend (Next.js)
- Gambar pada MinIO
- AI Integration
- Docker deployment
- Online via GitHub Codespace
