# Health Boot 🥗📱

A personalized nutrition and biometric analysis platform that empowers users to make informed food choices through barcode scanning, AI-powered diet recommendations, deterministic health calculations, and historical progress tracking. Designed with a modern, calm, and cinematic health-tech interface ("Calm Tech" meets "Cinematic Medical").

![Health Boot Dashboard Interface](client/public/image.png)

---

## 🌟 Key Features

### 🎨 **"Calm Tech" Cinematic Redesign**
- **Inverted Dark Dashboard:** Deep navy (`bg-slate-900`) page background contrasting with bright white metric cards to focus attention on data metrics.
- **Glassmorphic Interfaces:** Soft translucent backdrops (`glass-card`) with backdrop blur filters and border accents.
- **Animated SVG Wave (`.bg-wave`):** Breathing, slowly translating horizontal wave background at 3% opacity.
- **Heartbeat CTAs:** Dynamic heartbeat animations and cyan glows on key interactive elements.

### 🔍 **Smart Barcode Scanning**
- Real-time barcode/QR scanning using device camera (`html5-qrcode`).
- Instant product recognition via **OpenFoodFacts API**.
- Personalized nutrition scoring (A-E grading scale) with FSSAI verification rules.

### 🔢 **Deterministic Go Calculation Engine**
Calculates the **10 core health metrics** strictly according to medical formulas in the Go backend to ensure data reliability (preventing AI hallucination of math):
1. **BMI & Classification** (Standard $\text{Weight} / \text{Height}^2$ formula).
2. **Body Fat Classification** (Factoring in Male/Female healthy fat ranges).
3. **Heart Rate Classification** (Low, Normal, High).
4. **Blood Pressure Status** (Including invalid reading detection for systolic < 50 or diastolic < 30).
5. **Hydration Status** (Optimal, Normal, Low).
6. **BMR** ( Mifflin-St Jeor equation).
7. **Daily Calorie Requirement** (BMR × Activity Factor).
8. **Ideal Weight Range** (Healthy BMI range margins).
9. **Overall Risk Score** (A custom 5-factor risk classification engine).

### 🤖 **AI-Powered Nutrition & Diet Planning**
- Generates a **1-Day Personalized Meal Plan** and **Workout Plan** using Google Gemini AI, customized to your calculated calorie limits and dietary preferences.
- **Bulletproof Parsing:** Backend response sanitizing helper that strips markdown fences (e.g. ` ```json `) to prevent JSON unmarshaling errors.

### 📊 **History Tracking**
- Auto-saves all past scan metrics in MongoDB.
- Dynamic **Daily Progress Overview** bar chart showing health trends over the last 7 days.
- **Smart Fallback:** The dashboard automatically loads the user's latest database records if local storage is cleared.

---

## 🛠️ Technology Stack

### Backend (Go / Python)
- **Language:** Go 1.24+
- **Framework:** Gin Web Framework (Go)
- **Database:** MongoDB
- **AI Integration:** Google Gemini AI API (`gemini-2.5-flash-lite`)
- **TTS Service:** Python gTTS (Google Text-to-Speech) for voice feedback in Hindi

### Frontend (Next.js)
- **Framework:** Next.js 15.3+ with TypeScript
- **Styling:** TailwindCSS 4.0 (PostCSS integration)
- **Icons & Animation:** Lucide React, Framer Motion

### Infrastructure
- **Containerization:** Docker & Docker Compose (Multi-service network: `mongo`, `backend`, `frontend`)
- **Package Management:** Yarn (frontend) / Go Modules (backend)

---

## 🚀 Quick Start Guide

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/) installed on your machine.
- Any AI API Key.

### 1. Set Up Environment Variables
Create a `.env` file inside the `server/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=mongodb://mongo:27017/healthboot
JWT_SECRET=your_jwt_secret
PORT=8080
GIN_MODE=debug
```

### 2. Run with Docker Compose (Recommended)
Build and spin up the complete multi-container stack (frontend, backend, database):
```bash
docker compose up -d --build
```
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **MongoDB Instance:** `localhost:27017`

### 3. Local Development (Without Docker)
**Backend Setup:**
```bash
cd server
go mod tidy
go run main.go
```

**Frontend Setup:**
```bash
cd client
yarn install
yarn dev
```

---

## 🏗️ Project Directory Structure

```
project-amobagan/
├── server/                    # Go API Backend
│   ├── controllers/           # HTTP Request Handlers
│   ├── models/                # MongoDB Data Structures
│   ├── services/              # Health Calculation & Gemini Logic
│   ├── routes/                # Endpoint Mappings
│   ├── lib/                   # Database & Gemini Initializers
│   ├── config/                # App Settings Loader
│   └── main.go                # Server Entrypoint
├── client/                    # Next.js Frontend App
│   ├── src/
│   │   ├── app/               # Page Router & Layouts
│   │   ├── components/        # Radix / Shared Components
│   │   └── lib/               # Frontend API Utilities
│   ├── tailwind.config.ts     # Core Design Settings
│   └── package.json
├── tts_service/               # Python TTS API
├── docker-compose.yml         # Compose Configuration
└── README.md
```

---

## 🔧 Core API Endpoints

### 👤 Authentication & Profiles
- `POST /api/user/create` — Registers a new user.
- `POST /api/user/login` — Log in and return JWT token.
- `PUT /api/user/profile` — Update age, height, weight, activity, and goals.

### 📊 Biometrics & AI
- `POST /api/user/biometrics/analyze` — Saves inputs, calculates metrics, fetches Gemini meal plan.
- `GET /api/user/biometrics/history` — Fetches the last 7 biometric scan records.

### 💬 Assistant Chat
- `POST /api/chat` — Contextual AI advisor chat (diet advice, FSSAI warnings).

---

## 🤝 Contributing
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

**Made with ❤️ by Kavinila & Arunaw**
