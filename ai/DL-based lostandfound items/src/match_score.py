from src.similarity import image_similarity
from src.clip_features import get_text_embedding
import torch


# ==========================================
# TEXT SIMILARITY
# ==========================================

def text_similarity(text1, text2):

    embedding1 = get_text_embedding(text1)
    embedding2 = get_text_embedding(text2)

    similarity = torch.sum(
        embedding1 * embedding2,
        dim=-1
    )

    return similarity.item()


# ==========================================
# CATEGORY SIMILARITY
# ==========================================

def category_similarity(category1, category2):

    if not category1 or not category2:
        return 0.0

    if category1.strip().lower() == category2.strip().lower():
        return 1.0

    return 0.0


# ==========================================
# COMPLETE MATCH CALCULATION
# ==========================================

def calculate_match(
    lost_image,
    found_image,
    lost_description,
    found_description,
    lost_category,
    found_category
):

    # Image similarity
    image_score = image_similarity(
        lost_image,
        found_image
    )

    # Text similarity
    text_score = text_similarity(
        lost_description,
        found_description
    )

    # Category similarity
    category_score = category_similarity(
        lost_category,
        found_category
    )

    # Different categories = no match
    if category_score == 0:

        final_score = 0.0

    else:

        final_score = (
            0.60 * image_score +
            0.25 * text_score +
            0.15 * category_score
        )

    return (
        image_score,
        text_score,
        category_score,
        final_score
    )


# ==========================================
# TEST
# ==========================================

if __name__ == "__main__":

    lost_image = "dataset/test/phone/phone0.jpg"
    found_image = "dataset/test/phone/phone100.jpg"

    lost_description = "black mobile phone"
    found_description = "black mobile phone"

    lost_category = "phone"
    found_category = "phone"

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

    print("\n================================")
    print("       LOST vs FOUND RESULT")
    print("================================")

    print("Category:", lost_category)

    print(
        "Image Similarity:",
        round(image_score * 100, 2),
        "%"
    )

    print(
        "Text Similarity:",
        round(text_score * 100, 2),
        "%"
    )

    print(
        "Category Similarity:",
        round(category_score * 100, 2),
        "%"
    )

    print(
        "Final Match Score:",
        round(final_score * 100, 2),
        "%"
    )

    threshold = 0.70

    if category_score == 0:

        print("Result: DIFFERENT CATEGORY")

    elif final_score >= threshold:

        print("Result: POSSIBLE MATCH")

    else:

        print("Result: LOW MATCH")