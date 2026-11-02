import cv2
from ultralytics import YOLO

print("Loading custom YOLO model...")

model = YOLO("runs/detect/train-3/weights/best.pt")

print("Custom YOLO model loaded successfully!")
print("Starting real-time monitoring...")
print("Press Q to stop.")

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Camera could not be opened.")
    exit()

while True:

    # Read camera frame
    ret, frame = cap.read()

    if not ret:
        print("Error: Could not read frame.")
        break

    # Run custom YOLO detection
    results = model(frame, verbose=False)

    for result in results:

        boxes = result.boxes

        for box in boxes:

            # Bounding box coordinates
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            # Confidence
            confidence = float(box.conf[0])

            # Class ID
            class_id = int(box.cls[0])

            # Class name
            object_name = model.names[class_id]

            # Only display confident detections
            if confidence >= 0.50:

                x1 = int(x1)
                y1 = int(y1)
                x2 = int(x2)
                y2 = int(y2)

                # Draw bounding box
                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2
                )

                # Create label
                label = f"{object_name}: {confidence * 100:.1f}%"

                # Keep text inside the camera frame
                text_y = max(y1 - 10, 30)

                # Draw label
                cv2.putText(
                    frame,
                    label,
                    (x1, text_y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 0),
                    2,
                    cv2.LINE_AA
                )

    # Title
    cv2.putText(
        frame,
        "CCTV REAL-TIME MONITORING",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2,
        cv2.LINE_AA
    )

    # Show camera
    cv2.imshow(
        "Lost and Found - CCTV",
        frame
    )

    # Press Q to stop
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release camera
cap.release()
cv2.destroyAllWindows()

print("Monitoring stopped.")