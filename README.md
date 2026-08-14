# 🚀 AI Interview Coach — PrepPilot

> An AI-powered placement preparation platform that helps students prepare for technical interviews through personalized roadmaps, DSA tracking, AI-powered resume analysis, mock interviews, company preparation, and an interactive AI mentor.

**Live Demo:** https://ai-interview-coach-kwgncrav2-ai-2c28.vercel.app/

**Backend API:** https://ai-interview-coach-api-wgor.onrender.com/

---

## 📌 Overview

**AI Interview Coach (PrepPilot)** is a full-stack AI-powered placement preparation platform designed to provide students with a centralized environment for interview preparation.

Instead of using separate platforms for DSA practice, resume analysis, interview preparation, roadmaps, and career guidance, PrepPilot brings these workflows together into a single application.

The platform combines:

* AI-powered career guidance
* Personalized preparation roadmaps
* DSA progress tracking
* Problem recommendations
* Revision scheduling
* Coding-platform synchronization
* AI resume analysis
* AI-powered mock interviews
* Interview performance analysis
* Company-specific preparation
* AI mentor assistance
* Placement readiness analytics

The application is built using a **React + TypeScript frontend**, **Node.js + Express backend**, **MongoDB database**, and **Gemini/OpenAI-based AI services**.

---

# 🎯 Problem Statement

Students preparing for placements often use multiple disconnected tools:

* One platform for coding practice
* Another for interview preparation
* Separate tools for resume analysis
* Notes for tracking DSA progress
* Generic roadmaps without personalization
* No centralized interview performance analysis

This makes preparation difficult to track and personalize.

### 💡 Solution

PrepPilot provides a centralized placement preparation system where users can:

1. Create their profile
2. Analyze their resume
3. Generate a personalized preparation roadmap
4. Track DSA progress
5. Synchronize coding-platform progress
6. Practice AI-generated interview questions
7. Receive detailed interview feedback
8. Prepare for specific companies
9. Interact with an AI mentor
10. Monitor overall placement readiness

---

# ✨ Key Features

## 🔐 1. Authentication & User Management

Secure user authentication using JWT-based authorization.

### Features

* User registration
* User login
* JWT authentication
* Protected routes
* User profile management
* Profile picture upload
* Cloudinary image storage
* Resume upload support
* Secure password handling

### Profile Management

Users can:

* Edit personal information
* Update profile details
* Upload/change profile picture
* Manage career-related information
* Upload resume

---

# 📄 2. AI Resume Analyzer

The Resume Analyzer evaluates a user's resume using AI.

### Analysis Includes

* ATS quality assessment
* Resume strengths
* Resume weaknesses
* Skills detected
* Improvement recommendations
* Overall resume evaluation

The AI analysis helps users understand how their resume can be improved for software engineering and placement opportunities.

---

# 🧭 3. AI Roadmap Generator

Users can generate a personalized interview-preparation roadmap based on their target career goals.

### Roadmap considers

* Target role
* Target company
* Preparation timeline
* Required skills
* DSA requirements
* Interview preparation requirements

### Roadmap Features

* AI-generated preparation phases
* Topics and milestones
* Problem recommendations
* Progress tracking
* Roadmap persistence
* Save roadmap
* Download roadmap as PDF
* Reload saved roadmap after login/page refresh

Example roadmap structure:

```text
Phase 1
├── Programming Fundamentals
├── DSA Basics
└── Problem Solving

Phase 2
├── Arrays
├── Strings
├── Linked Lists
└── Stacks & Queues

Phase 3
├── Trees
├── Graphs
└── Dynamic Programming

Phase 4
├── Core CS
├── System Design
└── Interview Preparation
```

---

# 💻 4. DSA Tracker & Intelligence Dashboard

The DSA Tracker is one of the core components of PrepPilot.

It allows users to monitor their coding preparation instead of manually maintaining progress.

### Features

* Recommended problems
* Problem details
* Solve/problem completion tracking
* Progress status
* Custom topics
* Topic completion
* DSA statistics
* Analytics dashboard
* Revision tracking
* Revision scheduling
* Upcoming revision calendar
* Revision statistics
* AI-based DSA analysis
* Platform connection
* Platform synchronization

---

## 🔄 Coding Platform Synchronization

Users can connect supported coding platforms and synchronize their progress.

The synchronized data can be used to update the user's preparation progress and provide better insights.

### Workflow

```text
Coding Platform
       ↓
Platform Sync
       ↓
Backend
       ↓
User DSA Data
       ↓
Progress & Analytics
       ↓
Recommendations
       ↓
AI Analysis
```

---

# 🧠 5. DSA Analytics & AI Analysis

