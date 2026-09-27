# FitTrack - Modern Full-Stack MERN Fitness Tracking Application

FitTrack is a production-grade, full-stack fitness and athletic wellness tracking platform built with the MERN stack (MongoDB, Express, React, Node.js), Tailwind CSS, Recharts, and JWT authentication. It empowers athletes and fitness enthusiasts to monitor workouts, daily steps, hydration, sleep cycles, and personal fitness milestones with dynamic streaks and multi-interval progress analytics.

---

## 🌟 Key Features

- **⚡ Dynamic Workout Management**:
  - Full CRUD for workouts: Name, Type (Strength, Cardio, Running, Cycling, Walking, Yoga, HIIT, Other), duration, calories burned, difficulty (Easy, Moderate, Hard), and rich notes.
  - Live search, filtering by type & intensity, and multi-field sorting (newest, duration, calories, name).
- **🔥 Consecutive Day Workout Streak System**:
  - Automatically calculates current active streaks and all-time record streaks based on calendar days in workout history.
- **📊 Interactive Analytics & Charts (Recharts)**:
  - 6 synchronized analytics dashboards: Workout Frequency, Duration Trend, Calories Burned, Daily Steps, Water Intake, and Sleep Duration.
  - Interactive timeframe controls: **7-day**, **30-day**, and **90-day** rolling windows with executive summary statistics.
- **💧 Smart Hydration Tracking**:
  - Dynamic circular SVG progress ring against personalized daily water goals.
  - One-click quick-log buttons (+250ml glass, +500ml bottle, +750ml flask) plus custom amounts.
  - Timestamped history log with deletion support.
- **🌙 Sleep & Recovery Monitoring**:
  - Automatic sleep duration computation derived from bedtime and wake time.
  - Quality ratings (Poor, Fair, Good, Excellent) and sleep goal comparison charts.
- **🎯 Milestone Goal Tracking**:
  - Custom fitness goals across 7 categories (Steps, Workouts, Water, Sleep, Distance, Calories, Active Minutes).
  - Real-time percentage progress bar and automatic completion detection.
- **🔐 Secure Authentication & Data Isolation**:
  - Password hashing with `bcryptjs`.
  - Stateless JWT token authorization via request interceptors.
  - Strict MongoDB query isolation ensuring users can only ever access their own fitness records.
- **🌓 Modern UI & Theming**:
  - Light mode and high-contrast dark mode toggle with persistent state.
  - Responsive layouts: Desktop collapsible sidebar navigation + Mobile hamburger drawer & bottom navigation bar.
- **⚡ Instant Demo Data Seeding**:
  - "Load Demo Data" button in Settings and Dashboard to instantly populate 14-28 days of realistic historical activity, workouts, sleep, and hydration for immediate evaluation.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS with custom glassmorphism & typography
- **Routing**: React Router DOM (v6)
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized request/response interceptors

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js (MVC architecture)
- **Database**: MongoDB Atlas via Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **CORS & Middleware**: Standardized error handling, input validation, and Morgan request logging
- **Zero-Friction Dev Fallback**: Embedded in-memory MongoDB fallback when running offline without an Atlas cluster

---

## 📁 Project Architecture & Folder Structure

```
FitTrack/
├── package.json               # Monorepo root scripts for concurrent execution
├── README.md                  # Comprehensive setup & API documentation
├── client/                    # React + Vite Frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── vercel.json            # Vercel SPA routing rewrites
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── common/        # Button, Modal, Card, Input, Alert, StatCard, Badge, EmptyState
│       │   └── layout/        # Sidebar, Navbar, MobileNav, Layout
│       ├── pages/
│       │   ├── Auth/          # Login, Register
│       │   ├── Dashboard/     # Main KPI Command Center
│       │   ├── Workouts/      # Workout CRUD, search, filter, sort
│       │   ├── Activity/      # Steps, distance, active minutes, 7/30/90-day charts
│       │   ├── Hydration/     # Dynamic progress ring, quick-adds, water logs
│       │   ├── Sleep/         # Bedtime/wake-time auto duration & recovery charts
│       │   ├── Goals/         # Goal targets, progress updates, auto-complete
│       │   ├── Progress/      # 6 Recharts analytics dashboards with summary KPIs
│       │   ├── Settings/      # Target preferences, unit choices, theme, demo seeder
│       │   └── NotFound.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── services/
│       │   ├── api.js         # Centralized Axios client
│       │   ├── authService.js
│       │   ├── workoutService.js
│       │   ├── activityService.js
│       │   ├── waterService.js
│       │   ├── sleepService.js
│       │   ├── goalService.js
│       │   ├── dashboardService.js
│       │   └── userService.js
│       └── utils/
│           └── formatters.js
└── server/                    # Node.js + Express Backend
    ├── server.js              # Express entry point
    ├── package.json
    ├── .env.example
    ├── config/
    │   └── db.js              # Mongoose Atlas connection + memory fallback
    ├── models/
    │   ├── User.js
    │   ├── Workout.js
    │   ├── Activity.js
    │   ├── Water.js
    │   ├── Sleep.js
    │   └── Goal.js
    ├── middleware/
    │   ├── authMiddleware.js  # JWT validation
    │   └── errorHandler.js    # Standardized JSON error response
    ├── controllers/
    │   ├── authController.js
    │   ├── workoutController.js
    │   ├── activityController.js
    │   ├── waterController.js
    │   ├── sleepController.js
    │   ├── goalController.js
    │   ├── dashboardController.js
    │   └── userController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── workoutRoutes.js
    │   ├── activityRoutes.js
    │   ├── waterRoutes.js
    │   ├── sleepRoutes.js
    │   ├── goalRoutes.js
    │   ├── dashboardRoutes.js
    │   └── userRoutes.js
    └── utils/
        ├── streakCalculator.js
        └── seedDemoData.js
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```ini
PORT=5000
# To use MongoDB Atlas, paste your cluster URI below:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fittrack?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```ini
# Local development proxy:
VITE_API_URL=/api

