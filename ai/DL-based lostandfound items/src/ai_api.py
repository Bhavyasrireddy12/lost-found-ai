
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.ai_pipeline import run_ai_pipeline

import os
import tempfile
import requests
from urllib.parse import urlparse


app = FastAPI(title="Lost and Found AI API")


class MatchRequest(BaseModel):
    lost_image: str
    found_image: str
    lost_description: str
    found_description: str
    lost_category: str
    found_category: str
    lost_location: str
    found_location: str
    lost_time: str
    found_time: str


def download_cloudinary_image(url):
    parsed = urlparse(url)

    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or not (
            parsed.hostname == "cloudinary.com"
            or parsed.hostname.endswith(".cloudinary.com")
        )
    ):
        raise ValueError("Only valid Cloudinary HTTPS image URLs are allowed")

    response = requests.get(url, stream=True, timeout=30)
    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "").split(";")[0]
    if not content_type.startswith("image/"):
        raise ValueError("URL did not return an image")

    suffix = ".jpg"
    if content_type == "image/png":
        suffix = ".png"
    elif content_type == "image/webp":
        suffix = ".webp"

    temp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    size = 0

    try:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                size += len(chunk)
                if size > 10 * 1024 * 1024:
                    raise ValueError("Image exceeds 10 MB")
                temp.write(chunk)

        temp.close()

        if size == 0:
            raise ValueError("Downloaded image is empty")

        return temp.name

    except Exception:
        temp.close()
        if os.path.exists(temp.name):
            os.remove(temp.name)
        raise

    finally:
        response.close()


@app.get("/")
def home():
    return {"message": "Lost and Found AI API is running"}


@app.post("/match")
def match_items(request: MatchRequest):
    lost_path = None
    found_path = None

    try:
        lost_path = download_cloudinary_image(request.lost_image)
        found_path = download_cloudinary_image(request.found_image)

        result = run_ai_pipeline(
            lost_image=lost_path,
            found_image=found_path,
            lost_description=request.lost_description,
            found_description=request.found_description,
            lost_category=request.lost_category,
            found_category=request.found_category,
            lost_location=request.lost_location,
            found_location=request.found_location,
            lost_time=request.lost_time,
            found_time=request.found_time
        )

        if result is None:
            return {"message": "AI pipeline could not process the image"}

        return result

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

    finally:
        for path in [lost_path, found_path]:
            if path and os.path.exists(path):
                os.remove(path)
