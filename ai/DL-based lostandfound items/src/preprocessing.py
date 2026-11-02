import cv2
import numpy as np
import os


# ==========================================
# CATEGORY LABELS
# ==========================================

LABELS = {
    "book": 0,
    "key": 1,
    "bag": 2,
    "phone": 3,
    "earphone": 4
}


# ==========================================
# CONVERT CATEGORY TO LABEL
# ==========================================

def get_label(category):
    return LABELS[category]


# ==========================================
# CONVERT LABEL TO CATEGORY
# ==========================================

def get_category(label):

    for category, value in LABELS.items():

        if value == label:
            return category

    return "unknown"


# ==========================================
# IMAGE PREPROCESSING
# ==========================================

def preprocess_image(image_path):

    # Read image
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Image not found: " + image_path)

    # Convert BGR to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Resize image to 224 x 224
    image = cv2.resize(image, (224, 224))

    # Remove small amount of noise
    image = cv2.GaussianBlur(image, (3, 3), 0)

    # Normalize pixel values from 0-255 to 0-1
    image = image.astype(np.float32) / 255.0

    return image


# ==========================================
# MAIN TEST
# ==========================================

if __name__ == "__main__":

    # IMPORTANT:
    # New images were added to dataset/train
    base_path = "dataset/train"

    categories = [
        "bag",
        "book",
        "key",
        "phone",
        "earphone"
    ]


    # ======================================
    # TEST FIRST 3 IMAGES OF EACH CATEGORY
    # ======================================

    for category in categories:

        folder_path = os.path.join(base_path, category)

        print("\nTesting category:", category)

        if not os.path.exists(folder_path):
            print("Folder not found:", folder_path)
            continue

        image_files = [
            filename
            for filename in os.listdir(folder_path)
            if filename.lower().endswith(
                (".jpg", ".jpeg", ".png", ".bmp", ".webp")
            )
        ]

        # Test first 3 images
        for filename in image_files[:3]:

            image_path = os.path.join(folder_path, filename)

            try:

                processed_image = preprocess_image(image_path)

                print(
                    filename,
                    "✓",
                    processed_image.shape,
                    "Range:",
                    processed_image.min(),
                    "-",
                    processed_image.max()
                )

            except Exception as e:

                print(filename, "✗", e)


    # ======================================
    # DATASET SUMMARY
    # ======================================

    print("\n===== DATASET SUMMARY =====")

    total_images = 0

    for category in categories:

        folder_path = os.path.join(base_path, category)

        if not os.path.exists(folder_path):
            print(category, ": folder not found")
            continue

        image_files = [
            filename
            for filename in os.listdir(folder_path)
            if filename.lower().endswith(
                (".jpg", ".jpeg", ".png", ".bmp", ".webp")
            )
        ]

        count = len(image_files)

        print(
            category,
            ":",
            count,
            "images"
        )

        total_images += count


    # ======================================
    # TOTAL IMAGE COUNT
    # ======================================

    print("\nTotal images:", total_images)

    print("\n===== PREPROCESSING TEST COMPLETE =====")