import cv2

print("Starting camera test...")

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

print("Camera opened:", cap.isOpened())

if not cap.isOpened():
    print("Camera could not be opened.")
    exit()

while True:

    ret, frame = cap.read()

    print("Frame received:", ret)

    if not ret:
        print("Could not read frame.")
        break

    cv2.imshow("Camera Test", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

print("Camera test stopped.")