# Production backend URL:
# VITE_API_URL=https://your-fittrack-backend.onrender.com/api
```

---

## 🚀 Local Installation & Quick Start

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB Atlas** account (or local MongoDB, or zero-config in-memory fallback)

### 2. Monorepo Installation
From the root directory:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run Development Servers
You can start both frontend and backend concurrently from the root:
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Visit the application in your browser at:
`http://localhost:5173`

---

## 🗄️ MongoDB Atlas Setup Guide

1. Sign up or log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** cluster.
3. Under **Database Access**, create a database user with username and password.
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere) for development and hosting deployments.
5. Click **Connect** -> **Drivers** -> Copy the connection string.
6. Paste into `server/.env`:
   ```ini
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fittrack?retryWrites=true&w=majority
   ```

---

## 📡 API Endpoints Reference

All API routes return consistent JSON:
```json
{
  "success": true,
  "data": {}
}
```

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/health` | Service health status | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login user & receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/dashboard` | Aggregated metrics, streak, recent workouts | Yes |
| `GET` | `/api/workouts` | Get workouts (supports `search`, `type`, `difficulty`, `sortBy`, `order`) | Yes |
| `POST` | `/api/workouts` | Log a new workout | Yes |
| `GET` | `/api/workouts/:id` | Get single workout details | Yes |
| `PUT` | `/api/workouts/:id` | Update an existing workout | Yes |
| `DELETE` | `/api/workouts/:id` | Delete a workout | Yes |
| `GET` | `/api/activity` | Get daily activity logs (supports `days=7\|30\|90` or `date=`) | Yes |
| `POST` | `/api/activity` | Log daily steps, distance, active minutes, calories | Yes |
| `GET` | `/api/water` | Get water logs & today's dynamic sum | Yes |
| `POST` | `/api/water` | Add water entry (+250ml, +500ml, custom amount) | Yes |
| `DELETE` | `/api/water/:id` | Remove water entry | Yes |
| `GET` | `/api/sleep` | Get sleep history & recovery averages | Yes |
| `POST` | `/api/sleep` | Log sleep record (auto-calculates duration) | Yes |
| `PUT` | `/api/sleep/:id` | Update sleep log | Yes |
| `DELETE` | `/api/sleep/:id` | Delete sleep record | Yes |
| `GET` | `/api/goals` | Get personal fitness goals (supports `category` filter) | Yes |
| `POST` | `/api/goals` | Create a new fitness goal | Yes |
| `PUT` | `/api/goals/:id` | Update goal progress or status | Yes |
| `DELETE` | `/api/goals/:id` | Delete a goal | Yes |
| `PUT` | `/api/users/profile` | Update profile information and password | Yes |
| `PUT` | `/api/users/settings` | Update daily step, water, sleep, and weekly workout goals | Yes |
| `POST` | `/api/users/demo-data` | Seed 14-28 days of realistic demo records | Yes |

---

## 🚢 Deployment Instructions

### Backend: Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository.
3. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure random secret key
   - `CLIENT_URL`: Your Vercel frontend URL
   - `NODE_ENV`: `production`

### Frontend: Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL (`https://your-backend.onrender.com/api`)
4. The included `client/vercel.json` automatically ensures SPA client-side routes rewrite properly to `index.html`.

---

## 📸 Screenshots & UI Preview

| Dashboard Overview | Workouts Management |
|---|---|
| *Key KPI stat cards, streak flame, weekly activity chart, and goal progress bars* | *Searchable, filterable workout cards with difficulty tags and quick detail modals* |

| Hydration Tracker | Progress Analytics |
|---|---|
| *Dynamic circular SVG hydration ring with 1-click quick-log buttons* | *6 synchronized Recharts visualizations with 7, 30, and 90-day timeframes* |

---

## 🔮 Future Improvements
- Wearable integration (Apple HealthKit & Google Health Connect)
- Social feed & community leaderboards
- AI workout recommendations & form feedback
- Meal and macronutrient logging integration
