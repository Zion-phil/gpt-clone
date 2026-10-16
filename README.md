# GPT Clone

A full-stack ChatGPT clone built with **React + Vite**, **Node + Express**, **MySQL**, and the **Google Gemini API**. Supports multi-session chat history, markdown responses, and a ChatGPT-style sidebar.

🔗 **Live Demo:** [https://gpt-clone-tsion2.vercel.app](https://gpt-clone-tsion2.vercel.app)

---

## 📸 Features

- **Multi-session chat** — sidebar lists all past conversations; click any to resume
- **Session persistence** — messages are stored in MySQL and linked to their session
- **Auto-titled chats** — a new chat is named after the first question you ask
- **Markdown rendering** — assistant replies render as rich markdown with code highlighting
- **Optimistic UI** — your message appears instantly while Gemini generates the reply
- **Error handling** — Gemini errors surface in the chat, not as a blank screen
- **Token usage tracking** — each assistant reply stores its token count

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | CSS Modules |
| Icons | lucide-react |
| Markdown | react-markdown + react-syntax-highlighter |
| Backend | Node.js + Express |
| Database | MySQL (mysql2/promise) |
| AI | Google Gemini via @google/genai |
| Deployment | Vercel (FE), Render (BE), Aiven (DB) |

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- MySQL (MAMP, XAMPP, or standalone) — this project's defaults assume MAMP
- A Google Gemini API key — get one at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/Zion-phil/gpt-clone.git
cd gpt-clone

### 2. Set up the database

Start your MySQL server (MAMP → Start Servers). Then either:

**Option A — phpMyAdmin**

1. Open http://localhost:8888/phpMyAdmin
2. Create a database called `gpt-clone`
3. Go to the **Import** tab → choose `backend/schema.sql` → **Go**

**Option B — MySQL CLI**

```bash
mysql -h 127.0.0.1 -P 8889 -u root -proot < backend/schema.sql

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env

Then edit backend/.env and fill in real values:
PORT=3877
DB_HOST=127.0.0.1
DB_PORT=8889
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=gpt-clone
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash

### 4. Install dependencies
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

### 5. Run both servers
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev

Open the URL Vite prints (usually http://localhost:5173 or http://localhost:5174).

## 📁 Project Structure

## 🔌 API Endpoints

All routes are prefixed with `/api/chat`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/sessions` | List all chat sessions (sidebar) |
| `POST` | `/sessions` | Create a session manually |
| `GET` | `/sessions/:id` | Get a session + all its messages |
| `DELETE` | `/sessions/:id` | Delete a session (cascades to messages) |
| `POST` | `/conversations` | Post a message; creates a session if `sessionId` is null |
| `GET` | `/conversations` | Legacy: last 100 messages across all sessions |

### Posting a message

```http
POST /api/chat/conversations
Content-Type: application/json

{
  "Question": "What is Node.js?",
  "sessionId": null
}

Response:
{
  "success": true,
  "data": {
    "sessionId": 1,
    "userConversation": { "id": 1, "role": "user", "content": "What is Node.js?" },
    "assistantConversation": { "id": 2, "role": "assistant", "content": "Node.js is..." }
  }
}


## 🌐 Deployment

This project uses three services:

| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Aiven |

### Step 1 — Database (Aiven)

1. Sign up at [https://aiven.io](https://aiven.io)
2. Create a **MySQL** service (free tier works)
3. Copy the connection details: host, port, user, password, database name
4. Import `backend/schema.sql` via Aiven's Query Editor (paste + run)

### Step 2 — Backend (Render)

1. Sign up at [https://render.com](https://render.com) → Continue with GitHub
2. **New +** → **Web Service** → connect your repo
3. **Root Directory:** `backend`
4. **Build Command:** `npm install`
5. **Start Command:** `node index.js`
6. Add environment variables:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
   - `GEMINI_API_KEY`, `GEMINI_MODEL`
7. Deploy → copy the resulting URL

### Step 3 — Frontend (Vercel)

1. Sign up at [https://vercel.com](https://vercel.com) → Continue with GitHub
2. **Add New…** → **Project** → import your repo
3. **Root Directory:** `frontend`
4. Framework: Vite (auto-detected)
5. Add env variable `VITE_API_URL` = your Render URL
6. Deploy

---

## 🔐 Environment Variables

### Backend (`.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default `3877`) |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (MAMP: `8889`) |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_DATABASE` | Database name |
| `GEMINI_API_KEY` | From Google AI Studio |
| `GEMINI_MODEL` | Gemini model name (default `gemini-3.5-flash`) |

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the deployed backend |

---

## 📦 Scripts

| Folder | Script | Runs |
|---|---|---|
| `backend/` | `npm run dev` | nodemon on port 3877 |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Production build to `dist/` |

---

## 📄 License

Educational project — built as part of the Evangadi Bootcamp. Not affiliated with OpenAI or ChatGPT.

## 🌐 Deployed

- **Frontend:** https://gpt-clone-tsion2.vercel.app (Vercel)
- **Backend:** https://gpt-clone-o5hf.onrender.com (Render)
- **Database:** Aiven MySQL (free tier)