The DSA system analyzes the user's preparation progress.

Analytics can include:

* Problems solved
* Topic-wise progress
* Completion status
* Revision status
* Platform activity
* Preparation trends
* Weak areas
* Strong areas
* Recommended areas for improvement

The AI analysis can then use this preparation information to provide personalized guidance.

---

# 🔁 6. Intelligent Revision System

PrepPilot includes a revision workflow to help users revisit previously solved problems.

### Features

* Problems due for revision
* Problem review
* Revision toggle
* Revision statistics
* Upcoming revision calendar
* Revision progress

This helps prevent users from solving a problem once and then forgetting the approach later.

---

# 🎤 7. AI Mock Interview Coach

The Mock Interview module simulates an interview environment.

Users can enable a **local camera preview** to make the interview experience feel more realistic.

### Important Privacy Design

The camera is:

* Requested only when the user enables camera mode
* Used only for local preview
* Not uploaded to the backend
* Not stored in MongoDB
* Not sent to Gemini
* Stopped when the interview ends/unmounts

---

## 🧩 Interview Sections

The interview is divided into four sections:

### Technical — 5 Questions

Focuses on:

* Programming
* DSA
* Computer Science fundamentals
* Technical concepts

### Logical / Problem Solving — 3 Questions

Focuses on:

* Logical reasoning
* Problem solving
* Algorithmic thinking

### Personal — 3 Questions

Focuses on:

* Background
* Projects
* Experience
* Personal introduction

### HR / Behavioral — 4 Questions

Focuses on:

* Behavioral questions
* Teamwork
* Communication
* Conflict handling
* Career goals

### Total

```text
Technical          5
Logical            3
Personal           3
HR / Behavioral    4
---------------------
Total             15
```

---

# 📊 8. Interview Performance Analysis

After completing a mock interview, users receive a detailed performance dashboard.

### Includes

* Overall score
* Technical score
* Logical score
* Personal score
* HR score
* Key strengths
* Areas for improvement
* Recommendations
* Overall readiness verdict

This turns a simple question-answer system into an actual **interview feedback workflow**.

---

# 🏢 9. Company Preparation

The platform supports company-oriented preparation.

Users can prepare according to specific company requirements and target roles.

The goal is to connect:

```text
Target Company
      ↓
Target Role
      ↓
Required Skills
      ↓
DSA Preparation
      ↓
Interview Preparation
      ↓
Readiness
```

---

# 🤖 10. AI Mentor

PrepPilot includes an interactive AI mentor that users can use for preparation guidance.

Users can ask questions related to:

* DSA
* Interviews
* Resume
* Career preparation
* Technical concepts
* Placement strategy
* Project preparation

The mentor provides contextual guidance instead of requiring users to search across multiple resources.

---

# 📈 11. Placement Readiness Dashboard

The dashboard provides a centralized view of the user's preparation.

It brings together:

* DSA progress
* Resume quality
* Interview performance
* Roadmap progress
* Preparation statistics
* Recommendations

The goal is to give the user a single high-level view of their placement preparation.

---

# 🔔 12. Notifications

The application includes a notification system for user activities and preparation-related updates.

Examples include:

* Revision reminders
* Progress updates
* Preparation activity
* System notifications

---

# 📱 13. Responsive Design

The application has been optimized for multiple screen sizes.

### Supported layouts

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📲 Tablet

Responsive improvements include:

* Mobile navigation drawer
* Responsive grids
* Responsive cards
* Responsive tables
* Horizontal table scrolling
* Responsive modals
* Flexible spacing
* Mobile-friendly controls
* Adaptive layouts

---

# 🏗️ System Architecture

```text
                        ┌─────────────────────┐
                        │      User           │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │ React + TypeScript  │
                        │      Frontend       │
                        └──────────┬──────────┘
                                   │
                              REST APIs
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │ Node.js + Express   │
                        │      Backend        │
                        └──────────┬──────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               │                   │                   │
               ▼                   ▼                   ▼
       ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
       │   MongoDB    │    │   Cloudinary │    │  AI Services │
       │   Database   │    │    Storage   │    │ Gemini/OpenAI│
       └──────────────┘    └──────────────┘    └──────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │ External Coding  │
                         │    Platforms     │
                         └──────────────────┘
```

---

# 🧩 Application Architecture

The project follows a client-server architecture.

```text
ai-interview-coach/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   │
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.*
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   │   └── ai/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── tests/
│
└── README.md
```

---

# 🎨 Frontend Architecture

The frontend is built using **React + TypeScript + Vite**.

### Main responsibilities

* UI rendering
* Routing
* User interactions
* Form management
* API communication
* Dashboard visualization
* Responsive layouts
* Interview interface
* DSA tracker
* Roadmap interface

