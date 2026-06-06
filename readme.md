# Health Boot 🥗📱🏥

Health Boot is a comprehensive AI-powered campus wellness platform that combines biometric analysis, nutrition intelligence, food tracking, smart goal management, health risk assessment, and conversational AI into a single ecosystem.

Designed around the vision of a digital Health Booth, the platform empowers students to monitor their physical health, understand biometric trends, receive personalized recommendations, and make informed lifestyle decisions through a modern "Calm Tech" medical dashboard experience.

---

![Health Boot Dashboard Interface](client/public/image.png)

---

## 🎯 Project Vision

Health Boot aims to become a digital campus wellness ecosystem that combines biometric monitoring, nutrition intelligence, AI assistance, and preventive healthcare into a single platform, helping students build healthier habits through personalized, data-driven wellness guidance.

## 🌟 Core Features

### 🔐 Student Authentication & QR Access

- Student ID based registration and login.
- Secure JWT authentication and role-based access control.
- Dynamic encrypted QR code generation for campus Health Booth access.
- QR-based profile retrieval and biometric session initiation.
- Multi-campus and department-aware student onboarding.

---

### 📊 Biometric Data Collection & Analysis

Health Boot supports complete biometric evaluation including:

- Weight Monitoring
- Heart Rate Analysis
- Blood Pressure Analysis
- Hydration Monitoring
- Body Fat Percentage
- Muscle Mass Percentage
- Bone Mass Analysis
- Visceral Fat Assessment
- Body Water Percentage

All metrics are validated and processed using deterministic backend calculations to ensure medical consistency and eliminate AI-generated calculation errors.

---

### 🧮 Deterministic Health Calculation Engine

The platform calculates:

1. BMI & Classification
2. Body Fat Classification
3. Heart Rate Classification
4. Blood Pressure Classification
5. Hydration Status Analysis
6. Lean Body Mass (LBM)
7. Fat Mass
8. Fat Free Mass (FFM)
9. Basal Metabolic Rate (BMR)
10. Daily Calorie Requirement
11. Ideal Weight Range
12. Overall Health Risk Score

Every result includes:

- Formula Used
- Input Parameters
- Classification Logic
- Health Interpretation

---

### 🍎 Food Intake Logging

Track complete daily nutrition intake:

- Breakfast Logging
- Lunch Logging
- Dinner Logging
- Snack Logging
- Barcode-Based Food Entry
- Manual Food Entry
- Food Editing & Deletion

Nutrition metrics include:

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Micronutrients

Daily dashboards provide:

- Calories Consumed
- Calories Remaining
- Macro Distribution
- Nutrition Quality Score

---

### 🎯 Smart Goals Engine

Users can create and monitor:

- Weight Loss Goals
- Weight Gain Goals
- Hydration Goals
- Fitness Goals
- Calorie Goals
- Lifestyle Improvement Goals

Features include:

- Goal Progress Tracking
- Progress Rings
- Weekly Achievement Monitoring
- Estimated Completion Dates
- Dynamic Goal Recommendations

---

### 🤖 AI-Powered Nutrition & Wellness Assistant

Powered by Google Gemini AI:

- Personalized Meal Planning
- Workout Recommendations
- Nutrition Guidance
- Food Quality Evaluation
- Lifestyle Coaching
- Wellness Recommendations

The assistant can answer:

- Health Questions
- Nutrition Queries
- Meal Suggestions
- Fitness Guidance
- Campus Wellness FAQs

---

### 📈 Smart Insights & Trend Analytics

Health Boot continuously analyzes historical biometric data.

Trend Analysis:

- Weight Trends
- BMI Trends
- Hydration Trends
- Heart Rate Trends
- Nutrition Trends
- Goal Achievement Trends

AI-generated insights include:

- Weekly Health Summaries
- Improvement Suggestions
- Risk Notifications
- Behavioral Recommendations

Example:

"Your hydration improved by 12% over the last 7 days."

"Your average heart rate decreased by 6 bpm compared to last month."

---

### 🚨 Risk Identification System

The platform evaluates:

- BMI Risk
- Blood Pressure Risk
- Hydration Risk
- Body Fat Risk
- Heart Rate Risk

Risk Levels:

- Low Risk
- Medium Risk
- High Risk
- Critical Risk

Personalized interventions are automatically generated for identified risks.

---

### 📱 Student Dashboard

The dashboard provides:

