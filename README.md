# AI-Powered Alcohol Label Verification App (TTB POC)

## Project Overview
A proof-of-concept application designed to assist Compliance Division agents in verifying alcohol label applications. This tool uses AI-powered vision and text-matching to automate routine verification tasks (like checking Brand Name, ABV, and strict Government Warning formatting) to reduce processing time from 5-10 minutes to under 5 seconds.

## Architecture
This is a monorepo containing:
- **Backend**: Python / FastAPI (Handles image processing, AI/OCR extraction, and fuzzy matching)
- **Frontend**: Next.js / Tailwind CSS (Provides an accessible, side-by-side verification UI for agents)

## Key Features
- **Sub-5 Second Processing**: Optimized AI extraction for rapid label processing.
- **Strict Compliance Checking**: Exact string matching for the mandatory Government Health Warning, including formatting rules (e.g., all-caps, bold).
- **Fuzzy Matching**: Intelligent matching for fields like Brand Name (e.g., "STONE'S THROW" vs "Stone's Throw").
- **Batch Processing**: (WIP) Support for bulk label application verification.

## Prerequisites
- Node.js (v18+)
- Python (3.10+)
- OpenAI API Key (or chosen Vision API provider)

## Setup Instructions

*(Setup instructions will go here once the backend and frontend are scaffolded)*
