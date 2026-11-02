import os
import cv2

BASE = "dataset/test"
OUTPUT = "yolo_dataset/labels/candidates"

CLASSES = {
    "bag": 0,
    "book": 1,
    "key": 2,
    "phone": 3,
    "earphone": 4
}

os.makedirs(OUTPUT, exist_ok=True)

total = 0
created = 0

for category, class_id in CLASSES.items():

    folder = os.path.join(BASE, category)

    if not os.path.exists(folder):
        print("Folder not found:", folder)
        continue

    files = os.listdir(folder)

    category_count = 0

    for filename in files:

        image_path = os.path.join(folder, filename)

        image = cv2.imread(image_path)

        if image is None:
            continue

        height, width = image.shape[:2]

        if width == 0 or height == 0:
            continue

        # Candidate box covering the whole image
        x_center = 0.5
        y_center = 0.5
        box_width = 1.0
        box_height = 1.0

        label_name = os.path.splitext(filename)[0] + ".txt"

        label_path = os.path.join(
            OUTPUT,
            label_name
        )

        with open(label_path, "w") as f:
            f.write(
                f"{class_id} "
                f"{x_center} "
                f"{y_center} "
                f"{box_width} "
                f"{box_height}\n"
            )

        total += 1
        created += 1
        category_count += 1

    print(category, ":", category_count, "candidate labels created")

print("\n==============================")
print("CANDIDATE LABEL GENERATION")
print("==============================")
print("Total images checked:", total)
print("Candidate labels created:", created)
print("Output folder:", OUTPUT)