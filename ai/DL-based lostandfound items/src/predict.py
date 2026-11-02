from rank_matches import (
    rank_matches,
    load_found_items
)


def predict_matches(
    lost_image,
    lost_category
):

    found_items = load_found_items(
        "dataset/test"
    )

    results = rank_matches(
        lost_image,
        lost_category,
        found_items
    )

    threshold = 0.65

    matches = []

    for result in results:

        if result["score"] >= threshold:

            matches.append({
                "image": result["image"],
                "category": result["category"],
                "score": round(
                    result["score"] * 100,
                    2
                ),
                "status": "POSSIBLE MATCH"
            })

    return matches


if __name__ == "__main__":

    lost_image = (
        "dataset/test/phone/phone0.jpg"
    )

    lost_category = "phone"

    print("\n================================")
    print("       AI PREDICTION")
    print("================================")

    matches = predict_matches(
        lost_image,
        lost_category
    )

    print(
        "\nPossible matches:",
        len(matches)
    )

    print(
        "\n===== TOP 10 RESULTS ====="
    )

    for index, match in enumerate(
        matches[:10],
        start=1
    ):

        print(
            "\nRank:",
            index
        )

        print(
            "Found Image:",
            match["image"]
        )

        print(
            "Category:",
            match["category"]
        )

        print(
            "Match Score:",
            match["score"],
            "%"
        )

        print(
            "Status:",
            match["status"]
        )

    print(
        "\n================================"
    )