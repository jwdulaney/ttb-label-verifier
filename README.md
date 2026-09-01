# AI-Powered Alcohol Label Verification Tool (TTB POC)

A proof-of-concept compliance application designed for the Alcohol and Tobacco Tax and Trade Bureau (TTB) Compliance Division to automate routine label field verification and reduce review times from minutes to under 5 seconds.

## 🚀 Key Requirements Addressed

- **Sub-5 Second Latency Target**: Uses lightweight multimodal Vision AI (Google Gemini 2.5 Flash / GPT-4o-mini) to extract and grade compliance fields in ~1.5–3 seconds.
- **Strict Government Warning Rules**: Enforces exact string matching and checks for mandatory uppercase formatting (`GOVERNMENT WARNING:`).
- **Fuzzy Text Matching**: Implements `rapidfuzz` string similarity to prevent false rejections on minor stylistic variations (e.g., "STONE'S THROW" vs "Stone's Throw").
- **Agent Accessibility**: Built with high contrast, large text, and clear visual pass/fail/review statuses designed for agents of varying technical comfort levels.
- **Batch Application Verification**: API support for bulk label application checks.

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **Backend**: Python 3.10+, FastAPI, RapidFuzz, Pydantic
- **AI/Vision Engine**: Google Gemini API (`gemini-2.5-flash`) / OpenAI API (`gpt-4o-mini`)

## 📦 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Gemini or OpenAI API Key

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with your API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Run FastAPI server
uvicorn main:app --reload --port 8000
```
