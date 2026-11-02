from src.clip_features import get_image_embedding
import torch


# ==========================================
# IMAGE SIMILARITY FROM EMBEDDINGS
# ==========================================

def image_similarity_from_embeddings(
    lost_embedding,
    found_embedding
):

    similarity = torch.sum(
        lost_embedding * found_embedding,
        dim=-1
    )

    return similarity.item()


# ==========================================
# IMAGE SIMILARITY
# ==========================================

def image_similarity(
    image1_path,
    image2_path
):

    image1_embedding = get_image_embedding(
        image1_path
    )

    image2_embedding = get_image_embedding(
        image2_path
    )

    return image_similarity_from_embeddings(
        image1_embedding,
        image2_embedding
    )


# ==========================================
# TEST
# ==========================================

if __name__ == "__main__":

    image1 = "dataset/test/phone/phone0.jpg"

    image2 = "dataset/test/phone/phone100.jpg"

    similarity = image_similarity(
        image1,
        image2
    )

    print("\n================================")
    print("       IMAGE SIMILARITY TEST")
    print("================================")

    print(
        "Image 1:",
        image1
    )

    print(
        "Image 2:",
        image2
    )

    print(
        "Cosine Similarity:",
        round(similarity, 4)
    )

    print(
        "Similarity Percentage:",
        round(similarity * 100, 2),
        "%"
    )