# Smart Hospital Queue & Appointment Management System

A full-stack AI-powered Smart Hospital Queue & Appointment Management System built with the MERN stack and Jeevika AI (powered by Google Gemini).

## 🚀 Features

- 🏥 **Smart Queue Management** — Real-time token tracking via Socket.IO
- 📅 **Appointment Booking** — Full flow with doctor/hospital selection
- 🤖 **Jeevika AI Triage** — Voice symptom analysis powered by Google Gemini (Triage) & Gnani.ai (Voice AI in English, Hindi, Marathi, Tamil)
- 📊 **Admin Dashboard** — Analytics, doctor management, queue control
- 🔔 **Real-time Notifications** — Live updates for patients and staff
- 🔐 **JWT Authentication** — Secure role-based access (patient / admin)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Real-time | Socket.IO |
| AI | Google Gemini 2.5 Flash |
| Voice AI | Gnani.ai (STT & TTS) |

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Google Gemini API Key (free at [aistudio.google.com](https://aistudio.google.com))
- Gnani API Key (for Voice AI)

### 1. Clone the repository
```bash
git clone https://github.com/samarthjadhavvj77-ROCK/smart-hospital-queue-git.git
cd smart-hospital-queue-git
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mediqueue
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
GNANI_API_KEY=your_gnani_api_key_here
```

Start the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
``` 

## 🤖 Jeevika AI

Jeevika is an AI healthcare triage assistant integrated into the patient dashboard. It uses **Gnani.ai** for highly accurate Speech-to-Text and Text-to-Speech in multiple Indian languages, and **Google Gemini** to analyze the transcribed symptoms and classify them as **Minor** or **Severe**.

## ⚠️ Important

Never commit your `.env` file. The `.gitignore` is configured to exclude it automatically.
