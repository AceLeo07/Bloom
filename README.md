# Bloom: 3D Habit Forest

An immersive 3D web experience that gamifies positive habit formation through a magical forest metaphor. Built with React, Three.js, and a complete Node.js backend with MySQL database.

## 🌟 Features

- **3D Forest Environment**: Photorealistic 360° forest with swaying trees, clouds, and ambient lighting
- **Interactive Fairy**: Clickable fairy character that opens habit tracking modal
- **Habit Tracking**: Daily questions about mood, food, hydration, and sleep
- **Plant Growth System**: Visual plant progression through 4 stages (seed → sapling → bloom → decay)
- **Tree Lifecycle**: 7-day tree cycles with smooth animations and permanent forest placement
- **Audio System**: Procedural ambient forest sounds with positive/negative feedback
- **User Authentication**: JWT-based authentication with demo mode
- **Data Persistence**: Complete MySQL database with user stats and progress tracking
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Three.js** & **React Three Fiber** for 3D graphics
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MySQL** database with connection pooling
- **JWT** authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Windows Setup
1. Clone the repository
```bash
git clone <repository-url>
cd bloom
```

2. Run the setup script
```bash
setup.bat
```

3. Follow the prompts to configure your database

### Manual Setup
1. Install dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

2. Set up environment files
```bash
# Copy example files
cp env.example .env
cp backend/env.example backend/.env
```

3. Configure your database
   - Update `backend/.env` with your MySQL credentials
   - Run the database setup script:
   ```bash
   mysql -u root -p < backend/scripts/setup-database.sql
   ```

4. Start the application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🎮 Demo Credentials

- **Email**: demo@bloom.com
- **Password**: demo123

## 📁 Project Structure

```
bloom/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── ForestScene.tsx # Main 3D scene
│   │   ├── Plant.tsx      # Plant growth component
│   │   ├── FairyModel.tsx # Interactive fairy character
│   │   └── HabitModal.tsx # Habit tracking modal
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── store/             # Zustand state management
│   └── lib/               # Utility libraries
├── backend/               # Node.js backend
│   ├── config/           # Database configuration
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── scripts/          # Database setup scripts
│   └── server.js         # Main server file
└── docs/                 # Documentation
```

## 🎯 How It Works

1. **Authentication**: Users sign in with email/password or use demo credentials
2. **Forest Entry**: Enter the immersive 3D forest with ambient audio and visual effects
3. **Habit Interaction**: Click the glowing fairy to open daily habit questions
4. **Plant Growth**: 
   - Positive answers (+5 health) make the plant grow and brighten the forest
   - Negative answers (-5 health) cause decay and dimming
   - Visual feedback with butterflies/sparkles or falling leaves
5. **Tree Completion**: After 7 days, the tree smoothly animates to permanent forest position
6. **New Cycle**: A new seed is planted at the center for continued growth journey

## 🗄️ Database Schema

### Users Table
- User authentication and profile information
- Password hashing and account status

### User Trees Table
- Individual tree instances with growth stages
- Health tracking and 3D positioning
- 7-day lifecycle management

### Daily Habits Table
- Daily habit responses (mood, food, hydration, sleep)
- Question tracking and positive/negative counts

### User Stats Table
- Progress analytics and streak tracking
- Performance metrics and achievements

## 🔧 API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Create new user account
- `POST /signin` - Sign in existing user
- `POST /demo` - Authenticate as demo user
- `GET /me` - Get current user info

### Trees (`/api/trees`)
- `GET /current` - Get current active tree
- `GET /` - Get all user trees
- `POST /` - Create new tree
- `PATCH /:treeId` - Update tree
- `POST /:treeId/complete` - Complete tree and start new one

### Habits (`/api/habits`)
- `POST /answer` - Submit habit answer
- `GET /today/:treeId` - Get today's habits for tree
- `GET /history/:treeId` - Get habit history for tree
- `GET /stats` - Get user statistics

## 🎨 Customization

### Adding New Habit Questions
Edit `src/components/HabitModal.tsx`:
```typescript
const questions = [
  {
    question: "Your new question?",
    positive: ["Option 1", "Option 2"],
    negative: ["Option 3", "Option 4"],
    id: 'new_habit'
  }
];
```

### Modifying Plant Stages
Update `src/components/Plant.tsx`:
```typescript
const getPlantColor = () => {
  if (plantStage === 'your_stage') return '#your_color';
  // ... other stages
};
```

### Customizing 3D Environment
Modify `src/components/ForestScene.tsx` for lighting, weather, or terrain changes.

## 🔒 Security Features

- Password hashing with bcryptjs (12 rounds)
- JWT token authentication with expiration
- Rate limiting (100 requests per 15 minutes)
- CORS protection with configurable origins
- Helmet security headers
- Input validation with express-validator
- SQL injection protection with parameterized queries
- XSS protection and secure headers

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use production database (not localhost)
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Use PM2 or similar for process management
6. Set up SSL with reverse proxy (nginx)

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Update API URL in environment variables
4. Configure CORS on backend for production domain

### Database Setup
1. Use managed MySQL service (AWS RDS, Google Cloud SQL)
2. Set up automated backups
3. Configure connection pooling
4. Monitor performance and optimize queries

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
npm test
```

## 📊 Performance

- **3D Rendering**: Optimized with instanced rendering and LOD
- **Database**: Connection pooling and indexed queries
- **API**: Rate limiting and request validation
- **Frontend**: Code splitting and lazy loading
- **Audio**: Procedural generation to reduce file sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

## 🙏 Acknowledgments

- Three.js community for 3D graphics inspiration
- React Three Fiber for excellent React integration
- Blink SDK for initial authentication system
- All contributors and testers

---

**Happy growing! 🌳✨**