# AI-Powered Alcohol Label Verification Tool (TTB POC)

A proof-of-concept compliance application built for the Alcohol and Tobacco Tax and Trade Bureau (TTB) to accelerate routine label verification for agents reviewing alcohol labeling submissions.

This tool helps review brands, class/type, alcohol content, net contents, and government warning compliance using AI-assisted extraction and fuzzy validation.

## What this app does

- Extracts key label data from uploaded label artwork
- Compares extracted values against submitted application data
- Checks the required government warning statement and uppercase formatting rule
- Uses fuzzy matching to reduce false rejections caused by minor text differences
- Supports both single-label and batch verification workflows

## Tech stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Python, FastAPI, Pydantic, RapidFuzz
- AI: Google Gemini 2.5 Flash (with a local fallback dataset if no key is configured)

## 🌐 Live Deployments & Endpoints

- **Frontend Application (Vercel)**: [https://ttb-label-verifier-1qd42rhp1-jwdulaney.vercel.app/](https://ttb-label-verifier-1qd42rhp1-jwdulaney.vercel.app/)
- **Backend API Service (Render)**: [https://ttb-label-verifier-jd.onrender.com](https://ttb-label-verifier-jd.onrender.com)
- **Interactive API Documentation (Swagger)**: [https://ttb-label-verifier-jd.onrender.com/docs](https://ttb-label-verifier-jd.onrender.com/docs)
- **API Health Check**: [https://ttb-label-verifier-jd.onrender.com/health](https://ttb-label-verifier-jd.onrender.com/health)

## Local setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Gemini API key

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:

```env
GEMINI_API_KEY=your_key_here
```

Then start the API:

```bash
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

- http://localhost:3000

## Notes

- The app is deployed to production (Vercel frontend + Render backend) and accessible via the live URLs above.
- For local development, it's designed as a proof-of-concept to be run in a development environment.
- If no Gemini API key is configured, the backend uses a fallback sample dataset so the UI can still be demonstrated.
- The current version focuses on agent usability, quick review workflows, and compliance-check logic rather than production-grade OCR or TTB regulatory automation.

## Environment Variables

### Backend (Render)
- `GEMINI_API_KEY` - Google Gemini API key for label text extraction

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` - Backend API URL (defaults to `https://ttb-label-verifier-jd.onrender.com`)

## API Endpoints

### Health & Status
- `GET /` - Service status
- `GET /health` - API health check

### Verification Endpoints
- `POST /api/verify` - Single label verification
  - **Request**: Multipart form with `file` (image) and `application_json` (COLA data)
  - **Response**: Verification results with field scores and warning compliance status
  
- `POST /api/verify-batch` - Batch label verification
  - **Request**: Multipart form with multiple `files` and `application_json`
  - **Response**: Array of verification results with processing time

### Interactive Documentation
- `GET /docs` - Swagger UI (available at backend URL)

## Project Structure

```
ttb-label-verifier/
├── backend/
│   ├── main.py              # FastAPI application with verification logic
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Local environment (not tracked)
├── frontend/
│   ├── src/app/page.tsx     # Main React component
│   └── package.json         # Node dependencies
├── README.md
└── .gitignore               # Excludes .env and build artifacts
```

## Security Notes

- The `.env` file is never committed to Git (see `.gitignore`)
- All API keys are stored as environment variables on the deployment platforms
- CORS is configured to allow cross-origin requests from deployed frontend
