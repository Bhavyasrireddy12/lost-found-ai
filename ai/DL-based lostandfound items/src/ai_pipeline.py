
import os
import cv2

from pathlib import Path
from ultralytics import YOLO

from src.similarity import image_similarity
from src.match_score import text_similarity, category_similarity
from src.context_score import calculate_context_score


# =====================================================
# PROJECT PATHS
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "best.pt"
RESULTS_DIR = BASE_DIR / "results"

RESULTS_DIR.mkdir(parents=True, exist_ok=True)


# =====================================================
# LOAD YOLO MODEL
# =====================================================

print("Loading YOLO model...")
print("Model path:", MODEL_PATH)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"YOLO model not found: {MODEL_PATH}. "
        "Place best.pt inside the models folder."
    )

model = YOLO(str(MODEL_PATH))

print("YOLO model loaded successfully!")


# =====================================================
# IMAGE PREPROCESSING
# =====================================================

def preprocess_image(image_path, output_name):

    print("\nSTEP 0: OpenCV Image Preprocessing")

    image_path = Path(image_path)

    if not image_path.exists():
        print("Image not found:", image_path)
        return None

    image = cv2.imread(str(image_path))

    if image is None:
        print("OpenCV could not load image:", image_path)
        return None

    height, width = image.shape[:2]

    print("Original size:", width, "x", height)

    # Resize image
    processed = cv2.resize(
        image,
        (640, 640),
        interpolation=cv2.INTER_AREA
    )

    # Noise reduction
    processed = cv2.GaussianBlur(
        processed,
        (3, 3),
        0
    )

    # Brightness and contrast enhancement
    lab = cv2.cvtColor(
        processed,
        cv2.COLOR_BGR2LAB
    )

    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    enhanced_l = clahe.apply(l_channel)

    enhanced_lab = cv2.merge(
        (enhanced_l, a_channel, b_channel)
    )

    processed = cv2.cvtColor(
        enhanced_lab,
        cv2.COLOR_LAB2BGR
    )

    processed_path = RESULTS_DIR / output_name

    success = cv2.imwrite(
        str(processed_path),
        processed
    )

    if not success:
        print("Could not save processed image.")
        return None

    print("Processed image saved:", processed_path)

    return str(processed_path)


# =====================================================
# YOLO DETECTION
# =====================================================

def detect_and_crop(image_path, output_prefix):

    print("\nSTEP 1: YOLO Detection")

    processed_path = preprocess_image(
        image_path,
        f"{output_prefix}_preprocessed.jpg"
    )

    if processed_path is None:
        return None, None

    image = cv2.imread(processed_path)

    if image is None:
        return None, None

    results = model(
        image,
        imgsz=640,
        conf=0.25,
        verbose=False
    )

    best_crop = None
    best_class = None
    best_confidence = 0.0

    for result in results:

        if result.boxes is None:
            continue

        for box in result.boxes:

            confidence = float(box.conf[0])
            class_id = int(box.cls[0])

            if confidence <= best_confidence:
                continue

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            x1 = max(0, int(x1))
            y1 = max(0, int(y1))

            x2 = min(image.shape[1], int(x2))
            y2 = min(image.shape[0], int(y2))

            crop = image[y1:y2, x1:x2]

            if crop.size == 0:
                continue

            best_crop = crop
            best_class = model.names[class_id]
            best_confidence = confidence

    # No object detected: use processed image
    if best_crop is None:

        print("No object detected by YOLO.")
        print("Using processed image instead.")

        return processed_path, None

    crop_path = RESULTS_DIR / f"{output_prefix}_crop.jpg"

    success = cv2.imwrite(
        str(crop_path),
        best_crop
    )

    if not success:
        print("Could not save detected crop.")
        return processed_path, None

    print("Detected category:", best_class)
    print("Confidence:", round(best_confidence * 100, 2), "%")
    print("Crop saved:", crop_path)

    return str(crop_path), best_class


