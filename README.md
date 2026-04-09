# PromptPilot AI

> AI-powered prompt optimization platform. Transform messy ideas into polished, token-efficient prompts for Claude, GPT, Gemini, Grok, and custom models.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS, Zustand, Framer Motion |
| Backend   | FastAPI, Pydantic v2, Groq SDK      |
| AI        | Groq API (llama-3.3-70b-versatile)  |

---

## Project Structure

```
promptpilot/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI route handlers
│   │   ├── core/             # Config & settings
│   │   ├── schemas/          # Pydantic models
│   │   ├── services/         # Groq LLM service
│   │   └── utils/            # Token estimation
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   │   ├── layout/       # TopBar, Sidebar
    │   │   ├── workspace/    # InputPanel, ResultPanel
    │   │   ├── history/      # HistoryView
    │   │   ├── templates/    # TemplatesView
    │   │   ├── settings/     # SettingsView
    │   │   └── ui/           # Shared UI atoms
    │   ├── hooks/            # Custom React hooks
    │   ├── store/            # Zustand global store
    │   ├── types/            # TypeScript types
    │   └── utils/            # API client, helpers
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Quick Start

### 1. Get a Groq API Key

Sign up at [console.groq.com](https://console.groq.com) — it's free.

---

### 2. Set up the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your GROQ_API_KEY

# Run the server
uvicorn main:app --reload --port 8000
```

Backend will be live at: http://localhost:8000
API docs at: http://localhost:8000/api/docs

---

### 3. Set up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be live at: http://localhost:5173

---

## Features

### Core
- **Prompt Refinement** — Transforms rough ideas into polished, structured prompts
- **Compression Modes** — Detailed / Balanced / Minimal optimization levels
- **Model-Specific Tuning** — Adapted for Claude, GPT, Gemini, Grok, Custom
- **Token Analysis** — Input, output, and total token estimation with reduction %
- **Prompt Quality Score** — Clarity, Structure, Specificity, Token Efficiency (0-100)
- **Compare View** — Side-by-side original vs refined prompt
- **Editable Workspace** — Edit, re-optimize, compress your prompt post-generation

### UX
- **Prompt History** — LocalStorage persistence, load & re-use past prompts
- **Templates** — 12 starter templates across Development, AI, Design, Data categories
- **Copy & Export** — One-click copy or download as `.txt`
- **Dark / Light Theme** — Premium white-green theme with smooth toggle
- **Responsive Layout** — Works on all screen sizes

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                        | Default                    |
|----------------|------------------------------------|----------------------------|
| `GROQ_API_KEY` | Your Groq API key (required)       | —                          |
| `GROQ_MODEL`   | Groq model to use                  | `llama-3.3-70b-versatile`  |
| `ALLOWED_ORIGINS` | CORS allowed origins            | `["http://localhost:5173"]` |
| `DEBUG`        | Enable debug mode                  | `false`                    |

---

## Deployment

### Backend (Railway / Render / Fly.io)

```bash
# Set env vars in your platform dashboard
# Start command:
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel / Netlify)

```bash
npm run build
# Deploy the `dist/` folder
# Set VITE_API_BASE to your backend API origin, including /api
```

For production, set:
```env
VITE_API_BASE=https://your-backend.example.com/api
```

Local development still uses the Vite proxy at `/api`.

---

## API Endpoints

| Method | Path                  | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/api/health`         | Health check                   |
| POST   | `/api/prompt/refine`  | Refine + score a prompt        |
| POST   | `/api/prompt/compress`| Compress an existing prompt    |
| POST   | `/api/prompt/analyze` | Analyze prompt quality         |

Full interactive docs: `http://localhost:8000/api/docs`

---

## Development Tips

- The Groq model `llama-3.3-70b-versatile` is fast and free-tier friendly
- Token estimates are approximate (±10%) — exact tokenizers vary per model
- History is stored in `localStorage` — no database needed for MVP
- Swap Groq for any OpenAI-compatible API by editing `groq_service.py`
