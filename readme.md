# NutriScan 🥗📱

A personalized nutrition analysis platform that empowers users to make informed food choices through barcode scanning, AI-powered analysis, and personalized health recommendations.

![NutriScan App Screenshots](https://res.cloudinary.com/dqqyuvg1v/image/upload/v1750560345/WhatsApp_Image_2025-06-22_at_06.36.26_y4tgex.jpg)

## 🌟 Features

### 🔍 **Smart Barcode Scanning**

- Real-time barcode/QR code scanning using device camera
- Instant product recognition via OpenFoodFacts API
- Comprehensive nutritional data extraction

### 🤖 **AI-Powered Nutrition Analysis**

- Personalized nutrition scoring (A-E grading system)
- Health risk assessments based on user profile
- Smart recommendations using Google Gemini AI
- Multi-language support with Hindi TTS

![App Interface](https://res.cloudinary.com/dqqyuvg1v/image/upload/v1750560711/WhatsApp_Image_2025-06-22_at_06.36.54_vdzvks.jpg)

### 👤 **Personalized Health Profiles**

- Comprehensive onboarding flow
- Health goals tracking (weight loss, muscle gain, heart health, diabetes management)
- Dietary preferences (vegetarian, vegan, keto, etc.)
- Food allergies and restrictions management
- Nutrition priorities customization

### 📊 **Health Dashboard**

- Weekly personalized todo lists
- Progress tracking with visual indicators
- Nutrition insights and feedback
- Goal completion monitoring

### 🗣️ **Text-to-Speech Integration**

- Hindi language nutrition summaries
- Voice-guided health recommendations
- Accessibility-focused design

### 🍽️ **Diet Planning** (Beta)

- AI-generated weekly meal plans
- Workout routines integration
- Goal-specific recommendations

## 🛠️ Tech Stack

### Backend

- **Language**: Go 1.24+
- **Framework**: Gin Web Framework
- **Database**: MongoDB
- **AI/ML**: Google Gemini AI API
- **External APIs**: OpenFoodFacts API
- **Authentication**: JWT tokens
- **CORS**: Gin-contrib/cors

### Frontend

- **Framework**: Next.js 15.3+ with TypeScript
- **Styling**: TailwindCSS 4.0
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Barcode Scanner**: html5-qrcode
- **Icons**: Lucide React
- **Notifications**: Sonner

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Development**: Hot reloading for both frontend and backend

## 🚀 Quick Start

### Prerequisites

- Go 1.24+
- Node.js 18+
- MongoDB instance
- Google Gemini AI API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-amobagan
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
go mod tidy

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations:
# - GEMINI_API_KEY=your_gemini_api_key
# - MONGODB_URI=your_mongodb_connection_string
# - JWT_SECRET=your_jwt_secret

# Run the server
go run main.go
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Using Docker (Recommended)

```bash
# Start the entire application
docker-compose up --build

# Backend will be available at http://localhost:8080
# Frontend will be available at http://localhost:3000
```

## 📱 User Journey

### 1. **Onboarding Flow**

![App Demo](https://res.cloudinary.com/dqqyuvg1v/image/upload/v1750560345/WhatsApp_Image_2025-06-22_at_06.37.16_t7it15.jpg)

- Welcome carousel showcasing key features
- User details collection (name, phone, password)
- Physical profile setup (age, height, weight, workout frequency)
- Health goals selection
- Goal timeframe specification
- Dietary preferences configuration
- Food allergies and restrictions
- Nutrition priorities setting

### 2. **Daily Usage**

- **Scan Products**: Use camera to scan barcodes/QR codes
- **Get Analysis**: Receive instant AI-powered nutrition analysis
- **Track Consumption**: Log consumed foods for progress tracking
- **Follow Todos**: Complete personalized daily health tasks
- **Monitor Progress**: View nutrition insights and goal completion

### 3. **Dashboard Features**

- Calendar view for daily task management
- Nutrition feedback based on consumption patterns
- Progress tracking with visual indicators
- Quick access to barcode scanning

## 🔧 API Endpoints

### Authentication

- `POST /api/user/create` - User registration
- `POST /api/user/login` - User login

### Products & Nutrition

- `GET /api/products/:barcode` - Get product details by barcode
- `POST /api/products/:barcode/analyze` - Get personalized nutrition analysis

### User Management

- `PUT /api/user/nutritional-status` - Update user's nutritional consumption
- `GET /api/user/nutrition-details` - Get user's nutrition insights

### Diet Planning

- `POST /api/weekly-todos/generate` - Generate personalized weekly todos
- `GET /api/weekly-todos/current` - Get current week's todos
- `PUT /api/weekly-todos/:id/items/:itemId` - Update todo completion status

## 🏗️ Project Structure

```
project-amobagan/
├── server/                    # Go backend
│   ├── controllers/          # HTTP request handlers
│   ├── models/              # Data models and structures
│   ├── services/            # Business logic layer
│   ├── utils/               # Utility functions
│   ├── lib/                 # External integrations
│   ├── routes/              # API route definitions
│   ├── config/              # Configuration management
│   ├── llm_context/         # AI prompt templates
│   └── main.go              # Application entry point
├── client/                   # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js 13+ app router
│   │   ├── components/      # Reusable UI components
│   │   └── lib/             # Frontend utilities
│   ├── public/              # Static assets
│   └── package.json
├── tts_service/             # Text-to-Speech service (Python)
├── docker-compose.yml       # Multi-container setup
└── README.md
```

## 🔒 Environment Variables

### Backend (.env)

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://localhost:27017/amobagan
JWT_SECRET=your_super_secret_jwt_key
GIN_MODE=debug
PORT=8080
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Development Guidelines

### Backend

- Follow Go best practices and conventions
- Use dependency injection for services
- Implement proper error handling
- Add comprehensive logging
- Write unit tests for critical functions

### Frontend

- Use TypeScript for type safety
- Follow React best practices
- Implement responsive design
- Use semantic HTML elements
- Optimize for performance and accessibility

## 🐛 Known Issues & Limitations

- TTS service requires Python environment setup
- Some nutrition data may be incomplete from OpenFoodFacts
- Diet planning feature is in beta
- Limited to products available in OpenFoodFacts database

## 🔮 Future Enhancements

- [ ] Offline barcode scanning capability
- [ ] Social features and community sharing
- [ ] Integration with fitness trackers
- [ ] Meal planning with grocery list generation
- [ ] Healthcare provider integration
- [ ] Multiple language support for UI
- [ ] Advanced analytics and reporting
- [ ] Recipe suggestions based on dietary needs

## 📞 Support

For questions, issues, or contributions, please:

1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Join our community discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenFoodFacts for comprehensive product database
- Google Gemini AI for intelligent nutrition analysis
- The open-source community for amazing tools and libraries

---

**Made with ❤️ by AsyncMinds**
