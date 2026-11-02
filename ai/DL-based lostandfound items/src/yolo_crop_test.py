import cv2
from ultralytics import YOLO
import os

print("Loading final YOLO model...")

model = YOLO("runs/detect/train-10/weights/best.pt")

print("Model loaded successfully!")

# Test image
image_path = "yolo_dataset/images/val/phone106.jpg"

image = cv2.imread(image_path)

if image is None:
    print("Error: Image could not be loaded.")
    exit()

# Run YOLO detection
results = model(image, verbose=False)

crop_count = 0

# Create output folder
os.makedirs("results", exist_ok=True)

for result in results:

    for box in result.boxes:

        confidence = float(box.conf[0])
        class_id = int(box.cls[0])
        object_name = model.names[class_id]

        if confidence >= 0.50:

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            x1 = int(x1)
            y1 = int(y1)
            x2 = int(x2)
            y2 = int(y2)

            cropped_object = image[y1:y2, x1:x2]

            if cropped_object.size == 0:
                continue

            crop_count += 1

            output_path = f"results/detected_crop_{crop_count}.jpg"

            cv2.imwrite(output_path, cropped_object)

            print("\n==============================")
            print("OBJECT DETECTED")
            print("==============================")
            print("Object:", object_name)
            print("Confidence:", round(confidence * 100, 2), "%")
            print("Crop saved:", output_path)

print("\nTotal objects cropped:", crop_count)