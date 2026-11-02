import cv2
from ultralytics import YOLO

print("Loading YOLO model...")

model = YOLO(
    "runs/detect/train-3/weights/best.pt"
)

print("YOLO model loaded!")

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

print("Camera opened:", cap.isOpened())

if not cap.isOpened():
    print("Camera could not be opened.")
    exit()

print("Starting real-time YOLO...")
print("Press Q to stop.")

while True:

    ret, frame = cap.read()

    if not ret:
        print("Frame could not be read.")
        break

    results = model(
        frame,
        verbose=False
    )

    annotated_frame = results[0].plot()

    cv2.imshow(
        "YOLO Camera Test",
        annotated_frame
    )

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        print("Q pressed.")
        break

cap.release()
cv2.destroyAllWindows()

print("YOLO camera test stopped.")