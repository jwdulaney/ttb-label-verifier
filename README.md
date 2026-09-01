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

## Live Deployments & Endpoints

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

- The app is designed as a local proof-of-concept and is meant to be run in a development environment.
- If no API key is configured, the backend uses a fallback sample dataset so the UI can still be demonstrated.
- The current version focuses on agent usability, quick review workflows, and compliance-check logic rather than production-grade OCR or TTB regulatory automation.
