from clip_features import get_image_embedding, get_text_embedding


def get_lost_item():

    print("\n================================")
    print("       LOST ITEM DETAILS")
    print("================================")

    image_path = input(
        "Enter lost image path: "
    )

    category = input(
        "Enter lost item category: "
    )

    description = input(
        "Enter lost item description: "
    )

    return (
        image_path,
        category,
        description
    )


if __name__ == "__main__":

    (
        image_path,
        category,
        description
    ) = get_lost_item()


    print("\n================================")
    print("       INPUT RECEIVED")
    print("================================")

    print(
        "Image:",
        image_path
    )

    print(
        "Category:",
        category
    )

    print(
        "Description:",
        description
    )


    print("\nGenerating CLIP embeddings...")

    image_embedding = get_image_embedding(
        image_path
    )

    text_embedding = get_text_embedding(
        description
    )


    print(
        "Image embedding shape:",
        image_embedding.shape
    )

    print(
        "Text embedding shape:",
        text_embedding.shape
    )

    print(
        "\nLost item input and CLIP embeddings generated successfully!"
    )