### Major pages

```text
Dashboard
│
├── DSA Tracker
├── AI Roadmap
├── Mock Interview
├── Resume Analyzer
├── Company Preparation
├── AI Mentor
├── Profile
└── Notifications
```

---

# ⚙️ Backend Architecture

The backend follows a modular Express architecture.

```text
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Models
  ↓
MongoDB
```

### Controllers

Controllers handle API-level business operations such as:

* Authentication
* User profile
* DSA
* Roadmap
* Interview
* Resume analysis
* Platform synchronization

### Services

Services contain reusable business logic and AI integrations.

Examples:

```text
AI Services
├── Gemini integration
├── Interview question generation
├── Interview evaluation
└── AI analysis

DSA Services
├── Revision scheduling
├── Progress calculation
└── Platform synchronization
```

---

# 🔐 Authentication Architecture

Authentication uses JWT.

```text
User
 ↓
Login/Register
 ↓
Backend Authentication
 ↓
JWT Token
 ↓
Protected API Request
 ↓
Auth Middleware
 ↓
Controller
```

Protected endpoints use authentication middleware before accessing user-specific resources.

---

# 🗄️ Database

The application uses **MongoDB** for persistent data storage.

The database stores application data such as:

* Users
* Profiles
* Interview sessions
* Roadmaps
* DSA progress
* Topics
* Revision information
* Platform profiles
* Analytics-related information

MongoDB provides flexible document-based storage suitable for the application's evolving data structures.

---

# ☁️ File & Image Storage

Profile images are handled using:

```text
Frontend
   ↓
Multer
   ↓
Backend
   ↓
Cloudinary
   ↓
Image URL + Public ID
   ↓
MongoDB
```

This avoids storing large image files directly inside MongoDB.

---

# 🤖 AI Architecture

AI operations are performed on the backend.

```text
React Frontend
      ↓
Express API
      ↓
AI Controller / Service
      ↓
Gemini / OpenAI API
      ↓
Structured AI Response
      ↓
Backend
      ↓
Frontend
```

### Important Design Decision

AI API keys are **never exposed to the frontend**.

All AI requests are handled server-side.

---

# 🧪 Testing & Verification

The project includes backend regression tests for major DSA functionality.

Verified test suites include:

```text
Scoring Tests
Platform Sync Tests
DSA Analytics Tests
DSA AI Analysis Tests
DSA Roadmap Tests
DSA Revision Tests
```

All existing regression suites were verified successfully during development.

---

# 🏭 Production Deployment

The application uses separate deployment platforms for frontend and backend.

### Frontend

**Vercel**

```text
React + Vite
       ↓
Vercel
       ↓
Production Frontend
```

### Backend

**Render**

```text
Node.js + Express
       ↓
Render
       ↓
Production API
```

### Database

**MongoDB Atlas**

### Media Storage

**Cloudinary**

---

# 🔑 Environment Variables

Create environment files locally.

### Backend

```env
NODE_ENV=
PORT=
MONGODB_URI=
CLIENT_URL=
JWT_SECRET=
JWT_EXPIRE=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GEMINI_API_KEY=
```

### Frontend

```env
VITE_API_URL=
```

> Never commit real API keys, JWT secrets, database credentials, or Cloudinary secrets to GitHub.

---

# 🚀 Local Development

## 1. Clone the repository

```bash
git clone https://github.com/priya-saini-25/ai-interview-coach.git
cd ai-interview-coach
```

## 2. Install backend dependencies

```bash
cd server
npm install
```

## 3. Configure backend environment variables

Create:

```text
server/.env
```

and add the required environment variables.

## 4. Start backend

```bash
npm run dev
```

The backend runs on the configured server port.

---

## 5. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

Create:

```text
client/.env
```

Configure:

```env
VITE_API_URL=YOUR_BACKEND_API_URL/api
```

## 6. Start frontend

```bash
npm run dev
```

The frontend will run through the Vite development server.

---

# 📡 API Design

The backend exposes RESTful APIs organized by functionality.

Example API groups:

