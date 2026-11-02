from flask import Flask, request, jsonify
from src.match_score import calculate_match

app = Flask(__name__)


@app.route("/match", methods=["POST"])
def match_items():

    try:
        lost_image = request.json["lost_image"]
        found_image = request.json["found_image"]

        lost_description = request.json["lost_description"]
        found_description = request.json["found_description"]

        lost_category = request.json["lost_category"]
        found_category = request.json["found_category"]

        (
            image_score,
            text_score,
            category_score,
            final_score
        ) = calculate_match(
            lost_image,
            found_image,
            lost_description,
            found_description,
            lost_category,
            found_category
        )

        if category_score == 0:
            result = "DIFFERENT CATEGORY"
        elif final_score >= 0.70:
            result = "POSSIBLE MATCH"
        else:
            result = "LOW MATCH"

        return jsonify({
            "imageScore": round(image_score, 4),
            "textScore": round(text_score, 4),
            "categoryScore": round(category_score, 4),
            "finalScore": round(final_score, 4),
            "result": result
        })

    except Exception as error:

        return jsonify({
            "message": str(error)
        }), 500


if __name__ == "__main__":

    print("AI Matching API starting...")

    app.run(
        host="127.0.0.1",
        port=8000,
        debug=False
    )