# =====================================================
# COMPLETE AI MATCHING PIPELINE
# =====================================================

def run_ai_pipeline(
    lost_image,
    found_image,
    lost_description,
    found_description,
    lost_category,
    found_category,
    lost_location,
    found_location,
    lost_time,
    found_time
):

    print("\n================================")
    print("       AI MATCHING PIPELINE")
    print("================================")

    # Validate both image files
    lost_image = Path(lost_image)
    found_image = Path(found_image)

    if not lost_image.is_file():
        raise FileNotFoundError(
            f"Lost image not found: {lost_image}"
        )

    if not found_image.is_file():
        raise FileNotFoundError(
            f"Found image not found: {found_image}"
        )

    # STEP 1: OpenCV + YOLO
    lost_crop, detected_category = detect_and_crop(
        lost_image,
        "lost"
    )

    if lost_crop is None:
        raise ValueError("Lost image could not be processed.")

    found_crop, found_detected_category = detect_and_crop(
        found_image,
        "found"
    )

    if found_crop is None:
        raise ValueError("Found image could not be processed.")

    # STEP 2: IMAGE SIMILARITY
    print("\nSTEP 2: Image Similarity")

    try:
        image_score = image_similarity(
            lost_crop,
            found_crop
        )

        image_score = float(image_score)

    except Exception as error:
        print("Image similarity error:", str(error))
        image_score = 0.0

    # STEP 3: TEXT SIMILARITY
    print("\nSTEP 3: Text Similarity")

    try:
        text_score = float(
            text_similarity(
                lost_description or "",
                found_description or ""
            )
        )

    except Exception as error:
        print("Text similarity error:", str(error))
        text_score = 0.0

    # STEP 4: CATEGORY SIMILARITY
    print("\nSTEP 4: Category Similarity")

    try:
        category_score = float(
            category_similarity(
                lost_category or "",
                found_category or ""
            )
        )

    except Exception as error:
        print("Category similarity error:", str(error))
        category_score = 0.0

    # STEP 5: LOCATION + TIME
    print("\nSTEP 5: Context Similarity")

    try:
        location_score, time_score = calculate_context_score(
            lost_location or "",
            found_location or "",
            lost_time or "",
            found_time or ""
        )

        location_score = float(location_score)
        time_score = float(time_score)

    except Exception as error:
        print("Context similarity error:", str(error))
        location_score = 0.0
        time_score = 0.0

    # STEP 6: FINAL SCORE
    print("\nSTEP 6: Final Score")

    if category_score == 0:
        final_score = 0.0

    else:
        final_score = (
            0.50 * image_score
            + 0.20 * text_score
            + 0.10 * category_score
            + 0.10 * location_score
            + 0.10 * time_score
        )

    final_score = max(0.0, min(1.0, final_score))

    # STEP 7: RESULT
    threshold = 0.70

    if category_score == 0:
        result = "DIFFERENT CATEGORY"

    elif final_score >= threshold:
        result = "POSSIBLE MATCH"

    else:
        result = "LOW MATCH"

    # FINAL OUTPUT
    print("\n================================")
    print("           AI RESULT")
    print("================================")

    print("Detected Lost Category:", detected_category)
    print("Detected Found Category:", found_detected_category)
    print("Image Score:", round(image_score, 4))
    print("Text Score:", round(text_score, 4))
    print("Category Score:", round(category_score, 4))
    print("Location Score:", round(location_score, 4))
    print("Time Score:", round(time_score, 4))
    print("Final Score:", round(final_score, 4))
    print("Result:", result)

    print("================================")

    return {
        "detected_category": detected_category,
        "found_detected_category": found_detected_category,
        "image_score": image_score,
        "text_score": text_score,
        "category_score": category_score,
        "location_score": location_score,
        "time_score": time_score,
        "final_score": final_score,
        "result": result
    }
