from clip_features import get_image_embedding
from similarity import image_similarity_from_embeddings
import os


def load_found_items(base_path):

    found_items = []

    categories = [
        "bag",
        "book",
        "key",
        "phone",
        "earphone"
    ]

    for category in categories:

        folder_path = os.path.join(
            base_path,
            category
        )

        if not os.path.exists(folder_path):
            continue

        for filename in os.listdir(folder_path):

            if filename.lower().endswith(
                (".jpg", ".jpeg", ".png")
            ):

                image_path = os.path.join(
                    folder_path,
                    filename
                )

                found_items.append({
                    "image": image_path,
                    "category": category
                })

    return found_items


def rank_matches(
    lost_image,
    lost_category,
    found_items
):

    results = []

    print(
        "\nGenerating lost image embedding..."
    )

    lost_embedding = get_image_embedding(
        lost_image
    )

    total = len(found_items)

    for index, found_item in enumerate(
        found_items,
        start=1
    ):

        found_image = found_item["image"]

        # Exclude the exact lost image
        if os.path.normcase(
            os.path.abspath(found_image)
        ) == os.path.normcase(
            os.path.abspath(lost_image)
        ):

            continue

        # Category filtering
        if (
            found_item["category"].lower()
            != lost_category.lower()
        ):

            continue

        found_embedding = get_image_embedding(
            found_image
        )

        image_score = image_similarity_from_embeddings(
            lost_embedding,
            found_embedding
        )

        results.append({
            "image": found_image,
            "category": found_item["category"],
            "score": image_score
        })

        if index % 100 == 0:

            print(
                "Processed:",
                index,
                "/",
                total
            )

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results


if __name__ == "__main__":

    lost_image = (
        "dataset/test/phone/phone0.jpg"
    )

    lost_category = "phone"

    print(
        "\n================================"
    )

    print(
        "       LOST & FOUND AI"
    )

    print(
        "================================"
    )

    print(
        "Lost Image:",
        lost_image
    )

    print(
        "Lost Category:",
        lost_category
    )

    found_items = load_found_items(
        "dataset/test"
    )

    print(
        "\nTotal dataset images:",
        len(found_items)
    )

    results = rank_matches(
        lost_image,
        lost_category,
        found_items
    )

    print(
        "\n================================"
    )

    print(
        "       TOP 10 MATCHES"
    )

    print(
        "================================"
    )

    for i, result in enumerate(
        results[:10],
        start=1
    ):

        score_percentage = (
            result["score"] * 100
        )

        print(
            "\nRank:",
            i
        )

        print(
            "Found Image:",
            result["image"]
        )

        print(
            "Category:",
            result["category"]
        )

        print(
            "CLIP Similarity:",
            round(
                score_percentage,
                2
            ),
            "%"
        )

        if result["score"] >= 0.65:

            print(
                "Status: POSSIBLE MATCH"
            )

        else:

            print(
                "Status: LOW MATCH"
            )

    print(
        "\n================================"
    )

    print(
        "Match threshold: 65%"
    )

    print(
        "================================"
    )