import os
import random
import shutil

IMAGE_DIR = "yolo_dataset/images/train"
LABEL_DIR = "yolo_dataset/labels/train"

VAL_IMAGE_DIR = "yolo_dataset/images/val"
VAL_LABEL_DIR = "yolo_dataset/labels/val"

random.seed(42)

os.makedirs(VAL_IMAGE_DIR, exist_ok=True)
os.makedirs(VAL_LABEL_DIR, exist_ok=True)

class_files = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: []
}

# Find images and their class
for filename in os.listdir(IMAGE_DIR):

    if filename.lower().endswith((".jpg", ".jpeg", ".png")):

        image_path = os.path.join(
            IMAGE_DIR,
            filename
        )

        label_name = os.path.splitext(filename)[0] + ".txt"
        label_path = os.path.join(
            LABEL_DIR,
            label_name
        )

        if not os.path.exists(label_path):
            continue

        with open(label_path, "r") as file:
            line = file.readline().strip()

        if line:
            class_id = int(line.split()[0])

            if class_id in class_files:
                class_files[class_id].append(filename)


total_validation = 0

print("\n==============================")
print("80/20 TRAIN-VALIDATION SPLIT")
print("==============================")

# Select 20% from each class
for class_id, files in class_files.items():

    random.shuffle(files)

    validation_count = round(len(files) * 0.20)

    validation_files = files[:validation_count]

    print(
        "Class",
        class_id,
        ":",
        len(files),
        "total ->",
        validation_count,
        "validation"
    )

    for filename in validation_files:

        image_source = os.path.join(
            IMAGE_DIR,
            filename
        )

        image_destination = os.path.join(
            VAL_IMAGE_DIR,
            filename
        )

        label_name = os.path.splitext(filename)[0] + ".txt"

        label_source = os.path.join(
            LABEL_DIR,
            label_name
        )

        label_destination = os.path.join(
            VAL_LABEL_DIR,
            label_name
        )

        shutil.move(
            image_source,
            image_destination
        )

        shutil.move(
            label_source,
            label_destination
        )

        total_validation += 1


print("\n==============================")
print("SPLIT COMPLETED")
print("==============================")
print("Validation images:", total_validation)
print("Remaining training images:",
      sum(len(files) for files in class_files.values()) - total_validation)