```text
/api/auth
/api/dsa
/api/roadmap
/api/interview
/api/resume
```

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile
```

### DSA

```text
GET    /api/dsa/recommendations
GET    /api/dsa/problems/:id
POST   /api/dsa/solve/:id
PATCH  /api/dsa/progress/:id
GET    /api/dsa/topics
GET    /api/dsa/stats
GET    /api/dsa/analytics
POST   /api/dsa/ai-analysis
```

### Revision

```text
GET    /api/dsa/revision/today
POST   /api/dsa/revision/:problemId/review
GET    /api/dsa/revision/stats
GET    /api/dsa/revision/upcoming
```

### Roadmap

```text
POST   /api/roadmap/save
GET    /api/roadmap
```

Additional roadmap and interview endpoints are implemented within their respective route modules.

---

# 🛡️ Security Considerations

The application follows several security practices:

* JWT-based authentication
* Protected API routes
* Password exclusion from normal user responses
* Environment-based secret management
* Backend-only AI API keys
* Authentication middleware
* Controlled profile updates
* File-type validation
* File-size limits for image uploads
* CORS configuration
* Unauthorized-origin blocking

---

# 📊 Core User Flow

```text
                    ┌───────────────┐
                    │    Register   │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │    Profile    │
                    └───────┬───────┘
                            ↓
              ┌─────────────┴─────────────┐
              ↓                           ↓
       Resume Analysis               Target Role
              ↓                           ↓
       Resume Feedback             AI Roadmap
                                          ↓
                                   DSA Preparation
                                          ↓
                                  Platform Sync
                                          ↓
                                  DSA Analytics
                                          ↓
                                  AI Recommendations
                                          ↓
                                  Mock Interview
                                          ↓
                                  Performance Analysis
                                          ↓
                              Placement Readiness
```

---

# 💡 Engineering Highlights

Some of the major engineering decisions in the project include:

### Modular backend

Controllers, routes, models, middleware, and services are separated to improve maintainability.

### Protected AI architecture

AI APIs are called from the backend rather than exposing API keys in the browser.

### Persistent roadmap

Generated roadmaps can be saved and retrieved from MongoDB instead of existing only in frontend state.

### Local camera processing

Mock interview camera functionality uses the browser's `getUserMedia()` API while keeping video local and avoiding unnecessary storage.

### Responsive navigation

Desktop sidebar navigation is complemented by a mobile slide-over navigation drawer.

### Reusable components

Common UI components such as:

```text
Button
Input
Card
Badge
Header
Sidebar
```

are reused throughout the application.

### Service-based API communication

Frontend API calls are separated into service modules rather than being scattered throughout page components.

---

# 📈 Future Improvements

Potential future enhancements include:

* Advanced interview speech analysis
* Voice-based AI interviews
* Facial-expression analysis with explicit user consent
* More coding-platform integrations
* Advanced DSA recommendation algorithms
* Company-specific question databases
* Interview history comparison
* Resume version comparison
* Email/reminder notifications
* Advanced placement prediction
* More detailed analytics
* WebSocket-based real-time interview sessions

---

# 🧰 Tech Stack

| Category            | Technology           |
| ------------------- | -------------------- |
| Frontend            | React                |
| Language            | TypeScript           |
| Styling             | Tailwind CSS         |
| Build Tool          | Vite                 |
| Backend             | Node.js              |
| API Framework       | Express.js           |
| Database            | MongoDB              |
| Authentication      | JWT                  |
| AI                  | Gemini / OpenAI APIs |
| File Storage        | Cloudinary           |
| File Upload         | Multer               |
| Charts              | Recharts             |
| Frontend Deployment | Vercel               |
| Backend Deployment  | Render               |
| Database Hosting    | MongoDB Atlas        |
| Version Control     | Git & GitHub         |

---

# 📂 Main Modules

```text
Authentication
      │
      ├── Registration
      ├── Login
      └── Profile

Resume
      │
      └── AI Resume Analyzer

Preparation
      │
      ├── AI Roadmap
      ├── Company Preparation
      └── AI Mentor

DSA
      │
      ├── Recommendations
      ├── Progress
      ├── Analytics
      ├── Platform Sync
      └── Revision System

Interview
      │
      ├── Technical
      ├── Logical
      ├── Personal
      ├── HR
      ├── Camera Mode
      └── Performance Analysis

Dashboard
      │
      ├── Readiness
      ├── Statistics
      └── Notifications
```

---

# 🎓 Why This Project?

PrepPilot demonstrates practical experience with:

* Full-stack development
* REST API design
* Authentication and authorization
* MongoDB data modeling
* AI API integration
* Cloud storage
* File uploads
* Data synchronization
* Analytics
* Responsive UI development
* State management
* Production deployment
* Git/GitHub workflow

The project focuses not only on UI development but also on **backend architecture, data persistence, API design, AI integration, and deployment**.

---

# 👩‍💻 Author

### Priya Saini

**Software Engineer | C++ DSA | MERN Stack Developer**

* GitHub: https://github.com/priya-saini-25
* LinkedIn: https://www.linkedin.com/in/priya-saini-it
* LeetCode: https://leetcode.com/u/prisaini/

---

# ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 📜 License

This project is intended for educational, portfolio, and demonstration purposes.
