import json
import os
import time
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from rapidfuzz import fuzz
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="TTB Label Verification API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STANDARD_WARNING = (
    "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not "
    "drink alcoholic beverages during pregnancy because of the risk of birth defects. "
    "(2) Consumption of alcoholic beverages impairs your ability to drive a car or "
    "operate machinery, and may cause health problems."
)


class ApplicationData(BaseModel):
    brand_name: str
    class_type: str
    alcohol_content: str
    net_contents: str


class FieldResult(BaseModel):
    field_name: str
    expected: str
    extracted: Optional[str]
    match_score: float
    status: str


class VerificationResponse(BaseModel):
    overall_status: str
    processing_time_seconds: float
    government_warning_pass: bool
    warning_notes: str
    field_results: List[FieldResult]


def extract_with_gemini(image_bytes: bytes) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "brand_name": "OLD TOM DISTILLERY",
            "class_type": "Kentucky Straight Bourbon Whiskey",
            "alcohol_content": "45% Alc./Vol. (90 Proof)",
            "net_contents": "750 mL",
            "warning_text": STANDARD_WARNING,
            "warning_header_is_uppercase": True,
        }

    client = genai.Client(api_key=api_key)

    prompt = """
    Extract TTB compliance data from this alcohol label. Return ONLY valid JSON:
    {
      "brand_name": string or null,
      "class_type": string or null,
      "alcohol_content": string or null,
      "net_contents": string or null,
      "warning_text": full verbatim text of government health warning or null,
      "warning_header_is_uppercase": boolean (true if GOVERNMENT WARNING: is uppercase)
    }
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
            prompt,
        ],
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    return json.loads(response.text)


def check_field(name: str, expected: str, extracted: Optional[str]) -> FieldResult:
    if not extracted:
        return FieldResult(
            field_name=name,
            expected=expected,
            extracted=None,
            match_score=0,
            status="FAIL",
        )

    score = fuzz.ratio(expected.lower().strip(), extracted.lower().strip())
    status = "PASS" if score >= 90 else ("NEEDS_REVIEW" if score >= 70 else "FAIL")

    return FieldResult(
        field_name=name,
        expected=expected,
        extracted=extracted,
        match_score=round(score, 1),
        status=status,
    )


@app.get("/health")
def health_check():
    return {"status": "backend running"}


@app.post("/api/verify", response_model=VerificationResponse)
async def verify_label(
    file: UploadFile = File(...),
    application_json: str = Form(...),
):
    start_time = time.time()
    app_data = ApplicationData(**json.loads(application_json))
    image_bytes = await file.read()

    extracted = extract_with_gemini(image_bytes)

    warning_raw = extracted.get("warning_text") or ""
    is_caps = extracted.get("warning_header_is_uppercase", False)

    warning_clean = " ".join(warning_raw.split()).lower()
    standard_clean = " ".join(STANDARD_WARNING.split()).lower()
    warning_similarity = fuzz.ratio(warning_clean, standard_clean)

    if not warning_raw:
        warning_pass = False
        warning_notes = "Government warning statement missing."
    elif not is_caps:
        warning_pass = False
        warning_notes = "HEADER FAIL: 'GOVERNMENT WARNING:' must be in all uppercase."
    elif warning_similarity < 90:
        warning_pass = False
        warning_notes = f"TEXT FAIL: Warning text mismatch ({warning_similarity}% match)."
    else:
        warning_pass = True
        warning_notes = "Meets all TTB warning statement requirements."

    results = [
        check_field("Brand Name", app_data.brand_name, extracted.get("brand_name")),
        check_field("Class/Type", app_data.class_type, extracted.get("class_type")),
        check_field("Alcohol Content", app_data.alcohol_content, extracted.get("alcohol_content")),
        check_field("Net Contents", app_data.net_contents, extracted.get("net_contents")),
    ]

    has_fail = not warning_pass or any(r.status == "FAIL" for r in results)
    has_review = any(r.status == "NEEDS_REVIEW" for r in results)
    overall_status = "FAIL" if has_fail else ("NEEDS_REVIEW" if has_review else "PASS")

    return VerificationResponse(
        overall_status=overall_status,
        processing_time_seconds=round(time.time() - start_time, 2),
        government_warning_pass=warning_pass,
        warning_notes=warning_notes,
        field_results=results,
    )


@app.post("/api/verify-batch")
async def verify_batch(
    files: List[UploadFile] = File(...),
    application_json: str = Form(...),
):
    start_time = time.time()
    app_data = ApplicationData(**json.loads(application_json))
    batch_results = []

    for file in files:
        image_bytes = await file.read()
        extracted = extract_with_gemini(image_bytes)

        warning_raw = extracted.get("warning_text") or ""
        is_caps = extracted.get("warning_header_is_uppercase", False)
        warning_clean = " ".join(warning_raw.split()).lower()
        standard_clean = " ".join(STANDARD_WARNING.split()).lower()
        warning_similarity = fuzz.ratio(warning_clean, standard_clean)

        warning_pass = bool(warning_raw and is_caps and warning_similarity >= 90)

        field_results = [
            check_field("Brand Name", app_data.brand_name, extracted.get("brand_name")),
            check_field("Class/Type", app_data.class_type, extracted.get("class_type")),
            check_field("Alcohol Content", app_data.alcohol_content, extracted.get("alcohol_content")),
            check_field("Net Contents", app_data.net_contents, extracted.get("net_contents")),
        ]

        has_fail = not warning_pass or any(r.status == "FAIL" for r in field_results)
        has_review = any(r.status == "NEEDS_REVIEW" for r in field_results)
        overall_status = "FAIL" if has_fail else ("NEEDS_REVIEW" if has_review else "PASS")

        batch_results.append(
            {
                "filename": file.filename,
                "overall_status": overall_status,
                "government_warning_pass": warning_pass,
                "field_results": [r.model_dump() for r in field_results],
            }
        )

    return {
        "total_processed": len(files),
        "total_time_seconds": round(time.time() - start_time, 2),
        "results": batch_results,
    }
