from fastapi import FastAPI
from pydantic import BaseModel

from src.ai_pipeline import run_ai_pipeline


app = FastAPI(
    title="Lost and Found AI API"
)


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


@app.get("/")
def home():
    return {
        "message": "Lost and Found AI API is running"
    }


@app.post("/match")
def match_items(request: MatchRequest):

    result = run_ai_pipeline(
        lost_image=request.lost_image,
        found_image=request.found_image,

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
        return {
            "message": "AI pipeline could not process the image"
        }

    return result
    