# 📸 Screenshot-to-Code: Pixel-Accurate UI Reconstruction AI

A modern, high-precision web application that transforms UI screenshots into clean, responsive, and pixel-accurate **React + Tailwind CSS** or **HTML5 + CSS3** code using AI Vision models (OpenRouter / Gemini / OpenAI).

![Screenshot to Code Banner](https://img.shields.io/badge/AI_Vision-OpenRouter_Active-indigo?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_18_%7C_Node.js_%7C_MySQL-zinc?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

---

## ✨ Features

- 🖼️ **Multimodal Screenshot Input**: Drag & drop or upload any web/mobile UI screenshot (`PNG`, `JPG`, `WEBP`).
- 🤖 **Systematic 6-Step AI Vision Analysis**:
  1. **Canvas Analysis**: Aspect ratio, margin bounds, and background color.
  2. **Layout Structural Analysis**: Flexbox, CSS Grid, columns, and container positioning.
  3. **Typography Analysis**: Font weights, sizes, line heights, and letter spacing.
  4. **Visual & Color Analysis**: Color hex codes, border radius, box shadows, and opacity.
  5. **Spacing Accuracy Analysis**: Padding, margins, and gaps.
  6. **Responsive Behavior**: Clean responsive utility classes for mobile and desktop viewports.
- ⚡ **Multi-Framework Output Support**:
  - **React + Tailwind CSS** (JSX default export with Lucide icons)
  - **HTML5 + CSS3** (Single-file standalone HTML with embedded CSS)
- 💻 **Monaco Code Editor**: Professional in-browser code editor with syntax highlighting, auto-wrapping, instant copying, and ZIP project export.
- 👁️ **Live Interactive Preview**: Real-time DOM iframe execution powered by Babel Standalone. Includes responsive viewport toggles (Desktop, Tablet, Mobile).
- 🔍 **Visual Compare Mode**: Side-by-side split screen view comparing the original reference screenshot with the live rendered DOM.
- 🪄 **Iterative Refine UI**: One-click visual refinement pass comparing existing code against the screenshot to polish layout and color discrepancies.
- 🛡️ **Mock Fallback Resilience**: Built-in automatic failover to an enhanced Mock Provider if AI API limits or network timeouts occur during development.
- 🎨 **Minimalist Editorial Visual Style**: Typography-driven, technical dark-monochrome interface.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4 (Editorial Dark Monochrome Theme)
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Icons**: Lucide React
- **Live Compiler**: Babel Standalone (In-browser JSX compilation)

### Backend
- **Runtime**: Node.js + Express
- **Database**: MySQL (Relational storage for projects & version history)
- **AI Vision Providers**: OpenRouter (`openrouter/free`), Google Gemini (`@google/genai`), OpenAI (`gpt-4o`)
- **Export Utility**: JSZip (Export downloadable project ZIP files)

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/installer/) (Running locally on port `3306`)

---

### 1. Clone the Repository
```bash
git clone https://github.com/SkyCiell/SSTC.git
cd SSTC
```

---

### 2. Configure Environment Variables
Copy the backend environment template:
```bash
cp server/.env.example server/.env
```

Open `server/.env` and insert your OpenRouter API Key (or Gemini/OpenAI key):
```env
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=screenshot_to_code

# AI Provider Configuration
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-YOUR_OPENROUTER_KEY_HERE
OPENROUTER_MODEL=openrouter/free
```

> **Note**: Get a free OpenRouter key at [https://openrouter.ai/keys](https://openrouter.ai/keys).

---

### 3. Database Setup
Create the MySQL database and tables:
```sql
CREATE DATABASE IF NOT EXISTS screenshot_to_code;
USE screenshot_to_code;
```
Import the schema from `server/schema.sql`:
```bash
mysql -u root -p screenshot_to_code < server/schema.sql
```

---

### 4. Install Dependencies

#### Install Backend Dependencies:
```bash
cd server
npm install
```

#### Install Frontend Dependencies:
```bash
cd ../client
npm install
```

---

### 5. Run Development Servers

#### Start Backend Server:
```bash
cd server
npm run dev
```
*(Server will start on `http://localhost:5000`)*

#### Start Frontend Client:
```bash
cd client
npm run dev
```
*(Client will start on `http://localhost:5173`)*

Open `http://localhost:5173` in your browser!

---

## 📁 Project Architecture

```
SSTC/
├── client/                     # Frontend React + Vite Application
│   ├── src/
│   │   ├── components/        # UI Components (Navbar, UploadZone, CodeEditor, LivePreview, GenerationProgress)
│   │   ├── pages/             # Pages (GeneratorPage, EditorPage, HistoryPage)
│   │   ├── services/          # API Client Service
│   │   ├── App.jsx            # App Root & Tab State
│   │   └── main.jsx           # Entry Point
│   └── package.json
│
├── server/                     # Backend Express Application
│   ├── src/
│   │   ├── config/            # MySQL Connection pool
│   │   ├── controllers/       # Generate, Project, and Export Controllers
│   │   ├── middleware/        # Multer Upload Middleware
│   │   ├── routes/            # API Route definitions
│   │   └── services/          # Unified AI Service & Providers (OpenRouter, Gemini, OpenAI, Mock)
│   ├── schema.sql             # Database SQL Migration Schema
│   └── package.json
│
└── README.md
```

---

## 🔒 Security Best Practices

- `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, and `OPENAI_API_KEY` are stored strictly in `server/.env`.
- API keys are **never** exposed to the React client bundle.
- All AI processing requests are proxied securely through the Express backend server.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