- Real-Time Health Metrics
- Health Status Cards
- Formula Explanations
- Goal Progress
- Food Intake Monitoring
- Health History
- Trend Charts
- AI Recommendations
- Smart Insights

---

### 🔒 Privacy & Security

Health Boot follows healthcare-inspired security practices:

- JWT Authentication
- Password Hashing (bcrypt)
- Secure API Access
- Role-Based Authorization
- Rate Limiting
- Audit Logging
- Data Encryption for Sensitive Metrics
- Secure QR Authentication

Users can:

- Export Health Records
- Download Reports
- Delete Personal Data
- Review Activity Logs

---

### 📊 Historical Tracking

All biometric sessions are securely stored and visualized.

Features include:

- Daily History
- Weekly Trends
- Monthly Trends
- Goal Progress History
- Nutrition History
- Health Risk Timeline

---

## 🏥 Health Boot Ecosystem Flow

Student Authentication
↓
QR Verification
↓
Biometric Data Collection
↓
Data Validation
↓
Health Calculations
↓
Body Composition Analysis
↓
Risk Assessment
↓
Nutrition Analysis
↓
AI Recommendations
↓
Smart Goals
↓
Trend Insights
↓
Student Dashboard
↓
Continuous Health Monitoring

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

## 📱 How to Use Health Boot

1. **Start the Intro:**
   - When you first visit the application, the cinematic opening video will play. Click anywhere to skip or let it finish to arrive at the **Welcome page**.

2. **Create/Access Your Profile:**
   - On the **Welcome page**, hover over the **Get Started** button to see the pulsing heartbeat animation, then click it.
   - If you don't have an account, click **Signup** to fill out your physical profiles (Age, Height, Weight, Activity, and Goals).
   - Once logged in, you will be navigated to your personal **Student Dashboard**.

3. **QR Check-in (Booth Access):**
   - Navigate to the **QR Check-in** page to generate a secure, timed QR code.
   - Scan this at the physical Health Boot booth to authenticate and initiate your session.

4. **Log a Biometric Scan:**
   - From the Dashboard, click **New Scan** in the top-right header or navigate directly to `/scan`.
   - Fill in your current readings (Weight, Heart Rate, Blood Pressure, Body Fat, Hydration %, Muscle %, Visceral Fat, Bone Mass).
   - Click **Submit Biometric Data**. The button will transition into a spinning cyan loading state while the system calculates metrics and retrieves AI diet recommendations.

5. **Track Nutrition & Goals:**
   - Visit the **Food Log** to add meals via manual entry or barcode scanning, tracking your daily calories and macros.
   - Use the **Goals** section to set personalized targets (e.g., weight loss, hydration) and monitor your progress rings.

6. **Explore Dashboard Insights:**
   - Once computed, you'll see the light-themed, high-contrast metrics card grid on the **Student Dashboard**.
   - **Formulas:** Click or view each card to read the precise medical formulas and parameters used to evaluate your status.
   - **Risk Assessment:** The large bottom card shows your overall health risk score with a high-contrast alerts scheme matching your health status.
   - **AI Health Insights:** Check the Insights page for trend analysis and personalized behavioral recommendations based on your scan history.
   - **Personalized Recommendations:** Review the 7-day progress history chart, plus your custom **1-Day Meal Plan** and **Workout Plan** generated by the AI based on your calorie limit.

7. **Get AI Help via Chat:**
   - Click the floating **Chat with Health Boot** button in the bottom right corner of the page.
   - Use the assistant chat to get product advice, healthy food swaps, or ask nutrition questions.

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

### 📱 QR Check-In

- `POST /api/user/qr/generate` — Generates a 15-minute QR session token.
- `POST /api/user/qr/validate` — Validates the booth QR token.

### � Biometrics & AI

- `POST /api/user/biometrics/analyze` — Saves inputs, calculates metrics, fetches Gemini meal plan.
- `GET /api/user/biometrics/history` — Fetches the last 7 biometric scan records.

### 🍎 Food Logging

- `POST /api/user/food-logs` — Creates a new meal entry.
- `GET /api/user/food-logs` — Fetches daily logs (optional `?date=` query).
- `GET /api/user/food-logs/summary` — Retrieves daily macro/calorie summary.

### 🎯 Smart Goals

- `POST /api/user/goals` — Creates a personalized health goal.
- `GET /api/user/goals` — Lists active user goals.
- `PUT /api/user/goals/:id` — Updates goal progress tracking.

### 📈 Health Insights

- `GET /api/user/insights` — Generates and returns AI-powered health trend insights.

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
